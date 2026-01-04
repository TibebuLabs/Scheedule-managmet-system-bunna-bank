import React from 'react';
import './NotificationItem.css';

const NotificationItem = ({ notification, markNotificationAsRead, deleteNotification }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'task': return '📋';
      case 'meeting': return '👥';
      case 'shift': return '🔄';
      case 'staff': return '👤';
      default: return '🔔';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'task': return 'var(--primary)';
      case 'meeting': return 'var(--info)';
      case 'shift': return 'var(--warning)';
      case 'staff': return 'var(--success)';
      default: return 'var(--gray-500)';
    }
  };

  return (
    <div 
      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
      onClick={() => markNotificationAsRead(notification.id)}
    >
      <div className="notification-icon" style={{ color: getTypeColor(notification.type) }}>
        {getTypeIcon(notification.type)}
      </div>
      
      <div className="notification-content">
        <div className="notification-header">
          <h4 className="notification-title">{notification.title}</h4>
          <span className="notification-time">{notification.time}</span>
        </div>
        <p className="notification-message">{notification.message}</p>
      </div>
      
      <div className="notification-actions">
        {!notification.read && (
          <div className="unread-dot" />
        )}
        <button 
          className="dismiss-button"
          onClick={(e) => {
            e.stopPropagation();
            deleteNotification(notification.id);
          }}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;