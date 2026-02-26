import React, { useEffect, useState } from 'react';
import { supabase } from '../components/lib/supabaseClient';
import Swal from 'sweetalert2'; // Added SweetAlert
import { Trash2, Search, PackageMinus, PackagePlus, List, MapPin, XCircle, Image as ImageIcon } from 'lucide-react';

export default function ManageLostFound() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState('All'); // All, Lost, Found

  // --- NEW STATE FOR FULL SCREEN IMAGE MODAL ---
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  const fetchData = async () => {
    // 1. Fetch all lost and found items
    const { data: items } = await supabase.from('lost_found_items').select('*').order('created_at', { ascending: false });
    
    if (items && items.length > 0) {
      // 2. Extract unique user IDs
      const userIds = [...new Set(items.map(item => item.user_id).filter(id => id))];
      
      // 3. Fetch user profiles from smit_hub_profiles table
      const { data: profiles } = await supabase.from('smit_hub_profiles').select('id, full_name, profile_image_url').in('id', userIds);
      
      const profileMap = {};
      if (profiles) {
        profiles.forEach(p => { profileMap[p.id] = p; });
      }

      // 4. Merge items with user profiles
      const mergedData = items.map(item => ({
        ...item,
        smit_hub_profiles: profileMap[item.user_id] || { full_name: 'Unknown User' }
      }));
      
      setData(mergedData);
    } else {
      setData([]);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Function to handle status change from dropdown
  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase.from('lost_found_items').update({ status: newStatus }).eq('id', id);
    
    if (error) {
      // Show SweetAlert error if database rejects the update
      Swal.fire({ icon: 'error', title: 'Update Failed', text: error.message });
    } else {
      fetchData(); // Refresh list on success
    }
  };

  // Function to handle deletion with SweetAlert confirmation
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('lost_found_items').delete().eq('id', id);
      if (error) {
         Swal.fire('Error!', error.message, 'error');
      } else {
         Swal.fire('Deleted!', 'The record has been deleted.', 'success');
         fetchData();
      }
    }
  };

  // Functions to open and close the image modal
  const openImageModal = (url) => {
    setSelectedImageUrl(url);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageUrl(null);
  };

  const filteredData = data.filter(item => {
    // Check if tab is 'All' or matches the item type
    const typeMatch = activeType === 'All' || (item.type || '').toLowerCase() === activeType.toLowerCase();
    
    // Search filter across title, description, and user name
    const searchMatch = (item.title || item.item_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (item.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (item.smit_hub_profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
                        
    return typeMatch && searchMatch;
  });

  return (
    <div className="space-y-6 relative">
      
      {/* --- TOP FILTERS & TABS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          <button onClick={() => setActiveType('All')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeType === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}><List size={16} /> All Items</button>
          <button onClick={() => setActiveType('Lost')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeType === 'Lost' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}><PackageMinus size={16} /> Lost</button>
          <button onClick={() => setActiveType('Found')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeType === 'Found' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}><PackagePlus size={16} /> Found</button>
        </div>
        
        <div className="relative w-full md:w-64 text-gray-400 focus-within:text-gray-600 dark:focus-within:text-gray-200">
          <Search size={18} className="absolute top-2.5 left-3"/><input type="text" placeholder="Search items or users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-700 py-2 pl-10 pr-4 rounded-lg text-sm focus:outline-none dark:text-white" />
        </div>
      </div>

      {/* --- TABLE AREA --- */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 border-b dark:border-slate-700">
              <th className="px-6 py-3 text-xs font-semibold uppercase">Image</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase">Item Details</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase">User Info</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase">Type</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase text-right">Status & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                
                {/* Image Column */}
                <td className="px-6 py-4 text-sm">
                  {row.image_url ? (
                    <div 
                      onClick={() => openImageModal(row.image_url)}
                      className="w-12 h-12 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      title="Click to view full image"
                    >
                      <img src={row.image_url} alt="Item" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400">
                      <span className="text-[10px] text-center">No Image</span>
                    </div>
                  )}
                </td>

                {/* Item Details Column */}
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  <div className="font-bold">{row.title || row.item_name || 'No Title'}</div>
                  <div className="text-xs text-gray-500 max-w-xs truncate" title={row.description}>{row.description}</div>
                  {row.campus && <div className="text-xs text-yellow-600 mt-1 font-medium flex items-center"><MapPin size={12} className="mr-1"/> {row.campus}</div>}
                </td>

                {/* User Details Column */}
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-3">
                    <img src={row.smit_hub_profiles?.profile_image_url || 'https://via.placeholder.com/40'} alt="User" className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                    <div>
                      <div className="font-bold text-gray-800 dark:text-white">{row.smit_hub_profiles?.full_name || 'Unknown User'}</div>
                      <div className="text-xs text-gray-500">{row.contact_info || row.phone}</div>
                    </div>
                  </div>
                </td>

                {/* Type Column (Lost or Found Badge) */}
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                    ${(row.type || '').toLowerCase() === 'lost' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                    {row.type || 'Unknown'}
                  </span>
                </td>
                
                {/* Status Dropdown & Actions */}
                <td className="px-6 py-4 text-sm text-right flex justify-end items-center space-x-3 h-full pt-6">
                  <select 
                    value={row.status || 'Pending'}
                    onChange={(e) => handleStatusChange(row.id, e.target.value)}
                    className={`text-xs font-bold px-2 py-1.5 rounded-lg border focus:outline-none cursor-pointer transition-colors
                      ${row.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                        row.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400' : 
                        'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400'}`}
                  >
                    <option value="Pending" className="bg-white text-gray-800 dark:bg-gray-800 dark:text-white font-semibold">Pending</option>
                    <option value="In Progress" className="bg-white text-gray-800 dark:bg-gray-800 dark:text-white font-semibold">In Progress</option>
                    <option value="Resolved" className="bg-white text-gray-800 dark:bg-gray-800 dark:text-white font-semibold">Resolved</option>
                  </select>

                  <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && <p className="p-6 text-gray-500 text-center">No records found.</p>}
      </div>

      {/* FULL SCREEN IMAGE MODAL */}
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
            
            <div className="p-2 md:p-4 flex-1 overflow-auto flex items-center justify-center bg-gray-100 dark:bg-slate-900">
               <img 
                 src={selectedImageUrl} 
                 alt="Full Size View" 
                 className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-md"
               />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}