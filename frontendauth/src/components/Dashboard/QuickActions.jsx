import React from 'react';
import { User, Clipboard, Calendar, BarChart3, Megaphone, Building2, Zap, RotateCcw } from 'lucide-react';
import './QuickActions.css';

const QuickActions = ({ onAddStaff, onAddTask, onViewSchedule, onViewReports }) => {
  const actions = [
    {
      icon: <User size={24} strokeWidth={2} />,
      label: 'Add New Staff',
      color: 'primary',
      action: onAddStaff
    },
    {
      icon: <Clipboard size={24} strokeWidth={2} />,
      label: 'Create Task',
      color: 'success',
      action: onAddTask
    },
    {
      icon: <Calendar size={24} strokeWidth={2} />,
      label: 'Schedule Shift',
      color: 'warning',
      action: onViewSchedule
    },
    {
      icon: <BarChart3 size={24} strokeWidth={2} />,
      label: 'Generate Report',
      color: 'info',
      action: onViewReports
    },
    {
      icon: <Megaphone size={24} strokeWidth={2} />,
      label: 'Send Announcement',
      color: 'primary',
      action: () => {}
    },
    {
      icon: <Building2 size={24} strokeWidth={2} />,
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
          <Zap className="activity-icon" size={18} strokeWidth={2} />
          <div className="activity-text">
            <span className="activity-title">Recent Activity</span>
            <span className="activity-subtitle">3 new updates</span>
          </div>
        </div>
        <button className="refresh-button">
          <RotateCcw size={18} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default QuickActions;