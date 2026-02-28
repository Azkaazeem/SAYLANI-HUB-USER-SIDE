import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; 
import { Bell, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 1. Navigate import kiya

const NotificationSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate(); // 2. Navigate hook initialize kiya

  useEffect(() => {
    fetchNotifications();
    
    const subscription = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
        setNotifications(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (!error && data) setNotifications(data);
  };

  // 3. Click handle karne ka function
  const handleNotificationClick = async (notif) => {
    // Agar read nahi hai toh read mark karein
    if (!notif.is_read) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id);
      setNotifications(notifications.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    }

    // Agar link mojood hai toh wahan navigate karein aur sidebar close kar dein
    if (notif.link) {
      navigate(notif.link);
      setIsOpen(false); 
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white dark:border-gray-900"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div 
        className={`fixed top-0 right-0 h-full w-80 sm:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Bell size={20} className="text-blue-600" /> Notifications
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => handleNotificationClick(notif)} // 4. Click function call
                className={`p-4 mb-2 rounded-xl cursor-pointer transition-all border-l-4 hover:scale-[1.02] ${
                  !notif.is_read 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-sm' 
                    : 'bg-white dark:bg-gray-800 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5 shrink-0">
                    <CheckCircle size={18} className={!notif.is_read ? "text-blue-500" : "text-gray-400"} />
                  </div>
                  <div>
                    <p className={`text-sm ${!notif.is_read ? 'text-gray-800 dark:text-gray-100 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 font-medium">
                      {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-3">
              <Bell size={48} className="opacity-20" />
              <p className="text-sm font-medium">No new notifications</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationSidebar;