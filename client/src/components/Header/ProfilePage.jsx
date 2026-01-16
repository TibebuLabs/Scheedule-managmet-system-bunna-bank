import React, { useState, useEffect } from "react";
import {
  FiCamera,
  FiEdit2,
  FiSave,
  FiX,
  FiCheck,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiCalendar,
  FiUser,
  FiActivity,
  FiClock,
  FiCheckCircle,
  FiTarget,
} from "react-icons/fi";

const ProfilePage = ({ user, onUpdateProfile, darkMode }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    joinDate: "",
    bio: "",
    skills: [],
  });

  // Initialize data safely
  useEffect(() => {
    setProfileData({
      fullName: user?.fullName || "Admin User",
      email: user?.email || "admin@bunnabank.com",
      phone: user?.phone || "+251 912 345 678",
      department: user?.department || "IT Department",
      position: user?.position || "System Administrator",
      joinDate: user?.joinDate || "2023-01-15",
      bio:
        user?.bio ||
        "Experienced IT professional specializing in system administration.",
      skills: user?.skills || ["System Admin", "React", "Node.js"],
    });
  }, [user]);

  const handleSave = () => {
    if (onUpdateProfile) onUpdateProfile(profileData);
    setIsEditing(false);
    // In a real app, use a toast notification here
  };

  const addSkill = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      if (!profileData.skills.includes(e.target.value.trim())) {
        setProfileData((prev) => ({
          ...prev,
          skills: [...prev.skills, e.target.value.trim()],
        }));
      }
      e.target.value = "";
    }
  };

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        darkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Profile</h1>
          <p
            className={`text-sm ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Manage your personal information and preferences
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              isEditing
                ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow"
            }`}
        >
          {isEditing ? (
            <>
              <FiX /> Cancel Editing
            </>
          ) : (
            <>
              <FiEdit2 /> Edit Profile
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Avatar & Quick Stats (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Identity Card */}
          <div
            className={`p-6 rounded-2xl border shadow-sm ${
              darkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative group mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  {profileData.fullName.charAt(0)}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-700 rounded-full shadow-md border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                  <FiCamera size={16} />
                </button>
              </div>

              <h2 className="text-xl font-bold">{profileData.fullName}</h2>
              <p
                className={`text-sm mb-1 ${
                  darkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {profileData.position}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </div>
            </div>

            <div
              className={`mt-6 pt-6 border-t ${
                darkMode ? "border-slate-700" : "border-slate-100"
              }`}
            >
              <div className="grid grid-cols-2 gap-4">
                <StatBox
                  icon={FiCheckCircle}
                  label="Completed"
                  value="156"
                  color="blue"
                  darkMode={darkMode}
                />
                <StatBox
                  icon={FiActivity}
                  label="Efficiency"
                  value="94%"
                  color="emerald"
                  darkMode={darkMode}
                />
                <StatBox
                  icon={FiTarget}
                  label="Assigned"
                  value="42"
                  color="purple"
                  darkMode={darkMode}
                />
                <StatBox
                  icon={FiClock}
                  label="Avg Time"
                  value="2.4h"
                  color="orange"
                  darkMode={darkMode}
                />
              </div>
            </div>
          </div>

          {/* Contact Info (Read Only View) */}
          <div
            className={`p-6 rounded-2xl border shadow-sm ${
              darkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
            <div className="space-y-4">
              <ContactRow
                icon={FiMail}
                label="Email"
                value={profileData.email}
                darkMode={darkMode}
              />
              <ContactRow
                icon={FiPhone}
                label="Phone"
                value={profileData.phone}
                darkMode={darkMode}
              />
              <ContactRow
                icon={FiBriefcase}
                label="Dept"
                value={profileData.department}
                darkMode={darkMode}
              />
              <ContactRow
                icon={FiCalendar}
                label="Joined"
                value={profileData.joinDate}
                darkMode={darkMode}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form & Bio (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div
            className={`p-6 md:p-8 rounded-2xl border shadow-sm ${
              darkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">General Information</h3>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <FiSave /> Save Changes
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Full Name"
                value={profileData.fullName}
                onChange={(v) =>
                  setProfileData({ ...profileData, fullName: v })
                }
                icon={FiUser}
                disabled={!isEditing}
                darkMode={darkMode}
              />
              <InputField
                label="Position"
                value={profileData.position}
                onChange={(v) =>
                  setProfileData({ ...profileData, position: v })
                }
                icon={FiBriefcase}
                disabled={!isEditing}
                darkMode={darkMode}
              />
              <InputField
                label="Email Address"
                value={profileData.email}
                onChange={(v) => setProfileData({ ...profileData, email: v })}
                icon={FiMail}
                type="email"
                disabled={!isEditing}
                darkMode={darkMode}
              />
              <InputField
                label="Phone Number"
                value={profileData.phone}
                onChange={(v) => setProfileData({ ...profileData, phone: v })}
                icon={FiPhone}
                type="tel"
                disabled={!isEditing}
                darkMode={darkMode}
              />

              <div className="md:col-span-2">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Bio
                </label>
                <textarea
                  rows="4"
                  disabled={!isEditing}
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-xl border transition-all resize-none
                    ${
                      darkMode
                        ? "bg-slate-900 border-slate-700 text-white focus:border-blue-500"
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500"
                    }
                    ${!isEditing && "opacity-70 cursor-not-allowed"}
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
              </div>

              <div className="md:col-span-2">
                <label
                  className={`block text-sm font-medium mb-2 ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profileData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium border
                      ${
                        darkMode
                          ? "bg-slate-700 border-slate-600 text-slate-200"
                          : "bg-slate-100 border-slate-200 text-slate-700"
                      }`}
                    >
                      {skill}
                      {isEditing && (
                        <button
                          onClick={() =>
                            setProfileData((p) => ({
                              ...p,
                              skills: p.skills.filter((s) => s !== skill),
                            }))
                          }
                          className="hover:text-red-500 transition-colors"
                        >
                          <FiX size={14} />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {isEditing && (
                  <input
                    type="text"
                    placeholder="Type skill and press Enter..."
                    onKeyDown={addSkill}
                    className={`w-full px-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/20
                      ${
                        darkMode
                          ? "bg-slate-900 border-slate-700 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-900"
                      }`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components for Profile ---

const StatBox = ({ icon: Icon, label, value, color, darkMode }) => {
  const colors = {
    blue: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
    emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
    purple: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
    orange: "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
  };

  return (
    <div
      className={`p-3 rounded-xl flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 ${
        darkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${colors[color]}`}
      >
        <Icon size={18} />
      </div>
      <span className="text-lg font-bold block leading-none">{value}</span>
      <span
        className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}
      >
        {label}
      </span>
    </div>
  );
};

const ContactRow = ({ icon: Icon, label, value, darkMode }) => (
  <div className="flex items-center gap-3">
    <div
      className={`p-2 rounded-lg ${
        darkMode ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"
      }`}
    >
      <Icon size={16} />
    </div>
    <div className="overflow-hidden">
      <p
        className={`text-xs font-medium ${
          darkMode ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {label}
      </p>
      <p className="text-sm truncate font-medium">{value}</p>
    </div>
  </div>
);

const InputField = ({
  label,
  value,
  onChange,
  icon: Icon,
  type = "text",
  disabled,
  darkMode,
}) => (
  <div>
    <label
      className={`block text-sm font-medium mb-2 ${
        darkMode ? "text-slate-300" : "text-slate-700"
      }`}
    >
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Icon size={16} />
      </div>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all
          ${
            darkMode
              ? "bg-slate-900 border-slate-700 text-white focus:border-blue-500"
              : "bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500"
          }
          ${disabled && "opacity-70 cursor-not-allowed"}
          focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
      />
    </div>
  </div>
);

export default ProfilePage;
