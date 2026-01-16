import React from "react";
import { FiTrendingUp, FiCheckCircle, FiBriefcase } from "react-icons/fi";

const WelcomeBanner = ({
  darkMode,
  userName = "Admin",
  stats = { tasks: 5, completed: 12, performance: 98 },
  date,
}) => {
  // Logic for greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  // Format current date if not provided
  const displayDate =
    date ||
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="relative overflow-hidden rounded-3xl animate-fade-in shadow-lg group">
      {/* --- Dynamic Background --- */}
      <div
        className={`absolute inset-0 bg-gradient-to-r transition-colors duration-500 
        ${
          darkMode
            ? "from-blue-900 via-indigo-900 to-slate-900"
            : "from-blue-600 via-indigo-600 to-purple-600"
        }`}
      />

      {/* --- Decorative Abstract Shapes --- */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-10 w-48 h-48 bg-indigo-300 opacity-20 rounded-full blur-2xl"></div>

      {/* Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-10 gap-6">
        {/* --- Text Content --- */}
        <div className="space-y-2 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-xs font-medium text-white/90">
            <span>📅</span> {displayDate}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            {greeting}, {userName}!{" "}
            <span className="inline-block animate-wave origin-bottom-right">
              👋
            </span>
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            Here's what's happening with your projects and team today.
          </p>
        </div>

        {/* --- Stats Cards Grid --- */}
        <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto">
          <StatBadge
            icon={FiBriefcase}
            count={stats.tasks}
            label="Pending Tasks"
            color="bg-orange-500/20 text-orange-200"
          />
          <StatBadge
            icon={FiCheckCircle}
            count={stats.completed}
            label="Completed"
            color="bg-emerald-500/20 text-emerald-200"
          />
          <StatBadge
            icon={FiTrendingUp}
            count={`${stats.performance}%`}
            label="Performance"
            color="bg-blue-400/20 text-blue-200"
          />
        </div>
      </div>
    </div>
  );
};

// Sub-component for Stats
const StatBadge = ({ icon: Icon, count, label, color }) => (
  <div
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10 backdrop-blur-md transition-transform hover:-translate-y-1 ${color}`}
  >
    <div className="p-2 bg-white/10 rounded-xl">
      <Icon className="text-white" size={20} />
    </div>
    <div>
      <p className="text-xl font-bold text-white leading-none">{count}</p>
      <p className="text-xs text-white/70 font-medium mt-1 uppercase tracking-wide">
        {label}
      </p>
    </div>
  </div>
);

export default WelcomeBanner;
