import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/apiClient';
import {
      LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
      BarChart, Bar, Legend
} from 'recharts';

interface MeetingStats {
      id: string;
      date: string;
      total_duration_seconds: number;
      attendance_total: number;
      attendance_presencial: number;
      attendance_zoom: number;
}

// Resposta de /api/v1/reports/history (apenas os campos usados aqui; o resto do
// MeetingResponse do backend é ignorado)
interface HistoryMeeting {
  id: string;
  started_at?: string;
  total_duration_seconds?: number;
  attendance?: { count?: number; presencial?: number; zoom?: number };
}

const Statistics: React.FC = () => {
      const navigate = useNavigate();
      const [loading, setLoading] = useState(true);
      const [data, setData] = useState<MeetingStats[]>([]);

      useEffect(() => {
            fetchStats();
      }, []);

      const fetchStats = async () => {
            setLoading(true);
            try {
                  // Busca as reuniões finalizadas no backend próprio (substitui o Supabase)
                  const data = await api.get('/api/v1/reports/history');
                  const meetings: HistoryMeeting[] = data || [];

                  // O backend retorna sem ordem e sem limite: ordenar por started_at (asc) e pegar as 10 últimas
                  const lastTen = [...meetings]
                        .sort((a, b) => {
                              const ta = a.started_at ? new Date(a.started_at).getTime() : 0;
                              const tb = b.started_at ? new Date(b.started_at).getTime() : 0;
                              return ta - tb;
                        })
                        .slice(-10);

                  const formattedData = lastTen.map((m) => {
                        const att = m.attendance;
                        return {
                              id: m.id,
                              date: m.started_at
                                    ? new Date(m.started_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                                    : '--',
                              total_duration_seconds: m.total_duration_seconds || 0,
                              attendance_total: att?.count || 0,
                              attendance_presencial: att?.presencial || 0,
                              attendance_zoom: att?.zoom || 0,
                        };
                  });
                  setData(formattedData);
            } catch (err) {
                  console.error('Error fetching stats:', err);
                  setData([]);
            } finally {
                  setLoading(false);
            }
      };

      const formatDuration = (seconds: number) => {
            const mins = Math.floor(seconds / 60);
            return `${mins} min`;
      };

      if (loading) {
            return (
                  <div className="h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                  </div>
            );
      }

      return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display">
                  <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e2736]">
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                              <span className="material-symbols-outlined">arrow_back</span>
                              <span className="font-bold">Voltar</span>
                        </button>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                              <span className="material-symbols-outlined text-primary">bar_chart</span>
                              Estatísticas
                        </h1>
                        <div className="w-20"></div>
                  </header>

                  <main className="p-6 max-w-6xl mx-auto space-y-8">

                        {/* Attendance Chart */}
                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-500">group</span>
                                    Tendência de Assistência
                              </h2>
                              <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                          <BarChart data={data}>
                                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                                <Tooltip
                                                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                      itemStyle={{ color: '#fff' }}
                                                />
                                                <Legend />
                                                <Bar dataKey="attendance_presencial" name="Presencial" stackId="a" fill="#4285f4" radius={[0, 0, 4, 4]} />
                                                <Bar dataKey="attendance_zoom" name="Zoom" stackId="a" fill="#34a853" radius={[4, 4, 0, 0]} />
                                          </BarChart>
                                    </ResponsiveContainer>
                              </div>
                        </div>

                        {/* Duration Chart */}
                        <div className="bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-orange-500">timer</span>
                                    Duração da Reunião (Minutos)
                              </h2>
                              <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                          <LineChart data={data}>
                                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                                                <Tooltip
                                                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                                      formatter={(value: number) => [`${Math.floor(value / 60)} min`, 'Duração']}
                                                />
                                                <Line type="monotone" dataKey="total_duration_seconds" stroke="#fbbc04" strokeWidth={3} dot={{ r: 4, fill: '#fbbc04' }} activeDot={{ r: 6 }} />
                                                {/* Reference Line for 1h45m (6300s)? Optional */}
                                          </LineChart>
                                    </ResponsiveContainer>
                              </div>
                        </div>

                  </main>
            </div>
      );
};

export default Statistics;
