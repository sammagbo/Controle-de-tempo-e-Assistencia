import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
      LineChart,
      Line,
      BarChart,
      Bar,
      XAxis,
      YAxis,
      CartesianGrid,
      Tooltip,
      ResponsiveContainer,
      Legend
} from 'recharts';

interface AttendanceData {
      label: string;
      attendance: number;
}

interface OvertimeData {
      title: string;
      overtime_seconds: number;
}

const Statistics: React.FC = () => {
      const navigate = useNavigate();
      const [loading, setLoading] = useState(true);
      const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
      const [overtimeData, setOvertimeData] = useState<OvertimeData[]>([]);
      const [averageAttendance, setAverageAttendance] = useState(0);
      const [totalMeetings, setTotalMeetings] = useState(0);

      useEffect(() => {
            const fetchStatistics = async () => {
                  setLoading(true);

                  // Fetch attendance per week
                  const { data: meetings, error: meetingsError } = await supabase
                        .from('meetings')
                        .select(`
          id,
          week_id,
          weeks (
            label
          )
        `)
                        .not('finished_at', 'is', null)
                        .order('started_at', { ascending: true })
                        .limit(20);

                  if (meetingsError) {
                        console.error('Error fetching meetings:', meetingsError);
                  }

                  const meetingIds = meetings?.map(m => m.id) || [];
                  setTotalMeetings(meetingIds.length);

                  // Fetch attendance for each meeting
                  if (meetingIds.length > 0) {
                        const { data: attendances } = await supabase
                              .from('attendance')
                              .select('meeting_id, count')
                              .in('meeting_id', meetingIds);

                        const attendanceMap = new Map(attendances?.map(a => [a.meeting_id, a.count]) || []);

                        const chartData: AttendanceData[] = (meetings || []).map(m => ({
                              label: (m.weeks as any)?.label || 'N/A',
                              attendance: attendanceMap.get(m.id) || 0
                        }));

                        setAttendanceData(chartData);

                        const validAttendances = chartData.filter(d => d.attendance > 0);
                        if (validAttendances.length > 0) {
                              const avg = validAttendances.reduce((sum, d) => sum + d.attendance, 0) / validAttendances.length;
                              setAverageAttendance(Math.round(avg));
                        }
                  }

                  // Fetch overtime data (parts that exceeded their time)
                  const { data: overtimeItems } = await supabase
                        .from('agenda_items')
                        .select('title, estimated_minutes, actual_seconds')
                        .in('meeting_id', meetingIds)
                        .gt('actual_seconds', 0);

                  if (overtimeItems) {
                        const overtime: OvertimeData[] = overtimeItems
                              .map(item => ({
                                    title: item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title,
                                    overtime_seconds: (item.actual_seconds || 0) - (item.estimated_minutes * 60)
                              }))
                              .filter(item => item.overtime_seconds > 30) // Only show significantly over time
                              .sort((a, b) => b.overtime_seconds - a.overtime_seconds)
                              .slice(0, 10);

                        setOvertimeData(overtime);
                  }

                  setLoading(false);
            };

            fetchStatistics();
      }, []);

      const formatOvertime = (seconds: number) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `+${mins}m ${secs}s`;
      };

      if (loading) {
            return (
                  <div className="bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display h-screen flex items-center justify-center">
                        <div className="text-center">
                              <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                              <p className="mt-2">Carregando estatísticas...</p>
                        </div>
                  </div>
            );
      }

      return (
            <div className="bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display min-h-screen">
                  {/* Header */}
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
                                    <a href="#" className="text-primary text-sm font-bold leading-normal">Estatísticas</a>
                              </div>
                        </div>
                  </header>

                  {/* Main Content */}
                  <main className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col max-w-[1200px] w-full gap-8">
                              {/* Page Heading */}
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div>
                                          <h1 className="text-[#111318] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">Estatísticas</h1>
                                          <p className="text-[#616f89] dark:text-gray-400 text-base font-normal leading-normal mt-1">
                                                Visão geral de todas as reuniões
                                          </p>
                                    </div>
                                    <div className="flex gap-4">
                                          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Total de Reuniões</p>
                                                <p className="text-2xl font-bold text-primary">{totalMeetings}</p>
                                          </div>
                                          <div className="bg-white dark:bg-[#1e293b] rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">Assistência Média</p>
                                                <p className="text-2xl font-bold text-green-600">{averageAttendance}</p>
                                          </div>
                                    </div>
                              </div>

                              {/* Attendance Chart */}
                              <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                          <span className="material-symbols-outlined text-primary">group</span>
                                          Assistência por Semana
                                    </h2>
                                    {attendanceData.length > 0 ? (
                                          <ResponsiveContainer width="100%" height={300}>
                                                <LineChart data={attendanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                      <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
                                                      <YAxis stroke="#6b7280" fontSize={12} />
                                                      <Tooltip
                                                            contentStyle={{
                                                                  backgroundColor: '#1e293b',
                                                                  border: 'none',
                                                                  borderRadius: '8px',
                                                                  color: '#fff'
                                                            }}
                                                      />
                                                      <Legend />
                                                      <Line
                                                            type="monotone"
                                                            dataKey="attendance"
                                                            name="Presentes"
                                                            stroke="#3b82f6"
                                                            strokeWidth={3}
                                                            dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                                                            activeDot={{ r: 8 }}
                                                      />
                                                </LineChart>
                                          </ResponsiveContainer>
                                    ) : (
                                          <div className="h-[300px] flex items-center justify-center text-gray-400">
                                                <p>Nenhum dado de assistência disponível</p>
                                          </div>
                                    )}
                              </div>

                              {/* Overtime Chart */}
                              <div className="bg-white dark:bg-[#1e293b] rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                          <span className="material-symbols-outlined text-red-500">warning</span>
                                          Partes que Mais Estouraram Tempo
                                    </h2>
                                    {overtimeData.length > 0 ? (
                                          <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={overtimeData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                                                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                                      <XAxis type="number" stroke="#6b7280" fontSize={12} tickFormatter={(v) => `+${Math.floor(v / 60)}m`} />
                                                      <YAxis dataKey="title" type="category" stroke="#6b7280" fontSize={12} width={90} />
                                                      <Tooltip
                                                            formatter={(value: number) => formatOvertime(value)}
                                                            contentStyle={{
                                                                  backgroundColor: '#1e293b',
                                                                  border: 'none',
                                                                  borderRadius: '8px',
                                                                  color: '#fff'
                                                            }}
                                                      />
                                                      <Bar
                                                            dataKey="overtime_seconds"
                                                            name="Tempo Excedido"
                                                            fill="#ef4444"
                                                            radius={[0, 4, 4, 0]}
                                                      />
                                                </BarChart>
                                          </ResponsiveContainer>
                                    ) : (
                                          <div className="h-[300px] flex items-center justify-center text-gray-400">
                                                <p>Nenhuma parte excedeu o tempo significativamente</p>
                                          </div>
                                    )}
                              </div>
                        </div>
                  </main>
            </div>
      );
};

export default Statistics;
