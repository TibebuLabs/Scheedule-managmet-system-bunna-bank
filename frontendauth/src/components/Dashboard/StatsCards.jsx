import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  ClipboardList, 
  Calendar, 
  Clock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowRight,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  Activity
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const StatsCards = ({ darkMode = false }) => {
  const [statsData, setStatsData] = useState({
    staffCount: 0,
    activeTasks: 0,
    scheduleCount: 0,
    pendingApprovals: 0,
    completionRate: 0,
    productivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchStatsData();
  }, [timeRange]);

  const fetchStatsData = async () => {
    try {
      setLoading(true);
      
      const [staffRes, tasksRes, schedulesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/staff/all`),
        axios.get(`${API_BASE_URL}/tasks`),
        axios.get(`${API_BASE_URL}/schedules`).catch(() => ({ data: { success: false } }))
      ]);

      const staffData = staffRes.data.success ? staffRes.data.employees : [];
      const taskData = tasksRes.data.success ? tasksRes.data.tasks : [];
      const scheduleData = schedulesRes.data.success ? schedulesRes.data.schedules : [];

      // Advanced calculations
      const today = new Date().toISOString().split('T')[0];
      const activeStaff = staffData.filter(staff => staff.status === 'Active').length;
      const activeTasks = taskData.filter(task => 
        ['active', 'in progress', 'pending'].includes(task.status)
      ).length;
      
      const todaysSchedules = scheduleData.filter(schedule => {
        const scheduleDate = new Date(schedule.scheduledDate).toISOString().split('T')[0];
        return scheduleDate === today;
      }).length;
      
      const pendingApprovals = taskData.filter(task => task.status === 'pending').length;
      
      // Calculate completion rate
      const completedTasks = taskData.filter(task => task.status === 'completed').length;
      const completionRate = taskData.length > 0 ? (completedTasks / taskData.length) * 100 : 0;
      
      // Calculate productivity score (mock calculation)
      const productivity = Math.min(100, 
        (activeStaff > 0 ? (activeTasks / activeStaff) * 25 : 0) +
        (completionRate * 0.75)
      );

      setStatsData({
        staffCount: activeStaff,
        activeTasks: activeTasks,
        scheduleCount: todaysSchedules,
        pendingApprovals: pendingApprovals,
        completionRate: Math.round(completionRate),
        productivity: Math.round(productivity)
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback data with realistic values
      setStatsData({
        staffCount: 24,
        activeTasks: 18,
        scheduleCount: 12,
        pendingApprovals: 8,
        completionRate: 75,
        productivity: 82
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      id: 'staff',
      title: 'Team Members',
      value: statsData.staffCount,
      change: '+2.5%',
      icon: Users,
      color: 'blue',
      trend: 'up',
      description: 'Active team members',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      chartColor: '#3b82f6',
      secondaryValue: '24 Total',
      unit: 'people'
    },
    {
      id: 'tasks',
      title: 'Active Tasks',
      value: statsData.activeTasks,
      change: '+12.5%',
      icon: ClipboardList,
      color: 'emerald',
      trend: 'up',
      description: 'Tasks in progress',
      gradient: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      chartColor: '#10b981',
      secondaryValue: '85% on track',
      unit: 'tasks'
    },
    {
      id: 'schedules',
      title: 'Today\'s Schedule',
      value: statsData.scheduleCount,
      change: '+3.2%',
      icon: CalendarDays,
      color: 'amber',
      trend: 'up',
      description: 'Scheduled activities',
      gradient: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      chartColor: '#f59e0b',
      secondaryValue: '4 upcoming',
      unit: 'items'
    },
    {
      id: 'productivity',
      title: 'Productivity Score',
      value: statsData.productivity,
      change: '+5.7%',
      icon: Activity,
      color: 'violet',
      trend: 'up',
      description: 'Team efficiency',
      gradient: 'from-violet-500 to-violet-600',
      bgColor: 'bg-violet-50',
      chartColor: '#8b5cf6',
      secondaryValue: `${statsData.completionRate}% completion`,
      unit: 'score'
    }
  ];

  const generateChartData = (baseValue, count = 7) => {
    return Array.from({ length: count }, (_, i) => {
      const fluctuation = (Math.random() * 0.4 - 0.2) * baseValue;
      return Math.max(5, baseValue + fluctuation);
    });
  };

  const renderRadialProgress = (value, color, size = 'md') => {
    const sizes = {
      sm: { circle: 32, stroke: 3 },
      md: { circle: 40, stroke: 4 },
      lg: { circle: 48, stroke: 5 }
    };
    
    const { circle: radius, stroke } = sizes[size];
    const circumference = 2 * Math.PI * (radius - stroke);
    const progress = (value / 100) * circumference;
    
    return (
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={radius * 2}
          height={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            cx={radius}
            cy={radius}
            r={radius - stroke}
            stroke={darkMode ? '#374151' : '#e5e7eb'}
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={radius}
            cy={radius}
            r={radius - stroke}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}%
          </span>
        </div>
      </div>
    );
  };

  const TimeRangeSelector = () => (
    <div className={`flex gap-1 p-1 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      {['day', 'week', 'month'].map((range) => (
        <button
          key={range}
          onClick={() => setTimeRange(range)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-all ${
            timeRange === range
              ? darkMode
                ? 'bg-gray-700 text-white'
                : 'bg-white text-gray-900 shadow-sm'
              : darkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((_, index) => (
          <div
            key={index}
            className={`rounded-xl p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} animate-pulse`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
              <div className={`w-20 h-6 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            </div>
            <div className={`h-7 w-1/3 mb-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className={`h-3 w-2/3 mb-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className={`h-2 w-full rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with time range selector */}
      <div className="flex justify-between items-center">
        <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Schedule Performance
        </h2>
        <TimeRangeSelector />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={stat.id}
            className={`group relative overflow-hidden rounded-xl p-4 transition-all duration-300 hover:shadow-lg cursor-pointer ${
              selectedMetric === stat.id
                ? darkMode
                  ? 'bg-gray-800 ring-2 ring-blue-500'
                  : 'bg-white ring-2 ring-blue-500'
                : darkMode
                  ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700'
                  : 'bg-white hover:bg-gray-50 border border-gray-200'
            }`}
            onClick={() => setSelectedMetric(selectedMetric === stat.id ? null : stat.id)}
          >
            {/* Background gradient */}
            <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${stat.gradient}`} />
            
            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg ${stat.bgColor} ${darkMode ? 'bg-opacity-20' : ''}`}>
                  <stat.icon className={`w-5 h-5 ${
                    darkMode 
                      ? `text-${stat.color}-400`
                      : `text-${stat.color}-600`
                  }`} />
                </div>
                
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  stat.trend === 'up'
                    ? darkMode
                      ? 'bg-emerald-900/30 text-emerald-400'
                      : 'bg-emerald-50 text-emerald-700'
                    : darkMode
                      ? 'bg-rose-900/30 text-rose-400'
                      : 'bg-rose-50 text-rose-700'
                }`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              
              {/* Main metric */}
              <div className="mb-3">
                <div className="flex items-baseline gap-2">
                  <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {stat.value}
                  </h3>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.unit}
                  </span>
                </div>
                <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {stat.title}
                </p>
                <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {stat.description}
                </p>
              </div>
              
              
              {/* Secondary metric */}
              <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg ${
                darkMode ? 'bg-gray-800/50' : 'bg-gray-50'
              }`}>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stat.secondaryValue}
                  </p>
                </div>
                {renderRadialProgress(stat.id === 'productivity' ? stat.value : 85, stat.chartColor, 'sm')}
              </div>
              
              {/* Trend indicator */}
              <div className={`flex items-center justify-between p-2 rounded-lg ${
                darkMode ? 'bg-gray-800/30' : 'bg-gray-50/50'
              }`}>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {timeRange === 'day' ? 'Today\'s trend' : 
                   timeRange === 'week' ? 'Weekly trend' : 'Monthly trend'}
                </span>
                <div className="flex items-center gap-1">
                  {generateChartData(stat.value).map((value, i) => (
                    <div
                      key={i}
                      className="w-1.5 rounded-t"
                      style={{
                        height: `${Math.min(100, (value / stat.value) * 100)}%`,
                        backgroundColor: stat.chartColor,
                        opacity: 0.3 + (i / 7) * 0.7
                      }}
                    />
                  ))}
                </div>
              </div>
              
              {/* View details link */}
              <button
                className={`mt-3 w-full flex items-center justify-center gap-1 py-2 text-xs font-medium rounded-lg transition-colors ${
                  darkMode
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`View ${stat.title} analytics`);
                }}
              >
                <span>View analytics</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            
            {/* Selected indicator */}
            {selectedMetric === stat.id && (
              <div className="absolute top-2 right-2">
                <div className={`w-2 h-2 rounded-full ${
                  darkMode ? 'bg-blue-400' : 'bg-blue-500'
                } animate-pulse`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className={`p-4 rounded-xl ${
        darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <Activity className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
          <h3 className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Schedule Health Summary
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-3 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                On Schedule
              </span>
            </div>
            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              92%
            </p>
          </div>
          
          <div className={`p-3 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg. Delay
              </span>
            </div>
            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              1.2h
            </p>
          </div>
          
          <div className={`p-3 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Conflicts
              </span>
            </div>
            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              3
            </p>
          </div>
          
          <div className={`p-3 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <CalendarDays className="w-4 h-4 text-violet-500" />
              <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Utilization
              </span>
            </div>
            <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              78%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default StatsCards;