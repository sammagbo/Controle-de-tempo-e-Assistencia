import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { MEETING_SECTIONS, SECTION_COLORS, SectionKey } from '../lib/meetingTemplate';

interface LiveAgendaItem {
  id: string;
  title: string;
  estimated_minutes: number;
  position: number;
  status: 'completed' | 'active' | 'upcoming';
  actual_seconds: number;
  section: SectionKey;
  allows_comments: boolean;
  requires_post_comment: boolean;
  assigned_names?: string;
}

const LiveMeeting: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<LiveAgendaItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Initialize isRunning from localStorage to persist across navigation
  const [isRunning, setIsRunning] = useState(() => {
    const storedStartTime = localStorage.getItem('timer_start_timestamp');
    return !!storedStartTime;
  });

  const [loading, setLoading] = useState(true);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);

  // Timer state - initialize from localStorage
  const [totalSeconds, setTotalSeconds] = useState(() => {
    const storedStartTime = parseInt(localStorage.getItem('timer_start_timestamp') || '0');
    const storedBaseSeconds = parseInt(localStorage.getItem('timer_base_seconds') || '0');
    if (storedStartTime) {
      const elapsed = Math.floor((Date.now() - storedStartTime) / 1000);
      return storedBaseSeconds + elapsed;
    }
    return 0;
  });
  const timerRef = useRef<number>(0);

  // Name Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingNameValue, setEditingNameValue] = useState('');

  const startEditingName = () => {
    if (items[activeIndex]) {
      setEditingNameValue(items[activeIndex].assigned_names || '');
      setIsEditingName(true);
    }
  };

  const saveEditedName = async () => {
    const activeItem = items[activeIndex];
    if (activeItem) {
      const { error } = await supabase
        .from('agenda_items')
        .update({ assigned_names: editingNameValue })
        .eq('id', activeItem.id);

      if (error) {
        console.error('Error updating name:', error);
        alert('Erro ao salvar nome.');
      } else {
        // Update local state
        const newItems = [...items];
        if (items[activeIndex]) {
          newItems[activeIndex].assigned_names = editingNameValue;
          setItems(newItems);
        }
        setIsEditingName(false);
      }
    }
  };

  // Fetch agenda items on mount
  useEffect(() => {
    const storedMeetingId = localStorage.getItem('active_meeting_id');
    if (!storedMeetingId) {
      alert('No active meeting found.');
      navigate('/');
      return;
    }
    setMeetingId(storedMeetingId);

    const fetchAgendaItems = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('agenda_items')
        .select('id, title, estimated_minutes, position, status, actual_seconds, section, allows_comments, requires_post_comment')
        .eq('meeting_id', storedMeetingId)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching agenda items:', error);
      } else if (data && data.length > 0) {
        setItems(data);
        // Find the active item index
        const activeIdx = data.findIndex(item => item.status === 'active');
        if (activeIdx >= 0) {
          setActiveIndex(activeIdx);
          setTotalSeconds(data[activeIdx].actual_seconds || 0);
        }
      }
      setLoading(false);
    };

    fetchAgendaItems();
  }, [navigate]);

  // Timer logic with persistence
  useEffect(() => {
    let interval: any;

    if (isRunning) {
      // Defined outside loop to handle init, but updated inside loop
      let startTime = parseInt(localStorage.getItem('timer_start_timestamp') || '0');
      let baseSeconds = parseInt(localStorage.getItem('timer_base_seconds') || '0');

      if (!startTime) {
        startTime = Date.now();
        baseSeconds = totalSeconds;
        localStorage.setItem('timer_start_timestamp', startTime.toString());
        localStorage.setItem('timer_base_seconds', baseSeconds.toString());
      }

      const updateTimer = () => {
        // Read fresh values to handle hot-swaps (Next/Jump)
        const currentStart = parseInt(localStorage.getItem('timer_start_timestamp') || '0');
        const currentBase = parseInt(localStorage.getItem('timer_base_seconds') || '0');

        // If values are missing/invalid (cleared), use local fallback or stop
        if (!currentStart) return;

        const now = Date.now();
        const elapsed = Math.floor((now - currentStart) / 1000);
        const newTotal = currentBase + elapsed;

        setTotalSeconds(newTotal);
        timerRef.current = newTotal;
      };

      updateTimer(); // Update immediately
      interval = setInterval(updateTimer, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  // Check for persistent state on mount/items load
  useEffect(() => {
    if (items.length > 0 && !isRunning) {
      const storedStartTime = localStorage.getItem('timer_start_timestamp');
      const storedActiveItemId = localStorage.getItem('timer_active_item_id');

      if (storedStartTime && storedActiveItemId) {
        // We have a running timer state
        const activeIdx = items.findIndex(i => i.id === storedActiveItemId);
        if (activeIdx >= 0) {
          if (activeIdx !== activeIndex) {
            setActiveIndex(activeIdx);
          }
          setIsRunning(true);
          // Total seconds will be corrected by the timer effect
        } else {
          // Item mismatch, clear invalid state
          localStorage.removeItem('timer_start_timestamp');
          localStorage.removeItem('timer_base_seconds');
          localStorage.removeItem('timer_active_item_id');
        }
      }
    }
  }, [items]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (isRunning) {
            handlePause();
          } else {
            handleStart();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (activeIndex < items.length - 1) {
            handleNext();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (activeIndex > 0) {
            handleJumpToItem(activeIndex - 1);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, activeIndex, items.length]);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad = (num: number) => num.toString().padStart(2, '0');

  // Save actual_seconds to database
  const saveActualSeconds = async (itemId: string, seconds: number) => {
    const { error } = await supabase
      .from('agenda_items')
      .update({ actual_seconds: seconds })
      .eq('id', itemId);

    if (error) {
      console.error('Error saving actual_seconds:', error);
    }
  };

  // Update item status in database
  const updateItemStatus = async (itemId: string, status: string) => {
    const { error } = await supabase
      .from('agenda_items')
      .update({ status })
      .eq('id', itemId);

    if (error) {
      console.error('Error updating status:', error);
    }
  };

  // Finalize meeting - calculate total duration and save
  const finalizeMeeting = async () => {
    if (!meetingId) return;

    setFinalizing(true);
    setIsRunning(false);

    try {
      // Save current item's time if it exists
      if (items[activeIndex]) {
        await saveActualSeconds(items[activeIndex].id, timerRef.current);
        await updateItemStatus(items[activeIndex].id, 'completed');
      }

      // Calculate total duration from agenda_items
      const { data: agendaData } = await supabase
        .from('agenda_items')
        .select('actual_seconds')
        .eq('meeting_id', meetingId);

      const agendaTotalSeconds = agendaData?.reduce((sum, item) => sum + (item.actual_seconds || 0), 0) || 0;

      // Calculate total duration from comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('duration_seconds')
        .eq('meeting_id', meetingId);

      const commentsTotalSeconds = commentsData?.reduce((sum, item) => sum + (item.duration_seconds || 0), 0) || 0;

      const totalDurationSeconds = agendaTotalSeconds + commentsTotalSeconds;

      // Update meeting with finished_at and total_duration_seconds
      const { error } = await supabase
        .from('meetings')
        .update({
          finished_at: new Date().toISOString(),
          total_duration_seconds: totalDurationSeconds,
        })
        .eq('id', meetingId);

      if (error) {
        console.error('Error finalizing meeting:', error);
        alert('Erro ao finalizar reunião. Tente novamente.');
      } else {
        // Navigate to report
        navigate('/report');
      }
    } catch (err) {
      console.error('Error finalizing meeting:', err);
    } finally {
      setFinalizing(false);
    }
  };

  const handleStart = async () => {
    const currentItem = items[activeIndex];
    if (currentItem) {
      await updateItemStatus(currentItem.id, 'active');

      // Set persistence
      localStorage.setItem('timer_start_timestamp', Date.now().toString());
      localStorage.setItem('timer_base_seconds', totalSeconds.toString());
      localStorage.setItem('timer_active_item_id', currentItem.id);
    }
    setIsRunning(true);
  };

  const handlePause = async () => {
    setIsRunning(false);
    // Clear persistence
    localStorage.removeItem('timer_start_timestamp');
    localStorage.removeItem('timer_base_seconds');
    localStorage.removeItem('timer_active_item_id');

    // Save current time when pausing
    if (items[activeIndex]) {
      await saveActualSeconds(items[activeIndex].id, timerRef.current);
    }
  };

  const handleNext = async () => {
    // Save actual_seconds for current item and mark as completed
    if (items[activeIndex]) {
      await saveActualSeconds(items[activeIndex].id, timerRef.current);
      await updateItemStatus(items[activeIndex].id, 'completed');
    }

    if (activeIndex < items.length - 1) {
      const nextIndex = activeIndex + 1;

      // Activate next item in DB immediately so it loads correctly on return
      await updateItemStatus(items[nextIndex].id, 'active');

      // Check if current item requires a post-comment (Student Part)
      if (items[activeIndex] && items[activeIndex].requires_post_comment) {
        setIsRunning(false);
        // Clear persistence
        localStorage.removeItem('timer_start_timestamp');
        localStorage.removeItem('timer_base_seconds');
        localStorage.removeItem('timer_active_item_id');

        // Store ID of the item being commented on
        localStorage.setItem('active_agenda_item_id', items[activeIndex].id);
        // Flag to tell CommentTracker to return to LiveMeeting immediately
        localStorage.setItem('return_to_next', 'true');
        navigate('/comment');
        return;
      }

      // Normal transition
      const newItems = [...items];
      if (items[activeIndex]) newItems[activeIndex].status = 'completed';
      newItems[activeIndex].actual_seconds = timerRef.current;
      newItems[nextIndex].status = 'active';
      setItems(newItems);
      setActiveIndex(nextIndex);

      // Reset timer
      setTotalSeconds(0);
      timerRef.current = 0;

      // Update persistence for next item if running
      if (isRunning) {
        localStorage.setItem('timer_start_timestamp', Date.now().toString());
        localStorage.setItem('timer_base_seconds', '0');
        localStorage.setItem('timer_active_item_id', items[nextIndex].id);
      } else {
        // Just clear if not running
        localStorage.removeItem('timer_start_timestamp');
        localStorage.removeItem('timer_base_seconds');
        localStorage.removeItem('timer_active_item_id');
      }
    } else {
      setIsRunning(false);
      localStorage.removeItem('timer_start_timestamp');
      localStorage.removeItem('timer_base_seconds');
      localStorage.removeItem('timer_active_item_id');
    }
  };

  const handleJumpToItem = async (index: number) => {
    if (index === activeIndex) return;

    // Save current item state just in case
    if (items[activeIndex]) {
      await saveActualSeconds(items[activeIndex].id, timerRef.current);
    }

    // Stop current timer & clear persistence
    setIsRunning(false);
    localStorage.removeItem('timer_start_timestamp');
    localStorage.removeItem('timer_base_seconds');
    localStorage.removeItem('timer_active_item_id');

    // Prepare switch
    const newItem = items[index];
    if (newItem) {
      // Update new item status to active
      await updateItemStatus(newItem.id, 'active');

      // Update local state
      setActiveIndex(index);
      setTotalSeconds(newItem.actual_seconds || 0);
      timerRef.current = newItem.actual_seconds || 0;
    }
  };


  const activeItem = items[activeIndex];

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

  if (items.length === 0) {
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

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display overflow-hidden h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="shrink-0 flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e5e7eb] dark:border-[#2d3748] px-6 py-3 bg-surface-light dark:bg-surface-dark z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/setup')} className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[#111318] dark:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Reunião ao Vivo</h2>
        </div>
        <div className="flex flex-1 justify-end items-center gap-6">
          <div className="flex gap-2">
            {/* Botão Modo Telão */}
            <button onClick={() => navigate('/display')}
              className="flex items-center justify-center overflow-hidden rounded-lg h-9 px-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-medium leading-normal hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Modo Telão (Projeção)"
            >
              <span className="material-symbols-outlined text-[18px]">tv</span>
            </button>
            <button onClick={() => navigate('/attendance')}
              className="flex items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary/10 text-primary dark:text-blue-400 text-sm font-bold leading-normal tracking-[0.015em] border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <span className="truncate">Assistência</span>
            </button>
            {/* Botão de comentário - só aparece se a parte atual permite */}
            {activeItem?.allows_comments && (
              <button
                onClick={() => {
                  const activeItemData = items[activeIndex];
                  if (activeItemData) {
                    localStorage.setItem('active_agenda_item_id', activeItemData.id);
                  }
                  navigate('/comment');
                }}
                className="flex items-center gap-2 overflow-hidden rounded-lg h-9 px-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                <span className="text-sm font-bold">Comentário</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area: Split View */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left/Top Panel: Active Item & Timer (Hero Section) */}
        <section className="flex-1 flex flex-col items-center overflow-y-auto p-4 lg:p-10 relative bg-surface-light dark:bg-surface-dark shadow-sm z-10 lg:border-r border-gray-200 dark:border-gray-800">
          <div className="w-full max-w-3xl flex flex-col items-center gap-8 animate-fade-in">
            {/* Topic Header */}
            <div className="text-center w-full space-y-4">
              {/* Section Badge */}
              {activeItem?.section && (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${SECTION_COLORS[activeItem.section].bg} ${SECTION_COLORS[activeItem.section].text} text-xs font-bold uppercase tracking-wider`}>
                  <span className="material-symbols-outlined text-sm">{MEETING_SECTIONS[activeItem.section].icon}</span>
                  {MEETING_SECTIONS[activeItem.section].label}
                </div>
              )}
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-wider ml-2">
                <span className={`w-2 h-2 rounded-full bg-green-500 ${isRunning ? 'animate-pulse' : ''}`}></span>
                Ao Vivo
              </div>
              <h1 className="text-[#111318] dark:text-white tracking-tight text-3xl md:text-5xl font-bold leading-tight">
                {activeItem?.title || 'Nenhuma parte'}
              </h1>

              {/* Name Display / Editing */}
              <div className="min-h-[40px] flex items-center justify-center">
                {isEditingName ? (
                  <div className="flex items-center gap-2 animate-fade-in">
                    <input
                      type="text"
                      value={editingNameValue}
                      onChange={(e) => setEditingNameValue(e.target.value)}
                      className="border border-primary rounded-lg px-3 py-1 text-lg text-center dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
                      placeholder="Nome do irmão"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditedName();
                        if (e.key === 'Escape') setIsEditingName(false);
                      }}
                    />
                    <button
                      onClick={saveEditedName}
                      className="p-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                    >
                      <span className="material-symbols-outlined text-xl">check</span>
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="p-1.5 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                    >
                      <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={startEditingName}
                    className="group flex items-center justify-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    title="Clique para editar o nome"
                  >
                    <p className="text-primary dark:text-blue-400 text-lg font-medium">
                      <span className="material-symbols-outlined align-middle text-lg mr-1">person</span>
                      {activeItem?.assigned_names || <span className="italic opacity-50">Sem designação</span>}
                    </p>
                    <span className="material-symbols-outlined text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity text-sm">edit</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mega Timer - Minutes and Seconds ONLY */}
            <div className="flex gap-3 sm:gap-6 py-4">
              {/* Minutes */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-32 sm:h-48 w-28 sm:w-40 items-center justify-center rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 border-4 border-primary shadow-2xl shadow-primary/20">
                  <p className="text-primary dark:text-blue-400 text-6xl sm:text-8xl font-bold leading-none tracking-tight font-mono">{pad(minutes)}</p>
                </div>
                <p className="text-primary dark:text-blue-400 text-sm font-bold uppercase tracking-wider">Minutos</p>
              </div>
              {/* Separator */}
              <div className="flex h-32 sm:h-48 items-center justify-center pb-8">
                <span className="text-6xl sm:text-7xl font-bold text-gray-300 dark:text-gray-600">:</span>
              </div>
              {/* Seconds */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-32 sm:h-48 w-28 sm:w-40 items-center justify-center rounded-xl sm:rounded-2xl bg-[#f0f2f4] dark:bg-gray-800 border-2 border-transparent dark:border-gray-700">
                  <p className="text-[#111318] dark:text-white text-6xl sm:text-8xl font-bold leading-none tracking-tight font-mono">{pad(seconds)}</p>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Segundos</p>
              </div>
            </div>

            {/* Primary Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center max-w-[800px] pt-4 sm:pt-8 pb-8 sm:pb-0">
              <div className="flex gap-3 w-full sm:w-auto flex-1">
                <button
                  onClick={handleStart}
                  className={`flex flex-1 min-w-0 h-14 sm:h-16 cursor-pointer items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all active:scale-95 ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isRunning}
                >
                  <span className="material-symbols-outlined text-[24px] sm:text-[28px]">play_arrow</span>
                  <span className="text-lg sm:text-xl font-bold">Iniciar</span>
                </button>

                <button
                  onClick={handlePause}
                  className={`flex flex-1 min-w-0 h-14 sm:h-16 cursor-pointer items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg transition-all active:scale-95 ${!isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isRunning}
                >
                  <span className="material-symbols-outlined text-[24px] sm:text-[28px]">pause</span>
                  <span className="text-lg sm:text-xl font-bold">Pausar</span>
                </button>
              </div>

              <button
                onClick={handleNext}
                className="flex flex-1 min-w-0 h-14 sm:h-16 cursor-pointer items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-all active:scale-95 w-full sm:w-auto"
              >
                <span className="text-lg sm:text-xl font-bold">Próximo</span>
                <span className="material-symbols-outlined text-[24px] sm:text-[28px]">skip_next</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right/Bottom Panel: Agenda List */}
        <aside className="w-full lg:w-[400px] xl:w-[480px] bg-gray-50 dark:bg-[#101622] flex flex-col border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/80 dark:bg-[#101622]/80 backdrop-blur-sm sticky top-0 z-10">
            <h3 className="text-[#111318] dark:text-white text-lg font-bold">Partes da reunião</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
              Item {activeIndex + 1} de {items.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              const isCompleted = item.status === 'completed';

              if (isActive) {
                return (
                  <div key={item.id} className="relative flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-surface-dark border-2 border-primary shadow-md transform scale-[1.02] transition-transform">
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary rounded-l-xl"></div>
                    <div className="flex-shrink-0 mt-1">
                      <div className="size-6 rounded-full bg-primary flex items-center justify-center animate-pulse">
                        <span className="material-symbols-outlined text-white text-[16px]">play_arrow</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-primary uppercase tracking-wide">Ao Vivo</span>
                      </div>
                      <p className="text-[#111318] dark:text-white text-lg font-bold leading-tight">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{item.estimated_minutes} min previsto</p>
                    </div>
                  </div>
                );
              }

              if (isCompleted) {
                return (
                  <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-700 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="flex-shrink-0 mt-1">
                      <div className="size-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[16px] font-bold">check</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[#111318] dark:text-white text-base font-medium line-through decoration-gray-400">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {Math.floor(item.actual_seconds / 60)}m {item.actual_seconds % 60}s • Concluído
                      </p>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  onClick={() => handleJumpToItem(index)}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-blue-500/50 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all cursor-pointer group"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="size-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 group-hover:text-white">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#111318] dark:text-white text-base font-semibold group-hover:text-primary transition-colors">{item.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.estimated_minutes} min • Pendente</p>
                  </div>
                  {/* Play icon on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity self-center">
                    <span className="material-symbols-outlined text-primary">play_circle</span>
                  </div>
                </div>
              );
            })}

            {/* Finalize Meeting Button */}
            <button
              onClick={finalizeMeeting}
              disabled={finalizing}
              className="p-4 rounded-xl border-2 border-dashed border-red-300 dark:border-red-700 flex items-center justify-center gap-2 text-red-500 dark:text-red-400 text-sm cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined">stop_circle</span>
              {finalizing ? 'Finalizando...' : 'Finalizar Reunião'}
            </button>
          </div>

          {/* Bottom Stats in Sidebar */}
          <div className="p-4 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Progress</span>
              <span>{Math.round((items.filter(i => i.status === 'completed').length / items.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.round((items.filter(i => i.status === 'completed').length / items.length) * 100)}%` }}></div>
            </div>
          </div>
        </aside>
      </main>
    </div >
  );
};

export default LiveMeeting;