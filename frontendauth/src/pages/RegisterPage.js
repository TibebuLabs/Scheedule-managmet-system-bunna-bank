import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, 
  FaCheckCircle, FaArrowRight, FaShieldAlt, FaBolt, 
  FaChartLine, FaHandshake, FaWallet, FaUniversity, 
  FaMobileAlt, FaCreditCard, FaGift, FaStar, FaCrown,
  FaTimes, FaInfoCircle, FaRegCheckCircle
} from 'react-icons/fa';
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
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false
  });

  // Feature carousel data
  const features = [
    {
      icon: <FaUniversity className="text-2xl" />,
      title: "Digital Banking",
      description: "24/7 access to your accounts from anywhere",
      color: "from-amber-600 to-amber-800"
    },
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: "Bank-Grade Security",
      description: "Your money is protected with 256-bit encryption",
      color: "from-emerald-600 to-emerald-800"
    },
    {
      icon: <FaChartLine className="text-2xl" />,
      title: "Smart Savings",
      description: "Automated savings tools to grow your wealth",
      color: "from-blue-600 to-blue-800"
    },
    {
      icon: <FaGift className="text-2xl" />,
      title: "Rewards Program",
      description: "Earn points on every transaction",
      color: "from-purple-600 to-purple-800"
    },
    {
      icon: <FaMobileAlt className="text-2xl" />,
      title: "Mobile App",
      description: "Bank on-the-go with our award-winning app",
      color: "from-pink-600 to-pink-800"
    },
    {
      icon: <FaCreditCard className="text-2xl" />,
      title: "Premium Cards",
      description: "Exclusive benefits with every card",
      color: "from-indigo-600 to-indigo-800"
    }
  ];

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

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
    return 'bg-[#3d1209]';
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
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-[#fdf8f5] via-[#faf1eb] to-[#f5e6de] relative overflow-hidden">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full transform transition-all duration-500 scale-100 shadow-2xl relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#3d1209] via-amber-600 to-[#3d1209]"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#3d1209]/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Animated checkmark */}
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-[#3d1209] to-[#5a1b0e] rounded-full flex items-center justify-center animate-bounce">
                  <FaCheckCircle className="text-white text-4xl" />
                </div>
                <div className="absolute -inset-2 bg-[#3d1209]/20 rounded-full animate-ping"></div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Bunna Bank! 🎉</h3>
              <p className="text-gray-600 mb-2">
                Your account has been created successfully
              </p>
              <p className="text-sm text-[#3d1209] font-semibold mb-6">
                Account: {formData.firstName} {formData.lastName}
              </p>
              
              <div className="w-full bg-gray-100 rounded-xl p-4 mb-6">
                <p className="text-gray-600 text-sm">
                  You will be automatically redirected to the login page...
                </p>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#3d1209] to-amber-600 h-full rounded-full animate-progress" />
                </div>
              </div>
              
              <button
                onClick={handleCloseModal}
                className="w-full bg-gradient-to-r from-[#3d1209] to-[#5a1b0e] text-white font-semibold rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <span>Go to Login Now</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs with new color scheme */}
        <div 
          className="absolute w-[600px] h-[600px] -top-48 -left-48 bg-gradient-to-r from-[#3d1209]/10 to-amber-500/10 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] -bottom-48 -right-48 bg-gradient-to-r from-amber-500/10 to-[#3d1209]/10 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`
          }}
        />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#3d1209]/20 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${15 + Math.random() * 15}s infinite linear`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
        
        {/* Geometric pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #3d1209 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Main Card - Split Layout */}
      <div className="flex flex-col lg:flex-row max-w-7xl w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 min-h-[90vh] animate-fade-in-up relative z-10 overflow-hidden">
        
        {/* Left Side - Premium Branding Section with #3d1209 */}
        <div className="lg:w-2/5 bg-gradient-to-br from-[#3d1209] via-[#4d170c] to-[#2d0d07] text-white p-8 md:p-10 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '30px 30px'
              }}
            />
            
            {/* Glowing Orbs */}
            <div className="absolute top-20 right-20 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col">
            {/* Logo and Brand */}
            <div className="mb-8 animate-slide-in-left">
              <div className="flex items-center gap-4 mb-6 group cursor-pointer" onClick={() => navigate('/')}>
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center transform transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-2xl shadow-amber-500/30">
                    <FaUniversity className="text-white text-3xl" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent">
                    Bunna Bank
                  </h1>
                  <p className="text-sm text-amber-200/80 font-medium">Ethiopia's Trusted Bank</p>
                </div>
              </div>
              
              <p className="text-lg text-white/80 leading-relaxed">
                Join over 1 million happy customers who trust us with their financial future.
              </p>
            </div>

            {/* Feature Carousel */}
            <div className="relative h-48 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-700 transform ${
                    index === activeFeature
                      ? 'opacity-100 translate-x-0'
                      : index < activeFeature
                      ? 'opacity-0 -translate-x-full'
                      : 'opacity-0 translate-x-full'
                  }`}
                >
                  <div className={`bg-gradient-to-r ${feature.color} rounded-2xl p-6 backdrop-blur-sm`}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                        <p className="text-sm text-white/80">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Carousel indicators */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveFeature(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === activeFeature
                        ? 'w-8 bg-amber-400'
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">1M+</div>
                <div className="text-xs text-white/60">Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">24/7</div>
                <div className="text-xs text-white/60">Support</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">100%</div>
                <div className="text-xs text-white/60">Secure</div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <p className="text-sm text-white/90 italic">
                "Best banking experience ever! The mobile app is fantastic and customer service is top-notch."
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <FaStar className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold">- Solomon A.</p>
                  <p className="text-xs text-white/60">Customer since 2020</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form with #3d1209 accents */}
        <div className="lg:w-3/5 p-8 md:p-12 flex items-center justify-center overflow-y-auto">
          <div className="max-w-md w-full">
            {/* Form Header */}
            <div className="text-center mb-8 animate-slide-in-right">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="bg-gradient-to-r from-[#3d1209] to-amber-600 bg-clip-text text-transparent">
                  Create Account
                </span>
              </h2>
              <p className="text-gray-600">
                Join the digital banking revolution today
              </p>
            </div>

            {/* Backend Error Display */}
            {backendError && (
              <div className="mb-6 animate-shake">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-[#3d1209] rounded-r-xl p-4 flex items-start gap-3 shadow-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#3d1209] to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaTimes className="text-white text-lg" />
                  </div>
                  <div>
                    <p className="text-[#3d1209] font-medium">{backendError}</p>
                    <p className="text-gray-600 text-sm mt-1">Please check your information</p>
                  </div>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaUser className="text-[#3d1209] text-xs" />
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
                      className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${
                        errors.firstName
                          ? 'border-red-400 bg-red-50 focus:border-red-500'
                          : isFocused.firstName
                          ? 'border-[#3d1209] bg-white shadow-lg shadow-[#3d1209]/10'
                          : 'border-gray-200 hover:border-[#3d1209]/50'
                      } focus:outline-none focus:ring-4 focus:ring-[#3d1209]/10`}
                    />
                    {formData.firstName && formData.firstName.length >= 2 && !errors.firstName && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <FaRegCheckCircle className="text-[#3d1209] text-lg" />
                      </div>
                    )}
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaInfoCircle className="text-xs" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <FaUser className="text-[#3d1209] text-xs" />
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
                      className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${
                        errors.lastName
                          ? 'border-red-400 bg-red-50 focus:border-red-500'
                          : isFocused.lastName
                          ? 'border-[#3d1209] bg-white shadow-lg shadow-[#3d1209]/10'
                          : 'border-gray-200 hover:border-[#3d1209]/50'
                      } focus:outline-none focus:ring-4 focus:ring-[#3d1209]/10`}
                    />
                    {formData.lastName && formData.lastName.length >= 2 && !errors.lastName && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <FaRegCheckCircle className="text-[#3d1209] text-lg" />
                      </div>
                    )}
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <FaInfoCircle className="text-xs" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaEnvelope className="text-[#3d1209] text-xs" />
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
                    className={`w-full p-3 rounded-xl border-2 transition-all duration-300 ${
                      errors.email
                        ? 'border-red-400 bg-red-50 focus:border-red-500'
                        : isFocused.email
                        ? 'border-[#3d1209] bg-white shadow-lg shadow-[#3d1209]/10'
                        : 'border-gray-200 hover:border-[#3d1209]/50'
                    } focus:outline-none focus:ring-4 focus:ring-[#3d1209]/10`}
                  />
                  {formData.email && validator.isEmail(formData.email) && !errors.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FaRegCheckCircle className="text-[#3d1209] text-lg" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <FaInfoCircle className="text-xs" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaPhone className="text-[#3d1209] text-xs" />
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <span className="text-gray-500 text-sm">+251</span>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => handleFocus('phone')}
                    onBlur={() => handleBlur('phone')}
                    placeholder="1234567890"
                    className={`w-full p-3 pl-12 rounded-xl border-2 transition-all duration-300 ${
                      errors.phone
                        ? 'border-red-400 bg-red-50 focus:border-red-500'
                      : isFocused.phone
                      ? 'border-[#3d1209] bg-white shadow-lg shadow-[#3d1209]/10'
                      : 'border-gray-200 hover:border-[#3d1209]/50'
                    } focus:outline-none focus:ring-4 focus:ring-[#3d1209]/10`}
                    maxLength="10"
                  />
                  {formData.phone && formData.phone.replace(/\D/g, '').length >= 10 && !errors.phone && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <FaRegCheckCircle className="text-[#3d1209] text-lg" />
                    </div>
                  )}
                </div>
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <FaInfoCircle className="text-xs" />
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaLock className="text-[#3d1209] text-xs" />
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
                    className={`w-full p-3 pr-10 rounded-xl border-2 transition-all duration-300 ${
                      errors.password
                        ? 'border-red-400 bg-red-50 focus:border-red-500'
                        : isFocused.password
                        ? 'border-[#3d1209] bg-white shadow-lg shadow-[#3d1209]/10'
                        : 'border-gray-200 hover:border-[#3d1209]/50'
                    } focus:outline-none focus:ring-4 focus:ring-[#3d1209]/10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#3d1209] transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                {/* Password Strength */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Strength:</span>
                      <span className={`text-xs font-semibold ${
                        passwordStrength < 20 ? 'text-red-600' :
                        passwordStrength < 40 ? 'text-orange-600' :
                        passwordStrength < 60 ? 'text-yellow-600' :
                        passwordStrength < 80 ? 'text-blue-600' : 'text-[#3d1209]'
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${getPasswordStrengthColor()}`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    
                    {/* Password requirements */}
                    <div className="grid grid-cols-2 gap-1 mt-2">
                      {getPasswordRequirements().map((req, index) => (
                        <div key={index} className="flex items-center gap-1 text-xs">
                          <span className={req.met ? 'text-[#3d1209]' : 'text-gray-400'}>
                            {req.met ? '✓' : '○'}
                          </span>
                          <span className={req.met ? 'text-[#3d1209]' : 'text-gray-500'}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <FaInfoCircle className="text-xs" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaLock className="text-[#3d1209] text-xs" />
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
                    className={`w-full p-3 pr-10 rounded-xl border-2 transition-all duration-300 ${
                      errors.confirmPassword
                        ? 'border-red-400 bg-red-50 focus:border-red-500'
                        : isFocused.confirmPassword
                        ? 'border-[#3d1209] bg-white shadow-lg shadow-[#3d1209]/10'
                        : 'border-gray-200 hover:border-[#3d1209]/50'
                    } focus:outline-none focus:ring-4 focus:ring-[#3d1209]/10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#3d1209] transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <FaInfoCircle className="text-xs" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms & Conditions */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
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
                        ? 'bg-[#3d1209] border-[#3d1209]'
                        : 'border-gray-300 group-hover:border-[#3d1209]'
                    }`}>
                      {formData.agreeToTerms && (
                        <FaCheckCircle className="text-white text-xs" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 flex-1">
                    I agree to the{' '}
                    <Link to="/terms" className="text-[#3d1209] font-semibold hover:underline">
                      Terms & Conditions
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-[#3d1209] font-semibold hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <FaInfoCircle className="text-xs" />
                    {errors.agreeToTerms}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden bg-gradient-to-r from-[#3d1209] to-[#5a1b0e] text-white font-semibold rounded-xl p-4 transition-all duration-500 hover:shadow-2xl hover:shadow-[#3d1209]/30 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
              <div className="text-center pt-4">
                <p className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="group inline-flex items-center gap-1 text-[#3d1209] font-semibold hover:text-amber-600 transition-colors"
                  >
                    <span>Sign In</span>
                    <FaArrowRight className="text-xs transform transition-transform group-hover:translate-x-1" />
                  </Link>
                </p>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
                <FaShieldAlt />
                <span>256-bit SSL Encrypted</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
          100% { transform: translateY(0px) rotate(360deg); }
        }
        
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        .animate-progress {
          animation: progress 3s linear;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-slide-in-left {
          animation: slideInLeft 0.5s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .animation-delay-700 {
          animation-delay: 700ms;
        }
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;