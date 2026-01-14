import React, { useState } from 'react';

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

  const handleClick = () => {
    setActiveMenu(item.id);
    if (item.submenu.length > 0) {
      setActiveSubMenu(activeSubMenu === item.id ? null : item.submenu[0].id);
    } else {
      setActiveSubMenu(null);
    }
  };

  const handleSubMenuClick = (subItemId) => {
    setActiveSubMenu(subItemId);
  };

  return (
    <li className="mx-1 md:mx-2 relative">
      {/* Main Menu Button */}
      <button
        className={`
          w-full rounded-2xl transition-all duration-300 ease-out relative overflow-hidden
          flex items-center gap-3 md:gap-4 text-left
          ${sidebarOpen ? 'px-4 py-3' : 'px-3 py-3 justify-center'}
          ${activeMenu === item.id ? 
            'bg-gradient-to-r from-indigo-500/20 to-purple-500/10 text-indigo-600 dark:text-indigo-400 font-semibold' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }
          hover:bg-gray-100 dark:hover:bg-white/10
          hover:translate-x-1
          group
          ${darkMode ? 'dark' : ''}
        `}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={item.label}
        title={!sidebarOpen ? item.label : ''}
      >
        {/* Hover effect */}
        <div className={`
          absolute inset-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent
          transition-all duration-500 ease-in-out
          ${darkMode ? 'via-white/5' : 'via-gray-200/30'}
          ${isHovered ? 'left-full' : '-left-full'}
        `} />

        {/* Active indicator */}
        <div className={`
          absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0
          bg-gradient-to-b from-indigo-500 to-purple-500
          rounded-r transition-all duration-300 ease-out
          ${activeMenu === item.id ? 'h-12' : 'h-0'}
        `} />

        {/* Icon */}
        <span className={`
          text-xl transition-transform duration-300 flex-shrink-0
          group-hover:scale-110
          ${activeMenu === item.id ? 'animate-pulse' : ''}
        `}>
          {item.icon}
        </span>

        {/* Label */}
        {sidebarOpen && (
          <span className="flex-1 truncate text-sm font-medium">
            {item.label}
          </span>
        )}

        {/* Arrow for submenu */}
        {sidebarOpen && item.submenu.length > 0 && (
          <span className={`
            text-xs transition-transform duration-300 text-gray-500 dark:text-gray-400
            ${activeMenu === item.id ? 'rotate-180 text-indigo-500 dark:text-indigo-400' : ''}
          `}>
            ▼
          </span>
        )}
      </button>

      {/* Submenu */}
      {sidebarOpen && activeMenu === item.id && item.submenu.length > 0 && (
        <div className="mt-1 mb-2 ml-8 md:ml-10 animate-slideDown">
          <ul className="border-l-2 border-gray-300 dark:border-gray-700 pl-3 space-y-1">
            {item.submenu.map((subItem) => (
              <li key={subItem.id} className="relative">
                <button
                  className={`
                    w-full rounded-xl transition-all duration-300 ease-out
                    flex items-center gap-3 px-3 py-2.5
                    ${activeSubMenu === subItem.id ?
                      'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }
                    hover:bg-gray-100 dark:hover:bg-white/10
                    hover:translate-x-1
                    group
                  `}
                  onClick={() => handleSubMenuClick(subItem.id)}
                >
                  {/* Submenu Icon */}
                  <span className="text-lg flex-shrink-0">
                    {subItem.icon}
                  </span>

                  {/* Submenu Label */}
                  <span className="flex-1 truncate text-sm">
                    {subItem.label}
                  </span>

                  {/* Dot indicator */}
                  <div className={`
                    w-1.5 h-1.5 rounded-full transition-opacity duration-300
                    ${activeSubMenu === subItem.id ?
                      'bg-indigo-500 dark:bg-indigo-400 opacity-100 animate-pulse'
                      : 'bg-gray-400 dark:bg-gray-500 opacity-0 group-hover:opacity-100'
                    }
                  `} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
};

export default MenuItem;