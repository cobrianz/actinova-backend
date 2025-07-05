"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Download, Award, CalendarIcon, User, BookOpen, Plus, Eye, X, Trash2 } from "lucide-react"
import Calendar from "react-calendar"
import "react-calendar/dist/Calendar.css"
import { toast } from "sonner"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

export default function Certificates() {
  const [certificates, setCertificates] = useState([])
  const [users, setUsers] = useState([])
  const [courses, setCourses] = useState([])
  const [analytics, setAnalytics] = useState({ statusDistribution: [], certificatesByCourse: [] })
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showManualGenerator, setShowManualGenerator] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [showUnrevokeModal, setShowUnrevokeModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [certificateToRevoke, setCertificateToRevoke] = useState(null)
  const [certificateToUnrevoke, setCertificateToUnrevoke] = useState(null)
  const [certificateToDelete, setCertificateToDelete] = useState(null)
  const [previewCertificate, setPreviewCertificate] = useState(null)
  const [manualForm, setManualForm] = useState({
    userId: "",
    courseId: "",
    userName: "",
    courseName: "",
    skills: ["JavaScript", "Programming", "Web Development"],
    finalScore: 95,
    achievementLevel: "Beginner",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [upcomingCompletions, setUpcomingCompletions] = useState({})

  // Fetch data on mount
  useEffect(() => {
    fetchCertificates()
    fetchUsers()
    fetchCourses()
    fetchUpcomingCompletions()
    fetchAnalytics()
  }, [])

  const fetchCertificates = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/certificates", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(await res.json().then(data => data.error || "Failed to fetch certificates"))
      const data = await res.json()
      setCertificates(data)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(await res.json().then(data => data.error || "Failed to fetch users"))
      const data = await res.json()
      setUsers(data.users.filter(user => user.type === "student"))
    } catch (error) {
      toast.error(error.message)
    }
  }

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(await res.json().then(data => data.error || "Failed to fetch courses"))
      const data = await res.json()
      setCourses(data)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const fetchUpcomingCompletions = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/enrollments/upcoming-completions", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(await res.json().then(data => data.error || "Failed to fetch upcoming completions"))
      const data = await res.json()
      setUpcomingCompletions(data)
    } catch (error) {
      console.error("Fetch upcoming completions error:", error.message)
      setUpcomingCompletions({})
    }
  }

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/certificates/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(await res.json().then(data => data.error || "Failed to fetch analytics"))
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const formatDate = (date) => {
    return date.toISOString().split("T")[0]
  }

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date)
    return upcomingCompletions[dateStr] || []
  }

  const handleManualGenerate = async () => {
    if (!manualForm.userId || !manualForm.courseId) {
      toast.error("Please select a student and course")
      return
    }

    setIsGenerating(true)
    try {
      const token = localStorage.getItem("token")
      const selectedUser = users.find(user => user.id === manualForm.userId)
      const selectedCourse = courses.find(course => course._id === manualForm.courseId)

      const certificateData = {
        userId: manualForm.userId,
        courseId: manualForm.courseId,
        userName: selectedUser.name,
        courseName: selectedCourse.title,
        skills: manualForm.skills,
        finalScore: manualForm.finalScore,
        achievementLevel: manualForm.achievementLevel,
      }

      console.log("Generating certificate with data:", certificateData)

      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(certificateData),
      })

      if (!res.ok) throw new Error(await res.json().then(data => data.error || "Failed to generate certificate"))
      const newCertificate = await res.json()
      setCertificates((prev) => [newCertificate, ...prev])
      setManualForm({ userId: "", courseId: "", userName: "", courseName: "", skills: ["JavaScript", "Programming", "Web Development"], finalScore: 95, achievementLevel: "Beginner" })
      setShowManualGenerator(false)
      toast.success("Certificate generated successfully!")
      fetchAnalytics() // Refresh analytics
    } catch (error) {
      console.error("Generate certificate error:", error.message)
      toast.error(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRevokeCertificate = async () => {
    if (!certificateToRevoke) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/certificates/${certificateToRevoke._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "revoke" }),
      })
      if (!res.ok) throw new Error(await res.json().then(data => data.error || "Failed to revoke certificate"))
      const updatedCertificate = await res.json()
      setCertificates((prev) => prev.map((cert) => (cert._id === updatedCertificate._id ? updatedCertificate : cert)))
      setShowRevokeModal(false)
      setCertificateToRevoke(null)
      toast.success("Certificate revoked")
      fetchAnalytics() // Refresh analytics
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleUnrevokeCertificate = async () => {
    if (!certificateToUnrevoke) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/certificates/${certificateToUnrevoke._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "unrevoke" }),
      })
      if (!res.ok) throw new Error(await res.json().then(data => data.error || "Failed to unrevoke certificate"))
      const updatedCertificate = await res.json()
      setCertificates((prev) => prev.map((cert) => (cert._id === updatedCertificate._id ? updatedCertificate : cert)))
      setShowUnrevokeModal(false)
      setCertificateToUnrevoke(null)
      toast.success("Certificate unrevoked")
      fetchAnalytics() // Refresh analytics
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDeleteCertificate = async () => {
    if (!certificateToDelete) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/certificates/${certificateToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(await res.json().then(data => data.error || "Failed to delete certificate"))
      setCertificates((prev) => prev.filter((cert) => cert._id !== certificateToDelete._id))
      setShowDeleteModal(false)
      setCertificateToDelete(null)
      toast.success("Certificate deleted")
      fetchAnalytics() // Refresh analytics
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDownload = async (certificate) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/certificates/${certificate._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(await res.json().then(data => data.error || "Failed to download certificate"))
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${certificate.certificateId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success(`Downloaded certificate for ${certificate.userName}`)
      fetchAnalytics() // Refresh analytics
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handlePreview = (certificate) => {
    setPreviewCertificate(certificate)
    setShowPreviewModal(true)
  }

  const getStatusColor = (status) => {
    return status === "Issued" ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100"
  }

  const COLORS = ["#10B981", "#EF4444"]

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Revoke Confirmation Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Revocation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to revoke the certificate "{certificateToRevoke.certificateId}" for {certificateToRevoke.userName}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRevokeModal(false)
                  setCertificateToRevoke(null)
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeCertificate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unrevoke Confirmation Modal */}
      {showUnrevokeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Unrevoke
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to unrevoke the certificate "{certificateToUnrevoke.certificateId}" for {certificateToUnrevoke.userName}?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowUnrevokeModal(false)
                  setCertificateToUnrevoke(null)
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUnrevokeCertificate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Unrevoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete the certificate "{certificateToDelete.certificateId}" for {certificateToDelete.userName}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setCertificateToDelete(null)
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCertificate}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Certificate Preview
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe
              src={previewCertificate.downloadUrl}
              className="w-full h-[500px] border border-gray-200 dark:border-gray-700 rounded-lg"
              title="Certificate Preview"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => handleDownload(previewCertificate)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Certificate System
        </h1>
        <button
          onClick={() => setShowManualGenerator(!showManualGenerator)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
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
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Manual Certificate Generator</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Student</label>
              <select
                value={manualForm.userId}
                onChange={(e) => {
                  const user = users.find(u => u.id === e.target.value)
                  setManualForm((prev) => ({ ...prev, userId: e.target.value, userName: user?.name || "" }))
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a student</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Course</label>
              <select
                value={manualForm.courseId}
                onChange={(e) => {
                  const course = courses.find(c => c._id === e.target.value)
                  setManualForm((prev) => ({ ...prev, courseId: e.target.value, courseName: course?.title || "" }))
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>{course.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills (comma-separated)</label>
              <input
                type="text"
                value={manualForm.skills.join(", ")}
                onChange={(e) => setManualForm((prev) => ({ ...prev, skills: e.target.value.split(", ").map(s => s.trim()) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., JavaScript, Programming, Web Development"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Final Score (%)</label>
              <input
                type="number"
                value={manualForm.finalScore}
                onChange={(e) => setManualForm((prev) => ({ ...prev, finalScore: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 95"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Achievement Level</label>
              <select
                value={manualForm.achievementLevel}
                onChange={(e) => setManualForm((prev) => ({ ...prev, achievementLevel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
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
              disabled={isGenerating}
              className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isGenerating ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                  Generating...
                </div>
              ) : (
                "Generate Certificate"
              )}
            </button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Certificates Table */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Certificates</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Student
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
                        key={certificate._id}
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
                              onClick={() => handlePreview(certificate)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              disabled={certificate.status === "Revoked"}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(certificate)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              disabled={certificate.status === "Revoked"}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {certificate.status === "Issued" ? (
                              <button
                                onClick={() => {
                                  setCertificateToRevoke(certificate)
                                  setShowRevokeModal(true)
                                }}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                              >
                                Revoke
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setCertificateToUnrevoke(certificate)
                                  setShowUnrevokeModal(true)
                                }}
                                className="text-green-600 hover:text-green-900 p-1 rounded"
                              >
                                Unrevoke
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setCertificateToDelete(certificate)
                                setShowDeleteModal(true)
                              }}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Upcoming Completions
            </h3>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              tileClassName={({ date }) => {
                const dateStr = formatDate(date)
                return upcomingCompletions[dateStr]
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 font-semibold rounded"
                  : ""
              }}
              calendarType="gregory"
            />
            <style jsx>{`
              .react-calendar {
                background: transparent !important;
                border: none !important;
              }
              .react-calendar__tile {
                color: #1f2937;
                padding: 8px;
                border-radius: 4px;
              }
              .react-calendar__tile:enabled:hover {
                background: #e5e7eb !important;
              }
              .dark .react-calendar__tile {
                color: #d1d5db !important;
              }
              .dark .react-calendar__tile:enabled:hover {
                background: #374151 !important;
              }
              .react-calendar__month-view__weekdays__weekday abbr {
                text-decoration: none !important;
                color: #6b7280;
              }
              .dark .react-calendar__month-view__weekdays__weekday abbr {
                color: #9ca3af !important;
              }
              .react-calendar__navigation button {
                color: #1f2937 !important;
                font-weight: 600;
              }
              .dark .react-calendar__navigation button {
                color: #d1d5db !important;
              }
              .react-calendar__tile--active {
                background: #2563eb !important;
                color: white !important;
              }
            `}</style>
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">{selectedDate.toDateString()}:</h4>
              <div className="space-y-2">
                {getEventsForDate(selectedDate).map((event, index) => (
                  <div
                    key={index}
                    className="flex items-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg"
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
      )}

      {/* Auto-issue Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Auto-issue Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{certificates.filter(c => c.issueDate === formatDate(new Date())).length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Certificates Issued Today</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{Object.values(upcomingCompletions).flat().length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Completions</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Failed Generations</div>
          </div>
        </div>
      </div>

      {/* Certificate Analytics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Certificate Analytics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Status Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {analytics.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Certificates by Course</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.certificatesByCourse}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}