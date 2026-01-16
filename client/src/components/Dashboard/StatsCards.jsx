import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiCheckSquare,
  FiCalendar,
  FiActivity,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiAlertCircle,
} from "react-icons/fi";

// Mock API Call simulation
const fetchStats = () =>
  new Promise((resolve) => {
    setTimeout(
      () =>
        resolve({
          staffCount: 24,
          activeTasks: 18,
          scheduleCount: 12,
          completionRate: 85,
          productivity: 92,
          trends: { staff: 5, tasks: 12, schedule: -3, prod: 8 },
        }),
      800
    );
  });

const StatsCards = ({ darkMode }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const stats = [
    {
      id: "staff",
      title: "Total Staff",
      value: data?.staffCount || 0,
      trend: data?.trends.staff,
      icon: FiUsers,
      color: "blue",
      desc: "Active employees",
      chart: [4, 6, 5, 7, 8, 9, 8],
    },
    {
      id: "tasks",
      title: "Active Tasks",
      value: data?.activeTasks || 0,
      trend: data?.trends.tasks,
      icon: FiCheckSquare,
      color: "emerald",
      desc: "Pending completion",
      chart: [12, 14, 13, 15, 16, 14, 18],
    },
    {
      id: "schedule",
      title: "Today's Shifts",
      value: data?.scheduleCount || 0,
      trend: data?.trends.schedule,
      icon: FiCalendar,
      color: "orange",
      desc: "Scheduled roster",
      chart: [10, 10, 12, 11, 13, 12, 12],
    },
    {
      id: "productivity",
      title: "Productivity",
      value: `${data?.productivity || 0}%`,
      trend: data?.trends.prod,
      icon: FiActivity,
      color: "purple",
      desc: "Team efficiency",
      chart: [85, 88, 87, 89, 90, 91, 92],
    },
  ];

  if (loading) return <StatsSkeleton darkMode={darkMode} />;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} darkMode={darkMode} />
        ))}
      </div>

      {/* Secondary Health Metrics */}
      <div
        className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl border ${
          darkMode
            ? "bg-slate-800/50 border-slate-700"
            : "bg-white border-slate-200"
        }`}
      >
        <HealthMetric
          icon={FiCheckSquare}
          label="On Track"
          value="92%"
          color="emerald"
          darkMode={darkMode}
        />
        <HealthMetric
          icon={FiClock}
          label="Avg Delay"
          value="12m"
          color="blue"
          darkMode={darkMode}
        />
        <HealthMetric
          icon={FiAlertCircle}
          label="Risks"
          value="3"
          color="rose"
          darkMode={darkMode}
        />
        <HealthMetric
          icon={FiActivity}
          label="Utilization"
          value="78%"
          color="purple"
          darkMode={darkMode}
        />
      </div>
    </div>
  );
};

// --- Sub Components ---

const StatCard = ({ stat, darkMode }) => {
  const colors = {
    blue: "text-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    emerald:
      "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400",
    orange:
      "text-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    purple:
      "text-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
  };

  const isPositive = stat.trend >= 0;

  return (
    <div
      className={`relative p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group
      ${
        darkMode
          ? "bg-slate-800 border-slate-700 hover:border-slate-600"
          : "bg-white border-slate-200 hover:border-blue-200"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colors[stat.color]}`}>
          <stat.icon size={22} />
        </div>
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full 
          ${
            isPositive
              ? darkMode
                ? "bg-emerald-900/30 text-emerald-400"
                : "bg-emerald-50 text-emerald-700"
              : darkMode
              ? "bg-rose-900/30 text-rose-400"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
          <span>{Math.abs(stat.trend)}%</span>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h3
            className={`text-2xl font-bold tracking-tight ${
              darkMode ? "text-white" : "text-slate-900"
            }`}
          >
            {stat.value}
          </h3>
          <p
            className={`text-sm font-medium ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {stat.title}
          </p>
        </div>

        {/* Micro Sparkline Chart (Simulated with bars) */}
        <div className="flex items-end gap-1 h-8">
          {stat.chart.map((h, i) => (
            <div
              key={i}
              className={`w-1.5 rounded-t-sm transition-all duration-500 group-hover:opacity-100 ${
                darkMode ? "bg-slate-600 opacity-40" : "bg-slate-200 opacity-60"
              }`}
              style={{ height: `${(h / Math.max(...stat.chart)) * 100}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const HealthMetric = ({ icon: Icon, label, value, color, darkMode }) => {
  const colorMap = {
    emerald: "text-emerald-500",
    blue: "text-blue-500",
    rose: "text-rose-500",
    purple: "text-purple-500",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-3 rounded-xl text-center transition-colors ${
        darkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
      }`}
    >
      <div className={`mb-2 ${colorMap[color]}`}>
        <Icon size={18} />
      </div>
      <span
        className={`text-lg font-bold leading-none mb-1 ${
          darkMode ? "text-white" : "text-slate-900"
        }`}
      >
        {value}
      </span>
      <span
        className={`text-xs font-medium uppercase tracking-wide ${
          darkMode ? "text-slate-500" : "text-slate-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

const StatsSkeleton = ({ darkMode }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className={`h-40 rounded-2xl animate-pulse ${
          darkMode ? "bg-slate-800" : "bg-slate-100"
        }`}
      />
    ))}
  </div>
);

export default StatsCards;
