
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaGithub, 
  FaArrowRight, FaShieldAlt, FaChartLine, FaGlobe, FaCheckCircle 
} from 'react-icons/fa';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  
  // State
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [activeField, setActiveField] = useState('');

  // Form Handling
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
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
      if (rememberMe) localStorage.setItem('rememberedEmail', formData.email);
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: 'Invalid credentials. Please try again.' });
    }
  };

  // Helper for password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length > 6) score += 1;
    if (pass.length > 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    return score; // 0 to 4
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F3F4F6] relative overflow-hidden font-sans">
      
      {/* --- Background Architecture --- */}
      <div className="absolute inset-0 z-0">
        {/* Professional Mesh Gradient */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-blue-100/50 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-100/50 blur-[100px]" />
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.4]" 
             style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>
      </div>

      {/* --- Main Container --- */}
      <div className="relative z-10 w-full max-w-[1200px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col lg:flex-row min-h-[700px] animate-fade-in-up">
        
        {/* --- Left Panel: Brand & Value (40%) --- */}
        <div className="lg:w-[40%] bg-[#0F172A] relative flex flex-col justify-between p-12 text-white overflow-hidden">
          {/* Abstract Design Elements */}
          <div className="absolute top-0 right-0 w-full h-full opacity-10">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="url(#grad1)" />
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor:'white', stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:'transparent', stopOpacity:1}} />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Brand Logo */}
          <div className="relative z-10 flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-xl font-bold text-white">B</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Bunna Bank</span>
          </div>

          {/* Value Props */}
          <div className="relative z-10 space-y-8 my-auto">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Banking for the <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                Digital Age
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Experience the future of finance with industry-leading security and real-time insights.
            </p>

            <div className="space-y-4 pt-4">
              {[
                { icon: FaShieldAlt, text: "Military-grade Encryption" },
                { icon: FaChartLine, text: "AI-Powered Analytics" },
                { icon: FaGlobe, text: "Global Transactions" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 text-slate-300">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <item.icon className="text-sm text-blue-400" />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Copyright */}
          <div className="relative z-10 pt-10 text-xs text-slate-500">
            © 2026 Bunna Bank Corp. All rights reserved.
          </div>
        </div>

        {/* --- Right Panel: Login Form (60%) --- */}
        <div className="lg:w-[60%] p-8 md:p-16 bg-white flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-500">Please enter your details to sign in.</p>
            </div>

            {/* Social Login (Clean) */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button 
                onClick={() => alert('Google Login Demo')}
                className="flex items-center justify-center gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                <FaGoogle className="text-red-500" />
                <span className="text-sm font-semibold text-slate-600">Google</span>
              </button>
              <button 
                onClick={() => alert('Github Login Demo')}
                className="flex items-center justify-center gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                <FaGithub className="text-slate-900" />
                <span className="text-sm font-semibold text-slate-600">GitHub</span>
              </button>
            </div>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center"><span className="bg-white px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">or sign in with email</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Global Error */}
              {errors.general && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm animate-shake">
                  <FaShieldAlt /> {errors.general}
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                <div className={`relative transition-all duration-200 ${activeField === 'email' ? 'transform -translate-y-1' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className={`${activeField === 'email' ? 'text-blue-500' : 'text-slate-400'} transition-colors`} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField('')}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                    placeholder="name@company.com"
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email}</p>}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-slate-700">Password</label>
                  <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700">Forgot Password?</Link>
                </div>
                <div className={`relative transition-all duration-200 ${activeField === 'password' ? 'transform -translate-y-1' : ''}`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaLock className={`${activeField === 'password' ? 'text-blue-500' : 'text-slate-400'} transition-colors`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onFocus={() => setActiveField('password')}
                    onBlur={() => setActiveField('')}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-12 py-3.5 rounded-xl border bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                {/* Clean Password Strength Indicator */}
                {formData.password && !errors.password && (
                  <div className="mt-3 flex gap-1 h-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div 
                        key={step} 
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          strength >= step 
                            ? (strength <= 2 ? 'bg-orange-400' : 'bg-emerald-500') 
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                )}
                {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>}
              </div>

              {/* Actions */}
              <div className="flex items-center mb-6">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer select-none">
                  Keep me logged in
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In to Dashboard <FaArrowRight className="text-sm" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Decorative Blur Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
    </div>
  );
};

// Add this to your index.css or equivalent if not using standard Tailwind animations
/*
@layer utilities {
  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }
  .animate-shake {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  }
  
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes shake {
    10%, 90% { transform: translate3d(-1px, 0, 0); }
    20%, 80% { transform: translate3d(2px, 0, 0); }
    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
    40%, 60% { transform: translate3d(4px, 0, 0); }
  }
}
*/

export default LoginPage;