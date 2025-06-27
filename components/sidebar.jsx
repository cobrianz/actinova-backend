"use client"

import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  FileText,
  CreditCard,
  HelpCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  MessageSquare,
  DollarSign,
} from "lucide-react"
import { useEffect } from "react"

// Role-based access control
const rolePermissions = {
  administrator: [
    "dashboard",
    "users",
    "courses",
    "certificates",
    "blog",
    "community",
    "revenue",
    "plans",
    "help",
    "profile",
    "settings",
  ],
  writer: ["dashboard", "blog", "community", "profile", "settings"],
  moderator: ["dashboard", "community", "users", "profile", "settings"],
  instructor: ["dashboard", "courses", "certificates", "community", "profile", "settings"],
  analyst: ["dashboard", "revenue", "courses", "users", "profile", "settings"],
  support: ["dashboard", "help", "community", "profile", "settings"],
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "community", label: "Community", icon: MessageSquare },
  { id: "revenue", label: "Revenue", icon: DollarSign },
  { id: "plans", label: "Plans", icon: CreditCard },
  { id: "help", label: "Help Center", icon: HelpCircle },
  { id: "profile", label: "Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
]

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, userRole = "administrator", user }) {

  // Get accessible tabs based on user role
  const accessibleTabs = rolePermissions[userRole] || rolePermissions.administrator

  // Filter menu items based on user permissions
  const filteredMenuItems = menuItems.filter((item) => accessibleTabs.includes(item.id))

  // Extract initials from user name for avatar
  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    return names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`
      : name.slice(0, 2).toUpperCase();
  }

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`relative left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-lg z-30 transition-all duration-300 ${
        sidebarOpen
          ? "w-full lg:w-64"
          : "w-16 lg:w-16 hidden lg:block"
      }`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Actinova AI</span>
            </motion.div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {getInitials(user.name)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email || "user@example.com"}
                </p>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                      userRole === "administrator"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : userRole === "writer"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : userRole === "moderator"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : userRole === "instructor"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                              : userRole === "analyst"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                    }`}
                  >
                    {userRole}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">Loading...</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Fetching user data...</p>
              </div>
            </div>
          )}
        </div>
      )}

      <nav className="mt-4 flex-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                isActive ? "bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-600" : ""
              }`}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-600 dark:text-gray-400"}`} />
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`ml-3 ${isActive ? "text-blue-600 font-medium" : "text-gray-700 dark:text-gray-300"}`}
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </nav>
    </motion.div>
  )
}