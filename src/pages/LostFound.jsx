import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../components/lib/supabaseClient';
import Swal from 'sweetalert2';
import { Search, PlusCircle, MapPin, Image as ImageIcon, XCircle, Loader2, Edit, Trash2 } from 'lucide-react';

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

const LostFound = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); 
  const [searchQuery, setSearchQuery] = useState(''); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('user');

  const [formData, setFormData] = useState({ type: 'Lost', title: '', description: '', campus: '', status: 'Pending' });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editId, setEditId] = useState(null); 
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUser();
    fetchItems();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
      const { data, error } = await supabase
        .from('smit_hub_profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!error && data && data.role) {
        setUserRole(data.role);
      }
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    
    const { data: itemsData, error: itemsError } = await supabase
      .from('lost_found_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (itemsError) {
      console.error("Error fetching items:", itemsError);
      setLoading(false);
      return;
    }

    if (itemsData && itemsData.length > 0) {
      const activeItems = itemsData.filter(item => item.is_deleted !== true);

      if (activeItems.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const userIds = [...new Set(activeItems.map(item => item.user_id))];

      const { data: profilesData } = await supabase
        .from('smit_hub_profiles')
        .select('id, full_name, profile_image_url')
        .in('id', userIds);

      const profileMap = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          profileMap[profile.id] = profile;
        });
      }

      const mergedItems = activeItems.map(item => ({
        ...item,
        smit_hub_profiles: profileMap[item.user_id] || { full_name: 'Unknown User', profile_image_url: null }
      }));

      setItems(mergedItems);
    } else {
      setItems([]); 
    }
    
    setLoading(false);
  };

  const handleReportClick = async () => {
    if (!currentUser) {
      Swal.fire({
        icon: 'info',
        title: 'Login Required',
        text: 'You need to be logged in to report an item.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }
    setEditId(null);
    setFormData({ type: 'Lost', title: '', description: '', campus: '', status: 'Pending' });
    setImageFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setEditId(item.id);
    setFormData({
      type: item.type,
      title: item.title,
      description: item.description,
      campus: item.campus || '',
      status: item.status || 'Pending'
    });
    setPreviewUrl(item.image_url);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This item will be removed from the feed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, remove it!'
    });

    if (result.isConfirmed) {
      const { error } = await supabase
        .from('lost_found_items')
        .update({ is_deleted: true })
        .eq('id', id);

      if (!error) {
        Swal.fire('Removed!', 'Your post has been removed from public view.', 'success');
        fetchItems();
      } else {
        Swal.fire('Error!', error.message, 'error');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.campus) {
      Swal.fire({ icon: 'warning', title: 'Missing Fields', text: 'Please fill out all fields including Campus.' });
      return;
    }

    setUploading(true);
    let imageUrl = previewUrl; 

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('smit-hub-images').upload(fileName, imageFile);
      
      if (!uploadError) {
        const { data } = supabase.storage.from('smit-hub-images').getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }
    }

    const payload = {
      user_id: currentUser.id,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      campus: formData.campus,
      status: formData.status,
      image_url: imageUrl
    };

    let dbError;
    if (editId) {
      const { error } = await supabase.from('lost_found_items').update(payload).eq('id', editId);
      dbError = error;
    } else {
      const { error } = await supabase.from('lost_found_items').insert([payload]);
      dbError = error;
    }

    setUploading(false);

    if (dbError) {
      Swal.fire({ icon: 'error', title: 'Error', text: dbError.message });
    } else {
      
      // ==========================================
      // NOTIFICATION LOGIC (NEWLY ADDED)
      // ==========================================
      if (!editId) { // Sirf new post par notification jaye, edit par nahi
        const notificationMessage = `New ${formData.type} item reported: ${formData.title} at ${formData.campus}.`;
        
        const { error: notifError } = await supabase
          .from('notifications')
          .insert([{ message: notificationMessage }]);
          
        if (notifError) {
          console.error("Failed to send notification:", notifError);
        }
      }
      // ==========================================

      Swal.fire({ 
        icon: 'success', 
        title: editId ? 'Updated Successfully!' : 'Posted Successfully!', 
        showConfirmButton: false, 
        timer: 1500 
      });
      setIsModalOpen(false);
      fetchItems();
    }
  };

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'All' || item.type === filter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      item.title?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.campus?.toLowerCase().includes(searchLower);
      
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 py-10 px-4 md:px-8 animate-page-fade relative">
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center gap-3">
              <Search className="text-blue-600" size={32} /> Lost & Found
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Help the community recover their belongings.</p>
          </div>
          
          <button 
            onClick={handleReportClick}
            className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <PlusCircle size={20} /> Report an Item
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex gap-2 sm:gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {['All', 'Lost', 'Found'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 sm:px-6 py-2.5 rounded-full font-bold transition-all duration-300 whitespace-nowrap ${filter === f ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search by name, campus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <Search className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No matching items found.' : 'No items reported yet.'}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group flex flex-col relative">
                
                <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400"><ImageIcon size={48} /></div>
                  )}
                  <div className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-md ${item.type === 'Lost' ? 'bg-red-500' : 'bg-green-500'}`}>
                    {item.type}
                  </div>
                  
                  {currentUser && (currentUser.id === item.user_id || userRole === 'admin') && (
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button onClick={() => handleEditClick(item)} className="p-2 bg-white/90 hover:bg-white text-blue-600 rounded-full shadow-md transition-transform hover:scale-110" title="Edit Post">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteClick(item.id)} className="p-2 bg-white/90 hover:bg-white text-red-500 rounded-full shadow-md transition-transform hover:scale-110" title="Remove Post">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-1">{item.title}</h3>
                  
                  {item.campus && (
                    <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-semibold mb-3">
                      <MapPin size={16} className="mr-1 shrink-0" />
                      <span className="truncate">{item.campus}</span>
                    </div>
                  )}

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">{item.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto">
                    <div className="flex items-center gap-2">
                      <img src={item.smit_hub_profiles?.profile_image_url || 'https://via.placeholder.com/40'} alt="User" className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{item.smit_hub_profiles?.full_name || 'User'}</span>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-lg ${item.status === 'Resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
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
              {editId ? 'Edit Post' : 'Report an Item'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <label className={`flex-1 py-3 text-center rounded-xl cursor-pointer font-bold border-2 transition-all ${formData.type === 'Lost' ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                  <input type="radio" className="hidden" name="type" value="Lost" checked={formData.type === 'Lost'} onChange={(e) => setFormData({...formData, type: e.target.value})} /> Lost
                </label>
                <label className={`flex-1 py-3 text-center rounded-xl cursor-pointer font-bold border-2 transition-all ${formData.type === 'Found' ? 'border-green-500 bg-green-50 text-green-600 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                  <input type="radio" className="hidden" name="type" value="Found" checked={formData.type === 'Found'} onChange={(e) => setFormData({...formData, type: e.target.value})} /> Found
                </label>
              </div>

              {userRole === 'admin' && editId && (
                 <div className="mb-4">
                   <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-blue-600 font-bold text-sm bg-blue-50 dark:bg-blue-900/10">
                     <option value="Pending">Status: Pending</option>
                     <option value="Resolved">Status: Resolved (Returned/Found)</option>
                   </select>
                 </div>
              )}

              <div>
                <input type="text" placeholder="Item Name (e.g., Blue Wallet)" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" required />
              </div>
              
              <div>
                <select 
                  value={formData.campus} 
                  onChange={(e) => setFormData({...formData, campus: e.target.value})} 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 appearance-none bg-no-repeat"
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
                <textarea rows="3" placeholder="Description details..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 resize-none" required></textarea>
              </div>

              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => fileInputRef.current.click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-28 mx-auto rounded-xl object-cover" />
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">
                    <ImageIcon className="mx-auto mb-2 opacity-50" size={32} />
                    <p className="font-medium text-sm">Click to upload image (Optional)</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              </div>

              <button type="submit" disabled={uploading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex justify-center items-center">
                {uploading ? <Loader2 className="animate-spin" /> : (editId ? 'Update Post' : 'Submit Report')}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default LostFound;