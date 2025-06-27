"use client";

import { useState, useEffect } from "react";
import { User, Save, Shield, Bell, Globe, Clock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function Profile({ onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState("personal");
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    timezone: "America/Los_Angeles",
    language: "English",
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: false,
    sessionTimeout: 30,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    securityAlerts: true,
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    if (!phone) return true; // Phone is optional
    const regex = /^\+[1-9]\d{1,14}$/;
    return regex.test(phone);
  };

  const validatePasswordStrength = (password) => {
    return /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\d]).{8,}/.test(password);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsFetching(true);
        const token = localStorage.getItem("token");
        console.log("profile.jsx: Fetching profile, token:", token ? "Present" : "Missing");
        if (!token) throw new Error("No authentication token provided");

        const res = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log("profile.jsx: /api/profile response:", data);
        if (!res.ok) throw new Error(data.message || "Failed to fetch profile");

        setProfileData({
          name: data.profile.name || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
          bio: data.profile.bio || "",
          location: data.profile.location || "",
          timezone: data.profile.timezone || "America/Los_Angeles",
          language: data.profile.language || "English",
        });
        setSecuritySettings({
          twoFactorAuth: data.profile.twoFactorAuth || false,
          loginAlerts: data.profile.loginAlerts || false,
          sessionTimeout: data.profile.sessionTimeout || 30,
        });
        setNotificationSettings({
          emailNotifications: data.profile.emailNotifications || true,
          pushNotifications: data.profile.pushNotifications || true,
          weeklyReports: data.profile.weeklyReports || true,
          securityAlerts: data.profile.securityAlerts || true,
        });
      } catch (error) {
        console.error("profile.jsx: Fetch error:", error.message);
        toast.error(error.message);
      } finally {
        setIsFetching(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    setErrors({});

    const newErrors = {};
    if (!profileData.name.trim()) newErrors.name = "Name is required";
    if (!profileData.email.trim()) newErrors.email = "Email is required";
    else if (!validateEmail(profileData.email)) newErrors.email = "Invalid email address";
    if (profileData.phone && !validatePhone(profileData.phone))
      newErrors.phone = "Use international format (e.g., +1234567890)";
    if (showPasswordForm) {
      if (!passwordData.newPassword) newErrors.newPassword = "New password is required";
      else if (!validatePasswordStrength(passwordData.newPassword))
        newErrors.newPassword = "Password must be 8+ chars, include uppercase, lowercase, number & symbol";
      if (passwordData.newPassword !== passwordData.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...profileData,
        ...securitySettings,
        ...notificationSettings,
      };
      if (showPasswordForm && passwordData.newPassword) {
        payload.password = passwordData.newPassword;
      }

      console.log("profile.jsx: Sending /api/profile PUT payload:", payload);
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("profile.jsx: /api/profile PUT response:", data);
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      toast.success("Profile updated successfully!");
      if (onProfileUpdate) onProfileUpdate();
      setShowPasswordForm(false);
      setPasswordData({ newPassword: "", confirmPassword: "" });
      setShowPassword(false);
      setShowConfirmPassword(false);
      setErrors((prev) => ({ ...prev, newPassword: undefined, confirmPassword: undefined }));
    } catch (error) {
      console.error("profile.jsx: Save error:", error.message);
      setErrors({ form: error.message });
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isFetching ? "Loading..." : profileData.name || "User"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {isFetching ? "Loading..." : profileData.email || "user@example.com"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
          <input
            type="text"
            value={isFetching ? "Loading..." : profileData.name}
            onChange={(e) => !isFetching && setProfileData((prev) => ({ ...prev, name: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isFetching}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
          <input
            type="email"
            value={isFetching ? "Loading..." : profileData.email}
            onChange={(e) => !isFetching && setProfileData((prev) => ({ ...prev, email: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isFetching}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
          <input
            type="tel"
            value={isFetching ? "Loading..." : profileData.phone}
            onChange={(e) => !isFetching && setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isFetching}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
          <input
            type="text"
            value={isFetching ? "Loading..." : profileData.location}
            onChange={(e) => !isFetching && setProfileData((prev) => ({ ...prev, location: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isFetching ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isFetching}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</label>
          <textarea
            value={isFetching ? "Loading..." : profileData.bio}
            onChange={(e) => !isFetching && setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isFetching ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isFetching}
          />
        </div>
      </div>
      {errors.form && <p className="text-red-500 text-sm">{errors.form}</p>}
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-yellow-600 mr-2" />
          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Keep your account secure with these settings
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isFetching ? false : securitySettings.twoFactorAuth}
              onChange={(e) => !isFetching && setSecuritySettings((prev) => ({ ...prev, twoFactorAuth: e.target.checked }))}
              className="sr-only peer"
              disabled={isFetching}
            />
            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">Login Alerts</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get notified of new login attempts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isFetching ? false : securitySettings.loginAlerts}
              onChange={(e) => !isFetching && setSecuritySettings((prev) => ({ ...prev, loginAlerts: e.target.checked }))}
              className="sr-only peer"
              disabled={isFetching}
            />
            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}></div>
          </label>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Session Timeout</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Automatically log out after period of inactivity
          </p>
          <select
            value={isFetching ? "Loading..." : securitySettings.sessionTimeout}
            onChange={(e) => !isFetching && setSecuritySettings((prev) => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isFetching}
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={120}>2 hours</option>
            <option value={0}>Never</option>
          </select>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Change Password</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Update your password regularly</p>
          {showPasswordForm ? (
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                    errors.newPassword ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({ newPassword: "", confirmPassword: "" });
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                    setErrors((prev) => ({ ...prev, newPassword: undefined, confirmPassword: undefined }));
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPasswordForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Change Password
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Globe className="w-4 h-4 inline mr-2" />
            Language
          </label>
          <select
            value={isFetching ? "Loading..." : profileData.language}
            onChange={(e) => !isFetching && setProfileData((prev) => ({ ...prev, language: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isFetching}
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Timezone
          </label>
          <select
            value={isFetching ? "Loading..." : profileData.timezone}
            onChange={(e) => !isFetching && setProfileData((prev) => ({ ...prev, timezone: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isFetching}
          >
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Notification Preferences
        </h3>

        {[
          { key: "emailNotifications", label: "Email Notifications", desc: "Receive notifications via email" },
          { key: "pushNotifications", label: "Push Notifications", desc: "Receive browser push notifications" },
          { key: "weeklyReports", label: "Weekly Reports", desc: "Get weekly summary reports" },
          { key: "securityAlerts", label: "Security Alerts", desc: "Important security notifications" },
        ].map((setting) => (
          <div
            key={setting.key}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{setting.label}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{setting.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isFetching ? false : notificationSettings[setting.key]}
                onChange={(e) => !isFetching && setNotificationSettings((prev) => ({ ...prev, [setting.key]: e.target.checked }))}
                className="sr-only peer"
                disabled={isFetching}
              />
              <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${isFetching ? "opacity-50 cursor-not-allowed" : ""}`}></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isLoading || isFetching}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: "personal", label: "Personal Info", icon: User },
            { id: "security", label: "Security", icon: Shield },
            { id: "preferences", label: "Preferences", icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === "personal" && renderPersonalInfo()}
          {activeTab === "security" && renderSecurity()}
          {activeTab === "preferences" && renderPreferences()}
        </div>
      </div>
    </div>
  );
}