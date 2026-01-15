import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SAMPLE_USERS } from '../types';

const SetupSession: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-[#111318] dark:text-white font-display">
       {/* TopNavBar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f2f4] dark:border-gray-800 bg-surface-light dark:bg-surface-dark px-10 py-3 sticky top-0 z-50">
        <div className="flex items-center gap-4 text-[#111318] dark:text-white">
          <div className="size-8 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl cursor-pointer" onClick={() => navigate('/')}>timer</span>
          </div>
          <h2 className="text-[#111318] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] cursor-pointer" onClick={() => navigate('/')}>Meeting Manager</h2>
        </div>
        <div className="flex flex-1 justify-end gap-8">
          <div className="hidden md:flex items-center gap-9">
            <a href="#" onClick={(e) => {e.preventDefault(); navigate('/');}} className="text-[#111318] dark:text-gray-200 text-sm font-medium hover:text-primary transition-colors leading-normal">Dashboard</a>
            <a href="#" className="text-primary text-sm font-bold leading-normal">Meetings</a>
            <a href="#" className="text-[#111318] dark:text-gray-200 text-sm font-medium hover:text-primary transition-colors leading-normal">Reports</a>
            <a href="#" className="text-[#111318] dark:text-gray-200 text-sm font-medium hover:text-primary transition-colors leading-normal">Settings</a>
          </div>
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-gray-100 dark:ring-gray-700" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA1GNtVF1Zk18-O5Pwi1N6xVAamX9mWq5zwYtyn6B-sPKvA0dCH8kUyl5_2r9PnmK7teov1YyuQv7BdGCf0ve1y3ap0ZouIw3hv09Ot-jtIeTgeNmUmcpKqGIhP5piB-O_QDEVOmlEmtTYP7u_zMSIVvCL5CN3Sa5k_pw8Z9upkA2q87At_ZA50kUKKVfGadQqw3SjhGvpZfp2eFj8uZT-_4LfnlRXfb-rrqW-1nOKTIjS6fvk4bWJIhiUBCu_PG37NXBveQZm6iGWH')" }}></div>
        </div>
      </header>

      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-40 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 gap-6">
            
            {/* Page Header Section */}
            <div className="flex flex-wrap justify-between items-end gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-primary text-sm font-semibold uppercase tracking-wider">Configuration</p>
                <h1 className="text-[#111318] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">Setup Session</h1>
                <p className="text-[#616f89] dark:text-gray-400 text-base font-normal leading-normal">Configure agenda and participants for the upcoming team sync.</p>
              </div>
              {/* Meta Text - Week Info */}
              <div className="bg-white dark:bg-surface-dark px-4 py-2 rounded-lg border border-[#dbdfe6] dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-2 text-[#616f89] dark:text-gray-300 text-sm font-medium">
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                  <span>Week of October 23rd - 27th, 2023</span>
                </div>
              </div>
            </div>

            {/* Day Selector */}
            <div className="flex flex-col gap-3 mt-4">
              <label className="text-[#111318] dark:text-white text-sm font-bold">Select Meeting Day</label>
              <div className="flex h-12 w-full max-w-sm items-center justify-center rounded-lg bg-[#f0f2f4] dark:bg-gray-800 p-1">
                <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 has-[:checked]:bg-white has-[:checked]:dark:bg-primary has-[:checked]:shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all">
                  <span className="text-sm font-semibold text-[#616f89] dark:text-gray-400 has-[:checked]:text-[#111318] has-[:checked]:dark:text-white">Tuesday</span>
                  <input type="radio" name="day-selector" value="Tuesday" defaultChecked className="invisible w-0" />
                </label>
                <label className="flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 has-[:checked]:bg-white has-[:checked]:dark:bg-primary has-[:checked]:shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all">
                  <span className="text-sm font-semibold text-[#616f89] dark:text-gray-400 has-[:checked]:text-[#111318] has-[:checked]:dark:text-white">Wednesday</span>
                  <input type="radio" name="day-selector" value="Wednesday" className="invisible w-0" />
                </label>
              </div>
            </div>

            {/* Agenda Section */}
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex justify-between items-center">
                <label className="text-[#111318] dark:text-white text-sm font-bold flex items-center gap-2">
                  Agenda Items
                  <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">3 items</span>
                </label>
                <span className="text-[#616f89] dark:text-gray-400 text-sm">Total Est. Time: <span className="font-bold text-[#111318] dark:text-white">55 min</span></span>
              </div>
              
              <div className="w-full overflow-hidden rounded-xl border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-surface-dark shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8f9fa] dark:bg-gray-800/50 border-b border-[#dbdfe6] dark:border-gray-700">
                      <th className="px-6 py-4 text-left text-[#616f89] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider w-[40%]">Topic</th>
                      <th className="px-6 py-4 text-left text-[#616f89] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider w-[20%]">Est. Time (min)</th>
                      <th className="px-6 py-4 text-left text-[#616f89] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider w-[30%]">Participant</th>
                      <th className="px-6 py-4 text-right text-[#616f89] dark:text-gray-400 text-xs font-semibold uppercase tracking-wider w-[10%]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dbdfe6] dark:divide-gray-700">
                    {/* Item 1 */}
                    <tr className="group hover:bg-[#f8f9fa] dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4">
                        <input type="text" className="w-full bg-transparent border-none p-0 text-[#111318] dark:text-white text-sm font-medium focus:ring-0 placeholder-gray-400" placeholder="Enter topic..." defaultValue="Budget Review" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-400 text-lg">schedule</span>
                          <input type="number" className="w-16 bg-transparent border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[#616f89] dark:text-gray-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary" defaultValue={15} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 group/select cursor-pointer">
                          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 ring-2 ring-white dark:ring-gray-800" style={{ backgroundImage: `url("${SAMPLE_USERS.john.avatarUrl}")` }}></div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#111318] dark:text-white">{SAMPLE_USERS.john.name}</span>
                            <span className="text-xs text-[#616f89] dark:text-gray-500 group-hover/select:text-primary">Change...</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </td>
                    </tr>
                    {/* Item 2 */}
                    <tr className="group hover:bg-[#f8f9fa] dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4">
                        <input type="text" className="w-full bg-transparent border-none p-0 text-[#111318] dark:text-white text-sm font-medium focus:ring-0 placeholder-gray-400" placeholder="Enter topic..." defaultValue="Sprint Retrospective" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-400 text-lg">schedule</span>
                          <input type="number" className="w-16 bg-transparent border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[#616f89] dark:text-gray-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary" defaultValue={30} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 group/select cursor-pointer">
                          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 ring-2 ring-white dark:ring-gray-800" style={{ backgroundImage: `url("${SAMPLE_USERS.jane.avatarUrl}")` }}></div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#111318] dark:text-white">{SAMPLE_USERS.jane.name}</span>
                            <span className="text-xs text-[#616f89] dark:text-gray-500 group-hover/select:text-primary">Change...</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </td>
                    </tr>
                    {/* Item 3 */}
                    <tr className="group hover:bg-[#f8f9fa] dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4">
                        <input type="text" className="w-full bg-transparent border-none p-0 text-[#111318] dark:text-white text-sm font-medium focus:ring-0 placeholder-gray-400" placeholder="Enter topic..." defaultValue="Marketing Update" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-400 text-lg">schedule</span>
                          <input type="number" className="w-16 bg-transparent border border-gray-200 dark:border-gray-600 rounded px-2 py-1 text-[#616f89] dark:text-gray-300 text-sm focus:border-primary focus:ring-1 focus:ring-primary" defaultValue={10} />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 group/select cursor-pointer">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-300 border border-dashed border-gray-300 dark:border-gray-600">
                            <span className="material-symbols-outlined text-sm">add</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-400 italic">Unassigned</span>
                            <span className="text-xs text-primary font-medium group-hover/select:underline">Assign Participant</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                {/* Add New Item Button */}
                <div className="p-2 bg-[#f8f9fa] dark:bg-gray-800/30 border-t border-[#dbdfe6] dark:border-gray-700">
                  <button className="flex items-center justify-center w-full py-3 gap-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-[#616f89] dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-primary hover:border-primary transition-all group">
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_circle</span>
                    <span className="text-sm font-medium">Add Agenda Item</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Action Area */}
            <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-[#f0f2f4] dark:border-gray-800">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-100 mb-2">
                <span className="material-symbols-outlined mt-0.5">info</span>
                <div className="text-sm">
                  <p className="font-bold mb-1">Ready to start?</p>
                  <p className="opacity-90">Please ensure all participants have confirmed their attendance before beginning the session. This will start the global timer.</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/live')}
                className="flex h-14 w-full items-center justify-center rounded-xl bg-primary hover:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all active:scale-[0.99]"
              >
                <span className="text-lg font-bold tracking-tight mr-2">Begin Meeting</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupSession;