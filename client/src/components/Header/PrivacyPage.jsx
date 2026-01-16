import React, { useState } from "react";
import {
  FiShield,
  FiLock,
  FiGlobe,
  FiEye,
  FiDownload,
  FiTrash2,
  FiFileText,
  FiMapPin,
  FiDatabase,
  FiSmartphone,
} from "react-icons/fi";

const PrivacyPage = ({ user, darkMode }) => {
  const [settings, setSettings] = useState({
    profileVisibility: "team",
    showEmail: false,
    showPhone: false,
    activityVisibility: "team",
    dataSharing: false,
    cookieConsent: true,
    locationTracking: false,
    marketingEmails: false,
  });

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExport = () =>
    alert("Request received. Check your email shortly.");
  const handleDelete = () => {
    if (window.confirm("Delete all data? This cannot be undone."))
      alert("Deletion scheduled.");
  };

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        darkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <FiShield className="text-blue-500" /> Privacy & Data Control
        </h1>
        <p
          className={`mt-1 text-sm ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Manage how your data is shared and visible across the organization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
        {/* Section 1: Visibility */}
        <Section
          title="Profile Visibility"
          description="Control who sees your personal details"
          icon={FiEye}
          darkMode={darkMode}
        >
          <div className="space-y-6">
            {/* Radio Group */}
            <div>
              <label
                className={`block text-sm font-medium mb-3 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Who can see your profile?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["public", "team", "private"].map((option) => (
                  <button
                    key={option}
                    onClick={() =>
                      setSettings((s) => ({ ...s, profileVisibility: option }))
                    }
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all
                      ${
                        settings.profileVisibility === option
                          ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-500"
                          : darkMode
                          ? "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    {option === "public" && (
                      <FiGlobe size={20} className="mb-2" />
                    )}
                    {option === "team" && (
                      <FiDatabase size={20} className="mb-2" />
                    )}
                    {option === "private" && (
                      <FiLock size={20} className="mb-2" />
                    )}
                    <span className="capitalize text-sm font-medium">
                      {option}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <ToggleRow
                label="Show Email Address"
                desc="Allow team to see your email"
                checked={settings.showEmail}
                onChange={() => toggleSetting("showEmail")}
                darkMode={darkMode}
              />
              <ToggleRow
                label="Show Phone Number"
                desc="Allow team to contact via phone"
                checked={settings.showPhone}
                onChange={() => toggleSetting("showPhone")}
                darkMode={darkMode}
              />
            </div>
          </div>
        </Section>

        {/* Section 2: Data & Tracking */}
        <Section
          title="Data & Tracking"
          description="Manage data collection preferences"
          icon={FiDatabase}
          darkMode={darkMode}
        >
          <div className="space-y-4">
            <ToggleRow
              label="Analytics Sharing"
              desc="Help us improve with anonymous data"
              checked={settings.dataSharing}
              onChange={() => toggleSetting("dataSharing")}
              darkMode={darkMode}
            />
            <ToggleRow
              label="Location Services"
              desc="Enable location-based features"
              checked={settings.locationTracking}
              onChange={() => toggleSetting("locationTracking")}
              darkMode={darkMode}
            />
            <ToggleRow
              label="Marketing Emails"
              desc="Receive updates about new features"
              checked={settings.marketingEmails}
              onChange={() => toggleSetting("marketingEmails")}
              darkMode={darkMode}
            />
            <ToggleRow
              label="Essential Cookies"
              desc="Required for basic functionality"
              checked={settings.cookieConsent}
              onChange={() => toggleSetting("cookieConsent")}
              darkMode={darkMode}
            />
          </div>
        </Section>

        {/* Section 3: Data Rights (Full Width) */}
        <div className="lg:col-span-2">
          <Section
            title="Your Data Rights"
            description="Export or delete your personal data"
            icon={FiFileText}
            darkMode={darkMode}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionCard
                icon={FiDownload}
                title="Export Data"
                desc="Download a copy of your personal data in JSON format."
                btnText="Start Export"
                onClick={handleExport}
                darkMode={darkMode}
              />
              <ActionCard
                icon={FiTrash2}
                title="Delete Account"
                desc="Permanently remove your account and all associated data."
                btnText="Delete Data"
                btnColor="red"
                onClick={handleDelete}
                darkMode={darkMode}
              />
            </div>
          </Section>
        </div>

        {/* Bottom Actions */}
        <div className="lg:col-span-2 flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              darkMode
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Reset to Default
          </button>
          <button className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
            Save Privacy Settings
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub Components for Privacy ---

const Section = ({ title, description, icon: Icon, children, darkMode }) => (
  <div
    className={`p-6 rounded-2xl border shadow-sm ${
      darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
    }`}
  >
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700">
      <div
        className={`p-2 rounded-lg ${
          darkMode ? "bg-slate-700 text-blue-400" : "bg-blue-50 text-blue-600"
        }`}
      >
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p
          className={`text-xs ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {description}
        </p>
      </div>
    </div>
    {children}
  </div>
);

const ToggleRow = ({ label, desc, checked, onChange, darkMode }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <h4 className="text-sm font-medium">{label}</h4>
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
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out
          ${checked ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  </div>
);

const ActionCard = ({
  icon: Icon,
  title,
  desc,
  btnText,
  btnColor = "blue",
  onClick,
  darkMode,
}) => (
  <div
    className={`p-4 rounded-xl border flex flex-col items-start gap-3 transition-colors
    ${
      darkMode
        ? "bg-slate-900/50 border-slate-700"
        : "bg-slate-50 border-slate-200"
    }`}
  >
    <div
      className={`p-2 rounded-lg ${
        btnColor === "red"
          ? "bg-red-100 text-red-600 dark:bg-red-900/20"
          : "bg-blue-100 text-blue-600 dark:bg-blue-900/20"
      }`}
    >
      <Icon size={18} />
    </div>
    <div>
      <h4 className="font-semibold text-sm">{title}</h4>
      <p
        className={`text-xs mb-3 ${
          darkMode ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {desc}
      </p>
    </div>
    <button
      onClick={onClick}
      className={`mt-auto px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all
        ${
          btnColor === "red"
            ? "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 dark:text-red-400"
            : darkMode
            ? "border-slate-600 text-slate-300 hover:bg-slate-800"
            : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
        }`}
    >
      {btnText}
    </button>
  </div>
);

export default PrivacyPage;
