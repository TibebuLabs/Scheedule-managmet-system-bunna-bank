import React, { useState, useEffect } from 'react';
import bunnaBankLogo from '../../assets/bunnab.png';
import {
  MdDashboard,
  MdPeople,
  MdTask,
  MdCalendarMonth,
  MdBarChart,
  MdSettings,
  MdPersonAdd,
  MdVisibility,
  MdAddTask,
  MdSchedule,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdExpandMore,
  MdCircle
} from 'react-icons/md';
import './Sidebar.css';

const menuSections = [
  {
    sectionLabel: 'OVERVIEW',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: MdDashboard,
        submenu: []
      }
    ]
  },
  {
    sectionLabel: 'OPERATIONS',
    items: [
      {
        id: 'staff',
        label: 'Staff Members',
        icon: MdPeople,
        badge: 'Team',
        submenu: [
          { id: 'add-staff', label: 'Add New Staff', icon: MdPersonAdd },
          { id: 'view-staff', label: 'Staff Directory', icon: MdVisibility }
        ]
      },
      {
        id: 'task',
        label: 'Duty Tasks',
        icon: MdTask,
        submenu: [
          { id: 'add-task', label: 'Create Task', icon: MdAddTask },
          { id: 'view-task', label: 'Active Tasks', icon: MdVisibility }
        ]
      },
      {
        id: 'TaskSchedule',
        label: 'Shift Schedules',
        icon: MdCalendarMonth,
        submenu: [
          { id: 'add-schedule', label: 'Assign Schedule', icon: MdSchedule },
          { id: 'view-schedule', label: 'Schedule Calendar', icon: MdVisibility }
        ]
      }
    ]
  },
  {
    sectionLabel: 'SYSTEM & INSIGHTS',
    items: [
      {
        id: 'reports',
        label: 'Reports & Analytics',
        icon: MdBarChart,
        submenu: []
      },
      {
        id: 'settings',
        label: 'Portal Settings',
        icon: MdSettings,
        submenu: []
      }
    ]
  }
];

const MenuItem = ({
  item,
  sidebarOpen,
  activeMenu,
  activeSubMenu,
  setActiveMenu,
  setActiveSubMenu,
  onItemClick
}) => {
  const Icon = item.icon;
  const isActive = activeMenu === item.id;
  const hasSubmenu = item.submenu && item.submenu.length > 0;
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
    <li className="menu-list-item">
      <div className="menu-btn-wrapper">
        <button
          onClick={handleClick}
          className={`sidebar-menu-btn ${isActive ? 'active' : ''} ${!sidebarOpen ? 'collapsed' : ''}`}
          aria-expanded={isExpanded}
        >
          {/* Active amber glow bar */}
          {isActive && <span className="active-amber-pill" />}

          <span className="menu-icon-wrap">
            <Icon size={21} />
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

          {/* Collapsed Tooltip */}
          {!sidebarOpen && (
            <div className="collapsed-tooltip">
              {item.label}
              {hasSubmenu && <span className="tooltip-badge">({item.submenu.length})</span>}
            </div>
          )}
        </button>
      </div>

      {/* Submenu with animated accordion */}
      {sidebarOpen && hasSubmenu && (
        <div className={`submenu-wrapper ${isExpanded ? 'open' : 'closed'}`}>
          <ul className="submenu-list">
            {item.submenu.map(sub => {
              const SubIcon = sub.icon;
              const isSubActive = activeSubMenu === sub.id;
              return (
                <li key={sub.id}>
                  <button
                    onClick={() => {
                      setActiveSubMenu(sub.id);
                      onItemClick();
                    }}
                    className={`submenu-btn ${isSubActive ? 'active' : ''}`}
                  >
                    <SubIcon size={15} className="submenu-icon" />
                    <span className="submenu-label">{sub.label}</span>
                    {isSubActive && <MdCircle size={5} className="sub-dot" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
};

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
  setMobileMenuOpen,
  user
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
    return () => {
      document.body.style.overflow = '';
    };
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

  const displayName = user?.fullName || 'Admin User';
  const displayRole = user?.position || user?.department || 'Administrator';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {showOverlay && isMobile && (
        <div className="sidebar-overlay" onClick={closeOnMobile} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'} ${isMobile ? 'mobile' : 'desktop'}`}>
        {/* Header & Logo */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo-frame">
              <img src={bunnaBankLogo} alt="Bunna Bank Logo" className="brand-logo-img" />
            </div>
            {sidebarOpen && (
              <div className="brand-text-block">
                <span className="brand-title">Bunna Bank</span>
                <span className="brand-subtitle">Schedule Portal</span>
              </div>
            )}
          </div>

          {!isMobile && (
            <button
              className="toggle-sidebar-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <MdChevronLeft size={20} /> : <MdChevronRight size={20} />}
            </button>
          )}

          {isMobile && (
            <button className="close-mobile-btn" onClick={closeOnMobile} aria-label="Close sidebar">
              <MdClose size={20} />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav">
          {menuSections.map((sec, idx) => (
            <div key={sec.sectionLabel} className="nav-section-group">
              {sidebarOpen ? (
                <p className="nav-section-header">{sec.sectionLabel}</p>
              ) : (
                <div className="nav-section-divider" />
              )}
              <ul className="section-menu-list">
                {sec.items.map(item => (
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
            </div>
          ))}
        </nav>

        {/* Footer / User Profile Card */}
        <div className="sidebar-footer">
          <button
            className={`sidebar-user-card ${!sidebarOpen ? 'collapsed' : ''}`}
            onClick={() => {
              setActiveMenu('settings');
              setActiveSubMenu(null);
              closeOnMobile();
            }}
            title={!sidebarOpen ? `${displayName} (${displayRole})` : ''}
          >
            <div className="user-avatar-badge">
              <span>{initial}</span>
              <span className="user-online-ping" />
            </div>

            {sidebarOpen && (
              <div className="user-meta-block">
                <span className="user-meta-name">{displayName}</span>
                <span className="user-meta-role">{displayRole}</span>
              </div>
            )}

            {!sidebarOpen && (
              <div className="collapsed-tooltip">
                <div className="font-semibold">{displayName}</div>
                <div className="text-[11px] text-amber-300/80">{displayRole}</div>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
