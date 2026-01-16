import React, { useState } from "react";
import {
  FiMoon,
  FiSun,
  FiMonitor,
  FiGlobe,
  FiBell,
  FiLock,
  FiSmartphone,
  FiCheck,
  FiSave,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";

const SettingsPage = ({
  user,
  darkMode,
  currentDarkMode,
  onDarkModeToggle,
}) => {
  // State for form handling
  const [settings, setSettings] = useState({
    theme: currentDarkMode ? "dark" : "light",
    language: "en",
    timezone: "EAT (UTC+03:00)",
    currency: "ETB",
    emailNotifs: true,
    pushNotifs: false,
    securityAlerts: true,
    weeklyDigest: false,
    twoFactor: true,
    sessionTimeout: "30",
  });

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  // Handle generic changes
  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    // If changing theme, trigger the parent handler immediately
    if (field === "theme" && onDarkModeToggle) {
      onDarkModeToggle(value === "dark");
    }
  };

  const handleToggle = (field) => {
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        darkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* --- Page Header --- */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                darkMode
                  ? "bg-slate-800 text-blue-400"
                  : "bg-white text-blue-600 shadow-sm"
              }`}
            >
              <FiMonitor size={24} />
            </div>
            System Settings
          </h1>
          <p
            className={`mt-1 text-sm ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            Configure your workspace appearance and preferences.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
        >
          <FiSave /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* --- Column 1: Appearance & Regional (Left) --- */}
        <div className="space-y-6">
          {/* Appearance Card */}
          <SettingCard title="Appearance" icon={FiSun} darkMode={darkMode}>
            <div className="space-y-4">
              <label
                className={`text-sm font-medium ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Interface Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                <ThemeOption
                  label="Light"
                  icon={FiSun}
                  active={settings.theme === "light"}
                  onClick={() => handleChange("theme", "light")}
                  darkMode={darkMode}
                />
                <ThemeOption
                  label="Dark"
                  icon={FiMoon}
                  active={settings.theme === "dark"}
                  onClick={() => handleChange("theme", "dark")}
                  darkMode={darkMode}
                />
                <ThemeOption
                  label="System"
                  icon={FiMonitor}
                  active={settings.theme === "system"}
                  onClick={() => handleChange("theme", "system")}
                  darkMode={darkMode}
                />
              </div>
            </div>
          </SettingCard>

          {/* Regional Card */}
          <SettingCard
            title="Regional Settings"
            icon={FiGlobe}
            darkMode={darkMode}
          >
            <div className="space-y-4">
              <SelectInput
                label="Language"
                value={settings.language}
                onChange={(e) => handleChange("language", e.target.value)}
                options={[
                  { value: "en", label: "🇬🇧 English (UK)" },
                  { value: "am", label: "🇪🇹 Amharic" },
                  { value: "fr", label: "🇫🇷 French" },
                ]}
                darkMode={darkMode}
              />
              <SelectInput
                label="Time Zone"
                value={settings.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                options={[
                  { value: "EAT", label: "(GMT+03:00) Addis Ababa" },
                  { value: "GMT", label: "(GMT+00:00) London" },
                  { value: "EST", label: "(GMT-05:00) New York" },
                ]}
                darkMode={darkMode}
              />
              <SelectInput
                label="Currency Format"
                value={settings.currency}
                onChange={(e) => handleChange("currency", e.target.value)}
                options={[
                  { value: "ETB", label: "ETB (Birr)" },
                  { value: "USD", label: "USD ($)" },
                  { value: "EUR", label: "EUR (€)" },
                ]}
                darkMode={darkMode}
              />
            </div>
          </SettingCard>
        </div>

        {/* --- Column 2: Notifications (Center) --- */}
        <div className="space-y-6">
          <SettingCard title="Notifications" icon={FiBell} darkMode={darkMode}>
            <div className="space-y-6">
              <div className="space-y-4">
                <h4
                  className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Channels
                </h4>
                <ToggleRow
                  label="Email Notifications"
                  desc="Receive daily summaries via email"
                  checked={settings.emailNotifs}
                  onChange={() => handleToggle("emailNotifs")}
                  darkMode={darkMode}
                />
                <ToggleRow
                  label="Push Notifications"
                  desc="Real-time alerts on your device"
                  checked={settings.pushNotifs}
                  onChange={() => handleToggle("pushNotifs")}
                  darkMode={darkMode}
                />
              </div>

              <div
                className={`h-px w-full ${
                  darkMode ? "bg-slate-700" : "bg-slate-100"
                }`}
              />

              <div className="space-y-4">
                <h4
                  className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Alert Types
                </h4>
                <ToggleRow
                  label="Security Alerts"
                  desc="Logins from new devices"
                  checked={settings.securityAlerts}
                  onChange={() => handleToggle("securityAlerts")}
                  darkMode={darkMode}
                />
                <ToggleRow
                  label="Weekly Digest"
                  desc="Summary of team performance"
                  checked={settings.weeklyDigest}
                  onChange={() => handleToggle("weeklyDigest")}
                  darkMode={darkMode}
                />
              </div>
            </div>
          </SettingCard>
        </div>

        {/* --- Column 3: Security (Right) --- */}
        <div className="space-y-6">
          <SettingCard title="Security" icon={FiShield} darkMode={darkMode}>
            <div className="space-y-6">
              {/* Password Change */}
              <div className="space-y-3">
                <h4
                  className={`text-sm font-medium ${
                    darkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Change Password
                </h4>
                <div className="space-y-3">
                  <PasswordInput
                    placeholder="Current Password"
                    value={passwordForm.current}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        current: e.target.value,
                      })
                    }
                    darkMode={darkMode}
                  />
                  <PasswordInput
                    placeholder="New Password"
                    value={passwordForm.new}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, new: e.target.value })
                    }
                    darkMode={darkMode}
                  />
                  <button
                    className={`w-full py-2 rounded-lg text-sm font-medium border border-dashed transition-colors ${
                      darkMode
                        ? "border-slate-600 text-slate-400 hover:text-white hover:border-slate-500"
                        : "border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-400"
                    }`}
                  >
                    Update Password
                  </button>
                </div>
              </div>

              <div
                className={`h-px w-full ${
                  darkMode ? "bg-slate-700" : "bg-slate-100"
                }`}
              />

              {/* 2FA & Session */}
              <div className="space-y-4">
                <ToggleRow
                  label="Two-Factor Auth"
                  desc="Extra security layer (2FA)"
                  checked={settings.twoFactor}
                  onChange={() => handleToggle("twoFactor")}
                  darkMode={darkMode}
                />

                <SelectInput
                  label="Session Timeout"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    handleChange("sessionTimeout", e.target.value)
                  }
                  options={[
                    { value: "15", label: "15 Minutes" },
                    { value: "30", label: "30 Minutes" },
                    { value: "60", label: "1 Hour" },
                  ]}
                  darkMode={darkMode}
                />
              </div>

              <div
                className={`p-4 rounded-xl flex items-start gap-3 ${
                  darkMode
                    ? "bg-blue-900/20 text-blue-200"
                    : "bg-blue-50 text-blue-700"
                }`}
              >
                <FiSmartphone className="mt-1" />
                <div>
                  <p className="text-sm font-semibold">Active Session</p>
                  <p className="text-xs opacity-80">
                    Windows 11 • Chrome • Addis Ababa
                  </p>
                </div>
              </div>
            </div>
          </SettingCard>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components ---

