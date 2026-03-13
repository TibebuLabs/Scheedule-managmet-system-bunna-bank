import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaGithub, 
  FaArrowRight, FaShieldAlt, FaBolt, FaMobileAlt, FaUniversity,
  FaChartLine, FaHandshake, FaCreditCard, FaWallet, FaUserCheck,
  FaClock, FaGlobe, FaCrown, FaStar, FaCheckCircle, FaTimes,
  FaInfoCircle, FaRegCheckCircle
} from 'react-icons/fa';

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
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState({
    email: false,
    password: false
  });
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  // Feature carousel data
  const features = [
    {
      icon: <FaUniversity className="text-2xl" />,
      title: "Digital Banking Suite",
      description: "Complete financial management at your fingertips",
      color: "from-amber-600 to-amber-800",
      stats: "24/7 Access"
    },
    {
      icon: <FaShieldAlt className="text-2xl" />,
      title: "Advanced Security",
      description: "Multi-layer protection for your transactions",
      color: "from-emerald-600 to-emerald-800",
      stats: "256-bit SSL"
    },
    {
      icon: <FaChartLine className="text-2xl" />,
      title: "Smart Analytics",
      description: "AI-powered insights for better decisions",
      color: "from-blue-600 to-blue-800",
      stats: "Real-time"
    },
    {
      icon: <FaHandshake className="text-2xl" />,
      title: "Premium Benefits",
      description: "Exclusive offers for loyal customers",
      color: "from-purple-600 to-purple-800",
      stats: "Zero Fees"
    },
    {
      icon: <FaGlobe className="text-2xl" />,
      title: "Global Transfers",
      description: "Send money worldwide instantly",
      color: "from-pink-600 to-pink-800",
      stats: "170+ Countries"
    },
    {
      icon: <FaCrown className="text-2xl" />,
      title: "Priority Support",
      description: "24/7 dedicated customer service",
      color: "from-indigo-600 to-indigo-800",
      stats: "Instant Response"
    }
  ];

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  // Show welcome message on load
  useEffect(() => {
    setShowWelcomeMessage(true);
    const timer = setTimeout(() => setShowWelcomeMessage(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Track mouse movement for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

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
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-[#fdf8f5] via-[#faf1eb] to-[#f5e6de] relative overflow-hidden">
      
      {/* Welcome Toast Message */}
      {showWelcomeMessage && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-white rounded-xl shadow-2xl border-l-4 border-[#3d1209] p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#3d1209]/10 rounded-full flex items-center justify-center">
              <FaUniversity className="text-[#3d1209]" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Welcome to Bunna Bank</p>
              <p className="text-sm text-gray-600">Please sign in to continue</p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated Gradient Orbs with #3d1209 */}
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
        <div className="absolute w-[400px] h-[400px] top-1/3 left-1/3 bg-gradient-to-r from-[#3d1209]/5 to-amber-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* Floating Particles */}
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-[#3d1209]/30 to-amber-500/30 rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${20 + Math.random() * 20}s infinite linear`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
        
        {/* Geometric Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #3d1209 1px, transparent 0)`,
            backgroundSize: '30px 30px'
          }}
        />
      </div>

      {/* Main Card */}
      <div className="flex flex-col lg:flex-row max-w-7xl w-full bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 min-h-[85vh] animate-fade-in-up relative z-10 overflow-hidden">
        
        {/* Left Side - Premium Brand Section with #3d1209 */}
        <div className="lg:w-2/5 bg-gradient-to-br from-[#3d1209] via-[#4d170c] to-[#2d0d07] text-white p-8 md:p-10 relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0">
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
          
          <div className="relative z-10 h-full flex flex-col">
            {/* Brand Header with Animation */}
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
                  <p className="text-sm text-amber-200/80 font-medium">Ethiopia's Most Trusted Bank</p>
                </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Welcome Back
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Access your secure financial universe with confidence.
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
                  <div className={`bg-gradient-to-r ${feature.color} rounded-2xl p-5 backdrop-blur-sm`}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                        <p className="text-sm text-white/80 mb-2">{feature.description}</p>
                        <div className="flex items-center gap-2">
                          <FaStar className="text-amber-300 text-xs" />
                          <span className="text-xs text-white/90 font-semibold">{feature.stats}</span>
                        </div>
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

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="text-2xl font-bold text-amber-400">24/7</div>
                <div className="text-xs text-white/70">Support</div>
              </div>
              <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="text-2xl font-bold text-amber-400">100%</div>
                <div className="text-xs text-white/70">Secure</div>
              </div>
              <div className="text-center p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="text-2xl font-bold text-amber-400">1M+</div>
                <div className="text-xs text-white/70">Users</div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-amber-400 text-xs" />
                ))}
              </div>
              <p className="text-sm text-white/90 italic mb-2">
                "The most secure and user-friendly banking platform I've ever used."
              </p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <FaUserCheck className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold">- Abebech K.</p>
                  <p className="text-xs text-white/60">Premium Customer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Enhanced Login Form */}
        <div className="lg:w-3/5 p-8 md:p-12 flex items-center justify-center overflow-y-auto">
          <div className="max-w-md w-full">
            {/* Form Header */}
            <div className="text-center mb-8 animate-slide-in-right">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="bg-gradient-to-r from-[#3d1209] to-amber-600 bg-clip-text text-transparent">
                  Secure Login
                </span>
              </h2>
              <p className="text-gray-600">
                Sign in to access your account and manage your finances
              </p>
            </div>
            
            {/* Social Login Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 animate-slide-in-right animation-delay-200">
              <button
                onClick={() => handleSocialLogin('Google')}
                className="group relative overflow-hidden bg-white border-2 border-gray-200 rounded-xl p-4 font-semibold flex items-center justify-center gap-3 transition-all duration-500 hover:border-[#3d1209] hover:bg-[#3d1209]/5 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#3d1209] to-amber-600 rounded-full flex items-center justify-center transform transition-transform duration-500 group-hover:rotate-12">
                    <FaGoogle className="text-white text-lg" />
                  </div>
                </div>
                <span className="text-gray-700 group-hover:text-[#3d1209] transition-colors">Google</span>
              </button>
              
              <button
                onClick={() => handleSocialLogin('GitHub')}
                className="group relative overflow-hidden bg-white border-2 border-gray-200 rounded-xl p-4 font-semibold flex items-center justify-center gap-3 transition-all duration-500 hover:border-[#3d1209] hover:bg-[#3d1209]/5 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#3d1209] to-amber-600 rounded-full flex items-center justify-center transform transition-transform duration-500 group-hover:rotate-12">
                    <FaGithub className="text-white text-lg" />
                  </div>
                </div>
                <span className="text-gray-700 group-hover:text-[#3d1209] transition-colors">GitHub</span>
              </button>
            </div>
            
            {/* Divider */}
            <div className="relative my-8 animate-fade-in animation-delay-300">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or sign in with email</span>
              </div>
            </div>
            
            {/* Login Form */}
            <form onSubmit={handleSubmit} className="animate-slide-in-right animation-delay-400 space-y-5">
              {/* Error Banner */}
              {errors.general && (
                <div className="mb-6 animate-shake">
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-[#3d1209] rounded-r-xl p-4 flex items-start gap-3 shadow-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#3d1209] to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaTimes className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="text-[#3d1209] font-medium">{errors.general}</p>
                      <p className="text-gray-600 text-sm mt-1">Please check your credentials</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Email Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaEnvelope className="text-[#3d1209] text-xs" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    placeholder="you@example.com"
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                      errors.email
                        ? 'border-red-400 bg-red-50 focus:border-red-500'
                        : isFocused.email
                        ? 'border-[#3d1209] bg-white shadow-lg shadow-[#3d1209]/10'
                        : 'border-gray-200 hover:border-[#3d1209]/50'
                    } focus:outline-none focus:ring-4 focus:ring-[#3d1209]/10`}
                  />
                  {formData.email && !errors.email && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
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
              
              {/* Password Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaLock className="text-[#3d1209] text-xs" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    placeholder="Enter your password"
                    className={`w-full p-4 pr-12 rounded-xl border-2 transition-all duration-300 ${
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
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#3d1209] transition-colors"
                  >
                    {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {formData.password && !errors.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            formData.password.length < 6 
                              ? 'w-1/3 bg-red-500' 
                              : formData.password.length < 10 
                              ? 'w-2/3 bg-amber-500' 
                              : 'w-full bg-[#3d1209]'
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-medium ${
                        formData.password.length < 6 
                          ? 'text-red-600' 
                          : formData.password.length < 10 
                          ? 'text-amber-600' 
                          : 'text-[#3d1209]'
                      }`}>
                        {formData.password.length < 6 ? 'Weak' : formData.password.length < 10 ? 'Good' : 'Strong'}
                      </span>
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
              
              {/* Form Options */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all duration-300 ${
                      rememberMe
                        ? 'bg-[#3d1209] border-[#3d1209]'
                        : 'border-gray-300 group-hover:border-[#3d1209]'
                    }`}>
                      {rememberMe && (
                        <FaCheckCircle className="text-white text-xs" />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 group-hover:text-[#3d1209] transition-colors">
                    Remember me
                  </span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="group text-sm text-[#3d1209] font-medium flex items-center gap-1 hover:text-amber-600 transition-colors"
                >
                  <span>Forgot Password?</span>
                  <FaArrowRight className="text-xs transform transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden bg-gradient-to-r from-[#3d1209] to-[#5a1b0e] text-white font-semibold rounded-xl p-4 transition-all duration-500 hover:shadow-2xl hover:shadow-[#3d1209]/30 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <FaArrowRight className="transform transition-transform duration-500 group-hover:translate-x-2" />
                    </>
                  )}
                </div>
              </button>
              
              {/* Register Link */}
              <div className="text-center pt-6">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="group inline-flex items-center gap-1 text-[#3d1209] font-semibold hover:text-amber-600 transition-colors"
                  >
                    <span>Create Free Account</span>
                    <FaArrowRight className="text-xs transform transition-transform group-hover:translate-x-1" />
                  </Link>
                </p>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-3 text-xs text-gray-400 pt-4">
                <FaShieldAlt />
                <span>256-bit SSL Encrypted</span>
                <span>•</span>
                <FaClock />
                <span>Session expires in 24h</span>
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
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-300 {
          animation-delay: 300ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;