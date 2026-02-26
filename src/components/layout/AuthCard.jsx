import React from 'react';

const AuthCard = ({ children }) => {
  return (
    // Removed the side borders and slant effect. Added deeper, softer shadows and larger border radius.
    <div className="w-full max-w-xl bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700/50 relative overflow-hidden transition-all duration-300 animate-fade-in-up z-10">
      {children}
    </div>
  );
};

export default AuthCard;