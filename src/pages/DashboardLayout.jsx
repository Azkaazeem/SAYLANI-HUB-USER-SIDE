import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';

import MainDashboard from './MainDashboard';
import ManageUsers from './ManageUsers';
import ManageVolunteers from './ManageVolunteers';
import ManageContacts from './ManageContacts';
import ManageComplaints from './ManageComplaints';
import ManageLostFound from './ManageLostFound';
import VolunteerSchedule from './VolunteerSchedule'; // 👇 Yeh line add ki hai

export default function DashboardLayout({ isDark, toggleTheme }) {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <MainDashboard />;
      case 'users':
        return <ManageUsers />; 
      case 'volunteers':
        return <ManageVolunteers />;
      case 'schedule': // 👇 Yeh case add kiya hai 👇
        return <VolunteerSchedule />;
      case 'contacts':
        return <ManageContacts />;
      case 'complaints':
        return <ManageComplaints />;
      case 'lostfound':
        return <ManageLostFound />;
      default:
        return <MainDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900 font-sans transition-colors duration-300">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header isDarkMode={isDark} toggleTheme={toggleTheme} />
        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
            {renderContent()}
        </div>
      </main>
    </div>
  );
}