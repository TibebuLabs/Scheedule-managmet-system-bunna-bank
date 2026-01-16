import React from "react";
import {
  ClipboardCheck,
  Users,
  Clock,
  UserPlus,
  Bell,
  X,
  Circle,
} from "lucide-react";

const NotificationItem = ({
  notification,
  markNotificationAsRead,
  deleteNotification,
  darkMode,
}) => {
  // Configuration for different notification types
  const getTypeConfig = (type) => {
    switch (type) {
      case "task":
        return {
          icon: ClipboardCheck,
          color: "text-blue-500",
          bg: "bg-blue-50 dark:bg-blue-900/20",
        };
      case "meeting":
        return {
          icon: Users,
          color: "text-purple-500",
          bg: "bg-purple-50 dark:bg-purple-900/20",
        };
      case "shift":
        return {
          icon: Clock,
          color: "text-amber-500",
          bg: "bg-amber-50 dark:bg-amber-900/20",
        };
      case "staff":
        return {
          icon: UserPlus,
          color: "text-emerald-500",
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
        };
      default:
        return {
          icon: Bell,
          color: "text-slate-500",
          bg: "bg-slate-100 dark:bg-slate-800",
        };
    }
  };

  const { icon: Icon, color, bg } = getTypeConfig(notification.type);

  return (
    <div
      onClick={() => markNotificationAsRead(notification.id)}
      className={`group relative flex gap-4 p-4 border-b cursor-pointer transition-all duration-200
        ${
          darkMode
            ? "border-slate-800 hover:bg-slate-800/50"
            : "border-slate-100 hover:bg-slate-50"
        }
        ${
          !notification.read
            ? darkMode
              ? "bg-slate-800/30"
              : "bg-blue-50/30"
            : ""
        }
      `}
    >
      {/* Icon Section */}
      <div
        className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${bg} ${color}`}
      >
        <Icon size={20} />
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex justify-between items-start gap-2">
          <h4
            className={`text-sm font-semibold truncate ${
              darkMode ? "text-slate-200" : "text-slate-800"
            } ${!notification.read ? "font-bold" : ""}`}
          >
            {notification.title}
          </h4>
          <span
            className={`text-[10px] whitespace-nowrap ${
              darkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {notification.time}
          </span>
        </div>

        <p
          className={`text-xs leading-relaxed line-clamp-2 ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {notification.message}
        </p>
      </div>

      {/* Actions Section */}
      <div className="flex flex-col items-end gap-2">
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNotification(notification.id);
          }}
          className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity
            ${
              darkMode
                ? "hover:bg-slate-700 text-slate-500"
                : "hover:bg-slate-200 text-slate-400"
            }
          `}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
