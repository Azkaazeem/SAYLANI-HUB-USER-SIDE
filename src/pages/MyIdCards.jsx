import React, { useState, useEffect } from 'react';
import { supabase } from '../components/lib/supabaseClient';
import { Loader2, Printer, ShieldAlert } from 'lucide-react';
import smitLogo from '../assets/SMIT.png';

const smitBlue = '#014990';
const smitGreen = '#65A338';

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

const MyIdCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyCards();
  }, []);

const fetchMyCards = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    // Yahan humne .ilike() use kiya hai jo capital aur small dono match karta hai
    const { data, error } = await supabase
      .from('volunteer_applications')
      .select('*')
      .eq('user_id', user.id)
      .ilike('status', 'approved');

    if (!error && data) setCards(data);
    setLoading(false);
  };

  const handleDownloadPDF = () => {
    window.print(); 
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 animate-page-fade print:bg-white print:py-0">
      <div className="max-w-7xl mx-auto print:m-0">
        
        {/* Header - Hidden during print */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 print:hidden">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0057a8] dark:text-white">My ID Cards</h1>
            <p className="text-gray-500 font-medium mt-1">View and download your official Saylani Volunteer ID Cards.</p>
          </div>
          {cards.length > 0 && (
            <button onClick={handleDownloadPDF} className="mt-4 md:mt-0 bg-[#0057a8] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition-transform hover:scale-105">
              <Printer size={20} /> Download PDF / Print
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20 print:hidden"><Loader2 className="w-10 h-10 animate-spin text-[#0057a8]" /></div>
        ) : cards.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 print:hidden">
            <ShieldAlert className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-500">No approved ID cards found.</h3>
            <p className="text-sm text-gray-400 mt-2">Apply as a volunteer and wait for admin approval.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-16 items-center print:block print:w-full">
            {cards.map(app => (
              <div key={app.id} className="flex flex-col md:flex-row gap-8 justify-center items-center print:flex-row print:justify-center print:gap-8 print:mb-12 print:break-inside-avoid font-sans">
                 
                 {/* ================= FRONT CARD ================= */}
                 <div className="w-[320px] min-h-[500px] bg-white shadow-xl flex flex-col items-center border border-gray-200 shrink-0 print:shadow-none print:border-2">
                   <CardHeader />

                   {/* Circular Avatar */}
                   <div className="mt-6 relative w-40 h-40 rounded-full p-1 border-4" style={{ borderColor: smitBlue }}>
                     <div className="w-full h-full rounded-full border-4 overflow-hidden bg-blue-50 flex items-center justify-center" style={{ borderColor: smitGreen }}>
                       <img src={app.profile_image_url || 'https://via.placeholder.com/150'} alt="Profile" className="w-full h-full object-cover" />
                     </div>
                   </div>

                   {/* User Info */}
                   <h1 className="text-3xl font-bold mt-4 text-black text-center px-2 uppercase leading-tight line-clamp-1">{app.full_name}</h1>
                   <p className="text-lg text-black mt-1 mb-2 font-semibold">Volunteer</p>
                   
                   <p className="text-lg mt-2 mb-6">
                     <span className="font-bold">Roll No: </span> {app.roll_no}
                   </p>

                   {/* Bottom Green Bar */}
                   <div className="mt-auto h-8 w-full" style={{ backgroundColor: smitGreen }}></div>
                 </div>

                 {/* ================= BACK CARD ================= */}
                 <div className="w-[320px] min-h-[500px] bg-white shadow-xl flex flex-col border border-gray-200 shrink-0 print:shadow-none print:border-2">
                   <CardHeader />

                   {/* Form Fields */}
                   <div className="w-full px-6 mt-6 flex flex-col gap-3 flex-grow">
                     {[
                       { label: 'Name:', value: app.full_name || '-' },
                       { label: 'Email:', value: app.email || '-' },
                       { label: 'Mobile No:', value: app.phone || '-' },
                       { label: 'Location:', value: app.event_location || 'Campus' },
                       { label: 'Timing:', value: app.event_timing || '-' },
                       { label: 'Roll No:', value: app.roll_no || '-' },
                       { label: 'ID Card No:', value: app.id_card_no || '-' },
                     ].map((field, index) => (
                       <div key={index} className="flex items-end gap-2">
                         <span className="font-bold text-[14px] text-black whitespace-nowrap">{field.label}</span>
                         <div className="flex-1 border-b border-black text-[13px] text-black pb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                           {field.value}
                         </div>
                       </div>
                     ))}
                   </div>

                   {/* QR Code */}
                   <div className="w-full flex justify-center mt-4 mb-6">
                     <img 
                       src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=RollNo:${app.roll_no},Name:${app.full_name},ID:${app.id_card_no}`} 
                       alt="QR Code" 
                       className="w-20 h-20"
                     />
                   </div>

                   {/* Bottom Green Bar */}
                   <div className="mt-auto h-8 w-full" style={{ backgroundColor: smitGreen }}></div>
                 </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyIdCards;