import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

// --- USER COMPONENTS IMPORTS ---
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import PlaceholderPage from './pages/PlaceholderPage';
import LostFound from './pages/LostFound';
import Complaints from './pages/Complaints';
import Volunteer from './pages/Volunteer';
import MyIdCards from './pages/MyIdCards';
import Features from './pages/Features';
import About from './pages/About';
import Contact from './pages/Contact';

// --- ADMIN COMPONENT IMPORT ---
import DashboardLayout from './pages/DashboardLayout';

function App() {
  // 1. SMART STATE: Page load hote hi pehle memory check karega, phir render karega!
  const [isDark, setIsDark] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    // Agar memory mein dark hai toh pehli baar mein hi dark (true) load hoga
    return storedTheme === 'dark';
  });

  // 2. SMART EFFECT: Sirf tab chalega jab 'isDark' change hoga
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // 3. SIMPLE TOGGLE
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Yeh ek wrapper banaya hai jo sirf user pages par Navbar dikhayega
  const UserLayout = () => {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        <Outlet />
      </div>
    );
  };

  return (
    <Router>
      <Routes>
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/my-id-cards" element={<MyIdCards />} />
        </Route>

        <Route path="/admin" element={<DashboardLayout isDark={isDark} toggleTheme={toggleTheme} />} />
      </Routes>
    </Router>
  );
}

export default App;