const SettingCard = ({ title, icon: Icon, children, darkMode }) => (
  <div
    className={`p-6 rounded-2xl border shadow-sm h-full ${
      darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
    }`}
  >
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
      <Icon
        className={darkMode ? "text-slate-400" : "text-slate-400"}
        size={20}
      />
      <h2 className="text-lg font-bold">{title}</h2>
    </div>
    {children}
  </div>
);

const ThemeOption = ({ label, icon: Icon, active, onClick, darkMode }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200
      ${
        active
          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          : darkMode
          ? "border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700"
          : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
      }`}
  >
    <Icon size={24} className="mb-2" />
    <span className="text-xs font-semibold">{label}</span>
    {active && (
      <div className="absolute top-2 right-2 text-blue-500">
        <FiCheck size={14} />
      </div>
    )}
  </button>
);

const SelectInput = ({ label, value, onChange, options, darkMode }) => (
  <div>
    <label
      className={`block text-xs font-medium mb-1.5 uppercase tracking-wide ${
        darkMode ? "text-slate-500" : "text-slate-400"
      }`}
    >
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all
          ${
            darkMode
              ? "bg-slate-900 border-slate-700 text-white"
              : "bg-slate-50 border-slate-200 text-slate-900"
          }`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  </div>
);

const ToggleRow = ({ label, desc, checked, onChange, darkMode }) => (
  <div className="flex items-center justify-between">
    <div>
      <p
        className={`text-sm font-medium ${
          darkMode ? "text-slate-200" : "text-slate-700"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}
      >
        {desc}
      </p>
    </div>
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 
        ${
          checked ? "bg-blue-600" : darkMode ? "bg-slate-600" : "bg-slate-200"
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition  duration-200 ease-in-out ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

const PasswordInput = ({ value, onChange, placeholder, darkMode }) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
      <FiLock size={16} />
    </div>
    <input
      type="password"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all
        ${
          darkMode
            ? "bg-slate-900 border-slate-700 text-white placeholder-slate-500"
            : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
        }`}
    />
  </div>
);

export default SettingsPage;
