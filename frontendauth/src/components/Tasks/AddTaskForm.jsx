import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, BookOpen, AlertCircle, CheckCircle, 
  XCircle, Loader2, ArrowLeft, Plus, Check,
  X, Info, Star, Award, Clock
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AddTaskForm = ({ onCancel, staffMembers, darkMode, onTaskAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTask, setCreatedTask] = useState(null);
  const [touched, setTouched] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse movement for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Handler Functions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
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
      setLoading(true);
      
      const response = await axios.post(`${API_BASE_URL}/tasks/add`, {
        title: formData.title.trim(),
        description: formData.description.trim()
      });
      
      if (response.data.success) {
        console.log('✅ Task created:', response.data.task);
        
        setCreatedTask(response.data.task);
        setFormData({ title: '', description: '' });
        setTouched({});
        setShowSuccessModal(true);
        
        if (onTaskAdded) {
          onTaskAdded(response.data.task);
        }
      }
      
    } catch (error) {
      console.error('❌ Error creating task:', error);
      
      if (error.response) {
        if (error.response.data.errors) {
          const serverErrors = {};
          error.response.data.errors.forEach(err => {
            serverErrors[err.field] = err.message;
          });
          setErrors(serverErrors);
        } else if (error.response.data.message) {
          alert(`Error: ${error.response.data.message}`);
        } else {
          alert('Failed to create task. Please try again.');
        }
      } else {
        alert('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    setCreatedTask(null);
    if (onCancel) onCancel();
  };

  const handleContinueAdding = () => {
    setShowSuccessModal(false);
    setCreatedTask(null);
  };

  // Helper Components
  const RequiredStar = () => (
    <span className="text-[#3d1209] ml-1" title="Required field">*</span>
  );

  const getFieldStatus = (fieldName, hasError) => {
    if (!touched[fieldName]) return 'idle';
    return hasError ? 'invalid' : 'valid';
  };

  const FieldStatusIndicator = ({ status }) => {
    if (status === 'valid') {
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    }
    if (status === 'invalid') {
      return <XCircle className="w-4 h-4 text-[#3d1209]" />;
    }
    return <Info className="w-4 h-4 text-amber-500 opacity-50" />;
  };

  // Component Constants
  const FIELD_WIDTH_CLASS = "w-2/3";

  return (
    <>
      <div className="relative">
        {/* Interactive Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-[400px] h-[400px] -top-48 -left-48 bg-gradient-to-r from-[#3d1209]/5 to-amber-500/5 rounded-full blur-3xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
            }}
          />
          <div 
            className="absolute w-[300px] h-[300px] -bottom-48 -right-48 bg-gradient-to-r from-amber-500/5 to-[#3d1209]/5 rounded-full blur-3xl animate-pulse delay-1000"
            style={{
              transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`
            }}
          />
          
          {/* Floating Particles */}
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#3d1209]/10 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${20 + Math.random() * 20}s infinite linear`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden relative z-10">
          {/* Decorative Header Bar */}
          <div className="h-2 bg-gradient-to-r from-[#3d1209] via-amber-600 to-[#3d1209]"></div>

          {/* Header */}
          <div className="relative p-8 border-b border-gray-200/60 bg-gradient-to-r from-[#3d1209]/5 via-amber-500/5 to-[#3d1209]/5">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233d1209' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '30px 30px'
              }}
            />

            <div className="relative flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-[#3d1209] to-amber-600 rounded-2xl shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold">
                  <span className="bg-gradient-to-r from-[#3d1209] to-amber-600 bg-clip-text text-transparent">
                    Create New Task
                  </span>
                </h2>
                <p className="text-gray-600 mt-2">
                  Fill in all required fields marked with <span className="text-[#3d1209] font-bold">*</span>
                </p>
              </div>
            </div>
            
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-75" />
              <div className="w-2 h-2 bg-[#3d1209] rounded-full animate-pulse delay-150" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Task Details Section */}
              <div className="animate-slide-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-[#3d1209]/10 to-amber-500/10 rounded-xl">
                    <FileText className="w-5 h-5 text-[#3d1209]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Task Details</h3>
                  <span className="ml-2 px-2 py-1 bg-[#3d1209]/10 text-[#3d1209] text-xs font-semibold rounded-full">
                    All Fields Required
                  </span>
                </div>

                {/* Task Title Field */}
                <div className="space-y-2 mb-6">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <FileText className="w-4 h-4 text-gray-500" />
                    Task Title
                    <RequiredStar />
                    <span className="ml-auto">
                      <FieldStatusIndicator status={getFieldStatus('title', errors.title)} />
                    </span>
                  </label>
                  <div className={`relative group ${FIELD_WIDTH_CLASS}`}>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      onBlur={() => handleBlur('title')}
                      placeholder="Enter task title (min 3 characters)"
                      required
                      disabled={loading}
                      className={`w-full px-4 py-3 pl-11 bg-white border rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        errors.title
                          ? 'border-[#3d1209] focus:ring-[#3d1209]/30'
                          : formData.title.length >= 3
                          ? 'border-emerald-500 focus:ring-emerald-500/30'
                          : 'border-gray-300 focus:ring-[#3d1209]/30 group-hover:border-amber-400'
                      }`}
                    />
                    <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                      errors.title
                        ? 'text-[#3d1209]'
                        : formData.title.length >= 3
                        ? 'text-emerald-500'
                        : 'text-gray-400 group-focus-within:text-[#3d1209]'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  {errors.title && (
                    <p className="text-xs text-[#3d1209] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Task Description Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <BookOpen className="w-4 h-4 text-gray-500" />
                    Task Description
                    <RequiredStar />
                    <span className="ml-auto">
                      <FieldStatusIndicator status={getFieldStatus('description', errors.description)} />
                    </span>
                  </label>
                  <div className={`relative group ${FIELD_WIDTH_CLASS}`}>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      onBlur={() => handleBlur('description')}
                      placeholder="Enter detailed task description (min 10 characters)"
                      required
                      rows="5"
                      disabled={loading}
                      className={`w-full px-4 py-3 pl-11 bg-white border rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
                        errors.description
                          ? 'border-[#3d1209] focus:ring-[#3d1209]/30'
                          : formData.description.length >= 10
                          ? 'border-emerald-500 focus:ring-emerald-500/30'
                          : 'border-gray-300 focus:ring-[#3d1209]/30 group-hover:border-amber-400'
                      }`}
                    />
                    <div className={`absolute left-3 top-3 transition-colors ${
                      errors.description
                        ? 'text-[#3d1209]'
                        : formData.description.length >= 10
                        ? 'text-emerald-500'
                        : 'text-gray-400 group-focus-within:text-[#3d1209]'
                    }`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="absolute right-3 bottom-3 text-xs text-gray-500">
                      {formData.description.length}/1000
                    </div>
                  </div>
                  {errors.description && (
                    <p className="text-xs text-[#3d1209] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Provide a clear and detailed description of the task requirements
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 mt-8 border-t border-gray-200/60">
              <div className="text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <span className="text-[#3d1209] font-bold">*</span>
                  <span>Indicates required field</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Please fill all required fields before submitting
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  type="button" 
                  onClick={onCancel}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Cancel
                </button>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="group relative flex items-center justify-center gap-3 px-8 py-4 w-full sm:w-auto bg-gradient-to-r from-[#3d1209] to-amber-600 hover:from-[#4d170c] hover:to-amber-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="animate-pulse">Creating Task...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Create New Task</span>
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#3d1209]/20 via-amber-500/20 to-[#3d1209]/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && createdTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative bg-gradient-to-br from-white to-[#fdf8f5] rounded-3xl shadow-2xl shadow-[#3d1209]/20 max-w-lg w-full overflow-hidden animate-slide-up border border-[#e6d7cf]">
            {/* Decorative Header Bar */}
            <div className="h-2 bg-gradient-to-r from-[#3d1209] via-amber-600 to-[#3d1209]"></div>
            
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-2xl" />
            
            <div className="relative p-8">
              <div className="text-center mb-6">
                <div className="inline-flex p-4 bg-gradient-to-br from-[#3d1209] to-amber-600 rounded-full shadow-lg animate-bounce mb-4">
                  <Check className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#3d1209] to-amber-600 bg-clip-text text-transparent">
                  Task Created Successfully! 🎉
                </h3>
                <p className="text-gray-600 mt-2">
                  Your new task has been added to the system
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-[#3d1209]/5 to-amber-500/5 border border-[#e6d7cf] rounded-2xl p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Task ID:</span>
                    <span className="font-mono font-bold text-[#3d1209]">
                      {createdTask.taskId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Title:</span>
                    <span className="font-semibold text-gray-900 text-right">
                      {createdTask.title}
                    </span>
                  </div>
                  {createdTask.description && (
                    <div>
                      <span className="text-sm font-semibold text-gray-700 block mb-2">Description:</span>
                      <p className="text-sm text-gray-600 bg-white/50 p-3 rounded-lg border border-[#e6d7cf]">
                        {createdTask.description}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Created:</span>
                    <span className="text-sm text-gray-600">
                      {new Date(createdTask.createdAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-[#3d1209]/5 to-amber-500/5 border border-[#e6d7cf] rounded-2xl p-4 mb-6 text-center">
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-[#3d1209]">✨ Great job!</span> The task has been saved to the database.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={handleContinueAdding}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Add Another
                </button>
                <button 
                  onClick={handleCloseModal}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3d1209] to-amber-600 hover:from-[#4d170c] hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <span className="text-lg">👁️</span>
                  View All Tasks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
    </>
  );
};

export default AddTaskForm;