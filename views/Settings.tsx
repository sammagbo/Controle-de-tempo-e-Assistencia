import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { api } from '../lib/apiClient';
import { generateMonthlyReportPDF, getAvailableMonths } from '../lib/monthlyReport';
import { setupAutoSync, getQueueSize } from '../lib/offlineSync';

const Settings: React.FC = () => {
      const navigate = useNavigate();
      const [exporting, setExporting] = useState(false);
      const [availableMonths, setAvailableMonths] = useState<{ year: number; month: number; label: string }[]>([]);
      const [selectedMonth, setSelectedMonth] = useState<string>('');
      const [generatingReport, setGeneratingReport] = useState(false);
      const [queueSize, setQueueSize] = useState(0);

      useEffect(() => {
            // Load available months for report
            getAvailableMonths().then(months => {
                  setAvailableMonths(months);
                  if (months.length > 0) {
                        setSelectedMonth(`${months[0].year}-${months[0].month}`);
                  }
            });

            // Check offline queue size
            setQueueSize(getQueueSize());

            // Setup auto-sync when back online
            const cleanup = setupAutoSync((result) => {
                  if (result.success > 0) {
                        alert(`Sincronizado ${result.success} ações pendentes!`);
                  }
                  setQueueSize(getQueueSize());
            });

            return cleanup;
      }, []);

      const handleGenerateMonthlyReport = async () => {
            if (!selectedMonth) return;
            setGeneratingReport(true);
            try {
                  const [year, month] = selectedMonth.split('-').map(Number);
                  await generateMonthlyReportPDF(year, month);
            } catch (error) {
                  console.error('Error generating report:', error);
                  alert('Erro ao gerar relatório');
            } finally {
                  setGeneratingReport(false);
            }
      };

      const handleExportData = async () => {
            try {
                  setExporting(true);

                  // Reunioes finalizadas (agenda_items e attendance ja vem aninhados)
                  const meetings: any[] = (await api.get('/api/v1/reports/history')) || [];

                  // Lookup de semana (label/theme) por week_id
                  const weekInfo: Record<string, { label: string; theme: string }> = {};
                  const periods: any[] = (await api.get('/api/v1/dashboard/periods')) || [];
                  for (const p of periods) {
                        const weeks: any[] = (await api.get(`/api/v1/dashboard/weeks?periodId=${p.id}`)) || [];
                        weeks.forEach((w) => { weekInfo[w.id] = { label: w.label, theme: w.theme }; });
                  }

                  const sorted = [...meetings].sort((a, b) => {
                        const ta = a.started_at ? new Date(a.started_at).getTime() : 0;
                        const tb = b.started_at ? new Date(b.started_at).getTime() : 0;
                        return tb - ta;
                  });

                  const meetingsSheet = sorted.map((m: any) => ({
                        ID: m.id,
                        Semana: weekInfo[m.week_id]?.label || '',
                        Tema: weekInfo[m.week_id]?.theme || '',
                        Dia: m.meeting_day,
                        Presidente: m.president,
                        Inicio: m.started_at ? new Date(m.started_at).toLocaleString('pt-BR') : '',
                        Fim: m.finished_at ? new Date(m.finished_at).toLocaleString('pt-BR') : '',
                        Duracao_Minutos: Math.floor((m.total_duration_seconds || 0) / 60)
                  }));

                  const attendanceSheet = sorted
                        .filter((m: any) => m.attendance)
                        .map((m: any) => ({
                              Data: m.started_at ? new Date(m.started_at).toLocaleString('pt-BR') : '',
                              Total: (m.attendance.presencial || 0) + (m.attendance.zoom || 0),
                              Presencial: m.attendance.presencial || 0,
                              Zoom: m.attendance.zoom || 0,
                              ID_Reuniao: m.id
                        }));

                  const itemsSheet = sorted.flatMap((m: any) =>
                        (m.agenda_items || []).map((i: any) => ({
                              Titulo: i.title,
                              Designado: i.assigned_names,
                              Secao: i.section,
                              Minutos_Estimados: i.estimated_minutes,
                              Minutos_Reais: Math.floor((i.actual_seconds || 0) / 60),
                              Segundos_Reais: (i.actual_seconds || 0) % 60,
                              Status: i.status,
                              ID_Reuniao: m.id
                        }))
                  );

                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(meetingsSheet), "Reuniões");
                  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(attendanceSheet), "Assistência");
                  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(itemsSheet), "Partes");
                  XLSX.writeFile(wb, `Backup_MeetingManager_${new Date().toISOString().split('T')[0]}.xlsx`);

                  alert('Backup baixado com sucesso!');
            } catch (error: any) {
                  console.error('Export error:', error);
                  alert('Erro ao exportar dados: ' + (error?.message || error));
            } finally {
                  setExporting(false);
            }
      };

      return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display">
                  <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e2736]">
                        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
                              <span className="material-symbols-outlined">arrow_back</span>
                              <span className="font-bold">Voltar</span>
                        </button>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                              <span className="material-symbols-outlined text-gray-500">settings</span>
                              Configurações & Dados
                        </h1>
                        <div className="w-20"></div>
                  </header>

                  <main className="p-6 max-w-4xl mx-auto space-y-8">



                        {/* Backup Section */}
                        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                              <div className="flex items-start gap-6">
                                    <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl">
                                          <span className="material-symbols-outlined text-4xl">cloud_download</span>
                                    </div>
                                    <div className="flex-1">
                                          <h2 className="text-xl font-bold mb-2">Backup Completo (Excel)</h2>
                                          <p className="text-gray-600 dark:text-gray-300 mb-6">
                                                Baixe todo o histórico do sistema em um arquivo Excel (.xlsx).
                                                Isso inclui detalhes de todas as reuniões, registros de assistência e tempos cronometrados de cada parte.
                                          </p>

                                          <button
                                                onClick={handleExportData}
                                                disabled={exporting}
                                                className="flex items-center gap-3 px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-lg font-bold shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                                {exporting ? (
                                                      <>
                                                            <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                                            <span>Gerando arquivo...</span>
                                                      </>
                                                ) : (
                                                      <>
                                                            <span className="material-symbols-outlined">download</span>
                                                            <span>Baixar Backup Agora</span>
                                                      </>
                                                )}
                                          </button>
                                    </div>
                              </div>
                        </div>

                        {/* Monthly Report Section */}
                        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                              <div className="flex items-start gap-6">
                                    <div className="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                                          <span className="material-symbols-outlined text-4xl">summarize</span>
                                    </div>
                                    <div className="flex-1">
                                          <h2 className="text-xl font-bold mb-2">Relatório Mensal</h2>
                                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                                                Gere um PDF com resumo de assistência e reuniões de um mês específico.
                                          </p>

                                          <div className="flex items-center gap-4 mb-4">
                                                <select
                                                      value={selectedMonth}
                                                      onChange={(e) => setSelectedMonth(e.target.value)}
                                                      className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-[#111318] dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                >
                                                      {availableMonths.length === 0 ? (
                                                            <option value="">Nenhum mês disponível</option>
                                                      ) : (
                                                            availableMonths.map((m) => (
                                                                  <option key={`${m.year}-${m.month}`} value={`${m.year}-${m.month}`}>
                                                                        {m.label}
                                                                  </option>
                                                            ))
                                                      )}
                                                </select>
                                                <button
                                                      onClick={handleGenerateMonthlyReport}
                                                      disabled={generatingReport || !selectedMonth}
                                                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all disabled:opacity-50"
                                                >
                                                      {generatingReport ? (
                                                            <>
                                                                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                                                  <span>Gerando...</span>
                                                            </>
                                                      ) : (
                                                            <>
                                                                  <span className="material-symbols-outlined">picture_as_pdf</span>
                                                                  <span>Gerar PDF</span>
                                                            </>
                                                      )}
                                                </button>
                                          </div>

                                          <p className="text-sm text-gray-500 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">info</span>
                                                Inclui: total de reuniões, média de assistência, detalhes por data.
                                          </p>
                                    </div>
                              </div>
                        </div>

                        {/* Offline Sync Status */}
                        {queueSize > 0 && (
                              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-700 flex items-center gap-4">
                                    <span className="material-symbols-outlined text-amber-600 text-3xl">cloud_off</span>
                                    <div className="flex-1">
                                          <p className="font-bold text-amber-800 dark:text-amber-200">
                                                {queueSize} ações pendentes
                                          </p>
                                          <p className="text-sm text-amber-600 dark:text-amber-400">
                                                Serão sincronizadas automaticamente quando você estiver online.
                                          </p>
                                    </div>
                              </div>
                        )}

                        <div className="text-center text-sm text-gray-400 mt-12">
                              <p>MeetingManager v1.2 • Banco de Dados Conectado</p>
                        </div>

                  </main>
            </div>
      );
};

export default Settings;
