import React, { useEffect, useState } from 'react';
import { supabase } from '../components/lib/supabaseClient';
import { DonutStatCard, LiveUsersGraph } from '../components/DashboardComp/Widgets';

export default function MainDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    volunteers: 0,
    contacts: 0,
    complaints: 0
  });

  useEffect(() => {
    const fetchRealData = async () => {
      // Safely fetch counts. If table doesn't exist yet, it returns error but we fallback to 0.
      const getCount = async (table) => {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        return count || 0;
      };

      const usersCount = await getCount('smit_hub_profiles'); // assuming your users table is 'profiles' or 'users'
      const volCount = await getCount('volunteer_applications');
      const contactCount = await getCount('contact_messages');
      const compCount = await getCount('complaints');
      
      setStats({
        users: usersCount,
        volunteers: volCount,
        contacts: contactCount,
        complaints: compCount
      });
    };
    fetchRealData();
  }, []);

  // Calculate percentage dynamically based on a max goal (e.g., goal is 1000). If 0, percentage is 0.
  const calcPercent = (val, max = 1000) => val === 0 ? 0 : Math.min(Math.round((val / max) * 100), 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">System Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DonutStatCard title="Registered Users" value={stats.users} percentage={calcPercent(stats.users)} colorClass="text-emerald-600 dark:text-emerald-500" />
        <DonutStatCard title="Total Volunteers" value={stats.volunteers} percentage={calcPercent(stats.volunteers)} colorClass="text-blue-600 dark:text-blue-500" />
        <DonutStatCard title="Contact Messages" value={stats.contacts} percentage={calcPercent(stats.contacts, 100)} colorClass="text-emerald-600 dark:text-emerald-500" />
        <DonutStatCard title="Active Complaints" value={stats.complaints} percentage={calcPercent(stats.complaints, 100)} colorClass="text-blue-600 dark:text-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LiveUsersGraph />
        
        {/* Actions panel dynamically responding */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
           <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Pending Tasks</h3>
           <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-600 dark:text-gray-400">Unread Contacts</span>
                 <span className="font-bold text-emerald-600">{stats.contacts}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                 <span className="text-gray-600 dark:text-gray-400">Pending Complaints</span>
                 <span className="font-bold text-blue-600">{stats.complaints}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}