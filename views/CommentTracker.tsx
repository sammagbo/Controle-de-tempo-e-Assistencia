import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CommentTracker: React.FC = () => {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(165); // 02:45
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const displayMinutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const displaySeconds = (seconds % 60).toString().padStart(2, '0');

  const handleReset = () => {
    setSeconds(0);
    setIsActive(false);
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display overflow-x-hidden min-h-screen flex flex-col">
      {/* Header / Nav */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb] dark:border-[#2d3748] bg-white dark:bg-[#1a202c]">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-2xl">timer</span>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight">Comment Tracker</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Meeting #2024-10-24</p>
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
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
          style={{ backgroundImage: 'radial-gradient(#135bec 1px, transparent 1px)', backgroundSize: '32px 32px' }}
        ></div>

        <div className="relative w-full max-w-4xl flex flex-col items-center gap-10 z-10">
          {/* Context Info Card */}
          <div className="flex flex-col items-center gap-2 text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
              <span className={`size-2 rounded-full bg-primary ${isActive ? 'animate-pulse' : ''}`}></span>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Live Intervention</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Agenda Item 4: Budget Review
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Speaker: Dr. Sarah Mitchell</p>
          </div>

          {/* Timer Display */}
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-center gap-4 md:gap-8">
              {/* Minutes */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative bg-white dark:bg-[#1a202c] shadow-xl shadow-gray-200/50 dark:shadow-black/20 rounded-3xl w-40 h-48 md:w-56 md:h-64 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                  <span className="text-8xl md:text-9xl font-bold text-gray-900 dark:text-white tracking-tighter tabular-nums">{displayMinutes}</span>
                </div>
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Minutes</span>
              </div>
              {/* Separator */}
              <div className="flex flex-col gap-4 py-8">
                <div className="size-3 md:size-4 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <div className="size-3 md:size-4 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              </div>
              {/* Seconds */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative bg-white dark:bg-[#1a202c] shadow-xl shadow-gray-200/50 dark:shadow-black/20 rounded-3xl w-40 h-48 md:w-56 md:h-64 flex items-center justify-center border border-gray-100 dark:border-gray-800 overflow-hidden">
                  {/* Subtle Progress bg inside numbers */}
                  <div className="absolute bottom-0 left-0 w-full bg-primary/5 h-3/4"></div>
                  <span className="relative text-8xl md:text-9xl font-bold text-primary tracking-tighter tabular-nums">{displaySeconds}</span>
                </div>
                <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Seconds</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-lg mt-4">
            {/* Pause Button */}
            <button 
              onClick={() => setIsActive(!isActive)}
              className="group flex flex-col items-center justify-center size-20 md:size-24 rounded-2xl bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:shadow-lg dark:hover:shadow-primary/10 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-4xl text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors">
                {isActive ? 'pause' : 'play_arrow'}
              </span>
              <span className="text-xs font-bold text-gray-500 group-hover:text-primary mt-1">{isActive ? 'Pause' : 'Resume'}</span>
            </button>
            {/* End Comment / Stop Button (Primary) */}
            <button 
               onClick={() => navigate('/live')}
              className="grow h-20 md:h-24 px-8 bg-primary hover:bg-blue-600 active:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 transition-all transform active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-3xl">stop_circle</span>
              <span className="text-lg md:text-xl font-bold">End Comment</span>
            </button>
            {/* Restart/Reset Button */}
            <button 
              onClick={handleReset}
              className="group flex flex-col items-center justify-center size-20 md:size-24 rounded-2xl bg-white dark:bg-[#1a202c] border border-gray-200 dark:border-gray-700 hover:border-red-500/50 hover:shadow-lg transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-4xl text-gray-700 dark:text-gray-200 group-hover:text-red-500 transition-colors">restart_alt</span>
              <span className="text-xs font-bold text-gray-500 group-hover:text-red-500 mt-1">Reset</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer Status */}
      <footer className="w-full py-4 text-center border-t border-[#e5e7eb] dark:border-[#2d3748] bg-white dark:bg-[#1a202c]">
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">mic</span>
            <span>Microphone Active</span>
          </div>
          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">group</span>
            <span>24 Attendees</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CommentTracker;