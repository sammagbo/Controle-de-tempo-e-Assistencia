import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface AttendanceRecord {
  id: string;
  presencial: number;
  zoom: number;
  created_at: string;
  meeting_id?: string;
}

const AttendanceCounter: React.FC = () => {
  const navigate = useNavigate();
  const [presencial, setPresencial] = useState(0);
  const [zoom, setZoom] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [savedPresencial, setSavedPresencial] = useState(0);
  const [savedZoom, setSavedZoom] = useState(0);
  const [editMode, setEditMode] = useState(false);

  const total = presencial + zoom;

  // Fetch today's attendance records on mount
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

      const { data, error } = await supabase
        .from('attendance')
        .select('id, presencial, zoom, created_at, meeting_id')
        .gte('created_at', startOfDay)
        .lt('created_at', endOfDay)
        .order('created_at', { ascending: false });

      if (error) {
        // Fallback for old schema
        const { data: oldData } = await supabase
          .from('attendance')
          .select('id, count, created_at, meeting_id')
          .gte('created_at', startOfDay)
          .lt('created_at', endOfDay)
          .order('created_at', { ascending: false });

        if (oldData && oldData.length > 0) {
          const converted = oldData.map((r: any) => ({
            ...r,
            presencial: r.count || 0,
            zoom: 0
          }));
          setHistory(converted);
          setSavedPresencial(converted[0].presencial);
          setSavedZoom(0);
          setLastSavedAt(converted[0].created_at);
        }
      } else if (data) {
        setHistory(data);
        if (data.length > 0) {
          setSavedPresencial(data[0].presencial || 0);
          setSavedZoom(data[0].zoom || 0);
          setLastSavedAt(data[0].created_at);
        }
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  const saveAttendance = async () => {
    if (saving) return;
    setSaving(true);

    const activeMeetingId = localStorage.getItem('active_meeting_id');
    const activeTimer = localStorage.getItem('timer_start_timestamp');

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        meeting_id: activeMeetingId || null,
        presencial,
        zoom,
        count: presencial + zoom  // Include total count for compatibility
      })
      .select('id, presencial, zoom, count, created_at')
      .single();

    if (error) {
      // Fallback
      const { data: oldData } = await supabase
        .from('attendance')
        .insert({ meeting_id: activeMeetingId || null, count: total })
        .select('id, count, created_at')
        .single();

      if (oldData) {
        setHistory([{ ...oldData, presencial: total, zoom: 0 } as any, ...history]);
        setLastSavedAt(oldData.created_at);
      } else {
        alert('Erro ao salvar.');
      }
    } else if (data) {
      setHistory([data as AttendanceRecord, ...history]);
      setLastSavedAt(data.created_at);

      // If we are in an active meeting context (by ID or active timer), return to live
      if (activeMeetingId || activeTimer) {
        navigate('/live');
      } else {
        alert('Assistência salva com sucesso!');
      }
    }
    setSaving(false);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const shareWhatsApp = () => {
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const message = `*Assistência ${today}*%0A%0APresencial: *${presencial}*%0AZoom: *${zoom}*%0A%0ATotal: *${total}*`;
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
          <p className="mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden h-screen w-full flex flex-col">
      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e2736]">
        <button onClick={() => {
          if (localStorage.getItem('active_meeting_id')) {
            navigate('/live');
          } else {
            navigate('/');
          }
        }} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-bold">Cancelar / Voltar</span>
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">groups</span>
          Assistência
        </h1>
        <div className="w-20"></div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Counter */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Date */}
          <div className="mb-6 px-4 py-2 bg-primary/10 rounded-full">
            <span className="text-primary font-bold">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>

          {/* Presencial Counter - Always Visible */}
          <div
            onClick={() => setPresencial(prev => prev + 1)}
            className="cursor-pointer active:scale-95 transition-transform text-center mb-6 select-none bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-8 shadow-2xl shadow-blue-500/30"
          >
            <p className="text-white/80 text-lg uppercase tracking-widest font-bold mb-4">👥 Presencial</p>
            <span className="text-[120px] sm:text-[180px] font-black leading-none text-white drop-shadow-lg">{presencial}</span>
            <p className="text-white/70 text-base mt-4 font-medium">Toque para +1</p>
          </div>

          {/* -1 Button for Presencial */}
          <button
            onClick={() => setPresencial(prev => Math.max(0, prev - 1))}
            className="mb-8 flex items-center gap-2 px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold hover:bg-red-200 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined">remove</span>
            <span>-1</span>
          </button>

          {/* Zoom Section - Hidden by default */}
          {!showZoom ? (
            <button
              onClick={() => setShowZoom(true)}
              className="mb-6 flex items-center gap-2 px-6 py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl font-bold hover:bg-purple-200 transition-colors"
            >
              <span className="material-symbols-outlined">videocam</span>
              Adicionar Zoom
            </button>
          ) : (
            <div className="mb-6 p-6 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500">
              <p className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase text-center mb-3">Zoom</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setZoom(prev => Math.max(0, prev - 1))}
                  className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg text-purple-700 dark:text-purple-300 active:scale-95"
                >
                  <span className="material-symbols-outlined">remove</span>
                </button>
                <input
                  type="number"
                  value={zoom}
                  onChange={(e) => setZoom(parseInt(e.target.value) || 0)}
                  className="w-24 text-5xl font-black text-purple-600 dark:text-purple-400 bg-transparent text-center border-b-4 border-purple-300 focus:border-purple-500 outline-none"
                  min="0"
                />
                <button
                  onClick={() => setZoom(prev => prev + 1)}
                  className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg text-purple-700 dark:text-purple-300 active:scale-95"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              </div>
              <p className="text-xs text-purple-400 mt-2 text-center">Digite ou toque +/-</p>
            </div>
          )}

          {/* Total - Only show when Zoom is visible */}
          {showZoom && (
            <div className="mb-6 px-8 py-4 bg-green-100 dark:bg-green-900/30 rounded-2xl">
              <p className="text-sm font-bold text-green-700 dark:text-green-400 uppercase text-center">Total</p>
              <span className="text-5xl font-black text-green-600 dark:text-green-400 block text-center">{total}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <button
              onClick={saveAttendance}
              disabled={saving}
              className="flex items-center gap-3 px-8 py-4 bg-primary hover:bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined">save</span>
              )}
              <span>{saving ? 'Salvando...' : 'Salvar'}</span>
            </button>

            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-95"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => { setPresencial(0); setZoom(0); setShowZoom(false); }}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined">restart_alt</span>
              <span>Zerar</span>
            </button>
          </div>

          {lastSavedAt && (
            <p className="mt-4 text-sm text-gray-500">
              Última contagem: {formatTime(lastSavedAt)}
            </p>
          )}
        </main>

        {/* Right Sidebar: Saved Attendance */}
        {(savedPresencial > 0 || savedZoom > 0) && (
          <aside
            className="w-28 sm:w-36 bg-green-50 dark:bg-green-900/20 border-l border-green-200 dark:border-green-800 flex flex-col items-center justify-center p-3 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            onClick={() => {
              setPresencial(savedPresencial);
              setZoom(savedZoom);
              if (savedZoom > 0) setShowZoom(true);
            }}
          >
            <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase mb-2 text-center">✅ Salvo</p>
            <span className="text-3xl sm:text-4xl font-black text-green-600 dark:text-green-400">{savedPresencial + savedZoom}</span>
            {savedZoom > 0 && (
              <p className="text-[10px] text-green-500 mt-1">{savedPresencial}+{savedZoom}</p>
            )}
            <p className="text-[10px] text-green-500 mt-2 text-center">Toque para editar</p>
          </aside>
        )}
      </div>
    </div>
  );
};

export default AttendanceCounter;