import React, { useState, useEffect } from 'react';
import MenuItem from './MenuItem';
import './Sidebar.css';
// Import the Bunna Bank logo image
import bunnaBankLogo from '../../assets/bunnab.png';

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  darkMode, 
  activeMenu, 
  activeSubMenu, 
  setActiveMenu, 
  setActiveSubMenu,
  isMobile,
  mobileMenuOpen,
  setMobileMenuOpen
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      submenu: []
    },
    {
      id: 'staff',
      label: 'Staff',
      icon: '👥',
      submenu: [
        { id: 'add-staff', label: 'Add Staff', icon: '➕' },
        { id: 'view-staff', label: 'View Staff', icon: '👁️' }
      ]
    },
    {
      id: 'task',
      label: 'Tasks',
      icon: '✅',
      submenu: [
        { id: 'add-task', label: 'Add Task', icon: '➕' },
        { id: 'view-task', label: 'View Tasks', icon: '📋' }
      ]
    },
    {
      id: 'TaskSchedule',
      label: 'Schedule',
      icon: '📅',
      submenu: [
        { id: 'add-schedule', label: 'Add Schedule', icon: '➕' },
        { id: 'view-schedule', label: 'View Schedule', icon: '👁️' }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: '📈',
      submenu: []
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      submenu: []
    }
  ];

  // Handle mobile menu close when clicking on menu item
  const handleMenuItemClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
      setMobileMenuOpen(false);
      setShowOverlay(false);
    }
  };

  // Handle overlay click (close sidebar on mobile)
  const handleOverlayClick = () => {
    setSidebarOpen(false);
    setMobileMenuOpen(false);
    setShowOverlay(false);
  };

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && sidebarOpen && isMobile) {
        setSidebarOpen(false);
        setMobileMenuOpen(false);
        setShowOverlay(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, isMobile, setMobileMenuOpen]);

  // Manage overlay when sidebar opens/closes on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setShowOverlay(true);
      document.body.style.overflow = 'hidden';
    } else {
      setShowOverlay(false);
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [sidebarOpen, isMobile]);

  // Auto-close sidebar when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && sidebarOpen) {
        setSidebarOpen(false);
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen, setMobileMenuOpen]);

  // Don't render sidebar component on mobile when closed
  if (isMobile && !sidebarOpen) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {showOverlay && isMobile && (
        <div 
          className="sidebar-overlay"
          onClick={handleOverlayClick}
          aria-label="Close sidebar"
        />
      )}

      <aside 
        className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'} ${darkMode ? 'dark' : 'light'} ${isMobile ? 'mobile' : 'desktop'}`}
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
      >
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo">
              <div className="logo-icon-wrapper">
                {/* Bunna Bank Logo Image */}
                <div className="logo-image-container">
                  <img 
                    src={bunnaBankLogo}
                    alt="Bunna Bank Logo"
                    className="bunna-bank-logo"
                  />
                </div>
                {sidebarOpen && (
                  <div className="logo-glow"></div>
                )}
              </div>
              {sidebarOpen && (
                <div className="logo-text">
                  <h2>Bunna Bank</h2>
                  <p>Staff Portal</p>
                </div>
              )}
            </div>
            
            {/* Desktop Toggle */}
            {!isMobile && (
              <button 
                className="sidebar-toggle" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                <span className={`toggle-icon ${sidebarOpen ? 'open' : ''}`}>
                  {sidebarOpen ? '‹' : '›'}
                </span>
              </button>
            )}
            
            {/* Mobile Close Button */}
            {isMobile && (
              <button 
                className="sidebar-close"
                onClick={handleOverlayClick}
                aria-label="Close sidebar"
              >
                <span className="close-icon">×</span>
              </button>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          <ul className="menu-list">
            {menuItems.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                sidebarOpen={sidebarOpen}
                activeMenu={activeMenu}
                activeSubMenu={activeSubMenu}
                setActiveMenu={(id) => {
                  setActiveMenu(id);
                  handleMenuItemClick();
                }}
                setActiveSubMenu={(id) => {
                  setActiveSubMenu(id);
                  handleMenuItemClick();
                }}
                darkMode={darkMode}
                isMobile={isMobile}
              />
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div 
            className="user-profile"
            onClick={() => {
              setActiveMenu('settings');
              setActiveSubMenu(null);
              handleMenuItemClick();
            }}
          >
            <div className="avatar-container">
              <div className="avatar">A</div>
              <div className="status-indicator"></div>
            </div>
            {sidebarOpen && (
              <div className="user-info">
                <h4>Admin User</h4>
                <p>Administrator</p>
              </div>
            )}
            {!sidebarOpen && !isMobile && (
              <div className="user-tooltip">Admin</div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;