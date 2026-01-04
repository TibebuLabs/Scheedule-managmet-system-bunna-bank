import React, { useState } from 'react';
import './MenuItem.css';

const MenuItem = ({ 
  item, 
  sidebarOpen, 
  activeMenu, 
  activeSubMenu, 
  setActiveMenu, 
  setActiveSubMenu,
  darkMode 
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
    <li className="menu-item">
      <button
        className={`menu-button ${activeMenu === item.id ? 'active' : ''} ${
          sidebarOpen ? 'expanded' : 'collapsed'
        } ${darkMode ? 'dark' : 'light'}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={item.label}
        title={!sidebarOpen ? item.label : ''}
      >
        <span className="menu-icon">{item.icon}</span>
        {sidebarOpen && (
          <span className="menu-label">{item.label}</span>
        )}
        {sidebarOpen && item.submenu.length > 0 && (
          <span className={`menu-arrow ${activeMenu === item.id ? 'rotated' : ''}`}>
            ▼
          </span>
        )}
        
        {/* Hover effect */}
        <span className={`hover-effect ${isHovered ? 'hovered' : ''}`} />
        
        {/* Active indicator */}
        <span className="active-indicator" />
      </button>

      {/* Submenu */}
      {sidebarOpen && activeMenu === item.id && item.submenu.length > 0 && (
        <div className="submenu-container">
          <ul className="submenu-list">
            {item.submenu.map((subItem) => (
              <li key={subItem.id} className="submenu-item">
                <button
                  className={`submenu-button ${activeSubMenu === subItem.id ? 'active' : ''} ${
                    darkMode ? 'dark' : 'light'
                  }`}
                  onClick={() => handleSubMenuClick(subItem.id)}
                >
                  <span className="submenu-icon">{subItem.icon}</span>
                  <span className="submenu-label">{subItem.label}</span>
                  <span className="submenu-dot" />
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