import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const DonutStatCard = ({ title, percentage, colorClass, value }) => (
  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex flex-col items-center transition-colors duration-300">
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path className="text-gray-200 dark:text-slate-700 stroke-current" strokeWidth="3.8" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        <path className={`${colorClass} stroke-current`} strokeWidth="3.8" strokeDasharray={`${percentage}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
      </svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold text-gray-800 dark:text-white">
        {value}
      </div>
    </div>
    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 font-medium text-center">{title}</p>
  </div>
);

export const LiveUsersGraph = () => {
  const [liveUsers, setLiveUsers] = useState(0);

  useEffect(() => {
    // Attempting to fetch from a visits table to simulate live users
    const fetchLiveUsers = async () => {
      const { count } = await supabase.from('website_visits').select('*', { count: 'exact', head: true });
      setLiveUsers(count || 0); // Strictly 0 if no data
    };
    fetchLiveUsers();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm col-span-2 transition-colors duration-300">
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-white">Active Users on Website</h3>
        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{liveUsers} Live</span>
      </div>
      <div className="h-48 relative flex items-end">
        {liveUsers === 0 ? (
           <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No live data available</div>
        ) : (
          <svg viewBox="0 0 500 150" className="w-full h-full ml-8">
            <polyline fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-600 dark:text-emerald-500" points="0,140 100,120 200,130 300,80 400,90 500,50" />
          </svg>
        )}
      </div>
    </div>
  );
};