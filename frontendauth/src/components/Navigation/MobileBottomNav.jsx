import React from 'react';
import { LayoutDashboard, Users, ClipboardList, CalendarDays, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import './MobileBottomNav.css';

const MobileBottomNav = ({ activeMenu, setActiveMenu }) => {
  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'staff', icon: Users, label: 'Staff' },
    { id: 'task', icon: ClipboardList, label: 'Tasks' },
    { id: 'TaskSchedule', icon: CalendarDays, label: 'Schedules' },
    { id: 'more', icon: Menu, label: 'More' }
  ];

  return (
    <motion.div
      className="mobile-bottom-nav"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="nav-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMenu === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              className={`nav-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveMenu(tab.id)}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              aria-label={tab.label}
              title={tab.label}
            >
              <div className="nav-icon-wrapper">
                <Icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`nav-icon ${isActive ? 'active-icon' : ''}`}
                />
              </div>
              <span className="nav-label">{tab.label}</span>
              {isActive && (
                <motion.div
                  className="nav-indicator"
                  layoutId="nav-indicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MobileBottomNav;
