import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskTable.css';

const API_BASE_URL = 'http://localhost:5000/api';

const TaskTable = ({ onAddTask, darkMode, refreshTrigger }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

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
          status: 'active', // Default status
          taskCode: task.taskId || `TASK${Math.floor(1000 + Math.random() * 9000)}`,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        }));
        
        console.log('✅ Transformed tasks:', transformedTasks);
        setTasks(transformedTasks);
      }
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      // For development, show some sample data if API fails
      if (error.code === 'ERR_NETWORK') {
        console.log('⚠️ Using sample data for development');
        setTasks([
          {
            id: '1',
            title: 'Complete project documentation',
            description: 'Write detailed docs for the new API',
            status: 'active',
            taskCode: 'TASK250001',
            createdAt: '2024-03-07T10:30:00.000Z'
          },
          {
            id: '2',
            title: 'Fix login bug',
            description: 'Users cannot login with Google account',
            status: 'in progress',
            taskCode: 'TASK250002',
            createdAt: '2024-03-06T14:20:00.000Z'
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
      title: task.title,
      description: task.description,
      status: task.status
    });
  };

  const handleSaveClick = async (taskId) => {
    try {
      const updateData = {
        title: editFormData.title.trim(),
        description: editFormData.description.trim()
      };

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
        alert('✅ Task updated successfully!');
      }
    } catch (error) {
      console.error('❌ Error updating task:', error);
      if (error.response?.data?.message) {
        alert(`Failed: ${error.response.data.message}`);
      } else {
        alert('Failed to update task.');
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
    if (!status) return 'active';
    return status.toLowerCase();
  };

  const getStatusColor = (status) => {
    const displayStatus = getDisplayStatus(status);
    switch (displayStatus) {
      case 'active': return 'success';
      case 'inactive': return 'danger';
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'in progress': return 'primary';
      default: return 'secondary';
    }
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (window.confirm(`Are you sure you want to delete task: "${taskTitle}"?`)) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
        
        if (response.data.success) {
          // Remove task from state
          setTasks(prev => prev.filter(task => task.id !== taskId));
          alert('✅ Task deleted successfully!');
        }
      } catch (error) {
        console.error('❌ Error deleting task:', error);
        if (error.response?.data?.message) {
          alert(`Failed: ${error.response.data.message}`);
        } else {
          alert('❌ Failed to delete task');
        }
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // For our simplified API, we'll update locally
      // If you add status field to backend, change to API call
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus } 
          : task
      ));
      
      alert(`✅ Task status updated to ${newStatus}!`);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('❌ Failed to update task status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityEmoji = (priority) => {
    // Since our API doesn't have priority, return default
    return '📋';
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.taskCode.toLowerCase().includes(searchQuery.toLowerCase());
    
    const displayStatus = getDisplayStatus(task.status);
    const matchesStatus = filterStatus === 'all' || displayStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

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
              <span className="stat-number">{tasks.filter(t => t.status === 'active' || t.status === 'in progress').length}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat">
              <span className="stat-number">{tasks.filter(t => t.status === 'completed').length}</span>
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
          {['all', 'active', 'in progress', 'pending', 'completed', 'inactive'].map(status => (
            <button
              key={status}
              className={`filter-button ${filterStatus === status ? 'active' : ''} ${getStatusColor(status)}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'All Tasks' : status.charAt(0).toUpperCase() + status.slice(1)}
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
                                value={editFormData.title}
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
                          value={editFormData.description}
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
                          value={editFormData.status}
                          onChange={handleEditFormChange}
                          className="status-select"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                          <option value="in progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      ) : (
                        <div className="status-container">
                          <span className={`status-badge ${getStatusColor(task.status)}`}>
                            {getDisplayStatus(task.status)}
                          </span>
                          <div className="quick-status-actions">
                            <button
                              className="quick-status-btn active"
                              onClick={() => handleStatusChange(task.id, 'active')}
                              title="Mark as Active"
                            >
                              ▶
                            </button>
                            <button
                              className="quick-status-btn completed"
                              onClick={() => handleStatusChange(task.id, 'completed')}
                              title="Mark as Completed"
                            >
                              ✓
                            </button>
                            <button
                              className="quick-status-btn inactive"
                              onClick={() => handleStatusChange(task.id, 'inactive')}
                              title="Mark as Inactive"
                            >
                              ⏸
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
                              onClick={() => handleDeleteTask(task.id, task.title)}
                            >
                              <span>🗑️</span>
                            </button>
                            <button 
                              className="action-button view" 
                              title="View Details"
                              onClick={() => {
                                const taskDetails = `Task Details:\n\n` +
                                  `Title: ${task.title}\n` +
                                  `Task Code: ${task.taskCode}\n` +
                                  `Description: ${task.description || 'No description'}\n` +
                                  `Status: ${task.status}\n` +
                                  `Created: ${formatDate(task.createdAt)}\n` +
                                  `Last Updated: ${formatDate(task.updatedAt)}\n` +
                                  `Task ID: ${task.id}`;
                                alert(taskDetails);
                              }}
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
    </div>
  );
};

export default TaskTable;