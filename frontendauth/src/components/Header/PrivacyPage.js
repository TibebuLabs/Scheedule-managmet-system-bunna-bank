import React, { useState } from 'react';
import './Pages.css';

const PrivacyPage = ({ user, darkMode }) => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    activityVisibility: 'team',
    allowTagging: true,
    dataSharing: false,
    cookieConsent: true,
    locationTracking: false,
    marketingEmails: false
  });

  const handlePrivacyChange = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleVisibilityChange = (value) => {
    setPrivacySettings(prev => ({
      ...prev,
      profileVisibility: value
    }));
  };

  const handleExportData = () => {
    alert('Your data export has started. You will receive an email with download link.');
  };

  const handleDeleteData = () => {
    const confirm = window.confirm('Are you sure you want to delete all your data? This action cannot be undone.');
    if (confirm) {
      alert('Data deletion scheduled. You will receive a confirmation email.');
    }
  };

  return (
    <div className={`page-container privacy-page ${darkMode ? 'dark' : 'light'}`}>
      <div className="page-header">
        <h1>🛡️ Privacy & Data</h1>
        <p>Control your privacy and data sharing preferences</p>
      </div>

      <div className="privacy-content">
        {/* Profile Privacy */}
        <div className="privacy-section">
          <h2>👤 Profile Privacy</h2>
          <p className="section-description">Control who can see your profile information</p>
          
          <div className="privacy-option">
            <div className="privacy-info">
              <h4>Profile Visibility</h4>
              <p>Choose who can see your profile</p>
            </div>
            <div className="visibility-options">
              {['public', 'team', 'private'].map(option => (
                <label key={option} className="visibility-option">
                  <input
                    type="radio"
                    name="visibility"
                    value={option}
                    checked={privacySettings.profileVisibility === option}
                    onChange={() => handleVisibilityChange(option)}
                  />
                  <span className="radio-label">
                    {option === 'public' && '🌍 Public'}
                    {option === 'team' && '👥 Team Only'}
                    {option === 'private' && '🔒 Private'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="privacy-options-grid">
            <div className="privacy-option">
              <div className="privacy-info">
                <h4>Show Email Address</h4>
                <p>Allow others to see your email</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={privacySettings.showEmail}
                  onChange={() => handlePrivacyChange('showEmail')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="privacy-option">
              <div className="privacy-info">
                <h4>Show Phone Number</h4>
                <p>Allow others to see your phone number</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={privacySettings.showPhone}
                  onChange={() => handlePrivacyChange('showPhone')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="privacy-option">
              <div className="privacy-info">
                <h4>Activity Visibility</h4>
                <p>Who can see your activity</p>
              </div>
              <select
                value={privacySettings.activityVisibility}
                onChange={(e) => setPrivacySettings(prev => ({ 
                  ...prev, 
                  activityVisibility: e.target.value 
                }))}
              >
                <option value="public">Everyone</option>
                <option value="team">Team Members</option>
                <option value="private">Only Me</option>
              </select>
            </div>

            <div className="privacy-option">
              <div className="privacy-info">
                <h4>Allow Tagging</h4>
                <p>Allow others to tag you in tasks</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={privacySettings.allowTagging}
                  onChange={() => handlePrivacyChange('allowTagging')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Data & Tracking */}
        <div className="privacy-section">
          <h2>📊 Data & Tracking</h2>
          <p className="section-description">Control how your data is collected and used</p>
          
          <div className="privacy-options-grid">
            <div className="privacy-option">
              <div className="privacy-info">
                <h4>Data Sharing</h4>
                <p>Allow anonymized data for analytics</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={privacySettings.dataSharing}
                  onChange={() => handlePrivacyChange('dataSharing')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="privacy-option">
              <div className="privacy-info">
                <h4>Cookie Consent</h4>
                <p>Allow cookies for better experience</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={privacySettings.cookieConsent}
                  onChange={() => handlePrivacyChange('cookieConsent')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="privacy-option">
              <div className="privacy-info">
                <h4>Location Tracking</h4>
                <p>Allow location-based features</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={privacySettings.locationTracking}
                  onChange={() => handlePrivacyChange('locationTracking')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="privacy-option">
              <div className="privacy-info">
                <h4>Marketing Emails</h4>
                <p>Receive marketing communications</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={privacySettings.marketingEmails}
                  onChange={() => handlePrivacyChange('marketingEmails')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Data Rights */}
        <div className="privacy-section">
          <h2>📋 Your Data Rights</h2>
          <p className="section-description">Exercise your data protection rights</p>
          
          <div className="data-rights-grid">
            <div className="data-right-card">
              <div className="right-icon">📥</div>
              <div className="right-info">
                <h4>Export Data</h4>
                <p>Download a copy of all your data</p>
              </div>
              <button className="btn-secondary" onClick={handleExportData}>
                Export
              </button>
            </div>

            <div className="data-right-card">
              <div className="right-icon">👁️</div>
              <div className="right-info">
                <h4>View Data</h4>
                <p>See what data we have about you</p>
              </div>
              <button className="btn-secondary">
                View
              </button>
            </div>

            <div className="data-right-card">
              <div className="right-icon">✏️</div>
              <div className="right-info">
                <h4>Correct Data</h4>
                <p>Request correction of inaccurate data</p>
              </div>
              <button className="btn-secondary">
                Request
              </button>
            </div>

            <div className="data-right-card">
              <div className="right-icon">🗑️</div>
              <div className="right-info">
                <h4>Delete Data</h4>
                <p>Request deletion of your data</p>
              </div>
              <button className="btn-secondary warning" onClick={handleDeleteData}>
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="privacy-section">
          <h2>📜 Privacy Policy</h2>
          <div className="privacy-policy-content">
            <p>
              We take your privacy seriously. Here's a summary of our privacy practices:
            </p>
            <ul>
              <li>We only collect data necessary for providing our services</li>
              <li>Your data is encrypted and stored securely</li>
              <li>We don't sell your data to third parties</li>
              <li>You have full control over your privacy settings</li>
              <li>We comply with data protection regulations</li>
            </ul>
            <div className="policy-links">
              <button className="btn-text">
                📄 View Full Privacy Policy
              </button>
              <button className="btn-text">
                📄 Terms of Service
              </button>
              <button className="btn-text">
                📄 Cookie Policy
              </button>
            </div>
          </div>
        </div>

        <div className="privacy-actions">
          <button className="btn-primary">
            💾 Save Privacy Settings
          </button>
          <button className="btn-secondary">
            ↩️ Restore Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;