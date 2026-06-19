import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/apiClient';
import { t } from '../lib/translations';
import { MEETING_SECTIONS, SECTION_COLORS, SectionKey } from '../lib/meetingTemplate';
import type { AgendaItem } from '../types';

interface MeetingHistoryItem {
  id: string;
  week_id?: string;
  started_at?: string;
  total_duration_seconds?: number;
  agenda_items?: AgendaItem[];
  _periodName?: string;
  _dateRange?: string;
}

const MeetingHistory: React.FC = () => {
      const navigate = useNavigate();
      const [meetings, setMeetings] = useState<MeetingHistoryItem[]>([]);
      const [loading, setLoading] = useState(true);
      const [selectedMeeting, setSelectedMeeting] = useState<MeetingHistoryItem | null>(null);
      const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
      const [loadingDetails, setLoadingDetails] = useState(false);

      useEffect(() => {
            fetchMeetings();
      }, []);

      const fetchMeetings = async () => {
            try {
                  const [history, periods] = await Promise.all([
                        api.get('/api/v1/reports/history'),
                        api.get('/api/v1/dashboard/periods'),
                  ]);
                  const periodList: any[] = periods || [];
                  const periodName: Record<string, string> = {};
                  periodList.forEach((p) => { periodName[p.id] = p.name; });

                  const weeksArrays = await Promise.all(
                        periodList.map((p) => api.get(`/api/v1/dashboard/weeks?periodId=${p.id}`))
                  );
                  const weekInfo: Record<string, { dateRange: string; periodName: string }> = {};
                  weeksArrays.forEach((weeks: any[], idx) => {
                        const pName = periodName[periodList[idx].id] || 'Período';
                        (weeks || []).forEach((w) => {
                              weekInfo[w.id] = { dateRange: w.date_range || 'Semana', periodName: pName };
                        });
                  });

                  const list: MeetingHistoryItem[] = (history || [])
                        .sort((a: any, b: any) => {
                              const ta = a.started_at ? new Date(a.started_at).getTime() : 0;
                              const tb = b.started_at ? new Date(b.started_at).getTime() : 0;
                              return tb - ta;
                        })
                        .slice(0, 50)
                        .map((m: any) => ({
                              ...m,
                              _periodName: weekInfo[m.week_id]?.periodName || 'Período',
                              _dateRange: weekInfo[m.week_id]?.dateRange || 'Semana',
                        }));

                  setMeetings(list);
            } catch (error) {
                  console.error('Error fetching meetings:', error);
                  setMeetings([]);
            } finally {
                  setLoading(false);
            }
      };

      // agenda_items já vêm aninhados na reunião; sem 2ª chamada
      const loadAgendaFromMeeting = (meeting: MeetingHistoryItem) => {
            const items = [...(meeting.agenda_items || [])].sort(
                  (a: any, b: any) => (a.position || 0) - (b.position || 0)
            );
            setAgendaItems(items);
      };

      const handleSelectMeeting = (meeting: MeetingHistoryItem) => {
            setSelectedMeeting(meeting);
            loadAgendaFromMeeting(meeting);
      };

      const formatDuration = (seconds: number) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

      const formatDate = (dateString?: string) => {
            if (!dateString) return '--';
            return new Date(dateString).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
            });
      };

      // Group agenda items by section
      const groupedItems = agendaItems.reduce((acc, item) => {
            if (!acc[item.section]) acc[item.section] = [];
            acc[item.section].push(item);
            return acc;
      }, {} as Record<SectionKey, AgendaItem[]>);

      const sectionOrder: SectionKey[] = ['abertura', 'tesouros', 'ministerio', 'vida_crista', 'encerramento'];

      if (loading) {
            return (
                  <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                  </div>
            );
      }

      return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display">
                  {/* Header */}
                  <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e2736]">
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                              <span className="material-symbols-outlined">arrow_back</span>
                              <span className="font-bold">{t('back')}</span>
                        </button>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                              <span className="material-symbols-outlined text-gray-500">history</span>
                              {t('meetingHistory')}
                        </h1>
                        <div className="w-20"></div>
                  </header>

                  <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
                        {/* Meetings List */}
                        <div className="lg:w-1/3 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
                              {meetings.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">event_busy</span>
                                          <p className="text-gray-500">{t('noMeetingsFound')}</p>
                                    </div>
                              ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                          {meetings.map((meeting) => (
                                                <button
                                                      key={meeting.id}
                                                      onClick={() => handleSelectMeeting(meeting)}
                                                      className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${selectedMeeting?.id === meeting.id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
                                                            }`}
                                                >
                                                      <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-bold text-primary">
                                                                   {meeting._periodName}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                  {formatDuration(meeting.total_duration_seconds || 0)}
                                                            </span>
                                                      </div>
                                                      <p className="text-sm font-medium">
                                                             {meeting._dateRange}
                                                      </p>
                                                      <p className="text-xs text-gray-500 mt-1">
                                                             {formatDate(meeting.started_at)}
                                                      </p>
                                                </button>
                                          ))}
                                    </div>
                              )}
                        </div>

                        {/* Meeting Details */}
                        <div className="lg:w-2/3 overflow-y-auto p-6">
                              {selectedMeeting ? (
                                    <>
                                          {/* Meeting Header */}
                                          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 mb-6 shadow-sm">
                                                <div className="flex items-center justify-between mb-4">
                                                      <div>
                                                            <h2 className="text-xl font-bold">
                                                                   {selectedMeeting._periodName}
                                                            </h2>
                                                            <p className="text-gray-500">
                                                                   {selectedMeeting._dateRange}
                                                            </p>
                                                      </div>
                                                      <div className="text-right">
                                                            <p className="text-2xl font-bold text-primary">
                                                                  {formatDuration(selectedMeeting.total_duration_seconds || 0)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{t('duration')}</p>
                                                      </div>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                       {formatDate(selectedMeeting.started_at)}
                                                </p>
                                          </div>

                                          {/* Agenda Items */}
                                          {loadingDetails ? (
                                                <div className="flex justify-center py-12">
                                                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                                                </div>
                                          ) : (
                                                <div className="space-y-4">
                                                      {sectionOrder.map((sectionKey) => {
                                                            const items = groupedItems[sectionKey] || [];
                                                            if (items.length === 0) return null;

                                                            const sectionInfo = MEETING_SECTIONS[sectionKey];
                                                            const colors = SECTION_COLORS[sectionKey];

                                                            return (
                                                                  <div key={sectionKey} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                                                                        <div className={`px-4 py-2 ${colors.bg} border-b ${colors.border}`}>
                                                                              <div className="flex items-center gap-2">
                                                                                    <span className={`material-symbols-outlined ${colors.text}`}>{sectionInfo.icon}</span>
                                                                                    <h3 className={`font-bold text-sm ${colors.text}`}>{sectionInfo.label}</h3>
                                                                              </div>
                                                                        </div>
                                                                        <div className="bg-white dark:bg-surface-dark divide-y divide-gray-100 dark:divide-gray-800">
                                                                              {items.map((item, index) => (
                                                                                    <div key={item.id} className="flex items-center gap-4 px-4 py-3">
                                                                                          <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                                                                <span className="text-xs font-bold text-gray-500">{index + 1}</span>
                                                                                          </div>
                                                                                          <div className="flex-1 min-w-0">
                                                                                                <p className="text-sm font-medium truncate">{item.title}</p>
                                                                                                {item.assigned_names && (
                                                                                                      <p className="text-xs text-primary truncate">{item.assigned_names}</p>
                                                                                                )}
                                                                                          </div>
                                                                                          <div className="flex items-center gap-4 text-sm">
                                                                                                <div className="text-gray-400">
                                                                                                      <span className="text-xs">{t('estimated')}:</span>
                                                                                                      <span className="ml-1">{item.estimated_minutes} {t('min')}</span>
                                                                                                </div>
                                                                                                <div className={item.actual_seconds > item.estimated_minutes * 60 ? 'text-red-500' : 'text-green-500'}>
                                                                                                      <span className="text-xs">{t('actual')}:</span>
                                                                                                      <span className="ml-1 font-bold">{formatDuration(item.actual_seconds || 0)}</span>
                                                                                                </div>
                                                                                          </div>
                                                                                    </div>
                                                                              ))}
                                                                        </div>
                                                                  </div>
                                                            );
                                                      })}
                                                </div>
                                          )}
                                    </>
                              ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">touch_app</span>
                                          <p className="text-gray-500">Selecione uma reunião para ver os detalhes</p>
                                    </div>
                              )}
                        </div>
                  </div>
            </div>
      );
};

export default MeetingHistory;
