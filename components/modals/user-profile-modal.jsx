"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, User, Award, BookOpen, TrendingUp } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const userProgressData = [
  { date: "Week 1", progress: 10 },
  { date: "Week 2", progress: 25 },
  { date: "Week 3", progress: 45 },
  { date: "Week 4", progress: 60 },
  { date: "Week 5", progress: 75 },
  { date: "Week 6", progress: 85 },
]

const userCoursesData = [
  { course: "React Basics", completion: 100, timeSpent: 24 },
  { course: "Python AI", completion: 75, timeSpent: 18 },
  { course: "Data Science", completion: 45, timeSpent: 12 },
]

export default function UserProfileModal({ user, isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!isOpen || !user) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <p className="text-blue-100">{user.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">{user.role}</span>
                    <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">{user.plan}</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: User },
                { id: "courses", label: "Courses", icon: BookOpen },
                { id: "analytics", label: "Analytics", icon: TrendingUp },
                { id: "certificates", label: "Certificates", icon: Award },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Join Date:</span>
                        <span className="text-gray-900 dark:text-white">{user.joinDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${user.status === "Active" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}
                        >
                          {user.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Progress:</span>
                        <span className="text-gray-900 dark:text-white">{user.progress}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Learning Stats</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">12</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Courses Enrolled</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">8</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">156</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Hours Learned</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">5</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Certificates</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Progress Over Time</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={userProgressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="progress" stroke="#3B82F6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "courses" && (
              <div className="space-y-4">
                {userCoursesData.map((course, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{course.course}</h4>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{course.timeSpent}h</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-4">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${course.completion}%` }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{course.completion}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Course Completion Rate</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={userCoursesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="course" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="completion" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === "certificates" && (
              <div className="space-y-4">
                {[1, 2, 3].map((cert) => (
                  <div
                    key={cert}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Award className="w-8 h-8 text-yellow-500" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">React Fundamentals Certificate</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Issued on Jan 15, 2024</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
