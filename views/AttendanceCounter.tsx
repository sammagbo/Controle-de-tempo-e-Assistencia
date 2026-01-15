import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CURRENT_USER } from '../types';

const AttendanceCounter: React.FC = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(115);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => Math.max(0, prev - 1));
  const reset = () => setCount(0);

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-white overflow-hidden h-screen w-full flex">
      {/* Side Navigation */}
      <aside className="w-64 hidden md:flex flex-col bg-white dark:bg-[#1e2736] border-r border-slate-200 dark:border-slate-800 p-4 justify-between h-full z-10">
        <div className="flex flex-col gap-6">
          {/* User Profile / Branding */}
          <div className="flex items-center gap-3 px-2">
            <div 
              className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-primary/20" 
              style={{ backgroundImage: `url("${CURRENT_USER.avatarUrl}")` }}
            ></div>
            <div className="flex flex-col">
              <h1 className="text-slate-900 dark:text-white text-base font-bold leading-normal">MeetCount</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">Admin View</p>
            </div>
          </div>
          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            <a onClick={(e) => {e.preventDefault(); navigate('/live')}} href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary group transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[24px]">schedule</span>
              <span className="text-sm font-medium">Current Session</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <span className="material-symbols-outlined text-[24px]">history</span>
              <span className="text-sm font-medium">History</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <span className="material-symbols-outlined text-[24px]">calendar_today</span>
              <span className="text-sm font-medium">Schedule</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <span className="material-symbols-outlined text-[24px]">settings</span>
              <span className="text-sm font-medium">Settings</span>
            </a>
          </nav>
        </div>
        {/* Bottom Action */}
        <div className="px-2">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 px-3 py-2 w-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col h-full min-h-[600px]">
            {/* Header & Meta Data */}
            <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black tracking-tight">Q3 Board Meeting</h2>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm md:text-base">
                  <span className="material-symbols-outlined text-lg">meeting_room</span>
                  <span>Room B</span>
                  <span className="mx-1">•</span>
                  <span>Stakeholder Review</span>
                </div>
              </div>
              {/* Timer Widget */}
              <div className="flex items-center gap-3 bg-white dark:bg-[#1e2736] p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col items-center">
                  <span className="text-slate-900 dark:text-white text-xl font-bold font-mono">00</span>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">Hr</span>
                </div>
                <span className="text-slate-300 text-xl">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-slate-900 dark:text-white text-xl font-bold font-mono">45</span>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">Min</span>
                </div>
                <span className="text-slate-300 text-xl">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-primary text-xl font-bold font-mono">12</span>
                  <span className="text-[10px] uppercase text-primary/80 font-semibold">Sec</span>
                </div>
              </div>
            </header>

            {/* Main Counter Interface */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Primary Hit Area (+1) */}
              <button 
                onClick={increment}
                className="group relative flex flex-col flex-1 items-center justify-center min-h-[300px] bg-white dark:bg-[#1e2736] rounded-2xl border-2 border-transparent hover:border-primary shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-200 cursor-pointer active:scale-[0.99] active:bg-slate-50 dark:active:bg-[#252f3e]"
              >
                {/* Ripple Effect visual cue */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div>
                {/* Counter Number */}
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-[140px] md:text-[180px] leading-none font-black text-slate-900 dark:text-white group-active:text-primary transition-colors tracking-tighter tabular-nums select-none">{count}</span>
                  <span className="text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400 mt-2">Attendees Present</span>
                </div>
                {/* Floating Action Icon */}
                <div className="absolute top-6 right-6 p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-3xl">add</span>
                </div>
                <p className="absolute bottom-6 text-sm text-slate-400 font-medium opacity-60 group-hover:opacity-100 transition-opacity">Tap anywhere to count (+1)</p>
              </button>

              {/* Secondary Controls Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Decrement Button (-1) */}
                <button 
                  onClick={(e) => { e.stopPropagation(); decrement(); }}
                  className="md:col-span-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors active:scale-95"
                >
                  <span className="material-symbols-outlined">remove_circle</span>
                  <span>Remove (-1)</span>
                </button>
                {/* Spacer or Stats */}
                <div className="hidden md:flex md:col-span-1 items-center justify-center gap-2 text-slate-400 text-sm">
                  <span className="material-symbols-outlined text-lg">info</span>
                  <span>Auto-saving enabled</span>
                </div>
                {/* Reset / Menu */}
                <button 
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="md:col-span-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-white dark:bg-[#1e2736] text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors active:scale-95"
                >
                  <span className="material-symbols-outlined">restart_alt</span>
                  <span>Reset Count</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer Action */}
        <div className="p-4 md:p-6 bg-white/80 dark:bg-[#101622]/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-20">
          <div className="max-w-4xl mx-auto">
            <button 
              onClick={() => navigate('/report')}
              className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-blue-600 text-white text-xl font-bold py-5 px-8 rounded-xl shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
            >
              <span className="material-symbols-outlined text-2xl">save</span>
              Save Attendance
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AttendanceCounter;