import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Users, Mail, Phone, Briefcase, Building,
  X, Check, Loader2, AlertCircle, AlertTriangle,
  ArrowLeft, UserPlus, CheckCircle, XCircle, Info
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const AddStaffForm = ({ onCancel, onStaffAdded, darkMode }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Staff',
    department: 'IT Infrastructure',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [touched, setTouched] = useState({});
  const [formProgress, setFormProgress] = useState(0);
  const [serverErrors, setServerErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  // Calculate form progress
  useEffect(() => {
    const requiredFields = ['firstName', 'lastName', 'email', 'role', 'department'];
    const filledFields = requiredFields.filter(field => formData[field] && formData[field].trim() !== '');
    const progress = (filledFields.length / requiredFields.length) * 100;
    setFormProgress(progress);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (serverErrors.length > 0) setServerErrors([]);
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Format Ethiopian phone numbers
    if (cleaned.startsWith('251') && cleaned.length === 12) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      return `+251${cleaned.substring(1)}`;
    } else if (cleaned.startsWith('9') && cleaned.length === 9) {
      return `+251${cleaned}`;
    } else if (cleaned.startsWith('7') && cleaned.length === 9) {
      return `+251${cleaned}`;
    }
    
    return phone;
  };

  const validateForm = () => {
    const errors = [];
    const fieldErrs = {};
    
    // First Name validation
    if (!formData.firstName?.trim()) {
      errors.push('First name is required');
      fieldErrs.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
      fieldErrs.firstName = 'First name must be at least 2 characters';
    } else if (formData.firstName.trim().length > 50) {
      errors.push('First name cannot exceed 50 characters');
      fieldErrs.firstName = 'First name cannot exceed 50 characters';
    }
    
    // Last Name validation
    if (!formData.lastName?.trim()) {
      errors.push('Last name is required');
      fieldErrs.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
      fieldErrs.lastName = 'Last name must be at least 2 characters';
    } else if (formData.lastName.trim().length > 50) {
      errors.push('Last name cannot exceed 50 characters');
      fieldErrs.lastName = 'Last name cannot exceed 50 characters';
    }
    
    // Email validation
    if (!formData.email?.trim()) {
      errors.push('Email is required');
      fieldErrs.email = 'Email is required';
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      errors.push('Please enter a valid email');
      fieldErrs.email = 'Please enter a valid email';
    }
    
    // Phone validation
    if (formData.phone?.trim()) {
      const formattedPhone = formatPhoneNumber(formData.phone);
      const phoneRegex = /^(\+251|0)(9|7)[0-9]{8}$/;
      if (!phoneRegex.test(formattedPhone)) {
        errors.push('Please enter a valid Ethiopian phone number (+251XXXXXXXXX or 0XXXXXXXXX)');
        fieldErrs.phone = 'Please enter a valid Ethiopian phone number (+251XXXXXXXXX or 0XXXXXXXXX)';
      }
    }
    
    // Role validation
    if (!formData.role?.trim()) {
      errors.push('Role is required');
      fieldErrs.role = 'Role is required';
    } else if (!['Junior IT Officer', 'IT Officer', 'Senior IT Officer', 'developer', 'Database Admin', 'Staff'].includes(formData.role)) {
      errors.push('Please select a valid role');
      fieldErrs.role = 'Please select a valid role';
    }
    
    // Department validation
    if (!formData.department?.trim()) {
      errors.push('Department is required');
      fieldErrs.department = 'Department is required';
    } else if (!['IT Infrastructure', 'core banking', 'Mobile application and development', 'digital channal', 'HR'].includes(formData.department)) {
      errors.push('Please select a valid department');
      fieldErrs.department = 'Please select a valid department';
    }
    
    setFieldErrors(fieldErrs);
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    setServerErrors([]);

    try {
      // Format phone number before sending
      const formattedPhone = formData.phone ? formatPhoneNumber(formData.phone) : '';
      
      // Prepare payload exactly as server expects
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.toLowerCase().trim(),
        role: formData.role.trim(),
        department: formData.department.trim(),
        phone: formattedPhone
      };
      
      console.log('📤 Sending payload:', payload);
      
      const response = await axios.post(`${API_BASE_URL}/staff/add`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Employee added:', response.data);
      setSuccess(response.data.message || 'Staff member added successfully!');
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        role: 'Staff',
        department: 'IT Infrastructure',
        phone: ''
      });
      setTouched({});
      setFieldErrors({});
      setFormProgress(0);
      
      if (onStaffAdded && response.data.employee) {
        onStaffAdded(response.data.employee);
      }
      
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (error) {
      console.error('❌ Error adding staff:', error);
      
      if (error.response) {
        console.log('Server response:', error.response.data);
        
        if (error.response.data?.errors && Array.isArray(error.response.data.errors)) {
          const serverErrs = error.response.data.errors;
          setServerErrors(serverErrs);
          
          // Map server errors to field errors
          const newFieldErrors = {};
          serverErrs.forEach(err => {
            if (err.path) {
              newFieldErrors[err.path] = err.msg || err.message;
            }
          });
          setFieldErrors(newFieldErrors);
          
          if (serverErrs.length > 0) {
            const firstError = serverErrs[0];
            setError(`${firstError.path || 'Error'}: ${firstError.msg || firstError.message || 'Validation error'}`);
          }
        } else if (error.response.data?.message) {
          setError(error.response.data.message);
        } else {
          setError('Failed to add staff member. Please check the server.');
        }
      } else if (error.request) {
        setError('Network error. Please check if server is running at ' + API_BASE_URL);
      } else {
        setError('An unexpected error occurred: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailBlur = async () => {
    if (!formData.email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) return;
    
    try {
      const response = await axios.post(`${API_BASE_URL}/staff/check-email`, {
        email: formData.email.toLowerCase().trim()
      });
      
      if (!response.data.available) {
        setError('Email already registered. Please use a different email.');
        setFieldErrors(prev => ({ ...prev, email: 'Email already registered' }));
      }
    } catch (error) {
      console.error('Error checking email:', error);
    }
  };

  const isFieldValid = (fieldName, value) => {
    if (fieldErrors[fieldName]) return false;
    if (!touched[fieldName]) return true;
    
    switch (fieldName) {
      case 'firstName':
        return value && value.trim().length >= 2 && value.trim().length <= 50;
      case 'lastName':
        return value && value.trim().length >= 2 && value.trim().length <= 50;
      case 'email':
        return value && /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
      case 'phone':
        if (!value) return true;
        const formattedPhone = formatPhoneNumber(value);
        return /^(\+251|0)(9|7)[0-9]{8}$/.test(formattedPhone);
      case 'role':
        return value && ['Junior IT Officer', 'IT Officer', 'Senior IT Officer', 'developer', 'Database Admin', 'Staff'].includes(value);
      case 'department':
        return value && ['IT Infrastructure', 'core banking', 'Mobile application and development', 'digital channal', 'HR'].includes(value);
      default:
        return value && value.trim() !== '';
    }
  };

  const getFieldStatus = (fieldName, value) => {
    if (fieldErrors[fieldName]) return 'invalid';
    if (!touched[fieldName]) return 'idle';
    return isFieldValid(fieldName, value) ? 'valid' : 'invalid';
  };

  const RequiredStar = () => (
    <span className="text-rose-500 ml-1" title="Required field">*</span>
  );

  const FieldStatusIndicator = ({ status }) => {
    if (status === 'valid') {
      return <CheckCircle className="w-4 h-4 text-emerald-500 animate-pulse" />;
    }
    if (status === 'invalid') {
      return <XCircle className="w-4 h-4 text-rose-500 animate-pulse" />;
    }
    return <Info className="w-4 h-4 text-amber-500 opacity-50" />;
  };

  return (
    <div className="relative">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-pink-50/20 dark:from-indigo-900/10 dark:via-purple-900/10 dark:to-pink-900/10 rounded-3xl -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-rose-500/10 via-pink-500/5 to-transparent rounded-full blur-3xl -z-10" />

      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-gray-200/60 dark:border-gray-700/60 shadow-2xl shadow-indigo-500/10 dark:shadow-gray-900/40 overflow-hidden">
        {/* Header */}
        <div className="relative p-8 border-b border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg animate-pulse-slow">
              <UserPlus className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-700 to-purple-600 dark:from-white dark:via-indigo-300 dark:to-purple-400 bg-clip-text text-transparent">
                Add New Staff Member
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Complete the form below to add a new team member. All fields marked with <span className="text-rose-500 font-bold">*</span> are required.
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Form Progress</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{Math.round(formProgress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${formProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="px-8 pt-6">
          {success && (
            <div className="mb-6 animate-fade-in">
              <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-lg">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full animate-bounce">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300 text-lg">{success}</p>
                  <p className="text-sm text-emerald-700/80 dark:text-emerald-400/80 mt-1">
                    Staff member has been successfully registered in the system
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 animate-fade-in">
              <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 border-2 border-rose-200 dark:border-rose-800 rounded-2xl shadow-lg">
                <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-rose-800 dark:text-rose-300 text-lg">{error}</p>
                  <p className="text-sm text-rose-700/80 dark:text-rose-400/80 mt-1">
                    Please correct the highlighted fields and try again
                  </p>
                  
                  {serverErrors.length > 0 && (
                    <div className="mt-3 p-3 bg-rose-50/50 dark:bg-rose-900/20 rounded-lg">
                      <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 mb-2">Validation Issues:</p>
                      <ul className="text-xs text-rose-600 dark:text-rose-400 space-y-1">
                        {serverErrors.slice(0, 3).map((err, index) => (
                          <li key={index} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{err.path ? `${err.path}: ` : ''}{err.msg || err.message}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-8">
            {/* Personal Information Section */}
            <div className="animate-slide-in-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-xl">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Staff Information</h3>
                <span className="ml-2 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-full">
                  Required
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <User className="w-4 h-4 text-gray-500" />
                    First Name
                    <RequiredStar />
                    <span className="ml-auto">
                      <FieldStatusIndicator status={getFieldStatus('firstName', formData.firstName)} />
                    </span>
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={() => handleBlur('firstName')}
                      placeholder="John"
                      required
                      disabled={loading}
                      minLength="2"
                      maxLength="50"
                      className={`w-full px-4 py-3 pl-11 bg-white dark:bg-gray-700/60 border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        getFieldStatus('firstName', formData.firstName) === 'invalid'
                          ? 'border-rose-500 focus:ring-rose-500/30'
                          : getFieldStatus('firstName', formData.firstName) === 'valid'
                          ? 'border-emerald-500 focus:ring-emerald-500/30'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500/30 group-hover:border-indigo-400'
                      }`}
                    />
                    <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                      getFieldStatus('firstName', formData.firstName) === 'invalid'
                        ? 'text-rose-500'
                        : getFieldStatus('firstName', formData.firstName) === 'valid'
                        ? 'text-emerald-500'
                        : 'text-gray-400 group-focus-within:text-indigo-500'
                    }`}>
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                  {(getFieldStatus('firstName', formData.firstName) === 'invalid' || fieldErrors.firstName) && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 animate-pulse">
                      {fieldErrors.firstName || 'First name must be 2-50 characters'}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Users className="w-4 h-4 text-gray-500" />
                    Last Name
                    <RequiredStar />
                    <span className="ml-auto">
                      <FieldStatusIndicator status={getFieldStatus('lastName', formData.lastName)} />
                    </span>
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={() => handleBlur('lastName')}
                      placeholder="Doe"
                      required
                      disabled={loading}
                      minLength="2"
                      maxLength="50"
                      className={`w-full px-4 py-3 pl-11 bg-white dark:bg-gray-700/60 border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        getFieldStatus('lastName', formData.lastName) === 'invalid'
                          ? 'border-rose-500 focus:ring-rose-500/30'
                          : getFieldStatus('lastName', formData.lastName) === 'valid'
                          ? 'border-emerald-500 focus:ring-emerald-500/30'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500/30 group-hover:border-indigo-400'
                      }`}
                    />
                    <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                      getFieldStatus('lastName', formData.lastName) === 'invalid'
                        ? 'text-rose-500'
                        : getFieldStatus('lastName', formData.lastName) === 'valid'
                        ? 'text-emerald-500'
                        : 'text-gray-400 group-focus-within:text-indigo-500'
                    }`}>
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  {(getFieldStatus('lastName', formData.lastName) === 'invalid' || fieldErrors.lastName) && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 animate-pulse">
                      {fieldErrors.lastName || 'Last name must be 2-50 characters'}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email Address
                    <RequiredStar />
                    <span className="ml-auto">
                      <FieldStatusIndicator status={getFieldStatus('email', formData.email)} />
                    </span>
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => {
                        handleBlur('email');
                        handleEmailBlur();
                      }}
                      placeholder="john.doe@company.com"
                      required
                      disabled={loading}
                      pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                      className={`w-full px-4 py-3 pl-11 bg-white dark:bg-gray-700/60 border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        getFieldStatus('email', formData.email) === 'invalid'
                          ? 'border-rose-500 focus:ring-rose-500/30'
                          : getFieldStatus('email', formData.email) === 'valid'
                          ? 'border-emerald-500 focus:ring-emerald-500/30'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500/30 group-hover:border-indigo-400'
                      }`}
                    />
                    <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                      getFieldStatus('email', formData.email) === 'invalid'
                        ? 'text-rose-500'
                        : getFieldStatus('email', formData.email) === 'valid'
                        ? 'text-emerald-500'
                        : 'text-gray-400 group-focus-within:text-indigo-500'
                    }`}>
                      <Mail className="w-5 h-5" />
                    </div>
                  </div>
                  {(getFieldStatus('email', formData.email) === 'invalid' || fieldErrors.email) && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 animate-pulse">
                      {fieldErrors.email || 'Please enter a valid email address'}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Phone className="w-4 h-4 text-gray-500" />
                    Phone Number
                    <span className="ml-auto">
                      <FieldStatusIndicator status={getFieldStatus('phone', formData.phone)} />
                    </span>
                  </label>
                  <div className="relative group">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={() => handleBlur('phone')}
                      placeholder="+251920267834 or 0920267834"
                      disabled={loading}
                      className={`w-full px-4 py-3 pl-11 bg-white dark:bg-gray-700/60 border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        getFieldStatus('phone', formData.phone) === 'invalid'
                          ? 'border-rose-500 focus:ring-rose-500/30'
                          : getFieldStatus('phone', formData.phone) === 'valid'
                          ? 'border-emerald-500 focus:ring-emerald-500/30'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500/30 group-hover:border-indigo-400'
                      }`}
                    />
                    <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                      getFieldStatus('phone', formData.phone) === 'invalid'
                        ? 'text-rose-500'
                        : getFieldStatus('phone', formData.phone) === 'valid'
                        ? 'text-emerald-500'
                        : 'text-gray-400 group-focus-within:text-indigo-500'
                    }`}>
                      <Phone className="w-5 h-5" />
                    </div>
                  </div>
                  {(getFieldStatus('phone', formData.phone) === 'invalid' || fieldErrors.phone) && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 animate-pulse">
                      {fieldErrors.phone || 'Please enter a valid Ethiopian phone number (+251920267834 or 0920267834)'}
                    </p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    Role / Position
                    <RequiredStar />
                  </label>
                  <div className="relative group">
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={loading}
                      required
                      className={`w-full px-4 py-3 pl-11 bg-white dark:bg-gray-700/60 border rounded-xl text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        fieldErrors.role
                          ? 'border-rose-500 focus:ring-rose-500/30'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500/30 group-hover:border-indigo-400'
                      }`}
                    >
                      <option value="Junior IT Officer" className="bg-white dark:bg-gray-800">Junior IT Officer</option>
                      <option value="IT Officer" className="bg-white dark:bg-gray-800">IT Officer</option>
                      <option value="Senior IT Officer" className="bg-white dark:bg-gray-800">Senior IT Officer</option>
                      <option value="developer" className="bg-white dark:bg-gray-800">Developer</option>
                      <option value="Database Admin" className="bg-white dark:bg-gray-800">Database Admin</option>
                      <option value="Staff" className="bg-white dark:bg-gray-800">Staff</option>
                    </select>
                    <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      fieldErrors.role ? 'text-rose-500' : 'text-gray-400 group-focus-within:text-indigo-500'
                    }`}>
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {fieldErrors.role && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 animate-pulse">
                      {fieldErrors.role}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Building className="w-4 h-4 text-gray-500" />
                    Department
                    <RequiredStar />
                  </label>
                  <div className="relative group">
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      disabled={loading}
                      required
                      className={`w-full px-4 py-3 pl-11 bg-white dark:bg-gray-700/60 border rounded-xl text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        fieldErrors.department
                          ? 'border-rose-500 focus:ring-rose-500/30'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-indigo-500/30 group-hover:border-indigo-400'
                      }`}
                    >
                      <option value="IT Infrastructure" className="bg-white dark:bg-gray-800">IT Infrastructure</option>
                      <option value="core banking" className="bg-white dark:bg-gray-800">Core Banking</option>
                      <option value="Mobile application and development" className="bg-white dark:bg-gray-800">Mobile Application & Development</option>
                      <option value="digital channal" className="bg-white dark:bg-gray-800">Digital Channel</option>
                      <option value="HR" className="bg-white dark:bg-gray-800">Human Resources (HR)</option>
                    </select>
                    <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      fieldErrors.department ? 'text-rose-500' : 'text-gray-400 group-focus-within:text-indigo-500'
                    }`}>
                      <Building className="w-5 h-5" />
                    </div>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {fieldErrors.department && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 animate-pulse">
                      {fieldErrors.department}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-gray-200/60 dark:border-gray-700/60">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-2">
                <span className="text-rose-500 font-bold">*</span>
                <span>Indicates required field</span>
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                type="button" 
                onClick={onCancel}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Cancel
              </button>
              
              <button 
                type="submit" 
                disabled={loading}
                className="group relative flex items-center justify-center gap-3 px-8 py-4 w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="animate-pulse">Processing...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Add Staff Member</span>
                    <div className="absolute inset-0 rounded-xl border-2 border-white/30 group-hover:border-white/50 transition-colors" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-in-up {
          animation: slide-in-up 0.6s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AddStaffForm;