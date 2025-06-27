"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, Save, ToggleLeft, ToggleRight, Download } from "lucide-react"
import { toast } from "sonner"

export default function Settings() {
  const [settings, setSettings] = useState({
    aiFeatures: {
      roadmapGeneration: true,
      chatTutor: true,
      autoCertificates: true,
      smartRecommendations: false,
    },
    branding: {
      logo: null,
      banner: null,
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
    },
    onboarding: {
      welcomeMessage: "Welcome to Actinova AI Tutor! Let's get you started on your learning journey.",
      introVideo: null,
      skipIntro: false,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: true,
      marketingEmails: false,
    },
  })

  const [systemLogs] = useState([
    {
      id: 1,
      timestamp: "2024-01-15 10:30:00",
      level: "INFO",
      message: "User authentication successful",
      module: "Auth",
    },
    {
      id: 2,
      timestamp: "2024-01-15 10:25:00",
      level: "WARNING",
      message: "High memory usage detected",
      module: "System",
    },
    {
      id: 3,
      timestamp: "2024-01-15 10:20:00",
      level: "ERROR",
      message: "Failed to generate certificate",
      module: "Certificates",
    },
    {
      id: 4,
      timestamp: "2024-01-15 10:15:00",
      level: "INFO",
      message: "Course published successfully",
      module: "Courses",
    },
    {
      id: 5,
      timestamp: "2024-01-15 10:10:00",
      level: "INFO",
      message: "Database backup completed",
      module: "Database",
    },
  ])

  const toggleAIFeature = (feature) => {
    setSettings((prev) => ({
      ...prev,
      aiFeatures: {
        ...prev.aiFeatures,
        [feature]: !prev.aiFeatures[feature],
      },
    }))
    toast.success(`${feature} ${settings.aiFeatures[feature] ? "disabled" : "enabled"}`)
  }

  const toggleNotification = (feature) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [feature]: !prev.notifications[feature],
      },
    }))
    toast.success(`${feature} ${settings.notifications[feature] ? "disabled" : "enabled"}`)
  }

  const handleFileUpload = (type, file) => {
    setSettings((prev) => ({
      ...prev,
      branding: {
        ...prev.branding,
        [type]: file,
      },
    }))
    toast.success(`${type} uploaded successfully`)
  }

  const handleColorChange = (type, color) => {
    setSettings((prev) => ({
      ...prev,
      branding: {
        ...prev.branding,
        [type]: color,
      },
    }))
  }

  const handleOnboardingChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      onboarding: {
        ...prev.onboarding,
        [field]: value,
      },
    }))
  }

  const saveSettings = () => {
    toast.success("Settings saved successfully!")
  }

  const getLevelColor = (level) => {
    switch (level) {
      case "ERROR":
        return "text-red-600 bg-red-100"
      case "WARNING":
        return "text-yellow-600 bg-yellow-100"
      case "INFO":
        return "text-blue-600 bg-blue-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
        <button
          onClick={saveSettings}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          Save All Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Features</h3>
          <div className="space-y-4">
            {Object.entries(settings.aiFeatures).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {feature.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {feature === "roadmapGeneration" && "Automatically generate personalized learning paths"}
                    {feature === "chatTutor" && "Enable AI-powered chat assistance"}
                    {feature === "autoCertificates" && "Automatically issue certificates upon completion"}
                    {feature === "smartRecommendations" && "Provide AI-based course recommendations"}
                  </p>
                </div>
                <button onClick={() => toggleAIFeature(feature)} className="flex items-center">
                  {enabled ? (
                    <ToggleRight className="w-8 h-8 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Branding Assets</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo</label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload("logo", e.target.files[0])}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </label>
                {settings.branding.logo && <span className="text-sm text-green-600">Logo uploaded</span>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Banner Image</label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload("banner", e.target.files[0])}
                  className="hidden"
                  id="banner-upload"
                />
                <label
                  htmlFor="banner-upload"
                  className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Banner
                </label>
                {settings.branding.banner && <span className="text-sm text-green-600">Banner uploaded</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Primary Color</label>
                <input
                  type="color"
                  value={settings.branding.primaryColor}
                  onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Secondary Color
                </label>
                <input
                  type="color"
                  value={settings.branding.secondaryColor}
                  onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                  className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Onboarding Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Onboarding Flow</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Welcome Message</label>
              <textarea
                value={settings.onboarding.welcomeMessage}
                onChange={(e) => handleOnboardingChange("welcomeMessage", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Intro Video</label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleOnboardingChange("introVideo", e.target.files[0])}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </label>
                {settings.onboarding.introVideo && <span className="text-sm text-green-600">Video uploaded</span>}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Skip Intro</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Let users skip the onboarding process</p>
              </div>
              <button
                onClick={() => handleOnboardingChange("skipIntro", !settings.onboarding.skipIntro)}
                className="flex items-center"
              >
                {settings.onboarding.skipIntro ? (
                  <ToggleRight className="w-8 h-8 text-blue-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notifications</h3>
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {feature.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {feature === "emailNotifications" && "Send email notifications to users"}
                    {feature === "pushNotifications" && "Send push notifications to mobile devices"}
                    {feature === "weeklyReports" && "Send weekly progress reports"}
                    {feature === "marketingEmails" && "Send promotional and marketing emails"}
                  </p>
                </div>
                <button onClick={() => toggleNotification(feature)} className="flex items-center">
                  {enabled ? (
                    <ToggleRight className="w-8 h-8 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* System Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Logs</h3>
          <button
            onClick={() => toast.info("Downloading system logs...")}
            className="flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Message
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {systemLogs.map((log, index) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{log.timestamp}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(log.level)}`}
                    >
                      {log.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{log.module}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{log.message}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
