import React, { useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ darkMode, setDarkMode }) => {
  
  // Synchronize Tailwind 'dark' class with state
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className={`
        relative inline-flex h-9 w-16 items-center rounded-full px-1
        transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${darkMode ? 'bg-slate-700 focus:ring-offset-slate-900' : 'bg-blue-100 focus:ring-offset-white'}
      `}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <span className="sr-only">Toggle Theme</span>
      
      {/* Track Icons (Background layer) */}
      <div className="absolute inset-0 flex items-center justify-between px-2.5">
        <Sun 
          size={14} 
          className={`transition-opacity duration-300 ${darkMode ? 'opacity-50 text-slate-400' : 'opacity-100 text-amber-500'}`} 
        />
        <Moon 
          size={14} 
          className={`transition-opacity duration-300 ${darkMode ? 'opacity-100 text-blue-300' : 'opacity-50 text-slate-400'}`} 
        />
      </div>

      {/* Sliding Thumb */}
      <span
        className={`
          relative flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md
          transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]
          ${darkMode ? 'translate-x-7' : 'translate-x-0'}
        `}
      >
        {/* Thumb Icon (Active State) */}
        {darkMode ? (
          <Moon size={14} className="text-slate-900" />
        ) : (
          <Sun size={14} className="text-amber-500" />
        )}
      </span>
    </button>
  );
};

export default ThemeToggle;