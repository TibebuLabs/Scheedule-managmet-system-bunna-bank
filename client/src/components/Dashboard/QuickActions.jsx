import React from "react";
import {
  FiUserPlus,
  FiPlusSquare,
  FiCalendar,
  FiFileText,
  FiSend,
  FiLayers,
  FiArrowRight,
} from "react-icons/fi";

const QuickActions = ({
  onAddStaff,
  onAddTask,
  onScheduleTasks,
  onViewReports,
  darkMode,
}) => {
  const actions = [
    {
      label: "Add New Staff",
      desc: "Onboard employees",
      icon: FiUserPlus,
      color: "blue",
      onClick: onAddStaff,
    },
    {
      label: "Create Task",
      desc: "Assign new work",
      icon: FiPlusSquare,
      color: "emerald",
      onClick: onAddTask,
    },
    {
      label: "Schedule Shift",
      desc: "Manage roster",
      icon: FiCalendar,
      color: "orange",
      onClick: onScheduleTasks,
    },
    {
      label: "Generate Report",
      desc: "View analytics",
      icon: FiFileText,
      color: "purple",
      onClick: onViewReports,
    },
    {
      label: "Announce",
      desc: "Team blast",
      icon: FiSend,
      color: "rose",
      onClick: () => {}, // Placeholder
    },
    {
      label: "Departments",
      desc: "Org structure",
      icon: FiLayers,
      color: "indigo",
      onClick: () => {}, // Placeholder
    },
  ];

  return (
    <div
      className={`h-full p-6 rounded-2xl border shadow-sm flex flex-col ${
        darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3
            className={`text-lg font-bold ${
              darkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Quick Actions
          </h3>
          <p
            className={`text-xs ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Shortcuts for common tasks
          </p>
        </div>
        <div
          className={`p-2 rounded-lg ${
            darkMode
              ? "bg-slate-700 text-slate-300"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <span className="text-xs font-bold">CMD+K</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
        {actions.map((action, idx) => (
          <ActionTile key={idx} action={action} darkMode={darkMode} />
        ))}
      </div>

      {/* Footer / Recent */}
      <div
        className={`mt-6 pt-4 border-t flex items-center justify-between ${
          darkMode ? "border-slate-700" : "border-slate-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span
            className={`text-xs font-medium ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            System Online
          </span>
        </div>
        <button
          className={`text-xs font-medium hover:underline ${
            darkMode ? "text-blue-400" : "text-blue-600"
          }`}
        >
          View Activity Log
        </button>
      </div>
    </div>
  );
};

const ActionTile = ({ action, darkMode }) => {
  const colorStyles = {
    blue: "text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/20 dark:text-blue-400 dark:group-hover:bg-blue-600 dark:group-hover:text-white",
    emerald:
      "text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-900/20 dark:text-emerald-400 dark:group-hover:bg-emerald-600 dark:group-hover:text-white",
    orange:
      "text-orange-600 bg-orange-50 group-hover:bg-orange-600 group-hover:text-white dark:bg-orange-900/20 dark:text-orange-400 dark:group-hover:bg-orange-600 dark:group-hover:text-white",
    purple:
      "text-purple-600 bg-purple-50 group-hover:bg-purple-600 group-hover:text-white dark:bg-purple-900/20 dark:text-purple-400 dark:group-hover:bg-purple-600 dark:group-hover:text-white",
    rose: "text-rose-600 bg-rose-50 group-hover:bg-rose-600 group-hover:text-white dark:bg-rose-900/20 dark:text-rose-400 dark:group-hover:bg-rose-600 dark:group-hover:text-white",
    indigo:
      "text-indigo-600 bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-900/20 dark:text-indigo-400 dark:group-hover:bg-indigo-600 dark:group-hover:text-white",
  };

  return (
    <button
      onClick={action.onClick}
      className={`group flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
        ${
          darkMode
            ? "bg-slate-800 border-slate-700 hover:border-slate-600"
            : "bg-white border-slate-100 hover:border-slate-200"
        }`}
    >
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
          colorStyles[action.color]
        }`}
      >
        <action.icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <h4
          className={`text-sm font-semibold truncate ${
            darkMode ? "text-slate-200" : "text-slate-800"
          }`}
        >
          {action.label}
        </h4>
        <p
          className={`text-[10px] truncate ${
            darkMode ? "text-slate-500" : "text-slate-500"
          }`}
        >
          {action.desc}
        </p>
      </div>
      <FiArrowRight
        size={14}
        className={`opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 ${
          darkMode ? "text-slate-400" : "text-slate-400"
        }`}
      />
    </button>
  );
};

export default QuickActions;
