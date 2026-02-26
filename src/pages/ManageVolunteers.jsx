import React, { useEffect, useState } from 'react';
import { supabase } from '../components/lib/supabaseClient';
import { Trash2, CheckCircle, Search, Clock, XCircle, Eye, X } from 'lucide-react';

export default function ManageVolunteers() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, rejected

  // --- NEW STATE FOR VOLUNTEER DETAILS MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVol, setSelectedVol] = useState(null);

  const fetchData = async () => {
    const { data: vols } = await supabase.from('volunteer_applications').select('*').order('created_at', { ascending: false });
    if (vols) setData(vols.map(v => ({ ...v, status: (v.status || 'pending').toLowerCase() })));
  };

  useEffect(() => { fetchData(); }, []);

  // Dropdown se status change karne ka function
  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase.from('volunteer_applications').update({ status: newStatus.toLowerCase() }).eq('id', id);
    if (error) {
      alert("Error updating status: " + error.message);
    } else {
      fetchData(); // Update hoty hi list refresh ho jayegi
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this volunteer application?")) {
      await supabase.from('volunteer_applications').delete().eq('id', id);
      fetchData();
    }
  };

  // Modal Open/Close Functions
  const openModal = (vol) => {
    setSelectedVol(vol);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVol(null);
  };

  const filteredData = data.filter(item => 
    (item.status || 'pending') === activeTab && 
    Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 relative">
      
      {/* --- TOP FILTERS & TABS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'pending' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}><Clock size={16} /> Pending</button>
          <button onClick={() => setActiveTab('approved')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'approved' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}><CheckCircle size={16} /> Approved</button>
          <button onClick={() => setActiveTab('rejected')} className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap ${activeTab === 'rejected' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'}`}><XCircle size={16} /> Rejected</button>
        </div>
        
        <div className="relative w-full md:w-64 text-gray-400 focus-within:text-gray-600 dark:focus-within:text-gray-200">
          <Search size={18} className="absolute top-2.5 left-3"/><input type="text" placeholder="Search volunteers..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-700 py-2 pl-10 pr-4 rounded-lg text-sm focus:outline-none dark:text-white" />
        </div>
      </div>

      {/* --- TABLE AREA --- */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 border-b dark:border-slate-700">
              <th className="px-6 py-3 text-xs font-semibold uppercase">Applicant Details</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase">Skills</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase text-right">Status & Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  <div className="font-bold text-base">{row.name || row.full_name || 'No Name'}</div>
                  <div className="text-xs text-blue-500">{row.email}</div>
                  <div className="text-xs text-gray-500">{row.phone}</div>
                </td>
                
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={row.skills}>
                  {row.skills || 'Not specified'}
                </td>
                
                <td className="px-6 py-4 text-sm text-right flex justify-end items-center space-x-3 h-full pt-6">
                  
                  {/* View Full Details Button */}
                  <button onClick={() => openModal(row)} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors" title="View Application">
                    <Eye size={18} />
                  </button>

                  {/* STATUS DROPDOWN */}
                  <select 
                    value={(row.status || 'pending').toLowerCase()}
                    onChange={(e) => handleStatusChange(row.id, e.target.value)}
                    className={`text-xs font-bold px-2 py-1.5 rounded-lg border focus:outline-none cursor-pointer transition-colors
                      ${row.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                        row.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400' : 
                        'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400'}`}
                  >
                    <option value="pending" className="bg-white text-gray-800 dark:bg-gray-800 dark:text-white font-semibold">Pending</option>
                    <option value="approved" className="bg-white text-gray-800 dark:bg-gray-800 dark:text-white font-semibold">Approved</option>
                    <option value="rejected" className="bg-white text-gray-800 dark:bg-gray-800 dark:text-white font-semibold">Rejected</option>
                  </select>

                  <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && <p className="p-6 text-gray-500 text-center">No applications found.</p>}
      </div>

      {/* 👇 FULL DETAILS MODAL (Popup) 👇 */}
      {isModalOpen && selectedVol && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" 
          onClick={closeModal}
        >
          <div 
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Volunteer Application</h3>
            
            <div className="space-y-4">
               <div>
                 <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Applicant Name</span>
                 <p className="text-gray-800 dark:text-white font-semibold">{selectedVol.name || selectedVol.full_name}</p>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Email</span>
                   <p className="text-blue-500 text-sm font-medium break-words">{selectedVol.email}</p>
                 </div>
                 <div>
                   <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Phone</span>
                   <p className="text-gray-800 dark:text-white text-sm font-medium">{selectedVol.phone}</p>
                 </div>
               </div>

               <div>
                 <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Skills / Profession</span>
                 <p className="text-gray-800 dark:text-white text-sm bg-gray-50 dark:bg-slate-900 p-3 rounded-lg mt-1 border border-gray-100 dark:border-gray-700">
                    {selectedVol.skills || 'No skills provided.'}
                 </p>
               </div>

               <div>
                 <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Message / Motivation</span>
                 <p className="text-gray-700 dark:text-gray-300 text-sm bg-gray-50 dark:bg-slate-900 p-4 rounded-xl mt-1 whitespace-pre-wrap leading-relaxed shadow-inner border border-gray-100 dark:border-gray-700">
                    {selectedVol.message || 'No message provided.'}
                 </p>
               </div>
            </div>
            
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 👆 YAHAN TAK 👆 */}

    </div>
  );
}