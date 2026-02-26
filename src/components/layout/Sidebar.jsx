import React from 'react';
import { 
  Home, Users, ShieldAlert, AlertTriangle, MessageSquare, 
  Search, CalendarDays, LogOut, HeartHandshake // Yahan CalendarDays add kiya hai
} from 'lucide-react';
import smitLogo from '../../assets/SMIT.png';

const NavItem = ({ icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
      isActive 
        ? 'bg-[#014990] text-white shadow-md shadow-blue-900/20' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-[#014990] dark:hover:text-white'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default function Sidebar({ currentView, setCurrentView, onLogout }) {
  return (
    <div className="h-full bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col transition-colors duration-300">
      
      {/* Logo Area */}
      <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-slate-800">
        <img src={smitLogo} alt="SMIT Logo" className="h-16 object-contain mb-3" />
        <h2 className="text-xl font-extrabold text-[#014990] dark:text-white">Saylani Hub</h2>
        <p className="text-xs font-medium text-[#65A338] tracking-widest uppercase mt-1">Admin Panel</p>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        <NavItem icon={<Home size={20} />} label="Dashboard" isActive={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
        <NavItem icon={<Users size={20} />} label="Manage Users" isActive={currentView === 'users'} onClick={() => setCurrentView('users')} />
        <NavItem icon={<AlertTriangle size={20} />} label="Complaints" isActive={currentView === 'complaints'} onClick={() => setCurrentView('complaints')} />
        <NavItem icon={<HeartHandshake size={20} />} label="Volunteers" isActive={currentView === 'volunteers'} onClick={() => setCurrentView('volunteers')} />
        <NavItem icon={<CalendarDays size={20} />} label="Duty Roster" isActive={currentView === 'schedule'} onClick={() => setCurrentView('schedule')} />
        <NavItem icon={<Search size={20} />} label="Lost & Found" isActive={currentView === 'lostfound'} onClick={() => setCurrentView('lostfound')} />
        <NavItem icon={<MessageSquare size={20} />} label="Messages" isActive={currentView === 'contacts'} onClick={() => setCurrentView('contacts')} />
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-red-900/10 dark:hover:bg-red-900/20 rounded-xl font-bold transition-colors"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

    </div>
  );
}