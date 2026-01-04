import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaGithub, FaLinkedin } from 'react-icons/fa';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      await login(formData);
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      }
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: 'Invalid email or password. Please try again.' });
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`Continuing with ${provider} (Demo)`);
    // In a real app, you would implement OAuth here
  };

  const demoLogin = () => {
    setFormData({
      email: 'admin@bunnabank.com',
      password: 'Demo@123'
    });
  };

  return (
    <div className="auth-container">
      {/* Animated Background */}
      <div className="auth-background">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
      </div>

      <div className="auth-wrapper">
        {/* Left Side - Brand & Info */}
        <div className="auth-left">
          <div className="brand-section">
            <div className="brand-logo">
              <span className="logo-icon">🏦</span>
              <div className="logo-text">
                <h1>Bunna Bank</h1>
                <p>Secure Banking Portal</p>
              </div>
            </div>
            
            <div className="welcome-section">
              <h2>Welcome Back!</h2>
              <p>Sign in to access your secure banking dashboard and manage your finances.</p>
            </div>

            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h4>Bank-Level Security</h4>
                <p>256-bit encryption & 2FA protection</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h4>Lightning Fast</h4>
                <p>Real-time updates & instant transfers</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <h4>Mobile Ready</h4>
                <p>Access anywhere, any device</p>
              </div>
            </div>

            {/* <div className="demo-credentials">
              <button onClick={demoLogin} className="demo-btn">
                <span>👑</span>
                Try Demo Account
              </button>
              <div className="demo-info">
                <p><strong>Demo Credentials:</strong></p>
                <p>Email: admin@bunnabank.com</p>
                <p>Password: Demo@123</p>
              </div>
            </div> */}
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="auth-right">
          <div className="auth-form-container">
            <div className="form-header">
              <h2>Sign In</h2>
              <p>Enter your credentials to access your account</p>
            </div>

            {/* Social Login Options */}
            <div className="social-login">
              <button 
                className="social-btn google"
                onClick={() => handleSocialLogin('Google')}
              >
                <FaGoogle className="social-icon" />
                Continue with Google
              </button>
              <button 
                className="social-btn github"
                onClick={() => handleSocialLogin('GitHub')}
              >
                <FaGithub className="social-icon" />
                Continue with GitHub
              </button>
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {errors.general && (
                <div className="error-banner">
                  <span className="error-icon">⚠️</span>
                  {errors.general}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">
                  <FaEnvelope className="label-icon" />
                  Email Address
                </label>
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={errors.email ? 'input-error' : ''}
                    required
                  />
                  {errors.email && (
                    <div className="error-message">{errors.email}</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <FaLock className="label-icon" />
                  Password
                </label>
                <div className="input-group password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={errors.password ? 'input-error' : ''}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.password && (
                    <div className="error-message">{errors.password}</div>
                  )}
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot Password?
                </Link>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="form-footer">
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="link">
                    Create Account
                  </Link>
                </p>
                <Link to="/" className="home-link">
                  ← Back to Home
                </Link>
              </div>
            </form>

            {/* Security Notice */}
            <div className="security-notice">
              <div className="security-icon">🛡️</div>
              <p>
                Your security is our priority. This site is protected by advanced encryption.
                <Link to="/security" className="security-link"> Learn more</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;