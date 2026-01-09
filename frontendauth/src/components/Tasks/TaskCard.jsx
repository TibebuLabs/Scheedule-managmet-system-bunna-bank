import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskTable.css';

const API_BASE_URL = 'http://localhost:5000/api';

const TaskTable = ({ onAddTask = () => {}, darkMode = false, refreshTrigger }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Modal Content
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    type: 'success',
    taskData: null,
    confirmCallback: null
  });

  // Match backend status values exactly
  const backendStatuses = ['pending', 'in-progress', 'completed', 'cancelled'];
  
  // Frontend display mapping (backend value -> frontend display)
  const statusDisplayMap = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'cancelled': 'Cancelled'
  };

  // Frontend color mapping
  const statusColorMap = {
    'pending': 'warning',
    'in-progress': 'primary',
    'completed': 'success',
    'cancelled': 'danger'
  };

  // Filter options for the UI
  const filterOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Show Success Modal
  const showSuccessMessage = (title, message, taskData = null) => {
    setModalContent({
      title,
      message,
      type: 'success',
      taskData,
      confirmCallback: null
    });
    setShowSuccessModal(true);
  };

  // Show Error Modal
  const showErrorMessage = (title, message) => {
    setModalContent({
      title,
      message,
      type: 'error',
      taskData: null,
      confirmCallback: null
    });
    setShowErrorModal(true);
  };

  // Show Confirmation Modal
  const showConfirmation = (title, message, callback) => {
    setModalContent({
      title,
      message,
      type: 'warning',
      taskData: null,
      confirmCallback: callback
    });
    setShowConfirmModal(true);
  };

  // Show Delete Confirmation Modal
  const showDeleteConfirmation = (task) => {
    setModalContent({
      title: 'Delete Task',
      message: `Are you sure you want to delete task: "${task.title}"?`,
      type: 'danger',
      taskData: task,
      confirmCallback: () => handleDeleteTask(task.id, task.title)
    });
    setShowDeleteConfirmModal(true);
  };

  // Show Task Details Modal
  const showTaskDetails = (task) => {
    setModalContent({
      title: 'Task Details',
      message: '',
      type: 'info',
      taskData: task,
      confirmCallback: null
    });
    setShowDetailsModal(true);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      
      console.log('📥 Tasks API Response:', response.data);
      
      if (response.data.success) {
        // Transform backend data to match frontend structure
        const transformedTasks = response.data.tasks.map(task => ({
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status || 'pending',
          taskCode: task.taskId || `TASK${Math.floor(1000 + Math.random() * 9000)}`,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        }));
        
        console.log('✅ Transformed tasks:', transformedTasks);
        setTasks(transformedTasks);
      }
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      if (error.code === 'ERR_NETWORK') {
        console.log('⚠️ Using sample data for development');
        setTasks([
          {
            id: '1',
            title: 'Complete project documentation',
            description: 'Write detailed docs for the new API',
            status: 'pending',
            taskCode: 'TASK250001',
            createdAt: '2024-03-07T10:30:00.000Z',
            updatedAt: '2024-03-07T10:30:00.000Z'
          },
          {
            id: '2',
            title: 'Fix login bug',
            description: 'Users cannot login with Google account',
            status: 'in-progress',
            taskCode: 'TASK250002',
            createdAt: '2024-03-06T14:20:00.000Z',
            updatedAt: '2024-03-06T14:20:00.000Z'
          },
          {
            id: '3',
            title: 'Deploy to production',
            description: 'Deploy the latest version to production server',
            status: 'completed',
            taskCode: 'TASK250003',
            createdAt: '2024-03-05T09:00:00.000Z',
            updatedAt: '2024-03-05T09:00:00.000Z'
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const handleEditClick = (task) => {
    setEditingId(task.id);
    setEditFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'pending'
    });
  };

  const handleSaveClick = async (taskId) => {
    try {
      if (!editFormData.title?.trim()) {
        showErrorMessage('Missing Information', 'Please enter a task title');
        return;
      }

      const updateData = {
        title: editFormData.title.trim(),
        description: editFormData.description?.trim() || '',
        status: editFormData.status || 'pending'
      };

      console.log('📤 Updating task:', taskId, updateData);
      const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, updateData);
      
      if (response.data.success) {
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { 
                ...task,
                ...updateData,
                updatedAt: new Date().toISOString()
              } 
            : task
        ));
        
        setEditingId(null);
        setEditFormData({});
        
        const updatedTask = tasks.find(t => t.id === taskId);
        showSuccessMessage(
          'Task Updated! 🎉',
          'Your task has been successfully updated.',
          { ...updatedTask, ...updateData }
        );
      }
    } catch (error) {
      console.error('❌ Error updating task:', error);
      if (error.response?.status === 404) {
        showErrorMessage('Task Not Found', 'Task not found. It may have been deleted.');
        fetchTasks();
      } else if (error.response?.data?.message) {
        showErrorMessage('Update Failed', error.response.data.message);
      } else {
        showErrorMessage('Update Failed', 'Failed to update task. Please try again.');
      }
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getDisplayStatus = (status) => {
    if (!status) return 'Pending';
    return statusDisplayMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getStatusColor = (status) => {
    if (!status) return 'warning';
    return statusColorMap[status] || 'secondary';
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    try {
      setIsDeleting(taskId);
      const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
      
      if (response.data.success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        showSuccessMessage(
          'Task Deleted! 🗑️',
          `Task "${taskTitle}" has been successfully deleted.`
        );
      }
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      if (error.response?.status === 404) {
        showErrorMessage('Task Not Found', 'Task not found. It may have already been deleted.');
        fetchTasks();
      } else if (error.response?.data?.message) {
        showErrorMessage('Delete Failed', error.response.data.message);
      } else {
        showErrorMessage('Delete Failed', 'Failed to delete task');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate) {
        showErrorMessage('Task Not Found', 'Task not found');
        return;
      }

      const updateData = {
        title: taskToUpdate.title,
        description: taskToUpdate.description || '',
        status: newStatus
      };

      console.log('📤 Updating task status:', taskId, newStatus);
      const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, updateData);
      
      if (response.data.success) {
        setTasks(prev => prev.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: newStatus, 
                updatedAt: new Date().toISOString() 
              } 
            : task
        ));
        
        showSuccessMessage(
          'Status Updated! 🔄',
          `Task status updated to ${getDisplayStatus(newStatus)}!`
        );
      }
    } catch (error) {
      console.error('❌ Error updating task status:', error);
      if (error.response?.status === 404) {
        showErrorMessage('Task Not Found', 'Task not found. It may have been deleted.');
        fetchTasks();
      } else if (error.response?.data?.message) {
        if (error.response.data.message.includes('enum')) {
          showErrorMessage(
            'Invalid Status',
            'Invalid status value. Please use one of: pending, in-progress, completed, cancelled'
          );
        } else {
          showErrorMessage('Update Failed', error.response.data.message);
        }
      } else {
        showErrorMessage('Update Failed', 'Failed to update task status');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getPriorityEmoji = () => {
    return '📋';
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      task.taskCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || (task.status || '') === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Modal Components
  const SuccessModal = () => (
    <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
      <div className="modal-content success-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon success-icon">🎉</div>
          <h3 className="modal-title">{modalContent.title}</h3>
          <button className="modal-close" onClick={() => setShowSuccessModal(false)}>×</button>
        </div>
        <div className="modal-body">
          <p>{modalContent.message}</p>
          {modalContent.taskData && (
            <div className="task-preview">
              <div className="task-preview-header">
                <span className={`status-badge ${getStatusColor(modalContent.taskData.status)}`}>
                  {getDisplayStatus(modalContent.taskData.status)}
                </span>
                <code className="task-code">{modalContent.taskData.taskCode}</code>
              </div>
              <h4>{modalContent.taskData.title}</h4>
              {modalContent.taskData.description && (
                <p className="task-preview-description">{modalContent.taskData.description}</p>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button 
            className="modal-button primary" 
            onClick={() => setShowSuccessModal(false)}
          >
            Got it!
          </button>
          {modalContent.taskData && (
            <button 
              className="modal-button secondary" 
              onClick={() => {
                setShowSuccessModal(false);
                onAddTask();
              }}
            >
              Create New Task
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const ErrorModal = () => (
    <div className="modal-overlay" onClick={() => setShowErrorModal(false)}>
      <div className="modal-content error-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon error-icon">❌</div>
          <h3 className="modal-title">{modalContent.title}</h3>
          <button className="modal-close" onClick={() => setShowErrorModal(false)}>×</button>
        </div>
        <div className="modal-body">
          <p>{modalContent.message}</p>
        </div>
        <div className="modal-footer">
          <button 
            className="modal-button primary" 
            onClick={() => setShowErrorModal(false)}
          >
            Try Again
          </button>
          <button 
            className="modal-button secondary" 
            onClick={() => {
              setShowErrorModal(false);
              fetchTasks();
            }}
          >
            Refresh Tasks
          </button>
        </div>
      </div>
    </div>
  );

  const ConfirmModal = () => (
    <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
      <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon confirm-icon">⚠️</div>
          <h3 className="modal-title">{modalContent.title}</h3>
          <button className="modal-close" onClick={() => setShowConfirmModal(false)}>×</button>
        </div>
        <div className="modal-body">
          <p>{modalContent.message}</p>
        </div>
        <div className="modal-footer">
          <button 
            className="modal-button cancel" 
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </button>
          <button 
            className="modal-button confirm" 
            onClick={() => {
              if (modalContent.confirmCallback) {
                modalContent.confirmCallback();
              }
              setShowConfirmModal(false);
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  const DeleteConfirmModal = () => (
    <div className="modal-overlay" onClick={() => setShowDeleteConfirmModal(false)}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon delete-icon">🗑️</div>
          <h3 className="modal-title">Delete Task</h3>
          <button className="modal-close" onClick={() => setShowDeleteConfirmModal(false)}>×</button>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete this task?</p>
          {modalContent.taskData && (
            <div className="task-to-delete">
              <div className="task-to-delete-header">
                <span className={`status-badge ${getStatusColor(modalContent.taskData.status)}`}>
                  {getDisplayStatus(modalContent.taskData.status)}
                </span>
                <code className="task-code">{modalContent.taskData.taskCode}</code>
              </div>
              <h4>{modalContent.taskData.title}</h4>
              {modalContent.taskData.description && (
                <p className="task-to-delete-description">{modalContent.taskData.description}</p>
              )}
              <div className="deletion-warning">
                <span className="warning-icon">⚠️</span>
                <small>This action cannot be undone.</small>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button 
            className="modal-button cancel" 
            onClick={() => setShowDeleteConfirmModal(false)}
          >
            Cancel
          </button>
          <button 
            className="modal-button delete-confirm" 
            onClick={() => {
              if (modalContent.confirmCallback) {
                modalContent.confirmCallback();
              }
              setShowDeleteConfirmModal(false);
            }}
            disabled={isDeleting === modalContent.taskData?.id}
          >
            {isDeleting === modalContent.taskData?.id ? (
              <>
                <span className="spinner-small"></span>
                Deleting...
              </>
            ) : 'Delete Task'}
          </button>
        </div>
      </div>
    </div>
  );

  const TaskDetailsModal = () => (
    <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
      <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon details-icon">📋</div>
          <h3 className="modal-title">Task Details</h3>
          <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
        </div>
        <div className="modal-body">
          {modalContent.taskData && (
            <div className="task-details">
              <div className="detail-section">
                <label>Task Code</label>
                <div className="detail-value code">{modalContent.taskData.taskCode}</div>
              </div>
              
              <div className="detail-section">
                <label>Title</label>
                <div className="detail-value title">{modalContent.taskData.title}</div>
              </div>
              
              <div className="detail-section">
                <label>Description</label>
                <div className="detail-value description">
                  {modalContent.taskData.description || 'No description provided'}
                </div>
              </div>
              
              <div className="detail-grid">
                <div className="detail-section">
                  <label>Status</label>
                  <div className="detail-value">
                    <span className={`status-badge ${getStatusColor(modalContent.taskData.status)}`}>
                      {getDisplayStatus(modalContent.taskData.status)}
                    </span>
                  </div>
                </div>
                
                <div className="detail-section">
                  <label>Created</label>
                  <div className="detail-value">
                    <span className="date-icon">📅</span>
                    {formatDate(modalContent.taskData.createdAt)}
                  </div>
                </div>
                
                <div className="detail-section">
                  <label>Last Updated</label>
                  <div className="detail-value">
                    <span className="date-icon">🔄</span>
                    {formatDate(modalContent.taskData.updatedAt)}
                  </div>
                </div>
              </div>
              
              <div className="detail-section">
                <label>Task ID</label>
                <div className="detail-value id">
                  <code>{modalContent.taskData.id}</code>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button 
            className="modal-button secondary" 
            onClick={() => {
              setShowDetailsModal(false);
              if (modalContent.taskData) {
                handleEditClick(modalContent.taskData);
              }
            }}
          >
            Edit Task
          </button>
          <button 
            className="modal-button primary" 
            onClick={() => setShowDetailsModal(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="task-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-management">
      <div className="task-header">
        <div className="header-content">
          <h2>📋 Tasks</h2>
          <p>Manage and organize your team's tasks</p>
          <div className="task-stats">
            <div className="stat">
              <span className="stat-number">{tasks.length}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length}
              </span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat">
              <span className="stat-number">
                {tasks.filter(t => t.status === 'completed').length}
              </span>
              <span className="stat-label">Completed</span>
            </div>
          </div>
        </div>
        <button className="add-task-button" onClick={onAddTask}>
          <span className="plus-icon">+</span>
          <span>Add Task</span>
        </button>
      </div>

      <div className="task-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search tasks by title, description, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              ✕
            </button>
          )}
        </div>
        <div className="filter-buttons">
          {filterOptions.map(option => (
            <button
              key={option.value}
              className={`filter-button ${filterStatus === option.value ? 'active' : ''} ${getStatusColor(option.value)}`}
              onClick={() => setFilterStatus(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="task-table-container">
        <div className="table-responsive">
          <table className="task-table">
            <thead>
              <tr>
                <th className="task-column">Task</th>
                <th className="description-column">Description</th>
                <th className="status-column">Status</th>
                <th className="actions-column">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">
                    <div className="empty-state">
                      <span className="empty-icon">📋</span>
                      <p>{searchQuery ? 'No tasks found matching your search' : 'No tasks created yet'}</p>
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="clear-search-btn">
                          Clear search
                        </button>
                      )}
                      {!searchQuery && (
                        <button onClick={onAddTask} className="add-first-task-btn">
                          + Create Your First Task
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map(task => (
                  <tr key={task.id} className="task-row">
                    <td>
                      <div className="task-info">
                        <div className="task-main">
                          <div className="task-title-row">
                            <span className="task-code">{task.taskCode}</span>
                            {editingId === task.id ? (
                              <input
                                type="text"
                                name="title"
                                value={editFormData.title || ''}
                                onChange={handleEditFormChange}
                                className="edit-input title-input"
                                placeholder="Task Title"
                                required
                                autoFocus
                              />
                            ) : (
                              <div className="task-title">
                                <span className="priority-icon">{getPriorityEmoji()}</span>
                                {task.title}
                              </div>
                            )}
                          </div>
                          <div className="task-meta">
                            <span className="task-category">General</span>
                            <span className="task-date">Created {formatDate(task.createdAt)}</span>
                            {task.updatedAt !== task.createdAt && (
                              <span className="task-updated">
                                🔄 Updated {formatDate(task.updatedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td>
                      {editingId === task.id ? (
                        <textarea
                          name="description"
                          value={editFormData.description || ''}
                          onChange={handleEditFormChange}
                          className="edit-input description-input"
                          placeholder="Task Description"
                          rows="3"
                        />
                      ) : (
                        <div className="task-description">
                          {task.description || 'No description provided'}
                        </div>
                      )}
                    </td>
                    
                    <td>
                      {editingId === task.id ? (
                        <select
                          name="status"
                          value={editFormData.status || 'pending'}
                          onChange={handleEditFormChange}
                          className="status-select"
                        >
                          {backendStatuses.map(status => (
                            <option key={status} value={status}>
                              {getDisplayStatus(status)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="status-container">
                          <span className={`status-badge ${getStatusColor(task.status)}`}>
                            {getDisplayStatus(task.status)}
                          </span>
                          <div className="quick-status-actions">
                            <button
                              className="quick-status-btn pending"
                              onClick={() => handleStatusChange(task.id, 'pending')}
                              title="Mark as Pending"
                              disabled={task.status === 'pending'}
                            >
                              ⏳
                            </button>
                            <button
                              className="quick-status-btn in-progress"
                              onClick={() => handleStatusChange(task.id, 'in-progress')}
                              title="Mark as In Progress"
                              disabled={task.status === 'in-progress'}
                            >
                              ▶
                            </button>
                            <button
                              className="quick-status-btn completed"
                              onClick={() => handleStatusChange(task.id, 'completed')}
                              title="Mark as Completed"
                              disabled={task.status === 'completed'}
                            >
                              ✓
                            </button>
                            <button
                              className="quick-status-btn cancelled"
                              onClick={() => handleStatusChange(task.id, 'cancelled')}
                              title="Mark as Cancelled"
                              disabled={task.status === 'cancelled'}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                    
                    <td>
                      <div className="action-buttons">
                        {editingId === task.id ? (
                          <>
                            <button 
                              className="action-button save" 
                              title="Save Changes"
                              onClick={() => handleSaveClick(task.id)}
                            >
                              <span>💾</span>
                            </button>
                            <button 
                              className="action-button cancel" 
                              title="Cancel"
                              onClick={handleCancelClick}
                            >
                              <span>❌</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              className="action-button edit" 
                              title="Edit Task"
                              onClick={() => handleEditClick(task)}
                            >
                              <span>✏️</span>
                            </button>
                            <button 
                              className="action-button delete" 
                              title="Delete Task"
                              onClick={() => showDeleteConfirmation(task)}
                              disabled={isDeleting === task.id}
                            >
                              <span>
                                {isDeleting === task.id ? '⏳' : '🗑️'}
                              </span>
                            </button>
                            <button 
                              className="action-button view" 
                              title="View Details"
                              onClick={() => showTaskDetails(task)}
                            >
                              <span>👁️</span>
                            </button>
                            {task.status !== 'completed' && (
                              <button 
                                className="action-button complete" 
                                title="Mark as Complete"
                                onClick={() => handleStatusChange(task.id, 'completed')}
                              >
                                <span>✅</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-footer">
        <div className="table-stats">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
        <div className="table-pagination">
          <button className="pagination-button prev" disabled>← Previous</button>
          <div className="page-numbers">
            <span className="page-number active">1</span>
          </div>
          <button className="pagination-button next" disabled>Next →</button>
        </div>
      </div>

      {/* Modals */}
      {showSuccessModal && <SuccessModal />}
      {showErrorModal && <ErrorModal />}
      {showConfirmModal && <ConfirmModal />}
      {showDeleteConfirmModal && <DeleteConfirmModal />}
      {showDetailsModal && <TaskDetailsModal />}
    </div>
  );
};

export default TaskTable;