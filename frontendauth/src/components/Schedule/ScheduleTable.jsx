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
  Loader2,
  LayoutGrid,
  List,
  TrendingUp,
  Briefcase,
  Star,
  Award,
  Clock as ClockIcon,
  UserCheck,
  CalendarDays,
  Sparkles
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ScheduleTable = ({ darkMode = false, refreshTrigger }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
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
    cancelled: 0,
    urgent: 0
  });
  const [expandedSchedule, setExpandedSchedule] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    type: '',
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [animation, setAnimation] = useState(false);

  // Modal component
  const Modal = () => {
    if (!showModal) return null;

    const getIcon = () => {
      switch (modalConfig.type) {
        case 'success': return <CheckCircle className="w-12 h-12 text-green-500" />;
        case 'error': return <AlertCircle className="w-12 h-12 text-red-500" />;
        case 'confirm': return <AlertCircle className="w-12 h-12 text-amber-500" />;
        default: return <Bell className="w-12 h-12 text-[#3d1209]" />;
      }
    };

    const getButtonColor = () => {
      switch (modalConfig.type) {
        case 'success': return 'bg-green-500 hover:bg-green-600';
        case 'error': return 'bg-red-500 hover:bg-red-600';
        case 'confirm': return 'bg-amber-500 hover:bg-amber-600';
        default: return 'bg-[#3d1209] hover:bg-[#5a1b0e]';
      }
    };

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={modalConfig.onCancel || (() => setShowModal(false))}></div>
          
          <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-2xl shadow-2xl">
            <div className="flex items-center justify-center mb-4">
              {getIcon()}
            </div>
            
            <h3 className="text-lg font-medium leading-6 text-gray-900 text-center mb-2">
              {modalConfig.title}
            </h3>
            
            <div className="mt-2">
              <p className="text-sm text-gray-500 text-center">
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

  const showAlert = (type, title, message, onConfirm = null, onCancel = null) => {
    setModalConfig({ type, title, message, onConfirm, onCancel });
    setShowModal(true);
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setAnimation(true);
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
      setTimeout(() => setAnimation(false), 500);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setSchedules(getSampleSchedules());
      calculateStats(getSampleSchedules());
      setTimeout(() => setAnimation(false), 500);
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
      cancelled: schedulesData.filter(s => s.status === 'cancelled').length,
      urgent: schedulesData.filter(s => s.priority === 'urgent' || s.priority === 'high').length
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      'scheduled': { color: 'bg-blue-100 text-blue-700', icon: '📋', label: 'Scheduled' },
      'in progress': { color: 'bg-amber-100 text-amber-700', icon: '⚡', label: 'In Progress' },
      'completed': { color: 'bg-green-100 text-green-700', icon: '✅', label: 'Completed' },
      'cancelled': { color: 'bg-red-100 text-red-700', icon: '❌', label: 'Cancelled' },
      'pending': { color: 'bg-purple-100 text-purple-700', icon: '⏳', label: 'Pending' }
    };
    return configs[status?.toLowerCase()] || configs.scheduled;
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      'urgent': { color: 'bg-red-100 text-red-700', icon: '🚨', label: 'Urgent' },
      'high': { color: 'bg-orange-100 text-orange-700', icon: '🔥', label: 'High' },
      'medium': { color: 'bg-blue-100 text-blue-700', icon: '⚡', label: 'Medium' },
      'low': { color: 'bg-green-100 text-green-700', icon: '🐌', label: 'Low' }
    };
    return configs[priority?.toLowerCase()] || configs.medium;
  };

  const getAvatarColor = (id) => {
    if (!id) return '#4A90E2';
    const colors = ['#4A90E2', '#50C878', '#FF6B6B', '#FFA500', '#9B59B6', '#1ABC9C', '#E74C3C', '#3498DB'];
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
    if (selectedSchedules.length === paginatedSchedules.length) {
      setSelectedSchedules([]);
    } else {
      setSelectedSchedules(paginatedSchedules.map(s => s.id));
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
    showAlert('info', 'PDF Export', 'PDF export feature will be available soon!');
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
    const matchesPriority = filterPriority === 'all' || schedule.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedSchedules = filteredSchedules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-[#3d1209] rounded-full animate-spin"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-[#3d1209] animate-pulse" />
        </div>
        <p className="text-gray-500 mt-4 font-medium">Loading schedules...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-4 sm:p-6 transition-all duration-500 ${animation ? 'opacity-0' : 'opacity-100'}`}>
      <Modal />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#3d1209] via-[#5a1b0e] to-[#7a2a15] rounded-3xl p-8 shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/10 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <span className="text-amber-300 text-sm font-semibold uppercase tracking-wider">Schedule Management</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                Task Schedules
              </h1>
              <p className="text-amber-200/80 text-lg">
                Manage and monitor all scheduled tasks in one place
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'table' ? 'calendar' : 'table')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all duration-300 font-medium"
              >
                {viewMode === 'table' ? <Calendar className="w-5 h-5" /> : <List className="w-5 h-5" />}
                {viewMode === 'table' ? 'Calendar View' : 'Table View'}
              </button>
              
              <button
                onClick={() => generatePDF()}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#3d1209] hover:bg-amber-50 rounded-xl transition-all duration-300 font-medium shadow-lg"
              >
                <Download className="w-5 h-5" />
                Export PDF
              </button>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
            <StatCard icon={BarChart3} label="Total" value={stats.total} color="bg-blue-100 text-blue-600" />
            <StatCard icon={Calendar} label="Scheduled" value={stats.scheduled} color="bg-amber-100 text-amber-600" />
            <StatCard icon={Zap} label="In Progress" value={stats.inProgress} color="bg-yellow-100 text-yellow-600" trend="+12%" />
            <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="bg-green-100 text-green-600" trend="+8%" />
            <StatCard icon={AlertCircle} label="Cancelled" value={stats.cancelled} color="bg-red-100 text-red-600" />
            <StatCard icon={TrendingUp} label="High Priority" value={stats.urgent} color="bg-orange-100 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search schedules by task, ID, or staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3d1209]/30 focus:border-[#3d1209] outline-none transition-all"
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
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3d1209]/30 focus:border-[#3d1209] outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3d1209]/30 focus:border-[#3d1209] outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div className="relative">
              <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select 
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#3d1209]/30 focus:border-[#3d1209] outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
        
        {selectedSchedules.length > 0 && (
          <div className="mt-4 flex items-center justify-between bg-amber-50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-amber-800">
              <CheckSquare className="w-5 h-5" />
              <span className="font-medium">{selectedSchedules.length} schedules selected</span>
            </div>
            
            <div className="flex gap-3">
              <select 
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-4 py-2 bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
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
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="w-12 px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedSchedules.length === paginatedSchedules.length && paginatedSchedules.length > 0}
                      onChange={handleSelectAll}
                      className="w-5 h-5 rounded border-gray-300 text-[#3d1209] focus:ring-[#3d1209]/30 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Task Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Timeline</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-100">
                {paginatedSchedules.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Search className="w-16 h-16 text-gray-300" />
                        <div>
                          <p className="text-lg font-semibold text-gray-600">No schedules found</p>
                          <p className="text-gray-400">Try adjusting your search or filters</p>
                        </div>
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setFilterStatus('all');
                            setFilterType('all');
                            setFilterPriority('all');
                          }}
                          className="text-[#3d1209] hover:text-amber-700 text-sm font-medium"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedSchedules.map((schedule, idx) => {
                    const statusConfig = getStatusConfig(schedule.status);
                    const priorityConfig = getPriorityConfig(schedule.priority);
                    const isEditing = editingId === schedule.id;
                    
                    return (
                      <React.Fragment key={schedule.id}>
                        <tr className={`hover:bg-gray-50 transition-colors ${isEditing ? 'bg-amber-50' : ''}`}>
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedSchedules.includes(schedule.id)}
                              onChange={() => handleSelectSchedule(schedule.id)}
                              className="w-5 h-5 rounded border-gray-300 text-[#3d1209] focus:ring-[#3d1209]/30 cursor-pointer"
                            />
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              <div className="text-xs font-mono text-gray-400">{schedule.scheduleId}</div>
                              {isEditing ? (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    name="taskTitle"
                                    value={editFormData.taskTitle}
                                    onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d1209]/30 focus:border-[#3d1209] outline-none"
                                    placeholder="Task Title"
                                  />
                                  <textarea
                                    name="taskDescription"
                                    value={editFormData.taskDescription}
                                    onChange={handleFormChange}
                                    rows={2}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d1209]/30 focus:border-[#3d1209] outline-none resize-none"
                                    placeholder="Description"
                                  />
                                </div>
                              ) : (
                                <>
                                  <h3 
                                    className="font-semibold text-gray-800 cursor-pointer hover:text-[#3d1209] transition-colors flex items-center gap-2"
                                    onClick={() => toggleExpandSchedule(schedule.id)}
                                  >
                                    {schedule.taskTitle}
                                    {expandedSchedule === schedule.id ? 
                                      <ChevronUp className="w-4 h-4" /> : 
                                      <ChevronDown className="w-4 h-4" />
                                    }
                                  </h3>
                                  <p className="text-sm text-gray-500 line-clamp-2">{schedule.taskDescription}</p>
                                  <div className="flex gap-2 mt-2">
                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                      {schedule.scheduleType}
                                    </span>
                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                      {schedule.department}
                                    </span>
                                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {schedule.estimatedHours}h
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="text-xs text-gray-400">Start</div>
                              <div className="font-medium text-gray-700">{formatDateTime(schedule.scheduledDate)}</div>
                              {schedule.endDate && (
                                <>
                                  <div className="text-xs text-gray-400 mt-2">End</div>
                                  <div className="font-medium text-gray-700">{formatDateTime(schedule.endDate)}</div>
                                </>
                              )}
                              <div className="flex items-center gap-1 text-xs text-amber-600 mt-2">
                                <RefreshCw className="w-3 h-3" />
                                {schedule.recurrence}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex -space-x-2 mb-2">
                              {schedule.assignments?.slice(0, 3).map((staff, idx) => (
                                <div
                                  key={staff.staffId}
                                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white font-medium text-sm shadow-sm"
                                  style={{ backgroundColor: getAvatarColor(staff.staffId) }}
                                  title={staff.staffName}
                                >
                                  {staff.staffName?.charAt(0).toUpperCase()}
                                </div>
                              ))}
                              {schedule.staffCount > 3 && (
                                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-600 text-xs font-medium">
                                  +{schedule.staffCount - 3}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{schedule.staffCount} assigned</div>
                          </td>
                          
                          <td className="px-6 py-4">
                            {isEditing ? (
                              <select
                                name="priority"
                                value={editFormData.priority}
                                onChange={handleFormChange}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d1209]/30 outline-none"
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            ) : (
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${priorityConfig.color}`}>
                                <span>{priorityConfig.icon}</span>
                                {priorityConfig.label}
                              </span>
                            )}
                          </td>
                          
                          <td className="px-6 py-4">
                            {isEditing ? (
                              <select
                                name="status"
                                value={editFormData.status}
                                onChange={handleFormChange}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d1209]/30 outline-none"
                              >
                                <option value="scheduled">Scheduled</option>
                                <option value="in progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            ) : (
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.color}`}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'currentColor' }}></span>
                                {statusConfig.label}
                              </span>
                            )}
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSaveEdit(schedule.id)}
                                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
                                    title="Save"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-all"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditClick(schedule)}
                                    className="p-2 bg-[#3d1209] text-white rounded-lg hover:bg-[#5a1b0e] transition-all"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => generatePDF(schedule)}
                                    className="p-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all"
                                    title="Export PDF"
                                  >
                                    <Printer className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSchedule(schedule.id, schedule.taskTitle)}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                            
                            <div className="flex gap-1 mt-2">
                              <button
                                onClick={() => handleStatusChange(schedule.id, 'completed')}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleStatusChange(schedule.id, 'in progress')}
                                className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors"
                              >
                                Progress
                              </button>
                            </div>
                           </td>
                         </tr>
                         
                        {expandedSchedule === schedule.id && (
                          <tr>
                            <td colSpan="7" className="px-6 py-6 bg-gradient-to-r from-gray-50 to-white">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Full Description
                                  </h4>
                                  <p className="text-gray-600 text-sm leading-relaxed">{schedule.taskDescription}</p>
                                  {schedule.notes && (
                                    <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                                      <p className="text-xs text-amber-600 font-medium">Notes:</p>
                                      <p className="text-sm text-gray-600">{schedule.notes}</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Assigned Staff ({schedule.assignments?.length || 0})
                                  </h4>
                                  <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {schedule.assignments?.map((staff) => (
                                      <div key={staff.staffId} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                        <div
                                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                                          style={{ backgroundColor: getAvatarColor(staff.staffId) }}
                                        >
                                          {staff.staffName?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                          <div className="font-medium text-gray-800 text-sm">{staff.staffName}</div>
                                          <div className="text-xs text-gray-500 flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {staff.email}
                                          </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                          staff.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                          staff.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                          'bg-red-100 text-red-700'
                                        }`}>
                                          {staff.status}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Schedule Info
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                      <span className="text-gray-500">Created:</span>
                                      <span className="text-gray-700">{formatDateTime(schedule.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                      <span className="text-gray-500">Last Updated:</span>
                                      <span className="text-gray-700">{formatDateTime(schedule.updatedAt)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-gray-100">
                                      <span className="text-gray-500">Email Notifications:</span>
                                      <span className={schedule.sendEmail ? 'text-green-600' : 'text-gray-400'}>
                                        {schedule.sendEmail ? 'Enabled' : 'Disabled'}
                                      </span>
                                    </div>
                                    {schedule.requiredSkills?.length > 0 && (
                                      <div className="py-2">
                                        <div className="text-gray-500 mb-2">Required Skills:</div>
                                        <div className="flex flex-wrap gap-2">
                                          {schedule.requiredSkills.map((skill, i) => (
                                            <span key={i} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                              {skill}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredSchedules.length)} of {filteredSchedules.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-[#3d1209] text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Calendar View
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-[#3d1209]" />
              Schedule Calendar
            </h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Week
              </button>
              <button className="px-4 py-2 bg-[#3d1209] text-white rounded-lg hover:bg-[#5a1b0e] transition-colors">
                Month
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="bg-gray-50 p-3 text-center font-semibold text-gray-600 text-sm">
                {day}
              </div>
            ))}
            
            {Array.from({ length: 35 }, (_, i) => {
              const dayNumber = i - 2; // Adjust to start from correct date
              const daySchedules = filteredSchedules.filter(schedule => {
                const scheduleDate = new Date(schedule.scheduledDate);
                return scheduleDate.getDate() === dayNumber && scheduleDate.getMonth() === 0;
              });
              
              return (
                <div key={i} className="bg-white min-h-[100px] p-2">
                  <div className={`text-sm font-medium mb-1 ${dayNumber === 3 ? 'text-[#3d1209]' : 'text-gray-500'}`}>
                    {dayNumber > 0 && dayNumber <= 31 ? dayNumber : ''}
                  </div>
                  <div className="space-y-1">
                    {daySchedules.slice(0, 2).map(schedule => {
                      const priorityConfig = getPriorityConfig(schedule.priority);
                      return (
                        <div
                          key={schedule.id}
                          className={`p-1.5 rounded text-xs cursor-pointer hover:scale-105 transition-transform ${priorityConfig.color.replace('text', 'bg').replace('text-', 'bg-').replace('700', '100')}`}
                          onClick={() => toggleExpandSchedule(schedule.id)}
                          title={schedule.taskTitle}
                        >
                          <div className="truncate font-medium">{schedule.taskTitle}</div>
                        </div>
                      );
                    })}
                    {daySchedules.length > 2 && (
                      <div className="text-xs text-gray-400">+{daySchedules.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-gray-600">Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">Cancelled</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTable;