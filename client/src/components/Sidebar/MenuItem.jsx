import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const MenuItem = ({ 
  item, 
  sidebarOpen, 
  activeMenu, 
  activeSubMenu, 
  setActiveMenu, 
  setActiveSubMenu,
  darkMode,
  isMobile
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isActive = activeMenu === item.id;
  const hasSubmenu = item.submenu && item.submenu.length > 0;

  const handleClick = () => {
    setActiveMenu(item.id);
    if (hasSubmenu) {
      // Toggle submenu: If already active, close it (set to null), else open first item or just expand
      if (activeMenu === item.id) {
         // Optional: Toggle collapse if clicking active parent? 
         // For now, we keep it simple: clicking parent keeps it active.
      } else {
        setActiveSubMenu(null); // Reset submenu when switching parents
      }
    } else {
      setActiveSubMenu(null);
    }
  };

  return (
    <li className="relative px-2 mb-1">
      {/* Main Menu Item */}
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 group
          ${isActive 
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
          }
          ${!sidebarOpen && !isMobile ? 'justify-center px-0' : ''}
        `}
      >
        {/* Active Indicator Strip (Left) */}
        {isActive && !sidebarOpen && !isMobile && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
        )}

        {/* Icon */}
        <div className={`
          flex items-center justify-center transition-transform duration-300
          ${isActive ? 'scale-105' : 'group-hover:scale-105'}
        `}>
          <item.icon size={22} className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'} />
        </div>

        {/* Label (Sidebar Open) */}
        {(sidebarOpen || isMobile) && (
          <div className="flex-1 flex items-center justify-between overflow-hidden">
            <span className={`text-sm font-medium truncate ${isActive ? 'font-semibold' : ''}`}>
              {item.label}
            </span>
            
            {hasSubmenu && (
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-300 ${isActive ? 'rotate-180 text-white/80' : 'text-slate-400'}`} 
              />
            )}
          </div>
        )}

        {/* Tooltip (Sidebar Closed) */}
        {!sidebarOpen && !isMobile && (
          <div className={`
            absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2 py-1 
            bg-slate-900 dark:bg-slate-800 text-white text-xs rounded opacity-0 pointer-events-none 
            transition-all duration-200 z-50 whitespace-nowrap
            group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2
          `}>
            {item.label}
          </div>
        )}
      </button>

      {/* Submenu Dropdown */}
      <div className={`
        overflow-hidden transition-all duration-300 ease-in-out
        ${(sidebarOpen || isMobile) && isActive && hasSubmenu ? 'max-h-64 opacity-100 mt-1' : 'max-h-0 opacity-0'}
      `}>
        <ul className="space-y-1 pl-4 ml-3 border-l-2 border-slate-200 dark:border-slate-700">
          {item.submenu?.map((subItem) => (
            <li key={subItem.id}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSubMenu(subItem.id);
                }}
                className={`
                  w-full flex items-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors
                  ${activeSubMenu === subItem.id 
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-medium' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }
                `}
              >
                {/* Small indicator dot */}
                <div className={`
                  w-1.5 h-1.5 rounded-full transition-colors
                  ${activeSubMenu === subItem.id ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600 group-hover:bg-slate-400'}
                `} />
                <span className="truncate">{subItem.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
};

export default MenuItem;