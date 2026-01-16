import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  Users,
  Mail,
  CheckCircle,
  AlertCircle,
  FileText,
  ArrowRight,
  Shield,
  RefreshCw,
  X,
  ChevronRight,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const TaskSchedule = ({ darkMode, onClose }) => {
  // --- State Management ---
  const [formData, setFormData] = useState({
    scheduleType: "daily",
    selectedStaff: [],
    selectedTask: "",
    taskDescription: "",
    priority: "medium",
    estimatedHours: 2,
    sendEmail: true,
    recurrence: "once",
    notes: "",
    startDate: "",
    endDate: "",
  });

  const [uiState, setUiState] = useState({
    loading: false,
    dataLoading: true,
    error: "",
    success: "",
    selectedDate: new Date().toISOString().split("T")[0],
    staffWeeklyLoad: {},
    emailPreview: null,
  });

  const [data, setData] = useState({
    staff: [],
    tasks: [],
  });

  // --- Utilities ---
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const week1 = new Date(d.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(
        ((d.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7
      )
    );
  };

  const getAvatarColor = (id) => {
    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-rose-500",
    ];
    return colors[String(id).charCodeAt(0) % colors.length];
  };

  // --- Data Fetching ---
  useEffect(() => {
    const initData = async () => {
      try {
        const [staffRes, tasksRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/staff/all`),
          axios.get(`${API_BASE_URL}/tasks`),
        ]);

        if (staffRes.data.success && tasksRes.data.success) {
          setData({
            staff: staffRes.data.employees,
            tasks: tasksRes.data.tasks.map((t) => ({ ...t, id: t._id })),
          });

          // Simulate Load Data
          const loadMap = {};
          staffRes.data.employees.forEach((s) => {
            loadMap[s._id] = {
              totalTasks: Math.floor(Math.random() * 3),
              totalHours: Math.floor(Math.random() * 10),
            };
          });
          setUiState((prev) => ({
            ...prev,
            staffWeeklyLoad: loadMap,
            dataLoading: false,
          }));
        }
      } catch (err) {
        console.error("Fetch Error", err);
        setUiState((prev) => ({
          ...prev,
          error: "Failed to load system data",
          dataLoading: false,
        }));
      }
    };
    initData();
  }, []);

  // --- Handlers ---
  const handleStaffSelect = (staffId) => {
    setFormData((prev) => ({
      ...prev,
      selectedStaff: prev.selectedStaff.includes(staffId)
        ? prev.selectedStaff.filter((id) => id !== staffId)
        : [...prev.selectedStaff, staffId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUiState((prev) => ({ ...prev, loading: true, error: "", success: "" }));

    // Basic Validation
    if (!formData.selectedTask || formData.selectedStaff.length === 0) {
      setUiState((prev) => ({
        ...prev,
        loading: false,
        error: "Please select a task and at least one staff member.",
      }));
      return;
    }

    try {
      const payload = {
        ...formData,
        taskId: formData.selectedTask,
        staffIds: formData.selectedStaff,
        scheduledDate:
          formData.scheduleType === "daily"
            ? `${uiState.selectedDate}T10:00:00.000Z`
            : `${formData.startDate}T10:00:00.000Z`,
      };

      await axios.post(`${API_BASE_URL}/schedules`, payload);
      setUiState((prev) => ({
        ...prev,
        loading: false,
        success: "Schedule created successfully!",
      }));

      setTimeout(() => {
        onClose(); // Close modal on success
      }, 1500);
    } catch (err) {
      setUiState((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || "Scheduling failed.",
      }));
    }
  };

  // --- Render Helpers ---
  if (uiState.dataLoading)
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div
      className={`flex flex-col h-full ${
        darkMode ? "text-slate-200" : "text-slate-800"
      }`}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="text-blue-600" /> Schedule Task
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Assign tasks and manage team workload
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950">
        {/* --- LEFT: Form Inputs --- */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r border-slate-200 dark:border-slate-800 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          <form
            id="schedule-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* 1. Schedule Type */}
            <div className="p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold mb-3">
                Schedule Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {["daily", "weekly"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, scheduleType: type })
                    }
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                      formData.scheduleType === type
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                        : "border-slate-200 dark:border-slate-700 hover:border-blue-300"
                    }`}
                  >
                    {type === "daily" ? (
                      <Clock size={20} className="mb-1" />
                    ) : (
                      <RefreshCw size={20} className="mb-1" />
                    )}
                    <span className="capitalize text-sm font-medium">
                      {type}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-4">
                {formData.scheduleType === "daily" ? (
                  <input
                    type="date"
                    value={uiState.selectedDate}
                    onChange={(e) =>
                      setUiState({ ...uiState, selectedDate: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                ) : (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block">
                        Start
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-slate-500 mb-1 block">
                        End
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Task Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Task
                </label>
                <select
                  value={formData.selectedTask}
                  onChange={(e) =>
                    setFormData({ ...formData, selectedTask: e.target.value })
                  }
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Choose a task --</option>
                  {data.tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Instructions / Description
                </label>
                <textarea
                  rows="3"
                  value={formData.taskDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      taskDescription: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Specific details for this assignment..."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedHours: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sendEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, sendEmail: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="font-medium text-sm block">
                    Email Notification
                  </span>
                  <span className="text-xs text-slate-500">
                    Notify staff immediately via email
                  </span>
                </div>
                <Mail className="text-slate-400" size={18} />
              </label>
            </div>

            {/* Messages */}
            {uiState.error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg flex items-start gap-3">
                <AlertCircle className="shrink-0 mt-0.5" size={18} />
                <span className="text-sm font-medium">{uiState.error}</span>
              </div>
            )}
            {uiState.success && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg flex items-start gap-3">
                <CheckCircle className="shrink-0 mt-0.5" size={18} />
                <span className="text-sm font-medium">{uiState.success}</span>
              </div>
            )}
          </form>
        </div>

        {/* --- RIGHT: Staff Selection --- */}
        <div className="w-full md:w-1/2 flex flex-col h-full border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">
              <Users size={18} /> Assign Staff
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                {formData.selectedStaff.length} selected
              </span>
            </h3>
            {formData.selectedStaff.length > 0 && (
              <button
                onClick={() => setFormData({ ...formData, selectedStaff: [] })}
                className="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 xl:grid-cols-2 gap-3 content-start">
            {data.staff.map((staff) => {
              const isSelected = formData.selectedStaff.includes(staff._id);
              const load = uiState.staffWeeklyLoad[staff._id] || {
                totalTasks: 0,
              };
              const isOverloaded = load.totalTasks >= 5; // Example limit

              return (
                <div
                  key={staff._id}
                  onClick={() => handleStaffSelect(staff._id)}
                  className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-start gap-3 group
                    ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-600 hover:shadow-md"
                    }
                  `}
                >
                  {/* Selection Check */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors mt-1
                     ${
                       isSelected
                         ? "bg-blue-500 border-blue-500"
                         : "border-slate-300 bg-white dark:bg-slate-800"
                     }`}
                  >
                    {isSelected && (
                      <CheckCircle size={12} className="text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm truncate">
                          {staff.firstName} {staff.lastName}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {staff.role}
                        </p>
                      </div>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(
                          staff._id
                        )}`}
                      >
                        {staff.firstName[0]}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <Shield
                        size={12}
                        className={
                          isOverloaded ? "text-red-500" : "text-emerald-500"
                        }
                      />
                      <span>Load: {load.totalTasks} tasks this week</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex justify-between items-center">
        <div className="text-sm text-slate-500 hidden md:block">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Tip:
          </span>{" "}
          Use weekly schedule for rotations.
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uiState.loading}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {uiState.loading ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              <CheckCircle size={18} />
            )}
            {formData.sendEmail ? "Schedule & Notify" : "Save Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskSchedule;
