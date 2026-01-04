import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ScheduleTable.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_BASE_URL = 'http://localhost:5000/api';

const ScheduleTable = ({ darkMode = false, refreshTrigger }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table', 'calendar', 'kanban'
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
  });
  const [expandedSchedule, setExpandedSchedule] = useState(null);

  // Fetch all schedules
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/schedules`);
      
      if (response.data.success) {
        const schedulesData = response.data.schedules || response.data.data || [];
        
        // Transform data with proper formatting
        const transformedSchedules = schedulesData.map(schedule => ({
          id: schedule._id,
          scheduleId: schedule.scheduleId,
          scheduleType: schedule.scheduleType || 'daily',
          taskId: schedule.taskId,
          taskTitle: schedule.taskTitle || 'Untitled Task',
          taskDescription: schedule.taskDescription || '',
          assignments: schedule.assignments || [],
          priority: schedule.priority || 'medium',
          estimatedHours: schedule.estimatedHours || 2,
          scheduledDate: schedule.scheduledDate,
          endDate: schedule.endDate,
          recurrence: schedule.recurrence || 'once',
          status: schedule.status || 'scheduled',
          department: schedule.department || 'General',
          requiredSkills: schedule.requiredSkills || [],
          sendEmail: schedule.sendEmail || false,
          emailSent: schedule.emailSent || false,
          notes: schedule.notes || '',
          attachments: schedule.attachments || [],
          createdAt: schedule.createdAt,
          updatedAt: schedule.updatedAt,
          staffCount: schedule.assignments?.length || 0
        }));
        
        setSchedules(transformedSchedules);
        calculateStats(transformedSchedules);
      }
    } catch (error) {
      console.error('❌ Error fetching schedules:', error);
      // Load sample data for testing
      setSchedules(getSampleSchedules());
      calculateStats(getSampleSchedules());
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (schedulesData) => {
    const stats = {
      total: schedulesData.length,
      scheduled: schedulesData.filter(s => s.status === 'scheduled').length,
      inProgress: schedulesData.filter(s => s.status === 'in progress').length,
      completed: schedulesData.filter(s => s.status === 'completed').length,
      cancelled: schedulesData.filter(s => s.status === 'cancelled').length
    };
    setStats(stats);
  };

  // Get sample data for testing
  const getSampleSchedules = () => {
    return [
      {
        id: '1',
        scheduleId: 'SCH26011653',
        scheduleType: 'weekly',
        taskId: '6956e2ee79dddcaf93efb645',
        taskTitle: 'EOD',
        taskDescription: 'End of day transaction tracking',
        assignments: [
          {
            staffId: '6956e31c79dddcaf93efb64b',
            staffName: 'Eden Edenee',
            email: 'eden@example.com',
            status: 'pending'
          },
          {
            staffId: '695014b0ae0810e9cb27318c',
            staffName: 'Ggh Tibebu',
            email: 'ggh@example.com',
            status: 'pending'
          }
        ],
        priority: 'medium',
        estimatedHours: 2,
        scheduledDate: '2026-01-03T10:00:00.000Z',
        endDate: '2026-01-15T17:00:00.000Z',
        recurrence: 'once',
        status: 'scheduled',
        department: 'Management',
        requiredSkills: [],
        sendEmail: true,
        emailSent: false,
        notes: 'Important weekly tracking',
        attachments: [],
        createdAt: '2026-01-01T21:39:26.779Z',
        updatedAt: '2026-01-01T21:39:26.789Z',
        staffCount: 2
      }
    ];
  };

  useEffect(() => {
    fetchSchedules();
  }, [refreshTrigger]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format date range
  const formatDateRange = (startDate, endDate) => {
    if (!endDate) return formatDate(startDate);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return formatDate(startDate);
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'primary';
      case 'in progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      case 'pending': return 'info';
      default: return 'secondary';
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return '🚨';
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '🐌';
      default: return '📋';
    }
  };

  // Get staff avatar color
  const getAvatarColor = (id) => {
    if (!id) return '#4A90E2';
    const colors = ['#4A90E2', '#50C878', '#FF6B6B', '#FFA500', '#9B59B6', '#1ABC9C'];
    const idString = String(id);
    return colors[idString.charCodeAt(0) % colors.length];
  };

  // Handle edit click
  const handleEditClick = (schedule) => {
    setEditingId(schedule.id);
    setEditFormData({
      taskTitle: schedule.taskTitle,
      taskDescription: schedule.taskDescription,
      priority: schedule.priority,
      estimatedHours: schedule.estimatedHours,
      status: schedule.status,
      notes: schedule.notes
    });
  };

  // Handle save edit
  const handleSaveEdit = async (scheduleId) => {
    try {
      const updateData = {
        taskTitle: editFormData.taskTitle.trim(),
        taskDescription: editFormData.taskDescription.trim(),
        priority: editFormData.priority,
        estimatedHours: editFormData.estimatedHours,
        status: editFormData.status,
        notes: editFormData.notes
      };

      const response = await axios.put(`${API_BASE_URL}/schedules/${scheduleId}`, updateData);
      
      if (response.data.success) {
        setSchedules(prev => prev.map(schedule => 
          schedule.id === scheduleId 
            ? { ...schedule, ...updateData, updatedAt: new Date().toISOString() }
            : schedule
        ));
        
        setEditingId(null);
        alert('✅ Schedule updated successfully!');
      }
    } catch (error) {
      console.error('❌ Error updating schedule:', error);
      alert(error.response?.data?.message || 'Failed to update schedule');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle delete schedule
  const handleDeleteSchedule = async (scheduleId, scheduleTitle) => {
    if (window.confirm(`Are you sure you want to delete schedule: "${scheduleTitle}"?`)) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/schedules/${scheduleId}`);
        
        if (response.data.success) {
          setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
          alert('✅ Schedule deleted successfully!');
        }
      } catch (error) {
        console.error('❌ Error deleting schedule:', error);
        alert(error.response?.data?.message || 'Failed to delete schedule');
      }
    }
  };

  // Handle status change
  const handleStatusChange = async (scheduleId, newStatus) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/schedules/${scheduleId}/status`, {
        status: newStatus
      });
      
      if (response.data.success) {
        setSchedules(prev => prev.map(schedule => 
          schedule.id === scheduleId 
            ? { ...schedule, status: newStatus, updatedAt: new Date().toISOString() }
            : schedule
        ));
        
        alert(`✅ Schedule status updated to ${newStatus}!`);
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Handle select schedule
  const handleSelectSchedule = (scheduleId) => {
    setSelectedSchedules(prev => 
      prev.includes(scheduleId) 
        ? prev.filter(id => id !== scheduleId)
        : [...prev, scheduleId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedSchedules.length === filteredSchedules.length) {
      setSelectedSchedules([]);
    } else {
      setSelectedSchedules(filteredSchedules.map(s => s.id));
    }
  };

  // Handle bulk action
  const handleBulkAction = async () => {
    if (!bulkAction || selectedSchedules.length === 0) return;

    try {
      if (bulkAction === 'delete') {
        if (!window.confirm(`Delete ${selectedSchedules.length} selected schedules?`)) return;
        
        for (const scheduleId of selectedSchedules) {
          await axios.delete(`${API_BASE_URL}/schedules/${scheduleId}`);
        }
        
        setSchedules(prev => prev.filter(s => !selectedSchedules.includes(s.id)));
        setSelectedSchedules([]);
        alert(`✅ ${selectedSchedules.length} schedules deleted!`);
      } else {
        // Update status
        for (const scheduleId of selectedSchedules) {
          await axios.patch(`${API_BASE_URL}/schedules/${scheduleId}/status`, {
            status: bulkAction
          });
        }
        
        setSchedules(prev => prev.map(schedule => 
          selectedSchedules.includes(schedule.id)
            ? { ...schedule, status: bulkAction, updatedAt: new Date().toISOString() }
            : schedule
        ));
        
        alert(`✅ ${selectedSchedules.length} schedules updated to ${bulkAction}!`);
        setSelectedSchedules([]);
      }
      
      setBulkAction('');
    } catch (error) {
      console.error('❌ Bulk action error:', error);
      alert('Failed to perform bulk action');
    }
  };

  // Generate PDF
  const generatePDF = (schedule = null) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(74, 144, 226);
    doc.text('Task Schedule Details', pageWidth / 2, 20, { align: 'center' });
    
    if (schedule) {
      // Single schedule PDF
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const startY = 40;
      let y = startY;
      
      // Schedule Info
      doc.setFontSize(14);
      doc.text(`Schedule ID: ${schedule.scheduleId}`, 20, y);
      y += 10;
      
      doc.setFontSize(12);
      doc.text(`Task: ${schedule.taskTitle}`, 20, y);
      y += 8;
      
      doc.text(`Description: ${schedule.taskDescription}`, 20, y);
      y += 8;
      
      doc.text(`Date Range: ${formatDateRange(schedule.scheduledDate, schedule.endDate)}`, 20, y);
      y += 8;
      
      doc.text(`Status: ${schedule.status}`, 20, y);
      y += 8;
      
      doc.text(`Priority: ${schedule.priority}`, 20, y);
      y += 8;
      
      doc.text(`Estimated Hours: ${schedule.estimatedHours}h`, 20, y);
      y += 8;
      
      // Staff assignments
      doc.setFontSize(14);
      doc.text('Assigned Staff:', 20, y + 5);
      y += 15;
      
      if (schedule.assignments?.length > 0) {
        schedule.assignments.forEach((staff, index) => {
          doc.text(`${index + 1}. ${staff.staffName} (${staff.email}) - ${staff.status}`, 25, y);
          y += 7;
        });
      }
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 280, { align: 'center' });
      
    } else {
      // Multiple schedules PDF
      const tableData = filteredSchedules.map(schedule => [
        schedule.scheduleId,
        schedule.taskTitle,
        schedule.priority,
        schedule.status,
        formatDate(schedule.scheduledDate),
        schedule.staffCount
      ]);
      
      doc.autoTable({
        head: [['Schedule ID', 'Task', 'Priority', 'Status', 'Date', 'Staff']],
        body: tableData,
        startY: 30,
        theme: 'grid',
        headStyles: { fillColor: [74, 144, 226] }
      });
    }
    
    // Save PDF
    const fileName = schedule ? `Schedule-${schedule.scheduleId}.pdf` : 'Schedules-Overview.pdf';
    doc.save(fileName);
  };

  // Toggle schedule expansion
  const toggleExpandSchedule = (scheduleId) => {
    setExpandedSchedule(expandedSchedule === scheduleId ? null : scheduleId);
  };

  // Filter schedules
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = 
      schedule.taskTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.taskDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.scheduleId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.assignments?.some(staff => 
        staff.staffName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesStatus = filterStatus === 'all' || schedule.status === filterStatus;
    const matchesType = filterType === 'all' || schedule.scheduleType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Loading state
  if (loading) {
    return (
      <div className={`schedule-management ${darkMode ? 'dark-mode' : ''}`}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`schedule-management ${darkMode ? 'dark-mode' : ''}`}>
      {/* Header */}
      <div className="schedule-header">
        <div className="header-content">
          <h2>📅 Task Schedules</h2>
          <p>Manage and monitor all scheduled tasks</p>
          
          {/* Stats Cards */}
          <div className="schedule-stats">
            <div className="stat-card total">
              <span className="stat-icon">📊</span>
              <div className="stat-info">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>
            
            <div className="stat-card scheduled">
              <span className="stat-icon">📅</span>
              <div className="stat-info">
                <span className="stat-number">{stats.scheduled}</span>
                <span className="stat-label">Scheduled</span>
              </div>
            </div>
            
            <div className="stat-card in-progress">
              <span className="stat-icon">⚡</span>
              <div className="stat-info">
                <span className="stat-number">{stats.inProgress}</span>
                <span className="stat-label">In Progress</span>
              </div>
            </div>
            
            <div className="stat-card completed">
              <span className="stat-icon">✅</span>
              <div className="stat-info">
                <span className="stat-number">{stats.completed}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="view-toggle" onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}>
            {viewMode === 'table' ? '📆 Calendar View' : '📋 Table View'}
          </button>
          
          <div className="print-actions">
            <button className="print-button" onClick={() => generatePDF()}>
              <span className="print-icon">🖨️</span>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="schedule-filters">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search schedules by task, ID, or staff..."
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
        
        <div className="filter-controls">
          <select 
            className="filter-select" 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select 
            className="filter-select" 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
          
          {selectedSchedules.length > 0 && (
            <div className="bulk-actions">
              <select 
                className="bulk-select" 
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
              >
                <option value="">Bulk Actions</option>
                <option value="completed">Mark as Completed</option>
                <option value="in progress">Mark as In Progress</option>
                <option value="cancelled">Mark as Cancelled</option>
                <option value="delete">Delete Selected</option>
              </select>
              
              <button 
                className="apply-bulk" 
                onClick={handleBulkAction}
                disabled={!bulkAction}
              >
                Apply
              </button>
              
              <span className="selected-count">
                {selectedSchedules.length} selected
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'table' ? (
        <div className="schedule-table-container">
          <div className="table-responsive">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th className="select-column">
                    <input
                      type="checkbox"
                      checked={selectedSchedules.length === filteredSchedules.length && filteredSchedules.length > 0}
                      onChange={handleSelectAll}
                      className="select-all-checkbox"
                    />
                  </th>
                  <th>Schedule Details</th>
                  <th>Timeline</th>
                  <th>Staff</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              
              <tbody>
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      <div className="empty-state">
                        <span className="empty-icon">📅</span>
                        <p>{searchQuery ? 'No schedules found matching your search' : 'No schedules found'}</p>
                        <button onClick={() => {setSearchQuery(''); setFilterStatus('all');}} className="clear-filters-btn">
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map(schedule => (
                    <React.Fragment key={schedule.id}>
                      <tr className={`schedule-row ${editingId === schedule.id ? 'editing' : ''}`}>
                        <td className="select-column">
                          <input
                            type="checkbox"
                            checked={selectedSchedules.includes(schedule.id)}
                            onChange={() => handleSelectSchedule(schedule.id)}
                            className="schedule-checkbox"
                          />
                        </td>
                        
                        <td className="schedule-details">
                          <div className="schedule-info">
                            <div className="schedule-main">
                              <div className="schedule-id">{schedule.scheduleId}</div>
                              {editingId === schedule.id ? (
                                <input
                                  type="text"
                                  name="taskTitle"
                                  value={editFormData.taskTitle}
                                  onChange={handleFormChange}
                                  className="edit-input title-input"
                                  placeholder="Task Title"
                                  required
                                  autoFocus
                                />
                              ) : (
                                <h3 className="schedule-title" onClick={() => toggleExpandSchedule(schedule.id)}>
                                  {schedule.taskTitle}
                                  <span className="expand-icon">
                                    {expandedSchedule === schedule.id ? '▲' : '▼'}
                                  </span>
                                </h3>
                              )}
                              
                              {editingId === schedule.id ? (
                                <textarea
                                  name="taskDescription"
                                  value={editFormData.taskDescription}
                                  onChange={handleFormChange}
                                  className="edit-input description-input"
                                  placeholder="Task Description"
                                  rows="2"
                                />
                              ) : (
                                <p className="schedule-desc">{schedule.taskDescription}</p>
                              )}
                            </div>
                            
                            <div className="schedule-meta">
                              <span className="schedule-type">{schedule.scheduleType}</span>
                              <span className="schedule-department">{schedule.department}</span>
                              <span className="schedule-hours">⏱️ {schedule.estimatedHours}h</span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="schedule-timeline">
                          <div className="timeline-info">
                            <div className="timeline-date">
                              <span className="date-label">Start:</span>
                              <span className="date-value">{formatDate(schedule.scheduledDate)}</span>
                            </div>
                            {schedule.endDate && (
                              <div className="timeline-date">
                                <span className="date-label">End:</span>
                                <span className="date-value">{formatDate(schedule.endDate)}</span>
                              </div>
                            )}
                            <div className="recurrence-badge">
                              🔄 {schedule.recurrence}
                            </div>
                          </div>
                        </td>
                        
                        <td className="schedule-staff">
                          <div className="staff-assignments">
                            <div className="staff-avatars">
                              {schedule.assignments?.slice(0, 3).map((staff, index) => (
                                <div
                                  key={staff.staffId}
                                  className="staff-avatar"
                                  style={{ backgroundColor: getAvatarColor(staff.staffId) }}
                                  title={`${staff.staffName} (${staff.email})`}
                                >
                                  {staff.staffName?.charAt(0) || '?'}
                                </div>
                              ))}
                              {schedule.staffCount > 3 && (
                                <div className="more-staff">+{schedule.staffCount - 3}</div>
                              )}
                            </div>
                            <span className="staff-count">{schedule.staffCount} staff</span>
                          </div>
                        </td>
                        
                        <td className="schedule-priority">
                          {editingId === schedule.id ? (
                            <select
                              name="priority"
                              value={editFormData.priority}
                              onChange={handleFormChange}
                              className="priority-select"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          ) : (
                            <span className={`priority-badge ${getPriorityColor(schedule.priority)}`}>
                              {getPriorityIcon(schedule.priority)} {schedule.priority}
                            </span>
                          )}
                        </td>
                        
                        <td className="schedule-status">
                          {editingId === schedule.id ? (
                            <select
                              name="status"
                              value={editFormData.status}
                              onChange={handleFormChange}
                              className="status-select"
                            >
                              <option value="scheduled">Scheduled</option>
                              <option value="in progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <span className={`status-badge ${getStatusColor(schedule.status)}`}>
                              {schedule.status}
                            </span>
                          )}
                        </td>
                        
                        <td className="schedule-actions">
                          <div className="action-buttons">
                            {editingId === schedule.id ? (
                              <>
                                <button 
                                  className="action-button save" 
                                  title="Save Changes"
                                  onClick={() => handleSaveEdit(schedule.id)}
                                >
                                  <span>💾</span>
                                </button>
                                <button 
                                  className="action-button cancel" 
                                  title="Cancel"
                                  onClick={handleCancelEdit}
                                >
                                  <span>❌</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  className="action-button edit" 
                                  title="Edit"
                                  onClick={() => handleEditClick(schedule)}
                                >
                                  <span>✏️</span>
                                </button>
                                <button 
                                  className="action-button print" 
                                  title="Print PDF"
                                  onClick={() => generatePDF(schedule)}
                                >
                                  <span>🖨️</span>
                                </button>
                                <button 
                                  className="action-button delete" 
                                  title="Delete"
                                  onClick={() => handleDeleteSchedule(schedule.id, schedule.taskTitle)}
                                >
                                  <span>🗑️</span>
                                </button>
                                <button 
                                  className="action-button view" 
                                  title="View Details"
                                  onClick={() => toggleExpandSchedule(schedule.id)}
                                >
                                  <span>👁️</span>
                                </button>
                              </>
                            )}
                          </div>
                          
                          <div className="quick-actions">
                            <button
                              className="quick-action-btn complete"
                              onClick={() => handleStatusChange(schedule.id, 'completed')}
                              title="Mark as Complete"
                            >
                              ✅
                            </button>
                            <button
                              className="quick-action-btn progress"
                              onClick={() => handleStatusChange(schedule.id, 'in progress')}
                              title="Mark as In Progress"
                            >
                              ⚡
                            </button>
                            <button
                              className="quick-action-btn cancel"
                              onClick={() => handleStatusChange(schedule.id, 'cancelled')}
                              title="Cancel Schedule"
                            >
                              ❌
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Details Row */}
                      {expandedSchedule === schedule.id && (
                        <tr className="expanded-details">
                          <td colSpan="7">
                            <div className="details-content">
                              <div className="details-grid">
                                <div className="details-section">
                                  <h4>📝 Task Details</h4>
                                  <p><strong>Description:</strong> {schedule.taskDescription}</p>
                                  <p><strong>Notes:</strong> {schedule.notes || 'No notes'}</p>
                                  <p><strong>Created:</strong> {formatDate(schedule.createdAt)}</p>
                                  <p><strong>Last Updated:</strong> {formatDate(schedule.updatedAt)}</p>
                                </div>
                                
                                <div className="details-section">
                                  <h4>👥 Staff Assignments</h4>
                                  <div className="staff-list">
                                    {schedule.assignments?.map((staff, index) => (
                                      <div key={staff.staffId} className="staff-item">
                                        <div 
                                          className="staff-avatar-large"
                                          style={{ backgroundColor: getAvatarColor(staff.staffId) }}
                                        >
                                          {staff.staffName?.charAt(0) || '?'}
                                        </div>
                                        <div className="staff-info">
                                          <div className="staff-name">{staff.staffName}</div>
                                          <div className="staff-email">{staff.email}</div>
                                          <span className={`staff-status ${staff.status}`}>
                                            {staff.status}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="details-section">
                                  <h4>⚙️ Schedule Settings</h4>
                                  <p><strong>Type:</strong> {schedule.scheduleType}</p>
                                  <p><strong>Recurrence:</strong> {schedule.recurrence}</p>
                                  <p><strong>Email Notification:</strong> {schedule.sendEmail ? 'Enabled ✅' : 'Disabled ❌'}</p>
                                  <p><strong>Email Sent:</strong> {schedule.emailSent ? 'Yes ✅' : 'No ❌'}</p>
                                  {schedule.requiredSkills?.length > 0 && (
                                    <p><strong>Required Skills:</strong> {schedule.requiredSkills.join(', ')}</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="details-footer">
                                <button className="btn-secondary" onClick={() => generatePDF(schedule)}>
                                  🖨️ Export PDF
                                </button>
                                <button className="btn-secondary" onClick={() => handleEditClick(schedule)}>
                                  ✏️ Edit Schedule
                                </button>
                                <button className="btn-secondary" onClick={() => window.alert(
                                  `Send email to assigned staff?\n\n` +
                                  schedule.assignments?.map(staff => `• ${staff.staffName} (${staff.email})`).join('\n')
                                )}>
                                  📧 Send Reminder
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Calendar View
        <div className="calendar-view">
          <div className="calendar-header">
            <h3>📅 Schedule Calendar</h3>
            <div className="calendar-navigation">
              <button className="nav-btn">← Previous</button>
              <span className="current-month">January 2026</span>
              <button className="nav-btn">Next →</button>
            </div>
          </div>
          <div className="calendar-grid">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
              const daySchedules = filteredSchedules.filter(schedule => {
                const scheduleDate = new Date(schedule.scheduledDate);
                return scheduleDate.getDate() === day;
              });
              
              return (
                <div key={day} className="calendar-day">
                  <div className="day-number">{day}</div>
                  {daySchedules.map(schedule => (
                    <div 
                      key={schedule.id}
                      className={`calendar-schedule ${getPriorityColor(schedule.priority)}`}
                      onClick={() => toggleExpandSchedule(schedule.id)}
                    >
                      <div className="calendar-schedule-title">{schedule.taskTitle}</div>
                      <div className="calendar-schedule-staff">
                        {schedule.assignments?.slice(0, 2).map(staff => (
                          <div 
                            key={staff.staffId}
                            className="tiny-avatar"
                            style={{ backgroundColor: getAvatarColor(staff.staffId) }}
                            title={staff.staffName}
                          >
                            {staff.staffName?.charAt(0)}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="table-footer">
        <div className="table-stats">
          Showing {filteredSchedules.length} of {schedules.length} schedules
        </div>
        
        <div className="table-pagination">
          <button className="pagination-button prev">← Previous</button>
          <div className="page-numbers">
            <span className="page-number active">1</span>
            <span className="page-number">2</span>
            <span className="page-number">3</span>
          </div>
          <button className="pagination-button next">Next →</button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTable;