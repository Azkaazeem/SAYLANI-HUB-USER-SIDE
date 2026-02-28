import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ThemeToggle from '../ui/ThemeToggle';
import smitLogo from '../../assets/SMIT.png';
import { LogOut, User, Edit2, Menu, X, XCircle, LayoutDashboard } from 'lucide-react';
import Swal from 'sweetalert2';
import NotificationSidebar from '../ui/NotificationSidebar';

const Navbar = ({ isDark, toggleTheme }) => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Lost & Found', path: '/lost-found' },
    { name: 'Complaints', path: '/complaints' },
    { name: 'Volunteer', path: '/volunteer' },
    { name: 'My ID Cards', path: '/my-id-cards' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setProfileData(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    const { data } = await supabase
      .from('smit_hub_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) setProfileData(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    Swal.fire({ icon: 'success', title: 'Logged Out', timer: 1500, showConfirmButton: false });
    setIsMobileMenuOpen(false);
    navigate('/auth');
  };

  const handleImageUpdate = async (e) => {
    const file = e.target.files[0];
    if (!file || !user || !profileData) return;

    setIsAvatarModalOpen(false);
    Swal.fire({ title: 'Updating Profile...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    const fileExt = file.name.split('.').pop();
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `profile-pics/${uniqueFileName}`;

    const { error: uploadError } = await supabase.storage.from('smit-hub-avatars').upload(filePath, file);
    if (uploadError) {
      Swal.fire({ icon: 'error', title: 'Upload Failed', text: uploadError.message });
      return;
    }

    const { data: urlData } = supabase.storage.from('smit-hub-avatars').getPublicUrl(filePath);
    const newImageUrl = urlData.publicUrl;

    await supabase.from('profile_updates').insert([{
      user_id: user.id,
      full_name: profileData.full_name,
      email: profileData.email,
      phone: profileData.phone,
      new_image_url: newImageUrl
    }]);

    await supabase.from('smit_hub_profiles').update({ profile_image_url: newImageUrl }).eq('id', user.id);

    setProfileData({ ...profileData, profile_image_url: newImageUrl });
    Swal.fire({ icon: 'success', title: 'Image Updated!', timer: 1500, showConfirmButton: false });
  };

  const navLinkStyle = ({ isActive }) =>
    `transition-all duration-300 font-semibold whitespace-nowrap ${isActive ? 'text-primary-green font-bold drop-shadow-md lg:scale-105' : 'text-gray-600 dark:text-gray-300 hover:text-primary-blue dark:hover:text-white'}`;

  const isAdmin = user?.email === 'admin@gmail.com' || profileData?.role === 'admin';

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">

            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <img src={smitLogo} alt="Logo" className="h-10 md:h-12 w-auto mr-3" />
            </div>

            <div className="hidden lg:flex space-x-8 items-center">
              {navLinks.map((link) => (
                <NavLink key={link.name} to={link.path} className={navLinkStyle}>{link.name}</NavLink>
              ))}
            </div>

            {/* ---> RIGHT SIDEBAR BUTTONS <--- */}
            <div className="flex items-center space-x-3 md:space-x-4">
              
              <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
              
              {/* ---> YAHAN NOTIFICATION SIDEBAR LAGA DIYA HAI <--- */}
              <NotificationSidebar />

              {user ? (
                <div className="flex items-center space-x-3">

                  {isAdmin && (
                    <a
                      href="https://saylani-hub-admin-side.vercel.app/"
                      className="hidden md:flex items-center text-sm font-bold bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Admin Panel
                    </a>
                  )}

                  <div
                    className="relative w-10 h-10 rounded-full border-2 border-primary-green overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-700 cursor-pointer shadow-sm hover:ring-2 ring-primary-green/50 transition-all"
                    onClick={() => setIsAvatarModalOpen(true)}
                  >
                    {profileData?.profile_image_url ? (
                      <img src={profileData.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  <button onClick={handleLogout} className="hidden sm:flex items-center text-sm font-semibold text-red-500 hover:text-red-700 transition-colors">
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </button>
                </div>
              ) : (
                <button onClick={() => navigate('/auth')} className="hidden lg:block bg-[#66b032] hover:bg-green-600 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                  Login Portal
                </button>
              )}

              <button
                className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full bg-white dark:bg-gray-800 shadow-2xl border-t border-gray-100 dark:border-gray-700 animate-fade-in-up z-40 origin-top">
            <div className="flex flex-col px-6 py-6 space-y-5">

              {isAdmin && (
                <a
                  href="https://saylani-hub-admin-side.vercel.app/"
                  className="flex justify-center items-center text-lg font-bold bg-red-600 text-white py-3 rounded-xl mb-2"
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" /> Go to Admin Panel
                </a>
              )}

              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) => `block text-lg ${isActive ? 'text-primary-green font-bold' : 'text-gray-600 dark:text-gray-300 font-semibold'}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.name}
                </NavLink>
              ))}

              <hr className="border-gray-200 dark:border-gray-700 my-2" />

              {user ? (
                <button onClick={handleLogout} className="flex items-center text-lg font-bold text-red-500 w-full">
                  <LogOut className="w-6 h-6 mr-3" /> Logout
                </button>
              ) : (
                <button onClick={() => { navigate('/auth'); setIsMobileMenuOpen(false); }} className="w-full bg-[#66b032] text-white py-3.5 rounded-full font-bold text-lg shadow-md">
                  Login Portal
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <input type="file" ref={fileInputRef} onChange={handleImageUpdate} className="hidden" accept="image/*" />

      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in-up">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm relative flex flex-col items-center">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors" onClick={() => setIsAvatarModalOpen(false)}>
              <XCircle size={28} />
            </button>
            <h3 className="text-xl font-bold text-primary-blue dark:text-white mb-6">Profile Picture</h3>
            <div className="w-40 h-40 rounded-full border-4 border-primary-green overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-700 shadow-inner mb-8">
              {profileData?.profile_image_url ? (
                <img src={profileData.profile_image_url} alt="Profile Large" className="w-full h-full object-cover" />
              ) : (
                <User className="w-20 h-20 text-gray-400" />
              )}
            </div>
            <button onClick={() => fileInputRef.current.click()} className="w-full bg-primary-blue hover:bg-primary-blue/90 text-white font-semibold py-3 rounded-xl transition-all shadow-md flex items-center justify-center">
              <Edit2 size={18} className="mr-2" /> Change Picture
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;