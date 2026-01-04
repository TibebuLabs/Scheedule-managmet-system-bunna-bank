import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaCheck, FaCheckCircle } from 'react-icons/fa';
import validator from 'validator';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validator.isEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Clean phone number for validation
    const cleanPhone = formData.phone.replace(/\D/g, '');
    
    if (!cleanPhone) {
      newErrors.phone = 'Phone number is required';
    } else if (cleanPhone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    } else if (!/^[0-9]{10,}$/.test(cleanPhone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    return newErrors;
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    const requirements = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ];
    
    strength = requirements.filter(Boolean).length;
    return strength;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    if (name === 'phone') {
      processedValue = value.replace(/\D/g, '');
      if (processedValue.length > 10) {
        processedValue = processedValue.slice(0, 10);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (backendError) {
      setBackendError('');
    }
    
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(processedValue));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError('');
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      
      const apiData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: cleanPhone,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };
      
      await register(apiData);
      
      // Show success modal instead of navigating directly
      setShowSuccessModal(true);
      
      // Automatically navigate to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 1000);
      
    } catch (error) {
      console.error('Registration failed:', error);
      
      if (error.message === 'All fields are required') {
        setBackendError('Please fill in all required fields');
      } else if (error.errors) {
        const backendErrors = {};
        Object.keys(error.errors).forEach(key => {
          backendErrors[key] = error.errors[key];
        });
        setErrors(prev => ({ ...prev, ...backendErrors }));
        
        const firstError = Object.values(error.errors)[0];
        if (firstError) {
          setBackendError(firstError);
        }
      } else if (error.message && error.message.includes('already exists')) {
        setErrors(prev => ({ ...prev, email: 'Email already registered' }));
        setBackendError('This email is already registered. Please use a different email.');
      } else if (error.message && error.message.includes('Passwords do not match')) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        setBackendError('Passwords do not match. Please check your password confirmation.');
      } else if (error.message) {
        setBackendError(error.message);
      } else {
        setBackendError('Registration failed. Please try again.');
      }
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/login');
  };

  return (
    <div className="auth-container">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-modal-content">
              <div className="success-icon">
                <FaCheckCircle />
              </div>
              <h2>Account Created Successfully!</h2>
              <p className="success-message">
                Your account has been created correctly. To access the system, please sign in with your credentials.
              </p>
              <div className="success-details">
                <p>You will be automatically redirected to the login page in a few seconds...</p>
              </div>
              <div className="modal-buttons">
                <button 
                  onClick={handleCloseModal}
                  className="modal-btn primary"
                >
                  Go to Login Now
                </button>
              </div>
              <div className="redirect-countdown">
                Redirecting in 3 seconds...
              </div>
            </div>
          </div>
        </div>
      )}

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
        {/* Left Side - Registration Info */}
        <div className="auth-left register-left">
          <div className="brand-section">
            <div className="brand-logo">
              <span className="logo-icon">🚀</span>
              <div className="logo-text">
                <h1>Get Started</h1>
                <p>Begin Your Banking Journey</p>
              </div>
            </div>
            
            <div className="welcome-section">
              <h2>Join Bunna Bank Today!</h2>
              <p>Create your account in minutes and unlock a world of secure banking features.</p>
            </div>

            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-icon">✅</div>
                <div className="benefit-content">
                  <h4>Zero Account Fees</h4>
                  <p>No hidden charges, no monthly fees</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">💰</div>
                <div className="benefit-content">
                  <h4>High Interest Rates</h4>
                  <p>Earn more on your savings</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">🛡️</div>
                <div className="benefit-content">
                  <h4>256-bit Security</h4>
                  <p>Military-grade encryption</p>
                </div>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">⚡</div>
                <div className="benefit-content">
                  <h4>Instant Setup</h4>
                  <p>Get started in under 5 minutes</p>
                </div>
              </div>
            </div>

            <div className="stats-section">
              <div className="stat-card">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Happy Customers</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">99.9%</div>
                <div className="stat-label">Uptime</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Support</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="auth-right register-right">
          <div className="auth-form-container">
            <div className="form-header">
              <h2>Create Account</h2>
              <p>Join thousands of satisfied customers</p>
            </div>

            {/* Backend Error Display */}
            {backendError && (
              <div className="error-banner">
                <span className="error-icon">⚠️</span>
                {backendError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form register-form">
              {/* Name Fields */}
              <div className="name-fields">
                <div className="form-group">
                  <label className="form-label">
                    <FaUser className="label-icon" />
                    First Name *
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="John"
                      className={errors.firstName ? 'input-error' : ''}
                      required
                    />
                    {errors.firstName && (
                      <div className="error-message">{errors.firstName}</div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <FaUser className="label-icon" />
                    Last Name *
                  </label>
                  <div className="input-group">
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Doe"
                      className={errors.lastName ? 'input-error' : ''}
                      required
                    />
                    {errors.lastName && (
                      <div className="error-message">{errors.lastName}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">
                  <FaEnvelope className="label-icon" />
                  Email Address *
                </label>
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@example.com"
                    className={errors.email ? 'input-error' : ''}
                    required
                  />
                  {errors.email && (
                    <div className="error-message">{errors.email}</div>
                  )}
                </div>
              </div>

              {/* Phone Field */}
              <div className="form-group">
                <label className="form-label">
                  <FaPhone className="label-icon" />
                  Phone Number *
                </label>
                <div className="input-group phone-input-group">
                  <div className="phone-prefix">+1</div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="1234567890"
                    className={errors.phone ? 'input-error' : ''}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength="10"
                    required
                  />
                </div>
                {errors.phone && (
                  <div className="error-message">{errors.phone}</div>
                )}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label className="form-label">
                  <FaLock className="label-icon" />
                  Password *
                </label>
                <div className="input-group password-input">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
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

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">
                  <FaLock className="label-icon" />
                  Confirm Password *
                </label>
                <div className="input-group password-input">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className={errors.confirmPassword ? 'input-error' : ''}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.confirmPassword && (
                    <div className="error-message">{errors.confirmPassword}</div>
                  )}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="form-group terms-group">
                <label className="checkbox-label large">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className={errors.agreeToTerms ? 'input-error' : ''}
                  />
                  <span className="checkmark"></span>
                  <span className="terms-text">
                    I agree to the{' '}
                    <Link to="/terms" className="terms-link">Terms & Conditions</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="terms-link">Privacy Policy</Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <div className="error-message">{errors.agreeToTerms}</div>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="form-footer">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="link">
                    Sign In
                  </Link>
                </p>
                {/* <Link to="/" className="home-link">
                  ← Back to Home
                </Link> */}
              </div>
            </form>

            {/* Trust Badges */}
            {/* <div className="trust-badges">
              <div className="trust-badge">
                <div className="badge-icon">🔒</div>
                <p>SSL Encrypted</p>
              </div>
              <div className="trust-badge">
                <div className="badge-icon">🛡️</div>
                <p>PCI Compliant</p>
              </div>
              <div className="trust-badge">
                <div className="badge-icon">✓</div>
                <p>Bank-Level Security</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;