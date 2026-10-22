import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Mail } from 'lucide-react';
import api from '../services/api';

const EmailServiceWarning = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkEmailStatus();
    // Check email status every 5 minutes
    const interval = setInterval(checkEmailStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkEmailStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/email/status');
      
      if (response.data) {
        setEmailStatus(response.data);
        // Show warning if email is disabled
        if (!response.data.enabled) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    } catch (error) {
      console.error('Failed to check email status:', error);
      // If we can't check status, don't show warning
      setIsVisible(false);
    } finally {
      setLoading(true);
    }
  };

  if (!isVisible || loading || !emailStatus) {
    return null;
  }

  return (
    <div className="animate-fade-in">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Warning Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <AlertTriangle className="text-amber-600" size={24} strokeWidth={2} />
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-amber-900 text-sm sm:text-base mb-1 flex items-center gap-2">
              <AlertTriangle size={18} strokeWidth={2} />
              Email Service Disabled
            </h3>
            <p className="text-amber-800 text-xs sm:text-sm leading-relaxed">
              The email notification service is currently unavailable. Staff members assigned to schedules will 
              <strong> NOT receive email notifications</strong> about their assignments. The system continues to work normally, 
              but scheduled task notifications cannot be sent until the email service is configured.
            </p>
            
            {/* Additional Info */}
            <div className="mt-3 p-3 bg-amber-100 rounded-lg border border-amber-200">
              <p className="text-xs sm:text-sm text-amber-900">
                <strong>What's missing:</strong> Email credentials are not configured. Contact your administrator to set up 
                Gmail app password in the system configuration.
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 mt-0.5 p-2 hover:bg-amber-200 rounded-lg transition-colors"
            title="Dismiss"
            aria-label="Close warning"
          >
            <X className="text-amber-600" size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailServiceWarning;
