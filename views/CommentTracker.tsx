import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const CommentTracker: React.FC = () => {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [agendaItemId, setAgendaItemId] = useState<string | null>(null);
  const timerRef = useRef<number>(0);

  const commentTitle = "Live Comment / Intervention";

  // Get meeting_id and agenda_item_id on mount
  useEffect(() => {
    const storedMeetingId = localStorage.getItem('active_meeting_id');
    const storedAgendaItemId = localStorage.getItem('active_agenda_item_id');

    if (storedMeetingId) {
      setMeetingId(storedMeetingId);
    }
    if (storedAgendaItemId) {
      setAgendaItemId(storedAgendaItemId);
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => {
          timerRef.current = s + 1;
          return s + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const displayMinutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const displaySeconds = (seconds % 60).toString().padStart(2, '0');

  const handleEndComment = async () => {
    if (!meetingId) {
      navigate('/live');
      return;
    }

    setSaving(true);
    const returnToNext = localStorage.getItem('return_to_next') === 'true';

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          meeting_id: meetingId,
          agenda_item_id: agendaItemId || null,
          duration_seconds: timerRef.current,
          comment_type: returnToNext ? 'post_student' : 'manual',
        });

      if (error) {
        console.error('Error saving comment:', error);
      }
    } catch (err) {
      console.error('Error saving comment:', err);
    } finally {
      setSaving(false);
      // Clean up flag
      if (returnToNext) {
        localStorage.removeItem('return_to_next');
      }
      navigate('/live');
    }
  };

  const handleReset = () => {
    setSeconds(0);
    timerRef.current = 0;
    setIsActive(false);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display overflow-x-hidden min-h-screen flex flex-col">
      {/* Header / Nav */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb] dark:border-[#2d3748] bg-white dark:bg-[#1a202c]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">comment</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight">Cronômetro de Comentários</h1>
          </div>
        </div>
        <button
          onClick={() => navigate('/live')}
          className="group flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-gray-500 group-hover:text-gray-800 dark:text-gray-400 dark:group-hover:text-white">close</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="relative w-full max-w-4xl flex flex-col items-center gap-10 z-10">
          {/* Context Info Card */}
          <div className="flex flex-col items-center gap-2 text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <span className={`size-2 rounded-full bg-primary ${isActive ? 'animate-pulse' : ''}`}></span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Cronometrando</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {commentTitle}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base">Registrando duração deste comentário</p>
          </div>

          {/* Timer Display - Simplified */}
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {/* Minutes */}
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white dark:bg-[#1a202c] shadow-xl rounded-3xl w-40 h-48 md:w-56 md:h-64 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                  <span className="text-8xl md:text-9xl font-bold text-gray-900 dark:text-white tracking-tighter tabular-nums">{displayMinutes}</span>
                </div>
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Minutos</span>
              </div>
              {/* Separator */}
              <div className="flex flex-col gap-4 py-8">
                <span className="text-6xl text-gray-300 dark:text-gray-600">:</span>
              </div>
              {/* Seconds */}
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white dark:bg-[#1a202c] shadow-xl rounded-3xl w-40 h-48 md:w-56 md:h-64 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                  <span className="text-8xl md:text-9xl font-bold text-primary tracking-tighter tabular-nums">{displaySeconds}</span>
                </div>
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Segundos</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-lg mt-8">
            <button
              onClick={() => setIsActive(!isActive)}
              className="flex-1 h-20 bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold hover:shadow-lg transition-all"
            >
              <span className="material-symbols-outlined text-3xl">{isActive ? 'pause' : 'play_arrow'}</span>
              <span>{isActive ? 'Pausar' : 'Continuar'}</span>
            </button>
            <button
              onClick={handleEndComment}
              disabled={saving}
              className="flex-[2] h-20 bg-primary hover:bg-blue-600 text-white rounded-2xl flex items-center justify-center gap-3 text-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-3xl">check_circle</span>
              <span>{saving ? 'Salvando...' : 'Finalizar Comentário'}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommentTracker;