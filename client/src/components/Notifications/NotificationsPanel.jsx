import React from "react";
import { Bell, CheckCheck, Trash2, Settings, Inbox } from "lucide-react";
import NotificationItem from "./NotificationItem";

const NotificationsPanel = ({
  notifications,
  markNotificationAsRead,
  deleteNotification,
  onClose,
  darkMode,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = () => {
    notifications.forEach((n) => !n.read && markNotificationAsRead(n.id));
  };

  const handleClearAll = () => {
    if (window.confirm("Clear all notifications?")) {
      notifications.forEach((n) => deleteNotification(n.id));
    }
  };

  return (
    <div
      className={`flex flex-col h-full w-full max-h-[85vh] md:h-[600px] ${
        darkMode ? "text-slate-200" : "text-slate-800"
      }`}
    >
      {/* --- Header --- */}
      <div
        className={`flex-shrink-0 px-5 py-4 border-b flex items-center justify-between
        ${
          darkMode
            ? "border-slate-800 bg-slate-900"
            : "border-slate-100 bg-white"
        }`}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-500 text-white shadow-sm shadow-blue-500/30">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <ActionButton
            onClick={handleMarkAllAsRead}
            title="Mark all as read"
            icon={CheckCheck}
            darkMode={darkMode}
          />
          <ActionButton
            onClick={handleClearAll}
            title="Clear all"
            icon={Trash2}
            darkMode={darkMode}
            danger
          />
        </div>
      </div>

      {/* --- Scrollable List --- */}
      <div
        className={`flex-1 overflow-y-auto scrollbar-thin
        ${
          darkMode
            ? "scrollbar-thumb-slate-700 scrollbar-track-slate-800"
            : "scrollbar-thumb-slate-200 scrollbar-track-slate-50"
        }`}
      >
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
            <div
              className={`p-4 rounded-full ${
                darkMode
                  ? "bg-slate-800 text-slate-600"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <Inbox size={32} />
            </div>
            <div>
              <p
                className={`font-medium ${
                  darkMode ? "text-slate-300" : "text-slate-900"
                }`}
              >
                All caught up!
              </p>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-slate-500" : "text-slate-500"
                }`}
              >
                No new notifications to show.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* Optional: Group by Date could go here in future */}
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                markNotificationAsRead={markNotificationAsRead}
                deleteNotification={deleteNotification}
                darkMode={darkMode}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- Footer --- */}
      <div
        className={`flex-shrink-0 p-3 border-t text-center
        ${
          darkMode
            ? "border-slate-800 bg-slate-900"
            : "border-slate-100 bg-gray-50"
        }`}
      >
        <button
          className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg text-sm font-medium transition-colors
            ${
              darkMode
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 hover:shadow-sm"
            }
          `}
        >
          <Settings size={14} />
          Notification Settings
        </button>
      </div>
    </div>
  );
};

// Sub-component for Header Actions to keep code clean
const ActionButton = ({ onClick, title, icon: Icon, darkMode, danger }) => (
  <button
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-all duration-200
      ${
        danger
          ? darkMode
            ? "hover:bg-red-900/30 text-slate-400 hover:text-red-400"
            : "hover:bg-red-50 text-slate-400 hover:text-red-500"
          : darkMode
          ? "hover:bg-slate-800 text-slate-400 hover:text-blue-400"
          : "hover:bg-slate-100 text-slate-400 hover:text-blue-600"
      }
    `}
  >
    <Icon size={16} />
  </button>
);

export default NotificationsPanel;
