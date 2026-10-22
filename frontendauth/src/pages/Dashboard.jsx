import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import StaffTable from '../components/Staff/StaffTable';
import AddStaffForm from '../components/Staff/AddStaffForm';
import TaskCard from '../components/Tasks/TaskCard';
import AddTaskForm from '../components/Tasks/AddTaskForm';
import TaskSchedule from '../components/Schedule/TaskSchedule';
import ScheduleTable from '../components/Schedule/ScheduleTable';
import ProfilePage from '../components/Header/ProfilePage';
import SettingsPage from '../components/Header/SettingsPage';
import PrivacyPage from '../components/Header/PrivacyPage';
import EmailServiceWarning from '../components/EmailServiceWarning';
import MobileBottomNav from '../components/Navigation/MobileBottomNav';
import {
  FaBell,
  FaChartLine,
  FaUsers,
  FaTasks,
  FaCalendarAlt,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaUserPlus,
  FaClipboardList,
  FaFileAlt,
  FaRegClock,
  FaArrowUp,
  FaArrowDown,
  FaShieldAlt,
  FaCalendarCheck,
  FaCheck,
  FaChevronRight,
  FaUniversity
} from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [chartPeriod, setChartPeriod] = useState('This Week');

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

  const [staffMembers, setStaffMembers] = useState([
    { id:'1', firstName:'John', lastName:'Doe', name:'John Doe', role:'Bank Manager', department:'Management', email:'john@bunnabank.com', phone:'+251 911 234 567', status:'active', avatarColor:'#3d1209', performance:'98%', tasks:12 },
    { id:'2', firstName:'Jane', lastName:'Smith', name:'Jane Smith', role:'Loan Officer', department:'Loans', email:'jane@bunnabank.com', phone:'+251 911 234 568', status:'active', avatarColor:'#5a1b0e', performance:'95%', tasks:8 },
    { id:'3', firstName:'Robert', lastName:'Johnson', name:'Robert Johnson', role:'Head Teller', department:'Customer Service', email:'robert@bunnabank.com', phone:'+251 911 234 569', status:'on leave', avatarColor:'#d97706', performance:'92%', tasks:5 },
    { id:'4', firstName:'Sarah', lastName:'Williams', name:'Sarah Williams', role:'Financial Advisor', department:'Investments', email:'sarah@bunnabank.com', phone:'+251 911 234 570', status:'active', avatarColor:'#3d1209', performance:'96%', tasks:10 },
    { id:'5', firstName:'Michael', lastName:'Brown', name:'Michael Brown', role:'IT Specialist', department:'IT Support', email:'michael@bunnabank.com', phone:'+251 911 234 571', status:'active', avatarColor:'#4a140a', performance:'99%', tasks:15 },
  ]);

  const [tasks, setTasks] = useState([
    { id:'1', title:'Review Loan Applications', description:'Review and approve pending commercial loan requests', assignedTo:'John Doe', priority:'high', deadline:'Today, 5:00 PM', status:'pending', color:'#ef4444' },
    { id:'2', title:'Process Loan Documents', description:'Process and verify collateral insurance documents', assignedTo:'Jane Smith', priority:'medium', deadline:'Tomorrow, 3:00 PM', status:'in-progress', color:'#f59e0b' },
    { id:'3', title:'Update KYC Customer Records', description:'Update high-value customer identification records', assignedTo:'Sarah Williams', priority:'low', deadline:'In 3 Days', status:'pending', color:'#10b981' },
    { id:'4', title:'Prepare Monthly Audit Report', description:'Compile branch balance reconciliation sheets', assignedTo:'Michael Brown', priority:'high', deadline:'Friday, 5:00 PM', status:'pending', color:'#ef4444' },
  ]);

  const [notifications, setNotifications] = useState([
    { id:1, title:'Quarterly Shift Rotations', message:'Branch manager updated the schedule for next week', time:'10 min ago', read:false, icon:'Clipboard', color:'bg-amber-100 text-amber-700' },
    { id:2, title:'Executive Committee Meeting', message:'Regional branch meeting starts at 2:00 PM today', time:'1 hour ago', read:false, icon:'Users', color:'bg-blue-100 text-blue-700' },
    { id:3, title:'Teller Shift Swapped', message:'Sarah Williams accepted the morning shift coverage', time:'3 hours ago', read:true, icon:'RotateCcw', color:'bg-emerald-100 text-emerald-700' },
    { id:4, title:'New Staff Onboarded', message:'Abebe Kebede added to Customer Operations', time:'5 hours ago', read:true, icon:'User', color:'bg-purple-100 text-purple-700' },
    { id:5, title:'System Security Backup', message:'Core banking synchronization finished successfully', time:'7 hours ago', read:true, icon:'Shield', color:'bg-slate-100 text-slate-700' },
  ]);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      setSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 768;
  const activeStaff = staffMembers.filter(s => s.status === 'active').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleLogout = () => { logout(); navigate('/login'); };
  const markNotificationAsRead = (id) => setNotifications(n => n.map(x => x.id === id ? {...x, read:true} : x));
  const deleteNotification = (id) => setNotifications(n => n.filter(x => x.id !== id));
  const handleScheduleClose = () => { setActiveMenu('dashboard'); setActiveSubMenu(null); };
  const updateUserProfile = (u) => setCurrentUser(u);

  // Weekly analytics data for custom CSS bar chart
  const weeklyChartData = [
    { day: 'Mon', shifts: 85, tasks: 72, label: 'Mon' },
    { day: 'Tue', shifts: 90, tasks: 88, label: 'Tue' },
    { day: 'Wed', shifts: 95, tasks: 92, label: 'Wed' },
    { day: 'Thu', shifts: 88, tasks: 80, label: 'Thu' },
    { day: 'Fri', shifts: 100, tasks: 95, label: 'Fri' },
    { day: 'Sat', shifts: 65, tasks: 58, label: 'Sat' },
    { day: 'Sun', shifts: 40, tasks: 35, label: 'Sun' },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* ================= EMAIL SERVICE WARNING ================= */}
            <EmailServiceWarning />

            {/* ================= 1. WELCOME BANNER ================= */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3d1209] via-[#4d170c] to-[#250904] p-7 md:p-9 text-white shadow-xl shadow-[#3d1209]/15 border border-[#3d1209]/20">
              {/* Subtle background graphics */}
              <div
                className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 20px 20px, white 2px, transparent 0%), radial-gradient(circle at 60px 60px, #f59e0b 2px, transparent 0%)`,
                  backgroundSize: '80px 80px'
                }}
              />
              <div className="absolute -right-16 -top-16 w-80 h-80 bg-[#f59e0b]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute right-1/3 -bottom-20 w-60 h-60 bg-[#3d1209] rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-ping" />
                    <span>Bunna Bank • Workforce Management Portal</span>
                  </div>

                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {currentUser.fullName}
                  </h1>

                  <p className="text-amber-100/80 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
                    All branch systems operational. You have <span className="text-amber-300 font-semibold">{pendingTasks} pending tasks</span> and <span className="text-amber-300 font-semibold">8 staff shifts</span> scheduled for today.
                  </p>
                </div>

                {/* Status Badges */}
                <div className="flex flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3 shrink-0">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/15 shadow-sm text-left lg:text-right">
                    <p className="text-amber-200/80 text-xs font-medium uppercase tracking-wider">Current Date</p>
                    <p className="text-white font-bold text-base mt-0.5">
                      {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Branch Network Online (99.8%)
                  </div>
                </div>
              </div>
            </div>

            {/* ================= 2. STATS CARDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Staff */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3d1209] to-[#5a1b0e] flex items-center justify-center text-white shadow-md shadow-[#3d1209]/20 group-hover:scale-105 transition-transform">
                    <FaUsers className="text-xl text-amber-300" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <FaArrowUp className="text-[10px]" /> +8.4%
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{staffMembers.length}</h3>
                  <p className="text-sm font-medium text-slate-500">Active Staff Directory</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{activeStaff} on active duty</span>
                  <span className="font-semibold text-[#3d1209]">{((activeStaff/staffMembers.length)*100).toFixed(0)}% available</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-gradient-to-r from-[#3d1209] to-[#f59e0b] rounded-full" style={{ width: `${(activeStaff/staffMembers.length)*100}%` }} />
                </div>
              </div>

              {/* Card 2: Tasks */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
                    <FaTasks className="text-xl" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                    {highPriorityTasks} High Priority
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{tasks.length}</h3>
                  <p className="text-sm font-medium text-slate-500">Scheduled Operations</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <FaCheckCircle className="text-emerald-500" /> {completedTasks} Done
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <FaClock className="text-amber-500" /> {pendingTasks} In Progress
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(completedTasks/tasks.length)*100}%` }} />
                </div>
              </div>

              {/* Card 3: Shifts */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                    <FaCalendarAlt className="text-xl" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <FaCheck className="text-[10px]" /> 100% Covered
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">8</h3>
                  <p className="text-sm font-medium text-slate-500">Shifts Active Today</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <FaRegClock className="text-emerald-600" /> Next: 2:00 PM Handover
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

              {/* Card 4: Approvals */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5a1b0e] to-[#7f1d1d] flex items-center justify-center text-white shadow-md shadow-red-900/20 group-hover:scale-105 transition-transform">
                    <FaClipboardList className="text-xl text-amber-300" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    Action Needed
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">4</h3>
                  <p className="text-sm font-medium text-slate-500">Pending Approvals</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    <FaExclamationTriangle className="text-amber-500" /> 2 Leave Requests
                  </span>
                  <span>2 Shift Swaps</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>

            {/* ================= 3. QUICK ACTIONS ================= */}
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Quick Operations</h3>
                <span className="text-xs text-slate-500">Frequent banking actions</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Add Staff Member',
                    sub: 'Enroll branch employee',
                    icon: FaUserPlus,
                    gradient: 'from-[#3d1209] to-[#250904]',
                    action: () => { setActiveMenu('staff'); setActiveSubMenu('add-staff'); }
                  },
                  {
                    label: 'Assign Duty Task',
                    sub: 'Allocate daily assignment',
                    icon: FaTasks,
                    gradient: 'from-amber-600 to-amber-700',
                    action: () => { setActiveMenu('task'); setActiveSubMenu('add-task'); }
                  },
                  {
                    label: 'Create Shift Schedule',
                    sub: 'Plan rotations & calendar',
                    icon: FaCalendarAlt,
                    gradient: 'from-emerald-700 to-teal-800',
                    action: () => { setActiveMenu('TaskSchedule'); setActiveSubMenu('add-schedule'); }
                  },
                  {
                    label: 'Generate Reports',
                    sub: 'Audits, attendance & KPIs',
                    icon: FaFileAlt,
                    gradient: 'from-[#4d170c] to-[#3d1209]',
                    action: () => setActiveMenu('reports')
                  },
                ].map(({ label, sub, icon: Icon, gradient, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className={`group relative overflow-hidden bg-gradient-to-br ${gradient} text-white rounded-2xl p-5 text-left shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-white/10`}
                  >
                    <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center mb-3.5 backdrop-blur-xs group-hover:scale-110 transition-transform">
                      <Icon className="text-white text-lg" />
                    </div>
                    <p className="font-bold text-sm tracking-tight">{label}</p>
                    <p className="text-xs text-white/70 mt-1">{sub}</p>
                    <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Proceed</span> <FaChevronRight className="text-[9px]" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ================= 4. WEEKLY WORKFORCE SCHEDULE CHART ================= */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Workforce Shift & Task Velocity</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Weekly completion rate and shift coverage across all banking units</p>
                </div>
                <div className="flex items-center gap-2">
                  {['This Week', 'Last Week', 'Monthly'].map(period => (
                    <button
                      key={period}
                      onClick={() => setChartPeriod(period)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        chartPeriod === period
                          ? 'bg-[#3d1209] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bar Chart Representation */}
              <div className="space-y-4">
                <div className="h-56 flex items-end justify-between gap-2 sm:gap-6 pt-8 pb-2 border-b border-slate-200">
                  {weeklyChartData.map((item) => (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-semibold bg-slate-900 text-white px-2 py-1 rounded shadow-md pointer-events-none mb-1">
                        {item.shifts}% Shifts • {item.tasks}% Tasks
                      </div>

                      {/* Bar Pair */}
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-44">
                        {/* Shifts bar (Deep Maroon) */}
                        <div
                          className="w-1/2 max-w-[20px] bg-gradient-to-t from-[#3d1209] to-[#5a1b0e] rounded-t-md transition-all duration-500 group-hover:brightness-110"
                          style={{ height: `${item.shifts}%` }}
                          title={`Scheduled Shifts: ${item.shifts}%`}
                        />
                        {/* Tasks bar (Amber) */}
                        <div
                          className="w-1/2 max-w-[20px] bg-gradient-to-t from-[#f59e0b] to-[#fbbf24] rounded-t-md transition-all duration-500 group-hover:brightness-110"
                          style={{ height: `${item.tasks}%` }}
                          title={`Completed Tasks: ${item.tasks}%`}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 mt-1">{item.day}</span>
                    </div>
                  ))}
                </div>

                {/* Legend & Summary Metrics */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs">
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-[#3d1209]" />
                      <span className="text-slate-600 font-medium">Shift Coverage Rate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-[#f59e0b]" />
                      <span className="text-slate-600 font-medium">Task Completion Velocity</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-slate-500">
                    <span>Average Fulfillment: <strong className="text-slate-900">94.6%</strong></span>
                    <span>Peak Efficiency: <strong className="text-emerald-600">Friday (100%)</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= 5. RECENT TASKS & ACTIVITY FEED ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tasks List (2 Columns) */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Active Branch Tasks</h3>
                    <p className="text-xs text-slate-500 mt-0.5">High priority assignments needing review or execution</p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('task')}
                    className="text-xs font-semibold text-[#3d1209] hover:text-[#d97706] flex items-center gap-1 transition-colors"
                  >
                    View All Tasks <FaArrowRight className="text-[10px]" />
                  </button>
                </div>

                <div className="space-y-3">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-colors gap-3"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className="w-3 h-3 rounded-full shrink-0 mt-1.5 shadow-xs"
                          style={{ backgroundColor: task.color }}
                        />
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">{task.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{task.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                            <span className="font-medium text-slate-600">Assigned: {task.assignedTo}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <FaClock className="text-[10px]" /> {task.deadline}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold capitalize ${
                            task.priority === 'high'
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : task.priority === 'medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {task.priority} Priority
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-slate-200/70 text-slate-700">
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity / Audit Feed (1 Column) */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">System Activity</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Live events & notifications</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-[#3d1209]/10 flex items-center justify-center text-[#3d1209]">
                      <FaBell className="text-sm" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {notifications.slice(0, 5).map(n => (
                      <div key={n.id} className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${n.color}`}>
                          {n.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs truncate ${n.read ? 'text-slate-600 font-normal' : 'text-slate-900 font-bold'}`}>
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                        </div>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-[#f59e0b] shrink-0 mt-1.5 shadow-xs" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 text-center">
                  <button
                    onClick={() => setActiveMenu('reports')}
                    className="text-xs font-semibold text-[#3d1209] hover:underline"
                  >
                    View Complete Audit Log →
                  </button>
                </div>
              </div>
            </div>

            {/* ================= 6. STAFF PERFORMANCE CARDS ================= */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Staff Operational Performance</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Top performing branch personnel by task completion & attendance</p>
                </div>
                <button
                  onClick={() => setActiveMenu('staff')}
                  className="text-xs font-semibold text-[#3d1209] hover:text-[#d97706] flex items-center gap-1 transition-colors"
                >
                  View All Staff <FaArrowRight className="text-[10px]" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {staffMembers.slice(0, 3).map(s => (
                  <div key={s.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-3.5 mb-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                        style={{ backgroundColor: s.avatarColor }}
                      >
                        {s.firstName[0]}{s.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{s.name}</p>
                        <p className="text-xs text-slate-500 truncate">{s.role} • {s.department}</p>
                      </div>
                      <span className="text-sm font-extrabold text-[#3d1209] shrink-0">{s.performance}</span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Task Completion Efficiency</span>
                        <span className="font-semibold text-slate-700">{s.tasks} duties</span>
                      </div>
                      <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#3d1209] to-[#f59e0b] rounded-full"
                          style={{ width: s.performance }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'staff':
        return activeSubMenu === 'add-staff' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 animate-fade-in">
            <AddStaffForm onCancel={() => setActiveSubMenu('view-staff')} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 animate-fade-in">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Management</h2>
                <p className="text-sm text-slate-500 mt-1">Manage Bunna Bank branch personnel, roles, and profiles</p>
              </div>
              <button
                onClick={() => setActiveSubMenu('add-staff')}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:bg-[#52180c] transition-all flex items-center gap-2 bg-[#3d1209] shadow-md shadow-[#3d1209]/20"
              >
                <FaUserPlus /> Add New Staff Member
              </button>
            </div>
            <StaffTable staffMembers={staffMembers} onAddStaff={() => setActiveSubMenu('add-staff')} />
          </div>
        );

      case 'task':
        return activeSubMenu === 'add-task' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 animate-fade-in">
            <AddTaskForm onCancel={() => setActiveSubMenu('view-task')} staffMembers={staffMembers} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 animate-fade-in">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Task & Duty Management</h2>
                <p className="text-sm text-slate-500 mt-1">Track, assign, and verify banking assignments</p>
              </div>
              <button
                onClick={() => setActiveSubMenu('add-task')}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:bg-[#52180c] transition-all flex items-center gap-2 bg-[#3d1209] shadow-md shadow-[#3d1209]/20"
              >
                <FaTasks /> Add New Task
              </button>
            </div>
            <TaskCard onAddTask={() => setActiveSubMenu('add-task')} />
          </div>
        );

      case 'TaskSchedule':
        return activeSubMenu === 'add-schedule' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 animate-fade-in">
            <TaskSchedule onClose={handleScheduleClose} staffMembers={staffMembers} tasks={tasks} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 animate-fade-in">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Schedule & Shift Rotations</h2>
                <p className="text-sm text-slate-500 mt-1">Plan and organize staff schedules and branch shifts</p>
              </div>
              <button
                onClick={() => setActiveSubMenu('add-schedule')}
                className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:bg-[#52180c] transition-all flex items-center gap-2 bg-[#3d1209] shadow-md shadow-[#3d1209]/20"
              >
                <FaCalendarAlt /> Create Shift Schedule
              </button>
            </div>
            <ScheduleTable refreshTrigger={false} />
          </div>
        );

      case 'profile':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 animate-fade-in">
            <ProfilePage user={currentUser} onUpdateProfile={updateUserProfile} />
          </div>
        );

      case 'settings':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 animate-fade-in">
            <SettingsPage user={currentUser} />
          </div>
        );

      case 'privacy':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 animate-fade-in">
            <PrivacyPage user={currentUser} />
          </div>
        );

      case 'reports':
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#3d1209]/10 rounded-2xl flex items-center justify-center text-[#3d1209]">
                <FaChartLine className="text-2xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Reports & Operational Audits</h2>
                <p className="text-sm text-slate-500">Generate executive workforce analysis and compliance sheets</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { title: 'Staff Performance & Efficiency Report', desc: 'Analyzes individual employee output, attendance regularity, and completion time.' },
                { title: 'Shift Coverage & Swapping Analysis', desc: 'Audit branch workforce balance, overtime hours, and coverage gaps.' },
                { title: 'Task Allocation & Velocity Summary', desc: 'Breakdown of department workload and resolution turnaround periods.' },
                { title: 'Monthly Department Attendance Log', desc: 'Official HR attendance sheets ready for executive export in PDF/Excel format.' }
              ].map(({ title, desc }) => (
                <div key={title} className="p-6 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition-all">
                  <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 mb-5 leading-relaxed">{desc}</p>
                  <button className="text-[#3d1209] font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                    <span>Generate Official Report</span> <FaArrowRight className="text-xs" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu={activeMenu}
        activeSubMenu={activeSubMenu}
        setActiveMenu={setActiveMenu}
        setActiveSubMenu={setActiveSubMenu}
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        user={currentUser}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-[260px]' : 'lg:ml-[74px]'}`}>
        <Header
          notifications={notifications}
          markNotificationAsRead={markNotificationAsRead}
          deleteNotification={deleteNotification}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onLogout={handleLogout}
          onProfileClick={() => { setActiveMenu('profile'); setActiveSubMenu(null); }}
          onSettingsClick={() => { setActiveMenu('settings'); setActiveSubMenu(null); }}
          onPrivacyClick={() => { setActiveMenu('privacy'); setActiveSubMenu(null); }}
          user={currentUser}
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-68px)]">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && <MobileBottomNav activeMenu={activeMenu} setActiveMenu={setActiveMenu} />}
      {/* Add padding when mobile nav is shown */}
      {isMobile && <div style={{ height: '72px' }} />}
    </div>
  );
};

export default Dashboard;
