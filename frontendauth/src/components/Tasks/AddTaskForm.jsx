import React, { useState } from 'react';
import axios from 'axios';
import { 
  FileText, BookOpen, AlertCircle, CheckCircle, 
  XCircle, Loader2, ArrowLeft, Plus, Check,
  X, Info
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

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
    <span className="text-rose-500 ml-1" title="Required field">*</span>
  );

  const getFieldStatus = (fieldName, hasError) => {
    if (!touched[fieldName]) return 'idle';
    return hasError ? 'invalid' : 'valid';
  };

  const FieldStatusIndicator = ({ status }) => {
    if (status === 'valid') {
      return <CheckCircle className="w-4 h-4 text-emerald-500 animate-pulse" />;
    }
    if (status === 'invalid') {
      return <XCircle className="w-4 h-4 text-rose-500 animate-pulse" />;
    }
    return <Info className="w-4 h-4 text-amber-500 opacity-50" />;
  };

  // Component Constants
  const FIELD_WIDTH_CLASS = "w-2/3";

  return (
    <>
      <div className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/20 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-purple-900/10 rounded-3xl -z-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-3xl -z-10" />

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl border border-gray-200/60 dark:border-gray-700/60 shadow-2xl shadow-blue-500/10 dark:shadow-gray-900/40 overflow-hidden">
          {/* Header */}
          <div className="relative p-8 border-b border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-indigo-600 dark:from-white dark:via-blue-300 dark:to-indigo-400 bg-clip-text text-transparent">
                  Create New Task
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Fill in all required fields marked with <span className="text-rose-500 font-bold">*</span>
                </p>
              </div>
            </div>
            
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-75" />
              <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse delay-150" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Task Details Section */}
              <div className="animate-slide-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-xl">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Task Details</h3>
                  <span className="ml-2 px-2 py-1 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-full">
                    All Fields Required
                  </span>
                </div>

                {/* Task Title Field */}
                <div className="space-y-2 mb-6">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                      className={`w-full px-4 py-3 pl-11 bg-white dark:bg-gray-700/60 border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        errors.title
                          ? 'border-rose-500 focus:ring-rose-500/30'
                          : formData.title.length >= 3
                          ? 'border-emerald-500 focus:ring-emerald-500/30'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/30 group-hover:border-blue-400'
                      }`}
                    />
                    <div className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                      errors.title
                        ? 'text-rose-500'
                        : formData.title.length >= 3
                        ? 'text-emerald-500'
                        : 'text-gray-400 group-focus-within:text-blue-500'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  {errors.title && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 animate-pulse flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Task Description Field */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                      className={`w-full px-4 py-3 pl-11 bg-white dark:bg-gray-700/60 border rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed resize-none ${
                        errors.description
                          ? 'border-rose-500 focus:ring-rose-500/30'
                          : formData.description.length >= 10
                          ? 'border-emerald-500 focus:ring-emerald-500/30'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500/30 group-hover:border-blue-400'
                      }`}
                    />
                    <div className={`absolute left-3 top-3 transition-colors ${
                      errors.description
                        ? 'text-rose-500'
                        : formData.description.length >= 10
                        ? 'text-emerald-500'
                        : 'text-gray-400 group-focus-within:text-blue-500'
                    }`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="absolute right-3 bottom-3 text-xs text-gray-500 dark:text-gray-400">
                      {formData.description.length}/1000
                    </div>
                  </div>
                  {errors.description && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 animate-pulse flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Provide a clear and detailed description of the task requirements
                  </p>
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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Please fill all required fields before submitting
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
                  className="group relative flex items-center justify-center gap-3 px-8 py-4 w-full sm:w-auto bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="animate-pulse">Creating Task...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Create New Task</span>
                      <div className="absolute inset-0 rounded-xl border-2 border-white/30 group-hover:border-white/50 transition-colors" />
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
          <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl shadow-emerald-500/20 max-w-lg w-full overflow-hidden animate-slide-up">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-2xl" />
            
            <div className="relative p-8">
              <div className="text-center mb-6">
                <div className="inline-flex p-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full shadow-lg animate-bounce mb-4">
                  <Check className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Task Created Successfully! 🎉
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Your new task has been added to the system
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Task ID:</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                      {createdTask.taskId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Title:</span>
                    <span className="font-semibold text-gray-900 dark:text-white text-right">
                      {createdTask.title}
                    </span>
                  </div>
                  {createdTask.description && (
                    <div>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block mb-2">Description:</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                        {createdTask.description}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Created:</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
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
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 mb-6 text-center">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">✨ Great job!</span> The task has been saved to the database.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={handleContinueAdding}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Add Another
                </button>
                <button 
                  onClick={handleCloseModal}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
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
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-in-up {
          animation: slide-in-up 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      `}</style>
    </>
  );
};

export default AddTaskForm;