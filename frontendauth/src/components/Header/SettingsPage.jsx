import React, { useState } from 'react';
import './Pages.css';

const SettingsPage = ({ user, darkMode, currentDarkMode, onDarkModeToggle }) => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    taskReminders: true,
    twoFactorAuth: false,
    darkMode: currentDarkMode || false,
    language: 'en',
    timezone: 'Africa/Addis_Ababa',
    autoSave: true,
    dataRetention: '6 months'
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleSettingChange = (setting) => {
    const newValue = !settings[setting];
    setSettings(prev => ({
      ...prev,
      [setting]: newValue
    }));

    // Handle dark mode toggle
    if (setting === 'darkMode' && onDarkModeToggle) {
      onDarkModeToggle(newValue);
    }
  };

  const handlePasswordChange = () => {
    if (password.new !== password.confirm) {
      alert('New passwords do not match!');
      return;
    }
    if (password.new.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    // Here you would typically update password via API
    alert('Password updated successfully!');
    setPassword({ current: '', new: '', confirm: '' });
  };

  const handleExportData = () => {
    // Export data functionality
    alert('Data export started. You will receive an email shortly.');
  };

  return (
    <div className={`page-container settings-page ${darkMode ? 'dark' : 'light'}`}>
      <div className="page-header">
        <h1>⚙️ Settings</h1>
        <p>Customize your application experience</p>
      </div>

      <div className="settings-grid">
        {/* Notification Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h2>🔔 Notifications</h2>
            <p>Manage how you receive notifications</p>
          </div>
          <div className="settings-options">
            <div className="setting-option">
              <div className="setting-info">
                <h4>Email Notifications</h4>
                <p>Receive email updates about tasks and schedules</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleSettingChange('emailNotifications')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-option">
              <div className="setting-info">
                <h4>Push Notifications</h4>
                <p>Receive browser notifications for urgent tasks</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={() => handleSettingChange('pushNotifications')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-option">
              <div className="setting-info">
                <h4>Weekly Reports</h4>
                <p>Receive weekly performance reports</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={() => handleSettingChange('weeklyReports')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-option">
              <div className="setting-info">
                <h4>Task Reminders</h4>
                <p>Get reminders before task deadlines</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.taskReminders}
                  onChange={() => handleSettingChange('taskReminders')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h2>🛡️ Security</h2>
            <p>Manage your account security</p>
          </div>
          
          <div className="setting-option">
            <div className="setting-info">
              <h4>Two-Factor Authentication</h4>
              <p>Add an extra layer of security to your account</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={() => handleSettingChange('twoFactorAuth')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="password-change">
            <h4>Change Password</h4>
            <div className="password-inputs">
              <input
                type="password"
                placeholder="Current Password"
                value={password.current}
                onChange={(e) => setPassword(prev => ({ ...prev, current: e.target.value }))}
              />
              <input
                type="password"
                placeholder="New Password"
                value={password.new}
                onChange={(e) => setPassword(prev => ({ ...prev, new: e.target.value }))}
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={password.confirm}
                onChange={(e) => setPassword(prev => ({ ...prev, confirm: e.target.value }))}
              />
            </div>
            <button className="btn-primary" onClick={handlePasswordChange}>
              🔒 Update Password
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h2>🎨 Preferences</h2>
            <p>Customize your experience</p>
          </div>
          
          <div className="setting-option">
            <div className="setting-info">
              <h4>Dark Mode</h4>
              <p>Toggle dark theme for better viewing</p>
            </div>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={() => handleSettingChange('darkMode')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="preference-option">
            <label>Language</label>
            <select
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
            >
              <option value="en">English</option>
              <option value="am">Amharic</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
            </select>
          </div>

          <div className="preference-option">
            <label>Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
            >
              <option value="Africa/Addis_Ababa">Addis Ababa (EAT)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">New York (EST)</option>
              <option value="Europe/London">London (GMT)</option>
            </select>
          </div>

          <div className="preference-option">
            <label>Auto Save</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={() => handleSettingChange('autoSave')}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="preference-option">
            <label>Data Retention</label>
            <select
              value={settings.dataRetention}
              onChange={(e) => setSettings(prev => ({ ...prev, dataRetention: e.target.value }))}
            >
              <option value="1 month">1 Month</option>
              <option value="3 months">3 Months</option>
              <option value="6 months">6 Months</option>
              <option value="1 year">1 Year</option>
              <option value="forever">Forever</option>
            </select>
          </div>
        </div>

        {/* Data Management */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h2>💾 Data Management</h2>
            <p>Manage your application data</p>
          </div>
          
          <div className="data-options">
            <button className="btn-secondary" onClick={handleExportData}>
              📥 Export All Data
            </button>
            <button className="btn-secondary warning">
              🗑️ Delete Account
            </button>
            <div className="storage-info">
              <div className="storage-bar">
                <div className="storage-fill" style={{ width: '65%' }}></div>
              </div>
              <p>Storage: 6.5GB of 10GB used</p>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn-primary">
          💾 Save All Settings
        </button>
        <button className="btn-secondary">
          ↩️ Reset to Default
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;