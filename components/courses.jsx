"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Eye, Trash2, Users, BarChart3, Save, X, Star, Download, Book } from "lucide-react"
import { toast } from "sonner"
import CourseAnalytics from "./CourseAnalytics"
import { Parser } from "json2csv"

export default function EnhancedCoursesInline() {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [analyticsCourse, setAnalyticsCourse] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState(null)
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    level: "Beginner",
    tags: "",
    skills: "",
    roadmapSteps: [],
    price: 0,
    duration: "",
    instructor: "",
    status: "Draft",
  })

  // Fetch courses on mount
  useEffect(() => {
    fetchCourses()
  }, [])

  // Global search listener
  useEffect(() => {
    const handleGlobalSearch = (event) => {
      setSearchTerm(event.detail)
      handleSearch(event.detail)
    }
    window.addEventListener("globalSearch", handleGlobalSearch)
    return () => window.removeEventListener("globalSearch", handleGlobalSearch)
  }, [courses])

  const fetchCourses = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(await res.json().then(data => data.error || "Failed to fetch courses"))
      const data = await res.json()
      setCourses(data)
      setFilteredCourses(data)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (term) => {
    const filtered = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(term.toLowerCase()) ||
        course.description.toLowerCase().includes(term.toLowerCase()) ||
        course.instructor.toLowerCase().includes(term.toLowerCase()),
    )
    setFilteredCourses(filtered)
  }

  const handleCreateNew = () => {
    setEditForm({
      title: "",
      description: "",
      level: "Beginner",
      tags: "",
      skills: "",
      roadmapSteps: [],
      price: 0,
      duration: "",
      instructor: "",
      status: "Draft",
    })
    setIsCreating(true)
    setIsEditing(false)
    setIsPreviewing(false)
    setShowAnalytics(false)
    setIsAnalyticsLoading(false)
  }

  const handleEdit = (course) => {
    setEditForm({
      title: course.title,
      description: course.description,
      level: course.level,
      tags: course.tags.join(", "),
      skills: course.skills.join(", "),
      roadmapSteps: [...course.roadmapSteps],
      price: course.price,
      duration: course.duration,
      instructor: course.instructor,
      status: course.status,
    })
    setSelectedCourse(course)
    setIsEditing(true)
    setIsCreating(false)
    setIsPreviewing(false)
    setShowAnalytics(false)
    setIsAnalyticsLoading(false)
  }

  const handleDelete = async () => {
    if (!courseToDelete) return
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/courses/${courseToDelete._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(await res.json().then(data => data.error || "Failed to delete course"))
      setCourses(courses.filter((course) => course._id !== courseToDelete._id))
      setFilteredCourses(filteredCourses.filter((course) => course._id !== courseToDelete._id))
      toast.success("Course deleted successfully!")
      setShowDeleteModal(false)
      setCourseToDelete(null)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const openDeleteModal = (course) => {
    setCourseToDelete(course)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false)
    setCourseToDelete(null)
  }

  const handlePreview = (course) => {
    setSelectedCourse(course)
    setIsPreviewing(true)
    setIsEditing(false)
    setIsCreating(false)
    setShowAnalytics(false)
    setIsAnalyticsLoading(false)
  }

  const handleViewAnalytics = async (course) => {
    setIsAnalyticsLoading(true)
    setAnalyticsCourse(course)
    setShowAnalytics(true)
    setIsEditing(false)
    setIsCreating(false)
    setIsPreviewing(false)
    // Simulate loading delay (remove if analytics fetch is fast)
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsAnalyticsLoading(false)
  }

  const handlePublishToggle = async (course) => {
    try {
      const token = localStorage.getItem("token")
      const newStatus = course.status === "Published" ? "Draft" : "Published"
      const courseData = {
        title: course.title,
        description: course.description,
        level: course.level,
        tags: course.tags,
        skills: course.skills,
        roadmapSteps: course.roadmapSteps,
        price: course.price,
        duration: course.duration,
        instructor: course.instructor,
        status: newStatus,
      }
      console.log("Publishing course with data:", courseData) // Log data for debugging
      const res = await fetch(`/api/courses/${course._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      })
      if (!res.ok) throw new Error(await res.json().then(data => data.error || "Failed to update course status"))
      const updatedCourse = await res.json()
      setCourses(courses.map((c) => (c._id === updatedCourse._id ? updatedCourse : c)))
      setFilteredCourses(filteredCourses.map((c) => (c._id === updatedCourse._id ? updatedCourse : c)))
      toast.success(`Course ${newStatus === "Published" ? "published" : "unpublished"} successfully!`)
    } catch (error) {
      console.error("Publish toggle error:", error.message)
      toast.error(error.message)
    }
  }

  const handleSave = async () => {
    const courseData = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      level: editForm.level,
      tags: editForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      skills: editForm.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
      roadmapSteps: editForm.roadmapSteps.map(step => step.trim()).filter(Boolean),
      price: Number(editForm.price),
      duration: editForm.duration.trim(),
      instructor: editForm.instructor.trim(),
      status: editForm.status,
    }

    try {
      const token = localStorage.getItem("token")
      console.log("Saving course with data:", courseData, "ID:", isCreating ? "new" : selectedCourse._id) // Log data for debugging
      let res
      if (isCreating) {
        res = await fetch("/api/courses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(courseData),
        })
      } else {
        res = await fetch(`/api/courses/${selectedCourse._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(courseData),
        })
      }
      if (!res.ok) throw new Error(await res.json().then(data => data.error || "Failed to save course"))
      const updatedCourse = await res.json()
      if (isCreating) {
        setCourses([updatedCourse, ...courses])
        setFilteredCourses([updatedCourse, ...filteredCourses])
      } else {
        setCourses(courses.map((course) => (course._id === updatedCourse._id ? updatedCourse : course)))
        setFilteredCourses(filteredCourses.map((course) => (course._id === updatedCourse._id ? updatedCourse : course)))
      }
      toast.success(isCreating ? "Course created successfully!" : "Course updated successfully!")
      setIsEditing(false)
      setIsCreating(false)
    } catch (error) {
      console.error("Save course error:", error.message)
      toast.error(error.message)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setIsCreating(false)
    setIsPreviewing(false)
    setShowAnalytics(false)
    setSelectedCourse(null)
    setAnalyticsCourse(null)
    setIsAnalyticsLoading(false)
  }

  const addRoadmapStep = () => {
    setEditForm((prev) => ({
      ...prev,
      roadmapSteps: [...prev.roadmapSteps, ""],
    }))
  }

  const updateRoadmapStep = (index, value) => {
    setEditForm((prev) => ({
      ...prev,
      roadmapSteps: prev.roadmapSteps.map((step, i) => (i === index ? value : step)),
    }))
  }

  const removeRoadmapStep = (index) => {
    setEditForm((prev) => ({
      ...prev,
      roadmapSteps: prev.roadmapSteps.filter((_, i) => i !== index),
    }))
  }

  const downloadCoursesCSV = () => {
    try {
      const fields = ["_id", "title", "description", "status", "completionRate", "enrolledUsers", "level", "tags", "skills", "roadmapSteps", "price", "duration", "rating", "instructor"]
      const parser = new Parser({ fields })
      const csv = parser.parse(courses.map(course => ({
        ...course,
        tags: course.tags.join(", "),
        skills: course.skills.join(", "),
        roadmapSteps: course.roadmapSteps.join("; "),
      })))
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", "all_courses.csv")
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success("Courses exported to CSV!")
    } catch (error) {
      toast.error("Failed to export CSV")
    }
  }

  const getStatusColor = (status) => {
    return status === "Published" ? "text-green-600 bg-green-100" : "text-yellow-600 bg-yellow-100"
  }

  const getLevelColor = (level) => {
    switch (level) {
      case "Beginner":
        return "text-green-600 bg-green-100"
      case "Intermediate":
        return "text-yellow-600 bg-yellow-100"
      case "Advanced":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  if (isAnalyticsLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    )
  }

  if (showAnalytics) {
    return <CourseAnalytics course={analyticsCourse} onBack={handleCancel} />
  }

  if (isCreating || isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isCreating ? "Create New Course" : "Edit Course"}
          </h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={() => setEditForm((prev) => ({ ...prev, status: prev.status === "Published" ? "Draft" : "Published" }))}
              className={`flex items-center px-4 py-2 ${editForm.status === "Published" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-green-600 hover:bg-green-700"} text-white rounded-lg transition-colors`}
            >
              <Book className="w-4 h-4 mr-2" />
              {editForm.status === "Published" ? "Unpublish" : "Publish"}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isCreating ? "Create Course" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Course Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter course title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Course description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
                  <select
                    value={editForm.level}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, level: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="99"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration</label>
                  <input
                    type="text"
                    value={editForm.duration}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, duration: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="8 weeks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instructor</label>
                  <input
                    type="text"
                    value={editForm.instructor}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, instructor: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Instructor name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="React, JavaScript, Frontend"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={editForm.skills}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, skills: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Component Development, State Management"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Roadmap Steps</label>
                <button
                  type="button"
                  onClick={addRoadmapStep}
                  className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Step
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {editForm.roadmapSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-6">{index + 1}.</span>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => updateRoadmapStep(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Step description..."
                    />
                    <button
                      type="button"
                      onClick={() => removeRoadmapStep(index)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isPreviewing && selectedCourse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Course Preview
          </h1>
          <button
            onClick={handleCancel}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Close Preview
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedCourse.status)}`}
                >
                  {selectedCourse.status}
                </span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getLevelColor(selectedCourse.level)}`}>
                  {selectedCourse.level}
                </span>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{selectedCourse.rating}</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{selectedCourse.title}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">{selectedCourse.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedCourse.enrolledUsers}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Students</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedCourse.completionRate}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completion</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">${selectedCourse.price}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Price</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{selectedCourse.duration}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">What You'll Learn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedCourse.skills.map((skill, index) => (
                    <div key={index} className="flex items-center text-gray-700 dark:text-gray-300">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Course Roadmap</h3>
                <div className="space-y-3">
                  {selectedCourse.roadmapSteps.map((step, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                        {index + 1}
                      </div>
                      <span className="text-gray-900 dark:text-white">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Course Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Instructor:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{selectedCourse.instructor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Level:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{selectedCourse.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="text-gray-900 dark:text-white font-medium">{selectedCourse.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Price:</span>
                    <span className="text-gray-900 dark:text-white font-medium">${selectedCourse.price}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete the course "{courseToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Courses & Roadmaps
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage learning content</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={downloadCoursesCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All Courses
          </button>
          <button
            onClick={handleCreateNew}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search courses, instructors..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                handleSearch(e.target.value)
              }}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4">
            <select
              onChange={(e) => {
                const level = e.target.value
                setFilteredCourses(
                  level === "all"
                    ? courses
                    : courses.filter((course) => course.level.toLowerCase() === level),
                )
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}
                  >
                    {course.status}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{course.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(course.level)}`}
                  >
                    {course.level}
                  </span>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-1" />
                    {course.enrolledUsers}
                  </div>
                </div>

                {course.status === "Published" && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Completion Rate</span>
                      <span>{course.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${course.completionRate}%` }}></div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 mb-4">
                  {course.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {course.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                      +{course.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(course)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(course)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePreview(course)}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleViewAnalytics(course)}
                      className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePublishToggle(course)}
                      className={`p-2 ${course.status === "Published" ? "text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20" : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"} rounded-lg transition-colors`}
                    >
                      <Book className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">${course.price}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{course.duration}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}