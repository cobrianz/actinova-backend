"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, Award, CalendarIcon, User, BookOpen, Plus } from "lucide-react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { toast } from "sonner"

const mockCertificates = [
  {
    id: 1,
    userName: "John Doe",
    userEmail: "john@example.com",
    courseName: "React Fundamentals",
    issueDate: "2024-01-15",
    status: "Issued",
    certificateId: "CERT-001-2024",
    downloadUrl: "#",
  },
  {
    id: 2,
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    courseName: "Python for AI",
    issueDate: "2024-01-12",
    status: "Issued",
    certificateId: "CERT-002-2024",
    downloadUrl: "#",
  },
  {
    id: 3,
    userName: "Mike Johnson",
    userEmail: "mike@example.com",
    courseName: "Data Science Bootcamp",
    issueDate: "2024-01-10",
    status: "Revoked",
    certificateId: "CERT-003-2024",
    downloadUrl: "#",
  },
]

const upcomingCompletions = {
  "2024-01-20": ["Sarah Wilson - Web Development"],
  "2024-01-22": ["Tom Brown - Machine Learning", "Alice Johnson - React Advanced"],
  "2024-01-25": ["Bob Smith - Data Analysis"],
}

export default function Certificates() {
  const [certificates, setCertificates] = useState(mockCertificates)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showManualGenerator, setShowManualGenerator] = useState(false)
  const [manualForm, setManualForm] = useState({
    userId: "",
    courseId: "",
    userName: "",
    courseName: "",
  })

  const formatDate = (date) => {
    return date.toISOString().split("T")[0]
  }

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date)
    return upcomingCompletions[dateStr] || []
  }

  const handleManualGenerate = () => {
    if (!manualForm.userName || !manualForm.courseName) {
      toast.error("Please fill in all required fields")
      return
    }

    const newCertificate = {
      id: certificates.length + 1,
      userName: manualForm.userName,
      userEmail: `${manualForm.userName.toLowerCase().replace(" ", ".")}@example.com`,
      courseName: manualForm.courseName,
      issueDate: new Date().toISOString().split("T")[0],
      status: "Issued",
      certificateId: `CERT-${String(certificates.length + 1).padStart(3, "0")}-2024`,
      downloadUrl: "#",
    }

    setCertificates((prev) => [newCertificate, ...prev])
    setManualForm({ userId: "", courseId: "", userName: "", courseName: "" })
    setShowManualGenerator(false)
    toast.success("Certificate generated successfully!")
  }

  const handleRevokeCertificate = (certificateId) => {
    setCertificates((prev) => prev.map((cert) => (cert.id === certificateId ? { ...cert, status: "Revoked" } : cert)))
    toast.success("Certificate revoked")
  }

  const handleDownload = (certificate) => {
    toast.success(`Downloading certificate for ${certificate.userName}`)
  }

  const getStatusColor = (status) => {
    return status === "Issued" ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Certificate System</h1>
        <button
          onClick={() => setShowManualGenerator(!showManualGenerator)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Manual Generate
        </button>
      </div>

      {/* Manual Certificate Generator */}
      {showManualGenerator && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Manual Certificate Generator</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">User Name</label>
              <input
                type="text"
                value={manualForm.userName}
                onChange={(e) => setManualForm((prev) => ({ ...prev, userName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Name</label>
              <input
                type="text"
                value={manualForm.courseName}
                onChange={(e) => setManualForm((prev) => ({ ...prev, courseName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter course name"
              />
            </div>
          </div>
          <div className="flex items-center justify-end space-x-4 mt-4">
            <button
              onClick={() => setShowManualGenerator(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleManualGenerate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Certificate
            </button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificates Table */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Certificates</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {certificates.map((certificate, index) => (
                    <motion.tr
                      key={certificate.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {certificate.userName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{certificate.userEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 dark:text-white">{certificate.courseName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {certificate.issueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(certificate.status)}`}
                        >
                          {certificate.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDownload(certificate)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            disabled={certificate.status === "Revoked"}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {certificate.status === "Issued" && (
                            <button
                              onClick={() => handleRevokeCertificate(certificate.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Upcoming Completions
          </h3>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="w-full"
            tileClassName={({ date }) => {
              const dateStr = formatDate(date)
              return upcomingCompletions[dateStr] ? "bg-blue-100 dark:bg-blue-900" : ""
            }}
          />
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{selectedDate.toDateString()}:</h4>
            <div className="space-y-1">
              {getEventsForDate(selectedDate).map((event, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded"
                >
                  <Award className="w-4 h-4 mr-2 text-yellow-500" />
                  {event}
                </div>
              ))}
              {getEventsForDate(selectedDate).length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-500">No completions scheduled</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auto-issue Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Auto-issue Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">89</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Certificates Issued Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Completions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">3</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Failed Generations</div>
          </div>
        </div>
      </div>
    </div>
  )
}
