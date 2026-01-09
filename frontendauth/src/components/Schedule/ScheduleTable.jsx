import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Edit, 
  Trash2, 
  Printer, 
  Eye, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Download,
  X,
  CheckSquare,
  Square,
  Bell,
  BarChart3,
  Calendar as CalendarIcon,
  RefreshCw,
  MoreVertical,
  User,
  Mail,
  ExternalLink,
  Send,
  FileText,
  Zap,
  Loader2
} from 'lucide-react';
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
  const [viewMode, setViewMode] = useState('table');
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
  });
  const [expandedSchedule, setExpandedSchedule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: '', // 'success', 'error', 'confirm', 'info'
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  });

  // Modal component
  const Modal = () => {
    if (!showModal) return null;

    const getIcon = () => {
      switch (modalConfig.type) {
        case 'success': return <CheckCircle className="w-12 h-12 text-green-500" />;
        case 'error': return <AlertCircle className="w-12 h-12 text-red-500" />;
        case 'confirm': return <AlertCircle className="w-12 h-12 text-yellow-500" />;
        default: return <Bell className="w-12 h-12 text-blue-500" />;
      }
    };

    const getButtonColor = () => {
      switch (modalConfig.type) {
        case 'success': return 'bg-green-500 hover:bg-green-600';
        case 'error': return 'bg-red-500 hover:bg-red-600';
        case 'confirm': return 'bg-yellow-500 hover:bg-yellow-600';
        default: return 'bg-blue-500 hover:bg-blue-600';
      }
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={modalConfig.onCancel || (() => setShowModal(false))}></div>
          
          <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
            <div className="flex items-center justify-center mb-4">
              {getIcon()}
            </div>
            
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white text-center mb-2">
              {modalConfig.title}
            </h3>
            
            <div className="mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-300 text-center">
                {modalConfig.message}
              </p>
            </div>

            <div className="mt-6 flex justify-center space-x-3">
              {modalConfig.type === 'confirm' && modalConfig.onCancel && (
                <button
                  type="button"
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-lg hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                  onClick={modalConfig.onCancel}
                >
                  Cancel
                </button>
              )}
              
              <button
                type="button"
                className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white ${getButtonColor()} border border-transparent rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-500`}
                onClick={() => {
                  if (modalConfig.onConfirm) modalConfig.onConfirm();
                  setShowModal(false);
                }}
              >
                {modalConfig.type === 'confirm' ? 'Confirm' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show modal helper
  const showAlert = (type, title, message, onConfirm = null, onCancel = null) => {
    setModalConfig({ type, title, message, onConfirm, onCancel });
    setShowModal(true);
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/schedules`);
      
      if (response.data.success) {
        const schedulesData = response.data.schedules || response.data.data || [];
        
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
      console.error('Error fetching schedules:', error);
      setSchedules(getSampleSchedules());
      calculateStats(getSampleSchedules());
    } finally {
      setLoading(false);
    }
  };

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

  const getSampleSchedules = () => {
    return [
      {
        id: '1',
        scheduleId: 'SCH26011653',
        scheduleType: 'weekly',
        taskId: '6956e2ee79dddcaf93efb645',
        taskTitle: 'EOD Reporting',
        taskDescription: 'End of day transaction tracking and reporting',
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
        requiredSkills: ['Analytics', 'Reporting'],
        sendEmail: true,
        emailSent: false,
        notes: 'Important weekly tracking for Q1 analysis',
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

  const formatDateRange = (startDate, endDate) => {
    if (!endDate) return formatDate(startDate);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return formatDate(startDate);
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'blue';
      case 'in progress': return 'yellow';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      case 'pending': return 'purple';
      default: return 'gray';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'green';
      default: return 'gray';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return '🚨';
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '🐌';
      default: return '📋';
    }
  };

  const getAvatarColor = (id) => {
    if (!id) return '#4A90E2';
    const colors = ['#4A90E2', '#50C878', '#FF6B6B', '#FFA500', '#9B59B6', '#1ABC9C'];
    const idString = String(id);
    return colors[idString.charCodeAt(0) % colors.length];
  };

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
        showAlert('success', 'Success', 'Schedule updated successfully!');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      showAlert('error', 'Error', error.response?.data?.message || 'Failed to update schedule');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteSchedule = (scheduleId, scheduleTitle) => {
    showAlert('confirm', 'Confirm Delete', 
      `Are you sure you want to delete schedule: "${scheduleTitle}"?`,
      async () => {
        try {
          const response = await axios.delete(`${API_BASE_URL}/schedules/${scheduleId}`);
          
          if (response.data.success) {
            setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
            showAlert('success', 'Deleted', 'Schedule deleted successfully!');
          }
        } catch (error) {
          console.error('Error deleting schedule:', error);
          showAlert('error', 'Error', error.response?.data?.message || 'Failed to delete schedule');
        }
      }
    );
  };

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
        
        showAlert('success', 'Status Updated', `Schedule status updated to ${newStatus}!`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showAlert('error', 'Error', error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSelectSchedule = (scheduleId) => {
    setSelectedSchedules(prev => 
      prev.includes(scheduleId) 
        ? prev.filter(id => id !== scheduleId)
        : [...prev, scheduleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSchedules.length === filteredSchedules.length) {
      setSelectedSchedules([]);
    } else {
      setSelectedSchedules(filteredSchedules.map(s => s.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedSchedules.length === 0) return;

    if (bulkAction === 'delete') {
      showAlert('confirm', 'Confirm Delete', 
        `Delete ${selectedSchedules.length} selected schedules?`,
        async () => {
          try {
            for (const scheduleId of selectedSchedules) {
              await axios.delete(`${API_BASE_URL}/schedules/${scheduleId}`);
            }
            
            setSchedules(prev => prev.filter(s => !selectedSchedules.includes(s.id)));
            setSelectedSchedules([]);
            showAlert('success', 'Deleted', `${selectedSchedules.length} schedules deleted!`);
          } catch (error) {
            console.error('Bulk delete error:', error);
            showAlert('error', 'Error', 'Failed to delete schedules');
          }
        }
      );
    } else {
      // Update status
      try {
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
        
        showAlert('success', 'Updated', `${selectedSchedules.length} schedules updated to ${bulkAction}!`);
        setSelectedSchedules([]);
      } catch (error) {
        console.error('Bulk update error:', error);
        showAlert('error', 'Error', 'Failed to update schedules');
      }
    }
    
    setBulkAction('');
  };

  const generatePDF = (schedule = null) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    doc.setFontSize(20);
    doc.setTextColor(74, 144, 226);
    doc.text('Task Schedule Details', pageWidth / 2, 20, { align: 'center' });
    
    if (schedule) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const startY = 40;
      let y = startY;
      
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
      
      doc.setFontSize(14);
      doc.text('Assigned Staff:', 20, y + 5);
      y += 15;
      
      if (schedule.assignments?.length > 0) {
        schedule.assignments.forEach((staff, index) => {
          doc.text(`${index + 1}. ${staff.staffName} (${staff.email}) - ${staff.status}`, 25, y);
          y += 7;
        });
      }
      
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 280, { align: 'center' });
      
    } else {
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
    
    const fileName = schedule ? `Schedule-${schedule.scheduleId}.pdf` : 'Schedules-Overview.pdf';
    doc.save(fileName);
    showAlert('success', 'PDF Generated', `${fileName} has been downloaded!`);
  };

  const toggleExpandSchedule = (scheduleId) => {
    setExpandedSchedule(expandedSchedule === scheduleId ? null : scheduleId);
  };

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading schedules...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <Modal />
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Task Schedules
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Manage and monitor all scheduled tasks
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.scheduled}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                  </div>
                </div>
              </div>
              
              <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.cancelled}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cancelled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              {viewMode === 'table' ? (
                <>
                  <CalendarIcon className="w-5 h-5" />
                  Calendar View
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Table View
                </>
              )}
            </button>
            
            <button
              onClick={() => generatePDF()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Download className="w-5 h-5" />
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search schedules by task, ID, or staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none transition-all"
              >
                <option value="all">All Types</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
            
            {selectedSchedules.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                  <CheckSquare className="w-5 h-5" />
                  {selectedSchedules.length} selected
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <select 
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Bulk Actions</option>
                    <option value="completed">Mark as Completed</option>
                    <option value="in progress">Mark as In Progress</option>
                    <option value="cancelled">Mark as Cancelled</option>
                    <option value="delete">Delete Selected</option>
                  </select>
                  
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="w-12 px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedSchedules.length === filteredSchedules.length && filteredSchedules.length > 0}
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Schedule Details</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timeline</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Staff</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Search className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                            {searchQuery ? 'No schedules found' : 'No schedules available'}
                          </p>
                          <p className="text-gray-500 dark:text-gray-500">
                            {searchQuery ? 'Try adjusting your search terms' : 'Create a new schedule to get started'}
                          </p>
                          {(searchQuery || filterStatus !== 'all' || filterType !== 'all') && (
                            <button
                              onClick={() => {
                                setSearchQuery('');
                                setFilterStatus('all');
                                setFilterType('all');
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Clear filters
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map(schedule => (
                    <React.Fragment key={schedule.id}>
                      <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${editingId === schedule.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedSchedules.includes(schedule.id)}
                            onChange={() => handleSelectSchedule(schedule.id)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        
                        <td className="px-6 py-4 min-w-[300px]">
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <div className="text-xs font-mono text-gray-400 dark:text-gray-500">
                                {schedule.scheduleId}
                              </div>
                              
                              {editingId === schedule.id ? (
                                <div className="space-y-3">
                                  <input
                                    type="text"
                                    name="taskTitle"
                                    value={editFormData.taskTitle}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 text-lg font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Task Title"
                                    required
                                    autoFocus
                                  />
                                  <textarea
                                    name="taskDescription"
                                    value={editFormData.taskDescription}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Task Description"
                                    rows="2"
                                  />
                                </div>
                              ) : (
                                <>
                                  <h3 
                                    className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    onClick={() => toggleExpandSchedule(schedule.id)}
                                  >
                                    {schedule.taskTitle}
                                    {expandedSchedule === schedule.id ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </h3>
                                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {schedule.taskDescription}
                                  </p>
                                </>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <span className="px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                                {schedule.scheduleType}
                              </span>
                              <span className="px-3 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
                                {schedule.department}
                              </span>
                              <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {schedule.estimatedHours}h
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 min-w-[200px]">
                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Start</div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {formatDate(schedule.scheduledDate)}
                              </div>
                            </div>
                            {schedule.endDate && (
                              <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">End</div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {formatDate(schedule.endDate)}
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                              <RefreshCw className="w-4 h-4" />
                              {schedule.recurrence}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 min-w-[150px]">
                          <div className="space-y-3">
                            <div className="flex -space-x-2">
                              {schedule.assignments?.slice(0, 3).map((staff, index) => (
                                <div
                                  key={staff.staffId}
                                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-medium text-sm"
                                  style={{ backgroundColor: getAvatarColor(staff.staffId) }}
                                  title={`${staff.staffName} (${staff.email})`}
                                >
                                  {staff.staffName?.charAt(0) || '?'}
                                </div>
                              ))}
                              {schedule.staffCount > 3 && (
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 font-medium text-xs">
                                  +{schedule.staffCount - 3}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {schedule.staffCount} staff assigned
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 min-w-[120px]">
                          {editingId === schedule.id ? (
                            <select
                              name="priority"
                              value={editFormData.priority}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="urgent">Urgent</option>
                            </select>
                          ) : (
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
                              getPriorityColor(schedule.priority) === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                              getPriorityColor(schedule.priority) === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                              getPriorityColor(schedule.priority) === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                              'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            }`}>
                              <span className="text-lg">{getPriorityIcon(schedule.priority)}</span>
                              {schedule.priority}
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 min-w-[120px]">
                          {editingId === schedule.id ? (
                            <select
                              name="status"
                              value={editFormData.status}
                              onChange={handleFormChange}
                              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="scheduled">Scheduled</option>
                              <option value="in progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
                              getStatusColor(schedule.status) === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' :
                              getStatusColor(schedule.status) === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                              getStatusColor(schedule.status) === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                              getStatusColor(schedule.status) === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                              'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${
                                getStatusColor(schedule.status) === 'blue' ? 'bg-blue-500' :
                                getStatusColor(schedule.status) === 'yellow' ? 'bg-yellow-500' :
                                getStatusColor(schedule.status) === 'green' ? 'bg-green-500' :
                                getStatusColor(schedule.status) === 'red' ? 'bg-red-500' :
                                'bg-purple-500'
                              }`}></span>
                              {schedule.status}
                            </div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 min-w-[200px]">
                          <div className="flex flex-col gap-3">
                            <div className="flex gap-2">
                              {editingId === schedule.id ? (
                                <>
                                  <button
                                    onClick={() => handleSaveEdit(schedule.id)}
                                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    title="Save Changes"
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditClick(schedule)}
                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => generatePDF(schedule)}
                                    className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                    title="Print PDF"
                                  >
                                    <Printer className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSchedule(schedule.id, schedule.taskTitle)}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => toggleExpandSchedule(schedule.id)}
                                    className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    title="View Details"
                                  >
                                    <Eye className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                            </div>
                            
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleStatusChange(schedule.id, 'completed')}
                                className="flex-1 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors text-xs font-medium"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleStatusChange(schedule.id, 'in progress')}
                                className="flex-1 py-1.5 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors text-xs font-medium"
                              >
                                In Progress
                              </button>
                              <button
                                onClick={() => handleStatusChange(schedule.id, 'cancelled')}
                                className="flex-1 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors text-xs font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Details */}
                      {expandedSchedule === schedule.id && (
                        <tr>
                          <td colSpan="7" className="px-6 py-6 bg-gray-50 dark:bg-gray-700/20">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                  <FileText className="w-5 h-5" />
                                  Task Details
                                </h4>
                                <div className="space-y-3">
                                  <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Description</div>
                                    <div className="text-gray-700 dark:text-gray-300">{schedule.taskDescription}</div>
                                  </div>
                                  <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Notes</div>
                                    <div className="text-gray-700 dark:text-gray-300">{schedule.notes || 'No notes provided'}</div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Created</div>
                                      <div className="text-sm text-gray-700 dark:text-gray-300">{formatDate(schedule.createdAt)}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Updated</div>
                                      <div className="text-sm text-gray-700 dark:text-gray-300">{formatDate(schedule.updatedAt)}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                  <Users className="w-5 h-5" />
                                  Staff Assignments
                                </h4>
                                <div className="space-y-3">
                                  {schedule.assignments?.map((staff) => (
                                    <div key={staff.staffId} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                                      <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                                        style={{ backgroundColor: getAvatarColor(staff.staffId) }}
                                      >
                                        {staff.staffName?.charAt(0) || '?'}
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900 dark:text-white">{staff.staffName}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                          <Mail className="w-3 h-3" />
                                          {staff.email}
                                        </div>
                                      </div>
                                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                        staff.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                        staff.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                      }`}>
                                        {staff.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <h4 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                                  <Settings className="w-5 h-5" />
                                  Schedule Settings
                                </h4>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Type</div>
                                      <div className="font-medium text-gray-700 dark:text-gray-300">{schedule.scheduleType}</div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Recurrence</div>
                                      <div className="font-medium text-gray-700 dark:text-gray-300">{schedule.recurrence}</div>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Email Notifications</div>
                                      <div className={`font-medium ${schedule.sendEmail ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {schedule.sendEmail ? 'Enabled' : 'Disabled'}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Email Sent</div>
                                      <div className={`font-medium ${schedule.emailSent ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                        {schedule.emailSent ? 'Yes' : 'No'}
                                      </div>
                                    </div>
                                  </div>
                                  {schedule.requiredSkills?.length > 0 && (
                                    <div>
                                      <div className="text-sm text-gray-500 dark:text-gray-400">Required Skills</div>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {schedule.requiredSkills.map((skill, index) => (
                                          <span key={index} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                                            {skill}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap gap-3 pt-4">
                                  <button
                                    onClick={() => generatePDF(schedule)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-md transition-all"
                                  >
                                    <Download className="w-4 h-4" />
                                    Export PDF
                                  </button>
                                  <button
                                    onClick={() => handleEditClick(schedule)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => showAlert('info', 'Send Reminder', `Send email to assigned staff?`)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
                                  >
                                    <Send className="w-4 h-4" />
                                    Reminder
                                  </button>
                                </div>
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="w-6 h-6" />
                Schedule Calendar
              </h3>
              <div className="flex items-center gap-4">
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  ← Previous
                </button>
                <span className="font-medium text-gray-900 dark:text-white">January 2026</span>
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Next →
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="bg-gray-50 dark:bg-gray-800 p-4 text-center font-medium text-gray-700 dark:text-gray-300">
                  {day}
                </div>
              ))}
              
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                const daySchedules = filteredSchedules.filter(schedule => {
                  const scheduleDate = new Date(schedule.scheduledDate);
                  return scheduleDate.getDate() === day;
                });
                
                return (
                  <div key={day} className="bg-white dark:bg-gray-900 min-h-[120px] p-3">
                    <div className={`font-medium mb-2 ${day === 3 ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-700 dark:text-gray-300'}`}>
                      {day}
                    </div>
                    <div className="space-y-2">
                      {daySchedules.slice(0, 2).map(schedule => (
                        <div
                          key={schedule.id}
                          className={`p-2 rounded-lg text-xs cursor-pointer transition-all hover:scale-[1.02] ${
                            getPriorityColor(schedule.priority) === 'red' ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500' :
                            getPriorityColor(schedule.priority) === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500' :
                            getPriorityColor(schedule.priority) === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' :
                            'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                          }`}
                          onClick={() => toggleExpandSchedule(schedule.id)}
                        >
                          <div className="font-medium truncate">{schedule.taskTitle}</div>
                          <div className="flex items-center gap-1 mt-1">
                            {schedule.assignments?.slice(0, 2).map(staff => (
                              <div
                                key={staff.staffId}
                                className="w-4 h-4 rounded-full text-[8px] font-bold flex items-center justify-center text-white"
                                style={{ backgroundColor: getAvatarColor(staff.staffId) }}
                                title={staff.staffName}
                              >
                                {staff.staffName?.charAt(0)}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {daySchedules.length > 2 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{daySchedules.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-gray-600 dark:text-gray-400">
            Showing {filteredSchedules.length} of {schedules.length} schedules
          </div>
          
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              ← Previous
            </button>
            <div className="flex gap-1">
              {[1, 2, 3].map(page => (
                <button
                  key={page}
                  className={`w-10 h-10 rounded-lg font-medium ${
                    page === 1
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add missing icon component
const Settings = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default ScheduleTable;