"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  RefreshCw,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

export default function Navbar({
  darkMode,
  setDarkMode,
  setSidebarOpen,
  userRole = "administrator",
  user,
}) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "user",
      title: "New user registered",
      message: "John Doe just signed up",
      time: "2 minutes ago",
      read: false,
    },
    {
      id: 2,
      type: "certificate",
      title: "Certificate issued",
      message: "AI Fundamentals certificate issued to Sarah",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: 3,
      type: "course",
      title: "Course completed",
      message: "Machine Learning course completed by 5 students",
      time: "10 minutes ago",
      read: true,
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.success("Data refreshed successfully!");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Logged out successfully");
        localStorage.removeItem("token");
        window.location.reload();
      } else {
        toast.error("Logout failed");
      }
    } catch (err) {
      toast.error("Server error");
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between  mx-auto">
        {/* Left: Hamburger and Date/Time */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="hidden md:flex items-center space-x-2">
            <div className="flex flex-col">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentTime.toLocaleString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  second: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3">
          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Refresh"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[calc(100vh-100px)] overflow-y-auto"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 mx-4 mt-1"
                  >
                    Mark all as read
                  </button>
                )}
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                        !n.read ? "bg-blue-50 dark:bg-blue-900/10" : ""
                      }`}
                      onClick={() => markAsRead(n.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            !n.read ? "bg-blue-500" : "bg-gray-300"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {n.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {n.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title={darkMode ? "Light Mode" : "Dark Mode"}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* User Profile */}
          <div className="relative">
            <div
              className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center cursor-pointer"
              onMouseEnter={() => setShowUserDetails(true)}
              onMouseLeave={() => setShowUserDetails(false)}
              title="User Profile"
            >
              <span className="text-white font-medium text-sm">
                <User className="w-4 h-4" />
              </span>
            </div>
            {showUserDetails && user && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 p-4"
              >
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name || "User"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </p>
                  <p
                    className={`text-sm font-medium capitalize ${
                      userRole === "administrator"
                        ? "text-red-600 dark:text-red-400"
                        : userRole === "writer"
                        ? "text-green-600 dark:text-green-400"
                        : userRole === "moderator"
                        ? "text-blue-600 dark:text-blue-400"
                        : userRole === "instructor"
                        ? "text-purple-600 dark:text-purple-400"
                        : userRole === "analyst"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    Role: {userRole}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Last Login: {new Date(user.lastLogin).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Logout"
          >
            <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
}