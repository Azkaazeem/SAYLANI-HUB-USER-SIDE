import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, count, icon: Icon, variant }) => {
  // Theme variants define kar rahe hain
  const themes = {
    blue: {
      wrapper: 'bg-gradient-to-br from-[#014990] to-[#01366b]',
      iconBg: 'bg-white/20',
      textColor: 'text-blue-100',
    },
    green: {
      wrapper: 'bg-gradient-to-br from-[#65A338] to-[#528f28]',
      iconBg: 'bg-white/20',
      textColor: 'text-green-100',
    },
    orange: { // Complaints ke liye thora different color
      wrapper: 'bg-gradient-to-br from-orange-500 to-red-500',
      iconBg: 'bg-white/20',
      textColor: 'text-orange-100',
    }
  };

  const theme = themes[variant] || themes.blue;

  return (
    <div className={`${theme.wrapper} p-6 rounded-[2rem] shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}>
      
      {/* Background Decoration Circle */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
      
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <p className={`text-sm font-bold uppercase tracking-wider ${theme.textColor} mb-1`}>
            {title}
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            {count}
          </h2>
        </div>
        
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${theme.iconBg} text-white shadow-sm backdrop-blur-sm`}>
          <Icon size={28} />
        </div>
      </div>

      {/* Fake Trend Indicator (Just for looks) */}
      <div className={`mt-4 inline-flex items-center gap-1 text-xs font-semibold ${theme.textColor} bg-white/10 px-3 py-1 rounded-full`}>
        <TrendingUp size={14} /> 
        <span>Active Now</span>
      </div>
    </div>
  );
};

export default StatCard;