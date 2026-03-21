import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import WelcomeBanner from '../components/Dashboard/WelcomeBanner';
import StatsCards from '../components/Dashboard/StatsCards';
import QuickActions from '../components/Dashboard/QuickActions';
import StaffTable from '../components/Staff/StaffTable';
import AddStaffForm from '../components/Staff/AddStaffForm';
import TaskCard from '../components/Tasks/TaskCard';
import AddTaskForm from '../components/Tasks/AddTaskForm';
import TaskSchedule from '../components/Schedule/TaskSchedule';
import ScheduleTable from '../components/Schedule/ScheduleTable';
import ProfilePage from '../components/Header/ProfilePage';
import SettingsPage from '../components/Header/SettingsPage';
import PrivacyPage from '../components/Header/PrivacyPage';
import { 
  FaBell, FaChartLine, FaUsers, FaTasks, FaCalendarAlt, 
  FaArrowRight, FaCheckCircle, FaClock, FaExclamationTriangle,
  FaUserPlus, FaClipboardList, FaFileAlt, FaCog, FaShieldAlt,
  FaStar, FaRegClock, FaRegCheckCircle, FaUserCheck
} from 'react-icons/fa';

const Dashboard = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [showWelcomeToast, setShowWelcomeToast] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // User state — populated from AuthContext
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = authUser || JSON.parse(localStorage.getItem('user') || '{}');
    return {
      id: stored._id || stored.id || '',
      fullName: stored.firstName && stored.lastName
        ? `${stored.firstName} ${stored.lastName}`
        : stored.fullName || stored.email || 'Admin',
      email: stored.email || '',
      phone: stored.phone || '',
      department: stored.department || 'Administration',
      position: stored.role || 'Administrator',
      joinDate: stored.createdAt ? stored.createdAt.split('T')[0] : '',
      bio: stored.bio || '',
      skills: stored.skills || [],
      avatar: stored.avatar || ''
    };
  });
  
  // Dark mode handling
  const [localDarkMode, setLocalDarkMode] = useState(darkMode || false);
  const effectiveDarkMode = darkMode !== undefined ? darkMode : localDarkMode;
  const effectiveSetDarkMode = setDarkMode || setLocalDarkMode;

  // Sync currentUser when authUser changes
  useEffect(() => {
    if (authUser) {
      setCurrentUser({
        id: authUser._id || authUser.id || '',
        fullName: authUser.firstName && authUser.lastName
          ? `${authUser.firstName} ${authUser.lastName}`
          : authUser.fullName || authUser.email || 'Admin',
        email: authUser.email || '',
        phone: authUser.phone || '',
        department: authUser.department || 'Administration',
        position: authUser.role || 'Administrator',
        joinDate: authUser.createdAt ? authUser.createdAt.split('T')[0] : '',
        bio: authUser.bio || '',
        skills: authUser.skills || [],
        avatar: authUser.avatar || ''
      });
    }
  }, [authUser]);

  // Track mouse movement for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-hide welcome toast
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcomeToast(false), 5000);
    return () => clearTimeout(timer);
  }, []);
  
  // Sample Data
  const [staffMembers, setStaffMembers] = useState([
    { 
      id: '1',
      firstName: 'John', 
      lastName: 'Doe', 
      name: 'John Doe',
      role: 'Bank Manager', 
      department: 'Management', 
      email: 'john@bunnabank.com', 
      phone: '+1 234 567 890', 
      status: 'active', 
      shift: '9:00 AM - 5:00 PM', 
      avatarColor: '#3d1209',
      performance: '98%',
      tasks: 12
    },
    { 
      id: '2',
      firstName: 'Jane', 
      lastName: 'Smith', 
      name: 'Jane Smith',
      role: 'Loan Officer', 
      department: 'Loans', 
      email: 'jane@bunnabank.com', 
      phone: '+1 234 567 891', 
      status: 'active', 
      shift: '8:00 AM - 4:00 PM', 
      avatarColor: '#3d1209',
      performance: '95%',
      tasks: 8
    },
    { 
      id: '3',
      firstName: 'Robert', 
      lastName: 'Johnson', 
      name: 'Robert Johnson',
      role: 'Teller', 
      department: 'Customer Service', 
      email: 'robert@bunnabank.com', 
      phone: '+1 234 567 892', 
      status: 'on leave', 
      shift: '10:00 AM - 6:00 PM', 
      avatarColor: '#f59e0b',
      performance: '92%',
      tasks: 5
    },
    { 
      id: '4',
      firstName: 'Sarah', 
      lastName: 'Williams', 
      name: 'Sarah Williams',
      role: 'Financial Advisor', 
      department: 'Investments', 
      email: 'sarah@bunnabank.com', 
      phone: '+1 234 567 893', 
      status: 'active', 
      shift: '9:00 AM - 5:00 PM', 
      avatarColor: '#3d1209',
      performance: '96%',
      tasks: 10
    },
    { 
      id: '5',
      firstName: 'Michael', 
      lastName: 'Brown', 
      name: 'Michael Brown',
      role: 'IT Specialist', 
      department: 'IT Support', 
      email: 'michael@bunnabank.com', 
      phone: '+1 234 567 894', 
      status: 'active', 
      shift: '8:00 AM - 4:00 PM', 
      avatarColor: '#3d1209',
      performance: '99%',
      tasks: 15
    },
  ]);

  const [tasks, setTasks] = useState([
    { 
      id: '1',
      title: 'Review Customer Applications', 
      description: 'Review and approve pending customer loan applications',
      assignedTo: 'John Doe', 
      priority: 'high', 
      deadline: 'Today, 5:00 PM', 
      status: 'pending', 
      progress: 60, 
      color: '#ef4444',
      comments: 3,
      attachments: 2
    },
    { 
      id: '2',
      title: 'Process Loan Documents', 
      description: 'Process and verify loan documents for new applications',
      assignedTo: 'Jane Smith', 
      priority: 'medium', 
      deadline: 'Tomorrow, 3:00 PM', 
      status: 'in-progress', 
      progress: 30, 
      color: '#3d1209',
      comments: 5,
      attachments: 1
    },
    { 
      id: '3',
      title: 'Update Customer Records', 
      description: 'Update customer information in the database',
      assignedTo: 'Sarah Williams', 
      priority: 'low', 
      deadline: 'Next Week', 
      status: 'pending', 
      progress: 0, 
      color: '#10b981',
      comments: 1,
      attachments: 0
    },
    { 
      id: '4',
      title: 'Prepare Monthly Reports', 
      description: 'Compile and analyze monthly financial data',
      assignedTo: 'Michael Brown', 
      priority: 'high', 
      deadline: 'Friday, 5:00 PM', 
      status: 'pending', 
      progress: 15, 
      color: '#3d1209',
      comments: 2,
      attachments: 3
    },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Task Assigned', message: 'You have been assigned to review quarterly reports', time: '10 min ago', read: false, type: 'task', icon: '📋', priority: 'high' },
    { id: 2, title: 'Meeting Reminder', message: 'Team meeting at 2:00 PM today', time: '1 hour ago', read: false, type: 'meeting', icon: '👥', priority: 'medium' },
    { id: 3, title: 'Shift Change', message: 'Your shift has been updated for tomorrow', time: '3 hours ago', read: true, type: 'shift', icon: '🔄', priority: 'low' },
    { id: 4, title: 'New Staff Member', message: 'John Doe has joined the team', time: '5 hours ago', read: true, type: 'staff', icon: '👤', priority: 'low' },
    { id: 5, title: 'System Update', message: 'System maintenance scheduled for tonight', time: '2 hours ago', read: false, type: 'system', icon: '⚙️', priority: 'medium' },
  ]);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const addNewStaff = () => {
    const newId = (staffMembers.length + 1).toString();
    const newStaff = {
      id: newId,
      firstName: 'New',
      lastName: 'Staff',
      name: 'New Staff Member',
      role: 'Staff',
      department: 'New Department',
      email: 'new@bunnabank.com',
      phone: '+1 234 567 899',
      status: 'active',
      shift: '9:00 AM - 5:00 PM',
      avatarColor: '#3d1209',
      performance: '0%',
      tasks: 0
    };
    setStaffMembers([...staffMembers, newStaff]);
  };

  const addNewTask = () => {
    const newId = (tasks.length + 1).toString();
    const newTask = {
      id: newId,
      title: 'New Task',
      description: 'New task description',
      assignedTo: 'Unassigned',
      priority: 'medium',
      deadline: 'Today, 5:00 PM',
      status: 'pending',
      progress: 0,
      color: '#3d1209',
      comments: 0,
      attachments: 0
    };
    setTasks([...tasks, newTask]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const handleScheduleClose = () => {
    setActiveMenu('dashboard');
    setActiveSubMenu(null);
  };

  const updateUserProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const handleProfileClick = () => {
    setActiveMenu('profile');
    setActiveSubMenu(null);
  };

  const handleSettingsClick = () => {
    setActiveMenu('settings');
    setActiveSubMenu(null);
  };

  const handlePrivacyClick = () => {
    setActiveMenu('privacy');
    setActiveSubMenu(null);
  };

  // Calculate dashboard stats
  const activeStaff = staffMembers.filter(s => s.status === 'active').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="space-y-5 md:space-y-6">
            {/* Welcome Toast */}
            {showWelcomeToast && (
              <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
                <div className="bg-white rounded-xl shadow-2xl border-l-4 border-[#3d1209] p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3d1209]/10 rounded-full flex items-center justify-center">
                    <FaUserCheck className="text-[#3d1209]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Welcome back, {currentUser.fullName}!</p>
                    <p className="text-sm text-gray-600">You have {unreadNotifications} new notifications</p>
                  </div>
                </div>
              </div>
            )}

            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#3d1209] to-[#5a1b0e] p-6 md:p-8">
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '30px 30px'
                }}
              />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {currentUser.fullName}!
                  </h1>
                  <p className="text-amber-100/80">Here's what's happening with your dashboard today.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                    <p className="text-amber-200 text-sm">Last Login</p>
                    <p className="text-white font-semibold">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards with custom styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {/* Staff Stats */}
              <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-[#3d1209]/10 rounded-lg flex items-center justify-center">
                    <FaUsers className="text-[#3d1209] text-xl" />
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    +{staffMembers.length - 5} new
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{staffMembers.length}</h3>
                <p className="text-sm text-gray-500">Total Staff Members</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                    <div className="h-full bg-[#3d1209] rounded-full" style={{ width: `${(activeStaff / staffMembers.length) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-600">{activeStaff} Active</span>
                </div>
              </div>

              {/* Tasks Stats */}
              <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <FaTasks className="text-amber-600 text-xl" />
                  </div>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                    {highPriorityTasks} high
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">{tasks.length}</h3>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <div className="mt-3 flex items-center gap-2">
                  <FaCheckCircle className="text-green-500 text-xs" />
                  <span className="text-xs text-gray-600">{completedTasks} Completed</span>
                  <FaClock className="text-amber-500 text-xs ml-2" />
                  <span className="text-xs text-gray-600">{pendingTasks} Pending</span>
                </div>
              </div>

              {/* Schedule Stats */}
              <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <FaCalendarAlt className="text-emerald-600 text-xl" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                    Today
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">8</h3>
                <p className="text-sm text-gray-500">Scheduled Events</p>
                <div className="mt-3 flex items-center gap-2">
                  <FaRegClock className="text-emerald-500 text-xs" />
                  <span className="text-xs text-gray-600">Next: Team Meeting at 2PM</span>
                </div>
              </div>

              {/* Pending Approvals */}
              <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <FaClipboardList className="text-purple-600 text-xl" />
                  </div>
                  <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    Urgent
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-1">4</h3>
                <p className="text-sm text-gray-500">Pending Approvals</p>
                <div className="mt-3 flex items-center gap-2">
                  <FaExclamationTriangle className="text-orange-500 text-xs" />
                  <span className="text-xs text-gray-600">2 require attention</span>
                </div>
              </div>
            </div>

            {/* Quick Actions with enhanced styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => { setActiveMenu('staff'); setActiveSubMenu('add-staff'); }}
                className="group relative overflow-hidden bg-gradient-to-r from-[#3d1209] to-[#5a1b0e] text-white rounded-xl p-5 transition-all duration-500 hover:shadow-2xl hover:shadow-[#3d1209]/30 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FaUserPlus className="text-white text-lg" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Add New Staff</p>
                    <p className="text-xs text-white/70">Invite team member</p>
                  </div>
                  <FaArrowRight className="transform transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              <button
                onClick={() => { setActiveMenu('task'); setActiveSubMenu('add-task'); }}
                className="group relative overflow-hidden bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl p-5 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-600/30 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FaTasks className="text-white text-lg" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Create Task</p>
                    <p className="text-xs text-white/70">Assign new task</p>
                  </div>
                  <FaArrowRight className="transform transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              <button
                onClick={() => { setActiveMenu('TaskSchedule'); setActiveSubMenu('add-schedule'); }}
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl p-5 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-600/30 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FaCalendarAlt className="text-white text-lg" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Schedule</p>
                    <p className="text-xs text-white/70">Plan your day</p>
                  </div>
                  <FaArrowRight className="transform transition-transform group-hover:translate-x-1" />
                </div>
              </button>

              <button
                onClick={() => setActiveMenu('reports')}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-5 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-600/30 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FaFileAlt className="text-white text-lg" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Reports</p>
                    <p className="text-xs text-white/70">View analytics</p>
                  </div>
                  <FaArrowRight className="transform transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            </div>

            {/* Recent Tasks and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Tasks List */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Tasks</h3>
                  <button 
                    onClick={() => setActiveMenu('task')}
                    className="text-sm text-[#3d1209] font-medium hover:underline flex items-center gap-1"
                  >
                    View All <FaArrowRight className="text-xs" />
                  </button>
                </div>
                <div className="space-y-3">
                  {tasks.slice(0, 3).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: task.color }} />
                        <div>
                          <p className="font-medium text-gray-800">{task.title}</p>
                          <p className="text-xs text-gray-500">Assigned to {task.assignedTo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">{task.deadline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
                  <FaBell className="text-[#3d1209]" />
                </div>
                <div className="space-y-4">
                  {notifications.slice(0, 4).map(notif => (
                    <div key={notif.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        notif.read ? 'bg-gray-100' : 'bg-[#3d1209]/10'
                      }`}>
                        <span>{notif.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${notif.read ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-400">{notif.time}</p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-[#3d1209] rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Staff Performance Section */}
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Staff Performance</h3>
                <button className="text-sm text-[#3d1209] font-medium hover:underline">View Details</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {staffMembers.slice(0, 3).map(staff => (
                  <div key={staff.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                         style={{ backgroundColor: staff.avatarColor }}>
                      {staff.firstName[0]}{staff.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{staff.name}</p>
                      <p className="text-xs text-gray-500">{staff.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#3d1209]">{staff.performance}</p>
                      <p className="text-xs text-gray-500">{staff.tasks} tasks</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'staff':
        return activeSubMenu === 'add-staff' ? (
          <div className="px-2 sm:px-0">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <AddStaffForm 
                onCancel={() => setActiveSubMenu('view-staff')}
                darkMode={effectiveDarkMode}
              />
            </div>
          </div>
        ) : (
          <div className="px-2 sm:px-0">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Staff Management</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage your team members and their roles</p>
                </div>
                <button
                  onClick={() => setActiveSubMenu('add-staff')}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#3d1209' }}
                >
                  <FaUserPlus /> Add New Staff
                </button>
              </div>
              <StaffTable 
                staffMembers={staffMembers}
                onAddStaff={addNewStaff}
                darkMode={effectiveDarkMode}
              />
            </div>
          </div>
        );

      case 'task':
        return activeSubMenu === 'add-task' ? (
          <div className="px-2 sm:px-0">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <AddTaskForm 
                onCancel={() => setActiveSubMenu('view-task')}
                staffMembers={staffMembers}
                darkMode={effectiveDarkMode}
              />
            </div>
          </div>
        ) : (
          <div className="px-2 sm:px-0">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Task Management</h2>
                  <p className="text-sm text-gray-500 mt-1">Track and manage all tasks</p>
                </div>
                <button
                  onClick={() => setActiveSubMenu('add-task')}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#3d1209' }}
                >
                  <FaTasks /> Add New Task
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map(task => (
                  <TaskCard key={task.id} task={task} darkMode={effectiveDarkMode} />
                ))}
              </div>
            </div>
          </div>
        );

      case 'TaskSchedule':
        if (activeSubMenu === 'add-schedule') {
          return (
            <div className="px-2 sm:px-0">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <TaskSchedule 
                  onClose={handleScheduleClose}
                  staffMembers={staffMembers}
                  tasks={tasks}
                  darkMode={effectiveDarkMode}
                />
              </div>
            </div>
          );
        } else {
          return (
            <div className="px-2 sm:px-0">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Task Schedule</h2>
                    <p className="text-sm text-gray-500 mt-1">Plan and organize your schedule</p>
                  </div>
                  <button
                    onClick={() => setActiveSubMenu('add-schedule')}
                    className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-all w-full sm:w-auto flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#3d1209' }}
                  >
                    <FaCalendarAlt /> Create Schedule
                  </button>
                </div>
                <ScheduleTable 
                  darkMode={effectiveDarkMode}
                  refreshTrigger={false}
                />
              </div>
            </div>
          );
        }

      case 'profile':
        return (
          <div className="px-2 sm:px-0">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <ProfilePage 
                user={currentUser}
                onUpdateProfile={updateUserProfile}
                darkMode={effectiveDarkMode}
              />
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="px-2 sm:px-0">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <SettingsPage 
                user={currentUser}
                darkMode={effectiveDarkMode}
                currentDarkMode={effectiveDarkMode}
                onDarkModeToggle={effectiveSetDarkMode}
              />
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="px-2 sm:px-0">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <PrivacyPage 
                user={currentUser}
                darkMode={effectiveDarkMode}
              />
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="px-2 sm:px-0">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#3d1209]/10 rounded-lg flex items-center justify-center">
                  <FaChartLine className="text-[#3d1209] text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
                  <p className="text-sm text-gray-500">View detailed reports and insights</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Report Cards */}
                <div className="p-6 bg-gradient-to-br from-[#3d1209]/5 to-amber-500/5 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Staff Performance Report</h3>
                  <p className="text-sm text-gray-600 mb-4">Analyze individual and team performance metrics</p>
                  <button className="text-[#3d1209] font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    Generate Report <FaArrowRight className="text-xs" />
                  </button>
                </div>
                <div className="p-6 bg-gradient-to-br from-amber-500/5 to-[#3d1209]/5 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Task Completion Report</h3>
                  <p className="text-sm text-gray-600 mb-4">Track task progress and completion rates</p>
                  <button className="text-[#3d1209] font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    Generate Report <FaArrowRight className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-5 md:space-y-6">
            <WelcomeBanner 
              darkMode={effectiveDarkMode} 
              userName={currentUser.fullName}
            />
            <StatsCards 
              staffCount={staffMembers.length}
              activeTasks={tasks.filter(t => t.status !== 'completed').length}
              scheduleCount={8}
              pendingApprovals={4}
              darkMode={effectiveDarkMode}
            />
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${effectiveDarkMode ? 'dark bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-[#fdf8f5] via-[#faf1eb] to-[#f5e6de]'}`}>
      {/* Interactive Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute w-[600px] h-[600px] -top-48 -left-48 bg-gradient-to-r from-[#3d1209]/5 to-amber-500/5 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div 
          className="absolute w-[500px] h-[500px] -bottom-48 -right-48 bg-gradient-to-r from-amber-500/5 to-[#3d1209]/5 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * -0.02}px)`
          }}
        />
        
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
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

      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={effectiveDarkMode}
        activeMenu={activeMenu}
        activeSubMenu={activeSubMenu}
        setActiveMenu={setActiveMenu}
        setActiveSubMenu={setActiveSubMenu}
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      <div className={`transition-all duration-300 ease-in-out relative z-10 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <Header 
          darkMode={effectiveDarkMode}
          setDarkMode={effectiveSetDarkMode}
          notifications={notifications}
          markNotificationAsRead={markNotificationAsRead}
          deleteNotification={deleteNotification}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onLogout={handleLogout}
          onProfileClick={handleProfileClick}
          onSettingsClick={handleSettingsClick}
          onPrivacyClick={handlePrivacyClick}
          user={currentUser}
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        
        <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-fade-in">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center z-50 shadow-lg">
          <button
            onClick={() => setActiveMenu('dashboard')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeMenu === 'dashboard' ? 'text-[#3d1209]' : 'text-gray-600'
            }`}
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">Home</span>
          </button>
          <button
            onClick={() => setActiveMenu('staff')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeMenu === 'staff' ? 'text-[#3d1209]' : 'text-gray-600'
            }`}
          >
            <span className="text-xl">👥</span>
            <span className="text-xs mt-1">Staff</span>
          </button>
          <button
            onClick={() => setActiveMenu('task')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeMenu === 'task' ? 'text-[#3d1209]' : 'text-gray-600'
            }`}
          >
            <span className="text-xl">✅</span>
            <span className="text-xs mt-1">Tasks</span>
          </button>
          <button
            onClick={() => setActiveMenu('TaskSchedule')}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeMenu === 'TaskSchedule' ? 'text-[#3d1209]' : 'text-gray-600'
            }`}
          >
            <span className="text-xl">📅</span>
            <span className="text-xs mt-1">Schedule</span>
          </button>
        </div>
      )}

      {/* Add padding to bottom on mobile */}
      {isMobile && <div className="h-16"></div>}

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
          100% { transform: translateY(0px) rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slideInRight 0.5s ease-out;
        }
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;