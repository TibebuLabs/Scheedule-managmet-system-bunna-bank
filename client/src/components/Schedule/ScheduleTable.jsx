import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  Download,
  Trash2,
  Edit,
  Eye,
  Send,
  RefreshCw,
  Layers,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const ScheduleTable = ({ darkMode, refreshTrigger }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'calendar'
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    type: "all",
  });
  const [activeMenu, setActiveMenu] = useState(null); // ID of open dropdown
  const [selectedIds, setSelectedIds] = useState([]);

  // --- Fetch Data ---
  useEffect(() => {
    fetchSchedules();
  }, [refreshTrigger]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/schedules`);
      if (response.data.success) {
        setSchedules(response.data.schedules || []);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error("Fetch Error", error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers ---
  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "in progress":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const getPriorityIcon = (priority) => {
    if (priority === "urgent" || priority === "high")
      return <AlertCircle size={14} className="text-red-500" />;
    return <Clock size={14} className="text-slate-400" />;
  };

  // const filteredData = schedules.filter((item) => {
  //   const matchesSearch = item.taskTitle
  //     .toLowerCase()
  //     .includes(filters.search.toLowerCase());
  //   const matchesStatus =
  //     filters.status === "all" || item.status === filters.status;
  //   return matchesSearch && matchesStatus;
  // });
  const filteredData = (schedules || []).filter((item) => {
    // Safe navigation for properties in case item data is incomplete
    const title = item.taskTitle || "";
    const search = filters.search || "";

    const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filters.status === "all" || item.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  // --- Actions ---
  const handleBulkAction = (action) => {
    if (
      !window.confirm(
        `Are you sure you want to ${action} ${selectedIds.length} items?`,
      )
    )
      return;
    console.log(`Performing ${action} on`, selectedIds);
    // Add API call here
    setSelectedIds([]);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Schedule Report", 14, 20);
    doc.autoTable({
      head: [["Task", "Date", "Type", "Status", "Staff Count"]],
      body: filteredData.map((s) => [
        s.taskTitle,
        new Date(s.scheduledDate).toLocaleDateString(),
        s.scheduleType,
        s.status,
        s.assignments.length,
      ]),
      startY: 30,
    });
    doc.save("schedules.pdf");
  };

  // --- Render ---
  return (
    <div
      className={`space-y-6 ${darkMode ? "text-slate-200" : "text-slate-800"}`}
    >
      {/* 1. Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Scheduled"
          value={schedules?.length}
          icon={Layers}
          color="blue"
          darkMode={darkMode}
        />
        <StatCard
          title="In Progress"
          value={schedules?.filter((s) => s.status === "in progress")?.length}
          icon={RefreshCw}
          color="yellow"
          darkMode={darkMode}
        />
        <StatCard
          title="Completed"
          value={schedules?.filter((s) => s.status === "completed").length}
          icon={CheckCircle}
          color="emerald"
          darkMode={darkMode}
        />
        <StatCard
          title="Urgent"
          value={schedules?.filter((s) => s.priority === "high").length}
          icon={AlertCircle}
          color="red"
          darkMode={darkMode}
        />
      </div>

      {/* 2. Controls & Filters */}
      <div
        className={`p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 items-center justify-between ${
          darkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all border-slate-300 dark:border-slate-600"
            />
          </div>
          <div className="relative">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="pl-9 pr-8 py-2 rounded-lg border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none appearance-none border-slate-300 dark:border-slate-600 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={14}
            />
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {selectedIds.length > 0 && (
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-4 py-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              Delete ({selectedIds.length})
            </button>
          )}
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <Download size={16} /> Export
          </button>
          <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "table"
                  ? "bg-white dark:bg-slate-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <Layers size={18} />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "calendar"
                  ? "bg-white dark:bg-slate-600 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              <Calendar size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Content View */}
      {viewMode === "table" ? (
        <div
          className={`rounded-xl shadow-sm border overflow-hidden ${
            darkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead
                className={`text-xs uppercase font-semibold ${
                  darkMode
                    ? "bg-slate-900/50 text-slate-400"
                    : "bg-slate-50 text-slate-500"
                }`}
              >
                <tr>
                  <th className="p-4 w-4">
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setSelectedIds(
                          e.target.checked
                            ? filteredData.map((d) => d._id)
                            : [],
                        )
                      }
                      checked={
                        selectedIds.length === filteredData.length &&
                        filteredData.length > 0
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="p-4">Task Details</th>
                  <th className="p-4">Timeline</th>
                  <th className="p-4">Assigned Team</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      Loading schedules...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-500">
                      No schedules found matching filters.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((schedule) => (
                    <tr
                      key={schedule._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(schedule._id)}
                          onChange={() =>
                            setSelectedIds((prev) =>
                              prev.includes(schedule._id)
                                ? prev.filter((id) => id !== schedule._id)
                                : [...prev, schedule._id],
                            )
                          }
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {schedule.taskTitle}
                        </div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]">
                          {schedule.taskDescription}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {getPriorityIcon(schedule.priority)}
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {schedule.priority}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(
                            schedule.scheduledDate,
                          ).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 capitalize">
                          {schedule.scheduleType} recurrence
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex -space-x-2 overflow-hidden">
                          {schedule.assignments?.slice(0, 3).map((staff, i) => (
                            <div
                              key={i}
                              className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800 bg-slate-200 items-center justify-center text-xs font-bold text-slate-600"
                              title={staff.staffName}
                            >
                              {staff.staffName[0]}
                            </div>
                          ))}
                          {schedule.assignments?.length > 3 && (
                            <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-800 bg-slate-100 items-center justify-center text-xs font-bold text-slate-500">
                              +{schedule.assignments.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyle(
                            schedule.status,
                          )} border-transparent`}
                        >
                          {schedule.status}
                        </span>
                      </td>
                      <td className="p-4 text-right relative">
                        <button
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === schedule._id ? null : schedule._id,
                            )
                          }
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenu === schedule._id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenu(null)}
                            ></div>
                            <div
                              className={`absolute right-4 top-12 z-20 w-40 rounded-xl shadow-xl border py-1 ${
                                darkMode
                                  ? "bg-slate-800 border-slate-700"
                                  : "bg-white border-slate-200"
                              }`}
                            >
                              <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2">
                                <Eye size={14} /> View Details
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2">
                                <Edit size={14} /> Edit
                              </button>
                              <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2">
                                <Send size={14} /> Send Reminder
                              </button>
                              <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                              <button className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2">
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Simple Pagination */}
          <div
            className={`p-4 border-t flex items-center justify-between text-sm ${
              darkMode
                ? "border-slate-700 bg-slate-800"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <span className="text-slate-500">
              Showing {filteredData.length} entries
            </span>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50"
                disabled
              >
                Prev
              </button>
              <button className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700">
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Calendar View Placeholder (Can be expanded with full calendar logic)
        <div
          className={`p-8 rounded-xl border text-center ${
            darkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="bg-slate-50 dark:bg-slate-900 p-3 text-sm font-semibold text-center"
              >
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 h-32 p-2 relative hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
              >
                <span className="text-xs text-slate-400 absolute top-2 right-2">
                  {i + 1}
                </span>
                {i === 2 && (
                  <div className="mt-4 text-[10px] bg-blue-100 text-blue-700 p-1 rounded truncate">
                    Refill ATM (Mike)
                  </div>
                )}
                {i === 15 && (
                  <div className="mt-4 text-[10px] bg-emerald-100 text-emerald-700 p-1 rounded truncate">
                    Audit (Team)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub Component: Stat Card ---
const StatCard = ({ title, value, icon: Icon, color, darkMode }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    yellow:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    emerald:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <div
      className={`p-4 rounded-xl shadow-sm border flex items-center gap-4 transition-all hover:-translate-y-1 ${
        darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
      }`}
    >
      <div className={`p-3 rounded-lg ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <h4 className="text-slate-500 text-xs font-medium uppercase tracking-wider">
          {title}
        </h4>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default ScheduleTable;
