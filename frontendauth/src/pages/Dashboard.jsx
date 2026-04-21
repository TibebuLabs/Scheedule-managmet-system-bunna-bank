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
import {
  FaBell, FaChartLine, FaUsers, FaTasks, FaCalendarAlt,
  FaArrowRight, FaCheckCircle, FaClock, FaExclamationTriangle,
  FaUserPlus, FaClipboardList, FaFileAlt, FaRegClock
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
    { id:'2', firstName:'Jane', lastName:'Smith', name:'Jane Smith', role:'Loan Officer', department:'Loans', email:'jane@bunnabank.com', phone:'+251 911 234 568', status:'active', avatarColor:'#3d1209', performance:'95%', tasks:8 },
    { id:'3', firstName:'Robert', lastName:'Johnson', name:'Robert Johnson', role:'Teller', department:'Customer Service', email:'robert@bunnabank.com', phone:'+251 911 234 569', status:'on leave', avatarColor:'#f59e0b', performance:'92%', tasks:5 },
    { id:'4', firstName:'Sarah', lastName:'Williams', name:'Sarah Williams', role:'Financial Advisor', department:'Investments', email:'sarah@bunnabank.com', phone:'+251 911 234 570', status:'active', avatarColor:'#3d1209', performance:'96%', tasks:10 },
    { id:'5', firstName:'Michael', lastName:'Brown', name:'Michael Brown', role:'IT Specialist', department:'IT Support', email:'michael@bunnabank.com', phone:'+251 911 234 571', status:'active', avatarColor:'#3d1209', performance:'99%', tasks:15 },
  ]);

  const [tasks, setTasks] = useState([
    { id:'1', title:'Review Customer Applications', description:'Review and approve pending customer loan applications', assignedTo:'John Doe', priority:'high', deadline:'Today, 5:00 PM', status:'pending', color:'#ef4444' },
    { id:'2', title:'Process Loan Documents', description:'Process and verify loan documents', assignedTo:'Jane Smith', priority:'medium', deadline:'Tomorrow, 3:00 PM', status:'in-progress', color:'#3d1209' },
    { id:'3', title:'Update Customer Records', description:'Update customer information in the database', assignedTo:'Sarah Williams', priority:'low', deadline:'Next Week', status:'pending', color:'#10b981' },
    { id:'4', title:'Prepare Monthly Reports', description:'Compile and analyze monthly financial data', assignedTo:'Michael Brown', priority:'high', deadline:'Friday, 5:00 PM', status:'pending', color:'#3d1209' },
  ]);

  const [notifications, setNotifications] = useState([
    { id:1, title:'New Task Assigned', message:'You have been assigned to review quarterly reports', time:'10 min ago', read:false, icon:'📋' },
    { id:2, title:'Meeting Reminder', message:'Team meeting at 2:00 PM today', time:'1 hour ago', read:false, icon:'👥' },
    { id:3, title:'Shift Change', message:'Your shift has been updated for tomorrow', time:'3 hours ago', read:true, icon:'🔄' },
    { id:4, title:'New Staff Member', message:'John Doe has joined the team', time:'5 hours ago', read:true, icon:'👤' },
    { id:5, title:'System Update', message:'System maintenance scheduled for tonight', time:'2 hours ago', read:false, icon:'⚙️' },
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

  const card = 'bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow';

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="space-y-5">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#3d1209] to-[#5a1b0e] p-6 md:p-8">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage:`url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.3'%3E%3Cpath d='M20 20h4v4h-4zm-8 0h4v4h-4zm16 0h4v4h-4z'/%3E%3C/g%3E%3C/svg%3E")`, backgroundSize:'40px' }} />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-amber-300 text-sm font-medium mb-1 uppercase tracking-wider">Bunna Bank Staff Portal</p>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                    Good {new Date().getHours() < 12 ? 'Morning' : 'Afternoon'}, {currentUser.fullName}
                  </h1>
                  <p className="text-amber-100/70 text-sm">Here's your dashboard overview for today.</p>
                </div>
                <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                  <p className="text-amber-200 text-xs font-medium">Today</p>
                  <p className="text-white font-semibold">{new Date().toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={card}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 bg-[#3d1209]/10 rounded-lg flex items-center justify-center">
                    <FaUsers className="text-[#3d1209] text-lg" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{activeStaff} active</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{staffMembers.length}</p>
                <p className="text-sm text-gray-500 mt-0.5">Total Staff</p>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full">
                  <div className="h-full bg-[#3d1209] rounded-full" style={{ width:`${(activeStaff/staffMembers.length)*100}%` }} />
                </div>
              </div>

              <div className={card}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <FaTasks className="text-amber-600 text-lg" />
                  </div>
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{highPriorityTasks} high</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                <p className="text-sm text-gray-500 mt-0.5">Total Tasks</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><FaCheckCircle className="text-emerald-500" />{completedTasks} done</span>
                  <span className="flex items-center gap-1"><FaClock className="text-amber-500" />{pendingTasks} pending</span>
                </div>
              </div>

              <div className={card}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <FaCalendarAlt className="text-emerald-600 text-lg" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Today</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-sm text-gray-500 mt-0.5">Scheduled Events</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                  <FaRegClock className="text-emerald-500" />
                  <span>Next: Team Meeting 2PM</span>
                </div>
              </div>

              <div className={card}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-11 h-11 bg-[#3d1209]/10 rounded-lg flex items-center justify-center">
                    <FaClipboardList className="text-[#3d1209] text-lg" />
                  </div>
                  <span className="text-xs font-semibold text-[#3d1209] bg-[#3d1209]/10 px-2 py-0.5 rounded-full">Urgent</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">4</p>
                <p className="text-sm text-gray-500 mt-0.5">Pending Approvals</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                  <FaExclamationTriangle className="text-orange-500" />
                  <span>2 require attention</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label:'Add Staff', sub:'Invite team member', icon:FaUserPlus, color:'from-[#3d1209] to-[#5a1b0e]', action:() => { setActiveMenu('staff'); setActiveSubMenu('add-staff'); } },
                { label:'Create Task', sub:'Assign new task', icon:FaTasks, color:'from-amber-600 to-amber-700', action:() => { setActiveMenu('task'); setActiveSubMenu('add-task'); } },
                { label:'Schedule', sub:'Plan your day', icon:FaCalendarAlt, color:'from-emerald-600 to-emerald-700', action:() => { setActiveMenu('TaskSchedule'); setActiveSubMenu('add-schedule'); } },
                { label:'Reports', sub:'View analytics', icon:FaFileAlt, color:'from-[#3d1209] to-[#5a1b0e]', action:() => setActiveMenu('reports') },
              ].map(({ label, sub, icon: Icon, color, action }) => (
                <button key={label} onClick={action}
                  className={`group bg-gradient-to-r ${color} text-white rounded-xl p-4 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}>
                  <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                    <Icon className="text-white" />
                  </div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-white/65 mt-0.5">{sub}</p>
                </button>
              ))}
            </div>

            {/* Recent Tasks + Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className={`lg:col-span-2 ${card}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Recent Tasks</h3>
                  <button onClick={() => setActiveMenu('task')} className="text-xs text-[#3d1209] font-medium flex items-center gap-1 hover:underline">
                    View All <FaArrowRight className="text-[10px]" />
                  </button>
                </div>
                <div className="space-y-2">
                  {tasks.slice(0,3).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.color }} />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{task.title}</p>
                          <p className="text-xs text-gray-400">{task.assignedTo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${task.priority==='high'?'bg-red-50 text-red-600':task.priority==='medium'?'bg-amber-50 text-amber-600':'bg-green-50 text-green-600'}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-400 hidden sm:block">{task.deadline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={card}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">Activity</h3>
                  <FaBell className="text-[#3d1209] text-sm" />
                </div>
                <div className="space-y-3">
                  {notifications.slice(0,4).map(n => (
                    <div key={n.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${n.read?'bg-gray-100':'bg-[#3d1209]/10'}`}>
                        {n.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${n.read?'text-gray-500':'text-gray-800 font-medium'}`}>{n.title}</p>
                        <p className="text-xs text-gray-400">{n.time}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 bg-[#3d1209] rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Staff Performance */}
            <div className={card}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Staff Performance</h3>
                <button className="text-xs text-[#3d1209] font-medium hover:underline">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {staffMembers.slice(0,3).map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: s.avatarColor }}>
                      {s.firstName[0]}{s.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                      <p className="text-xs text-gray-400 truncate">{s.role}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#3d1209]">{s.performance}</p>
                      <p className="text-xs text-gray-400">{s.tasks} tasks</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'staff':
        return activeSubMenu === 'add-staff' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <AddStaffForm onCancel={() => setActiveSubMenu('view-staff')} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Staff Management</h2>
                <p className="text-sm text-gray-500 mt-0.5">Manage your team members and their roles</p>
              </div>
              <button onClick={() => setActiveSubMenu('add-staff')}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2 bg-[#3d1209]">
                <FaUserPlus /> Add New Staff
              </button>
            </div>
            <StaffTable staffMembers={staffMembers} onAddStaff={() => setActiveSubMenu('add-staff')} />
          </div>
        );

      case 'task':
        return activeSubMenu === 'add-task' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <AddTaskForm onCancel={() => setActiveSubMenu('view-task')} staffMembers={staffMembers} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Task Management</h2>
                <p className="text-sm text-gray-500 mt-0.5">Track and manage all tasks</p>
              </div>
              <button onClick={() => setActiveSubMenu('add-task')}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2 bg-[#3d1209]">
                <FaTasks /> Add New Task
              </button>
            </div>
            <TaskCard onAddTask={() => setActiveSubMenu('add-task')} />
          </div>
        );

      case 'TaskSchedule':
        return activeSubMenu === 'add-schedule' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <TaskSchedule onClose={handleScheduleClose} staffMembers={staffMembers} tasks={tasks} />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Schedule Management</h2>
                <p className="text-sm text-gray-500 mt-0.5">Plan and organize staff schedules</p>
              </div>
              <button onClick={() => setActiveSubMenu('add-schedule')}
                className="px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-all flex items-center gap-2 bg-[#3d1209]">
                <FaCalendarAlt /> Create Schedule
              </button>
            </div>
            <ScheduleTable refreshTrigger={false} />
          </div>
        );

      case 'profile':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <ProfilePage user={currentUser} onUpdateProfile={updateUserProfile} />
          </div>
        );

      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <SettingsPage user={currentUser} />
          </div>
        );

      case 'privacy':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <PrivacyPage user={currentUser} />
          </div>
        );

      case 'reports':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-[#3d1209]/10 rounded-lg flex items-center justify-center">
                <FaChartLine className="text-[#3d1209]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Reports & Analytics</h2>
                <p className="text-sm text-gray-500">View detailed reports and insights</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Staff Performance Report', 'Task Completion Report'].map(title => (
                <div key={title} className="p-5 bg-[#3d1209]/5 rounded-xl border border-[#3d1209]/10">
                  <h3 className="font-semibold text-gray-800 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 mb-4">Analyze metrics and generate insights</p>
                  <button className="text-[#3d1209] font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    Generate Report <FaArrowRight className="text-xs" />
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
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
        activeMenu={activeMenu} activeSubMenu={activeSubMenu}
        setActiveMenu={setActiveMenu} setActiveSubMenu={setActiveSubMenu}
        isMobile={isMobile} mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-[72px]'}`}>
        <Header
          notifications={notifications}
          markNotificationAsRead={markNotificationAsRead}
          deleteNotification={deleteNotification}
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          onLogout={handleLogout}
          onProfileClick={() => { setActiveMenu('profile'); setActiveSubMenu(null); }}
          onSettingsClick={() => { setActiveMenu('settings'); setActiveSubMenu(null); }}
          onPrivacyClick={() => { setActiveMenu('privacy'); setActiveSubMenu(null); }}
          user={currentUser} isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
        />

        <main className="p-4 md:p-6 min-h-[calc(100vh-68px)]">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 flex justify-around z-50 shadow-lg">
          {[
            { id:'dashboard', icon:'🏠', label:'Home' },
            { id:'staff', icon:'👥', label:'Staff' },
            { id:'task', icon:'✅', label:'Tasks' },
            { id:'TaskSchedule', icon:'📅', label:'Schedule' },
          ].map(({ id, icon, label }) => (
            <button key={id} onClick={() => setActiveMenu(id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeMenu===id?'text-[#3d1209]':'text-gray-500'}`}>
              <span className="text-xl">{icon}</span>
              <span className="text-xs mt-0.5 font-medium">{label}</span>
            </button>
          ))}
        </div>
      )}
      {isMobile && <div className="h-16" />}
    </div>
  );
};

export default Dashboard;
