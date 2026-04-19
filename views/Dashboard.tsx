import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CURRENT_USER } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../lib/AuthContext';
import { t } from '../lib/translations';
import { getCurrentWeekSchedule, isCurrentWeek as checkIsCurrentWeek, getAllScheduleWeeks } from '../lib/data/officialSchedule2026';
import { seedWeeks } from '../lib/seedWeeks';

interface Period {
  id: string;
  name: string;
}

interface Week {
  id: string;
  label: string;
  date_range: string;
  theme: string;
  status?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [loadingWeeks, setLoadingWeeks] = useState(false);
  const [selectingDayForWeek, setSelectingDayForWeek] = useState<string | null>(null);
  const [creatingMeeting, setCreatingMeeting] = useState(false);
  const [suggestedWeekId, setSuggestedWeekId] = useState<string | null>(null);
  const currentWeekRef = useRef<HTMLDivElement>(null);
  const [syncing, setSyncing] = useState(false);

  // Function to sync database with hardcoded schedule
  const handleSyncWeeks = async () => {
    setSyncing(true);
    try {
      const result = await seedWeeks();
      if (result.success) {
        alert('✅ Semanas sincronizadas com sucesso! Recarregando...');
        window.location.reload();
      } else {
        alert('❌ Erro ao sincronizar: ' + (result.error?.message || 'Erro desconhecido'));
      }
    } catch (err) {
      alert('❌ Erro: ' + String(err));
    } finally {
      setSyncing(false);
    }
  };

  // Helper function to check if today falls within a week's date range
  const findCurrentWeek = (weeksList: Week[]): string | null => {
    if (weeksList.length === 0) return null;

    // First, check our hardcoded schedule for the true current week
    const officialCurrentWeek = getCurrentWeekSchedule();
    if (officialCurrentWeek) {
      // Try to find a matching week in the DB list by date range
      const matchingDbWeek = weeksList.find(w =>
        w.date_range.toLowerCase().includes(officialCurrentWeek.dateRange.split('-')[0].trim())
      );
      if (matchingDbWeek) {
        return matchingDbWeek.id;
      }
    }

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // 0-indexed
    const currentYear = today.getFullYear();

    const monthNames: Record<string, number> = {
      'janeiro': 0, 'fevereiro': 1, 'março': 2, 'abril': 3,
      'maio': 4, 'junho': 5, 'julho': 6, 'agosto': 7,
      'setembro': 8, 'outubro': 9, 'novembro': 10, 'dezembro': 11
    };

    for (const week of weeksList) {
      // Parse date_range like "13-19 Janeiro" or "27 Janeiro - 2 Fevereiro"
      const dateRange = week.date_range.toLowerCase();

      // Try to match pattern: "DD-DD Mês" or "DD Mês - DD Mês"
      const simpleMatch = dateRange.match(/(\d+)-(\d+)\s+(\w+)/);
      const complexMatch = dateRange.match(/(\d+)\s+(\w+)\s*-\s*(\d+)\s+(\w+)/);

      let startDay: number, endDay: number, startMonth: number, endMonth: number;

      if (complexMatch) {
        // Pattern: "27 Janeiro - 2 Fevereiro"
        startDay = parseInt(complexMatch[1]);
        startMonth = monthNames[complexMatch[2]] ?? -1;
        endDay = parseInt(complexMatch[3]);
        endMonth = monthNames[complexMatch[4]] ?? -1;
      } else if (simpleMatch) {
        // Pattern: "13-19 Janeiro"
        startDay = parseInt(simpleMatch[1]);
        endDay = parseInt(simpleMatch[2]);
        startMonth = monthNames[simpleMatch[3]] ?? -1;
        endMonth = startMonth;
      } else {
        continue;
      }

      if (startMonth === -1 || endMonth === -1) continue;

      // Check if today is within the range
      const startDate = new Date(currentYear, startMonth, startDay);
      const endDate = new Date(currentYear, endMonth, endDay);

      // Handle year rollover (e.g., December to January)
      if (endMonth < startMonth) {
        endDate.setFullYear(currentYear + 1);
      }

      if (today >= startDate && today <= endDate) {
        return week.id;
      }
    }

    // FALLBACK: If no exact match, return the first week as the "featured" one
    return weeksList[0]?.id || null;
  };

