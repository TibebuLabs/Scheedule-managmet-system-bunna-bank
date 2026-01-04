import React, { useState } from 'react';
import NotificationsPanel from '../Notifications/NotificationsPanel';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './Header.css';

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

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <header className={`header ${darkMode ? 'dark' : 'light'}`}>
      <div className="header-left">
        {isMobile && (
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`menu-icon ${mobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        )}
        
        {!isMobile && (
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search"
            />
            <button className="search-filter" aria-label="Filter">
              <span>⚙️</span>
            </button>
          </div>
        )}
      </div>

      <div className="header-right">
        {isMobile && (
          <button className="mobile-search-toggle" aria-label="Search">
            <span>🔍</span>
          </button>
        )}

        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        
        <div className="notifications-container">
          <button 
            className={`notifications-button ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={`Notifications ${unreadNotifications > 0 ? `(${unreadNotifications} unread)` : ''}`}
          >
            <span className="bell-icon">🔔</span>
            {unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}
          </button>
          
          {showNotifications && (
            <NotificationsPanel
              notifications={notifications}
              markNotificationAsRead={markNotificationAsRead}
              deleteNotification={deleteNotification}
              onClose={() => setShowNotifications(false)}
              darkMode={darkMode}
            />
          )}
        </div>

        <div className="user-menu-container">
          <button 
            className="user-profile-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="User menu"
          >
            <div className="user-avatar">
              <span>{user?.fullName?.charAt(0) || 'A'}</span>
            </div>
            {!isMobile && (
              <div className="user-details">
                <span className="user-name">{user?.fullName || 'Admin User'}</span>
                <span className="user-role">{user?.position || 'Administrator'}</span>
              </div>
            )}
            <span className="user-arrow">▼</span>
          </button>

          {showUserMenu && (
            <div className="user-menu-dropdown">
              <div className="user-menu-header">
                <div className="dropdown-avatar">
                  <span>{user?.fullName?.charAt(0) || 'A'}</span>
                </div>
                <div className="dropdown-user-info">
                  <h4>{user?.fullName || 'Admin User'}</h4>
                  <p>{user?.email || 'admin@bunnabank.com'}</p>
                </div>
              </div>
              <div className="user-menu-items">
                <button className="menu-item" onClick={onProfileClick}>
                  <span>👤</span>
                  <span>Profile</span>
                </button>
                <button className="menu-item" onClick={onSettingsClick}>
                  <span>⚙️</span>
                  <span>Settings</span>
                </button>
                <button className="menu-item" onClick={onPrivacyClick}>
                  <span>🛡️</span>
                  <span>Privacy</span>
                </button>
                <div className="menu-divider" />
                <button className="menu-item logout" onClick={onLogout}>
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;