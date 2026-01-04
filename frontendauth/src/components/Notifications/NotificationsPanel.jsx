import React from 'react';
import NotificationItem from './NotificationItem';
import './NotificationsPanel.css';

const NotificationsPanel = ({ notifications, markNotificationAsRead, deleteNotification, onClose, darkMode }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        markNotificationAsRead(notification.id);
      }
    });
  };

  const handleClearAll = () => {
    notifications.forEach(notification => {
      deleteNotification(notification.id);
    });
  };

  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <div className="header-left">
          <h3>Notifications</h3>
          {unreadCount > 0 && (
            <span className="unread-count">{unreadCount} new</span>
          )}
        </div>
        <div className="header-right">
          <button className="header-button" onClick={handleMarkAllAsRead}>
            Mark all read
          </button>
          <button className="header-button clear" onClick={handleClearAll}>
            Clear all
          </button>
        </div>
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h4>No notifications</h4>
            <p>You're all caught up!</p>
          </div>
        ) : (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              markNotificationAsRead={markNotificationAsRead}
              deleteNotification={deleteNotification}
            />
          ))
        )}
      </div>

      <div className="notifications-footer">
        <button className="footer-button">
          <span>⚙️</span>
          Notification settings
        </button>
      </div>
    </div>
  );
};

export default NotificationsPanel;