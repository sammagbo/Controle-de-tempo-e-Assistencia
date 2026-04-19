import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { MEETING_SECTIONS, SECTION_COLORS } from '../lib/meetingTemplate';
import { useMainTimer } from '../lib/hooks/useMainTimer';
import { useCounselTimer } from '../lib/hooks/useCounselTimer';
import type { AgendaItem } from '../types';
import { validateAssignedNames } from '../lib/validation';

type LiveAgendaItem = AgendaItem;

const pad = (n: number) => n.toString().padStart(2, '0');

// ─── DB helpers ──────────────────────────────────────────────────────────────

async function saveActualSeconds(itemId: string, seconds: number) {
  await supabase.from('agenda_items').update({ actual_seconds: seconds }).eq('id', itemId);
}

async function updateItemStatus(itemId: string, status: string) {
  await supabase.from('agenda_items').update({ status }).eq('id', itemId);
}

// ─── Component ───────────────────────────────────────────────────────────────

const LiveMeeting: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<LiveAgendaItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);

  // Name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState('');

  const timer = useMainTimer();
  const counsel = useCounselTimer(timer.isRunning);

  // ── Fetch agenda items ──────────────────────────────────────────────────────
  useEffect(() => {
    const storedMeetingId = localStorage.getItem('active_meeting_id');
    if (!storedMeetingId) {
      alert('No active meeting found.');
      navigate('/');
      return;
    }
    setMeetingId(storedMeetingId);

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('agenda_items')
        .select('id, title, estimated_minutes, position, status, actual_seconds, section, allows_comments, requires_post_comment, skip_timing')
        .eq('meeting_id', storedMeetingId)
        .order('position', { ascending: true });

      if (!error && data?.length) {
        setItems(data);
        const activeIdx = data.findIndex(i => i.status === 'active');
        if (activeIdx >= 0) setActiveIndex(activeIdx);
      }
      setLoading(false);
    })();
  }, [navigate]);

  // ── Restore running state after items load ──────────────────────────────────
  useEffect(() => {
    if (!items.length || timer.isRunning) return;
    const storedItemId = localStorage.getItem('timer_active_item_id');
    if (!storedItemId) return;
    const idx = items.findIndex(i => i.id === storedItemId);
    if (idx >= 0) {
      setActiveIndex(idx);
      timer.setIsRunning(true);
    } else {
      timer.clearPersistence();
    }
  }, [items]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') { e.preventDefault(); timer.isRunning ? handlePause() : handleStart(); }
      if (e.code === 'ArrowRight' && activeIndex < items.length - 1) { e.preventDefault(); handleNext(); }
      if (e.code === 'ArrowLeft' && activeIndex > 0) { e.preventDefault(); handleJumpToItem(activeIndex - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [timer.isRunning, activeIndex, items.length]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleStart = async () => {
    const item = items[activeIndex];
    if (item) await updateItemStatus(item.id, 'active');
    timer.start(item?.id ?? '');
  };

  const handlePause = async () => {
    timer.pause();
    if (items[activeIndex]) await saveActualSeconds(items[activeIndex].id, timer.timerRef.current);
  };

  const handleNext = async () => {
    // ── Exiting counsel mode ──
    if (counsel.isCounselMode) {
      if (meetingId && counsel.counselItemId) {
        await supabase.from('comments').insert({
          meeting_id: meetingId,
          agenda_item_id: counsel.counselItemId,
          duration_seconds: counsel.counselTimerRef.current,
          comment_type: 'post_student',
        });
      }
      counsel.exitCounsel();

      if (activeIndex < items.length - 1) {
        const nextIndex = activeIndex + 1;
        const newItems = [...items];
        newItems[nextIndex].status = 'active';
        setItems(newItems);
        setActiveIndex(nextIndex);
        timer.reset(0);
        if (timer.isRunning) {
          localStorage.setItem('timer_start_timestamp', Date.now().toString());
          localStorage.setItem('timer_base_seconds', '0');
          localStorage.setItem('timer_active_item_id', items[nextIndex].id);
        }
      }
      return;
    }

    // ── Save current item ──
    if (items[activeIndex]) {
      await saveActualSeconds(items[activeIndex].id, timer.timerRef.current);
      await updateItemStatus(items[activeIndex].id, 'completed');
    }

    if (activeIndex >= items.length - 1) {
      timer.pause();
      return;
    }

    const nextIndex = activeIndex + 1;
    await updateItemStatus(items[nextIndex].id, 'active');

    // ── Enter counsel mode if required ──
    if (items[activeIndex]?.requires_post_comment) {
      counsel.enterCounsel(items[activeIndex].title, items[activeIndex].id);
      timer.reset(0);
      timer.clearPersistence();
      if (!timer.isRunning) timer.setIsRunning(true);
      return;
    }

    // ── Normal advance ──
    const newItems = [...items];
    if (items[activeIndex]) {
      newItems[activeIndex].status = 'completed';
      newItems[activeIndex].actual_seconds = timer.timerRef.current;
    }
    newItems[nextIndex].status = 'active';
    setItems(newItems);
    setActiveIndex(nextIndex);
    timer.reset(0);

    if (timer.isRunning) {
      if (newItems[nextIndex]?.skip_timing) {
        timer.pause();
      } else {
        localStorage.setItem('timer_start_timestamp', Date.now().toString());
        localStorage.setItem('timer_base_seconds', '0');
        localStorage.setItem('timer_active_item_id', items[nextIndex].id);
      }
    } else {
      timer.clearPersistence();
    }
  };

  const handleJumpToItem = async (index: number) => {
    if (index === activeIndex) return;
    if (items[activeIndex]) await saveActualSeconds(items[activeIndex].id, timer.timerRef.current);
    timer.pause();
    const target = items[index];
    if (target) {
      await updateItemStatus(target.id, 'active');
      setActiveIndex(index);
      timer.reset(target.actual_seconds || 0);
    }
  };

  const finalizeMeeting = async () => {
    if (!meetingId) return;
    setFinalizing(true);
    timer.pause();

    try {
      if (items[activeIndex]) {
        await saveActualSeconds(items[activeIndex].id, timer.timerRef.current);
        await updateItemStatus(items[activeIndex].id, 'completed');
      }

      const { data: agendaData } = await supabase
        .from('agenda_items').select('actual_seconds').eq('meeting_id', meetingId);
      const { data: commentsData } = await supabase
        .from('comments').select('duration_seconds').eq('meeting_id', meetingId);

      const total =
        (agendaData?.reduce((s, i) => s + (i.actual_seconds || 0), 0) ?? 0) +
        (commentsData?.reduce((s, i) => s + (i.duration_seconds || 0), 0) ?? 0);

      const { error } = await supabase.from('meetings').update({
        finished_at: new Date().toISOString(),
        total_duration_seconds: total,
      }).eq('id', meetingId);

      if (error) { alert('Erro ao finalizar reunião.'); return; }
      navigate('/report');
    } finally {
      setFinalizing(false);
    }
  };

  const startEditingName = () => {
    if (items[activeIndex]) {
      setEditingNameValue(items[activeIndex].assigned_names || '');
      setIsEditingName(true);
    }
  };

  const saveEditedName = async () => {
    const item = items[activeIndex];
    if (!item) return;
    const validationError = validateAssignedNames(editingNameValue);
    if (validationError) { alert(validationError); return; }
    const { error: dbError } = await supabase
      .from('agenda_items').update({ assigned_names: editingNameValue }).eq('id', item.id);
    if (dbError) { alert('Erro ao salvar nome.'); return; }
    const newItems = [...items];
    newItems[activeIndex].assigned_names = editingNameValue;
    setItems(newItems);
    setIsEditingName(false);
  };

  // ── Derived ─────────────────────────────────────────────────────────────────

  const activeItem = items[activeIndex];
  const minutes = Math.floor(timer.totalSeconds / 60);
  const seconds = timer.totalSeconds % 60;

  // ── Loading states ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          <p className="mt-2">Carregando reunião...</p>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-gray-400">event_busy</span>
          <p className="mt-2">Nenhuma parte encontrada.</p>
          <button onClick={() => navigate('/setup')} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg">
            Ir para Configuração
          </button>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display overflow-hidden h-screen flex flex-col">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between border-b border-[#e5e7eb] dark:border-[#2d3748] px-6 py-3 bg-surface-light dark:bg-surface-dark z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/setup')} className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold">Reunião ao Vivo</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/display')} className="flex items-center justify-center rounded-lg h-9 px-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="Modo Telão">
            <span className="material-symbols-outlined text-[18px]">tv</span>
          </button>
          <button onClick={() => navigate('/attendance')} className="flex items-center justify-center rounded-lg h-9 px-4 bg-primary/10 text-primary dark:text-blue-400 text-sm font-bold border border-primary/20 hover:bg-primary/20 transition-colors">
            Assistência
          </button>
        </div>
      </header>

      {/* Main Split */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Timer Panel */}
        <section className="min-h-[60vh] lg:min-h-0 flex-1 flex flex-col items-center overflow-y-auto p-4 lg:p-10 bg-surface-light dark:bg-surface-dark shadow-sm lg:border-r border-gray-200 dark:border-gray-800">
          <div className="w-full max-w-3xl flex flex-col items-center gap-8">

            {/* Topic Header */}
            <div className="text-center w-full space-y-4">
              {counsel.isCounselMode ? (
                <>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-lg">record_voice_over</span>
                    Conselho do Presidente
                  </div>
                  <h1 className="text-orange-600 dark:text-orange-400 text-3xl md:text-5xl font-bold">Conselho (Presidente)</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Parte: <span className="font-medium">{counsel.counselItemTitle}</span></p>
                </>
              ) : (
                <>
                  {activeItem?.section && (
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${SECTION_COLORS[activeItem.section].bg} ${SECTION_COLORS[activeItem.section].text} text-xs font-bold uppercase tracking-wider`}>
                      <span className="material-symbols-outlined text-sm">{MEETING_SECTIONS[activeItem.section].icon}</span>
                      {MEETING_SECTIONS[activeItem.section].label}
                    </div>
                  )}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider ml-2">
                    <span className={`w-2 h-2 rounded-full bg-green-500 ${timer.isRunning ? 'animate-pulse' : ''}`}></span>
                    Ao Vivo
                  </div>
                  <h1 className="text-[#111318] dark:text-white text-3xl md:text-5xl font-bold">{activeItem?.title || 'Nenhuma parte'}</h1>

                  {/* Name editing */}
                  <div className="min-h-[40px] flex items-center justify-center">
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text" value={editingNameValue} onChange={e => setEditingNameValue(e.target.value)}
                          className="border border-primary rounded-lg px-3 py-1 text-lg text-center dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                          placeholder="Nome do irmão" autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') saveEditedName(); if (e.key === 'Escape') setIsEditingName(false); }}
                        />
                        <button onClick={saveEditedName} className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200"><span className="material-symbols-outlined text-xl">check</span></button>
                        <button onClick={() => setIsEditingName(false)} className="p-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200"><span className="material-symbols-outlined text-xl">close</span></button>
                      </div>
                    ) : (
                      <div onClick={startEditingName} className="group flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" title="Clique para editar o nome">
                        <p className="text-primary dark:text-blue-400 text-lg font-medium">
                          <span className="material-symbols-outlined align-middle text-lg mr-1">person</span>
                          {activeItem?.assigned_names || <span className="italic opacity-50">Sem designação</span>}
                        </p>
                        <span className="material-symbols-outlined text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm">edit</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Timer Display */}
            <div className="flex gap-3 sm:gap-6 py-4">
              {activeItem?.skip_timing && !counsel.isCounselMode ? (
                <div className="flex h-32 sm:h-48 w-64 sm:w-[360px] items-center justify-center rounded-2xl bg-[#f0f2f4] dark:bg-gray-800 border-2 border-transparent">
                  <p className="text-gray-400 dark:text-gray-500 text-2xl sm:text-4xl font-bold uppercase">Não Cronometrado</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-2">
                    <div className={`flex h-32 sm:h-48 w-28 sm:w-40 items-center justify-center rounded-2xl bg-white dark:bg-gray-800 border-4 ${counsel.isCounselMode ? 'border-orange-500 shadow-orange-500/20' : 'border-primary shadow-primary/20'} shadow-2xl`}>
                      <p className={`${counsel.isCounselMode ? 'text-orange-500' : 'text-primary dark:text-blue-400'} text-6xl sm:text-8xl font-bold font-mono`}>
                        {counsel.isCounselMode ? pad(Math.floor(counsel.counselSeconds / 60)) : pad(minutes)}
                      </p>
                    </div>
                    <p className={`${counsel.isCounselMode ? 'text-orange-500' : 'text-primary dark:text-blue-400'} text-sm font-bold uppercase tracking-wider`}>Minutos</p>
                  </div>
                  <div className="flex h-32 sm:h-48 items-center justify-center pb-8">
                    <span className="text-6xl sm:text-7xl font-bold text-gray-300 dark:text-gray-600">:</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-32 sm:h-48 w-28 sm:w-40 items-center justify-center rounded-2xl bg-[#f0f2f4] dark:bg-gray-800 border-2 border-transparent">
                      <p className="text-[#111318] dark:text-white text-6xl sm:text-8xl font-bold font-mono">
                        {counsel.isCounselMode ? pad(counsel.counselSeconds % 60) : pad(seconds)}
                      </p>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Segundos</p>
                  </div>
                </>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center max-w-[800px] pt-4 sm:pt-8 pb-8 sm:pb-0">
              <div className="flex gap-3 w-full sm:w-auto flex-1">
                <button onClick={handleStart} disabled={timer.isRunning || (!!activeItem?.skip_timing && !counsel.isCounselMode)}
                  className={`flex flex-1 h-14 sm:h-16 items-center justify-center gap-2 rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all active:scale-95 ${(timer.isRunning || (activeItem?.skip_timing && !counsel.isCounselMode)) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <span className="material-symbols-outlined text-[28px]">play_arrow</span>
                  <span className="text-xl font-bold">Iniciar</span>
                </button>
                <button onClick={handlePause} disabled={!timer.isRunning || (!!activeItem?.skip_timing && !counsel.isCounselMode)}
                  className={`flex flex-1 h-14 sm:h-16 items-center justify-center gap-2 rounded-2xl bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg transition-all active:scale-95 ${(!timer.isRunning || (activeItem?.skip_timing && !counsel.isCounselMode)) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <span className="material-symbols-outlined text-[28px]">pause</span>
                  <span className="text-xl font-bold">Pausar</span>
                </button>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={() => handleJumpToItem(activeIndex - 1)} disabled={activeIndex === 0 || counsel.isCounselMode}
                  className={`flex flex-1 h-14 sm:h-16 items-center justify-center gap-2 rounded-2xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 ${(activeIndex === 0 || counsel.isCounselMode) ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  <span className="material-symbols-outlined text-[28px]">skip_previous</span>
                  <span className="text-xl font-bold">Anterior</span>
                </button>
                {activeIndex === items.length - 1 && !counsel.isCounselMode ? (
                  <button onClick={finalizeMeeting} disabled={finalizing}
                    className="flex flex-1 h-14 sm:h-16 items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all active:scale-95 disabled:opacity-50">
                    <span className="material-symbols-outlined text-[28px]">stop_circle</span>
                    <span className="text-xl font-bold">{finalizing ? 'Finalizando...' : 'FINALIZAR'}</span>
                  </button>
                ) : (
                  <button onClick={handleNext}
                    className="flex flex-1 h-14 sm:h-16 items-center justify-center gap-2 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-all active:scale-95">
                    <span className="text-xl font-bold">Próximo</span>
                    <span className="material-symbols-outlined text-[28px]">skip_next</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Right: Agenda List */}
        <aside className="w-full max-h-[40vh] lg:max-h-none lg:w-[400px] xl:w-[480px] bg-gray-50 dark:bg-[#101622] flex flex-col border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/80 dark:bg-[#101622]/80 backdrop-blur-sm sticky top-0 z-10">
            <h3 className="text-lg font-bold">Partes da reunião</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
              Item {activeIndex + 1} de {items.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              const isCompleted = item.status === 'completed';

              if (isActive) return (
                <div key={item.id} className="relative flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-surface-dark border-2 border-primary shadow-md scale-[1.02]">
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary rounded-l-xl" />
                  <div className="flex-shrink-0 mt-1">
                    <div className="size-6 rounded-full bg-primary flex items-center justify-center animate-pulse">
                      <span className="material-symbols-outlined text-white text-[16px]">play_arrow</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">Ao Vivo</span>
                    <p className="text-[#111318] dark:text-white text-lg font-bold">{item.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{item.estimated_minutes} min previsto</p>
                  </div>
                </div>
              );

              if (isCompleted) return (
                <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-700 opacity-60 hover:opacity-100 transition-opacity">
                  <div className="size-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[16px]">check</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium line-through decoration-gray-400">{item.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{Math.floor(item.actual_seconds / 60)}m {item.actual_seconds % 60}s • Concluído</p>
                  </div>
                </div>
              );

              return (
                <div key={item.id} onClick={() => handleJumpToItem(index)}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all cursor-pointer group">
                  <div className="size-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-primary transition-colors">
                    <span className="text-xs font-bold text-gray-500 group-hover:text-white">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold group-hover:text-primary transition-colors">{item.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.estimated_minutes} min • Pendente</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                    <span className="material-symbols-outlined text-primary">play_circle</span>
                  </div>
                </div>
              );
            })}

            <button onClick={finalizeMeeting} disabled={finalizing}
              className="p-4 rounded-xl border-2 border-dashed border-red-300 dark:border-red-700 flex items-center justify-center gap-2 text-red-500 dark:text-red-400 text-sm cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50">
              <span className="material-symbols-outlined">stop_circle</span>
              {finalizing ? 'Finalizando...' : 'Finalizar Reunião'}
            </button>
          </div>

          {/* Progress bar */}
          <div className="p-4 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Progresso</span>
              <span>{Math.round((items.filter(i => i.status === 'completed').length / items.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${Math.round((items.filter(i => i.status === 'completed').length / items.length) * 100)}%` }} />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default LiveMeeting;
