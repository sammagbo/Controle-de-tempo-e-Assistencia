import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from './apiClient';
import { getCurrentLanguage } from './translations';

interface MonthlyMeetingData {
      id: string;
      created_at: string;
      total_duration_seconds: number;
      president?: string;
      week?: {
            date_range: string;
            label: string;
      };
}

interface MonthlyAttendanceData {
      id: string;
      created_at: string;
      presencial: number;
      zoom: number;
      count: number;
}

interface MonthlyReportData {
      month: string;
      year: number;
      meetings: MonthlyMeetingData[];
      attendance: MonthlyAttendanceData[];
      stats: {
            totalMeetings: number;
            avgAttendance: number;
            totalPresencial: number;
            totalZoom: number;
            avgDuration: number;
            highestAttendance: number;
            lowestAttendance: number;
      };
}

/**
 * Fetch data for a specific month
 */
export const fetchMonthlyData = async (year: number, month: number): Promise<MonthlyReportData> => {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1); // exclusivo: 1o dia do mes seguinte
      const startMs = startDate.getTime();
      const endMs = endDate.getTime();

      // Reunioes finalizadas do mes (started_at dentro do intervalo)
      const history: any[] = (await api.get('/api/v1/reports/history')) || [];
      const meetingsData: MonthlyMeetingData[] = history
            .filter(m => {
                  if (!m.started_at) return false;
                  const t = new Date(m.started_at).getTime();
                  return t >= startMs && t < endMs;
            })
            .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
            .map(m => ({
                  id: m.id,
                  created_at: m.started_at,
                  total_duration_seconds: m.total_duration_seconds || 0,
                  president: m.president
            }));

      // Assistencia do mes (avulsas + de reunioes), em ordem crescente
      const attendanceRaw: any[] =
            (await api.get(`/api/v1/attendance?start=${startDate.toISOString()}&end=${endDate.toISOString()}`)) || [];
      const attendanceData: MonthlyAttendanceData[] = ([...attendanceRaw] as MonthlyAttendanceData[]).sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      // Calculate stats
      const totals = attendanceData.map(a => (a.count || 0) || (a.presencial || 0) + (a.zoom || 0));
      const avgAttendance = totals.length > 0 ? Math.round(totals.reduce((a, b) => a + b, 0) / totals.length) : 0;
      const totalPresencial = attendanceData.reduce((sum, a) => sum + (a.presencial || 0), 0);
      const totalZoom = attendanceData.reduce((sum, a) => sum + (a.zoom || 0), 0);
      const avgDuration = meetingsData.length > 0
            ? Math.round(meetingsData.reduce((sum, m) => sum + (m.total_duration_seconds || 0), 0) / meetingsData.length)
            : 0;

      const monthNames = getCurrentLanguage() === 'fr'
            ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
            : ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      return {
            month: monthNames[month - 1],
            year,
            meetings: meetingsData,
            attendance: attendanceData,
            stats: {
                  totalMeetings: meetingsData.length,
                  avgAttendance,
                  totalPresencial,
                  totalZoom,
                  avgDuration,
                  highestAttendance: Math.max(...totals, 0),
                  lowestAttendance: totals.length > 0 ? Math.min(...totals) : 0
            }
      };
};

/**
 * Generate Monthly Report PDF
 */
