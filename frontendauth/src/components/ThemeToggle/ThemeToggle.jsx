import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

const ThemeToggle = ({ darkMode, setDarkMode }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleTheme = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setDarkMode(!darkMode);
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    // Add theme class to body for global styles
    document.body.classList.toggle('dark-theme', darkMode);
    document.body.classList.toggle('light-theme', !darkMode);
  }, [darkMode]);

  return (
    <button
      className={`theme-toggle ${darkMode ? 'dark' : 'light'} ${isAnimating ? 'animating' : ''}`}
      onClick={toggleTheme}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="toggle-track">
        <div className="toggle-thumb">
          <Sun className="sun-icon" size={18} strokeWidth={2.5} />
          <Moon className="moon-icon" size={18} strokeWidth={2.5} />
        </div>
      </div>
      <span className="toggle-label">
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </span>
    </button>
  );
};

export default ThemeToggle;