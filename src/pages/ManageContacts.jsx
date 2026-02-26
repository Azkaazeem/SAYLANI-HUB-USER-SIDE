import React, { useEffect, useState } from 'react';
import { supabase } from '../components/lib/supabaseClient';
import { Trash2, Search, Reply, Eye, X } from 'lucide-react'; // Eye aur X icons add kiye hain

export default function ManageContacts() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- NEW STATE FOR MESSAGE MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchData = async () => {
    const { data: contacts } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (contacts) setData(contacts);
  };

  useEffect(() => { fetchData(); }, []);

 const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Message?',
      text: "Are you sure you want to remove this message?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      await supabase.from('contact_messages').delete().eq('id', id);
      Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Message has been removed.', showConfirmButton: false, timer: 1500 });
      fetchData();
    }
  };

  // --- FUNCTIONS TO OPEN/CLOSE MODAL ---
  const openMessageModal = (messageObj) => {
    setSelectedMessage(messageObj);
    setIsModalOpen(true);
  };

  const closeMessageModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  const filteredData = data.filter(item => 
    Object.values(item).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Contact Messages</h2>
        <div className="relative w-full md:w-64 text-gray-400 focus-within:text-gray-600 dark:focus-within:text-gray-200">
          <Search size={18} className="absolute top-2.5 left-3"/><input type="text" placeholder="Search contacts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-100 dark:bg-slate-700 py-2 pl-10 pr-4 rounded-lg text-sm focus:outline-none dark:text-white" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 border-b dark:border-slate-700">
              <th className="px-6 py-3 text-xs font-semibold uppercase">Name / Email</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase">Message</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  <div className="font-bold">{row.name}</div>
                  <div className="text-xs text-blue-500">{row.email}</div>
                </td>
                
                {/* Message truncate (chota) ho kar aayega */}
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{row.message}</td>
                
                <td className="px-6 py-4 text-sm text-right flex justify-end items-center space-x-2">
                  
                  {/* VIEW FULL MESSAGE BUTTON */}
                  <button onClick={() => openMessageModal(row)} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors" title="View Full Message">
                    <Eye size={18} />
                  </button>

                  <a href={`mailto:${row.email}?subject=Reply from Saylani Hub Admin`} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-lg inline-block transition-colors" title="Reply via Email">
                    <Reply size={18} />
                  </a>
                  
                  <button onClick={() => handleDelete(row.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && <p className="p-6 text-gray-500 text-center">No messages found.</p>}
      </div>

      {/* 👇 FULL MESSAGE MODAL (Popup) 👇 */}
      {isModalOpen && selectedMessage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" 
          onClick={closeMessageModal}
        >
          <div 
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeMessageModal} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Message from {selectedMessage.name}</h3>
            <p className="text-sm text-blue-500 mb-6 font-medium">{selectedMessage.email}</p>
            
            <div className="bg-gray-50 dark:bg-slate-900 p-5 rounded-xl text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed shadow-inner">
              {selectedMessage.message}
            </div>
            
            <div className="mt-8 flex justify-end">
              <a 
                href={`mailto:${selectedMessage.email}?subject=Reply from Saylani Hub Admin`} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
              >
                <Reply size={18} /> Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
      {/* 👆 YAHAN TAK 👆 */}

    </div>
  );
}