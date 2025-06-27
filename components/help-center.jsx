"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, Edit, Trash2, Search, MessageSquare, FileText } from "lucide-react"
import { toast } from "sonner"

const mockArticles = [
  {
    id: 1,
    title: "How to get started with Actinova AI Tutor",
    category: "Getting Started",
    content: "Welcome to Actinova AI Tutor! This guide will help you...",
    lastUpdated: "2024-01-15",
    views: 245,
  },
  {
    id: 2,
    title: "Understanding your personalized roadmap",
    category: "Features",
    content: "Your personalized roadmap is created based on...",
    lastUpdated: "2024-01-12",
    views: 189,
  },
  {
    id: 3,
    title: "How to download your certificates",
    category: "Certificates",
    content: "Once you complete a course, you can download...",
    lastUpdated: "2024-01-10",
    views: 156,
  },
]

const mockLegalPages = [
  {
    id: 1,
    title: "Privacy Policy",
    content: "This Privacy Policy describes how we collect, use, and protect your information...",
    lastUpdated: "2024-01-01",
  },
  {
    id: 2,
    title: "Terms of Service",
    content: "By using Actinova AI Tutor, you agree to these terms...",
    lastUpdated: "2024-01-01",
  },
  {
    id: 3,
    title: "Cookie Policy",
    content: "We use cookies to improve your experience...",
    lastUpdated: "2024-01-01",
  },
]

const mockContactRequests = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    subject: "Issue with course access",
    message: "I cannot access my purchased course...",
    date: "2024-01-15",
    status: "Open",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    subject: "Certificate not generated",
    message: "I completed the course but did not receive my certificate...",
    date: "2024-01-14",
    status: "Resolved",
  },
]

const categories = ["Getting Started", "Features", "Certificates", "Billing", "Technical"]

export default function HelpCenter() {
  const [activeTab, setActiveTab] = useState("articles")
  const [articles, setArticles] = useState(mockArticles)
  const [legalPages, setLegalPages] = useState(mockLegalPages)
  const [contactRequests, setContactRequests] = useState(mockContactRequests)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingItem, setEditingItem] = useState(null)
  const [editForm, setEditForm] = useState({
    title: "",
    category: "Getting Started",
    content: "",
  })

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleEditArticle = (article) => {
    setEditingItem({ type: "article", id: article.id })
    setEditForm({
      title: article.title,
      category: article.category,
      content: article.content,
    })
  }

  const handleEditLegalPage = (page) => {
    setEditingItem({ type: "legal", id: page.id })
    setEditForm({
      title: page.title,
      category: "",
      content: page.content,
    })
  }

  const handleSave = () => {
    if (editingItem.type === "article") {
      setArticles((prev) =>
        prev.map((article) =>
          article.id === editingItem.id
            ? {
                ...article,
                title: editForm.title,
                category: editForm.category,
                content: editForm.content,
                lastUpdated: new Date().toISOString().split("T")[0],
              }
            : article,
        ),
      )
    } else if (editingItem.type === "legal") {
      setLegalPages((prev) =>
        prev.map((page) =>
          page.id === editingItem.id
            ? {
                ...page,
                title: editForm.title,
                content: editForm.content,
                lastUpdated: new Date().toISOString().split("T")[0],
              }
            : page,
        ),
      )
    }

    setEditingItem(null)
    toast.success("Content saved successfully!")
  }

  const handleDelete = (type, id) => {
    if (type === "article") {
      setArticles((prev) => prev.filter((article) => article.id !== id))
    } else if (type === "legal") {
      setLegalPages((prev) => prev.filter((page) => page.id !== id))
    }
    toast.success("Content deleted successfully!")
  }

  const handleContactStatus = (id, status) => {
    setContactRequests((prev) => prev.map((request) => (request.id === id ? { ...request, status } : request)))
    toast.success(`Request marked as ${status.toLowerCase()}`)
  }

  const getStatusColor = (status) => {
    return status === "Open" ? "text-yellow-600 bg-yellow-100" : "text-green-600 bg-green-100"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help Center & Legal</h1>
        <button
          onClick={() => toast.info("Create new content feature coming soon!")}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Content
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: "articles", label: "FAQ Articles", icon: FileText },
            { id: "legal", label: "Legal Pages", icon: FileText },
            { id: "contacts", label: "Contact Requests", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
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

      {!editingItem ? (
        <>
          {activeTab === "articles" && (
            <>
              {/* Search and Filter */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Articles List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{article.title}</h3>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-600">
                          {article.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">{article.content}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <span>Updated: {article.lastUpdated}</span>
                      <span>{article.views} views</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditArticle(article)}
                        className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete("article", article.id)}
                        className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {activeTab === "legal" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {legalPages.map((page, index) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{page.title}</h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-4">{page.content}</p>

                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Updated: {page.lastUpdated}</div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditLegalPage(page)}
                      className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete("legal", page.id)}
                      className="flex items-center px-3 py-1 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === "contacts" && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
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
                    {contactRequests.map((request, index) => (
                      <motion.tr
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{request.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{request.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">{request.subject}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{request.message}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {request.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {request.status === "Open" ? (
                              <button
                                onClick={() => handleContactStatus(request.id, "Resolved")}
                                className="text-green-600 hover:text-green-900"
                              >
                                Mark Resolved
                              </button>
                            ) : (
                              <button
                                onClick={() => handleContactStatus(request.id, "Open")}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                Reopen
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
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit {editingItem.type === "article" ? "Article" : "Legal Page"}
            </h2>
            <button
              onClick={() => setEditingItem(null)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {editingItem.type === "article" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content</label>
              <textarea
                value={editForm.content}
                onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your content here..."
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
