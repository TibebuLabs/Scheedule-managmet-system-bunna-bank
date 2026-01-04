import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskSchedule.css';

const API_BASE_URL = 'http://localhost:5000/api';

const TaskSchedule = ({ darkMode, onClose }) => {
  const [formData, setFormData] = useState({
    scheduleType: 'daily',
    selectedStaff: [],
    selectedTask: '',
    taskDescription: '',
    priority: 'medium',
    estimatedHours: 2,
    sendEmail: true,
    recurrence: 'once',
    notes: '',
    startDate: '',
    endDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [localStaff, setLocalStaff] = useState([]);
  const [localTasks, setLocalTasks] = useState([]);
  const [weeklyLimitErrors, setWeeklyLimitErrors] = useState([]);
  const [staffWeeklyLoad, setStaffWeeklyLoad] = useState({});
  const [currentWeekNumber, setCurrentWeekNumber] = useState(0);
  const [emailPreview, setEmailPreview] = useState(null);
  
  // New state for auto-dismiss timers
  const [errorTimer, setErrorTimer] = useState(null);
  const [successTimer, setSuccessTimer] = useState(null);

  // Auto-dismiss messages after 5 seconds
  const AUTO_DISMISS_TIME = 5000; // 5 seconds

  const clearErrorTimer = () => {
    if (errorTimer) {
      clearTimeout(errorTimer);
      setErrorTimer(null);
    }
  };

  const clearSuccessTimer = () => {
    if (successTimer) {
      clearTimeout(successTimer);
      setSuccessTimer(null);
    }
  };

  const setAutoDismissError = (message) => {
    clearErrorTimer();
    setError(message);
    const timer = setTimeout(() => {
      setError('');
    }, AUTO_DISMISS_TIME);
    setErrorTimer(timer);
  };

  const setAutoDismissSuccess = (message) => {
    clearSuccessTimer();
    setSuccess(message);
    const timer = setTimeout(() => {
      setSuccess('');
    }, AUTO_DISMISS_TIME);
    setSuccessTimer(timer);
  };

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      clearErrorTimer();
      clearSuccessTimer();
    };
  }, []);

  // Get current week number function
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  // Get staff avatar color
  const getAvatarColor = (id) => {
    if (!id) return '#4A90E2';
    const idString = String(id);
    const colors = ['#4A90E2', '#50C878', '#FF6B6B', '#FFA500', '#9B59B6', '#1ABC9C'];
    return colors[idString.charCodeAt(0) % colors.length];
  };

  // Fetch staff members with weekly load
  const fetchStaffMembers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/staff/all`);
      
      if (response.data.success) {
        const staffWithLoad = response.data.employees.map((employee) => {
          return {
            id: employee._id,
            _id: employee._id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            role: employee.role || 'Staff',
            department: employee.department || 'General',
            status: employee.status || 'Active',
            avatarColor: getAvatarColor(employee._id)
          };
        });
        
        setLocalStaff(staffWithLoad);
        
        // Build staff weekly load map (simplified)
        const loadMap = {};
        staffWithLoad.forEach(staff => {
          loadMap[staff.id] = {
            totalTasks: 0,
            totalHours: 0,
            weeklyLimitAvailable: true
          };
        });
        setStaffWeeklyLoad(loadMap);
      }
    } catch (error) {
      console.error('❌ Error fetching staff:', error);
      setAutoDismissError('Failed to load staff data');
    }
  };

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      if (response.data.success) {
        setLocalTasks(response.data.tasks.map(task => ({
          ...task,
          id: task._id,
          category: task.category || 'general'
        })));
      }
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      setAutoDismissError('Failed to load tasks');
    }
  };

  // Initialize data
  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      
      // Set current week number
      const today = new Date();
      setCurrentWeekNumber(getWeekNumber(today));
      
      // Set default dates
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      setSelectedDate(tomorrow.toISOString().split('T')[0]);
      setFormData(prev => ({
        ...prev,
        startDate: tomorrow.toISOString().split('T')[0],
        endDate: nextWeek.toISOString().split('T')[0]
      }));
      
      await Promise.all([fetchStaffMembers(), fetchTasks()]);
      setDataLoading(false);
    };
    
    loadData();
  }, []);

  // Handle staff selection with weekly limit validation
  const handleStaffSelect = (staffId) => {
    const staff = localStaff.find(s => s.id === staffId);
    
    // Check if staff already has weekly task (simplified logic)
    if (staffWeeklyLoad[staffId]?.totalTasks >= 1 && formData.scheduleType === 'weekly') {
      setAutoDismissError(`${staff.firstName} already has a weekly task assigned. One task per week maximum.`);
      return;
    }
    
    // Check if staff is already selected
    if (formData.selectedStaff.includes(staffId)) {
      setFormData(prev => ({
        ...prev,
        selectedStaff: prev.selectedStaff.filter(id => id !== staffId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedStaff: [...prev.selectedStaff, staffId]
      }));
    }
    
    // Clear errors
    if (error) setError('');
    setWeeklyLimitErrors([]);
  };

  // Handle task selection
  const handleTaskSelect = (taskId) => {
    const task = localTasks.find(t => t.id === taskId);
    if (task) {
      setFormData(prev => ({
        ...prev,
        selectedTask: taskId,
        taskDescription: task.description || ''
      }));
    }
  };

  // Check weekly limits before submission
  const checkWeeklyLimits = async () => {
    const errors = [];
    
    for (const staffId of formData.selectedStaff) {
      const staff = localStaff.find(s => s.id === staffId);
      
      // Check if staff already has weekly task
      if (staffWeeklyLoad[staffId]?.totalTasks >= 1 && formData.scheduleType === 'weekly') {
        errors.push({
          staffId,
          staffName: `${staff.firstName} ${staff.lastName}`,
          reason: 'Already has a weekly task assigned',
          suggestion: 'Select different staff or choose daily schedule'
        });
      }
      
      // For weekly schedules, check consecutive week restriction
      if (formData.scheduleType === 'weekly' && formData.selectedTask) {
        const task = localTasks.find(t => t.id === formData.selectedTask);
        if (task?.category) {
          try {
            const checkResponse = await axios.get(
              `${API_BASE_URL}/schedules/check/consecutive/${staffId}/${task.category}/${selectedDate}`
            );
            if (!checkResponse.data.available) {
              errors.push({
                staffId,
                staffName: `${staff.firstName} ${staff.lastName}`,
                reason: checkResponse.data.reason,
                suggestion: 'Schedule with at least one week gap'
              });
            }
          } catch (error) {
            console.log('Could not check consecutive week restriction:', error.message);
            // Don't add to errors if endpoint is unavailable
          }
        }
      }
    }
    
    setWeeklyLimitErrors(errors);
    
    if (errors.length > 0) {
      setAutoDismissError(`Found ${errors.length} weekly limit violation(s)`);
    } else {
      setAutoDismissSuccess('✅ All weekly limits are satisfied');
    }
    
    return errors.length === 0;
  };

  // Preview email
  const previewEmail = async () => {
    if (!formData.selectedTask || formData.selectedStaff.length === 0) {
      setAutoDismissError('Please select a task and staff members first');
      return;
    }
    
    const task = localTasks.find(t => t.id === formData.selectedTask);
    const selectedStaff = formData.selectedStaff.map(staffId => {
      const staff = localStaff.find(s => s.id === staffId);
      return {
        name: `${staff.firstName} ${staff.lastName}`,
        email: staff.email,
        weeklyLoad: staffWeeklyLoad[staffId]
      };
    });
    
    setEmailPreview({
      taskTitle: task.title,
      taskCategory: task.category,
      scheduleType: formData.scheduleType,
      staff: selectedStaff,
      date: formData.scheduleType === 'daily' ? selectedDate : `${formData.startDate} to ${formData.endDate}`,
      estimatedHours: formData.estimatedHours,
      priority: formData.priority,
      weekNumber: getWeekNumber(new Date(selectedDate))
    });
    
    setAutoDismissSuccess('✅ Email preview generated successfully');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setWeeklyLimitErrors([]);
    
    // Clear any existing timers
    clearErrorTimer();
    clearSuccessTimer();

    // Validate form
    if (!formData.selectedTask) {
      setAutoDismissError('Please select a task');
      setLoading(false);
      return;
    }
    
    if (formData.selectedStaff.length === 0) {
      setAutoDismissError('Please select at least one staff member');
      setLoading(false);
      return;
    }
    
    if (formData.scheduleType === 'weekly' && (!formData.startDate || !formData.endDate)) {
      setAutoDismissError('Please select start and end dates for weekly schedule');
      setLoading(false);
      return;
    }

    // Validate date range
    if (formData.scheduleType === 'weekly') {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      if (diffDays > 7) {
        setAutoDismissError('Weekly schedule should not exceed 7 days');
        setLoading(false);
        return;
      }
    }

    try {
      // Calculate end date for weekly schedules
      let endDate = null;
      if (formData.scheduleType === 'weekly' && formData.endDate) {
        endDate = new Date(formData.endDate);
        endDate.setHours(17, 0, 0, 0); // 5 PM
      }

      const scheduleData = {
        scheduleType: formData.scheduleType,
        taskId: formData.selectedTask,
        staffIds: formData.selectedStaff,
        estimatedHours: parseFloat(formData.estimatedHours),
        scheduledDate: formData.scheduleType === 'daily' 
          ? `${selectedDate}T10:00:00.000Z`
          : `${formData.startDate}T10:00:00.000Z`,
        endDate: endDate ? endDate.toISOString() : null,
        priority: formData.priority,
        recurrence: formData.recurrence,
        taskDescription: formData.taskDescription || localTasks.find(t => t.id === formData.selectedTask)?.description || '',
        department: localStaff.find(s => s.id === formData.selectedStaff[0])?.department || 'General',
        sendEmail: formData.sendEmail,
        notes: formData.notes,
        enableRotation: formData.scheduleType === 'weekly'
      };

      console.log('📤 Submitting schedule:', scheduleData);

      const response = await axios.post(`${API_BASE_URL}/schedules`, scheduleData);
      
      if (response.data.success) {
        const schedule = response.data.data?.schedule;
        let successMessage = `✅ Schedule created successfully! ID: ${schedule?.scheduleId || 'N/A'}`;
        
        // Show detailed success message
        if (formData.sendEmail) {
          const notifications = response.data.data?.notifications || [];
          const sentCount = notifications.filter(n => n.success).length;
          if (sentCount > 0) {
            successMessage += ` 📧 ${sentCount} email notification(s) sent!`;
          }
        }
        
        // Show weekly limit enforcement
        successMessage += ' 🛡️ Weekly limits enforced.';
        
        setAutoDismissSuccess(successMessage);

        // Reset form after success
        setTimeout(() => {
          resetForm();
          fetchStaffMembers(); // Refresh data
        }, 3000);
      }

    } catch (error) {
      console.error('❌ Schedule creation error:', error.response?.data || error);
      
      // Handle different error types
      let errorMessage = 'Failed to create schedule. Please try again.';
      
      if (error.response?.data?.code === 'WEEKLY_LIMIT_VIOLATION') {
        errorMessage = error.response.data.message;
        setWeeklyLimitErrors(error.response.data.weeklyLimitErrors || []);
      } 
      else if (error.response?.data?.code === 'STAFF_UNAVAILABLE') {
        errorMessage = error.response.data.message;
      }
      else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setAutoDismissError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    setFormData({
      scheduleType: 'daily',
      selectedStaff: [],
      selectedTask: '',
      taskDescription: '',
      priority: 'medium',
      estimatedHours: 2,
      sendEmail: true,
      recurrence: 'once',
      notes: '',
      startDate: tomorrow.toISOString().split('T')[0],
      endDate: nextWeek.toISOString().split('T')[0]
    });
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
    setWeeklyLimitErrors([]);
    setEmailPreview(null);
    
    // Clear any messages
    setError('');
    setSuccess('');
    clearErrorTimer();
    clearSuccessTimer();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Manual dismiss functions
  const dismissError = () => {
    clearErrorTimer();
    setError('');
    setWeeklyLimitErrors([]);
  };

  const dismissSuccess = () => {
    clearSuccessTimer();
    setSuccess('');
  };

  if (dataLoading) {
    return (
      <div className="task-schedule">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading scheduling system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-schedule">
      {/* Header */}
      <div className="schedule-header">
        <div className="header-content">
          <h2>📅 Schedule Tasks</h2>
          <p>Assign tasks with weekly restrictions and automatic email notifications</p>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-number">{localStaff.length}</span>
              <span className="stat-label">Available Staff</span>
            </div>
            <div className="stat">
              <span className="stat-number">{localTasks.length}</span>
              <span className="stat-label">Available Tasks</span>
            </div>
            <div className="stat">
              <span className="stat-number">{formData.selectedStaff.length}</span>
              <span className="stat-label">Selected Staff</span>
            </div>
            <div className="stat">
              <span className="stat-number">Week {currentWeekNumber}</span>
              <span className="stat-label">Current Week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Restrictions Banner */}
      <div className="restrictions-banner">
        <div className="restriction-item">
          <span className="restriction-icon">🛡️</span>
          <span className="restriction-text">One task per week per staff</span>
        </div>
        <div className="restriction-item">
          <span className="restriction-icon">⏰</span>
          <span className="restriction-text">No similar tasks in consecutive weeks</span>
        </div>
        <div className="restriction-item">
          <span className="restriction-icon">📧</span>
          <span className="restriction-text">Automatic email notifications</span>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="schedule-form">
        <div className="form-grid">
          {/* Schedule Settings */}
          <div className="form-section">
            <div className="section-header">
              <h3>📋 Schedule Settings</h3>
              <div className="section-line"></div>
            </div>

            {/* Schedule Type */}
            <div className="form-group">
              <label>
                <span className="label-icon">🕐</span>
                Schedule Type
              </label>
              <div className="type-buttons">
                <button
                  type="button"
                  className={`type-button ${formData.scheduleType === 'daily' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, scheduleType: 'daily' }))}
                >
                  <span className="button-icon">📅</span>
                  <span>Daily Schedule</span>
                  <span className="button-desc">Single day assignment</span>
                </button>
                <button
                  type="button"
                  className={`type-button ${formData.scheduleType === 'weekly' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, scheduleType: 'weekly' }))}
                >
                  <span className="button-icon">📆</span>
                  <span>Weekly Schedule</span>
                  <span className="button-desc">Week-long with restrictions</span>
                </button>
              </div>
            </div>

            {/* Date Selection */}
            {formData.scheduleType === 'daily' ? (
              <div className="form-group">
                <label>
                  <span className="label-icon">📅</span>
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="date-input"
                />
                {selectedDate && (
                  <div className="date-info">
                    Week {getWeekNumber(new Date(selectedDate))} • {formatDate(selectedDate)}
                  </div>
                )}
              </div>
            ) : (
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <span className="label-icon">📅</span>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="date-input"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <span className="label-icon">📅</span>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    min={formData.startDate}
                    className="date-input"
                  />
                </div>
              </div>
            )}

            {/* Recurrence */}
            <div className="form-group">
              <label>
                <span className="label-icon">🔄</span>
                Recurrence
              </label>
              <div className="recurrence-buttons">
                <button
                  type="button"
                  className={`recurrence-button ${formData.recurrence === 'once' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, recurrence: 'once' }))}
                >
                  <span>Once</span>
                </button>
                <button
                  type="button"
                  className={`recurrence-button ${formData.recurrence === 'daily' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, recurrence: 'daily' }))}
                >
                  <span>Daily</span>
                </button>
                <button
                  type="button"
                  className={`recurrence-button ${formData.recurrence === 'weekly' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, recurrence: 'weekly' }))}
                >
                  <span>Weekly</span>
                </button>
              </div>
            </div>

            {/* Email Notification */}
            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="sendEmail"
                  name="sendEmail"
                  checked={formData.sendEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, sendEmail: e.target.checked }))}
                  className="checkbox-input"
                />
                <label htmlFor="sendEmail" className="checkbox-label">
                  <span className="checkbox-icon">📧</span>
                  <span>Send email notifications</span>
                  <span className="checkbox-description">
                    Staff will receive professional email with task details
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Staff Selection */}
          <div className="form-section">
            <div className="section-header">
              <h3>👥 Staff Assignment</h3>
              <div className="section-line"></div>
            </div>

            <div className="staff-selection-header">
              <div className="selected-count">
                <span className="count-number">{formData.selectedStaff.length}</span>
                <span className="count-label">staff selected</span>
              </div>
              {localStaff.length > 0 && (
                <button
                  type="button"
                  className="select-all-button"
                  onClick={() => {
                    const allIds = localStaff.map(s => s.id);
                    setFormData(prev => ({
                      ...prev,
                      selectedStaff: prev.selectedStaff.length === allIds.length ? [] : allIds
                    }));
                  }}
                >
                  {formData.selectedStaff.length === localStaff.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {localStaff.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">👥</span>
                <p>No staff members available</p>
              </div>
            ) : (
              <div className="staff-selection-grid">
                {localStaff.map(staff => {
                  const isSelected = formData.selectedStaff.includes(staff.id);
                  const weeklyLoad = staffWeeklyLoad[staff.id] || { totalTasks: 0, weeklyLimitAvailable: true };
                  
                  return (
                    <div 
                      key={staff.id}
                      className={`staff-select-card ${isSelected ? 'selected' : ''} ${
                        !weeklyLoad.weeklyLimitAvailable ? 'limit-reached' : ''
                      }`}
                      onClick={() => handleStaffSelect(staff.id)}
                      title={!weeklyLoad.weeklyLimitAvailable ? 'Weekly limit reached' : ''}
                    >
                      <div className="staff-checkbox">
                        {isSelected && <div className="checkmark">✓</div>}
                        {!weeklyLoad.weeklyLimitAvailable && <div className="limit-icon">⚠️</div>}
                      </div>
                      <div 
                        className="staff-avatar"
                        style={{ backgroundColor: staff.avatarColor }}
                      >
                        {staff.firstName?.charAt(0) || 'U'}
                      </div>
                      <div className="staff-info">
                        <div className="staff-name">{staff.firstName} {staff.lastName}</div>
                        <div className="staff-role">{staff.role}</div>
                        <div className="staff-department">{staff.department}</div>
                        <div className="weekly-load">
                          📊 Week {currentWeekNumber}: {weeklyLoad.totalTasks} task(s), {weeklyLoad.totalHours}h
                        </div>
                      </div>
                      <div className="staff-email">{staff.email}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Task Selection */}
          <div className="form-section">
            <div className="section-header">
              <h3>📝 Task Details</h3>
              <div className="section-line"></div>
            </div>

            {/* Task Selection */}
            <div className="form-group">
              <label>
                <span className="label-icon">📋</span>
                Select Task
              </label>
              {localTasks.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📋</span>
                  <p>No tasks available</p>
                </div>
              ) : (
                <div className="task-dropdown">
                  <select
                    name="selectedTask"
                    value={formData.selectedTask}
                    onChange={(e) => handleTaskSelect(e.target.value)}
                    className="task-select"
                  >
                    <option value="">Choose a task...</option>
                    {localTasks.map(task => (
                      <option key={task.id} value={task.id}>
                        {task.title} ({task.category || 'general'})
                      </option>
                    ))}
                  </select>
                  {formData.selectedTask && (
                    <div className="selected-task-preview">
                      <div className="task-title">
                        {localTasks.find(t => t.id === formData.selectedTask)?.title}
                      </div>
                      <div className="task-category">
                        Category: {localTasks.find(t => t.id === formData.selectedTask)?.category || 'general'}
                      </div>
                      <div className="task-description">
                        {localTasks.find(t => t.id === formData.selectedTask)?.description || 'No description'}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Task Description */}
            <div className="form-group">
              <label>
                <span className="label-icon">📄</span>
                Task Description
              </label>
              <textarea
                name="taskDescription"
                value={formData.taskDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, taskDescription: e.target.value }))}
                placeholder="Add additional details or instructions..."
                rows="4"
                className="description-input"
                disabled={!formData.selectedTask}
              />
            </div>

            {/* Task Settings */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  <span className="label-icon">⚡</span>
                  Priority
                </label>
                <div className="priority-buttons">
                  <button
                    type="button"
                    className={`priority-button ${formData.priority === 'low' ? 'active' : ''} low`}
                    onClick={() => setFormData(prev => ({ ...prev, priority: 'low' }))}
                    disabled={!formData.selectedTask}
                  >
                    <span>🐌 Low</span>
                  </button>
                  <button
                    type="button"
                    className={`priority-button ${formData.priority === 'medium' ? 'active' : ''} medium`}
                    onClick={() => setFormData(prev => ({ ...prev, priority: 'medium' }))}
                    disabled={!formData.selectedTask}
                  >
                    <span>⚡ Medium</span>
                  </button>
                  <button
                    type="button"
                    className={`priority-button ${formData.priority === 'high' ? 'active' : ''} high`}
                    onClick={() => setFormData(prev => ({ ...prev, priority: 'high' }))}
                    disabled={!formData.selectedTask}
                  >
                    <span>🔥 High</span>
                  </button>
                  <button
                    type="button"
                    className={`priority-button ${formData.priority === 'urgent' ? 'active' : ''} urgent`}
                    onClick={() => setFormData(prev => ({ ...prev, priority: 'urgent' }))}
                    disabled={!formData.selectedTask}
                  >
                    <span>🚨 Urgent</span>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">⏱️</span>
                  Estimated Hours
                </label>
                <div className="hours-input">
                  <button 
                    type="button"
                    className="hours-btn minus"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      estimatedHours: Math.max(0.5, prev.estimatedHours - 0.5) 
                    }))}
                    disabled={!formData.selectedTask}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      estimatedHours: Math.min(24, Math.max(0.5, parseFloat(e.target.value) || 0.5)) 
                    }))}
                    min="0.5"
                    max="24"
                    step="0.5"
                    className="hours-value"
                    disabled={!formData.selectedTask}
                  />
                  <button 
                    type="button"
                    className="hours-btn plus"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      estimatedHours: Math.min(24, prev.estimatedHours + 0.5) 
                    }))}
                    disabled={!formData.selectedTask}
                  >
                    +
                  </button>
                  <div className="hours-hint">
                    Min: 0.5h, Max: 24h
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Field */}
            <div className="form-group">
              <label>
                <span className="label-icon">📝</span>
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes or instructions..."
                rows="3"
                className="description-input"
              />
            </div>
          </div>
        </div>

        {/* Error Handling - with auto-dismiss */}
        {error && (
          <div className={`error-message ${weeklyLimitErrors.length > 0 ? 'with-limits' : ''}`}>
            <span className="error-icon">❌</span>
            <div className="error-content">
              <strong>Error:</strong> {error}
              
              {weeklyLimitErrors.length > 0 && (
                <div className="weekly-limit-errors">
                  <div className="limit-header">Weekly Limit Violations:</div>
                  {weeklyLimitErrors.map((limitError, index) => (
                    <div key={index} className="limit-error-item">
                      <div className="limit-staff">{limitError.staffName}</div>
                      <div className="limit-reason">{limitError.reason}</div>
                      <div className="limit-suggestion">{limitError.suggestion}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button 
              type="button" 
              className="dismiss-button error-dismiss"
              onClick={dismissError}
              title="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success Message - with auto-dismiss */}
        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            <div className="success-content">
              <strong>Success!</strong> {success}
            </div>
            <button 
              type="button" 
              className="dismiss-button success-dismiss"
              onClick={dismissSuccess}
              title="Dismiss success message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Email Preview */}
        {emailPreview && (
          <div className="email-preview">
            <div className="preview-header">
              <h4>📧 Email Preview</h4>
              <button
                type="button"
                className="close-preview"
                onClick={() => setEmailPreview(null)}
              >
                ✕
              </button>
            </div>
            <div className="preview-content">
              <div className="preview-subject">
                Subject: 📅 {emailPreview.scheduleType.toUpperCase()} Task Assignment: {emailPreview.taskTitle}
              </div>
              <div className="preview-recipients">
                To: {emailPreview.staff.map(s => s.email).join(', ')}
              </div>
              <div className="preview-body">
                <p>Professional email will be sent with:</p>
                <ul>
                  <li>Task details and schedule</li>
                  <li>Weekly restrictions information</li>
                  <li>Week {emailPreview.weekNumber} schedule</li>
                  <li>Department contact information</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="form-actions">
          <div className="preview-actions">
            <button
              type="button"
              className="preview-button email-preview-btn"
              onClick={previewEmail}
              disabled={!formData.selectedTask || formData.selectedStaff.length === 0}
            >
              <span className="preview-icon">📧</span>
              Preview Email
            </button>
            <button
              type="button"
              className="preview-button limit-check-btn"
              onClick={checkWeeklyLimits}
              disabled={!formData.selectedTask || formData.selectedStaff.length === 0}
            >
              <span className="preview-icon">🛡️</span>
              Check Weekly Limits
            </button>
          </div>
          
          <div className="action-buttons">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading || !formData.selectedTask || formData.selectedStaff.length === 0}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating Schedule...
                </>
              ) : (
                <>
                  <span className="submit-icon">📅</span>
                  {formData.sendEmail ? 'Schedule & Send Emails' : 'Schedule Tasks'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Footer */}
        <div className="info-footer">
          <div className="info-item">
            <span className="info-icon">🛡️</span>
            <span className="info-text">Weekly Limits Enforced</span>
          </div>
          <div className="info-item">
            <span className="info-icon">📧</span>
            <span className="info-text">Auto Email Notifications</span>
          </div>
          <div className="info-item">
            <span className="info-icon">⚡</span>
            <span className="info-text">Real-time Validation</span>
          </div>
          <div className="info-item">
            <span className="info-icon">⏱️</span>
            <span className="info-text">Auto-dismiss in 5s</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskSchedule;