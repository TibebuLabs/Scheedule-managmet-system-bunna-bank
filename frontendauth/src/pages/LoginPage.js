import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaUniversity } from 'react-icons/fa';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Enter a valid email';
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
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: 'Invalid email or password. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fdf8f5]">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-[#3d1209] to-[#2d0d07] flex-col items-center justify-center p-12 text-white">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
            <FaUniversity className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-300 to-amber-100 bg-clip-text text-transparent mb-2">
            Bunna Bank
          </h1>
          <p className="text-amber-200/80 text-sm">Staff Schedule Management</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <FaUniversity className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-[#3d1209]">Bunna Bank</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Sign In</h2>
          <p className="text-gray-500 text-sm mb-8">Enter your credentials to continue</p>

          {errors.general && (
            <div className="mb-5 p-3 bg-red-50 border-l-4 border-[#3d1209] rounded-r-lg text-sm text-[#3d1209]">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full pl-9 pr-4 py-3 rounded-xl border-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#3d1209]/20 ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#3d1209]'
                  }`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full pl-9 pr-10 py-3 rounded-xl border-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#3d1209]/20 ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#3d1209]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3d1209] transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-[#3d1209] hover:text-amber-700 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3d1209] hover:bg-[#5a1b0e] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <FaArrowRight className="text-sm" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#3d1209] font-semibold hover:text-amber-700 transition-colors">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
