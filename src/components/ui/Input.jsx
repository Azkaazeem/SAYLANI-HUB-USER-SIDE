import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({ icon: Icon, type = 'text', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  // Check karte hain ke kya yeh password field hai?
  const isPassword = type === 'password';
  
  // Agar password field hai aur showPassword true hai, toh text dikhaye warna password
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="relative">
      <input
        type={inputType}
        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-[#0057a8] focus:border-[#0057a8] block p-2.5 pr-10 transition-colors"
        {...props}
      />
      
      {/* Agar password field hai toh clickable Button (Eye/EyeOff) dikhaye */}
      {isPassword ? (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
        >
          {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      ) : (
        /* Agar normal text/email field hai toh sirf static icon dikhaye */
        Icon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
            <Icon size={20} />
          </div>
        )
      )}
    </div>
  );
};

export default Input;