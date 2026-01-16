import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Icons - Using 'lucide-react' is recommended for modern UIs,
// but mapping to standard fa/fi icons for compatibility if you don't have lucide installed.
import {
  FiGrid,
  FiUsers,
  FiCheckSquare,
  FiCalendar,
  FiSettings,
  FiShield,
  FiUser,
  FiActivity,
} from "react-icons/fi";

// Components
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import WelcomeBanner from "../components/Dashboard/WelcomeBanner";
import StatsCards from "../components/Dashboard/StatsCards";
import QuickActions from "../components/Dashboard/QuickActions";
import StaffTable from "../components/Staff/StaffTable";
import AddStaffForm from "../components/Staff/AddStaffForm";
import TaskCard from "../components/Tasks/TaskCard";
import AddTaskForm from "../components/Tasks/AddTaskForm";
import TaskSchedule from "../components/Schedule/TaskSchedule";
import ScheduleTable from "../components/Schedule/ScheduleTable";
import ProfilePage from "../components/Header/ProfilePage";
import SettingsPage from "../components/Header/SettingsPage";
import PrivacyPage from "../components/Header/PrivacyPage";

const Dashboard = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  // Layout State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Navigation State
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // User State (Mock Data)
  const [currentUser, setCurrentUser] = useState({
    id: "admin-001",
    fullName: "Admin User",
    email: "admin@bunnabank.com",
    position: "System Administrator",
    department: "IT Department",
    avatar: null, // Could add URL
    role: "admin",
  });

  // Dark Mode Logic (Robust fallback)
  const [localDarkMode, setLocalDarkMode] = useState(darkMode || false);
  const isDark = darkMode !== undefined ? darkMode : localDarkMode;
  const toggleTheme = setDarkMode || setLocalDarkMode;

  // --- Data Management (Mock) ---
  const [staffMembers, setStaffMembers] = useState([
    {
      id: "1",
      name: "John Doe",
      role: "Bank Manager",
      department: "Management",
      email: "john@bunnabank.com",
      status: "active",
      avatarColor: "#4f46e5",
    },
    {
      id: "2",
      name: "Jane Smith",
      role: "Loan Officer",
      department: "Loans",
      email: "jane@bunnabank.com",
      status: "active",
      avatarColor: "#10b981",
    },
    {
      id: "3",
      name: "Robert Johnson",
      role: "Teller",
      department: "Customer Service",
      email: "robert@bunnabank.com",
      status: "on leave",
      avatarColor: "#f59e0b",
    },
  ]);

  const [tasks, setTasks] = useState([
    {
      id: "1",
      title: "Review Loan Applications",
      description: "Q1 Corporate Loans",
      priority: "high",
      status: "pending",
      progress: 60,
      deadline: "Today, 5:00 PM",
    },
    {
      id: "2",
      title: "ATM Maintenance",
      description: "Downtown Branch",
      priority: "medium",
      status: "in-progress",
      progress: 30,
      deadline: "Tomorrow",
    },
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "System Update",
      message: "Maintenance scheduled for 2 AM",
      time: "10 min ago",
      read: false,
      type: "system",
    },
    {
      id: 2,
      title: "New Applicant",
      message: "Review required for Sr. Teller",
      time: "1 hour ago",
      read: false,
      type: "hr",
    },
  ]);

  // --- Effects ---

  // Responsive Layout Handler
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      if (width < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Init
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Handlers ---

  const handleLogout = () => navigate("/login");

  const handleAction = (menu, subMenu = null) => {
    setActiveMenu(menu);
    setActiveSubMenu(subMenu);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- Render Logic ---

  const renderContent = () => {
    // Wrapper for consistent padding and animation
    const ContentWrapper = ({ children, title, subtitle }) => (
      <div className="animate-fade-in-up space-y-6">
        {(title || subtitle) && (
          <div className="flex flex-col gap-1 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
            {title && (
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    );

    switch (activeMenu) {
      case "dashboard":
        return (
          <div className="animate-fade-in space-y-6">
            <WelcomeBanner
              darkMode={isDark}
              userName={currentUser.fullName}
              date={new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />

            {/* Bento Grid Layout for Dashboard Widgets */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 xl:col-span-8 space-y-6">
                <StatsCards
                  staffCount={staffMembers.length}
                  activeTasks={
                    tasks.filter((t) => t.status !== "completed").length
                  }
                  scheduleCount={12}
                  pendingApprovals={4}
                  darkMode={isDark}
                />
                {/* Placeholder for a Chart or Main Widget if you had one */}
                <div
                  className={`p-6 rounded-2xl border ${
                    isDark
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className={`font-semibold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Recent Activity
                    </h3>
                    <button className="text-sm text-blue-600 hover:text-blue-500">
                      View All
                    </button>
                  </div>
                  <div
                    className={`h-48 flex items-center justify-center border-2 border-dashed rounded-xl ${
                      isDark
                        ? "border-slate-700 bg-slate-800/50"
                        : "border-slate-100 bg-slate-50"
                    }`}
                  >
                    <p className="text-slate-400 text-sm">
                      Activity Chart Visualization
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-12 xl:col-span-4">
                <QuickActions
                  onAddStaff={() => handleAction("staff", "add-staff")}
                  onAddTask={() => handleAction("task", "add-task")}
                  onScheduleTasks={() =>
                    handleAction("TaskSchedule", "add-schedule")
                  }
                  onViewReports={() => handleAction("reports")}
                  darkMode={isDark}
                />
              </div>
            </div>
          </div>
        );

      case "staff":
        return (
          <ContentWrapper
            title="Staff Management"
            subtitle="Manage employees, roles, and permissions"
          >
            {activeSubMenu === "add-staff" ? (
              <AddStaffForm
                onCancel={() => handleAction("staff")}
                darkMode={isDark}
              />
            ) : (
              <StaffTable
                staffMembers={staffMembers}
                onAddStaff={() => handleAction("staff", "add-staff")} // Pass as function
                darkMode={isDark}
              />
            )}
          </ContentWrapper>
        );

      case "task":
        return (
          <ContentWrapper
            title="Task Center"
            subtitle="Track project progress and assignments"
          >
            {activeSubMenu === "add-task" ? (
              <AddTaskForm
                onCancel={() => handleAction("task")}
                staffMembers={staffMembers}
                darkMode={isDark}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <TaskCard key={task.id} task={task} darkMode={isDark} />
                ))}
                {/* Empty State / Add New Card */}
                <button
                  onClick={() => handleAction("task", "add-task")}
                  className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all duration-300 group ${
                    isDark
                      ? "border-slate-700 hover:border-blue-500 hover:bg-slate-800"
                      : "border-slate-300 hover:border-blue-500 hover:bg-blue-50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">+</span>
                  </div>
                  <span className="font-medium text-slate-500 group-hover:text-blue-600">
                    Create New Task
                  </span>
                </button>
              </div>
            )}
          </ContentWrapper>
        );

      case "TaskSchedule":
        return (
          <ContentWrapper
            title="Schedule & Shifts"
            subtitle="Organize timeline and resource allocation"
          >
            {activeSubMenu === "add-schedule" ? (
              <TaskSchedule
                onClose={() => handleAction("dashboard")}
                staffMembers={staffMembers}
                tasks={tasks}
                darkMode={isDark}
              />
            ) : (
              <ScheduleTable darkMode={isDark} refreshTrigger={false} />
            )}
          </ContentWrapper>
        );

      case "profile":
        return (
          <ContentWrapper>
            <ProfilePage
              user={currentUser}
              onUpdateProfile={setCurrentUser}
              darkMode={isDark}
            />
          </ContentWrapper>
        );

      case "settings":
        return (
          <ContentWrapper>
            <SettingsPage
              user={currentUser}
              darkMode={isDark}
              currentDarkMode={isDark}
              onDarkModeToggle={toggleTheme}
            />
          </ContentWrapper>
        );

      case "privacy":
        return (
          <ContentWrapper>
            <PrivacyPage user={currentUser} darkMode={isDark} />
          </ContentWrapper>
        );

      case "reports":
        return (
          <ContentWrapper
            title="Analytics & Reports"
            subtitle="Financial and operational insights"
          >
            <div
              className={`p-12 text-center rounded-3xl border border-dashed ${
                isDark
                  ? "border-slate-700 bg-slate-800/50"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <FiActivity className="mx-auto text-4xl text-slate-400 mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                Reports Module Coming Soon
              </h3>
              <p className="text-slate-500 mt-2">
                We are currently aggregating data for the new financial year.
              </p>
            </div>
          </ContentWrapper>
        );

      default:
        return null;
    }
  };

  // --- Main Layout Render ---

  return (
    <div
      className={`min-h-screen font-sans antialiased selection:bg-blue-500 selection:text-white ${
        isDark ? "dark bg-[#0F172A]" : "bg-[#F8FAFC]"
      }`}
    >
      {/* Sidebar - Fixed Position */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={isDark}
        activeMenu={activeMenu}
        activeSubMenu={activeSubMenu}
        setActiveMenu={setActiveMenu}
        setActiveSubMenu={setActiveSubMenu}
        isMobile={screenWidth < 768}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content Area - Responsive Margin */}
      <div
        className={`transition-[margin] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          sidebarOpen ? "lg:ml-72" : "lg:ml-20"
        }`}
      >
        {/* Sticky Header with Blur */}
        <Header
          darkMode={isDark}
          setDarkMode={toggleTheme}
          notifications={notifications}
          markNotificationAsRead={(id) =>
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            )
          }
          deleteNotification={(id) =>
            setNotifications((prev) => prev.filter((n) => n.id !== id))
          }
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onLogout={handleLogout}
          onProfileClick={() => handleAction("profile")}
          onSettingsClick={() => handleAction("settings")}
          onPrivacyClick={() => handleAction("privacy")}
          user={currentUser}
          isMobile={screenWidth < 768}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Scrollable Main Content */}
        <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>

        {/* Footer (Optional, Professional touch) */}
        <footer
          className={`py-6 px-8 text-center text-xs ${
            isDark ? "text-slate-600" : "text-slate-400"
          }`}
        >
          <p>
            &copy; 2026 Bunna Bank Internal Systems. Confidential & Proprietary.
          </p>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
