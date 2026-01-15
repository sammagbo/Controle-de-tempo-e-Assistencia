import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CURRENT_USER } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-[#1A2230] border-b border-[#f0f2f4] dark:border-[#2a3441] sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-[1280px] mx-auto h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-primary flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>meeting_room</span>
            </div>
            <h2 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">MeetingManager</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#f0f2f4] dark:hover:bg-[#2a3441] transition-colors">
              <div 
                className="bg-center bg-no-repeat bg-cover rounded-full size-8 bg-gray-200" 
                style={{ backgroundImage: `url("${CURRENT_USER.avatarUrl}")` }}
              ></div>
              <span className="text-sm font-medium text-[#111318] dark:text-white hidden sm:block">{CURRENT_USER.name}</span>
              <span className="material-symbols-outlined text-[#616f89] dark:text-[#9ca3af]" style={{ fontSize: '20px' }}>expand_more</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[960px] mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-6 text-sm">
          <a href="#" className="text-[#616f89] dark:text-[#9ca3af] hover:text-primary transition-colors font-medium">Home</a>
          <span className="material-symbols-outlined text-[#616f89] dark:text-[#9ca3af]" style={{ fontSize: '16px' }}>chevron_right</span>
          <span className="text-[#111318] dark:text-white font-medium">Select Meeting</span>
        </nav>

        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-[#111318] dark:text-white mb-2">Meeting Dashboard</h1>
          <p className="text-[#616f89] dark:text-[#9ca3af] text-base font-normal">Manage and initiate your formal meeting sessions for the current period.</p>
        </div>

        {/* Filters and Controls Toolbar */}
        <div className="bg-white dark:bg-[#1A2230] p-4 rounded-xl shadow-sm border border-[#e5e7eb] dark:border-[#2a3441] mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-end">
          {/* Search Bar */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#111318] dark:text-white mb-1.5">Search Meetings</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-[#616f89] dark:text-[#9ca3af]">search</span>
              </div>
              <input 
                type="text" 
                className="block w-full pl-10 pr-3 py-2.5 border border-[#dbdfe6] dark:border-[#4b5563] rounded-lg leading-5 bg-[#f0f2f4] dark:bg-[#232d3d] text-[#111318] dark:text-white placeholder-[#616f89] dark:placeholder-[#9ca3af] focus:outline-none focus:bg-white dark:focus:bg-[#1A2230] focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all" 
                placeholder="Search by theme or keyword..." 
              />
            </div>
          </div>
          {/* Period Selector */}
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-[#111318] dark:text-white mb-1.5">Fiscal Period</label>
            <div className="relative">
              <select className="block w-full pl-3 pr-10 py-2.5 text-base border border-[#dbdfe6] dark:border-[#4b5563] focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-white dark:bg-[#232d3d] text-[#111318] dark:text-white appearance-none cursor-pointer">
                <option value="2026-jan-feb">Jan - Feb 2026</option>
                <option value="2026-mar-apr">Mar - Apr 2026</option>
                <option value="2026-may-jun">May - Jun 2026</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#616f89] dark:text-[#9ca3af]">
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
            </div>
          </div>
          {/* Filter Button */}
          <button className="hidden md:flex items-center justify-center px-4 py-2.5 border border-[#dbdfe6] dark:border-[#4b5563] rounded-lg bg-white dark:bg-[#232d3d] text-[#111318] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3441] transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>

        {/* Meeting List */}
        <div className="space-y-4">
          {/* List Item 1 */}
          <div className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 bg-white dark:bg-[#1A2230] rounded-xl border border-[#e5e7eb] dark:border-[#2a3441] shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-primary/10 rounded-lg text-primary border border-primary/20">
                <span className="text-xs font-bold uppercase tracking-wider">Week</span>
                <span className="text-2xl font-black">01</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Upcoming
                  </span>
                  <span className="text-sm text-[#616f89] dark:text-[#9ca3af]">Jan 05 - Jan 09, 2026</span>
                </div>
                <h3 className="text-xl font-bold text-[#111318] dark:text-white group-hover:text-primary transition-colors">Strategic Planning & Kickoff</h3>
                <p className="text-sm text-[#616f89] dark:text-[#9ca3af] line-clamp-1">Defining Q1 objectives and key results for all departments.</p>
              </div>
            </div>
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
              <button 
                onClick={() => navigate('/setup')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-95"
              >
                <span className="material-symbols-outlined">play_arrow</span>
                Start Meeting
              </button>
            </div>
          </div>

          {/* List Item 2 */}
          <div className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 bg-white dark:bg-[#1A2230] rounded-xl border border-[#e5e7eb] dark:border-[#2a3441] shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-[#f0f2f4] dark:bg-[#232d3d] rounded-lg text-[#616f89] dark:text-[#9ca3af] border border-transparent">
                <span className="text-xs font-bold uppercase tracking-wider">Week</span>
                <span className="text-2xl font-black">02</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    Scheduled
                  </span>
                  <span className="text-sm text-[#616f89] dark:text-[#9ca3af]">Jan 12 - Jan 16, 2026</span>
                </div>
                <h3 className="text-xl font-bold text-[#111318] dark:text-white group-hover:text-primary transition-colors">Departmental Budget Allocation</h3>
                <p className="text-sm text-[#616f89] dark:text-[#9ca3af] line-clamp-1">Reviewing resource requests and approving final budgets.</p>
              </div>
            </div>
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
              <button 
                onClick={() => navigate('/setup')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-95"
              >
                <span className="material-symbols-outlined">play_arrow</span>
                Start Meeting
              </button>
            </div>
          </div>

           {/* List Item 3 */}
           <div className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 bg-white dark:bg-[#1A2230] rounded-xl border border-[#e5e7eb] dark:border-[#2a3441] shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-[#f0f2f4] dark:bg-[#232d3d] rounded-lg text-[#616f89] dark:text-[#9ca3af] border border-transparent">
                <span className="text-xs font-bold uppercase tracking-wider">Week</span>
                <span className="text-2xl font-black">03</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    Scheduled
                  </span>
                  <span className="text-sm text-[#616f89] dark:text-[#9ca3af]">Jan 19 - Jan 23, 2026</span>
                </div>
                <h3 className="text-xl font-bold text-[#111318] dark:text-white group-hover:text-primary transition-colors">HR & Compliance Update</h3>
                <p className="text-sm text-[#616f89] dark:text-[#9ca3af] line-clamp-1">Annual policy review and compliance training scheduling.</p>
              </div>
            </div>
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
              <button 
                onClick={() => navigate('/setup')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-95"
              >
                <span className="material-symbols-outlined">play_arrow</span>
                Start Meeting
              </button>
            </div>
          </div>

          {/* List Item 4: Completed */}
          <div className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 bg-[#f9fafb] dark:bg-[#161e2c] rounded-xl border border-[#e5e7eb] dark:border-[#2a3441] opacity-75 hover:opacity-100 transition-all duration-200">
            <div className="flex items-start gap-5">
              <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-lg text-gray-500 border border-transparent">
                <span className="material-symbols-outlined text-2xl">check</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                    Completed
                  </span>
                  <span className="text-sm text-[#616f89] dark:text-[#9ca3af]">Dec 29 - Jan 02, 2026</span>
                </div>
                <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">Year End Review</h3>
                <p className="text-sm text-[#616f89] dark:text-[#9ca3af]">Finalizing 2025 performance reports.</p>
              </div>
            </div>
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
              <button 
                onClick={() => navigate('/report')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#dbdfe6] dark:border-[#4b5563] text-base font-medium rounded-lg shadow-sm text-[#616f89] bg-white dark:bg-[#232d3d] dark:text-white hover:bg-[#f0f2f4] dark:hover:bg-[#2a3441] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all"
              >
                <span className="material-symbols-outlined">visibility</span>
                View Report
              </button>
            </div>
          </div>
        </div>

        {/* Load More */}
        <div className="mt-8 flex justify-center">
          <button className="text-[#616f89] dark:text-[#9ca3af] text-sm font-medium hover:text-primary transition-colors flex items-center gap-2">
            Load more meetings
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;