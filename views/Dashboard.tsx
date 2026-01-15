import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CURRENT_USER } from '../types';
import { supabase } from '../lib/supabaseClient';

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
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(true);
  const [loadingWeeks, setLoadingWeeks] = useState(false);
  const [selectingDayForWeek, setSelectingDayForWeek] = useState<string | null>(null);
  const [creatingMeeting, setCreatingMeeting] = useState(false);

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

  // Fetch periods on mount
  useEffect(() => {
    const fetchPeriods = async () => {
      setLoadingPeriods(true);
      const { data, error } = await supabase
        .from('periods')
        .select('id, name');

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
      } else if (data) {
        setWeeks(data);
      }
      setLoadingWeeks(false);
    };

    fetchWeeks();
  }, [selectedPeriod]);

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
            <div className="text-primary flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>meeting_room</span>
            </div>
            <h2 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">MeetingManager</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f0f2f4] dark:hover:bg-[#2a3441] transition-colors">
              <div
                className="bg-center bg-no-repeat bg-cover rounded-full size-8 bg-gray-200"
                style={{ backgroundImage: `url("${CURRENT_USER.avatarUrl}")` }}
              ></div>
              <span className="text-sm font-medium text-[#111318] dark:text-white hidden sm:block">{CURRENT_USER.name}</span>
              <span className="material-symbols-outlined text-[#616f89] dark:text-[#9ca3af]" style={{ fontSize: '20px' }}>expand_more</span>
            </button>
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
            weeks.map((week, index) => {
              const isCompleted = week.status?.toLowerCase() === 'completed';
              const isUpcoming = week.status?.toLowerCase() === 'upcoming';

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
                          <span className="text-2xl font-black">{String(index + 1).padStart(2, '0')}</span>
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
                    ) : selectingDayForWeek === week.id ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleStartMeeting(week.id, 'Tuesday')}
                          disabled={creatingMeeting}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                          Terça
                        </button>
                        <button
                          onClick={() => handleStartMeeting(week.id, 'Wednesday')}
                          disabled={creatingMeeting}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-blue-700 transition-all disabled:opacity-50"
                        >
                          Quarta
                        </button>
                        <button
                          onClick={() => setSelectingDayForWeek(null)}
                          className="px-3 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectingDayForWeek(week.id)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined">play_arrow</span>
                        Iniciar Reunião
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;