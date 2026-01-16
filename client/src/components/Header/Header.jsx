import React, { useState, useEffect, useRef } from 'react';
import { 
  FiSearch, FiMenu, FiBell, FiUser, FiSettings, 
  FiShield, FiLogOut, FiChevronDown, FiX 
} from 'react-icons/fi';
import NotificationsPanel from '../Notifications/NotificationsPanel'; // Assuming this exists
// If ThemeToggle is a separate component, keep import. Otherwise, a simple button is used below.
import ThemeToggle from '../ThemeToggle/ThemeToggle'; 

const Header = ({ 
  darkMode, 
  setDarkMode, 
  notifications, 
  markNotificationAsRead, 
  deleteNotification,
  searchQuery,
  setSearchQuery,
  onLogout,
  onProfileClick,
  onSettingsClick,
  onPrivacyClick,
  user,
  isMobile,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  // Refs for click-outside detection
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-40 w-full border-b transition-colors duration-200 
      ${darkMode 
        ? 'bg-slate-900/80 border-slate-800 text-slate-100' 
        : 'bg-white/80 border-slate-200 text-slate-800'
      } backdrop-blur-md`}
    >
      <div className="flex items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        
        {/* --- Left Section: Toggle & Search --- */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          )}

          {/* Desktop Search Bar */}
          {!isMobile && (
            <div className={`relative w-full max-w-md transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <FiSearch size={18} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search staff, tasks, or files..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all
                  ${darkMode 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                  }`}
              />
              <div className="absolute inset-y-0 right-2 flex items-center">
                <kbd className={`hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded border ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-400' : 'bg-slate-100 border-slate-300 text-slate-500'}`}>
                  CMD+K
                </kbd>
              </div>
            </div>
          )}
        </div>

        {/* --- Right Section: Actions --- */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2.5 rounded-full transition-all duration-200 group
                ${showNotifications 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                  : (darkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900')
                }`}
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
              )}
            </button>
            
            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 md:w-96 origin-top-right z-50 animate-in fade-in slide-in-from-top-2">
                <div className={`rounded-2xl shadow-xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <NotificationsPanel
                    notifications={notifications}
                    markNotificationAsRead={markNotificationAsRead}
                    deleteNotification={deleteNotification}
                    onClose={() => setShowNotifications(false)}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={userRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-3 p-1.5 pl-3 rounded-full border transition-all duration-200 
                ${showUserMenu 
                  ? 'border-blue-500 ring-2 ring-blue-500/20' 
                  : (darkMode ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-800' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50')
                }`}
            >
              {!isMobile && (
                <div className="text-right hidden md:block">
                  <p className={`text-sm font-semibold leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {user?.fullName || 'Admin User'}
                  </p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {user?.position || 'Administrator'}
                  </p>
                </div>
              )}
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                {user?.fullName?.charAt(0) || 'A'}
              </div>
              <FiChevronDown className={`mr-1 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''} ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} size={16} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className={`absolute right-0 mt-3 w-64 rounded-2xl shadow-xl border origin-top-right z-50 overflow-hidden animate-in fade-in slide-in-from-top-2
                ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}
              >
                {/* Mobile User Info inside Dropdown */}
                <div className={`p-4 border-b ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user?.fullName || 'Admin User'}</p>
                  <p className={`text-xs truncate ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email || 'admin@bunnabank.com'}</p>
                </div>

                <div className="p-2 space-y-1">
                  <MenuItem icon={FiUser} label="Profile" onClick={onProfileClick} darkMode={darkMode} />
                  <MenuItem icon={FiSettings} label="Settings" onClick={onSettingsClick} darkMode={darkMode} />
                  <MenuItem icon={FiShield} label="Privacy & Security" onClick={onPrivacyClick} darkMode={darkMode} />
                  
                  <div className={`my-2 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`} />
                  
                  <MenuItem 
                    icon={FiLogOut} 
                    label="Sign Out" 
                    onClick={onLogout} 
                    darkMode={darkMode} 
                    danger 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Sub-component for Menu Items
const MenuItem = ({ icon: Icon, label, onClick, darkMode, danger }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors
      ${danger 
        ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' 
        : (darkMode 
          ? 'text-slate-300 hover:text-white hover:bg-slate-800' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
      }`}
  >
    <Icon size={16} className={danger ? 'text-red-500' : ''} />
    {label}
  </button>
);


export default Header;