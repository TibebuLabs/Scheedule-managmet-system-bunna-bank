import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaUniversity,
  FaCheckCircle,
  FaShieldAlt,
  FaCalendarCheck,
  FaUsersCog
} from 'react-icons/fa';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (errors.general) setErrors(prev => ({ ...prev, general: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid work email';
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
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: 'Invalid email or password. Please verify your credentials.' });
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#f8fafc] text-slate-800">
      {/* ================= LEFT PANEL (40% desktop) ================= */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 relative overflow-hidden bg-gradient-to-br from-[#3d1209] via-[#2a0b06] to-[#160503] text-white flex-col justify-between p-12 select-none">
        {/* Subtle geometric & particle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f59e0b 2%, transparent 0%)`,
            backgroundSize: '100px 100px'
          }}
        />

        {/* Ambient atmospheric glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#f59e0b]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#3d1209]/40 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] p-0.5 shadow-xl shadow-[#f59e0b]/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#230a05]/20 rounded-2xl flex items-center justify-center backdrop-blur-xs">
                <FaUniversity className="text-white text-2xl drop-shadow" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                Bunna Bank
              </h1>
              <p className="text-amber-200/70 text-xs font-medium tracking-widest uppercase">
                Bank of the Visionary
              </p>
            </div>
          </div>
        </div>

        {/* Central Pitch & Feature Bullets */}
        <div className="relative z-10 py-8 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
            Enterprise Staff Portal
          </div>

          <h2 className="text-3xl xl:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
            Staff Schedule Management System
          </h2>

          <p className="text-slate-300 text-sm xl:text-base leading-relaxed mb-8 max-w-md">
            Seamlessly coordinate branch rotations, monitor shift attendance, and optimize workforce performance across all banking divisions.
          </p>

          <div className="space-y-4 max-w-md">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs transition-transform hover:translate-x-1 duration-200">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <FaShieldAlt className="text-base" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Bank-Grade Security</h4>
                <p className="text-xs text-slate-300/80 mt-0.5">Role-based access control with encrypted session authentication.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs transition-transform hover:translate-x-1 duration-200">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <FaCalendarCheck className="text-base" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Real-time Scheduling</h4>
                <p className="text-xs text-slate-300/80 mt-0.5">Automated shift rotations, task allocations, and conflict resolution.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs transition-transform hover:translate-x-1 duration-200">
              <div className="w-9 h-9 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                <FaUsersCog className="text-base" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Team & Duty Oversight</h4>
                <p className="text-xs text-slate-300/80 mt-0.5">Live visibility over manager, teller, and branch operational coverage.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Motto / Guarantee */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <p className="italic">"Committed to excellence and financial integrity."</p>
          <span className="text-amber-400/80 font-mono">v2.4.0-Enterprise</span>
        </div>
      </div>

      {/* ================= RIGHT PANEL (60% desktop) ================= */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 overflow-y-auto">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between pb-6 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center shadow-md">
              <FaUniversity className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#3d1209]">Bunna Bank</h1>
              <p className="text-xs text-slate-500 font-medium">Staff Schedule Portal</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <FaShieldAlt className="text-amber-600 text-[10px]" /> Secure
          </span>
        </div>

        {/* Centered Form Wrapper */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          {/* Header text */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3d1209]/5 border border-[#3d1209]/10 text-[#3d1209] text-xs font-semibold mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              Staff Authentication Portal
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-500 text-sm mt-1.5">
              Enter your corporate email and password to access your dashboard.
            </p>
          </div>

          {/* Error Banner */}
          {errors.general && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-fade-in">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
                <span className="text-xs font-bold">!</span>
              </div>
              <div className="flex-1 text-sm text-red-700 leading-snug">
                {errors.general}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Work Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d1209] transition-colors pointer-events-none">
                  <FaEnvelope className="text-sm" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@bunnabank.com"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none ${
                    errors.email
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-slate-300 hover:border-slate-400 focus:border-[#3d1209] focus:ring-4 focus:ring-[#3d1209]/10'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1 animate-fade-in">
                  <span>•</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#3d1209] hover:text-[#d97706] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d1209] transition-colors pointer-events-none">
                  <FaLock className="text-sm" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-11 py-3 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none ${
                    errors.password
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-slate-300 hover:border-slate-400 focus:border-[#3d1209] focus:ring-4 focus:ring-[#3d1209]/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                >
                  {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1 animate-fade-in">
                  <span>•</span> {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#3d1209] focus:ring-[#3d1209] accent-[#3d1209] cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-600">Remember this workstation</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-[#3d1209] via-[#4d170c] to-[#3d1209] text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-[#3d1209]/20 hover:shadow-xl hover:shadow-[#3d1209]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <FaArrowRight className="text-sm transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-[#f8fafc] px-3 text-slate-400 font-medium">or</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Don't have an enterprise account?{' '}
              <Link
                to="/register"
                className="font-bold text-[#3d1209] hover:text-[#d97706] transition-colors underline-offset-4 hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="pt-6 border-t border-slate-200 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 font-medium">
            <FaShieldAlt className="text-emerald-600 text-sm" />
            <span>256-bit SSL Encrypted • Authorized Staff Personnel Only</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            © {new Date().getFullYear()} Bunna Bank S.C. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
