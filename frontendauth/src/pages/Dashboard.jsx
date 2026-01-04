import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

import './Dashboard.css';

const Dashboard = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  
  // User state - This would typically come from your auth system
  const [currentUser, setCurrentUser] = useState({
    id: 'admin-001',
    fullName: 'Admin User',
    email: 'admin@bunnabank.com',
    phone: '+251 912 345 678',
    department: 'IT Department',
    position: 'System Administrator',
    joinDate: '2023-01-15',
    bio: 'Experienced IT professional specializing in system administration and task management solutions.',
    skills: ['System Administration', 'Task Management', 'JavaScript', 'React', 'Node.js']
  });
  
  // Create a local darkMode state if setDarkMode is not provided
  const [localDarkMode, setLocalDarkMode] = useState(darkMode || false);
  
  // Use the prop setDarkMode if available, otherwise use local state
  const effectiveDarkMode = darkMode !== undefined ? darkMode : localDarkMode;
  const effectiveSetDarkMode = setDarkMode || setLocalDarkMode;
  
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
      avatarColor: '#4f46e5' 
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
      avatarColor: '#10b981' 
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
      avatarColor: '#f59e0b' 
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
      avatarColor: '#8b5cf6' 
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
      avatarColor: '#3b82f6' 
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
      color: '#ef4444' 
    },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Task Assigned', message: 'You have been assigned to review quarterly reports', time: '10 min ago', read: false, type: 'task', icon: '📋' },
    { id: 2, title: 'Meeting Reminder', message: 'Team meeting at 2:00 PM today', time: '1 hour ago', read: false, type: 'meeting', icon: '👥' },
    { id: 3, title: 'Shift Change', message: 'Your shift has been updated for tomorrow', time: '3 hours ago', read: true, type: 'shift', icon: '🔄' },
    { id: 4, title: 'New Staff Member', message: 'John Doe has joined the team', time: '5 hours ago', read: true, type: 'staff', icon: '👤' },
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
      avatarColor: '#6b7280'
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
      color: '#f59e0b'
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

  // Update user profile when changes are made
  const updateUserProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  // Handler for Profile button in user menu
  const handleProfileClick = () => {
    setActiveMenu('profile');
    setActiveSubMenu(null);
  };

  // Handler for Settings button in user menu
  const handleSettingsClick = () => {
    setActiveMenu('settings');
    setActiveSubMenu(null);
  };

  // Handler for Privacy button in user menu
  const handlePrivacyClick = () => {
    setActiveMenu('privacy');
    setActiveSubMenu(null);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <WelcomeBanner 
              darkMode={effectiveDarkMode} 
              userName={currentUser.fullName}
            />
            <StatsCards 
              staffCount={staffMembers.length}
              activeTasks={tasks.filter(t => t.status !== 'completed').length}
              scheduleCount={0}
              pendingApprovals={4}
              darkMode={effectiveDarkMode}
            />
            <div className="dashboard-grid">
              <div className="quick-actions-full">
                <QuickActions 
                  onAddStaff={() => { setActiveMenu('staff'); setActiveSubMenu('add-staff'); }}
                  onAddTask={() => { setActiveMenu('task'); setActiveSubMenu('add-task'); }}
                  onScheduleTasks={() => { setActiveMenu('TaskSchedule'); setActiveSubMenu('add-schedule'); }}
                  onViewReports={() => setActiveMenu('reports')}
                  darkMode={effectiveDarkMode}
                />
              </div>
            </div>
          </div>
        );
      case 'staff':
        return activeSubMenu === 'add-staff' ? (
          <AddStaffForm 
            onCancel={() => setActiveSubMenu('view-staff')}
            darkMode={effectiveDarkMode}
          />
        ) : (
          <StaffTable 
            staffMembers={staffMembers}
            onAddStaff={addNewStaff}
            darkMode={effectiveDarkMode}
          />
        );
      case 'task':
        return activeSubMenu === 'add-task' ? (
          <AddTaskForm 
            onCancel={() => setActiveSubMenu('view-task')}
            staffMembers={staffMembers}
            darkMode={effectiveDarkMode}
          />
        ) : (
          <div className="tasks-grid">
            {tasks.map(task => (
              <TaskCard key={task.id} task={task} darkMode={effectiveDarkMode} />
            ))}
          </div>
        );
      case 'TaskSchedule':
        // Handle submenu selection
        if (activeSubMenu === 'add-schedule') {
          return (
            <TaskSchedule 
              onClose={handleScheduleClose}
              staffMembers={staffMembers}
              tasks={tasks}
              darkMode={effectiveDarkMode}
            />
          );
        } else {
          // Default to view schedule
          return (
            <ScheduleTable 
              darkMode={effectiveDarkMode}
              refreshTrigger={false}
            />
          );
        }
      case 'profile':
        return (
          <ProfilePage 
            user={currentUser}
            onUpdateProfile={updateUserProfile}
            darkMode={effectiveDarkMode}
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            user={currentUser}
            darkMode={effectiveDarkMode}
            currentDarkMode={effectiveDarkMode}
            onDarkModeToggle={effectiveSetDarkMode}
          />
        );
      case 'privacy':
        return (
          <PrivacyPage 
            user={currentUser}
            darkMode={effectiveDarkMode}
          />
        );
      case 'reports':
        return (
          <div className="dashboard-content">
            <h2 className={effectiveDarkMode ? 'text-white' : 'text-dark'}>Reports</h2>
            <p className={effectiveDarkMode ? 'text-gray-300' : 'text-gray-700'}>Reports section will be implemented here.</p>
          </div>
        );
      default:
        return (
          <div className="dashboard-content">
            <WelcomeBanner 
              darkMode={effectiveDarkMode} 
              userName={currentUser.fullName}
            />
            <StatsCards 
              staffCount={staffMembers.length}
              activeTasks={tasks.filter(t => t.status !== 'completed').length}
              scheduleCount={0}
              pendingApprovals={4}
              darkMode={effectiveDarkMode}
            />
          </div>
        );
    }
  };

  return (
    <div className={`dashboard-container ${effectiveDarkMode ? 'dark' : 'light'}`}>
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
      
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'} ${effectiveDarkMode ? 'dark' : 'light'}`}>
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
        
        <main className={`main-section ${effectiveDarkMode ? 'dark' : 'light'}`}>
          <div className="content-wrapper">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;