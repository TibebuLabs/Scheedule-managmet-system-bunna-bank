import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaUniversity,
  FaCheckCircle,
  FaShieldAlt,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import validator from 'validator';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pwd = formData.password || '';
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200', text: 'text-slate-400' };

    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-600', width: 'w-1/4' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600', width: 'w-2/4' };
      case 3:
        return { score: 3, label: 'Strong', color: 'bg-blue-600', text: 'text-blue-600', width: 'w-3/4' };
      case 4:
        return { score: 4, label: 'Very Strong', color: 'bg-emerald-600', text: 'text-emerald-600', width: 'w-full' };
      default:
        return { score: 0, label: '', color: 'bg-slate-200', text: 'text-slate-400', width: 'w-0' };
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;
    if (name === 'phone') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : processedValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (backendError) setBackendError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    if (!formData.email.trim() || !validator.isEmail(formData.email)) {
      newErrors.email = 'Enter a valid corporate email address';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      newErrors.phone = 'Enter a valid phone number (min 9 digits)';
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must acknowledge the bank policies and terms';
    }
    return newErrors;
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
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: cleanPhone,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      setShowSuccessModal(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      if (error.message?.includes('already exists')) {
        setErrors(prev => ({ ...prev, email: 'Email is already registered. Please sign in.' }));
      } else if (error.errors) {
        setErrors(prev => ({ ...prev, ...error.errors }));
      } else {
        setBackendError(error.message || 'Registration failed. Please contact your system administrator.');
      }
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-[#f8fafc] text-slate-800">
      {/* ================= SUCCESS MODAL ================= */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-100">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/30">
              <FaCheckCircle className="text-white text-3xl" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Registration Complete!</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Your Bunna Bank staff account has been provisioned. Redirecting to sign in...
            </p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-emerald-500 rounded-full animate-[shimmer_2s_infinite]" style={{ width: '100%' }} />
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#3d1209] hover:bg-[#52180c] text-white font-semibold py-3.5 rounded-xl transition-all shadow-md"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      )}

      {/* ================= LEFT PANEL (40% desktop) ================= */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 relative overflow-hidden bg-gradient-to-br from-[#3d1209] via-[#2a0b06] to-[#160503] text-white flex-col justify-between p-12 select-none">
        {/* Subtle geometric pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f59e0b 2%, transparent 0%)`,
            backgroundSize: '100px 100px'
          }}
        />

        {/* Ambient glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#f59e0b]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#3d1209]/40 rounded-full blur-3xl pointer-events-none" />

        {/* Header Branding */}
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

        {/* Center Pitch */}
        <div className="relative z-10 py-6 my-auto max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            New Staff Onboarding
          </div>

          <h2 className="text-3xl xl:text-4xl font-bold text-white tracking-tight leading-tight mb-4">
            Join the Bunna Bank Operational Team
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            Register your official bank staff credentials to access your daily schedules, manage assigned duties, and track branch workflows.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs shrink-0">
                <FaCheck />
              </div>
              <span>Automated schedule generation and shift swapping</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs shrink-0">
                <FaCheck />
              </div>
              <span>Real-time duty notifications and reminders</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-200">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs shrink-0">
                <FaCheck />
              </div>
              <span>Integrated department performance analytics</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <p>Protected by Bunna Bank IT Security Policy</p>
          <span className="text-amber-400/80 font-mono">ISO 27001</span>
        </div>
      </div>

      {/* ================= RIGHT PANEL (60% desktop) ================= */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 overflow-y-auto">
        {/* Mobile Header */}
        <div className="flex lg:hidden items-center justify-between pb-5 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center shadow-md">
              <FaUniversity className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#3d1209]">Bunna Bank</h1>
              <p className="text-xs text-slate-500 font-medium">Staff Portal Registration</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <FaShieldAlt className="text-amber-600 text-[10px]" /> SSL
          </span>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-lg mx-auto my-auto py-2">
          {/* Title */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3d1209]/5 border border-[#3d1209]/10 text-[#3d1209] text-xs font-semibold mb-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              Staff Account Enrollment
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Your Account
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Please enter your authorized corporate details to register.
            </p>
          </div>

          {/* Backend Error Banner */}
          {backendError && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-fade-in">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
                <span className="text-xs font-bold">!</span>
              </div>
              <div className="flex-1 text-sm text-red-700 leading-snug">
                {backendError}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* First & Last Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  First Name
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d1209] transition-colors pointer-events-none">
                    <FaUser className="text-xs" />
                  </div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Abebe"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 text-sm transition-all focus:outline-none ${
                      errors.firstName
                        ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-slate-300 hover:border-slate-400 focus:border-[#3d1209] focus:ring-4 focus:ring-[#3d1209]/10'
                    }`}
                  />
                </div>
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Last Name
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d1209] transition-colors pointer-events-none">
                    <FaUser className="text-xs" />
                  </div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Kebede"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 text-sm transition-all focus:outline-none ${
                      errors.lastName
                        ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-slate-300 hover:border-slate-400 focus:border-[#3d1209] focus:ring-4 focus:ring-[#3d1209]/10'
                    }`}
                  />
                </div>
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600 font-medium">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d1209] transition-colors pointer-events-none">
                  <FaEnvelope className="text-xs" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="abebe.kebede@bunnabank.com"
                  autoComplete="email"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 text-sm transition-all focus:outline-none ${
                    errors.email
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-slate-300 hover:border-slate-400 focus:border-[#3d1209] focus:ring-4 focus:ring-[#3d1209]/10'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Mobile Number
              </label>
              <div className="flex rounded-xl overflow-hidden shadow-xs">
                <span className="flex items-center px-3.5 bg-slate-100 border border-r-0 border-slate-300 text-xs text-slate-700 font-semibold select-none">
                  🇪🇹 +251
                </span>
                <div className="relative flex-1 group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d1209] transition-colors pointer-events-none">
                    <FaPhone className="text-xs" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="911 234 567"
                    className={`w-full pl-8 pr-4 py-2.5 border border-l-0 rounded-r-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm transition-all focus:outline-none ${
                      errors.phone
                        ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                        : 'border-slate-300 hover:border-slate-400 focus:border-[#3d1209] focus:ring-4 focus:ring-[#3d1209]/10'
                    }`}
                  />
                </div>
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d1209] transition-colors pointer-events-none">
                  <FaLock className="text-xs" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 chars, uppercase, lowercase, number, symbol"
                  className={`w-full pl-9 pr-11 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 text-sm transition-all focus:outline-none ${
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
                  {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                </button>
              </div>

              {/* Password strength meter */}
              {formData.password && (
                <div className="mt-2 space-y-1 animate-fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Security strength:</span>
                    <span className={`font-semibold ${passwordStrength.text}`}>{passwordStrength.label}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color} ${passwordStrength.width}`} />
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d1209] transition-colors pointer-events-none">
                  <FaLock className="text-xs" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`w-full pl-9 pr-11 py-2.5 rounded-xl border bg-white text-slate-900 placeholder:text-slate-400 text-sm transition-all focus:outline-none ${
                    errors.confirmPassword
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                      : 'border-slate-300 hover:border-slate-400 focus:border-[#3d1209] focus:ring-4 focus:ring-[#3d1209]/10'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-1"
                >
                  {showConfirmPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#3d1209] focus:ring-[#3d1209] accent-[#3d1209] cursor-pointer"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  I agree to Bunna Bank's{' '}
                  <span className="text-[#3d1209] font-semibold hover:underline cursor-pointer">
                    Internal Security & Usage Policies
                  </span>{' '}
                  and acknowledge confidentiality obligations.
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.agreeToTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-[#3d1209] via-[#4d170c] to-[#3d1209] text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-[#3d1209]/20 hover:shadow-xl hover:shadow-[#3d1209]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <FaArrowRight className="text-sm" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an active account?{' '}
            <Link
              to="/login"
              className="font-bold text-[#3d1209] hover:text-[#d97706] transition-colors underline-offset-4 hover:underline"
            >
              Sign In here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Bunna Bank S.C. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
