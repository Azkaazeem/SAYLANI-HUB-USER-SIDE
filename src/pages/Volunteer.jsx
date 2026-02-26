import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../components/lib/supabaseClient';
import Swal from 'sweetalert2';
import { HeartHandshake, XCircle, Loader2, Image as ImageIcon, QrCode, CreditCard, Edit, CheckCircle, Clock } from 'lucide-react';
import smitLogo from '../assets/SMIT.png';

const smitBlue = '#014990';
const smitGreen = '#65A338';

// Admin ke liye Event Options
const timings = ["Morning (09:00 AM - 01:00 PM)", "Afternoon (02:00 PM - 06:00 PM)", "Evening (07:00 PM - 10:00 PM)", "Full Day Event"];
const events = ["Mega Hackathon 2026", "IT Seminar", "Entry Test Management", "Career Counseling Session", "General Campus Duty"];

const CardHeader = () => (
  <div className="w-full flex flex-col items-center">
    <div className="h-8 w-full" style={{ backgroundColor: smitBlue }}></div>
    <img src={smitLogo} alt="SMIT Logo" className="h-16 mt-4 object-contain" />
    <div className="text-center mt-3 text-sm font-bold">
      <span style={{ color: smitBlue }}>Saylani Mass </span>
      <span style={{ color: smitGreen }}>IT Training Program</span>
    </div>
  </div>
);

