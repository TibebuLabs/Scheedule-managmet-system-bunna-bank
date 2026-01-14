import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaGithub, FaArrowRight, FaShieldAlt, FaBolt, FaMobileAlt } from 'react-icons/fa';

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
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse movement for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
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
      <div className="flex flex-col lg:flex-row max-w-6xl w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl  border border-white/20 min-h-[85vh] animate-fade-in transform transition-all duration-700 hover:shadow-3xl hover:shadow-indigo-200/50 relative z-10 overflow-hidden">
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
                    <span className="text-3xl">🏦</span>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                    Bunna Bank
                  </h1>
                  <p className="text-sm text-white/70 font-medium">Next-Gen Digital Banking</p>
                </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Welcome <span className="inline-block animate-wave">👋</span>
              </h2>
              <p className="text-lg text-white/80 leading-relaxed">
                Access your secure financial universe in one click.
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
                      <FaShieldAlt className="text-xl" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  </div>
                 
                  <FaArrowRight className="transform transition-transform duration-500 group-hover:translate-x-2 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 transition-all duration-500 hover:bg-white/15 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/10 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center transform transition-all duration-500 group-hover:rotate-12">
                      <FaBolt className="text-xl" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Real-Time Processing</h3>
                    <p className="text-sm text-white/70">Instant transfers & live updates</p>
                  </div>
                  <FaArrowRight className="transform transition-transform duration-500 group-hover:translate-x-2 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
              
              <div className="group bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 transition-all duration-500 hover:bg-white/15 hover:transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-white/10 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center transform transition-all duration-500 group-hover:rotate-12">
                      <FaMobileAlt className="text-xl" />
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Cross-Platform Sync</h3>
                    <p className="text-sm text-white/70">Seamless experience across all devices</p>
                  </div>
                  <FaArrowRight className="transform transition-transform duration-500 group-hover:translate-x-2 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            </div>
            
            {/* Demo Access Section */}
            <div className="mt-auto animate-fade-in animation-delay-400">
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/20">
               
                
               
                
              
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Modern Login Form */}
        <div className="lg:w-3/5 p-8 md:p-12 flex items-center justify-center">
          <div className="max-w-md w-full">
            {/* Form Header with Animation */}
            <div className="text-center mb-10 animate-slide-in-right">
              <h2 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Secure Login
              </h2>
              <p className="text-gray-600 text-lg">
                Sign in to your digital banking portal
              </p>
            </div>
            
            {/* Social Login Buttons - Modern */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 animate-slide-in-right animation-delay-200">
              <button
                onClick={() => handleSocialLogin('Google')}
                className="group relative overflow-hidden bg-white border-2 border-gray-200 rounded-xl p-4 font-semibold flex items-center justify-center gap-3 transition-all duration-500 hover:border-red-400 hover:bg-red-50 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center transform transition-transform duration-500 group-hover:rotate-12">
                    <FaGoogle className="text-white text-lg" />
                  </div>
                </div>
                <span className="text-gray-700 group-hover:text-red-600 transition-colors">Google</span>
              </button>
              
              <button
                onClick={() => handleSocialLogin('GitHub')}
                className="group relative overflow-hidden bg-white border-2 border-gray-200 rounded-xl p-4 font-semibold flex items-center justify-center gap-3 transition-all duration-500 hover:border-gray-800 hover:bg-gray-50 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center transform transition-transform duration-500 group-hover:rotate-12">
                    <FaGithub className="text-white text-lg" />
                  </div>
                </div>
                <span className="text-gray-700 group-hover:text-gray-900 transition-colors">GitHub</span>
              </button>
            </div>
            
            {/* Modern Divider */}
            <div className="relative my-10 animate-fade-in animation-delay-300">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
              </div>
            </div>
            
            {/* Enhanced Login Form */}
            <form onSubmit={handleSubmit} className="animate-slide-in-right animation-delay-400">
              {/* Animated Error Banner */}
              {errors.general && (
                <div className="mb-6 transform transition-all duration-500 animate-shake">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-r-xl p-4 flex items-start gap-3 shadow-lg">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">⚠️</span>
                    </div>
                    <div>
                      <p className="text-red-700 font-medium">{errors.general}</p>
                      <p className="text-red-600 text-sm mt-1">Please check your credentials</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Email Field with Floating Label Effect */}
              <div className="mb-7 group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <FaEnvelope className="text-indigo-600 text-sm" />
                    </div>
                  </div>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className={`w-full p-5 rounded-xl border-2 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 group-hover:border-indigo-300'} focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm`}
                    required
                  />
                  {formData.email && !errors.email && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  )}
                  {errors.email && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm animate-pulse">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      {errors.email}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Password Field with Strength Indicator */}
              <div className="mb-7 group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                      <FaLock className="text-indigo-600 text-sm" />
                    </div>
                  </div>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className={`w-full p-5 pr-12 rounded-xl border-2 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 group-hover:border-indigo-300'} focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 transition-colors duration-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-xl transform transition-transform duration-300 hover:scale-110" />
                    ) : (
                      <FaEye className="text-xl transform transition-transform duration-300 hover:scale-110" />
                    )}
                  </button>
                  {formData.password && !errors.password && (
                    <div className="mt-2">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${formData.password.length < 6 ? 'w-1/3 bg-red-400' : formData.password.length < 10 ? 'w-2/3 bg-amber-400' : 'w-full bg-emerald-500'}`}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.password.length < 6 ? 'Weak' : formData.password.length < 10 ? 'Good' : 'Strong'}
                      </p>
                    </div>
                  )}
                  {errors.password && (
                    <div className="mt-2 flex items-center gap-2 text-red-600 text-sm animate-pulse">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      {errors.password}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enhanced Form Options */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all duration-300 ${rememberMe ? 'bg-gradient-to-br from-indigo-500 to-purple-500 border-transparent' : 'border-gray-300 group-hover:border-indigo-400'} group-hover:scale-110`}>
                      {rememberMe && (
                        <span className="text-white text-sm">✓</span>
                      )}
                    </div>
                    <div className={`absolute -inset-2 bg-gradient-to-r from-indigo-500/0 to-purple-500/0 rounded-lg transition-all duration-300 ${rememberMe ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30' : ''}`} />
                  </div>
                  <span className="text-gray-700 font-medium group-hover:text-indigo-600 transition-colors">
                    Remember this device
                  </span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="group text-indigo-600 font-semibold flex items-center gap-2 hover:text-indigo-800 transition-colors"
                >
                  <span>Forgot Password?</span>
                  <FaArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
              
              {/* Enhanced Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl p-5 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mb-6"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700/0 via-white/20 to-purple-700/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
              
              {/* Modern Form Footer */}
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-gray-500 text-sm">
                      New to Bunna Bank?
                    </span>
                  </div>
                </div>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 text-emerald-700 font-semibold rounded-xl px-6 py-3 transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <span>Create Free Account</span>
                  <FaArrowRight className="transform transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              
              </div>
            </form>
            
          
          </div>
        </div>
      </div>
      
      {/* Interactive Floating Notification */}
     
    </div>
  );
};

export default LoginPage;