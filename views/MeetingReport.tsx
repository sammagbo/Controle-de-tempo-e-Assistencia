import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { MEETING_SECTIONS, SECTION_COLORS, SectionKey } from '../lib/meetingTemplate';

interface AgendaItem {
  id: string;
  title: string;
  estimated_minutes: number;
  actual_seconds: number;
  position: number;
  status: string;
  section: SectionKey;
}

interface MeetingData {
  id: string;
  meeting_day: string;
  started_at: string;
  finished_at: string;
  total_duration_seconds: number;
  week?: {
    label: string;
    date_range: string;
    theme: string;
    period?: {
      name: string;
    };
  };
}

const MeetingReport: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<MeetingData | null>(null);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [attendance, setAttendance] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentsTotalSeconds, setCommentsTotalSeconds] = useState(0);

  useEffect(() => {
    const meetingId = localStorage.getItem('active_meeting_id');
    if (!meetingId) {
      navigate('/');
      return;
    }

    const fetchReportData = async () => {
      setLoading(true);

      // Fetch meeting data with week and period info
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .select(`
          id,
          meeting_day,
          started_at,
          finished_at,
          total_duration_seconds,
          week_id
        `)
        .eq('id', meetingId)
        .single();

      if (meetingError) {
        console.error('Error fetching meeting:', meetingError);
      } else if (meetingData) {
        // Fetch week data separately if week_id exists
        let weekData = null;
        if (meetingData.week_id) {
          const { data: week } = await supabase
            .from('weeks')
            .select('label, date_range, theme')
            .eq('id', meetingData.week_id)
            .single();
          weekData = week;
        }

        const transformedMeeting: MeetingData = {
          ...meetingData,
          week: weekData || undefined
        };
        setMeeting(transformedMeeting);
      }

      // Fetch agenda items
      const { data: agendaData, error: agendaError } = await supabase
        .from('agenda_items')
        .select('id, title, estimated_minutes, actual_seconds, position, status, section')
        .eq('meeting_id', meetingId)
        .order('position', { ascending: true });

      if (agendaError) {
        console.error('Error fetching agenda items:', agendaError);
      } else if (agendaData) {
        setAgendaItems(agendaData as AgendaItem[]);
      }

      // Fetch attendance
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('count')
        .eq('meeting_id', meetingId)
        .maybeSingle();

      if (attendanceData) {
        setAttendance(attendanceData.count || 0);
      }

      // Fetch comments stats
      const { data: commentsData } = await supabase
        .from('comments')
        .select('duration_seconds')
        .eq('meeting_id', meetingId);

      if (commentsData) {
        setCommentsCount(commentsData.length);
        setCommentsTotalSeconds(commentsData.reduce((sum, c) => sum + (c.duration_seconds || 0), 0));
      }

      setLoading(false);
    };

    fetchReportData();
  }, [navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalEstimated = () => {
    return agendaItems.reduce((sum, item) => sum + (item.estimated_minutes * 60), 0);
  };

  const getTotalActual = () => {
    return agendaItems.reduce((sum, item) => sum + (item.actual_seconds || 0), 0);
  };

  const getDifference = () => {
    return getTotalActual() - getTotalEstimated();
  };

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          <p className="mt-2">Carregando relatório...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        {/* Navigation */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e5e7eb] dark:border-b-gray-700 bg-white dark:bg-[#1a202c] px-6 lg:px-10 py-3 sticky top-0 z-50">
          <div className="flex items-center gap-4 text-[#111318] dark:text-white">
            <div className="size-8 flex items-center justify-center text-primary cursor-pointer" onClick={() => navigate('/')}>
              <span className="material-symbols-outlined text-3xl">timer</span>
            </div>
            <h2 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] cursor-pointer" onClick={() => navigate('/')}>Meeting Manager</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="hidden md:flex items-center gap-9">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }} className="text-[#111318] dark:text-gray-200 text-sm font-medium leading-normal hover:text-primary transition-colors">Dashboard</a>
              <a href="#" className="text-primary text-sm font-bold leading-normal">Relatório</a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
          <div className="layout-content-container flex flex-col max-w-[1000px] w-full flex-1 gap-6">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-[#111318] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">Relatório da Reunião</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold uppercase tracking-wide border border-green-200 dark:border-green-800">Concluída</span>
                </div>
                <p className="text-[#616f89] dark:text-gray-400 text-base font-normal leading-normal">
                  {meeting?.week?.theme || 'Reunião do Meio de Semana'}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    localStorage.removeItem('active_meeting_id');
                    localStorage.removeItem('active_agenda_item_id');
                    navigate('/');
                  }}
                  className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px] mr-2">home</span>
                  <span className="truncate">Nova Reunião</span>
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Card */}
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#1e293b] border border-[#dbdfe6] dark:border-gray-700 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
                  <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium leading-normal">Data</p>
                </div>
                <p className="text-[#111318] dark:text-white tracking-tight text-lg font-bold leading-tight">
                  {formatDate(meeting?.started_at || '')}
                </p>
              </div>
              {/* Week Card */}
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#1e293b] border border-[#dbdfe6] dark:border-gray-700 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-xl">tag</span>
                  <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium leading-normal">Semana</p>
                </div>
                <p className="text-[#111318] dark:text-white tracking-tight text-lg font-bold leading-tight">
                  {meeting?.week?.label || '-'} • {meeting?.meeting_day || '-'}
                </p>
              </div>
              {/* Attendance Card */}
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#1e293b] border border-[#dbdfe6] dark:border-gray-700 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-xl">group</span>
                  <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium leading-normal">Assistência</p>
                </div>
                <p className="text-[#111318] dark:text-white tracking-tight text-2xl font-bold leading-tight">
                  {attendance}
                </p>
              </div>
              {/* Duration Card */}
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#1e293b] border border-[#dbdfe6] dark:border-gray-700 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                  <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium leading-normal">Duração Total</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-[#111318] dark:text-white tracking-tight text-2xl font-bold leading-tight">
                    {formatTime(meeting?.total_duration_seconds || getTotalActual() + commentsTotalSeconds)}
                  </p>
                  {getDifference() !== 0 && (
                    <p className={`text-xs font-bold leading-normal px-1.5 py-0.5 rounded ${getDifference() > 0 ? 'text-red-600 bg-red-50 dark:bg-red-900/20' : 'text-green-600 bg-green-50 dark:bg-green-900/20'}`}>
                      {getDifference() > 0 ? '+' : ''}{formatTime(getDifference())}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Comments Stats */}
            {commentsCount > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">chat_bubble</span>
                  <span className="text-sm font-medium text-[#111318] dark:text-white">
                    {commentsCount} comentário{commentsCount > 1 ? 's' : ''} registrado{commentsCount > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">timer</span>
                  <span className="text-sm font-medium text-[#111318] dark:text-white">
                    Tempo total em comentários: {formatTime(commentsTotalSeconds)}
                  </span>
                </div>
              </div>
            )}

            {/* Grouped Agenda Items Table */}
            <div className="pt-4 space-y-8">
              <h2 className="text-[#111318] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">Partes da Reunião</h2>

              {['abertura', 'tesouros', 'ministerio', 'vida_crista', 'encerramento'].map((sectionKey) => {
                const sectionItems = agendaItems.filter(item => item.section === sectionKey);
                if (sectionItems.length === 0) return null;

                const sectionInfo = MEETING_SECTIONS[sectionKey as SectionKey];
                const colors = SECTION_COLORS[sectionKey as SectionKey];

                return (
                  <div key={sectionKey} className="overflow-hidden rounded-xl border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-[#1e293b] shadow-sm">
                    {/* Section Header */}
                    <div className={`flex items-center gap-3 px-6 py-3 border-b border-[#dbdfe6] dark:border-gray-700 ${colors.bg}`}>
                      <span className={`material-symbols-outlined ${colors.text}`}>{sectionInfo.icon}</span>
                      <h3 className={`font-bold ${colors.text}`}>{sectionInfo.label}</h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-[#f8f9fb] dark:bg-gray-800/50 border-b border-[#dbdfe6] dark:border-gray-700">
                          <tr>
                            <th className="px-6 py-4 text-left text-[#616f89] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider w-[10%]">#</th>
                            <th className="px-6 py-4 text-left text-[#616f89] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider w-[40%]">Parte</th>
                            <th className="px-6 py-4 text-left text-[#616f89] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider w-[15%]">Previsto</th>
                            <th className="px-6 py-4 text-left text-[#616f89] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider w-[15%]">Real</th>
                            <th className="px-6 py-4 text-left text-[#616f89] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider w-[20%]">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#dbdfe6] dark:divide-gray-700">
                          {sectionItems.map((item, index) => {
                            const estimatedSeconds = item.estimated_minutes * 60;
                            const difference = (item.actual_seconds || 0) - estimatedSeconds;
                            const isOvertime = difference > 0;
                            // const isOnTime = difference <= 0 && item.actual_seconds > 0;

                            return (
                              <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-6 py-4">
                                  <span className="text-sm font-bold text-gray-500">{item.position}</span>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-[#111318] dark:text-gray-200 text-sm font-medium leading-normal">{item.title}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium tabular-nums">{item.estimated_minutes}m 00s</p>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col gap-1">
                                    <p className="text-[#111318] dark:text-gray-200 text-sm font-bold tabular-nums">
                                      {formatTime(item.actual_seconds || 0)}
                                    </p>
                                    {item.actual_seconds > 0 && (
                                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                        <div
                                          className={`h-1.5 rounded-full ${isOvertime ? 'bg-red-500' : 'bg-green-500'}`}
                                          style={{ width: `${Math.min(100, (item.actual_seconds / estimatedSeconds) * 100)}%` }}
                                        ></div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  {item.actual_seconds > 0 ? (
                                    isOvertime ? (
                                      <span className="inline-flex items-center gap-1 rounded-md bg-red-50 dark:bg-red-900/20 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                                        <span className="material-symbols-outlined text-[14px]">warning</span>
                                        +{formatTime(difference)}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 rounded-md bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                        No tempo
                                      </span>
                                    )
                                  ) : (
                                    <span className="text-gray-400 text-xs">Não registrado</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-6 pb-12 mt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  localStorage.removeItem('active_meeting_id');
                  localStorage.removeItem('active_agenda_item_id');
                  navigate('/');
                }}
                className="flex min-w-[200px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-6 bg-primary hover:bg-primary-dark text-white text-base font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
              >
                <span className="material-symbols-outlined">check_circle</span>
                <span>Concluir e Voltar</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MeetingReport;