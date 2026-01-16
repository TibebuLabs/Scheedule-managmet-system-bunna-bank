import React, { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  CalendarClock,
  BarChart3,
  Settings,
  ChevronLeft,
  Menu,
  PlusCircle,
  Eye,
  LogOut,
} from "lucide-react";
import MenuItem from "./MenuItem";
import bunnaBankLogo from "../../assets/bunnab.png"; // Ensure path is correct

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  activeMenu,
  activeSubMenu,
  setActiveMenu,
  setActiveSubMenu,
  isMobile,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      submenu: [],
    },
    {
      id: "staff",
      label: "Staff Management",
      icon: Users,
      submenu: [
        { id: "add-staff", label: "Register Staff" },
        { id: "view-staff", label: "Staff Directory" },
      ],
    },
    {
      id: "task",
      label: "Tasks",
      icon: CheckSquare,
      submenu: [
        { id: "add-task", label: "Create Task" },
        { id: "view-task", label: "All Tasks" },
      ],
    },
    {
      id: "TaskSchedule",
      label: "Schedule",
      icon: CalendarClock,
      submenu: [
        { id: "add-schedule", label: "New Schedule" },
        { id: "view-schedule", label: "Calendar View" },
      ],
    },
    {
      id: "reports",
      label: "Analytics",
      icon: BarChart3,
      submenu: [],
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      submenu: [],
    },
  ];

  // Auto-close on mobile selection
  const handleItemClick = () => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobile && mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen, isMobile]);

  // Classes for container width transition
  const sidebarWidthClass =
    sidebarOpen || (isMobile && mobileMenuOpen) ? "w-64" : "w-20";
  const mobileTranslateClass = isMobile
    ? mobileMenuOpen
      ? "translate-x-0"
      : "-translate-x-full"
    : "translate-x-0";

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
          transition-all duration-300 ease-out flex flex-col shadow-xl lg:shadow-none
          ${sidebarWidthClass}
          ${mobileTranslateClass}
        `}
      >
        {/* --- Header / Logo Section --- */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-8 h-8 flex-shrink-0">
              <img
                src={bunnaBankLogo}
                alt="Logo"
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>

            <div
              className={`
              flex flex-col transition-opacity duration-200
              ${!sidebarOpen && !isMobile ? "opacity-0 w-0" : "opacity-100"}
            `}
            >
              <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Bunna Bank
              </h1>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Staff Portal
              </span>
            </div>
          </div>

          {/* Desktop Collapse Button */}
          {!isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              <ChevronLeft
                size={18}
                className={`transition-transform duration-300 ${
                  !sidebarOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>

        {/* --- Navigation Items --- */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
          <nav>
            <ul>
              {menuItems.map((item) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  sidebarOpen={sidebarOpen}
                  activeMenu={activeMenu}
                  activeSubMenu={activeSubMenu}
                  setActiveMenu={setActiveMenu}
                  setActiveSubMenu={setActiveSubMenu}
                  darkMode={darkMode}
                  isMobile={isMobile}
                />
              ))}
            </ul>
          </nav>
        </div>

        {/* --- Footer / User Profile --- */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div
            className={`flex items-center gap-3 ${
              !sidebarOpen && !isMobile ? "justify-center" : ""
            }`}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                A
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </div>

            {(sidebarOpen || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                  Admin User
                </p>
                <p className="text-xs text-slate-500 truncate">
                  System Administrator
                </p>
              </div>
            )}

            {(sidebarOpen || isMobile) && (
              <button
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
