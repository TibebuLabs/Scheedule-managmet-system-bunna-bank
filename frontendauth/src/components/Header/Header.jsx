import React, { useState, useRef, useEffect } from 'react';
import NotificationsPanel from '../Notifications/NotificationsPanel';
import {
  FaSearch,
  FaBell,
  FaUser,
  FaCog,
  FaShieldAlt,
  FaSignOutAlt,
  FaChevronDown,
  FaBars,
  FaTimes
} from 'react-icons/fa';
import './Header.css';

const Header = ({
  notifications = [],
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
  const [searchFocused, setSearchFocused] = useState(false);
  const userMenuRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const initial = user?.fullName?.charAt(0)?.toUpperCase() || 'A';

  // Click outside listener to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bank-header">
      {/* Left side: Hamburger (mobile) + Search Input */}
      <div className="bank-header-left">
        {isMobile && (
          <button
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        )}

        <div className={`bank-search-bar ${searchFocused ? 'focused' : ''}`}>
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input-field"
            placeholder="Search staff, shifts, tasks, departments..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            aria-label="Search Bunna Bank system"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Right side: Notifications + User Profile */}
      <div className="bank-header-right">
        {/* Notifications */}
        <div className="header-action-container" ref={notifRef}>
          <button
            className={`notif-bell-btn ${showNotifications ? 'active' : ''} ${unreadCount > 0 ? 'has-unread' : ''}`}
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <FaBell className="bell-icon" />
            {unreadCount > 0 && (
              <span className="notif-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
                <span className="pulse-ring" />
              </span>
            )}
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

        {/* Divider */}
        <div className="header-v-divider" />

        {/* User Menu */}
        <div className="header-action-container" ref={userMenuRef}>
          <button
            className={`user-profile-trigger ${showUserMenu ? 'active' : ''}`}
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            aria-label="Open user profile menu"
          >
            <div className="avatar-circle">
              <span>{initial}</span>
              <span className="online-indicator" />
            </div>

            <div className="user-text-info">
              <span className="user-display-name">{user?.fullName || 'Admin User'}</span>
              <span className="user-display-role">{user?.position || user?.department || 'Administrator'}</span>
            </div>

            <FaChevronDown className={`chevron-icon ${showUserMenu ? 'rotated' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="user-dropdown-card animate-slide-down">
              {/* Profile Card Header */}
              <div className="dropdown-profile-header">
                <div className="dropdown-large-avatar">
                  <span>{initial}</span>
                </div>
                <div className="dropdown-user-meta">
                  <h4 className="meta-name">{user?.fullName || 'Admin User'}</h4>
                  <p className="meta-email">{user?.email || 'admin@bunnabank.com'}</p>
                  <span className="meta-dept-badge">
                    {user?.department || 'Administration'} • {user?.position || 'Staff'}
                  </span>
                </div>
              </div>

              {/* Menu Links */}
              <div className="dropdown-links-list">
                <button
                  className="dropdown-menu-item"
                  onClick={() => {
                    onProfileClick?.();
                    setShowUserMenu(false);
                  }}
                >
                  <div className="item-icon-box">
                    <FaUser size={13} />
                  </div>
                  <div className="item-labels">
                    <span className="title">My Profile</span>
                    <span className="sub">Personal details & contact info</span>
                  </div>
                </button>

                <button
                  className="dropdown-menu-item"
                  onClick={() => {
                    onSettingsClick?.();
                    setShowUserMenu(false);
                  }}
                >
                  <div className="item-icon-box">
                    <FaCog size={13} />
                  </div>
                  <div className="item-labels">
                    <span className="title">Account Settings</span>
                    <span className="sub">Preferences & schedule views</span>
                  </div>
                </button>

                <button
                  className="dropdown-menu-item"
                  onClick={() => {
                    onPrivacyClick?.();
                    setShowUserMenu(false);
                  }}
                >
                  <div className="item-icon-box">
                    <FaShieldAlt size={13} />
                  </div>
                  <div className="item-labels">
                    <span className="title">Security & Privacy</span>
                    <span className="sub">Password & sessions</span>
                  </div>
                </button>

                <div className="dropdown-divider" />

                <button
                  className="dropdown-menu-item logout-item"
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout?.();
                  }}
                >
                  <div className="item-icon-box logout-icon">
                    <FaSignOutAlt size={13} />
                  </div>
                  <div className="item-labels">
                    <span className="title text-red-600">Sign Out</span>
                    <span className="sub">End current bank session</span>
                  </div>
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
