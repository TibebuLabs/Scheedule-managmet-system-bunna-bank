import React from 'react';
import './QuickActions.css';

const QuickActions = ({ onAddStaff, onAddTask, onViewSchedule, onViewReports }) => {
  const actions = [
    {
      icon: '👤',
      label: 'Add New Staff',
      color: 'primary',
      action: onAddStaff
    },
    {
      icon: '📋',
      label: 'Create Task',
      color: 'success',
      action: onAddTask
    },
    {
      icon: '📅',
      label: 'Schedule Shift',
      color: 'warning',
      action: onViewSchedule
    },
    {
      icon: '📊',
      label: 'Generate Report',
      color: 'info',
      action: onViewReports
    },
    {
      icon: '📢',
      label: 'Send Announcement',
      color: 'primary',
      action: () => {}
    },
    {
      icon: '🏢',
      label: 'Manage Departments',
      color: 'success',
      action: () => {}
    }
  ];

  return (
    <div className="quick-actions-card card-enter">
      <div className="quick-actions-header">
        <h3>Quick Actions</h3>
        <p>Frequently used actions</p>
      </div>
      
      <div className="quick-actions-grid">
        {actions.map((action, index) => (
          <button
            key={action.label}
            className={`quick-action-button ${action.color}`}
            onClick={action.action}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="action-icon-wrapper">
              <span className="action-icon">{action.icon}</span>
              <span className="action-hover-effect" />
            </div>
            <span className="action-label">{action.label}</span>
            <span className="action-arrow">→</span>
          </button>
        ))}
      </div>
      
      <div className="quick-actions-footer">
        <div className="recent-activity">
          <span className="activity-icon">⚡</span>
          <div className="activity-text">
            <span className="activity-title">Recent Activity</span>
            <span className="activity-subtitle">3 new updates</span>
          </div>
        </div>
        <button className="refresh-button">
          <span>🔄</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;