export const generateMonthlyReportPDF = async (year: number, month: number): Promise<void> => {
      const data = await fetchMonthlyData(year, month);
      const lang = getCurrentLanguage();

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      // Title
      doc.setFontSize(24);
      doc.setTextColor(40, 40, 40);
      const title = lang === 'fr' ? 'Rapport Mensuel' : 'Relatório Mensal';
      doc.text(title, pageWidth / 2, 20, { align: 'center' });

      // Month/Year
      doc.setFontSize(16);
      doc.setTextColor(66, 133, 244);
      doc.text(`${data.month} ${data.year}`, pageWidth / 2, 30, { align: 'center' });

      // Stats Box
      doc.setFillColor(245, 247, 250);
      doc.roundedRect(15, 40, pageWidth - 30, 50, 3, 3, 'F');

      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'normal');

      const labels = lang === 'fr' ? {
            totalMeetings: 'Réunions:',
            avgAttendance: 'Assistance Moyenne:',
            presencial: 'En Personne:',
            zoom: 'Zoom:',
            avgDuration: 'Durée Moyenne:',
            highest: 'Plus Haute:',
            lowest: 'Plus Basse:'
      } : {
            totalMeetings: 'Reuniões:',
            avgAttendance: 'Assistência Média:',
            presencial: 'Presencial:',
            zoom: 'Zoom:',
            avgDuration: 'Duração Média:',
            highest: 'Maior:',
            lowest: 'Menor:'
      };

      // Left column
      doc.text(`${labels.totalMeetings} ${data.stats.totalMeetings}`, 25, 55);
      doc.text(`${labels.avgAttendance} ${data.stats.avgAttendance}`, 25, 65);
      doc.text(`${labels.avgDuration} ${Math.floor(data.stats.avgDuration / 60)}min`, 25, 75);

      // Right column  
      doc.text(`${labels.presencial} ${data.stats.totalPresencial}`, 110, 55);
      doc.text(`${labels.zoom} ${data.stats.totalZoom}`, 110, 65);
      doc.text(`${labels.highest} ${data.stats.highestAttendance} | ${labels.lowest} ${data.stats.lowestAttendance}`, 110, 75);

      // Attendance Table
      if (data.attendance.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(40, 40, 40);
            doc.setFont('helvetica', 'bold');
            const attendanceTitle = lang === 'fr' ? 'Détails de l\'Assistance' : 'Detalhes da Assistência';
            doc.text(attendanceTitle, 15, 105);

            const tableBody = data.attendance.map(a => {
                  const date = new Date(a.created_at);
                  return [
                        date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }),
                        a.presencial?.toString() || '0',
                        a.zoom?.toString() || '0',
                        ((a.count || 0) || ((a.presencial || 0) + (a.zoom || 0))).toString()
                  ];
            });

            autoTable(doc, {
                  startY: 110,
                  head: [[
                        lang === 'fr' ? 'Date' : 'Data',
                        lang === 'fr' ? 'Personne' : 'Presencial',
                        'Zoom',
                        'Total'
                  ]],
                  body: tableBody,
                  theme: 'striped',
                  headStyles: {
                        fillColor: [66, 133, 244],
                        textColor: 255,
                        fontSize: 10
                  },
                  bodyStyles: {
                        fontSize: 9
                  },
                  columnStyles: {
                        0: { cellWidth: 60 },
                        1: { cellWidth: 30, halign: 'center' },
                        2: { cellWidth: 30, halign: 'center' },
                        3: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
                  }
            });
      }

      // Footer
      const finalY = (doc as any).lastAutoTable?.finalY || 110;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const generated = lang === 'fr' ? 'Généré le' : 'Gerado em';
      doc.text(`${generated} ${new Date().toLocaleString(lang === 'fr' ? 'fr-FR' : 'pt-BR')}`, pageWidth / 2, finalY + 20, { align: 'center' });

      // Save
      const fileName = lang === 'fr'
            ? `Rapport_${data.month}_${data.year}.pdf`
            : `Relatorio_${data.month}_${data.year}.pdf`;
      doc.save(fileName);
};

/**
 * Get available months with data
 */
export const getAvailableMonths = async (): Promise<{ year: number; month: number; label: string }[]> => {
      const history: any[] = (await api.get('/api/v1/reports/history')) || [];
      const meetings = history
            .filter(m => m.started_at)
            .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

      const months = new Set<string>();
      const result: { year: number; month: number; label: string }[] = [];

      const lang = getCurrentLanguage();
      const monthNames = lang === 'fr'
            ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
            : ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      meetings.forEach(m => {
            const date = new Date(m.started_at);
            const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
            if (!months.has(key)) {
                  months.add(key);
                  result.push({
                        year: date.getFullYear(),
                        month: date.getMonth() + 1,
                        label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`
                  });
            }
      });

      return result;
};
