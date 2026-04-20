import React, { useState, useEffect } from 'react';
import './Pages.css';

const ProfilePage = ({ user, onUpdateProfile, darkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || 'Admin User',
    email: user?.email || 'admin@bunnabank.com',
    phone: user?.phone || '+251 912 345 678',
    department: user?.department || 'IT Department',
    position: user?.position || 'System Administrator',
    joinDate: user?.joinDate || '2023-01-15',
    bio: user?.bio || 'Experienced IT professional specializing in system administration and task management solutions.',
    skills: user?.skills || ['System Administration', 'Task Management', 'JavaScript', 'React', 'Node.js']
  });

  const stats = {
    tasksCompleted: 156,
    tasksAssigned: 42,
    efficiencyRate: '94%',
    avgResponseTime: '2.4h'
  };

  const recentActivities = [
    { id: 1, action: 'Assigned new task', target: 'System Update', time: '2 hours ago' },
    { id: 2, action: 'Completed review', target: 'Weekly Report', time: '1 day ago' },
    { id: 3, action: 'Updated schedule', target: 'Team Roster', time: '2 days ago' },
    { id: 4, action: 'Approved request', target: 'Leave Application', time: '3 days ago' }
  ];

  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || 'Admin User',
        email: user.email || 'admin@bunnabank.com',
        phone: user.phone || '+251 912 345 678',
        department: user.department || 'IT Department',
        position: user.position || 'System Administrator',
        joinDate: user.joinDate || '2023-01-15',
        bio: user.bio || 'Experienced IT professional specializing in system administration and task management solutions.',
        skills: user.skills || ['System Administration', 'Task Management', 'JavaScript', 'React', 'Node.js']
      });
    }
  }, [user]);

  const handleSave = () => {
    // Update parent component with new profile data
    if (onUpdateProfile) {
      onUpdateProfile(profileData);
    }
    setIsEditing(false);
    // Show success message
    alert('Profile updated successfully!');
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSkill = (skill) => {
    if (skill.trim() && !profileData.skills.includes(skill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  return (
    <div className={`page-container profile-page ${darkMode ? 'dark' : 'light'}`}>
      <div className="page-header">
        <h1>👤 User Profile</h1>
        <p>Manage your personal information and preferences</p>
      </div>

      <div className="profile-content">
        {/* Left Column - Profile Card & Stats */}
        <div className="profile-left">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="avatar-large">
                <span>{profileData.fullName.charAt(0)}</span>
              </div>
              <div className="profile-basic-info">
                <h2>{profileData.fullName}</h2>
                <p className="profile-role">{profileData.position}</p>
                <p className="profile-department">{profileData.department}</p>
                <div className="profile-status">
                  <span className="status-indicator active"></span>
                  <span>Active</span>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <button className="btn-secondary">
                <span>📸</span> Change Photo
              </button>
              <button 
                className="btn-primary"
                onClick={() => setIsEditing(!isEditing)}
              >
                <span>✏️</span> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <span>✅</span>
              </div>
              <div className="stat-info">
                <h3>{stats.tasksCompleted}</h3>
                <p>Tasks Completed</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <span>📋</span>
              </div>
              <div className="stat-info">
                <h3>{stats.tasksAssigned}</h3>
                <p>Active Tasks</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <span>📊</span>
              </div>
              <div className="stat-info">
                <h3>{stats.efficiencyRate}</h3>
                <p>Efficiency Rate</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
                <span>⚡</span>
              </div>
              <div className="stat-info">
                <h3>{stats.avgResponseTime}</h3>
                <p>Avg Response Time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Edit Form & Activities */}
        <div className="profile-right">
          {/* Edit Form */}
          <div className="edit-form-section">
            <h3>Personal Information</h3>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="form-value">{profileData.fullName}</p>
                )}
              </div>

              <div className="form-group">
                <label>Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                ) : (
                  <p className="form-value">{profileData.email}</p>
                )}
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="form-value">{profileData.phone}</p>
                )}
              </div>

              <div className="form-group">
                <label>Position</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    placeholder="Enter your position"
                  />
                ) : (
                  <p className="form-value">{profileData.position}</p>
                )}
              </div>

              <div className="form-group">
                <label>Department</label>
                {isEditing ? (
                  <select
                    value={profileData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                  >
                    <option value="IT Department">IT Department</option>
                    <option value="HR Department">HR Department</option>
                    <option value="Finance Department">Finance Department</option>
                    <option value="Operations">Operations</option>
                    <option value="Management">Management</option>
                  </select>
                ) : (
                  <p className="form-value">{profileData.department}</p>
                )}
              </div>

              <div className="form-group">
                <label>Join Date</label>
                <p className="form-value">{profileData.joinDate}</p>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Bio</label>
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="form-value">{profileData.bio}</p>
              )}
            </div>

            <div className="form-group full-width">
              <label>Skills</label>
              <div className="skills-container">
                {profileData.skills.map((skill, index) => (
                  <div key={index} className="skill-tag">
                    {skill}
                    {isEditing && (
                      <button 
                        className="remove-skill"
                        onClick={() => removeSkill(skill)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <input
                    type="text"
                    className="add-skill-input"
                    placeholder="Add skill + Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSkill(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {isEditing && (
              <div className="form-actions">
                <button className="btn-primary" onClick={handleSave}>
                  💾 Save Changes
                </button>
                <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                  ❌ Cancel
                </button>
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="recent-activities">
            <h3>📈 Recent Activities</h3>
            <div className="activities-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    <span>📌</span>
                  </div>
                  <div className="activity-details">
                    <p className="activity-action">
                      <strong>{activity.action}</strong> - {activity.target}
                    </p>
                    <p className="activity-time">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-text">
              View All Activities →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;