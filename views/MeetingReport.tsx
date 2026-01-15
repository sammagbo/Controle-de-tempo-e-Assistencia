import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_USERS } from '../types';

const MeetingReport: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display min-h-screen">
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
        {/* Navigation */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e5e7eb] dark:border-b-gray-700 bg-white dark:bg-[#1a202c] px-6 lg:px-10 py-3 sticky top-0 z-50">
          <div className="flex items-center gap-4 text-[#111318] dark:text-white">
            <div className="size-8 flex items-center justify-center text-primary cursor-pointer" onClick={() => navigate('/')}>
              <span className="material-symbols-outlined text-3xl">hub</span>
            </div>
            <h2 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] cursor-pointer" onClick={() => navigate('/')}>MeetSync</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="hidden md:flex items-center gap-9">
              <a href="#" onClick={(e) => {e.preventDefault(); navigate('/');}} className="text-[#111318] dark:text-gray-200 text-sm font-medium leading-normal hover:text-primary transition-colors">Dashboard</a>
              <a href="#" className="text-[#111318] dark:text-gray-200 text-sm font-medium leading-normal hover:text-primary transition-colors">Calendar</a>
              <a href="#" className="text-[#111318] dark:text-gray-200 text-sm font-medium leading-normal hover:text-primary transition-colors">Reports</a>
              <a href="#" className="text-[#111318] dark:text-gray-200 text-sm font-medium leading-normal hover:text-primary transition-colors">Settings</a>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/setup')} className="hidden md:flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-primary hover:bg-primary-dark text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors shadow-sm">
                <span className="truncate">New Meeting</span>
              </button>
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border border-gray-200 dark:border-gray-700" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC5W4XB221PGQbatGjy-SbspRiD26YGlbA-2FOlGLrj-S8_6ePJhiwOimLOt0FysfYH0gBkIyndY-7m02UYXtAdMboW1-JPwh7c42G_ntlOlIUvc1N1fbFgxp3Y-XCZnjdHxiZ-0G6vesL5fLyXTQ_t8ZnIWGMpgQuw-Utp-bHAmSgLYYAUGZwhvivQ5V9DCWTOSYb3ywNYVg_QTBlBehaSWzEQkWYKgb9qwPWeWdcSDbm0K9eym7BicGn5MUNJ0j10oLtKzgVZIgaJ')" }}
              ></div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
          <div className="layout-content-container flex flex-col max-w-[1000px] w-full flex-1 gap-6">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 bg-white dark:bg-[#1e293b] p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-[#111318] dark:text-white text-3xl font-black leading-tight tracking-[-0.033em]">Meeting Summary Report</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold uppercase tracking-wide border border-green-200 dark:border-green-800">Completed</span>
                </div>
                <p className="text-[#616f89] dark:text-gray-400 text-base font-normal leading-normal">Weekly Sync - Product Design Team</p>
              </div>
              <div className="flex gap-3">
                <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 text-[#111318] dark:text-gray-200 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[18px] mr-2">edit</span>
                  <span className="truncate">Edit</span>
                </button>
                <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-600 text-[#111318] dark:text-gray-200 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                  <span className="material-symbols-outlined text-[18px] mr-2">share</span>
                  <span className="truncate">Share</span>
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Card */}
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#1e293b] border border-[#dbdfe6] dark:border-gray-700 shadow-sm relative overflow-hidden group">
                <div className="absolute right-[-10px] top-[-10px] opacity-5 dark:opacity-10">
                  <span className="material-symbols-outlined text-[100px]">calendar_today</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
                  <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium leading-normal">Date</p>
                </div>
                <p className="text-[#111318] dark:text-white tracking-tight text-2xl font-bold leading-tight">Oct 24, 2023</p>
              </div>
              {/* Week Number Card */}
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#1e293b] border border-[#dbdfe6] dark:border-gray-700 shadow-sm relative overflow-hidden group">
                <div className="absolute right-[-10px] top-[-10px] opacity-5 dark:opacity-10">
                  <span className="material-symbols-outlined text-[100px]">tag</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-xl">tag</span>
                  <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium leading-normal">Week Number</p>
                </div>
                <p className="text-[#111318] dark:text-white tracking-tight text-2xl font-bold leading-tight">#43</p>
              </div>
              {/* Attendance Card */}
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#1e293b] border border-[#dbdfe6] dark:border-gray-700 shadow-sm relative overflow-hidden group">
                <div className="absolute right-[-10px] top-[-10px] opacity-5 dark:opacity-10">
                  <span className="material-symbols-outlined text-[100px]">group</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-xl">group</span>
                  <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium leading-normal">Total Attendance</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-[#111318] dark:text-white tracking-tight text-2xl font-bold leading-tight">12/14</p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Present</span>
                </div>
              </div>
              {/* Duration Card */}
              <div className="flex flex-col gap-1 rounded-xl p-5 bg-white dark:bg-[#1e293b] border border-[#dbdfe6] dark:border-gray-700 shadow-sm relative overflow-hidden group">
                <div className="absolute right-[-10px] top-[-10px] opacity-5 dark:opacity-10">
                  <span className="material-symbols-outlined text-[100px]">schedule</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-xl">schedule</span>
                  <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium leading-normal">Total Duration</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-[#111318] dark:text-white tracking-tight text-2xl font-bold leading-tight">58m 20s</p>
                  <p className="text-[#ef4444] text-xs font-bold leading-normal px-1.5 py-0.5 bg-red-50 dark:bg-red-900/20 rounded">+3m 20s</p>
                </div>
              </div>
            </div>

            {/* Section Header */}
            <div className="pt-4">
              <h2 className="text-[#111318] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">Participant Performance</h2>
              {/* Table */}
              <div className="overflow-hidden rounded-xl border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-[#1e293b] shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead className="bg-[#f8f9fb] dark:bg-gray-800/50 border-b border-[#dbdfe6] dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-[#616f89] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider w-[25%]">Participant</th>
                        <th className="px-6 py-4 text-left text-[#616f89] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider w-[25%]">Topic</th>
                        <th className="px-6 py-4 text-left text-[#616f89] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider w-[15%]">Allocated</th>
                        <th className="px-6 py-4 text-left text-[#616f89] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider w-[15%]">Actual</th>
                        <th className="px-6 py-4 text-left text-[#616f89] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider w-[20%]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#dbdfe6] dark:divide-gray-700">
                      {/* Row 1 */}
                      <tr className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="size-9 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-600" 
                              style={{ backgroundImage: `url("${SAMPLE_USERS.sarah.avatarUrl}")` }}
                            ></div>
                            <div>
                              <p className="text-[#111318] dark:text-white text-sm font-medium leading-normal">{SAMPLE_USERS.sarah.name}</p>
                              <p className="text-[#616f89] dark:text-gray-500 text-xs font-normal">{SAMPLE_USERS.sarah.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#111318] dark:text-gray-200 text-sm font-normal leading-normal">UX Research Update</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium tabular-nums">10m 00s</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-[#111318] dark:text-gray-200 text-sm font-bold tabular-nums">12m 30s</p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 dark:bg-red-900/20 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            Overrun (+2m 30s)
                          </span>
                        </td>
                      </tr>
                      {/* Row 2 */}
                      <tr className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="size-9 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-600" 
                              style={{ backgroundImage: `url("${SAMPLE_USERS.mike.avatarUrl}")` }}
                            ></div>
                            <div>
                              <p className="text-[#111318] dark:text-white text-sm font-medium leading-normal">{SAMPLE_USERS.mike.name}</p>
                              <p className="text-[#616f89] dark:text-gray-500 text-xs font-normal">{SAMPLE_USERS.mike.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#111318] dark:text-gray-200 text-sm font-normal leading-normal">Backend Architecture</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium tabular-nums">15m 00s</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-[#111318] dark:text-gray-200 text-sm font-bold tabular-nums">14m 10s</p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '94%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-md bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            On Track
                          </span>
                        </td>
                      </tr>
                      {/* Row 3 */}
                      <tr className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="size-9 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-600" 
                              style={{ backgroundImage: `url("${SAMPLE_USERS.jessica.avatarUrl}")` }}
                            ></div>
                            <div>
                              <p className="text-[#111318] dark:text-white text-sm font-medium leading-normal">{SAMPLE_USERS.jessica.name}</p>
                              <p className="text-[#616f89] dark:text-gray-500 text-xs font-normal">{SAMPLE_USERS.jessica.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#111318] dark:text-gray-200 text-sm font-normal leading-normal">Marketing Strategy</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium tabular-nums">10m 00s</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-[#111318] dark:text-gray-200 text-sm font-bold tabular-nums">09m 45s</p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '97%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-md bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            On Track
                          </span>
                        </td>
                      </tr>
                      {/* Row 4 */}
                      <tr className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border border-primary/20">
                              HS
                            </div>
                            <div>
                              <p className="text-[#111318] dark:text-white text-sm font-medium leading-normal">Harvey Specter</p>
                              <p className="text-[#616f89] dark:text-gray-500 text-xs font-normal">Legal Counsel</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#111318] dark:text-gray-200 text-sm font-normal leading-normal">Legal Review</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#616f89] dark:text-gray-400 text-sm font-medium tabular-nums">05m 00s</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <p className="text-[#111318] dark:text-gray-200 text-sm font-bold tabular-nums">08m 15s</p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div className="bg-red-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 dark:bg-red-900/20 px-2 py-1 text-xs font-medium text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                            <span className="material-symbols-outlined text-[14px]">warning</span>
                            Overrun (+3m 15s)
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-6 pb-12 mt-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => navigate('/')} className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-white dark:bg-[#1e293b] border border-[#dbdfe6] dark:border-gray-600 text-[#111318] dark:text-gray-200 text-base font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                <span>Save as Draft</span>
              </button>
              <button onClick={() => navigate('/')} className="flex min-w-[200px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-12 px-6 bg-primary hover:bg-primary-dark text-white text-base font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                <span className="material-symbols-outlined">description</span>
                <span>Finalize and Export</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MeetingReport;