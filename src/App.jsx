import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import AuthPage from './pages/AuthPage';
import PlaceholderPage from './pages/PlaceholderPage';
import LostFound from './pages/LostFound';
import Complaints from './pages/Complaints';

function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Navbar isDark={isDark} toggleTheme={toggleTheme} />
        
<Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/features" element={<PlaceholderPage title="Features" />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/complaints" element={<Complaints />} />
          <Route path="/volunteer" element={<PlaceholderPage title="Volunteer" />} />
          <Route path="/about" element={<PlaceholderPage title="About Us" />} />
          <Route path="/contact" element={<PlaceholderPage title="Contact" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;