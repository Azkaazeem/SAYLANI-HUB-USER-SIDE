import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';

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
import NotFound from './pages/NotFound';
import DashboardLayout from './pages/DashboardLayout';

function App() {
  const [isDark, setIsDark] = useState(() => {
    const storedTheme = localStorage.getItem('theme');
    return storedTheme === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <Router>
      <Routes>
        {/* Layout ko direct element mein wrap kiya gaya hai taake hook error na aaye */}
        <Route 
          element={
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Navbar isDark={isDark} toggleTheme={toggleTheme} />
              <Outlet />
            </div>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/features" element={<Features />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/my-id-cards" element={<MyIdCards />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="/admin" element={<DashboardLayout isDark={isDark} toggleTheme={toggleTheme} />} />
      </Routes>
    </Router>
  );
}

export default App;