import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Check,
  X,
  Mail,
  Phone,
  Building,
  Briefcase,
  User,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Eye,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const StaffTable = ({ onAddStaff, darkMode, refreshTrigger }) => {
  // --- State ---
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Selection & Actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [activeMenu, setActiveMenu] = useState(null); // ID for open dropdown

  // Modal State
  const [modal, setModal] = useState({
    open: false,
    type: "info", // 'confirm', 'success', 'error', 'details'
    title: "",
    message: "",
    data: null,
    onConfirm: null,
  });

  // --- Fetch Data ---
  useEffect(() => {
    fetchStaffMembers();
  }, [refreshTrigger]);

  const fetchStaffMembers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/staff/all`);
      if (response.data.success) {
        setStaffMembers(
          response.data.employees.map((emp) => ({
            ...emp,
            id: emp._id, // Normalize ID
            status: emp.status || "Active",
          }))
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
      // Mock data for display if API fails (Optional: Remove in production)
      setStaffMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers ---
  const getAvatarColor = (name) => {
    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-violet-500",
      "bg-orange-500",
      "bg-rose-500",
      "bg-indigo-500",
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20";
      case "on leave":
        return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
      case "inactive":
        return "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20";
    }
  };

  // --- Actions ---
  const handleEdit = (staff) => {
    setEditingId(staff.id);
    setEditFormData({ ...staff });
    setActiveMenu(null);
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/staff/${id}`, editFormData);
      setStaffMembers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...editFormData } : s))
      );
      setEditingId(null);
      showAlert(
        "success",
        "Changes Saved",
        "Staff member details updated successfully."
      );
    } catch (error) {
      showAlert(
        "error",
        "Update Failed",
        "Could not save changes. Please try again."
      );
    }
  };

  const handleDelete = (staff) => {
    setActiveMenu(null);
    setModal({
      open: true,
      type: "confirm",
      title: "Delete Staff Member?",
      message: `Are you sure you want to remove ${staff.firstName} ${staff.lastName}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/staff/${staff.id}`);
          setStaffMembers((prev) => prev.filter((s) => s.id !== staff.id));
          showAlert("success", "Deleted", "Staff member removed successfully.");
        } catch (error) {
          showAlert("error", "Error", "Failed to delete staff member.");
        }
      },
    });
  };

  const showAlert = (type, title, message) => {
    setModal({ open: true, type, title, message, onConfirm: null });
  };

  const handleViewDetails = (staff) => {
    setActiveMenu(null);
    setModal({
      open: true,
      type: "details",
      title: "Staff Profile",
      data: staff,
      onConfirm: null,
    });
  };

  // --- Filter Logic ---
  const filteredData = staffMembers.filter((staff) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      staff.firstName?.toLowerCase().includes(searchLower) ||
      staff.lastName?.toLowerCase().includes(searchLower) ||
      staff.email?.toLowerCase().includes(searchLower) ||
      staff.role?.toLowerCase().includes(searchLower);

    const matchesStatus =
      filterStatus === "all" ||
      staff.status?.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // --- Render Components ---

  // 1. Loading Skeleton
  if (loading)
    return (
      <div className="space-y-4">
        <div
          className={`h-16 rounded-xl animate-pulse ${
            darkMode ? "bg-slate-800" : "bg-slate-100"
          }`}
        />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-20 rounded-xl animate-pulse ${
              darkMode ? "bg-slate-800" : "bg-white border border-slate-100"
            }`}
          />
        ))}
      </div>
    );

  return (
    <div className="space-y-6">
      {/* --- Modal System --- */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden scale-100 transition-all ${
              darkMode ? "bg-slate-900 border border-slate-700" : "bg-white"
            }`}
          >
            {/* Modal Content */}
            {modal.type === "details" ? (
              // Details View
              <div className="p-0">
                <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                  <button
                    onClick={() => setModal({ ...modal, open: false })}
                    className="absolute top-4 right-4 text-white/80 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="px-6 pb-6 -mt-10">
                  <div
                    className={`w-20 h-20 rounded-full border-4 text-2xl font-bold flex items-center justify-center text-white shadow-lg ${getAvatarColor(
                      modal.data.firstName
                    )} ${darkMode ? "border-slate-900" : "border-white"}`}
                  >
                    {modal.data.firstName[0]}
                  </div>
                  <h3
                    className={`mt-3 text-xl font-bold ${
                      darkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {modal.data.firstName} {modal.data.lastName}
                  </h3>
                  <p className="text-slate-500">
                    {modal.data.role} • {modal.data.department}
                  </p>

                  <div
                    className={`mt-6 space-y-3 p-4 rounded-xl ${
                      darkMode ? "bg-slate-800" : "bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <Mail size={16} className="text-slate-400" />{" "}
                      {modal.data.email}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone size={16} className="text-slate-400" />{" "}
                      {modal.data.phone || "N/A"}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle2 size={16} className="text-emerald-500" />{" "}
                      Status: {modal.data.status}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Alert/Confirm View
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-3 rounded-full 
                    ${
                      modal.type === "confirm"
                        ? "bg-red-100 text-red-600"
                        : modal.type === "success"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {modal.type === "confirm" ? (
                      <AlertTriangle size={24} />
                    ) : modal.type === "success" ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <CheckCircle2 size={24} />
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
                    {modal.type === "confirm" ? "Cancel" : "Close"}
                  </button>
                  {modal.type === "confirm" && (
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
            )}
          </div>
        </div>
      )}

      {/* --- Toolbar --- */}
      <div
        className={`p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row gap-4 justify-between items-center ${
          darkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-slate-200"
        }`}
      >
        {/* Search & Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                darkMode
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            />
          </div>

          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`pl-3 pr-8 py-2 rounded-lg border text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 outline-none ${
                darkMode
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="on leave">On Leave</option>
              <option value="inactive">Inactive</option>
            </select>
            <Filter
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={14}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 ? (
            <button className="flex-1 sm:flex-none px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
              Delete ({selectedIds.length})
            </button>
          ) : (
            <button className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              <Download size={16} /> Export
            </button>
          )}
          <button
            onClick={onAddStaff}
            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <User size={16} /> Add Staff
          </button>
        </div>
      </div>

      {/* --- Table --- */}
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
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedIds(
                        e.target.checked ? filteredData.map((s) => s.id) : []
                      )
                    }
                    checked={
                      selectedIds.length === filteredData.length &&
                      filteredData.length > 0
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="p-4">Employee</th>
                <th className="p-4">Role & Dept</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                darkMode ? "divide-slate-700" : "divide-slate-100"
              }`}
            >
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className={`p-4 rounded-full ${
                          darkMode ? "bg-slate-800" : "bg-slate-100"
                        }`}
                      >
                        <Search size={32} className="text-slate-400" />
                      </div>
                      <h3
                        className={`font-semibold ${
                          darkMode ? "text-white" : "text-slate-900"
                        }`}
                      >
                        No staff found
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Try adjusting your search or filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((staff) => (
                  <tr
                    key={staff.id}
                    className={`group transition-colors ${
                      darkMode ? "hover:bg-slate-700/30" : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(staff.id)}
                        onChange={() =>
                          setSelectedIds((prev) =>
                            prev.includes(staff.id)
                              ? prev.filter((id) => id !== staff.id)
                              : [...prev, staff.id]
                          )
                        }
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>

                    {/* Employee Identity */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${getAvatarColor(
                            staff.firstName
                          )}`}
                        >
                          {staff.firstName[0]}
                        </div>
                        {editingId === staff.id ? (
                          <div className="space-y-2">
                            <input
                              className="edit-input"
                              value={editFormData.firstName}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  firstName: e.target.value,
                                })
                              }
                              placeholder="First Name"
                            />
                            <input
                              className="edit-input"
                              value={editFormData.lastName}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  lastName: e.target.value,
                                })
                              }
                              placeholder="Last Name"
                            />
                          </div>
                        ) : (
                          <div>
                            <div
                              className={`font-semibold ${
                                darkMode ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {staff.firstName} {staff.lastName}
                            </div>
                            <div className="text-xs text-slate-500">
                              ID: {staff.employeeId || "###"}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Role & Dept */}
                    <td className="p-4">
                      {editingId === staff.id ? (
                        <div className="space-y-2">
                          <input
                            className="edit-input"
                            value={editFormData.role}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                role: e.target.value,
                              })
                            }
                            placeholder="Role"
                          />
                          <input
                            className="edit-input"
                            value={editFormData.department}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                department: e.target.value,
                              })
                            }
                            placeholder="Dept"
                          />
                        </div>
                      ) : (
                        <div>
                          <div
                            className={`flex items-center gap-1.5 text-sm ${
                              darkMode ? "text-slate-300" : "text-slate-700"
                            }`}
                          >
                            <Briefcase size={14} className="text-slate-400" />{" "}
                            {staff.role}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                            <Building size={12} /> {staff.department}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="p-4">
                      {editingId === staff.id ? (
                        <div className="space-y-2">
                          <input
                            className="edit-input"
                            value={editFormData.email}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                email: e.target.value,
                              })
                            }
                          />
                          <input
                            className="edit-input"
                            value={editFormData.phone}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Mail size={14} />{" "}
                            <span className="truncate max-w-[150px]">
                              {staff.email}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Phone size={12} /> {staff.phone || "--"}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {editingId === staff.id ? (
                        <select
                          value={editFormData.status}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              status: e.target.value,
                            })
                          }
                          className="edit-input"
                        >
                          <option value="Active">Active</option>
                          <option value="On Leave">On Leave</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(
                            staff.status
                          )}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              staff.status === "Active"
                                ? "bg-emerald-500"
                                : staff.status === "On Leave"
                                ? "bg-amber-500"
                                : "bg-slate-500"
                            }`}
                          ></span>
                          {staff.status}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right relative">
                      {editingId === staff.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSave(staff.id)}
                            className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              setActiveMenu(
                                activeMenu === staff.id ? null : staff.id
                              )
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              activeMenu === staff.id
                                ? "bg-slate-100 dark:bg-slate-700 text-blue-600"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                            }`}
                          >
                            <MoreVertical size={18} />
                          </button>

                          {/* Dropdown Menu */}
                          {activeMenu === staff.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setActiveMenu(null)}
                              ></div>
                              <div
                                className={`absolute right-4 top-14 z-20 w-48 py-1 rounded-xl shadow-xl border animate-fade-in ${
                                  darkMode
                                    ? "bg-slate-800 border-slate-700"
                                    : "bg-white border-slate-200"
                                }`}
                              >
                                <button
                                  onClick={() => handleViewDetails(staff)}
                                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                    darkMode
                                      ? "hover:bg-slate-700"
                                      : "hover:bg-slate-50"
                                  }`}
                                >
                                  <Eye size={16} className="text-slate-400" />{" "}
                                  View Profile
                                </button>
                                <button
                                  onClick={() => handleEdit(staff)}
                                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                                    darkMode
                                      ? "hover:bg-slate-700"
                                      : "hover:bg-slate-50"
                                  }`}
                                >
                                  <Edit2 size={16} className="text-slate-400" />{" "}
                                  Edit Details
                                </button>
                                <div
                                  className={`h-px my-1 ${
                                    darkMode ? "bg-slate-700" : "bg-slate-100"
                                  }`}
                                />
                                <button
                                  onClick={() => handleDelete(staff)}
                                  className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 size={16} /> Delete Staff
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

        {/* --- Pagination --- */}
        <div
          className={`px-4 py-3 border-t flex items-center justify-between ${
            darkMode
              ? "border-slate-700 bg-slate-800"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <span
            className={`text-sm ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Showing {filteredData.length} entries
          </span>
          <div className="flex gap-2">
            <button
              className={`p-1.5 rounded-lg border disabled:opacity-50 ${
                darkMode
                  ? "border-slate-600 hover:bg-slate-700"
                  : "border-slate-300 hover:bg-white"
              }`}
              disabled
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className={`p-1.5 rounded-lg border ${
                darkMode
                  ? "border-slate-600 hover:bg-slate-700"
                  : "border-slate-300 hover:bg-white"
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .edit-input {
          width: 100%;
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          border-radius: 0.375rem;
          border-width: 1px;
          outline: none;
          transition: all 0.2s;
        }
        :global(.dark) .edit-input {
          background-color: #1e293b;
          border-color: #475569;
          color: white;
        }
        :global(.dark) .edit-input:focus {
          border-color: #3b82f6;
          ring: 2px;
          ring-color: rgba(59, 130, 246, 0.2);
        }
        .edit-input:not(:global(.dark) .edit-input) {
          background-color: white;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .edit-input:not(:global(.dark) .edit-input):focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
};

export default StaffTable;
