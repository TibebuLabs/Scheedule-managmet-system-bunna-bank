import React, { useState } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  X,
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const AddStaffForm = ({ onCancel, onStaffAdded, darkMode }) => {
  // --- State ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "Staff",
    department: "Customer Service",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [serverMessage, setServerMessage] = useState("");

  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.phone && !/^[\d\s\+\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setServerMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/staff/add`, formData);

      setStatus("success");
      setServerMessage("Staff member added successfully.");

      if (onStaffAdded) onStaffAdded(response.data.employee);

      // Optional: Reset form after success or keep for next entry
      setTimeout(() => {
        onCancel(); // Close form or redirect
      }, 1500);
    } catch (err) {
      console.error("Submission Error:", err);
      setStatus("error");
      setServerMessage(
        err.response?.data?.message || "Failed to connect to the server."
      );
    } finally {
      if (status !== "success") setStatus("idle"); // Keep loading if success to show transition
    }
  };

  // --- Render ---
  return (
    <div className="max-w-4xl mx-auto">
      {/* Card Container */}
      <div
        className={`rounded-2xl shadow-sm border overflow-hidden ${
          darkMode
            ? "bg-slate-900 border-slate-700"
            : "bg-white border-slate-200"
        }`}
      >
        {/* Header */}
        <div
          className={`px-8 py-6 border-b flex items-center justify-between ${
            darkMode
              ? "border-slate-800 bg-slate-900"
              : "border-slate-100 bg-slate-50/50"
          }`}
        >
          <div>
            <h2
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-slate-900"
              }`}
            >
              New Staff Registration
            </h2>
            <p
              className={`mt-1 text-sm ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Enter the employee's personal and professional details.
            </p>
          </div>
          <button
            onClick={onCancel}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? "hover:bg-slate-800 text-slate-400"
                : "hover:bg-slate-200 text-slate-500"
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Feedback Messages */}
        {serverMessage && (
          <div
            className={`mx-8 mt-6 p-4 rounded-lg flex items-start gap-3 ${
              status === "success"
                ? darkMode
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : darkMode
                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {status === "success" ? (
              <CheckCircle2 className="mt-0.5" size={18} />
            ) : (
              <AlertCircle className="mt-0.5" size={18} />
            )}
            <span className="text-sm font-medium">{serverMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Section: Personal Info */}
            <div className="md:col-span-2">
              <h3
                className={`text-xs font-bold uppercase tracking-wider mb-4 ${
                  darkMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Personal Information
              </h3>
            </div>

            <FormInput
              label="First Name"
              name="firstName"
              placeholder="e.g. John"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              icon={User}
              darkMode={darkMode}
              required
            />

            <FormInput
              label="Last Name"
              name="lastName"
              placeholder="e.g. Doe"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              icon={User}
              darkMode={darkMode}
              required
            />

            <FormInput
              label="Email Address"
              name="email"
              type="email"
              placeholder="john.doe@bunnabank.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={Mail}
              darkMode={darkMode}
              required
            />

            <FormInput
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+251 911 234 567"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              icon={Phone}
              darkMode={darkMode}
            />

            {/* Section: Professional Info */}
            <div className="md:col-span-2 mt-2">
              <div
                className={`h-px w-full mb-6 ${
                  darkMode ? "bg-slate-800" : "bg-slate-100"
                }`}
              />
              <h3
                className={`text-xs font-bold uppercase tracking-wider mb-4 ${
                  darkMode ? "text-slate-500" : "text-slate-400"
                }`}
              >
                Role & Department
              </h3>
            </div>

            <FormSelect
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              icon={Building}
              darkMode={darkMode}
              options={[
                "Customer Service",
                "Management",
                "Loans",
                "Investments",
                "IT Support",
                "Operations",
                "Finance",
              ]}
            />

            <FormSelect
              label="Assigned Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              icon={Briefcase}
              darkMode={darkMode}
              options={[
                "Staff",
                "Bank Manager",
                "Loan Officer",
                "Teller",
                "Financial Advisor",
                "IT Specialist",
              ]}
            />
          </div>

          {/* Footer Actions */}
          <div className="mt-10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                darkMode
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                  : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className={`
                flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all
                ${
                  status === "loading"
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5"
                }
              `}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Register Staff</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Reusable Sub-Components ---

const FormInput = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  darkMode,
  required,
}) => (
  <div className="space-y-1.5">
    <label
      className={`block text-sm font-semibold ${
        darkMode ? "text-slate-300" : "text-slate-700"
      }`}
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          block w-full pl-10 pr-3 py-2.5 rounded-xl border text-sm transition-all outline-none
          ${
            darkMode
              ? "bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:bg-slate-800"
              : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white"
          }
          ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          }
        `}
      />
    </div>
    {error && (
      <p className="text-xs text-red-500 font-medium animate-pulse">{error}</p>
    )}
  </div>
);

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  options,
  icon: Icon,
  darkMode,
}) => (
  <div className="space-y-1.5">
    <label
      className={`block text-sm font-semibold ${
        darkMode ? "text-slate-300" : "text-slate-700"
      }`}
    >
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
        <Icon size={18} />
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`
          block w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm transition-all outline-none appearance-none cursor-pointer
          ${
            darkMode
              ? "bg-slate-800 border-slate-700 text-white focus:bg-slate-800"
              : "bg-white border-slate-300 text-slate-900 focus:bg-white"
          }
          focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
        `}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  </div>
);

export default AddStaffForm;
