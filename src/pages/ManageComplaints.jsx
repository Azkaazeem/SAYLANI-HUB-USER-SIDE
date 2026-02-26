import React, { useEffect, useState } from 'react';
import { supabase } from '../components/lib/supabaseClient';
import { Trash2, CheckCircle, Search, Clock, Activity, X } from 'lucide-react';

export default function ManageComplaints() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Pending');

  // --- NEW STATE FOR IMAGE MODAL ---
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  const fetchData = async () => {
    // Make sure 'image_url' is selected if not select *
    const { data: comps } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    if (comps) setData(comps);
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (id, newStatus) => {
    await supabase.from('complaints').update({ status: newStatus }).eq('id', id);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this complaint?")) {
      await supabase.from('complaints').delete().eq('id', id);
      fetchData();
    }
  };

  // --- FUNCTIONS TO OPEN/CLOSE IMAGE MODAL ---
  const openImageModal = (url) => {
    setSelectedImageUrl(url);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedImageUrl(null);
  };

  const filteredData = data.filter(item => {
    const statusMatch = (item.status || 'Pending').toLowerCase() === activeTab.toLowerCase();
    // Search ab title aur description dono mein karega
    const searchMatch = (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  return (
    <div className="space-y-6 relative">
      
      {/* --- TOP FILTERS & TABS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          <button onClick={() => setActiveTab('Pending')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'Pending' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}><Clock size={16} /> Pending</button>
          <button onClick={() => setActiveTab('In Progress')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'In Progress' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}><Activity size={16} /> In Progress</button>
          <button onClick={() => setActiveTab('Resolved')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'Resolved' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}><CheckCircle size={16} /> Resolved</button>
        </div>
        
        <div className="relative w-full md:w-64 text-gray-400 focus-within:text-gray-600 dark:focus-within:text-gray-200">
          <Search size={18} className="absolute top-2.5 left-3"/><input type="text" placeholder="Search title or description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-700 py-2 pl-10 pr-4 rounded-lg text-sm focus:outline-none dark:text-white" />
        </div>
      </div>

      {/* --- TABLE AREA --- */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 border-b dark:border-slate-700">
              {/* New Attachment Header */}
              <th className="px-6 py-3 text-xs font-semibold uppercase">Attachment</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase">Title / Info</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase">Description</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                
                {/* 👇 NAYA COLUMN: SMALL CIRCLE IMAGE 👇 */}
                <td className="px-6 py-4 text-sm">
                  {row.image_url ? (
                    <div 
                      onClick={() => openImageModal(row.image_url)}
                      className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center bg-gray-100 dark:bg-gray-700"
                      title="Click to view full image"
                    >
                      <img src={row.image_url} alt="Attachment" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <span className="text-[10px] text-center">No Image</span>
                    </div>
                  )}
                </td>
                {/* 👆 YAHAN TAK 👆 */}

                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="font-bold">{row.title || 'No Title'}</div>
                    <div className="text-xs text-gray-500">
                        {row.campus && <span className="mr-2">🏫 {row.campus}</span>}
                        {row.room_info && <span>🚪 {row.room_info}</span>}
                    </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={row.description}>{row.description || row.message}</td>
                
                <td className="px-6 py-4 text-sm text-right flex justify-end items-center space-x-3">
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

      {/* 👇 FULL IMAGE MODAL (Popup) 👇 */}
      {isImageModalOpen && selectedImageUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity animate-fade-in"
          onClick={closeImageModal} // Click outside to close
        >
          <div 
            className="relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-2xl max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()} // Click inside won't close
          >
            {/* Close Button */}
            <button 
              onClick={closeImageModal}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
            >
              <X size={24} />
            </button>
            
            {/* Full Image */}
            <div className="p-2 md:p-4 flex-1 overflow-auto flex items-center justify-center bg-gray-100 dark:bg-slate-900">
               <img 
                 src={selectedImageUrl} 
                 alt="Full Size Attachment" 
                 className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-md"
               />
            </div>
          </div>
        </div>
      )}
      {/* 👆 YAHAN TAK 👆 */}

    </div>
  );
}