import React from 'react';
import './WelcomeBanner.css';

const WelcomeBanner = () => {
  const currentHour = new Date().getHours();
  let greeting = 'Good Evening';
  
  if (currentHour < 12) greeting = 'Good Morning';
  else if (currentHour < 18) greeting = 'Good Afternoon';

  return (
    <div className="welcome-banner animate-in">
      <div className="welcome-content">
        <div className="welcome-text">
          <h1>{greeting}, Admin! 👋</h1>
          <p>Here's what's happening with your team today.</p>
        </div>
        <div className="welcome-stats">
          <div className="stat-item">
            <span className="stat-number">5</span>
            <span className="stat-label">New Tasks</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">12</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">98%</span>
            <span className="stat-label">Performance</span>
          </div>
        </div>
      </div>
      <div className="welcome-graphics">
        <div className="graphic-circle circle-1 animate-float" />
        <div className="graphic-circle circle-2 animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="graphic-circle circle-3 animate-float" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
};

export default WelcomeBanner;