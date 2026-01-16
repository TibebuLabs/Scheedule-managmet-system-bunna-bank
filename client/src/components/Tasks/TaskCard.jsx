import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  MoreVertical,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  X,
  Eye,
  Calendar,
  Check,
  AlertTriangle,
  Loader2,
  ArrowRight,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const TaskTable = ({ onAddTask, darkMode, refreshTrigger }) => {
  // --- State Management ---
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Selection & Actions
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isDeleting, setIsDeleting] = useState(null);

  // Modal State
  const [modal, setModal] = useState({
    open: false,
    type: "info", // 'success', 'error', 'delete', 'details'
    title: "",
    message: "",
    data: null,
    onConfirm: null,
  });

  // --- Constants ---
  const STATUS_CONFIG = {
    pending: {
      color:
        "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
      icon: Clock,
    },
    "in-progress": {
      color:
        "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
      icon: Loader2,
    },
    completed: {
      color:
        "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
      icon: CheckCircle2,
    },
    cancelled: {
      color:
        "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800",
      icon: X,
    },
  };

  // --- Data Fetching ---
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      if (response.data.success) {
        setTasks(
          response.data.tasks.map((t) => ({
            ...t,
            id: t._id,
            status: t.status || "pending",
            taskCode: t.taskId || `T-${t._id.substr(-4).toUpperCase()}`,
          }))
        );
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      // Fallback for demo
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  // --- Handlers ---
  const handleEdit = (task) => {
    setEditingId(task.id);
    setEditFormData({ ...task });
    setActiveMenu(null);
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/tasks/${id}`, editFormData);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...editFormData } : t))
      );
      setEditingId(null);
      showAlert("success", "Task Updated", "Changes saved successfully.");
    } catch (error) {
      showAlert("error", "Update Failed", "Could not save changes.");
    }
  };

  const handleDelete = (task) => {
    setActiveMenu(null);
    setModal({
      open: true,
      type: "delete",
      title: "Delete Task?",
      message: `Are you sure you want to delete "${task.title}"? This cannot be undone.`,
      data: task,
      onConfirm: async () => {
        setIsDeleting(task.id);
        try {
          await axios.delete(`${API_BASE_URL}/tasks/${task.id}`);
          setTasks((prev) => prev.filter((t) => t.id !== task.id));
          showAlert("success", "Deleted", "Task removed successfully.");
        } catch (error) {
          showAlert("error", "Error", "Failed to delete task.");
        } finally {
          setIsDeleting(null);
        }
      },
    });
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/tasks/${id}`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    } catch (error) {
      console.error("Status update failed");
    }
  };

  const showAlert = (type, title, message) => {
    setModal({ open: true, type, title, message, onConfirm: null });
  };

  // --- Filtering ---
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.taskCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // --- Render Helpers ---
  const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG["pending"];
    const Icon = config.icon;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
      >
        <Icon
          size={12}
          className={status === "in-progress" ? "animate-spin" : ""}
        />
        <span className="capitalize">{status.replace("-", " ")}</span>
      </span>
    );
  };

  // --- Main Render ---
  if (loading) return <TaskSkeleton darkMode={darkMode} />;

  return (
    <div className="space-y-6">
      {/* Modal System */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md p-6 rounded-2xl shadow-xl scale-100 transition-all ${
              darkMode ? "bg-slate-900 border border-slate-700" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`p-3 rounded-full 
                ${
                  modal.type === "delete"
                    ? "bg-red-100 text-red-600"
                    : modal.type === "success"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {modal.type === "delete" ? (
                  <Trash2 size={24} />
                ) : modal.type === "success" ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <AlertTriangle size={24} />
                )}
              </div>
              <h3
                className={`text-lg font-bold ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}
              >
                {modal.title}
              </h3>
            </div>
            <p
              className={`mb-6 ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              {modal.message}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModal({ ...modal, open: false })}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  darkMode
                    ? "hover:bg-slate-800 text-slate-300"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                Cancel
              </button>
              {modal.onConfirm && (
                <button
                  onClick={() => {
                    modal.onConfirm();
                    setModal({ ...modal, open: false });
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium"
                >
                  Confirm
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div
        className={`p-4 rounded-xl shadow-sm border flex flex-col md:flex-row gap-4 justify-between items-center ${
          darkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="flex items-center gap-4 w-full md:w-auto">
          <h2
            className={`text-lg font-bold flex items-center gap-2 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Tasks{" "}
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs text-slate-500">
              {tasks.length}
            </span>
          </h2>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>

          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-1.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                darkMode
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`pl-3 pr-8 py-1.5 rounded-lg border text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none ${
                darkMode
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <Filter
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={14}
            />
          </div>

          <button
            onClick={onAddTask}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus size={16} /> New Task
          </button>
        </div>
      </div>

      {/* Task List */}
      <div
        className={`rounded-xl shadow-sm border overflow-hidden ${
          darkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr
                className={`text-xs uppercase tracking-wider font-semibold border-b ${
                  darkMode
                    ? "bg-slate-900/50 text-slate-400 border-slate-700"
                    : "bg-slate-50 text-slate-500 border-slate-200"
                }`}
              >
                <th className="p-4 w-24">Code</th>
                <th className="p-4">Task Details</th>
                <th className="p-4 w-48">Status</th>
                <th className="p-4 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                darkMode ? "divide-slate-700" : "divide-slate-100"
              }`}
            >
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-slate-500">
                    No tasks found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className={`group transition-colors ${
                      darkMode ? "hover:bg-slate-700/30" : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Code */}
                    <td className="p-4 align-top">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                        {task.taskCode}
                      </span>
                    </td>

                    {/* Details */}
                    <td className="p-4">
                      {editingId === task.id ? (
                        <div className="space-y-2">
                          <input
                            className={`w-full p-2 rounded border text-sm ${
                              darkMode
                                ? "bg-slate-900 border-slate-600"
                                : "bg-white border-slate-300"
                            }`}
                            value={editFormData.title}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                title: e.target.value,
                              })
                            }
                            placeholder="Task Title"
                          />
                          <textarea
                            className={`w-full p-2 rounded border text-sm resize-none ${
                              darkMode
                                ? "bg-slate-900 border-slate-600"
                                : "bg-white border-slate-300"
                            }`}
                            value={editFormData.description}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                description: e.target.value,
                              })
                            }
                            rows="2"
                            placeholder="Description"
                          />
                        </div>
                      ) : (
                        <div>
                          <h3
                            className={`font-semibold text-sm ${
                              darkMode ? "text-slate-200" : "text-slate-900"
                            }`}
                          >
                            {task.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {task.description || "No description provided."}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={10} /> Created:{" "}
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4 align-top">
                      {editingId === task.id ? (
                        <select
                          className={`w-full p-2 rounded border text-sm ${
                            darkMode
                              ? "bg-slate-900 border-slate-600"
                              : "bg-white border-slate-300"
                          }`}
                          value={editFormData.status}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              status: e.target.value,
                            })
                          }
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div>
                            <StatusBadge status={task.status} />
                          </div>
                          {/* Quick Actions for Status */}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {["in-progress", "completed"].map((st) => (
                              <button
                                key={st}
                                onClick={() => handleStatusChange(task.id, st)}
                                className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600`}
                                title={`Mark as ${st}`}
                              >
                                {st === "completed" ? (
                                  <Check size={14} />
                                ) : (
                                  <ArrowRight size={14} />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right align-top relative">
                      {editingId === task.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSave(task.id)}
                            className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              setActiveMenu(
                                activeMenu === task.id ? null : task.id
                              )
                            }
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {/* Dropdown */}
                          {activeMenu === task.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setActiveMenu(null)}
                              ></div>
                              <div
                                className={`absolute right-8 top-8 z-20 w-32 py-1 rounded-lg shadow-xl border animate-fade-in ${
                                  darkMode
                                    ? "bg-slate-800 border-slate-700"
                                    : "bg-white border-slate-200"
                                }`}
                              >
                                <button
                                  onClick={() => handleEdit(task)}
                                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 ${
                                    darkMode
                                      ? "hover:bg-slate-700"
                                      : "hover:bg-slate-50"
                                  }`}
                                >
                                  <Edit2 size={14} className="text-slate-400" />{" "}
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    showAlert(
                                      "info",
                                      "Details",
                                      JSON.stringify(task)
                                    )
                                  }
                                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 ${
                                    darkMode
                                      ? "hover:bg-slate-700"
                                      : "hover:bg-slate-50"
                                  }`}
                                >
                                  <Eye size={14} className="text-slate-400" />{" "}
                                  View
                                </button>
                                <div
                                  className={`h-px my-1 ${
                                    darkMode ? "bg-slate-700" : "bg-slate-100"
                                  }`}
                                />
                                <button
                                  onClick={() => handleDelete(task)}
                                  className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TaskSkeleton = ({ darkMode }) => (
  <div className="space-y-4">
    <div
      className={`h-14 rounded-xl animate-pulse ${
        darkMode ? "bg-slate-800" : "bg-slate-100"
      }`}
    />
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className={`h-24 rounded-xl animate-pulse ${
          darkMode ? "bg-slate-800" : "bg-white border border-slate-100"
        }`}
      />
    ))}
  </div>
);

export default TaskTable;
