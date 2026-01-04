import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StatsCards.css';

const API_BASE_URL = 'http://localhost:5000/api';

const StatsCards = ({ darkMode = false }) => {
  const [statsData, setStatsData] = useState({
    staffCount: 0,
    activeTasks: 0,
    scheduleCount: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState({});

  useEffect(() => {
    fetchStatsData();
  }, []);

  const fetchStatsData = async () => {
    try {
      setLoading(true);
      
      // Fetch staff data
      const staffResponse = await axios.get(`${API_BASE_URL}/staff/all`);
      const staffData = staffResponse.data.success ? staffResponse.data.employees : [];
      
      // Fetch task data
      const taskResponse = await axios.get(`${API_BASE_URL}/tasks`);
      const taskData = taskResponse.data.success ? taskResponse.data.tasks : [];
      
      // Fetch schedule data (if available)
      let scheduleData = [];
      try {
        const scheduleResponse = await axios.get(`${API_BASE_URL}/schedules`);
        scheduleData = scheduleResponse.data.success ? scheduleResponse.data.schedules : [];
      } catch (error) {
        console.log('Schedules API not available, using default');
      }
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const activeStaff = staffData.filter(staff => staff.status === 'Active').length;
      const activeTasks = taskData.filter(task => 
        task.status === 'active' || task.status === 'in progress' || task.status === 'pending'
      ).length;
      
      const todaysSchedules = scheduleData.filter(schedule => {
        const scheduleDate = new Date(schedule.scheduledDate).toISOString().split('T')[0];
        return scheduleDate === today;
      }).length;
      
      const pendingApprovals = taskData.filter(task => task.status === 'pending').length;
      
      // Calculate trends (mock data for now - in real app, compare with previous period)
      const calculateTrend = (current) => {
        const previous = Math.floor(current * (0.8 + Math.random() * 0.4));
        const change = current - previous;
        const percentage = previous > 0 ? ((change / previous) * 100).toFixed(1) : 100;
        return {
          change: `${percentage >= 0 ? '+' : ''}${percentage}%`,
          trend: percentage >= 0 ? 'up' : 'down',
          value: current
        };
      };
      
      setStatsData({
        staffCount: activeStaff,
        activeTasks: activeTasks,
        scheduleCount: todaysSchedules,
        pendingApprovals: pendingApprovals
      });
      
      setTrends({
        staff: calculateTrend(activeStaff),
        tasks: calculateTrend(activeTasks),
        schedules: calculateTrend(todaysSchedules),
        approvals: calculateTrend(pendingApprovals)
      });
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback mock data
      setStatsData({
        staffCount: 24,
        activeTasks: 18,
        scheduleCount: 12,
        pendingApprovals: 8
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      id: 'staff',
      title: 'Total Staff',
      value: statsData.staffCount,
      change: trends.staff?.change || '+2.5%',
      icon: '👥',
      color: 'primary',
      trend: trends.staff?.trend || 'up',
      description: 'Active team members',
      gradient: 'linear-gradient(135deg, #4A90E2 0%, #357ABD 100%)'
    },
    {
      id: 'tasks',
      title: 'Active Tasks',
      value: statsData.activeTasks,
      change: trends.tasks?.change || '+12.5%',
      icon: '📋',
      color: 'success',
      trend: trends.tasks?.trend || 'up',
      description: 'Tasks in progress',
      gradient: 'linear-gradient(135deg, #50C878 0%, #3AAE5F 100%)'
    },
    {
      id: 'schedules',
      title: 'Today\'s Schedule',
      value: statsData.scheduleCount,
      change: trends.schedules?.change || '+3.2%',
      icon: '📅',
      color: 'warning',
      trend: trends.schedules?.trend || 'up',
      description: 'Scheduled for today',
      gradient: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)'
    },
    {
      id: 'approvals',
      title: 'Pending Approval',
      value: statsData.pendingApprovals,
      change: trends.approvals?.change || '-1.2%',
      icon: '⏳',
      color: 'danger',
      trend: trends.approvals?.trend || 'down',
      description: 'Awaiting approval',
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)'
    }
  ];

  const getProgressValue = (value, max = 50) => {
    return Math.min(100, (value / max) * 100);
  };

  if (loading) {
    return (
      <div className="stats-grid loading">
        {[1, 2, 3, 4].map((_, index) => (
          <div 
            key={index} 
            className="stats-card skeleton"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="skeleton-content">
              <div className="skeleton-icon"></div>
              <div className="skeleton-text"></div>
              <div className="skeleton-value"></div>
              <div className="skeleton-progress"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div 
          key={stat.id} 
          className={`stats-card ${stat.color} card-enter ${darkMode ? 'dark-mode' : ''}`}
          style={{ 
            animationDelay: `${index * 0.1}s`,
            background: stat.gradient,
            '--card-color': stat.color
          }}
        >
          {/* Decorative elements */}
          <div className="card-bg-pattern"></div>
          <div className="card-shine"></div>
          
          <div className="stats-header">
            <div className="stats-icon-wrapper">
              <div className="stats-icon-bg">
                <span className="stats-icon">{stat.icon}</span>
              </div>
              <div className="stats-trend">
                <span className={`trend-indicator ${stat.trend}`}>
                  {stat.trend === 'up' ? '↗' : '↘'}
                </span>
                <span className={`trend-value ${stat.trend}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
          
          <div className="stats-content">
            <div className="stats-main">
              <h3 className="stats-value">
                {stat.value}
                {stat.id === 'tasks' && (
                  <span className="value-unit"> active</span>
                )}
              </h3>
              <p className="stats-title">{stat.title}</p>
              <p className="stats-description">{stat.description}</p>
            </div>
            
            <div className="stats-progress-wrapper">
              <div className="progress-label">
                <span>Progress</span>
                <span>{Math.round(getProgressValue(stat.value))}%</span>
              </div>
              <div className="stats-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${getProgressValue(stat.value)}%`,
                      animationDelay: `${index * 0.2}s`
                    }}
                  />
                  <div className="progress-dots">
                    {[0, 25, 50, 75, 100].map((dot, i) => (
                      <div 
                        key={i}
                        className="progress-dot"
                        style={{ left: `${dot}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Hover effect overlay */}
          <div className="card-hover-overlay"></div>
          
          {/* Clickable overlay for interaction */}
          <button className="card-action" onClick={() => {
            console.log(`View ${stat.title} details`);
            // Add your navigation logic here
          }}>
            View Details →
          </button>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;