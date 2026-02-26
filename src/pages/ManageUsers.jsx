import React, { useEffect, useState } from 'react';
import { supabase } from '../components/lib/supabaseClient';
import { Trash2, Search, Users, ShieldAlert, UserCheck, XCircle } from 'lucide-react'; // XCircle add kiya hai modal ke liye

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('user'); // 'user' ya 'admin'

  // --- NEW STATE FOR FULL SCREEN IMAGE MODAL ---
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('smit_hub_profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmChange = window.confirm(`Are you sure you want to make this person ${newRole === 'admin' ? 'an Admin' : 'a regular User'}?`);
    
    if (!confirmChange) return;

    const { error } = await supabase.from('smit_hub_profiles').update({ role: newRole }).eq('id', id);
    if (!error) {
      fetchUsers(); 
    } else {
      alert("Error updating role: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this profile?");
    if (!confirmDelete) return;

    const { error } = await supabase.from('smit_hub_profiles').delete().eq('id', id);
    if (!error) fetchUsers();
  };

  // --- Functions for Image Modal ---
  const openImageModal = (url) => {
    setSelectedImageUrl(url);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageUrl(null);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())); 
    
    const userRole = user.role || 'user';
    const matchesTab = userRole === activeTab;
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 relative">
      
      {/* --- TOP FILTERS & TABS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm transition-colors duration-300">
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab('user')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
          >
            <Users size={16} /> Regular Users
          </button>
          <button 
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'admin' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'}`}
          >
            <ShieldAlert size={16} /> Admins
          </button>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="relative w-full md:w-64 text-gray-400 focus-within:text-gray-600 dark:focus-within:text-gray-200">
          <Search size={18} className="absolute top-2.5 left-3"/>
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 dark:bg-slate-700 py-2 pl-10 pr-4 rounded-lg text-sm focus:outline-none dark:text-white transition-colors" 
          />
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-6 text-gray-500 dark:text-gray-400 text-center">Loading profiles...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="p-6 text-gray-500 dark:text-gray-400 text-center">No {activeTab}s found.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Profile Info</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-3">
                        {/* 👇 Clickable Image Add ki hai 👇 */}
                        <img 
                          src={user.profile_image_url || 'https://via.placeholder.com/40'} 
                          alt="Avatar" 
                          onClick={() => user.profile_image_url && openImageModal(user.profile_image_url)}
                          className={`w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600 ${user.profile_image_url ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                          title={user.profile_image_url ? "View Full Image" : "No Profile Image"}
                        />
                        {/* 👆 Yahan Tak 👆 */}
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{user.full_name || 'No Name'}</div>
                          {user.contact_info && <div className="text-xs text-gray-500">{user.contact_info}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        (user.role || 'user') === 'admin' 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {user.role || 'USER'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-right flex justify-end space-x-2 items-center h-full pt-6">
                      <button 
                        onClick={() => handleRoleChange(user.id, user.role || 'user')} 
                        className={`p-2 rounded-lg transition-colors ${
                          (user.role || 'user') === 'admin' 
                            ? 'text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20' 
                            : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                        }`} 
                        title={(user.role || 'user') === 'admin' ? "Remove Admin Rights" : "Make Admin"}
                      >
                        <UserCheck size={18} />
                      </button>

                      <button 
                        onClick={() => handleDelete(user.id)} 
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" 
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 👇 FULL SCREEN IMAGE MODAL 👇 */}
      {isImageModalOpen && selectedImageUrl && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
          onClick={closeImageModal}
        >
          <div 
            className="relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeImageModal}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
            >
              <XCircle size={24} />
            </button>
            
            <div className="p-2 md:p-4 flex-1 overflow-auto flex items-center justify-center bg-gray-100 dark:bg-slate-900 min-w-[300px] min-h-[300px]">
               <img 
                 src={selectedImageUrl} 
                 alt="User Profile" 
                 className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-md"
               />
            </div>
          </div>
        </div>
      )}
      {/* 👆 Yahan Tak 👆 */}

    </div>
  );
}