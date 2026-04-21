import React, { useState, useEffect } from 'react';
import bunnaBankLogo from '../../assets/bunnab.png';
import {
  MdDashboard, MdPeople, MdTask, MdCalendarMonth,
  MdBarChart, MdSettings, MdPersonAdd, MdVisibility,
  MdAddTask, MdSchedule, MdChevronLeft, MdChevronRight,
  MdClose, MdExpandMore, MdCircle
} from 'react-icons/md';
import './Sidebar.css';

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: MdDashboard,
    submenu: []
  },
  {
    id: 'staff',
    label: 'Staff',
    icon: MdPeople,
    submenu: [
      { id: 'add-staff', label: 'Add Staff', icon: MdPersonAdd },
      { id: 'view-staff', label: 'View Staff', icon: MdVisibility }
    ]
  },
  {
    id: 'task',
    label: 'Tasks',
    icon: MdTask,
    submenu: [
      { id: 'add-task', label: 'Add Task', icon: MdAddTask },
      { id: 'view-task', label: 'View Tasks', icon: MdVisibility }
    ]
  },
  {
    id: 'TaskSchedule',
    label: 'Schedule',
    icon: MdCalendarMonth,
    submenu: [
      { id: 'add-schedule', label: 'Add Schedule', icon: MdSchedule },
      { id: 'view-schedule', label: 'View Schedule', icon: MdVisibility }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: MdBarChart,
    submenu: []
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: MdSettings,
    submenu: []
  }
];

const MenuItem = ({ item, sidebarOpen, activeMenu, activeSubMenu, setActiveMenu, setActiveSubMenu, onItemClick }) => {
  const Icon = item.icon;
  const isActive = activeMenu === item.id;
  const hasSubmenu = item.submenu.length > 0;
  const isExpanded = isActive && hasSubmenu;

  const handleClick = () => {
    setActiveMenu(item.id);
    if (hasSubmenu) {
      setActiveSubMenu(isActive ? null : item.submenu[0].id);
    } else {
      setActiveSubMenu(null);
      onItemClick();
    }
  };

  return (
    <li>
      <button
        onClick={handleClick}
        title={!sidebarOpen ? item.label : ''}
        className={`sidebar-menu-btn ${isActive ? 'active' : ''} ${!sidebarOpen ? 'collapsed' : ''}`}
      >
        <span className="menu-icon-wrap">
          <Icon size={20} />
        </span>
        {sidebarOpen && (
          <>
            <span className="menu-label">{item.label}</span>
            {hasSubmenu && (
              <MdExpandMore
                size={18}
                className={`menu-arrow ${isExpanded ? 'rotated' : ''}`}
              />
            )}
          </>
        )}
        {isActive && <span className="active-bar" />}
      </button>

      {sidebarOpen && isExpanded && (
        <ul className="submenu">
          {item.submenu.map(sub => {
            const SubIcon = sub.icon;
            const isSubActive = activeSubMenu === sub.id;
            return (
              <li key={sub.id}>
                <button
                  onClick={() => { setActiveSubMenu(sub.id); onItemClick(); }}
                  className={`submenu-btn ${isSubActive ? 'active' : ''}`}
                >
                  <SubIcon size={15} />
                  <span>{sub.label}</span>
                  {isSubActive && <MdCircle size={6} className="sub-dot" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
};

const Sidebar = ({
  sidebarOpen, setSidebarOpen,
  darkMode,
  activeMenu, activeSubMenu,
  setActiveMenu, setActiveSubMenu,
  isMobile, mobileMenuOpen, setMobileMenuOpen
}) => {
  const [showOverlay, setShowOverlay] = useState(false);

  const closeOnMobile = () => {
    if (isMobile) {
      setSidebarOpen(false);
      setMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      setShowOverlay(true);
      document.body.style.overflow = 'hidden';
    } else {
      setShowOverlay(false);
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen, isMobile]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && isMobile && sidebarOpen) {
        setSidebarOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen, isMobile, setSidebarOpen, setMobileMenuOpen]);

  if (isMobile && !sidebarOpen) return null;

  return (
    <>
      {showOverlay && isMobile && (
        <div className="sidebar-overlay" onClick={closeOnMobile} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'} ${isMobile ? 'mobile' : 'desktop'}`}>

        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <img src={bunnaBankLogo} alt="Bunna Bank" />
            </div>
            {sidebarOpen && (
              <div className="brand-text">
                <span className="brand-name">Bunna Bank</span>
                <span className="brand-sub">Staff Portal</span>
              </div>
            )}
          </div>

          {!isMobile && (
            <button
              className="toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <MdChevronLeft size={20} /> : <MdChevronRight size={20} />}
            </button>
          )}

          {isMobile && (
            <button className="close-btn" onClick={closeOnMobile} aria-label="Close">
              <MdClose size={22} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {sidebarOpen && <p className="nav-section-label">MAIN MENU</p>}
          <ul className="menu-list">
            {menuItems.map(item => (
              <MenuItem
                key={item.id}
                item={item}
                sidebarOpen={sidebarOpen}
                activeMenu={activeMenu}
                activeSubMenu={activeSubMenu}
                setActiveMenu={setActiveMenu}
                setActiveSubMenu={setActiveSubMenu}
                onItemClick={closeOnMobile}
              />
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            className={`user-card ${!sidebarOpen ? 'collapsed' : ''}`}
            onClick={() => { setActiveMenu('settings'); setActiveSubMenu(null); closeOnMobile(); }}
            title={!sidebarOpen ? 'Settings' : ''}
          >
            <div className="user-avatar">A</div>
            {sidebarOpen && (
              <div className="user-meta">
                <span className="user-name">Admin User</span>
                <span className="user-role">Administrator</span>
              </div>
            )}
            <span className="online-dot" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
