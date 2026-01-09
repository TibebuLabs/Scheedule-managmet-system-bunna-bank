import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaArrowRight, FaShieldAlt, FaBolt, FaMobileAlt, FaChartLine, FaHandshake } from 'react-icons/fa';
import validator from 'validator';

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
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false
  });

  // Track mouse movement for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Check password strength
  useEffect(() => {
    const checkStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength += 20;
      if (/[A-Z]/.test(password)) strength += 20;
      if (/[a-z]/.test(password)) strength += 20;
      if (/[0-9]/.test(password)) strength += 20;
      if (/[^A-Za-z0-9]/.test(password)) strength += 20;
      return strength;
    };
    
    if (formData.password) {
      setPasswordStrength(checkStrength(formData.password));
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

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

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
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
      }, 3000);
      
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

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 20) return 'bg-red-500';
    if (passwordStrength < 40) return 'bg-orange-500';
    if (passwordStrength < 60) return 'bg-yellow-500';
    if (passwordStrength < 80) return 'bg-blue-500';
    return 'bg-red-600';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 20) return 'Very Weak';
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 60) return 'Fair';
    if (passwordStrength < 80) return 'Good';
    return 'Excellent';
  };

  const getPasswordRequirements = () => {
    const requirements = [
      { label: 'At least 8 characters', met: formData.password.length >= 8 },
      { label: 'Uppercase letter', met: /[A-Z]/.test(formData.password) },
      { label: 'Lowercase letter', met: /[a-z]/.test(formData.password) },
      { label: 'Number', met: /[0-9]/.test(formData.password) },
      { label: 'Special character', met: /[^A-Za-z0-9]/.test(formData.password) }
    ];
    return requirements;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-50 via-white to-red-50 relative overflow-hidden">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full animate-fade-in transform transition-all duration-500 scale-100 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mb-6 animate-bounce">
                <FaCheckCircle className="text-white text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Account Created Successfully!</h3>
              <p className="text-gray-600 mb-6">
                Your account has been created correctly. To access the system, please sign in with your credentials.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                You will be automatically redirected to the login page in a few seconds...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-700 h-full rounded-full animate-progress" />
              </div>
              <button
                onClick={handleCloseModal}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                Go to Login Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Gradient Orbs */}
        <div className="absolute w-[500px] h-[500px] -top-48 -left-48 bg-gradient-to-r from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-[400px] h-[400px] -bottom-48 -right-48 bg-gradient-to-r from-blue-300/30 to-cyan-300/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute w-[300px] h-[300px] top-1/4 right-1/4 bg-gradient-to-r from-emerald-300/20 to-teal-300/20 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-indigo-400/50 to-purple-400/50 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${20 + Math.random() * 20}s infinite linear ${Math.random() * 5}s`,
              transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
            }}
          />
        ))}
        
        {/* Geometric Patterns */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #667eea 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Main Card */}
      <div className="flex flex-col lg:flex-row max-w-6xl w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 min-h-[85vh] animate-fade-in transform transition-all duration-700 hover:shadow-3xl hover:shadow-indigo-200/50 relative z-10 overflow-hidden">
        {/* Left Side - Modern Brand Section */}
        <div className="lg:w-2/5 bg-gradient-to-br from-red-900 via-red-900 to-red-900 text-white p-8 md:p-12 relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/5 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-pink-500/10 to-transparent rounded-full blur-3xl" />
          </div>
          
          {/* Glowing Border Effect */}
          <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl" />
          
          <div className="relative z-10 h-full flex flex-col">
            {/* Brand Header with Animation */}
            <div className="mb-8 animate-slide-in-left">
              <div className="flex items-center gap-4 mb-6 group cursor-pointer" onClick={() => navigate('/')}>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-white to-indigo-100 rounded-2xl flex items-center justify-center transform transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-2xl shadow-indigo-500/30">
                    <span className="text-3xl">🚀</span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                    Bunna Bank
                  </h1>
                  <p className="text-sm text-white/70 font-medium">Begin Your Banking Journey</p>
                </div>
              </div>
              
           
              <p className="text-lg text-white/80 leading-relaxed">
                Create your account in minutes and unlock a world of secure banking features.
              </p>
            </div>
            
            {/* Interactive Feature Cards */}
            <div className="space-y-4 mb-8 animate-slide-in-left animation-delay-200">
              <div 
                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 transition-all duration-500 hover:bg-white/15 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/10 cursor-pointer"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center transform transition-all duration-500 group-hover:rotate-12">
                      <FaHandshake className="text-xl" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Zero Account Fees</h3>
                    <p className="text-sm text-white/70">No hidden charges, no monthly fees</p>
                  </div>
                  <FaArrowRight className="transform transition-transform duration-500 group-hover:translate-x-2 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 transition-all duration-500 hover:bg-white/15 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/10 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center transform transition-all duration-500 group-hover:rotate-12">
                      <FaChartLine className="text-xl" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">High Interest Rates</h3>
                    <p className="text-sm text-white/70">Earn more on your savings</p>
                  </div>
                  <FaArrowRight className="transform transition-transform duration-500 group-hover:translate-x-2 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 transition-all duration-500 hover:bg-white/15 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/10 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center transform transition-all duration-500 group-hover:rotate-12">
                      <FaShieldAlt className="text-xl" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">256-bit Security</h3>
                    <p className="text-sm text-white/70">Military-grade encryption</p>
                  </div>
                  <FaArrowRight className="transform transition-transform duration-500 group-hover:translate-x-2 opacity-0 group-hover:opacity-100" />
                </div>
              </div>

              <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 transition-all duration-500 hover:bg-white/15 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/10 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center transform transition-all duration-500 group-hover:rotate-12">
                      <FaBolt className="text-xl" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Instant Setup</h3>
                    <p className="text-sm text-white/70">Get started in under 5 minutes</p>
                  </div>
                  <FaArrowRight className="transform transition-transform duration-500 group-hover:translate-x-2 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            </div>
          
          </div>
        </div>
        
        {/* Right Side - Modern Registration Form */}
        <div className="lg:w-3/5 p-8 md:p-12 flex items-center justify-center">
          <div className="max-w-md w-full">
            {/* Form Header with Animation */}
            <div className="text-center mb-10 animate-slide-in-right">
              <h2 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Create Account
              </h2>
              <p className="text-gray-600 text-lg">
                Join thousands of satisfied customers
              </p>
            </div>

            {/* Backend Error Display */}
            {backendError && (
              <div className="mb-6 transform transition-all duration-500 animate-shake">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-r-xl p-4 flex items-start gap-3 shadow-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">⚠️</span>
                  </div>
                  <div>
                    <p className="text-red-700 font-medium">{backendError}</p>
                    <p className="text-red-600 text-sm mt-1">Please check your information</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Enhanced Registration Form */}
            <form onSubmit={handleSubmit} className="animate-slide-in-right animation-delay-400 space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <FaUser className="text-indigo-600 text-sm" />
                    </div>
                    First Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onFocus={() => handleFocus('firstName')}
                      onBlur={() => handleBlur('firstName')}
                      placeholder="John"
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                        errors.firstName
                          ? 'border-red-400 bg-red-50 focus:border-red-500'
                          : isFocused.firstName
                          ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-100'
                          : 'border-gray-200 hover:border-indigo-300'
                      } focus:outline-none focus:ring-4 focus:ring-indigo-100`}
                      required
                    />
                    {formData.firstName && formData.firstName.length >= 2 && !errors.firstName && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.firstName && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      {errors.firstName}
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <FaUser className="text-indigo-600 text-sm" />
                    </div>
                    Last Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onFocus={() => handleFocus('lastName')}
                      onBlur={() => handleBlur('lastName')}
                      placeholder="Doe"
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                        errors.lastName
                          ? 'border-red-400 bg-red-50 focus:border-red-500'
                          : isFocused.lastName
                          ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-100'
                          : 'border-gray-200 hover:border-indigo-300'
                      } focus:outline-none focus:ring-4 focus:ring-indigo-100`}
                      required
                    />
                    {formData.lastName && formData.lastName.length >= 2 && !errors.lastName && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.lastName && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                      {errors.lastName}
                    </div>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <FaEnvelope className="text-indigo-600 text-sm" />
                  </div>
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    placeholder="john.doe@example.com"
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                      errors.email
                        ? 'border-red-400 bg-red-50 focus:border-red-500'
                        : isFocused.email
                        ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-100'
                        : 'border-gray-200 hover:border-indigo-300'
                    } focus:outline-none focus:ring-4 focus:ring-indigo-100`}
                    required
                  />
                  {formData.email && validator.isEmail(formData.email) && !errors.email && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-white text-xs" />
                      </div>
                    </div>
                  )}
                </div>
                {errors.email && (
                  <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Phone Field */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <FaPhone className="text-indigo-600 text-sm" />
                  </div>
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="flex items-center">
                    <div className="absolute left-4 flex items-center gap-2">
                      <span className="text-gray-500">+1</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => handleFocus('phone')}
                      onBlur={() => handleBlur('phone')}
                      placeholder="1234567890"
                      className={`w-full p-4 pl-14 rounded-xl border-2 transition-all duration-300 ${
                        errors.phone
                          ? 'border-red-400 bg-red-50 focus:border-red-500'
                        : isFocused.phone
                        ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-100'
                        : 'border-gray-200 hover:border-indigo-300'
                      } focus:outline-none focus:ring-4 focus:ring-indigo-100`}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength="10"
                      required
                    />
                    {formData.phone && formData.phone.replace(/\D/g, '').length >= 10 && !errors.phone && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {errors.phone && (
                  <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {errors.phone}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <FaLock className="text-indigo-600 text-sm" />
                  </div>
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    placeholder="Create a strong password"
                    className={`w-full p-4 pr-12 rounded-xl border-2 transition-all duration-300 ${
                      errors.password
                        ? 'border-red-400 bg-red-50 focus:border-red-500'
                        : isFocused.password
                        ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-100'
                        : 'border-gray-200 hover:border-indigo-300'
                    } focus:outline-none focus:ring-4 focus:ring-indigo-100`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                {/* Password Strength & Requirements */}
                {formData.password && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Password strength:</span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength < 20 ? 'text-red-600' :
                        passwordStrength < 40 ? 'text-orange-600' :
                        passwordStrength < 60 ? 'text-yellow-600' :
                        passwordStrength < 80 ? 'text-blue-600' : 'text-emerald-600'
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      {getPasswordRequirements().map((req, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            req.met 
                              ? 'bg-emerald-100 text-emerald-600' 
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            <span className="text-xs">{req.met ? '✓' : ''}</span>
                          </div>
                          <span className={`text-xs ${req.met ? 'text-emerald-600' : 'text-gray-500'}`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <FaLock className="text-indigo-600 text-sm" />
                  </div>
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => handleFocus('confirmPassword')}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="Confirm your password"
                    className={`w-full p-4 pr-12 rounded-xl border-2 transition-all duration-300 ${
                      errors.confirmPassword
                        ? 'border-red-400 bg-red-50 focus:border-red-500'
                        : isFocused.confirmPassword
                        ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-100'
                        : 'border-gray-200 hover:border-indigo-300'
                    } focus:outline-none focus:ring-4 focus:ring-indigo-100`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Terms & Conditions */}
              <div className="group">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-1">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-300 ${
                      formData.agreeToTerms
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 border-transparent'
                        : 'border-gray-300 group-hover:border-indigo-400'
                    } group-hover:scale-110`}>
                      {formData.agreeToTerms && (
                        <FaCheckCircle className="text-white text-xs" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700 flex-1">
                    I agree to the{' '}
                    <Link to="/terms" className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline">
                      Terms & Conditions
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    {errors.agreeToTerms}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl p-5 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700/0 via-white/20 to-purple-700/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <FaArrowRight className="transform transition-transform duration-500 group-hover:translate-x-2" />
                    </>
                  )}
                </div>
              </button>

              {/* Login Link */}
              <div className="text-center pt-6">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="group inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                  >
                    <span>Sign In</span>
                    <FaArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;