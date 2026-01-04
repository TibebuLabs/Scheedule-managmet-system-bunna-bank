import React, { useState } from 'react';
import axios from 'axios';
import './AddTaskForm.css';

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
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
        
        // Store created task for modal
        setCreatedTask(response.data.task);
        
        // Reset form
        setFormData({
          title: '',
          description: '',
        });
        
        // Show success modal
        setShowSuccessModal(true);
        
        // Notify parent component
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
    if (onCancel) {
      onCancel();
    }
  };

  const handleContinueAdding = () => {
    setShowSuccessModal(false);
    setCreatedTask(null);
    // Keep form open for adding more tasks
  };

  return (
    <>
      <div className={`add-task-form ${darkMode ? 'dark-mode' : ''}`}>
        <div className="form-header">
          <h2>📋 Create New Task</h2>
          <p>Fill in the details to create a new task</p>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-grid">
            <div className="form-section">
              <h3>Task Details</h3>
              
              <div className="form-group">
                <label>
                  <span className="label-icon">📝</span>
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title (min 3 characters)"
                  className={errors.title ? 'error' : ''}
                  disabled={loading}
                />
                {errors.title && <span className="error-message">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">📄</span>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter task description (optional)"
                  rows="4"
                  disabled={loading}
                />
                <p className="hint-text">Max 1000 characters</p>
              </div>
            </div>

            <div className="form-section">
              <div className="info-box">
                <h3>📋 Task Information</h3>
                <ul className="info-list">
                  <li>• Task ID will be auto-generated (TASKYYXXXXX)</li>
                  <li>• Creation date will be automatically recorded</li>
                  <li>• All fields are saved to the database</li>
                  <li>• You can edit tasks later from the task table</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating...
                </>
              ) : (
                <>
                  <span className="submit-icon">➕</span>
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && createdTask && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="modal-content">
              <div className="modal-header">
                <div className="success-icon">
                  <span className="icon-check">✅</span>
                </div>
                <h3>Task Created Successfully! 🎉</h3>
                <p>Your new task has been added to the system</p>
              </div>
              
              <div className="modal-body">
                <div className="task-details-card">
                  <div className="detail-row">
                    <span className="detail-label">Task ID:</span>
                    <span className="detail-value code">{createdTask.taskId}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Title:</span>
                    <span className="detail-value">{createdTask.title}</span>
                  </div>
                  {createdTask.description && (
                    <div className="detail-row">
                      <span className="detail-label">Description:</span>
                      <span className="detail-value">{createdTask.description}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">
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
                
                <div className="success-message">
                  <p className="message-text">
                    <span className="highlight">✨ Great job!</span> The task has been saved to the database 
                    and is now available in the task table.
                  </p>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="modal-btn secondary"
                  onClick={handleContinueAdding}
                >
                  <span className="btn-icon">➕</span>
                  Add Another Task
                </button>
                <button 
                  className="modal-btn primary"
                  onClick={handleCloseModal}
                >
                  <span className="btn-icon">👁️</span>
                  View All Tasks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddTaskForm;