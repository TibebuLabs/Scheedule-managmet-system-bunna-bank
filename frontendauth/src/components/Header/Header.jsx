import React, { useState } from 'react';
import NotificationsPanel from '../Notifications/NotificationsPanel';
import './Header.css';

const Header = ({
  notifications, markNotificationAsRead, deleteNotification,
  searchQuery, setSearchQuery,
  onLogout, onProfileClick, onSettingsClick, onPrivacyClick,
  user, isMobile, mobileMenuOpen, setMobileMenuOpen
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="header">
      <div className="header-left">
        {isMobile && (
          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            <span className={`menu-icon ${mobileMenuOpen ? 'open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>
        )}
        {!isMobile && (
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input type="text" className="search-input" placeholder="Search staff, tasks, schedules..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} aria-label="Search" />
          </div>
        )}
      </div>

      <div className="header-right">
        {isMobile && (
          <button className="mobile-search-toggle" aria-label="Search"><span>🔍</span></button>
        )}

        <div className="notifications-container">
          <button className={`notifications-button ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}>
            <span className="bell-icon">🔔</span>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          {showNotifications && (
            <NotificationsPanel
              notifications={notifications}
              markNotificationAsRead={markNotificationAsRead}
              deleteNotification={deleteNotification}
              onClose={() => setShowNotifications(false)}
            />
          )}
        </div>

        <div className="user-menu-container">
          <button className="user-profile-button" onClick={() => setShowUserMenu(!showUserMenu)} aria-label="User menu">
            <div className="user-avatar"><span>{user?.fullName?.charAt(0) || 'A'}</span></div>
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
                <div className="dropdown-avatar"><span>{user?.fullName?.charAt(0) || 'A'}</span></div>
                <div className="dropdown-user-info">
                  <h4>{user?.fullName || 'Admin User'}</h4>
                  <p>{user?.email || 'admin@bunnabank.com'}</p>
                </div>
              </div>
              <div className="user-menu-items">
                <button className="menu-item" onClick={() => { onProfileClick(); setShowUserMenu(false); }}>
                  <span>👤</span><span>Profile</span>
                </button>
                <button className="menu-item" onClick={() => { onSettingsClick(); setShowUserMenu(false); }}>
                  <span>⚙️</span><span>Settings</span>
                </button>
                <button className="menu-item" onClick={() => { onPrivacyClick(); setShowUserMenu(false); }}>
                  <span>🛡️</span><span>Privacy</span>
                </button>
                <div className="menu-divider" />
                <button className="menu-item logout" onClick={onLogout}>
                  <span>🚪</span><span>Logout</span>
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
