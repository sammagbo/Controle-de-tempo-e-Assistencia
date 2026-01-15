import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AttendanceCounter: React.FC = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const savingRef = useRef(false);

  // Fetch or create attendance record on mount
  useEffect(() => {
    const storedMeetingId = localStorage.getItem('active_meeting_id');
    if (!storedMeetingId) {
      alert('No active meeting found.');
      navigate('/live');
      return;
    }
    setMeetingId(storedMeetingId);

    const fetchOrCreateAttendance = async () => {
      setLoading(true);

      // Try to fetch existing attendance record
      const { data, error } = await supabase
        .from('attendance')
        .select('id, count')
        .eq('meeting_id', storedMeetingId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching attendance:', error);
      } else if (data) {
        // Existing record found
        setAttendanceId(data.id);
        setCount(data.count || 0);
      } else {
        // No record exists, create one
        const { data: newData, error: insertError } = await supabase
          .from('attendance')
          .insert({ meeting_id: storedMeetingId, count: 0 })
          .select('id')
          .single();

        if (insertError) {
          console.error('Error creating attendance:', insertError);
        } else if (newData) {
          setAttendanceId(newData.id);
          setCount(0);
        }
      }
      setLoading(false);
    };

    fetchOrCreateAttendance();
  }, [navigate]);

  // Update attendance in database
  const updateCount = async (newCount: number) => {
    if (!attendanceId || savingRef.current) return;

    savingRef.current = true;
    const { error } = await supabase
      .from('attendance')
      .update({ count: newCount })
      .eq('id', attendanceId);

    if (error) {
      console.error('Error updating attendance:', error);
    }
    savingRef.current = false;
  };

  const increment = () => {
    const newCount = count + 1;
    setCount(newCount);
    updateCount(newCount);
  };

  const decrement = () => {
    const newCount = Math.max(0, count - 1);
    setCount(newCount);
    updateCount(newCount);
  };

  if (loading) {
    return (
      <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          <p className="mt-2">Carregando assistência...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden h-screen w-full flex flex-col">
      {/* Simple Header */}
      <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e2736]">
        <button onClick={() => navigate('/live')} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-bold">Voltar para Reunião</span>
        </button>
        <h1 className="text-xl font-bold">Assistência</h1>
        <div className="w-20"></div> {/* Spacer for balance */}
      </header>

      {/* Main Interaction Area - Tap Anywhere to Add */}
      <main className="flex-1 flex flex-col relative">
        <div
          onClick={increment}
          className="flex-1 flex flex-col items-center justify-center cursor-pointer active:bg-gray-50 dark:active:bg-gray-800 transition-colors select-none"
        >
          <p className="text-gray-500 dark:text-gray-400 text-lg uppercase tracking-widest font-bold mb-4">Toque para Contar</p>
          <span className="text-[180px] sm:text-[240px] font-black leading-none text-primary user-select-none">{count}</span>
          <p className="text-gray-400 mt-4 animate-pulse">Toque em qualquer lugar (+1)</p>
        </div>

        {/* Floating Decrement Button */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none">
          <button
            onClick={(e) => { e.stopPropagation(); decrement(); }}
            className="pointer-events-auto flex items-center gap-3 px-8 py-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full font-bold text-lg shadow-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-3xl">remove</span>
            <span>Remover (-1)</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default AttendanceCounter;