  const handleStartMeeting = async (weekId: string, meetingDay: string) => {
    if (!weekId || !meetingDay) {
      alert('Please select a week and day.');
      return;
    }

    setCreatingMeeting(true);
    try {
      const meetingData = {
        week_id: weekId,
        meeting_day: meetingDay,
        started_at: new Date().toISOString(),
        user_id: user?.id,
      };

      console.log('Creating meeting with data:', meetingData);

      const { data, error } = await supabase
        .from('meetings')
        .insert(meetingData)
        .select('id')
        .single();

      if (error) {
        console.error('Supabase error creating meeting:', error);
        alert(`Failed to create meeting: ${error.message}`);
        return;
      }

      if (!data || !data.id) {
        console.error('No meeting ID returned from Supabase');
        alert('Failed to create meeting: No ID returned.');
        return;
      }

      console.log('Meeting created successfully with ID:', data.id);

      // Store meeting_id for use in SetupSession, LiveMeeting, Attendance, Comments
      localStorage.setItem('active_meeting_id', data.id);

      // Navigate to setup
      navigate('/setup');
    } catch (err) {
      console.error('Unexpected error creating meeting:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setCreatingMeeting(false);
      setSelectingDayForWeek(null);
    }
  };



  // Fetch periods on mount (only periods that have weeks)
  useEffect(() => {
    const fetchPeriods = async () => {
      setLoadingPeriods(true);

      // First get all period IDs that have weeks
      const { data: weeksData } = await supabase
        .from('weeks')
        .select('period_id');

      const periodIdsWithWeeks = [...new Set(weeksData?.map(w => w.period_id).filter(Boolean) || [])];

      if (periodIdsWithWeeks.length === 0) {
        setPeriods([]);
        setLoadingPeriods(false);
        return;
      }

      // Then fetch only those periods
      const { data, error } = await supabase
        .from('periods')
        .select('id, name')
        .in('id', periodIdsWithWeeks);

      if (error) {
        console.error('Error fetching periods:', error);
      } else if (data) {
        setPeriods(data);
        if (data.length > 0) {
          setSelectedPeriod(data[0].id);
        }
      }
      setLoadingPeriods(false);
    };

    fetchPeriods();
  }, []);

  // Fetch weeks when selectedPeriod changes
  useEffect(() => {
    if (!selectedPeriod) {
      setWeeks([]);
      setSuggestedWeekId(null);
      return;
    }

    const fetchWeeks = async () => {
      setLoadingWeeks(true);
      const { data, error } = await supabase
        .from('weeks')
        .select('id, label, date_range, theme')
        .eq('period_id', selectedPeriod)
        .order('label', { ascending: true });

      if (error) {
        console.error('Error fetching weeks:', error);
        setWeeks([]);
        setSuggestedWeekId(null);
      } else if (data) {
        setWeeks(data);
        // Find and set the current week
        const currentWeekId = findCurrentWeek(data);
        setSuggestedWeekId(currentWeekId);
      }
      setLoadingWeeks(false);
    };

    fetchWeeks();
  }, [selectedPeriod]);

  // Auto-scroll to current week on mount
  useEffect(() => {
    if (suggestedWeekId && currentWeekRef.current) {
      setTimeout(() => {
        currentWeekRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [suggestedWeekId]);

  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            Completed
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            Upcoming
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            Scheduled
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-[#1A2230] border-b border-[#f0f2f4] dark:border-[#2a3441] sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white shadow-md">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
              >
                <source src="/Minimalist_line_art_1080p_202601171507.mp4" type="video/mp4" />
              </video>
            </div>
            <h2 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">MeetingManager</h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Attendance Counter (Independent) */}
            <button
              onClick={() => navigate('/attendance')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-green-700 dark:text-green-400"
              title={t('attendance')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>groups</span>
              <span className="text-sm font-bold hidden md:block">{t('attendance')}</span>
            </button>
            {/* Statistics Link */}
            <button
              onClick={() => navigate('/stats')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f0f2f4] dark:hover:bg-[#2a3441] transition-colors text-gray-600 dark:text-gray-300"
              title="Estatísticas"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>bar_chart</span>
              <span className="text-sm font-medium hidden md:block">Estatísticas</span>
            </button>

            {/* History Button */}
            <button
              onClick={() => navigate('/history')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f0f2f4] dark:hover:bg-[#2a3441] transition-colors text-gray-600 dark:text-gray-300"
              title={t('meetingHistory')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>history</span>
              <span className="text-sm font-medium hidden md:block">{t('meetingHistory')}</span>
            </button>
            {/* Settings Button */}
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f0f2f4] dark:hover:bg-[#2a3441] transition-colors text-gray-600 dark:text-gray-300"
              title="Configurações e Backup"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>settings</span>
            </button>
            {/* User Info & Logout */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#2a3441]">
              <div className="size-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-[#111318] dark:text-white hidden sm:block max-w-[120px] truncate">
                {user?.email || 'Usuário'}
              </span>
              <button
                onClick={signOut}
                className="ml-2 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                title="Sair"
              >
                <span className="material-symbols-outlined text-xl">logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[960px] mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-6 text-sm">
          <a href="#" className="text-[#616f89] dark:text-[#9ca3af] hover:text-primary transition-colors font-medium">Início</a>
          <span className="material-symbols-outlined text-[#616f89] dark:text-[#9ca3af]" style={{ fontSize: '16px' }}>chevron_right</span>
          <span className="text-[#111318] dark:text-white font-medium">Selecionar Reunião</span>
        </nav>

        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-[#111318] dark:text-white mb-2">Painel de Reuniões</h1>
          <p className="text-[#616f89] dark:text-[#9ca3af] text-base font-normal">Gerencie e inicie suas reuniões semanais.</p>
        </div>

        {/* Filters and Controls Toolbar */}
        <div className="bg-white dark:bg-[#1A2230] p-4 rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-end">
          {/* Search Bar */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#111318] dark:text-white mb-1.5">Buscar Reuniões</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#616f89] dark:text-[#9ca3af]">search</span>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-[#dbdfe6] dark:border-[#4b5563] rounded-lg leading-5 bg-[#f0f2f4] dark:bg-[#232d3d] text-[#111318] dark:text-white placeholder-[#616f89] dark:placeholder-[#9ca3af] focus:outline-none focus:bg-white dark:focus:bg-[#1A2230] focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all"
                placeholder="Buscar por tema..."
              />
            </div>
          </div>
          {/* Period Selector */}
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-[#111318] dark:text-white mb-1.5">Período</label>
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2.5 text-base border border-[#dbdfe6] dark:border-[#4b5563] focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-white dark:bg-[#232d3d] text-[#111318] dark:text-white appearance-none cursor-pointer"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                disabled={loadingPeriods}
              >
                {loadingPeriods ? (
                  <option>Carregando...</option>
                ) : periods.length === 0 ? (
                  <option>Nenhum período disponível</option>
                ) : (
                  periods.map((period) => (
                    <option key={period.id} value={period.id}>
                      {period.name}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#616f89] dark:text-[#9ca3af]">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
            </div>
          </div>
          {/* Filter Button */}
          <button className="hidden md:flex items-center justify-center px-4 py-2.5 border border-[#dbdfe6] dark:border-[#4b5563] rounded-lg bg-white dark:bg-[#232d3d] text-[#111318] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3441] transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
          {/* Sync Database Button */}
          <button
            onClick={handleSyncWeeks}
            disabled={syncing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-purple-500 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-50"
            title="Sincronizar semanas com o calendário oficial"
          >
            <span className={`material-symbols-outlined ${syncing ? 'animate-spin' : ''}`}>
              {syncing ? 'progress_activity' : 'sync'}
            </span>
            <span className="hidden md:inline text-sm font-medium">
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </span>
          </button>
        </div>

        {/* Meeting List */}
        <div className="space-y-4">
          {loadingWeeks ? (
            <div className="text-center py-12 text-gray-500">
              <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
              <p className="mt-2">Carregando semanas...</p>
            </div>
          ) : weeks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="material-symbols-outlined text-4xl">event_busy</span>
              <p className="mt-2">Nenhuma semana encontrada para este período.</p>
            </div>
          ) : (
            <>
              {/* Current Week - Highlighted at Top */}
              {suggestedWeekId && weeks.find(w => w.id === suggestedWeekId) && (() => {
                const currentWeek = weeks.find(w => w.id === suggestedWeekId)!;
                const currentIndex = weeks.findIndex(w => w.id === suggestedWeekId);
                return (
                  <div
                    key={currentWeek.id}
                    ref={currentWeekRef}
                    className="group relative flex flex-col p-8 md:p-10 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 shadow-2xl mb-10"
                  >
                    {/* Hero Badge */}
                    <div className="absolute -top-4 left-6 px-5 py-2.5 bg-white text-indigo-700 text-sm font-black rounded-full shadow-lg flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      REUNIÃO DESTA SEMANA
                    </div>

                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mt-4">
                      <div className="flex items-start gap-6 md:gap-8">
                        {/* Large Week Number - White Box */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-white/20 backdrop-blur-sm text-white border-2 border-white/30">
                          <span className="text-xs md:text-sm font-bold uppercase tracking-wider opacity-90">Semana</span>
                          <span className="text-5xl md:text-6xl font-black">{String(currentIndex + 1).padStart(2, '0')}</span>
                        </div>
                        <div className="flex flex-col gap-2 text-white">
                          <span className="text-lg md:text-xl font-bold opacity-90">{currentWeek.date_range}</span>
                          <h3 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight">
                            {currentWeek.label}
                          </h3>
                          <p className="text-base md:text-lg opacity-80 max-w-lg">{currentWeek.theme}</p>
                        </div>
                      </div>

                      {/* Big White INICIAR Button */}
                      <div className="w-full lg:w-auto">
                        <button
                          onClick={() => handleStartMeeting(currentWeek.id, 'midweek')}
                          disabled={creatingMeeting}
                          className="w-full lg:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 text-xl md:text-2xl font-black rounded-2xl shadow-xl text-indigo-700 bg-white hover:bg-gray-100 transition-all disabled:opacity-50 transform hover:scale-105 active:scale-95"
                        >
                          {creatingMeeting ? (
                            <span className="material-symbols-outlined animate-spin text-2xl">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined text-2xl md:text-3xl">play_circle</span>
                          )}
                          {creatingMeeting ? 'Criando...' : 'INICIAR'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Other Weeks */}
              <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mt-4 mb-3">Outras Semanas</h3>
              {weeks.filter(w => w.id !== suggestedWeekId).map((week, index) => {
                const isCompleted = week.status?.toLowerCase() === 'completed';
                const isUpcoming = week.status?.toLowerCase() === 'upcoming';
                const originalIndex = weeks.findIndex(w => w.id === week.id);

                return (
                  <div
                    key={week.id}
                    className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-xl border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 ${isCompleted
                      ? 'bg-[#f9fafb] dark:bg-[#161e2c] border-[#e5e7eb] dark:border-[#2a3441] opacity-75 hover:opacity-100'
                      : 'bg-white dark:bg-[#1A2230] border-[#e5e7eb] dark:border-[#2a3441]'
                      }`}
                  >
                    <div className="flex items-start gap-5">
                      <div
                        className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-lg border ${isCompleted
                          ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 border-transparent'
                          : isUpcoming
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-[#f0f2f4] dark:bg-[#232d3d] text-[#616f89] dark:text-[#9ca3af] border-transparent'
                          }`}
                      >
                        {isCompleted ? (
                          <span className="material-symbols-outlined text-2xl">check</span>
                        ) : (
                          <>
                            <span className="text-xs font-bold uppercase tracking-wider">Week</span>
                            <span className="text-2xl font-black">{String(originalIndex + 1).padStart(2, '0')}</span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(week.status)}
                          <span className="text-sm text-[#616f89] dark:text-[#9ca3af]">{week.date_range}</span>
                        </div>
                        <h3
                          className={`text-xl font-bold group-hover:text-primary transition-colors ${isCompleted ? 'text-gray-500 dark:text-gray-400' : 'text-[#111318] dark:text-white'
                            }`}
                        >
                          {week.label}
                        </h3>
                        <p className="text-sm text-[#616f89] dark:text-[#9ca3af] line-clamp-1">{week.theme}</p>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto mt-2 sm:mt-0">
                      {isCompleted ? (
                        <button
                          onClick={() => navigate('/report')}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#dbdfe6] dark:border-[#4b5563] text-base font-medium rounded-lg shadow-sm text-[#616f89] bg-white dark:bg-[#232d3d] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3441] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                          Ver Relatório
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartMeeting(week.id, 'midweek')}
                          disabled={creatingMeeting}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-95 disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined">play_arrow</span>
                          Iniciar Reunião
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 py-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          <p>© 2026 Sam Magbo. All Rights Reserved.</p>
          <p className="mt-1">
            Developed with <span className="text-red-500">♥</span> by{' '}
            <a
              href="https://www.linkedin.com/in/sam-magbo-02086555/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Magbo Studio
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;