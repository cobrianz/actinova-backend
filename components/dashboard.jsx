"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { Users, Award, BookOpen, TrendingUp, CalendarIcon, Plus } from "lucide-react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import AddEventModal from "./modals/add-event-modal"

const kpiData = [
  { title: "Users Today", value: "1,234", change: "+12%", icon: Users, color: "blue", trend: "up" },
  { title: "Certificates Issued", value: "89", change: "+8%", icon: Award, color: "green", trend: "up" },
  { title: "Active Courses", value: "45", change: "+3%", icon: BookOpen, color: "purple", trend: "up" },
  { title: "Upgrade Conversions", value: "23", change: "+15%", icon: TrendingUp, color: "orange", trend: "up" },
]

const dailyUsersData = [
  { date: "Mon", users: 1200, revenue: 2400 },
  { date: "Tue", users: 1350, revenue: 2700 },
  { date: "Wed", users: 1100, revenue: 2200 },
  { date: "Thu", users: 1400, revenue: 2800 },
  { date: "Fri", users: 1600, revenue: 3200 },
  { date: "Sat", users: 1300, revenue: 2600 },
  { date: "Sun", users: 1100, revenue: 2200 },
]

const topCoursesData = [
  { course: "React Basics", completions: 245, rating: 4.8 },
  { course: "Python for AI", completions: 189, rating: 4.9 },
  { course: "Data Science", completions: 156, rating: 4.7 },
  { course: "Machine Learning", completions: 134, rating: 4.6 },
  { course: "Web Development", completions: 98, rating: 4.5 },
]

const planDistributionData = [
  { name: "Free", value: 65, color: "#8884d8", users: 1250 },
  { name: "Pro", value: 25, color: "#82ca9d", users: 480 },
  { name: "Enterprise", value: 10, color: "#ffc658", users: 192 },
]

const revenueData = [
  { month: "Jan", revenue: 12000, subscriptions: 120 },
  { month: "Feb", revenue: 15000, subscriptions: 150 },
  { month: "Mar", revenue: 18000, subscriptions: 180 },
  { month: "Apr", revenue: 22000, subscriptions: 220 },
  { month: "May", revenue: 25000, subscriptions: 250 },
  { month: "Jun", revenue: 28000, subscriptions: 280 },
]

export default function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState({
    "2024-01-15": [
      { id: 1, title: "Certificate Generation: React Course", type: "certificate", time: "10:00 AM" },
      { id: 2, title: "Team Meeting", type: "meeting", time: "2:00 PM" },
    ],
    "2024-01-18": [{ id: 3, title: "New Course Launch: Advanced AI", type: "course", time: "9:00 AM" }],
    "2024-01-22": [{ id: 4, title: "Webinar: Career Guidance", type: "webinar", time: "3:00 PM" }],
  })
  const [showAddEventModal, setShowAddEventModal] = useState(false)

  const formatDate = (date) => {
    return date.toISOString().split("T")[0]
  }

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date)
    return events[dateStr] || []
  }

  const handleAddEvent = (eventData) => {
    const dateStr = formatDate(new Date(eventData.date))
    setEvents((prev) => ({
      ...prev,
      [dateStr]: [...(prev[dateStr] || []), eventData],
    }))
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-600"
      case "webinar":
        return "bg-green-100 text-green-600"
      case "course":
        return "bg-purple-100 text-purple-600"
      case "certificate":
        return "bg-yellow-100 text-yellow-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{kpi.value}</p>
                  <div className="flex items-center mt-2">
                    <p
                      className={`text-sm font-medium ${kpi.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
                    >
                      {kpi.change}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">vs last week</span>
                  </div>
                </div>
                <div className={`p-4 rounded-xl bg-gradient-to-r from-${kpi.color}-500 to-${kpi.color}-600`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced Daily Active Users Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Active Users & Revenue</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">Users</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                <span className="text-gray-600 dark:text-gray-400">Revenue</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyUsersData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUsers)" />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Enhanced Top Courses Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performing Courses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCoursesData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="course" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="completions" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Plan Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscription Plans</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={planDistributionData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {planDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {planDistributionData.map((plan, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: plan.color }}></div>
                  <span className="text-gray-600 dark:text-gray-400">{plan.name}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{plan.users} users</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Scheduled Events
            </h3>
            <button
              onClick={() => setShowAddEventModal(true)}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Event
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="w-full border-0"
                tileClassName={({ date }) => {
                  const dateStr = formatDate(date)
                  return events[dateStr] ? "bg-blue-100 dark:bg-blue-900 text-blue-600 font-semibold" : ""
                }}
              />
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                Events for {selectedDate.toDateString()}:
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {getEventsForDate(selectedDate).map((event, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{event.title}</p>
                        {event.time && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{event.time}</p>}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </div>
                  </div>
                ))}
                {getEventsForDate(selectedDate).length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 text-center py-8">
                    No events scheduled for this date
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Revenue Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue & Subscription Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} />
            <Line type="monotone" dataKey="subscriptions" stroke="#3B82F6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Add Event Modal */}
      <AddEventModal
        isOpen={showAddEventModal}
        onClose={() => setShowAddEventModal(false)}
        selectedDate={selectedDate}
        onSave={handleAddEvent}
      />
    </div>
  )
}
