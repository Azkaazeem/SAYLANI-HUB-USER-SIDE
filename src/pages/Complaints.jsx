import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../components/lib/supabaseClient';
import Swal from 'sweetalert2';
import { AlertCircle, PlusCircle, MapPin, Image as ImageIcon, XCircle, Loader2, Edit, Trash2, Wifi, Zap, Droplet, Wrench, HelpCircle, Clock, CheckCircle, Search } from 'lucide-react';

const campuses = {
  "Karachi (Major Hubs)": [
    "Head Office Campus (Bahadurabad)", "Gulshan Campus", "Malir Campus", "Paposh Campus",
    "Zamzama Campus (Saylani Titan)", "Numaish Campus", "Aliabad Campus", "North Karachi Campus",
    "ZA IT Park", "Bahadurabad Campus"
  ],
  "National Expansion": [
    "Islamabad Campus", "Faisalabad Campus", "Hyderabad Campus", "Peshawar Campus",
    "Quetta Campus", "Rawalpindi Campus", "Gujranwala Campus", "Sukkur Campus",
    "Lakki Marwat Campus", "Multan Campus", "Ghotki Campus", "Turbat Campus"
  ]
};

const categories = [
  { name: 'Internet / Wi-Fi', icon: Wifi },
  { name: 'Electricity', icon: Zap },
  { name: 'Water / Plumbing', icon: Droplet },
  { name: 'Hardware / Maintenance', icon: Wrench },
  { name: 'Other', icon: HelpCircle }
];

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('guest');

  const [formData, setFormData] = useState({ category: 'Internet / Wi-Fi', title: '', description: '', room_info: '', campus: '', status: 'Pending' });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editId, setEditId] = useState(null); 
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData(); // Dono cheezein ek sath fetch karengy taa ke privacy theek se apply ho
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // 1. Pehly User ki details nikalen
    const { data: { user } } = await supabase.auth.getUser();
    let currentRole = 'guest';

    if (user) {
      setCurrentUser(user);
      const { data } = await supabase.from('smit_hub_profiles').select('role').eq('id', user.id).single();
      if (data && data.role) {
        currentRole = data.role;
        setUserRole(data.role);
      } else {
        currentRole = 'user';
        setUserRole('user');
      }
    } else {
      setCurrentUser(null);
      setUserRole('guest');
    }

    // 2. Phir saari complaints database se layein
    const { data: itemsData, error: itemsError } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });

    if (itemsError) {
      console.error("Error fetching complaints:", itemsError);
      setLoading(false);
      return;
    }

    // 3. Privacy Filter Lagayen (Yahan tay hoga kisko kya dikhana hai)
    if (itemsData && itemsData.length > 0) {
      const activeItems = itemsData.filter(item => {
        if (item.is_deleted) return false; // Deleted hata do
        if (currentRole === 'admin') return true; // Admin ko sab dikhao
        if (user && item.user_id === user.id) return true; // User ko sirf uski apni complaint dikhao
        return false; // Dusron ki chhupa do
      });

      if (activeItems.length === 0) {
        setComplaints([]);
        setLoading(false);
        return;
      }

      // Profiles fetch logic
      const userIds = [...new Set(activeItems.map(item => item.user_id))];
      const { data: profilesData } = await supabase.from('smit_hub_profiles').select('id, full_name, profile_image_url').in('id', userIds);

      const profileMap = {};
      if (profilesData) {
        profilesData.forEach(profile => { profileMap[profile.id] = profile; });
      }

      const mergedItems = activeItems.map(item => ({
        ...item,
        smit_hub_profiles: profileMap[item.user_id] || { full_name: 'Unknown User', profile_image_url: null }
      }));

      setComplaints(mergedItems);
    } else {
      setComplaints([]); 
    }
    
    setLoading(false);
  };

  const handleReportClick = () => {
    if (!currentUser) {
      Swal.fire({ icon: 'info', title: 'Login Required', text: 'You need to be logged in to submit a complaint.', confirmButtonColor: '#eab308' });
      return;
    }
    setEditId(null);
    setFormData({ category: 'Internet / Wi-Fi', title: '', description: '', room_info: '', campus: '', status: 'Pending' });
    setImageFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setFormData({
      category: item.category, title: item.title, description: item.description, room_info: item.room_info || '', campus: item.campus || '', status: item.status || 'Pending'
    });
    setPreviewUrl(item.image_url);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Complaint?', text: "This will remove the complaint from the portal.", icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#6b7280', confirmButtonText: 'Yes, remove it!'
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('complaints').update({ is_deleted: true }).eq('id', id);
      if (!error) {
        Swal.fire('Removed!', 'Complaint has been removed.', 'success');
        fetchData(); // Refresh Data
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.room_info || !formData.campus) {
      Swal.fire({ icon: 'warning', title: 'Missing Fields', text: 'Please fill out all required fields, including Campus.' });
      return;
    }

    setUploading(true);
    let imageUrl = previewUrl; 

    if (imageFile) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const { error: uploadError } = await supabase.storage.from('smit-hub-images').upload(`complaints/${fileName}`, imageFile);
      if (!uploadError) {
        const { data } = supabase.storage.from('smit-hub-images').getPublicUrl(`complaints/${fileName}`);
        imageUrl = data.publicUrl;
      }
    }

    const payload = {
      user_id: currentUser.id, category: formData.category, title: formData.title, description: formData.description,
      room_info: formData.room_info, campus: formData.campus, status: formData.status, image_url: imageUrl
    };

    let dbError;
    if (editId) {
      const { error } = await supabase.from('complaints').update(payload).eq('id', editId);
      dbError = error;
    } else {
      const { error } = await supabase.from('complaints').insert([payload]);
      dbError = error;
    }

    setUploading(false);

    if (dbError) {
      Swal.fire({ icon: 'error', title: 'Error', text: dbError.message });
    } else {
      Swal.fire({ icon: 'success', title: editId ? 'Updated Successfully!' : 'Complaint Submitted!', showConfirmButton: false, timer: 1500 });
      setIsModalOpen(false);
      fetchData(); // Refresh Data
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Resolved') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200';
  };

  const filteredItems = complaints.filter(item => {
    const matchesFilter = filter === 'All' || item.status === filter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = item.title?.toLowerCase().includes(searchLower) || item.room_info?.toLowerCase().includes(searchLower) || item.campus?.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-10 px-4 md:px-8 animate-page-fade relative">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center gap-3">
              <AlertCircle className="text-yellow-500" size={32} /> Campus Complaints
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Report issues to help us maintain a perfect campus.</p>
          </div>
          
          <button onClick={handleReportClick} className="mt-4 md:mt-0 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex items-center gap-2">
            <PlusCircle size={20} /> File Complaint
          </button>
        </div>

        {/* Filters will only show properly if user is logged in, but let's keep them visible */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex gap-2 sm:gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {['All', 'Pending', 'In Progress', 'Resolved'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-5 sm:px-6 py-2.5 rounded-full font-bold transition-all duration-300 whitespace-nowrap ${filter === f ? 'bg-yellow-500 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 group-focus-within:text-yellow-500 transition-colors" />
            </div>
            <input type="text" placeholder="Search issues, campus, room..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500 transition-all shadow-sm" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-yellow-500" /></div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 px-4">
            <AlertCircle className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">
              {!currentUser ? 'Login to see or file complaints.' : 'No complaints found.'}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const CategoryIcon = categories.find(c => c.name === item.category)?.icon || HelpCircle;
              return (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 flex flex-col p-6 relative group">
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 flex items-center justify-center">
                        <CategoryIcon size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-white line-clamp-1">{item.title}</h3>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{item.category}</span>
                      </div>
                    </div>
                    {currentUser && (currentUser.id === item.user_id || userRole === 'admin') && (
                       <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleEditClick(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit"><Edit size={16}/></button>
                         <button onClick={() => handleDeleteClick(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 size={16}/></button>
                       </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 mb-4">
                    {item.campus && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 font-medium bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg w-fit">
                        <MapPin size={16} className="mr-1 text-yellow-500" /> {item.campus}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 font-medium bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg w-fit">
                      <MapPin size={16} className="mr-1 text-yellow-500" /> Room: {item.room_info}
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">{item.description}</p>
                  
                  {item.image_url && (
                    <img src={item.image_url} alt="Issue" className="w-full h-32 object-cover rounded-xl mb-4 border border-gray-100 dark:border-gray-700" />
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                    <div className="flex items-center gap-2">
                      <img src={item.smit_hub_profiles?.profile_image_url || 'https://via.placeholder.com/40'} alt="User" className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{item.smit_hub_profiles?.full_name || 'User'}</span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${getStatusColor(item.status)}`}>
                      {item.status === 'Pending' && <Clock size={12} className="inline mr-1"/>}
                      {item.status === 'Resolved' && <CheckCircle size={12} className="inline mr-1"/>}
                      {item.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in-up">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors" onClick={() => setIsModalOpen(false)}>
              <XCircle size={28} />
            </button>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              {editId ? 'Update Complaint' : 'File a Complaint'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {userRole === 'admin' && editId && (
                 <div>
                   <label className="text-xs font-bold text-gray-500 mb-1 block">Admin Status Update</label>
                   <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 rounded-xl border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 font-bold text-sm focus:outline-none">
                     <option value="Pending">Pending</option>
                     <option value="In Progress">In Progress</option>
                     <option value="Resolved">Resolved</option>
                   </select>
                 </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="col-span-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" required>
                  {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <select 
                  value={formData.campus} 
                  onChange={(e) => setFormData({...formData, campus: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 appearance-none bg-no-repeat"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5em 1.5em' }}
                  required
                >
                  <option value="" disabled>Select Campus Location</option>
                  <optgroup label="Karachi (Major Hubs)">
                    {campuses["Karachi (Major Hubs)"].map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="National Expansion">
                    {campuses["National Expansion"].map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                </select>
              </div>

              <div>
                <input type="text" placeholder="Lab No. / Floor / Room" value={formData.room_info} onChange={(e) => setFormData({...formData, room_info: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" required />
              </div>

              <div>
                <input type="text" placeholder="Issue Title (e.g. WiFi not connecting)" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20" required />
              </div>
              
              <div>
                <textarea rows="3" placeholder="Please describe the issue in detail..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 resize-none" required></textarea>
              </div>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" onClick={() => fileInputRef.current.click()}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-28 mx-auto rounded-xl object-cover" />
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">
                    <ImageIcon className="mx-auto mb-2 opacity-50" size={32} />
                    <p className="font-medium text-sm">Attach a photo (Optional but helpful)</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={(e) => { if(e.target.files[0]) { setImageFile(e.target.files[0]); setPreviewUrl(URL.createObjectURL(e.target.files[0])); } }} className="hidden" accept="image/*" />
              </div>

              <button type="submit" disabled={uploading} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex justify-center items-center">
                {uploading ? <Loader2 className="animate-spin" /> : (editId ? 'Update Complaint' : 'Submit Complaint')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;