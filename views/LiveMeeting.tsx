import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_USERS } from '../types';

const LiveMeeting: React.FC = () => {
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(899); // Start at 14:59 for demo

  useEffect(() => {
    let interval: any;
    if (isRunning) {
      interval = setInterval(() => {
        setTotalSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display overflow-hidden h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="shrink-0 flex items-center justify-between whitespace-nowrap border-b border-solid border-[#e5e7eb] dark:border-[#2d3748] px-6 py-3 bg-surface-light dark:bg-surface-dark z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/setup')} className="size-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[#111318] dark:text-white transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Meeting Live Mode</h2>
        </div>
        <div className="flex flex-1 justify-end items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[18px]">event_note</span>
              <span className="text-[#111318] dark:text-white">Q3 Quarterly Review</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
              <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[18px]">schedule</span>
              <span className="text-[#111318] dark:text-white">00:45:00 Total Time</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/attendance')}
              className="flex items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary/10 text-primary dark:text-blue-400 text-sm font-bold leading-normal tracking-[0.015em] border border-primary/20 hover:bg-primary/20 transition-colors"
            >
              <span className="truncate">14/15 Present</span>
            </button>
            <button onClick={() => navigate('/comment')} className="flex size-9 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#f0f2f4] dark:bg-gray-800 text-[#111318] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <span className="material-symbols-outlined text-[20px]">timer</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area: Split View */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left/Top Panel: Active Item & Timer (Hero Section) */}
        <section className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 relative bg-surface-light dark:bg-surface-dark shadow-sm z-10 lg:border-r border-gray-200 dark:border-gray-800">
          <div className="w-full max-w-3xl flex flex-col items-center gap-8 animate-fade-in">
            {/* Topic Header */}
            <div className="text-center w-full space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                <span className={`w-2 h-2 rounded-full bg-primary ${isRunning ? 'animate-pulse' : ''}`}></span>
                Current Topic
              </div>
              <h1 className="text-[#111318] dark:text-white tracking-tight text-3xl md:text-5xl font-bold leading-tight">Financial Performance Review</h1>
              <div className="flex items-center justify-center gap-2 pt-2 text-[#616f89] dark:text-gray-400">
                <span className="material-symbols-outlined text-[20px]">person</span>
                <p className="text-base font-medium">Presenter: Jane Doe - CFO</p>
              </div>
            </div>

            {/* Mega Timer */}
            <div className="flex gap-3 sm:gap-6 py-4">
              {/* Hours */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-24 sm:h-32 w-20 sm:w-28 items-center justify-center rounded-xl sm:rounded-2xl bg-[#f0f2f4] dark:bg-gray-800 border-2 border-transparent dark:border-gray-700">
                  <p className="text-[#111318] dark:text-white text-5xl sm:text-7xl font-bold leading-none tracking-tight font-mono">{pad(hours)}</p>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">Hours</p>
              </div>
              {/* Separator */}
              <div className="flex h-24 sm:h-32 items-center justify-center pb-4">
                <span className="text-4xl font-bold text-gray-300 dark:text-gray-600">:</span>
              </div>
              {/* Minutes */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-24 sm:h-32 w-20 sm:w-28 items-center justify-center rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 border-2 border-primary shadow-lg shadow-primary/10">
                  <p className="text-primary dark:text-blue-400 text-5xl sm:text-7xl font-bold leading-none tracking-tight font-mono">{pad(minutes)}</p>
                </div>
                <p className="text-primary dark:text-blue-400 text-xs font-bold uppercase tracking-wider">Minutes</p>
              </div>
              {/* Separator */}
              <div className="flex h-24 sm:h-32 items-center justify-center pb-4">
                <span className="text-4xl font-bold text-gray-300 dark:text-gray-600">:</span>
              </div>
              {/* Seconds */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-24 sm:h-32 w-20 sm:w-28 items-center justify-center rounded-xl sm:rounded-2xl bg-[#f0f2f4] dark:bg-gray-800 border-2 border-transparent dark:border-gray-700">
                  <p className="text-[#111318] dark:text-white text-5xl sm:text-7xl font-bold leading-none tracking-tight font-mono">{pad(seconds)}</p>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wider">Seconds</p>
              </div>
            </div>

            {/* Primary Controls */}
            <div className="flex flex-wrap gap-4 w-full justify-center max-w-[600px] pt-4">
              <button 
                onClick={() => setIsRunning(false)}
                className="flex-1 min-w-[120px] h-14 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-[#111318] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 group"
              >
                <span className="material-symbols-outlined text-[28px] text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">pause</span>
                <span className="text-lg font-bold">Pause</span>
              </button>
              <button 
                onClick={() => setIsRunning(true)}
                className={`flex-[2] min-w-[160px] h-14 cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all active:scale-95 transform hover:-translate-y-0.5 ${isRunning ? 'opacity-90 ring-4 ring-primary/20' : ''}`}
              >
                <span className="material-symbols-outlined text-[28px] fill-current">play_arrow</span>
                <span className="text-lg font-bold">{isRunning ? 'Running' : 'Start'}</span>
              </button>
              <button className="flex-1 min-w-[120px] h-14 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-[#111318] dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95 group">
                <span className="text-lg font-bold">Next</span>
                <span className="material-symbols-outlined text-[28px] text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">skip_next</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right/Bottom Panel: Agenda List */}
        <aside className="w-full lg:w-[400px] xl:w-[480px] bg-gray-50 dark:bg-[#101622] flex flex-col border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50/80 dark:bg-[#101622]/80 backdrop-blur-sm sticky top-0 z-10">
            <h3 className="text-[#111318] dark:text-white text-lg font-bold">Agenda</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">Item 2 of 4</span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Completed Item */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-700 opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex-shrink-0 mt-1">
                <div className="size-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-[16px] font-bold">check</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#111318] dark:text-white text-base font-medium line-through decoration-gray-400">Introduction & Welcome</p>
                <p className="text-sm text-gray-500 mt-0.5">5 mins • Completed</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-gray-400">09:00 AM</span>
              </div>
            </div>

            {/* Active Item */}
            <div className="relative flex items-start gap-4 p-5 rounded-xl bg-white dark:bg-surface-dark border-2 border-primary shadow-md transform scale-[1.02] transition-transform">
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-primary rounded-l-xl"></div>
              <div className="flex-shrink-0 mt-1">
                <div className="size-6 rounded-full bg-primary flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-white text-[16px]">play_arrow</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-primary uppercase tracking-wide">Live Now</span>
                </div>
                <p className="text-[#111318] dark:text-white text-lg font-bold leading-tight">Financial Performance Review</p>
                <div className="flex items-center gap-2 mt-2">
                  <img src={SAMPLE_USERS.jane.avatarUrl} alt="Portrait of Jane Doe" className="size-6 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Jane Doe</p>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <p className="text-sm text-gray-500">15 mins</p>
                </div>
              </div>
            </div>

            {/* Upcoming Item */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer group">
              <div className="flex-shrink-0 mt-1">
                <div className="size-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">3</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#111318] dark:text-white text-base font-semibold group-hover:text-primary transition-colors">Marketing Strategy Q4</p>
                <p className="text-sm text-gray-500 mt-0.5">20 mins • Upcoming</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex -space-x-2">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1LHiI3iRdS5Bmrnf_BTwZF8gDr0yj3mJ-n3P8heaQFeoDAneYg-gUJZgqDJ-vWYcvoLlzEe8ySn_v9AhuhWpuOfqRlnBXm4Q58a16Dy8vicujIsifTLMiHIIjSOvjSm2oPbSpHVYIgiM3tXOUZY5I3bEGiimxLcTnYpaitEpdKDiFodUFzTPz3cFb3uPmU7VPP59uX1kzRxHvtYkZ7u1eHcNuFhwIhb-6Hivl95oirBLvGWJV5lgrG4jw0sUAEFL2mzyAV4SOKBqo" alt="Team member 1" className="size-6 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCm5u4l9tzFT_Bzu9qFemz5MEaHomj72JY5UljhkB9PgeOJZGI3kvk9psvZpKtBpGJZqgeqKtkzFUhFOxo9MQg_Yjx2cu5J35Wz4WfG26IyffEWFZnLCnS0FIfGXXEDB4vHh8AjFmXmQGadvt9zbY7w_tdBO-N3kvwDNPAIFS5Q5f11HwYscfso4-BsrM3AjrVk49_cxMwaHv6RWoMT6ENls0EfB_B-k7W_vpm2zHjeqPzJ5f3idsDeMAMY-W2Ws_dMnCRsOpxuaEtR" alt="Team member 2" className="size-6 rounded-full border-2 border-white dark:border-gray-800 object-cover" />
                  </div>
                  <span className="text-xs text-gray-400">+2 others</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-gray-400">09:20 AM</span>
              </div>
            </div>

            {/* Upcoming Item */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer group">
              <div className="flex-shrink-0 mt-1">
                <div className="size-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">4</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#111318] dark:text-white text-base font-semibold group-hover:text-primary transition-colors">Q&A Session</p>
                <p className="text-sm text-gray-500 mt-0.5">10 mins • Upcoming</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-gray-400">09:40 AM</span>
              </div>
            </div>

            {/* Future Placeholder */}
            <div onClick={() => navigate('/report')} className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
               Click here to End and View Report
            </div>
          </div>
          
          {/* Bottom Stats in Sidebar */}
          <div className="p-4 bg-white dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Progress</span>
              <span>35%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '35%' }}></div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default LiveMeeting;