const Volunteer = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  // State for Direct Download ID Card
  const [appToPrint, setAppToPrint] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('guest');

  // Form States (Sirf zaroori fields)
  const [formData, setFormData] = useState({
    full_name: '', roll_no: '', phone: '', email: '',
    event_name: '', event_timing: '', event_location: '', status: 'Pending'
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
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

    const { data: appData, error } = await supabase.from('volunteer_applications').select('*').order('created_at', { ascending: false });

    if (!error && appData) {
      const visibleData = appData.filter(app => {
        if (currentRole === 'admin') return true;
        if (user && app.user_id === user.id) return true;
        return false;
      });
      setApplications(visibleData);
    }
    setLoading(false);
  };

  // Generate unique 6 digit ID No (max 100,000)
  const generateIdCardNo = () => {
    return String(Math.floor(Math.random() * 100000) + 1).padStart(6, '0');
  };

  const handleApplyClick = () => {
    if (!currentUser) {
      Swal.fire({ icon: 'info', title: 'Login Required', text: 'Log in to apply as a volunteer.', confirmButtonColor: '#66b032' });
      return;
    }
    setSelectedApp(null);
    setFormData({ full_name: '', roll_no: '', phone: '', email: '', event_name: '', event_timing: '', event_location: '', status: 'Pending' });
    setImageFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (app) => {
    setSelectedApp(app);
    setFormData({
      full_name: app.full_name, roll_no: app.roll_no, phone: app.phone, email: app.email,
      event_name: app.event_name || '', event_timing: app.event_timing || '', event_location: app.event_location || '', status: app.status
    });
    setPreviewUrl(app.profile_image_url);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDownloadIdCard = (app) => {
    if ((app.status || '').toLowerCase() !== 'approved') {
      Swal.fire({ icon: 'info', title: 'Approval Pending', text: 'You can download the ID card once Admin approves it.', confirmButtonColor: '#66b032' });
      return;
    }
    setAppToPrint(app);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone || !formData.roll_no) {
      Swal.fire({ icon: 'warning', title: 'Missing Fields', text: 'Please fill out all required fields.' });
      return;
    }

    setSubmitting(true);
    let imageUrl = previewUrl;

    if (imageFile) {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const { error: uploadError } = await supabase.storage.from('smit-hub-images').upload(`volunteers/${fileName}`, imageFile);
      if (!uploadError) {
        const { data } = supabase.storage.from('smit-hub-images').getPublicUrl(`volunteers/${fileName}`);
        imageUrl = data.publicUrl;
      }
    }

    const payload = {
      user_id: currentUser.id, full_name: formData.full_name, roll_no: formData.roll_no, phone: formData.phone,
      email: formData.email, profile_image_url: imageUrl, event_name: formData.event_name,
      event_timing: formData.event_timing, event_location: formData.event_location, status: formData.status,
      // Default dummy values for old required columns
      skills: 'General', availability: 'Any', motivation: 'Community Service'
    };

    let dbError;
    if (selectedApp) {
      const { error } = await supabase.from('volunteer_applications').update(payload).eq('id', selectedApp.id);
      dbError = error;
    } else {
      // UNIQUE NUMBER LOGIC
      let newIdNo;
      const existingIds = applications.map(a => a.id_card_no);
      do {
        newIdNo = String(Math.floor(Math.random() * 100000) + 1).padStart(6, '0');
      } while (existingIds.includes(newIdNo));

      payload.id_card_no = newIdNo;
      const { error } = await supabase.from('volunteer_applications').insert([payload]);
      dbError = error;
    }

    setSubmitting(false);

    if (dbError) {
      Swal.fire({ icon: 'error', title: 'Error', text: dbError.message });
    } else {
      Swal.fire({ icon: 'success', title: selectedApp ? 'Updated!' : 'Application Submitted!', showConfirmButton: false, timer: 1500 });
      setIsModalOpen(false);
      fetchData();
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 md:px-8 animate-page-fade relative">

      {/* MAIN CONTENT: Hidden during print */}
      <div className="max-w-7xl mx-auto print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center gap-3 mb-2">
              <HeartHandshake className="text-primary-green" size={36} /> Volunteer Portal
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Register yourself and generate your Volunteer ID Card.</p>
          </div>
          <button onClick={handleApplyClick} className="mt-4 md:mt-0 bg-[#65A338] hover:bg-[#528f28] text-white px-8 py-3 rounded-full font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
            <CreditCard size={20} /> Apply Now
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#65A338]" /></div>
        ) : applications.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
            <HeartHandshake className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400">
              {userRole === 'guest' ? 'Please log in to see your applications.' : 'No applications found. Click Apply Now!'}
            </h3>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                    <th className="p-5 font-bold">Volunteer Details</th>
                    <th className="p-5 font-bold">Applied On</th>
                    <th className="p-5 font-bold">Status</th>
                    <th className="p-5 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <img src={app.profile_image_url || 'https://via.placeholder.com/40'} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                          <div>
                            <p className="font-bold text-gray-800 dark:text-white">{app.full_name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">Roll No: {app.roll_no}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-sm text-gray-600 dark:text-gray-400">
                        <Clock size={14} className="inline mr-1 mb-0.5 text-[#65A338]" />
                        {formatDate(app.created_at)}
                      </td>
                      <td className="p-5">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${(app.status || '').toLowerCase() === 'approved' ? 'bg-green-100 text-green-700' : (app.status || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {userRole === 'admin' && (
                            <button onClick={() => handleEditClick(app)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Admin Edit">
                              <Edit size={18} />
                            </button>
                          )}
                          <button onClick={() => handleDownloadIdCard(app)} className="p-2 text-[#65A338] hover:bg-green-50 rounded-lg flex items-center gap-1 font-bold text-sm transition-colors" title="Download ID Card">
                            <QrCode size={18} /> <span className="hidden sm:inline">Download Card</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in-up print:hidden">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors" onClick={() => setIsModalOpen(false)}><XCircle size={28} /></button>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{selectedApp ? 'Manage Application' : 'Volunteer Registration Form'}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full border-4 border-gray-100 dark:border-gray-700 overflow-hidden mb-3 cursor-pointer group relative" onClick={() => fileInputRef.current.click()}>
                  {previewUrl ? <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-400"><ImageIcon size={24} /></div>}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-xs font-bold">Upload</span></div>
                </div>
                <input type="file" ref={fileInputRef} onChange={(e) => { if (e.target.files[0]) { setImageFile(e.target.files[0]); setPreviewUrl(URL.createObjectURL(e.target.files[0])); } }} className="hidden" accept="image/*" />
              </div>

              {/* USER INPUTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">Full Name</label><input type="text" placeholder="Ali Raza" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-[#65A338]" required disabled={userRole === 'admin' && selectedApp} /></div>
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">Roll No</label><input type="text" placeholder="e.g. 263541" value={formData.roll_no} onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-[#65A338]" required disabled={userRole === 'admin' && selectedApp} /></div>
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">Mobile No</label><input type="tel" placeholder="0300-1234567" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-[#65A338]" required disabled={userRole === 'admin' && selectedApp} /></div>
                <div><label className="text-xs font-bold text-gray-500 mb-1 block">Email</label><input type="email" placeholder="ali@gmail.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:bg-gray-900 dark:text-white focus:outline-none focus:border-[#65A338]" required disabled={userRole === 'admin' && selectedApp} /></div>
              </div>

              {/* ADMIN INPUTS */}
              {userRole === 'admin' && (
                <div className="border-t-2 border-dashed border-gray-200 pt-6 mt-6">
                  <h3 className="text-lg font-bold text-[#014990] mb-4 flex items-center gap-2"><CheckCircle size={20} /> Admin Controls</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-gray-500 mb-1 block">Status Update</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-[#65A338] bg-green-50 font-bold text-sm focus:outline-none"><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option></select></div>
                    <div><label className="text-xs font-bold text-gray-500 mb-1 block">Assign Event</label><select value={formData.event_name} onChange={(e) => setFormData({ ...formData, event_name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#014990]"><option value="">-- Select Event --</option>{events.map(ev => <option key={ev} value={ev}>{ev}</option>)}</select></div>
                    <div><label className="text-xs font-bold text-gray-500 mb-1 block">Event Timing</label><select value={formData.event_timing} onChange={(e) => setFormData({ ...formData, event_timing: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#014990]"><option value="">-- Select Timing --</option>{timings.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                    <div><label className="text-xs font-bold text-gray-500 mb-1 block">Event Location / Campus</label><input type="text" placeholder="e.g. Bahadurabad Campus" value={formData.event_location} onChange={(e) => setFormData({ ...formData, event_location: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#014990]" /></div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={submitting} className="w-full bg-[#65A338] hover:bg-[#528f28] text-white font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center mt-6 text-lg">
                {submitting ? <Loader2 className="animate-spin" /> : (selectedApp ? 'Save Admin Changes' : 'Submit Volunteer Form')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* PRINT VIEW ONLY: DITTO COPY DESIGN */}
      {appToPrint && (
        <div className="hidden print:flex flex-col md:flex-row gap-8 items-center justify-center min-h-screen bg-gray-100 p-4 font-sans absolute top-0 left-0 w-full z-[9999]">

          {/* ================= FRONT CARD ================= */}
          <div className="w-[320px] min-h-[500px] bg-white shadow-xl flex flex-col items-center border border-gray-200 shrink-0">
            <CardHeader />

            <div className="mt-6 relative w-40 h-40 rounded-full p-1 border-4" style={{ borderColor: smitBlue }}>
              <div className="w-full h-full rounded-full border-4 overflow-hidden bg-blue-50 flex items-center justify-center" style={{ borderColor: smitGreen }}>
                <img src={appToPrint.profile_image_url || 'https://via.placeholder.com/150'} alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>

            <h1 className="text-3xl font-bold mt-4 text-black uppercase leading-tight text-center px-2 line-clamp-1">{appToPrint.full_name}</h1>
            <p className="text-lg text-black mt-1 mb-2">Volunteer</p>

            <p className="text-lg mt-2 mb-6">
              <span className="font-bold">Roll No: </span> {appToPrint.roll_no}
            </p>

            <div className="mt-auto h-8 w-full" style={{ backgroundColor: smitGreen }}></div>
          </div>

          {/* ================= BACK CARD ================= */}
          <div className="w-[320px] min-h-[500px] bg-white shadow-xl flex flex-col border border-gray-200 shrink-0">
            <CardHeader />

            <div className="w-full px-6 mt-6 flex flex-col gap-3 flex-grow">
              {[
                { label: 'Name:', value: appToPrint.full_name || '-' },
                { label: 'Email:', value: appToPrint.email || '-' },
                { label: 'Mobile No:', value: appToPrint.phone || '-' },
                { label: 'Location:', value: appToPrint.event_location || 'Not Assigned' },
                { label: 'Timing:', value: appToPrint.event_timing || 'Not Assigned' },
                { label: 'Roll No:', value: appToPrint.roll_no || '-' },
                { label: 'ID Card No:', value: appToPrint.id_card_no || '-' },
              ].map((field, index) => (
                <div key={index} className="flex items-end gap-2">
                  <span className="font-bold text-[15px] text-black whitespace-nowrap">{field.label}</span>
                  <div className="flex-1 border-b border-black text-[14px] text-black pb-0.5">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full flex justify-center mt-6 mb-6">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=RollNo:${appToPrint.roll_no},Name:${appToPrint.full_name},ID:${appToPrint.id_card_no}`}
                alt="QR Code"
                className="w-20 h-20"
              />
            </div>

            <div className="mt-auto h-8 w-full" style={{ backgroundColor: smitGreen }}></div>
          </div>

        </div>
      )}

    </div>
  );
};

export default Volunteer;