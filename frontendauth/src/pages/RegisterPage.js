import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash,
  FaArrowRight, FaUniversity, FaCheckCircle
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
    if (!formData.firstName.trim() || formData.firstName.trim().length < 2)
      newErrors.firstName = 'First name must be at least 2 characters';
    if (!formData.lastName.trim() || formData.lastName.trim().length < 2)
      newErrors.lastName = 'Last name must be at least 2 characters';
    if (!formData.email.trim() || !validator.isEmail(formData.email))
      newErrors.email = 'Enter a valid email address';
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 9)
      newErrors.phone = 'Enter a valid phone number (min 9 digits)';
    if (!formData.password || formData.password.length < 8)
      newErrors.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Must include an uppercase letter';
    else if (!/[a-z]/.test(formData.password)) newErrors.password = 'Must include a lowercase letter';
    else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Must include a number';
    else if (!/[^A-Za-z0-9]/.test(formData.password)) newErrors.password = 'Must include a special character';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';
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
        setErrors(prev => ({ ...prev, email: 'Email already registered' }));
      } else if (error.errors) {
        setErrors(prev => ({ ...prev, ...error.errors }));
      } else {
        setBackendError(error.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-[#fdf8f5]">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-[#3d1209] rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-white text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Account Created</h3>
            <p className="text-gray-500 text-sm mb-4">Redirecting to login...</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#3d1209] text-white font-semibold py-3 rounded-xl hover:bg-[#5a1b0e] transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

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
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-sm py-6">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <FaUniversity className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-[#3d1209]">Bunna Bank</h1>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h2>
          <p className="text-gray-500 text-sm mb-6">Fill in your details to register</p>

          {backendError && (
            <div className="mb-5 p-3 bg-red-50 border-l-4 border-[#3d1209] rounded-r-lg text-sm text-[#3d1209]">
              {backendError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={`w-full pl-8 pr-3 py-3 rounded-xl border-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#3d1209]/20 ${
                      errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#3d1209]'
                    }`}
                  />
                </div>
                {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={`w-full pl-8 pr-3 py-3 rounded-xl border-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#3d1209]/20 ${
                      errors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#3d1209]'
                    }`}
                  />
                </div>
                {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
              </div>
            </div>

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

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative flex">
                <span className="flex items-center px-3 bg-gray-100 border-2 border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-600 font-medium">
                  +251
                </span>
                <div className="relative flex-1">
                  <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="912345678"
                    className={`w-full pl-8 pr-4 py-3 rounded-r-xl border-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#3d1209]/20 ${
                      errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#3d1209]'
                    }`}
                  />
                </div>
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
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
                  placeholder="Min 8 chars, upper, lower, number, symbol"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`w-full pl-9 pr-10 py-3 rounded-xl border-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#3d1209]/20 ${
                    errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#3d1209]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#3d1209] transition-colors"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-0.5 accent-[#3d1209]"
                />
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <span className="text-[#3d1209] font-medium cursor-pointer hover:underline">Terms & Conditions</span>
                </span>
              </label>
              {errors.agreeToTerms && <p className="mt-1 text-xs text-red-600">{errors.agreeToTerms}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3d1209] hover:bg-[#5a1b0e] text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <FaArrowRight className="text-sm" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-[#3d1209] font-semibold hover:text-amber-700 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
