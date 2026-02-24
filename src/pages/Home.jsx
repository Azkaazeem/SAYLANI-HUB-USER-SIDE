import React from 'react';
import { Link } from 'react-router-dom';
import { Search, AlertCircle, HeartHandshake, ArrowRight, ChevronDown } from 'lucide-react';
// import hero from '../assets/hero.jpg'

const FeatureCard = ({ title, description, linkTo, icon: Icon, colorTheme, delay }) => (
  <div 
    className="group relative bg-white dark:bg-gray-800 p-8 md:p-10 rounded-[2.5rem] shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden border border-gray-50 dark:border-gray-700/50 flex flex-col h-full"
    style={{ animationDelay: delay }}
  >
    {/* Decorative background circle on hover */}
    <div className={`absolute -top-10 -right-10 w-40 h-40 opacity-10 rounded-full transition-transform duration-700 ease-out group-hover:scale-[2.5] ${colorTheme.bg}`}></div>
    
    {/* Cute Icon Container */}
    <div className={`w-16 h-16 rounded-2xl mb-8 flex items-center justify-center shadow-sm ${colorTheme.bg} ${colorTheme.text} transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300`}>
      <Icon size={32} strokeWidth={2.5} />
    </div>

    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 relative z-10">{title}</h3>
    
    <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mb-8 leading-relaxed relative z-10 flex-grow">
      {description}
    </p>

    <Link to={linkTo} className="inline-block w-full mt-auto relative z-10">
      <button className={`w-full py-4 rounded-xl font-bold text-white transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group-hover:gap-4 ${colorTheme.btnBg}`}>
        Explore {title}
        <ArrowRight size={18} />
      </button>
    </Link>
  </div>
);

const Home = () => {
  return (
    <div className="animate-page-fade bg-gray-50 dark:bg-gray-900 min-h-screen">
      
      {/* 1. HERO SECTION (100vh) */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
   
        
{/* Background Image (Massive IT Classroom Vibe) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed animate-ken-burns"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/90 via-primary-blue/70 to-primary-green/80 dark:from-gray-900/95 dark:to-gray-800/90 mix-blend-multiply"></div>

        {/* Center Content (Beautiful Glassmorphism Card) */}
        <div className="relative z-10 text-center px-6 max-w-5xl animate-fade-in-up flex flex-col items-center mt-[-64px]">
          
          <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md border border-white/20 dark:border-white/10 p-8 md:p-14 rounded-[3rem] shadow-2xl">
            <div className="inline-block px-5 py-2 rounded-full bg-white/20 text-white text-xs md:text-sm font-semibold mb-6 backdrop-blur-md border border-white/30 shadow-sm animate-pulse">
              ✨ Welcome to your campus portal
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md">
              Saylani <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                Mass IT Hub
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto font-medium leading-relaxed drop-shadow">
              A centralized portal for all campus students and staff. Manage your activities, report issues, and contribute to our community all in one place.
            </p>
          </div>

        </div>
        
        {/* Bouncy Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce flex flex-col items-center text-white/80 cursor-pointer">
            <span className="text-xs font-bold tracking-widest uppercase mb-2 opacity-80">Scroll</span>
            <ChevronDown size={28} />
        </div>
      </div>

      {/* 2. CUTE FEATURE CARDS SECTION */}
      <div className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Decorative Glowing Blobs Behind Cards */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary-blue/10 dark:bg-primary-blue/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-green/10 dark:bg-primary-green/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-800 dark:text-white mb-4">
              Everything you need, <span className="text-primary-blue dark:text-primary-green">in one place.</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto font-medium">
              Select a module below to get started. Designed with love, simplicity, and a touch of magic.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            <FeatureCard 
              title="Lost & Found" 
              description="Did you lose something important or find an item? Help out the community by posting it right here."
              linkTo="/lost-found"
              icon={Search}
              delay="0.1s"
              colorTheme={{
                bg: 'bg-blue-100 dark:bg-blue-900/40',
                text: 'text-primary-blue dark:text-blue-400',
                btnBg: 'bg-primary-blue hover:bg-blue-700'
              }}
            />
            <FeatureCard 
              title="Complaints" 
              description="Report issues regarding internet, electricity, or maintenance directly to the admin for a quick fix."
              linkTo="/complaints"
              icon={AlertCircle}
              delay="0.3s"
              colorTheme={{
                bg: 'bg-yellow-100 dark:bg-yellow-900/40',
                text: 'text-yellow-600 dark:text-yellow-400',
                btnBg: 'bg-yellow-500 hover:bg-yellow-600'
              }}
            />
            <FeatureCard 
              title="Volunteer" 
              description="Give back to the community by signing up as a volunteer for upcoming campus events and activities."
              linkTo="/volunteer"
              icon={HeartHandshake}
              delay="0.5s"
              colorTheme={{
                bg: 'bg-green-100 dark:bg-green-900/40',
                text: 'text-primary-green dark:text-green-400',
                btnBg: 'bg-primary-green hover:bg-green-700'
              }}
            />
          </div>

        </div>
      </div>

      {/* 3. MODERN FOOTER */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700/50 py-10 transition-colors duration-300 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="mb-6 md:mb-0">
                <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-blue to-primary-green">
                  Saylani Mass IT Hub
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Empowering students through modern technology.</p>
            </div>
            <div className="text-sm font-medium text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 py-2 px-4 rounded-full">
                Made with <HeartHandshake size={16} className="text-red-500 animate-pulse" /> by SMIT Students &copy; {new Date().getFullYear()}
            </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;