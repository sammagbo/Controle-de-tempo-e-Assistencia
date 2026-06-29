import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/apiClient';
import { MEETING_SECTIONS, SECTION_COLORS, SectionKey } from '../lib/meetingTemplate';
import html2canvas from 'html2canvas';
import { generateMeetingPDF } from '../lib/pdfGenerator';
import type { AgendaItem, MeetingWithWeek, Comment, Attendance } from '../types';

const MeetingReport: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [meeting, setMeeting] = useState<MeetingWithWeek | null>(null);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [attendance, setAttendance] = useState({ total: 0, presencial: 0, zoom: 0 });
  const [commentsCount, setCommentsCount] = useState(0);
  const [commentsTotalSeconds, setCommentsTotalSeconds] = useState(0);
  const [counselTimes, setCounselTimes] = useState<Record<string, number>>({});
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const meetingId = localStorage.getItem('active_meeting_id');
    if (!meetingId) {
      navigate('/');
      return;
    }

    const fetchReportData = async () => {
      setLoading(true);
      try {
        const data = await api.get(`/api/v1/reports/meetings/${meetingId}`);
        if (!data) { setLoading(false); return; }

        // Resolve info da semana (label/date_range/theme) por week_id
        let weekData: any = null;
        if (data.week_id) {
          const periods: any[] = (await api.get('/api/v1/dashboard/periods')) || [];
          for (const p of periods) {
            const weeks: any[] = (await api.get(`/api/v1/dashboard/weeks?periodId=${p.id}`)) || [];
            const found = weeks.find((w) => w.id === data.week_id);
            if (found) { weekData = { label: found.label, date_range: found.date_range, theme: found.theme }; break; }
          }
        }

        setMeeting({ ...data, week: weekData || undefined });

        const items = [...(data.agenda_items || [])].sort(
          (a: any, b: any) => (a.position || 0) - (b.position || 0)
        );
        setAgendaItems(items as AgendaItem[]);

        const att = data.attendance;
        if (att) {
          setAttendance({ total: att.count || 0, presencial: att.presencial || 0, zoom: att.zoom || 0 });
        }

        const comments: any[] = data.comments || [];
        setCommentsCount(comments.length);
        setCommentsTotalSeconds(comments.reduce((sum, c) => sum + (c.duration_seconds || 0), 0));
        const counselMap: Record<string, number> = {};
        comments.forEach((c) => {
          if (c.comment_type === 'post_student' && c.agenda_item_id) {
            counselMap[c.agenda_item_id] = (counselMap[c.agenda_item_id] || 0) + (c.duration_seconds || 0);
          }
        });
        setCounselTimes(counselMap);
      } catch (err) {
        console.error('Error fetching report data:', err);
      } finally {
        setLoading(false);
      }
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

  // Format time as MM:SS
  const formatTimeShort = (seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get time status emoji (🔴 if > 30s overtime, 🟢 otherwise)
  const getTimeEmoji = (actualSeconds: number, estimatedMinutes: number) => {
    const estimatedSeconds = estimatedMinutes * 60;
    const difference = actualSeconds - estimatedSeconds;
    return difference > 30 ? '🔴' : '🟢';
  };

  // Generate text report in the exact format requested
  const generateTextReport = (): string => {
    if (!meeting) return '';

    const weekLabel = meeting.week?.date_range || meeting.week?.label || 'Reunião';
    const date = meeting.started_at ? new Date(meeting.started_at) : new Date();
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const startTime = meeting.started_at ? new Date(meeting.started_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';
    const endTime = meeting.finished_at ? new Date(meeting.finished_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';

    let report = `📅 *Reunião: ${weekLabel}*\n\n`;

    // President name (if available)
    if (meeting.president) {
      report += `*Presidente: ${meeting.president}*\n`;
    }

    // Start time
    report += `*Início - ${startTime}*\n\n`;

    // Attendance section
    report += `*Assistência ${dateStr}*\n`;
    report += `Presencial: ${attendance.presencial}\n`;
    report += `Zoom: ${attendance.zoom}\n`;
    report += `Total: ${attendance.total}\n\n`;

    // Section mapping
    const sectionNames: Record<SectionKey, string> = {
      abertura: 'Abertura',
      tesouros: 'Tesouros da Palavra de Deus',
      ministerio: 'Faça Seu Melhor no Ministério',
      vida_crista: 'Nossa Vida Cristã',
      encerramento: 'Encerramento'
    };

    // Process each section
    const sectionOrder: SectionKey[] = ['tesouros', 'ministerio', 'vida_crista'];

    sectionOrder.forEach(sectionKey => {
      const sectionItems = agendaItems.filter(item => item.section === sectionKey);
      if (sectionItems.length === 0) return;

      report += `*${sectionNames[sectionKey]}*\n`;

      sectionItems.forEach(item => {
        const actualSeconds = item.actual_seconds || 0;
        const estimatedSeconds = item.estimated_minutes * 60;
        const difference = actualSeconds - estimatedSeconds;

        // 🔴 if >30s overtime, 🟢 otherwise
        const emoji = difference > 30 ? '🔴' : '🟢';
        const actualTime = formatTimeShort(actualSeconds);

        // Format: Title (Name): Time emoji
        const nameStr = item.assigned_names ? ` (${item.assigned_names})` : '';

        // Check if it's a song (Cântico) - no time tracking
        if (item.title.includes('Cântico')) {
          report += `${item.title}\n`;
        } else {
          report += `${item.title}${nameStr}: ${actualTime} ${emoji}\n`;
        }

        // Add counsel time if exists
        const counselTime = counselTimes[item.id];
        if (counselTime) {
          report += `Conselho: ${formatTimeShort(counselTime)}\n`;
        }
      });

      report += '\n';
    });

    // End time
    report += `*FIM DA REUNIÃO: ${endTime}*`;

    return report;
  };

  // Generate WhatsApp-formatted report with exact user format
  const generateWhatsAppReport = (): string => {
    if (!meeting) return '';

    const weekLabel = meeting.week?.date_range || meeting.week?.label || 'Reunião';
    const date = meeting.started_at ? new Date(meeting.started_at) : new Date();
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const startTime = meeting.started_at ? new Date(meeting.started_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';
    const endTime = meeting.finished_at ? new Date(meeting.finished_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '--:--';

    let report = `📅 *Reunião: ${weekLabel}*\n\n`;

    // President name (if available)
    if (meeting.president) {
      report += `*Presidente: ${meeting.president}*\n`;
    }

    // Start time
    report += `*Início - ${startTime}*\n\n`;

    // Attendance section
    report += `*Assistência ${dateStr}*\n`;
    report += `Presencial: ${attendance.presencial}\n`;
    report += `Zoom: ${attendance.zoom}\n`;
    report += `Total: ${attendance.total}\n\n`;

    // Section mapping
    const sectionNames: Record<SectionKey, string> = {
      abertura: 'Abertura',
      tesouros: 'Tesouros da Palavra de Deus',
      ministerio: 'Faça Seu Melhor no Ministério',
      vida_crista: 'Nossa Vida Cristã',
      encerramento: 'Encerramento'
    };

    // Process each section
    const sectionOrder: SectionKey[] = ['tesouros', 'ministerio', 'vida_crista'];

    sectionOrder.forEach(sectionKey => {
      const sectionItems = agendaItems.filter(item => item.section === sectionKey);
      if (sectionItems.length === 0) return;

      report += `*${sectionNames[sectionKey]}*\n`;

      sectionItems.forEach(item => {
        const actualSeconds = item.actual_seconds || 0;
        const estimatedSeconds = item.estimated_minutes * 60;
        const difference = actualSeconds - estimatedSeconds;

        // 🔴 if >30s overtime, 🟢 otherwise
        const emoji = difference > 30 ? '🔴' : '🟢';
        const actualTime = formatTimeShort(actualSeconds);

        // Format: *Title* (Name): Time emoji
        const nameStr = item.assigned_names ? ` (${item.assigned_names})` : '';

        // Check if it's a song (Cântico) - no time tracking
        if (item.title.includes('Cântico')) {
          report += `${item.title}\n`;
        } else {
          report += `${item.title}${nameStr}: ${actualTime} ${emoji}\n`;
        }

        // Add counsel time if exists
        const counselTime = counselTimes[item.id];
        if (counselTime) {
          report += `Conselho: ${formatTimeShort(counselTime)}\n`;
        }
      });

      report += '\n';
    });

    // End time
    report += `*FIM DA REUNIÃO: ${endTime}*`;

    return report;
  };

  // Share via native share API or WhatsApp fallback
  const handleShareWhatsApp = async () => {
    const report = generateWhatsAppReport();

    // Try native share first (works best on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Relatório da Reunião',
          text: report
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to WhatsApp
        console.log('Native share cancelled, falling back to WhatsApp');
      }
    }

    // Fallback to WhatsApp web link
    const encodedReport = encodeURIComponent(report);
    window.open(`https://api.whatsapp.com/send?text=${encodedReport}`, '_blank');
  };

  // Copy text report to clipboard
  const handleCopyToClipboard = async () => {
    const textReport = generateTextReport();
    try {
      await navigator.clipboard.writeText(textReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
      alert('Erro ao copiar. Tente novamente.');
    }
  };

  const handleExportImage = async () => {
    if (!reportRef.current) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#f8fafc',
        scale: 2,
        useCORS: true,
        logging: false
      });

      const link = document.createElement('a');
      link.download = `relatorio-reuniao-${meeting?.week?.label || 'N/A'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Erro ao exportar imagem.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = () => {
    if (!meeting) return;

    // Prepare data for PDF
    const pdfData = {
      theme: meeting.week?.theme || 'Reunião do Meio de Semana',
      date: formatDate(meeting.started_at),
      president: meeting.president || '',
      attendance: {
        presencial: attendance.presencial,
        zoom: attendance.zoom,
        total: attendance.total
      },
      parts: agendaItems.map(item => {
        const estimatedSeconds = item.estimated_minutes * 60;
        const difference = (item.actual_seconds || 0) - estimatedSeconds;
        let status: 'on-time' | 'overtime' | 'undertime' = 'on-time';
        if (difference > 0) status = 'overtime';
        if (difference < -60) status = 'undertime';

        return {
          title: item.title,
          names: item.assigned_names || '',
          time: formatTime(item.actual_seconds || 0),
          status,
          is_comment: item.title.includes('Comentários') || item.title.includes('Conselho')
        };
      })
    };

    // We only have total attendance in state 'attendance', need to fetch details or just show total
    // But let's check if we can get details.
    // Actually, in fetchReportData line 108 we selected 'count' only.
    // Ideally we should select presencial/zoom in fetchReportData.
    // For now, let's just pass total. We can improve this if we modify fetch first.
    // Let's modify fetch first? No, let's stick to quick wins. Passing total for now.
    // Wait, pdfGenerator expects presencial/zoom.
    // Let's assume we can split it or just show total.
    // Let's fetch full attendance details in MeetingReport line 108 first?
    // Doing it inline here might be cleaner for this step.

    generateMeetingPDF(pdfData);
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
          <div ref={reportRef} className="layout-content-container flex flex-col max-w-[1000px] w-full flex-1 gap-6">
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
                {meeting?.president && (
                  <p className="text-[#111318] dark:text-white text-lg font-bold mt-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person_celebrate</span>
                    Presidente: {meeting.president}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {/* Copy Text Report Button */}
                <button
                  onClick={handleCopyToClipboard}
                  className={`flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 ${copied ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-800/40 text-purple-700 dark:text-purple-300'} text-sm font-bold transition-colors`}
                >
                  <span className="material-symbols-outlined text-[18px] mr-2">{copied ? 'check_circle' : 'content_copy'}</span>
                  <span className="truncate">{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>
                {/* WhatsApp Share Button */}
                <button
                  onClick={handleShareWhatsApp}
                  className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-colors shadow-sm"
                >
                  <svg className="w-[18px] h-[18px] mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <span className="truncate">Compartilhar</span>
                </button>
                {/* Export Image Button */}
                <button
                  onClick={handleExportImage}
                  disabled={exporting}
                  className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-bold transition-colors"
                >
                  {exporting ? (
                    <span className="material-symbols-outlined animate-spin text-[18px] mr-2">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px] mr-2">download</span>
                  )}
                  <span className="truncate">{exporting ? 'Exportando...' : 'Exportar Imagem'}</span>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 text-sm font-bold transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] mr-2">picture_as_pdf</span>
                  <span className="truncate">Baixar PDF</span>
                </button>
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
                  {attendance.total}
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
                                  {item.assigned_names && (
                                    <p className="text-primary dark:text-blue-400 text-xs mt-1 font-medium">
                                      ({item.assigned_names})
                                    </p>
                                  )}
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
                                        -{formatTime(Math.abs(difference))}
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