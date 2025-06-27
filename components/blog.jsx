"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit, Eye, Trash2, Search, Save, X, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { toast } from "sonner"
import { jsPDF } from "jspdf"

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPost, setSelectedPost] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [viewMode, setViewMode] = useState("grid")
  const [isLoading, setIsLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [postToDelete, setPostToDelete] = useState(null)
  const modalRef = useRef(null)

  const [editForm, setEditForm] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    tags: "",
    category: "Technology",
    publishDate: "",
    status: "draft",
    featuredImage: "",
  })

  // Handle click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowDeleteModal(false)
        setPostToDelete(null)
      }
    }

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setShowDeleteModal(false)
        setPostToDelete(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscapeKey)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [])

  // Fetch posts with pagination and category filter
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem("token")
        if (!token) throw new Error("No authentication token provided")

        const url = `/api/posts?page=${currentPage}&limit=6${categoryFilter !== "all" ? `&category=${categoryFilter}` : ""}`
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const text = await res.text()
        let data
        try {
          data = JSON.parse(text)
        } catch {
          throw new Error("Server returned invalid JSON")
        }
        if (!res.ok) throw new Error(data.message || "Failed to fetch posts")

        setPosts(data.posts)
        setFilteredPosts(data.posts)
        setTotalPages(data.pagination.totalPages)
      } catch (error) {
        toast.error(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchPosts()
  }, [currentPage, categoryFilter])

  // Apply status filter and search
  useEffect(() => {
    let filtered = posts
    if (statusFilter !== "all") {
      filtered = posts.filter(
        (post) =>
          (post.status?.toLowerCase() === statusFilter.toLowerCase()) ||
          (!post.status && statusFilter.toLowerCase() === "draft")
      )
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredPosts(filtered)
  }, [posts, statusFilter, searchTerm])

  // Global search listener
  useEffect(() => {
    const handleGlobalSearch = (event) => {
      setSearchTerm(event.detail)
    }
    window.addEventListener("globalSearch", handleGlobalSearch)
    return () => window.removeEventListener("globalSearch", handleGlobalSearch)
  }, [])

  const handleCreateNew = () => {
    setEditForm({
      title: "",
      slug: "",
      description: "",
      content: "",
      tags: "",
      category: "Technology",
      publishDate: "",
      status: "draft",
      featuredImage: "",
    })
    setIsCreating(true)
    setIsEditing(false)
    setIsPreviewing(false)
    setErrors({})
  }

  const handleEdit = (post) => {
    setEditForm({
      title: post.title,
      slug: post.slug,
      description: post.description,
      content: post.content,
      tags: post.keywords,
      category: post.category,
      publishDate: post.publishDate || "",
      status: post.status?.toLowerCase() || "draft",
      featuredImage: post.featuredImage || "",
    })
    setSelectedPost(post)
    setIsEditing(true)
    setIsCreating(false)
    setIsPreviewing(false)
    setErrors({})
  }

  const handlePreview = (post) => {
    setSelectedPost(post)
    setIsPreviewing(true)
    setIsEditing(false)
    setIsCreating(false)
  }

  const validateForm = () => {
    const newErrors = {}
    if (!editForm.title.trim()) newErrors.title = "Title is required"
    if (!editForm.description.trim()) newErrors.description = "Description is required"
    if (!editForm.content.trim()) newErrors.content = "Content is required"
    if (editForm.featuredImage && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(editForm.featuredImage)) {
      newErrors.featuredImage = "Invalid image URL"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token provided")

      const body = {
        title: editForm.title,
        slug: editForm.slug,
        description: editForm.description,
        content: editForm.content,
        keywords: editForm.tags,
        category: editForm.category,
        publishDate: editForm.publishDate,
        status: editForm.status,
        featuredImage: editForm.featuredImage || null,
        views: isEditing ? selectedPost.views : 0,
        likes: isEditing ? selectedPost.likes : 0,
        comments: isEditing ? selectedPost.comments : 0,
      }

      const res = await fetch("/api/posts" + (isEditing ? `/${selectedPost.id}` : ""), {
        method: isEditing ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error("Server returned invalid JSON")
      }
      if (!res.ok) throw new Error(data.message || `Failed to ${isCreating ? "create" : "update"} post`)

      if (isCreating) {
        setPosts([data.post, ...posts])
        setFilteredPosts([data.post, ...filteredPosts])
      } else {
        setPosts(posts.map((post) => (post.id === selectedPost.id ? data.post : post)))
        setFilteredPosts(filteredPosts.map((post) => (post.id === selectedPost.id ? data.post : post)))
      }
      toast.success(`Post ${isCreating ? "created" : "updated"} successfully!`)
      setIsEditing(false)
      setIsCreating(false)
      setSelectedPost(null)
      setErrors({})
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleDelete = async (postId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token provided")

      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error("Server returned invalid JSON")
      }
      if (!res.ok) throw new Error(data.message || "Failed to delete post")

      setPosts(posts.filter((post) => post.id !== postId))
      setFilteredPosts(filteredPosts.filter((post) => post.id !== postId))
      toast.success("Post deleted successfully!")
      setShowDeleteModal(false)
      setPostToDelete(null)
    } catch (error) {
      toast.error(error.message)
      setShowDeleteModal(false)
      setPostToDelete(null)
    }
  }

  const handleDeletePrompt = (postId) => {
    setPostToDelete(postId)
    setShowDeleteModal(true)
  }

  const handlePublish = async (post) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("No authentication token provided")

      const body = {
        ...post,
        status: "Published",
        publishDate: new Date().toISOString().split("T")[0],
      }

      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        throw new Error("Server returned invalid JSON")
      }
      if (!res.ok) throw new Error(data.message || "Failed to publish post")

      setPosts(posts.map((p) => (p.id === post.id ? data.post : p)))
      setFilteredPosts(filteredPosts.map((p) => (p.id === post.id ? data.post : p)))
      toast.success("Post published successfully!")
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleExportPDF = (post) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let y = margin;

      // Title
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(post.title, margin, y, { maxWidth });
      y += 15;

      // Description
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Description", margin, y);
      y += 8;
      doc.setFontSize(12);
      const descriptionLines = doc.splitTextToSize(post.description, maxWidth);
      doc.text(descriptionLines, margin, y);
      y += descriptionLines.length * 7 + 10;

      // Content
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.text("Content", margin, y);
      y += 8;
      doc.setFontSize(12);
      const contentLines = doc.splitTextToSize(post.content, maxWidth);
      doc.text(contentLines, margin, y);
      y += contentLines.length * 7 + 10;

      // Details
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.text("Details", margin, y);
      y += 8;
      doc.setFontSize(12);
      doc.text(`Author: ${post.author}`, margin, y);
      y += 7;
      doc.text(`Category: ${post.category}`, margin, y);
      y += 7;
      doc.text(`Status: ${post.status || "Draft"}`, margin, y);
      y += 7;
      doc.text(`Publish Date: ${post.publishDate || "Not published"}`, margin, y);
      y += 7;
      doc.text(`Read Time: ${post.readTime || "5 min read"}`, margin, y);
      y += 7;
      doc.text(`Views: ${post.views || 0}`, margin, y);

      doc.save(`${post.slug || "post"}.pdf`);
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      toast.error(`Failed to generate PDF: ${error.message}`);
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setIsCreating(false)
    setIsPreviewing(false)
    setSelectedPost(null)
    setErrors({})
  }

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))

    // Auto-generate slug from title
    if (field === "title") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setEditForm((prev) => ({ ...prev, slug }))
    }
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      setSearchTerm("") // Reset search to avoid conflicts
      setStatusFilter("all") // Reset status filter
      setFilteredPosts(posts)
    }
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return "text-green-600 bg-green-100"
      case "draft":
        return "text-yellow-600 bg-yellow-100"
      case "scheduled":
        return "text-blue-600 bg-blue-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  if (isCreating || isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {isCreating ? "Create New Post" : "Edit Post"}
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
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {isCreating ? "Create Post" : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Enter post title..."
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Slug</label>
                <input
                  type="text"
                  value={editForm.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="auto-generated-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.description ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="Brief description..."
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Featured Image URL</label>
                <input
                  type="text"
                  value={editForm.featuredImage}
                  onChange={(e) => handleInputChange("featuredImage", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.featuredImage ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.featuredImage && <p className="text-red-500 text-sm mt-1">{errors.featuredImage}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Education">Education</option>
                    <option value="Innovation">Innovation</option>
                    <option value="AI">AI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    value={editForm.publishDate}
                    onChange={(e) => handleInputChange("publishDate", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={(e) => handleInputChange("tags", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="tag1, tag2, tag3..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content *</label>
              <textarea
                value={editForm.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                rows={20}
                className={`w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.content ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Write your content here..."
              />
              {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isPreviewing && selectedPost) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Preview Post
          </h1>
          <button
            onClick={handleCancel}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Close Preview
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="aspect-video bg-gradient-to-r from-purple-400 to-pink-400">
            <img
              src={selectedPost.featuredImage || "/placeholder.svg?height=200&width=400"}
              alt={selectedPost.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-8">
            <div className="flex items-center space-x-4 mb-4">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedPost.status)}`}>
                {selectedPost.status || "Draft"}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{selectedPost.category}</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{selectedPost.readTime}</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{selectedPost.title}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">{selectedPost.description}</p>
            <div className="flex items-center space-x-4 mb-8 text-sm text-gray-500 dark:text-gray-400">
              <span>By {selectedPost.author}</span>
              <span>•</span>
              <span>{selectedPost.publishDate || "Not published"}</span>
              {selectedPost.status?.toLowerCase() === "published" && (
                <>
                  <span>•</span>
                  <span>{selectedPost.views} views</span>
                </>
              )}
            </div>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap">{selectedPost.content}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Blog Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage your blog content</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          New
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts, authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center justify-start m-0 p-0 space-x-4 flex-wrap  gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="Technology">Technology</option>
<option value="Education">Education</option>
<option value="Innovation">Innovation</option>
<option value="AI">AI</option>
<option value="Cybersecurity">Cybersecurity</option>
<option value="Software Development">Software Development</option>
<option value="Data Science">Data Science</option>
<option value="Machine Learning">Machine Learning</option>
<option value="Web Development">Web Development</option>
<option value="Cloud Computing">Cloud Computing</option>
<option value="Mobile Apps">Mobile Apps</option>
<option value="Startups">Startups</option>
<option value="Blockchain">Blockchain</option>
<option value="Gadgets">Gadgets</option>
<option value="Programming">Programming</option>
<option value="Digital Marketing">Digital Marketing</option>
<option value="UX/UI Design">UX/UI Design</option>
<option value="Gaming">Gaming</option>
<option value="Robotics">Robotics</option>
<option value="Tech News">Tech News</option>
<option value="Ethics in Tech">Ethics in Tech</option>
<option value="AR/VR">AR/VR</option>
<option value="Green Tech">Green Tech</option>
<option value="Big Data">Big Data</option>
<option value="DevOps">DevOps</option>

            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>

            <div className="flex items-center  bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <motion.div
            className="w-12 h-12 border-4 border-t-purple-600 border-r-pink-600 border-b-gray-300 border-l-gray-300 dark:border-t-purple-400 dark:border-r-pink-400 dark:border-b-gray-600 dark:border-l-gray-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center text-gray-600 dark:text-gray-400">No posts found</div>
      ) : (
        <>
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6" : "space-y-6"}>
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200 ${
                  viewMode === "list" ? "flex flex-col md:flex-row" : ""
                }`}
              >
                <div className={`relative ${viewMode === "list" ? "md:w-1/3 aspect-video" : "aspect-video"}`}>
                  <img
                    src={post.featuredImage || "/placeholder.svg?height=200&width=400"}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(post.status)}`}>
                      {post.status || "Draft"}
                    </span>
                  </div>
                </div>
                <div className={viewMode === "list" ? "p-6 md:w-2/3" : "p-6"}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{post.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>By {post.author}</span>
                    <span>{post.readTime}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePreview(post)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePrompt(post.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleExportPDF(post)}
                        className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    {(post.status?.toLowerCase() === "draft" || !post.status) && (
                      <button
                        onClick={() => handlePublish(post)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </button>
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === page
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  } transition-colors`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </>
      )}

      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Confirm Deletion
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setPostToDelete(null)
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(postToDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}