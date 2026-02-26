import React, { useEffect, useState } from 'react';
import { supabase } from '../components/lib/supabaseClient';
import Swal from 'sweetalert2';
import { Search, CalendarDays, MapPin, Clock, Edit, XCircle, Loader2, UserCheck } from 'lucide-react';

const timingsList = ["Morning (09:00 AM - 01:00 PM)", "Afternoon (02:00 PM - 06:00 PM)", "Evening (07:00 PM - 10:00 PM)", "Full Day Event"];
const eventsList = ["Mega Hackathon 2026", "IT Seminar", "Entry Test Management", "Career Counseling Session", "General Campus Duty"];

export default function VolunteerSchedule() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVol, setSelectedVol] = useState(null);
  const [formData, setFormData] = useState({ event_name: '', event_timing: '', event_location: '' });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    // Sirf 'Approved' volunteers fetch karega kyunke pending ko duty nahi milti
    const { data: vols, error } = await supabase
      .from('volunteer_applications')
      .select('*')
      .ilike('status', 'approved')
      .order('created_at', { ascending: false });
      
    if (!error && vols) setData(vols);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openEditModal = (vol) => {
    setSelectedVol(vol);
    setFormData({
      event_name: vol.event_name || '',
      event_timing: vol.event_timing || '',
      event_location: vol.event_location || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveDuty = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase
      .from('volunteer_applications')
      .update({
        event_name: formData.event_name,
        event_timing: formData.event_timing,
        event_location: formData.event_location
      })
      .eq('id', selectedVol.id);

    setSaving(false);

    if (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.message });
    } else {
      Swal.fire({ icon: 'success', title: 'Duty Assigned!', text: 'Volunteer schedule updated successfully.', showConfirmButton: false, timer: 1500 });
      setIsModalOpen(false);
      fetchData(); // Refresh list
    }
  };

  const filteredData = data.filter(item => 
    (item.name || item.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.event_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.event_location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm transition-colors duration-300">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <CalendarDays className="text-[#65A338]" size={24} /> Duty Roster
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Assign events and locations to approved volunteers.</p>
        </div>

        <div className="relative w-full md:w-64 text-gray-400 focus-within:text-gray-600 dark:focus-within:text-gray-200">
          <Search size={18} className="absolute top-2.5 left-3"/>
          <input 
            type="text" 
            placeholder="Search volunteers or locations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 dark:bg-slate-700 py-2 pl-10 pr-4 rounded-lg text-sm focus:outline-none dark:text-white transition-colors" 
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#0057a8]" /></div>
          ) : filteredData.length === 0 ? (
            <p className="p-6 text-gray-500 dark:text-gray-400 text-center">No approved volunteers found.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-slate-700">
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Volunteer</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Assigned Event</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Timing & Location</th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    
                    {/* User Info */}
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-3">
                        <img src={row.profile_image_url || 'https://via.placeholder.com/40'} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{row.full_name || row.name || 'No Name'}</div>
                          <div className="text-xs text-blue-500 font-medium">Roll No: {row.roll_no || 'N/A'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Event Name */}
                    <td className="px-6 py-4 text-sm">
                      {row.event_name ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {row.event_name}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">Not Assigned</span>
                      )}
                    </td>

                    {/* Timing & Location */}
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex items-center gap-1.5" title="Timing">
                        <Clock size={14} className={row.event_timing ? "text-orange-500" : "text-gray-400"} /> 
                        <span className={!row.event_timing ? "italic text-gray-400" : ""}>{row.event_timing || 'No timing set'}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Location">
                        <MapPin size={14} className={row.event_location ? "text-emerald-500" : "text-gray-400"} /> 
                        <span className={!row.event_location ? "italic text-gray-400" : ""}>{row.event_location || 'No location set'}</span>
                      </div>
                    </td>

                    {/* Action Button */}
                    <td className="px-6 py-4 text-sm text-right h-full pt-6">
                      <button 
                        onClick={() => openEditModal(row)} 
                        className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 ml-auto transition-colors shadow-sm"
                      >
                        <Edit size={16} /> Assign Duty
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ASSIGN DUTY MODAL */}
      {isModalOpen && selectedVol && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
              <XCircle size={24} />
            </button>
            
            <h3 className="text-xl font-bold text-[#0057a8] dark:text-blue-400 mb-1">Assign Duty</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">
              For: <span className="font-bold text-gray-800 dark:text-white">{selectedVol.full_name || selectedVol.name}</span>
            </p>

            <form onSubmit={handleSaveDuty} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block uppercase">Select Event</label>
                <select 
                  value={formData.event_name} 
                  onChange={(e) => setFormData({...formData, event_name: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-blue-600 font-medium"
                >
                  <option value="">-- Choose Event --</option>
                  {eventsList.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block uppercase">Select Timing</label>
                <select 
                  value={formData.event_timing} 
                  onChange={(e) => setFormData({...formData, event_timing: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
                >
                  <option value="">-- Choose Timing --</option>
                  {timingsList.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 block uppercase">Campus / Location</label>
                <input 
                  type="text" 
                  placeholder="e.g. Bahadurabad Campus" 
                  value={formData.event_location} 
                  onChange={(e) => setFormData({...formData, event_location: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium" 
                />
              </div>

              <button type="submit" disabled={saving} className="w-full bg-[#65A338] hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex justify-center items-center mt-4">
                {saving ? <Loader2 className="animate-spin" /> : 'Save Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}