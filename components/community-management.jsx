"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  MessageSquare,
  Flag,
  ThumbsUp,
  Eye,
  Trash2,
  CheckCircle,
  Star,
  Award,
  Plus,
  Search,
  Users,
  TrendingUp,
  Edit,
  X,
  Tag,
  Calendar,
  UserMinus,
  UserPlus,
  Crown,
  Shield,
  User,
} from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { toast } from "sonner"

const mockPosts = [
  {
    id: 1,
    title: "How to get started with React Hooks?",
    topic: "React Development",
    author: "John Doe",
    authorId: 1,
    replies: 15,
    likes: 23,
    views: 156,
    status: "active",
    flagged: false,
    createdAt: "2024-01-20",
    updatedAt: "2024-01-20",
    content:
      "I'm new to React and wondering about the best practices for using hooks. Can someone share their experience with useState and useEffect?",
    tags: ["React", "Hooks", "Beginner"],
    comments: [
      {
        id: 1,
        content: "Great question! I'd recommend starting with useState for simple state management.",
        author: "Sarah Wilson",
        createdAt: "2024-01-20T10:30:00Z",
        likes: 5,
        replies: [],
      },
    ],
  },
  {
    id: 2,
    title: "Python vs JavaScript for AI development",
    topic: "AI & Machine Learning",
    author: "Jane Smith",
    authorId: 2,
    replies: 8,
    likes: 12,
    views: 89,
    status: "flagged",
    flagged: true,
    createdAt: "2024-01-19",
    updatedAt: "2024-01-19",
    content:
      "Which language would you recommend for someone starting in AI? I have experience with both but want to focus on one.",
    tags: ["Python", "JavaScript", "AI", "Career"],
    comments: [],
  },
  {
    id: 3,
    title: "Best resources for learning Data Science",
    topic: "Data Science",
    author: "Mike Johnson",
    authorId: 3,
    replies: 22,
    likes: 45,
    views: 234,
    status: "featured",
    flagged: false,
    createdAt: "2024-01-18",
    updatedAt: "2024-01-18",
    content:
      "I've compiled a list of the best resources I've found for learning data science. Here are my top recommendations...",
    tags: ["Data Science", "Resources", "Learning"],
    comments: [],
  },
]

const mockStudyGroups = [
  {
    id: 1,
    name: "React Fundamentals Study Group",
    description: "Weekly sessions covering React basics, hooks, and best practices",
    creator: "Sarah Wilson",
    creatorId: 1,
    tags: ["React", "Beginner", "Weekly"],
    members: [
      { id: 1, name: "Sarah Wilson", role: "creator", joinedAt: "2024-01-01" },
      { id: 2, name: "John Doe", role: "member", joinedAt: "2024-01-05" },
      { id: 3, name: "Alice Brown", role: "moderator", joinedAt: "2024-01-03" },
      { id: 4, name: "Bob Smith", role: "member", joinedAt: "2024-01-10" },
    ],
    memberCount: 25,
    status: "active",
    schedule: "Sunday, 3:00 PM",
    level: "Beginner",
    createdAt: "2024-01-01",
    nextSession: "2024-01-28",
    category: "Programming",
  },
  {
    id: 2,
    name: "Advanced Python for Data Science",
    description: "Deep dive into Python libraries for data analysis and machine learning",
    creator: "Mike Johnson",
    creatorId: 2,
    tags: ["Python", "Data Science", "Advanced", "ML"],
    members: [
      { id: 2, name: "Mike Johnson", role: "creator", joinedAt: "2024-01-01" },
      { id: 5, name: "Emma Davis", role: "member", joinedAt: "2024-01-08" },
      { id: 6, name: "Tom Wilson", role: "member", joinedAt: "2024-01-12" },
    ],
    memberCount: 18,
    status: "active",
    schedule: "Wednesday, 7:00 PM",
    level: "Advanced",
    createdAt: "2024-01-01",
    nextSession: "2024-01-31",
    category: "Data Science",
  },
  {
    id: 3,
    name: "JavaScript Algorithms & Data Structures",
    description: "Practice coding challenges and learn algorithmic thinking",
    creator: "Alex Chen",
    creatorId: 3,
    tags: ["JavaScript", "Algorithms", "Interview Prep"],
    members: [
      { id: 3, name: "Alex Chen", role: "creator", joinedAt: "2024-01-01" },
      { id: 7, name: "Lisa Park", role: "member", joinedAt: "2024-01-15" },
    ],
    memberCount: 12,
    status: "suspended",
    schedule: "Friday, 6:00 PM",
    level: "Intermediate",
    createdAt: "2024-01-01",
    nextSession: null,
    category: "Programming",
  },
]

const mockBadges = [
  {
    id: 1,
    icon: "🏆",
    title: "Top Contributor",
    description: "Earned by users with 50+ helpful posts",
    earnedCount: 23,
    triggerRule: "50+ helpful posts",
    color: "#FFD700",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: 2,
    icon: "🎯",
    title: "Problem Solver",
    description: "Earned by solving 10+ community questions",
    earnedCount: 45,
    triggerRule: "10+ solved questions",
    color: "#FF6B6B",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: 3,
    icon: "🌟",
    title: "Rising Star",
    description: "Earned by new members with high engagement",
    earnedCount: 67,
    triggerRule: "High engagement in first month",
    color: "#4ECDC4",
    isActive: true,
    createdAt: "2024-01-01",
  },
  {
    id: 4,
    icon: "👨‍🏫",
    title: "Study Leader",
    description: "Earned by creating and managing study groups",
    earnedCount: 18,
    triggerRule: "Create and manage study group for 3+ months",
    color: "#45B7D1",
    isActive: true,
    createdAt: "2024-01-01",
  },
]

const recentBadgeAssignments = [
  {
    id: 1,
    user: "Alice Johnson",
    userId: 1,
    badge: "Top Contributor",
    badgeId: 1,
    date: "2024-01-22",
    assignedBy: "Admin",
  },
  { id: 2, user: "Bob Smith", userId: 2, badge: "Problem Solver", badgeId: 2, date: "2024-01-21", assignedBy: "Admin" },
  { id: 3, user: "Carol Davis", userId: 3, badge: "Rising Star", badgeId: 3, date: "2024-01-21", assignedBy: "System" },
]

const engagementData = [
  { week: "Week 1", posts: 45, groups: 8 },
  { week: "Week 2", posts: 52, groups: 10 },
  { week: "Week 3", posts: 38, groups: 7 },
  { week: "Week 4", posts: 61, groups: 12 },
  { week: "Week 5", posts: 55, groups: 9 },
  { week: "Week 6", posts: 48, groups: 11 },
]

const topicsData = [
  { topic: "React", posts: 89, groups: 5 },
  { topic: "Python", posts: 67, groups: 8 },
  { topic: "AI/ML", posts: 54, groups: 3 },
  { topic: "Data Science", posts: 43, groups: 6 },
  { topic: "Web Dev", posts: 38, groups: 4 },
]

export default function CommunityManagement() {
  const [posts, setPosts] = useState(mockPosts)
  const [studyGroups, setStudyGroups] = useState(mockStudyGroups)
  const [badges, setBadges] = useState(mockBadges)
  const [badgeAssignments, setBadgeAssignments] = useState(recentBadgeAssignments)
  const [filteredPosts, setFilteredPosts] = useState(mockPosts)
  const [filteredGroups, setFilteredGroups] = useState(mockStudyGroups)

  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterTopic, setFilterTopic] = useState("all")
  const [filterLevel, setFilterLevel] = useState("all")
  const [selectedPosts, setSelectedPosts] = useState([])
  const [selectedGroups, setSelectedGroups] = useState([])

  const [activeTab, setActiveTab] = useState("overview")

  // Inline editing states
  const [editingPost, setEditingPost] = useState(null)
  const [editingGroup, setEditingGroup] = useState(null)
  const [editingBadge, setEditingBadge] = useState(null)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showCreateBadge, setShowCreateBadge] = useState(false)
  const [managingGroupMembers, setManagingGroupMembers] = useState(null)
  const [viewingComments, setViewingComments] = useState(null)

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
    { id: "study-groups", label: "Study Groups", icon: Users },
    { id: "achievements", label: "Achievements", icon: Award },
  ]

  // Filter effects
  useEffect(() => {
    let filtered = posts

    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((post) => post.status === filterStatus)
    }

    if (filterTopic !== "all") {
      filtered = filtered.filter((post) => post.topic === filterTopic)
    }

    setFilteredPosts(filtered)
  }, [posts, searchTerm, filterStatus, filterTopic])

  useEffect(() => {
    let filtered = studyGroups

    if (searchTerm) {
      filtered = filtered.filter(
        (group) =>
          group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          group.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((group) => group.status === filterStatus)
    }

    if (filterLevel !== "all") {
      filtered = filtered.filter((group) => group.level === filterLevel)
    }

    setFilteredGroups(filtered)
  }, [studyGroups, searchTerm, filterStatus, filterLevel])

  // Post actions
  const handlePostAction = (postId, action) => {
    setPosts((prevPosts) =>
      prevPosts
        .map((post) => {
          if (post.id === postId) {
            switch (action) {
              case "approve":
                toast.success("Post approved")
                return { ...post, status: "active", flagged: false }
              case "hide":
                toast.success("Post hidden")
                return { ...post, status: "hidden" }
              case "delete":
                toast.success("Post deleted")
                return null
              case "feature":
                toast.success("Post featured")
                return { ...post, status: "featured" }
              case "unflag":
                toast.success("Post unflagged")
                return { ...post, flagged: false }
              default:
                return post
            }
          }
          return post
        })
        .filter(Boolean),
    )
  }

  const handleBulkPostAction = (action) => {
    if (selectedPosts.length === 0) {
      toast.error("No posts selected")
      return
    }

    selectedPosts.forEach((postId) => {
      handlePostAction(postId, action)
    })
    setSelectedPosts([])
  }

  const handleCreatePost = (newPost) => {
    setPosts((prev) => [{ ...newPost, id: Date.now() }, ...prev])
    setShowCreatePost(false)
    toast.success("Post created successfully!")
  }

  const handleUpdatePost = (updatedPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)))
    setEditingPost(null)
    toast.success("Post updated successfully!")
  }

  const handleViewComments = (post) => {
    setViewingComments(post)
  }

  const handleEditPost = (post) => {
    setEditingPost(post)
  }

  // Study Group actions
  const handleGroupAction = (groupId, action) => {
    setStudyGroups((prevGroups) =>
      prevGroups
        .map((group) => {
          if (group.id === groupId) {
            switch (action) {
              case "approve":
                toast.success("Study group approved")
                return { ...group, status: "active" }
              case "suspend":
                toast.success("Study group suspended")
                return { ...group, status: "suspended" }
              case "delete":
                toast.success("Study group deleted")
                return null
              case "feature":
                toast.success("Study group featured")
                return { ...group, status: "featured" }
              default:
                return group
            }
          }
          return group
        })
        .filter(Boolean),
    )
  }

  const handleBulkGroupAction = (action) => {
    if (selectedGroups.length === 0) {
      toast.error("No groups selected")
      return
    }

    selectedGroups.forEach((groupId) => {
      handleGroupAction(groupId, action)
    })
    setSelectedGroups([])
  }

  const handleCreateGroup = (newGroup) => {
    setStudyGroups((prev) => [{ ...newGroup, id: Date.now(), memberCount: 1 }, ...prev])
    setShowCreateGroup(false)
    toast.success("Study group created successfully!")
  }

  const handleUpdateGroup = (updatedGroup) => {
    setStudyGroups((prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)))
    setEditingGroup(null)
    toast.success("Study group updated successfully!")
  }

  const handleEditGroup = (group) => {
    setEditingGroup(group)
  }

  const handleManageMembers = (group) => {
    setManagingGroupMembers(group)
  }

  const handleRemoveMember = (groupId, memberId) => {
    setStudyGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              members: group.members.filter((member) => member.id !== memberId),
              memberCount: group.memberCount - 1,
            }
          : group,
      ),
    )
    toast.success("Member removed from group")
  }

  const handleAddMember = (groupId, newMember) => {
    setStudyGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
              ...group,
              members: [...group.members, { ...newMember, role: "member", joinedAt: new Date().toISOString() }],
              memberCount: group.memberCount + 1,
            }
          : group,
      ),
    )
    toast.success("Member added to group")
  }

  // Badge actions
  const handleCreateBadge = (newBadge) => {
    setBadges((prev) => [{ ...newBadge, id: Date.now(), earnedCount: 0, isActive: true }, ...prev])
    setShowCreateBadge(false)
    toast.success("Badge created successfully!")
  }

  const handleUpdateBadge = (updatedBadge) => {
    setBadges((prev) => prev.map((b) => (b.id === updatedBadge.id ? updatedBadge : b)))
    setEditingBadge(null)
    toast.success("Badge updated successfully!")
  }

  const handleDeleteBadge = (badgeId) => {
    setBadges((prev) => prev.filter((b) => b.id !== badgeId))
    toast.success("Badge deleted successfully!")
  }

  const handleAssignBadge = (userId, badgeId) => {
    const badge = badges.find((b) => b.id === badgeId)
    const assignment = {
      id: Date.now(),
      user: `User ${userId}`,
      userId,
      badge: badge.title,
      badgeId,
      date: new Date().toISOString().split("T")[0],
      assignedBy: "Admin",
    }
    setBadgeAssignments((prev) => [assignment, ...prev])
    setBadges((prev) => prev.map((b) => (b.id === badgeId ? { ...b, earnedCount: b.earnedCount + 1 } : b)))
    toast.success("Badge assigned successfully!")
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100 dark:bg-green-900/20"
      case "flagged":
        return "text-red-600 bg-red-100 dark:bg-red-900/20"
      case "featured":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20"
      case "hidden":
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20"
      case "suspended":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/20"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20"
    }
  }

  const getLevelColor = (level) => {
    switch (level) {
      case "Beginner":
        return "text-green-600 bg-green-100 dark:bg-green-900/20"
      case "Intermediate":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20"
      case "Advanced":
        return "text-red-600 bg-red-100 dark:bg-red-900/20"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20"
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "creator":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "moderator":
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return <User className="w-4 h-4 text-gray-500" />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "creator":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20"
      case "moderator":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20"
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Discussions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{posts.length}</p>
              <p className="text-sm font-medium mt-2 text-green-600">+12%</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Study Groups</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {studyGroups.filter((g) => g.status === "active").length}
              </p>
              <p className="text-sm font-medium mt-2 text-green-600">+8%</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Flagged Posts</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {posts.filter((p) => p.flagged).length}
              </p>
              <p className="text-sm font-medium mt-2 text-red-600">-15%</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600">
              <Flag className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Badges</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{badges.length}</p>
              <p className="text-sm font-medium mt-2 text-green-600">+23%</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
              <Award className="w-8 h-8 text-white" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Community Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="posts" stroke="#3B82F6" strokeWidth={2} name="Posts" />
              <Line type="monotone" dataKey="groups" stroke="#10B981" strokeWidth={2} name="Groups" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular Topics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="posts" fill="#3B82F6" name="Posts" />
              <Bar dataKey="groups" fill="#10B981" name="Groups" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )

  const renderDiscussions = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="flagged">Flagged</option>
              <option value="featured">Featured</option>
              <option value="hidden">Hidden</option>
            </select>

            <select
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Topics</option>
              <option value="React Development">React Development</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="Data Science">Data Science</option>
              <option value="Web Development">Web Development</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {selectedPosts.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkPostAction("delete")}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Delete ({selectedPosts.length})
                </button>
                <button
                  onClick={() => handleBulkPostAction("feature")}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Feature ({selectedPosts.length})
                </button>
              </div>
            )}
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </button>
          </div>
        </div>
      </div>

      {/* Create Post Form */}
      {showCreatePost && <CreatePostInline onSave={handleCreatePost} onCancel={() => setShowCreatePost(false)} />}

      {/* Edit Post Form */}
      {editingPost && (
        <EditPostInline post={editingPost} onSave={handleUpdatePost} onCancel={() => setEditingPost(null)} />
      )}

      {/* View Comments */}
      {viewingComments && <ViewCommentsInline post={viewingComments} onClose={() => setViewingComments(null)} />}

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <input
                  type="checkbox"
                  checked={selectedPosts.includes(post.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPosts([...selectedPosts, post.id])
                    } else {
                      setSelectedPosts(selectedPosts.filter((id) => id !== post.id))
                    }
                  }}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{post.title}</h3>
                    {post.flagged && <Flag className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="font-medium">{post.author}</span>
                    <span>•</span>
                    <span>{post.topic}</span>
                    <span>•</span>
                    <span>{post.createdAt}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {post.views}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{post.content}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.replies}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(post.status)}`}
                      >
                        {post.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleViewComments(post)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="View Comments"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditPost(post)}
                  className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg transition-colors"
                  title="Edit Post"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePostAction(post.id, "approve")}
                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  title="Approve"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePostAction(post.id, "feature")}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Feature"
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePostAction(post.id, "hide")}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
                  title="Hide"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePostAction(post.id, "delete")}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No discussions found</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderStudyGroups = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search study groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="featured">Featured</option>
            </select>

            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {selectedGroups.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkGroupAction("delete")}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Delete ({selectedGroups.length})
                </button>
                <button
                  onClick={() => handleBulkGroupAction("suspend")}
                  className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  Suspend ({selectedGroups.length})
                </button>
              </div>
            )}
            <button
              onClick={() => setShowCreateGroup(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Group
            </button>
          </div>
        </div>
      </div>

      {/* Create Group Form */}
      {showCreateGroup && <CreateGroupInline onSave={handleCreateGroup} onCancel={() => setShowCreateGroup(false)} />}

      {/* Edit Group Form */}
      {editingGroup && (
        <EditGroupInline group={editingGroup} onSave={handleUpdateGroup} onCancel={() => setEditingGroup(null)} />
      )}

      {/* Manage Members */}
      {managingGroupMembers && (
        <ManageGroupMembersInline
          group={managingGroupMembers}
          onRemoveMember={handleRemoveMember}
          onAddMember={handleAddMember}
          onClose={() => setManagingGroupMembers(null)}
        />
      )}

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <input
                type="checkbox"
                checked={selectedGroups.includes(group.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedGroups([...selectedGroups, group.id])
                  } else {
                    setSelectedGroups(selectedGroups.filter((id) => id !== group.id))
                  }
                }}
              />
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleEditGroup(group)}
                  className="p-1 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded transition-colors"
                  title="Edit Group"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleManageMembers(group)}
                  className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="Manage Members"
                >
                  <Users className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleGroupAction(group.id, "delete")}
                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Delete Group"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{group.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{group.description}</p>

              <div className="flex items-center space-x-2 mb-3">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(group.status)}`}
                >
                  {group.status}
                </span>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLevelColor(group.level)}`}
                >
                  {group.level}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {group.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center justify-between">
                <span>Creator:</span>
                <span className="font-medium">{group.creator}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Members:</span>
                <span className="font-medium">{group.memberCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Schedule:</span>
                <span className="font-medium">{group.schedule}</span>
              </div>
              {group.nextSession && (
                <div className="flex items-center justify-between">
                  <span>Next Session:</span>
                  <span className="font-medium text-blue-600">{group.nextSession}</span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleGroupAction(group.id, group.status === "active" ? "suspend" : "approve")}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    group.status === "active"
                      ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
                      : "bg-green-100 text-green-600 hover:bg-green-200"
                  }`}
                >
                  {group.status === "active" ? "Suspend" : "Activate"}
                </button>
                <button
                  onClick={() => handleGroupAction(group.id, "feature")}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  Feature
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredGroups.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No study groups found</p>
          </div>
        )}
      </div>
    </div>
  )

  const renderAchievements = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Badge Management</h3>
          <button
            onClick={() => setShowCreateBadge(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Badge
          </button>
        </div>
      </div>

      {/* Create Badge Form */}
      {showCreateBadge && <CreateBadgeInline onSave={handleCreateBadge} onCancel={() => setShowCreateBadge(false)} />}

      {/* Edit Badge Form */}
      {editingBadge && (
        <EditBadgeInline badge={editingBadge} onSave={handleUpdateBadge} onCancel={() => setEditingBadge(null)} />
      )}

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{badge.icon}</div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setEditingBadge(badge)}
                  className="p-1 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded transition-colors"
                  title="Edit Badge"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteBadge(badge.id)}
                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Delete Badge"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{badge.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{badge.description}</p>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>
                  <strong>Trigger:</strong> {badge.triggerRule}
                </p>
                <p>
                  <strong>Earned:</strong> {badge.earnedCount} times
                </p>
                <p>
                  <strong>Status:</strong> {badge.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleAssignBadge(1, badge.id)}
                className="w-full px-3 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors text-sm"
              >
                Assign Badge
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Assignments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Badge Assignments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Badge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Assigned By
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {badgeAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {assignment.user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {assignment.badge}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {assignment.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {assignment.assignedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Community Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage discussions, study groups, and community engagement
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && renderOverview()}
        {activeTab === "discussions" && renderDiscussions()}
        {activeTab === "study-groups" && renderStudyGroups()}
        {activeTab === "achievements" && renderAchievements()}
      </div>
    </div>
  )
}

// Inline Components
const CreatePostInline = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    topic: "General Discussion",
    status: "active",
  })

  const topics = [
    "General Discussion",
    "React Development",
    "AI & Machine Learning",
    "Data Science",
    "Web Development",
    "Python Programming",
    "Career Advice",
    "Study Groups",
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    const newPost = {
      ...formData,
      author: "Admin",
      authorId: 1,
      replies: 0,
      likes: 0,
      views: 0,
      flagged: false,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      comments: [],
    }
    onSave(newPost)
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Post</h3>
        <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic</label>
            <select
              value={formData.topic}
              onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
              <option value="featured">Featured</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter post title..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content *</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your post content..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tag1, tag2, tag3..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            Create Post
          </button>
        </div>
      </form>
    </motion.div>
  )
}

const EditPostInline = ({ post, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: post.title || "",
    content: post.content || "",
    tags: post.tags ? post.tags.join(", ") : "",
    topic: post.topic || "General Discussion",
    status: post.status || "active",
  })

  const topics = [
    "General Discussion",
    "React Development",
    "AI & Machine Learning",
    "Data Science",
    "Web Development",
    "Python Programming",
    "Career Advice",
    "Study Groups",
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    const updatedPost = {
      ...post,
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      updatedAt: new Date().toISOString().split("T")[0],
    }
    onSave(updatedPost)
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Post</h3>
        <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topic</label>
            <select
              value={formData.topic}
              onChange={(e) => setFormData((prev) => ({ ...prev, topic: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
              <option value="featured">Featured</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter post title..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Content *</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your post content..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tag1, tag2, tag3..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
          >
            Update Post
          </button>
        </div>
      </form>
    </motion.div>
  )
}

const ViewCommentsInline = ({ post, onClose }) => {
  const [newComment, setNewComment] = useState("")

  const handleAddComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    // In a real app, this would update the post's comments
    toast.success("Comment added successfully!")
    setNewComment("")
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comments - {post.title}</h3>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900 dark:text-white">{comment.author}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
              <div className="flex items-center mt-2 space-x-2">
                <button className="flex items-center text-sm text-gray-500 hover:text-blue-600">
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  {comment.likes}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No comments yet</p>
          </div>
        )}
      </div>

      <form onSubmit={handleAddComment} className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Post
          </button>
        </div>
      </form>
    </motion.div>
  )
}

const CreateGroupInline = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tags: "",
    level: "Beginner",
    category: "Programming",
    schedule: "",
    maxMembers: 20,
  })

  const levels = ["Beginner", "Intermediate", "Advanced"]
  const categories = ["Programming", "Data Science", "AI/ML", "Web Development", "Career", "General"]

  const handleSubmit = (e) => {
    e.preventDefault()
    const newGroup = {
      ...formData,
      creator: "Admin",
      creatorId: 1,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      members: [{ id: 1, name: "Admin", role: "creator", joinedAt: new Date().toISOString() }],
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      nextSession: null,
    }
    onSave(newGroup)
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Study Group</h3>
        <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Group Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter group name..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Describe what this group is about..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.schedule}
                onChange={(e) => setFormData((prev) => ({ ...prev, schedule: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Sunday, 3:00 PM"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Members</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={formData.maxMembers}
                onChange={(e) => setFormData((prev) => ({ ...prev, maxMembers: Number.parseInt(e.target.value) }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                min="5"
                max="100"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="tag1, tag2, tag3..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors"
          >
            Create Group
          </button>
        </div>
      </form>
    </motion.div>
  )
}

const EditGroupInline = ({ group, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: group.name || "",
    description: group.description || "",
    tags: group.tags ? group.tags.join(", ") : "",
    level: group.level || "Beginner",
    category: group.category || "Programming",
    schedule: group.schedule || "",
    status: group.status || "active",
  })

  const levels = ["Beginner", "Intermediate", "Advanced"]
  const categories = ["Programming", "Data Science", "AI/ML", "Web Development", "Career", "General"]
  const statuses = ["active", "suspended", "featured"]

  const handleSubmit = (e) => {
    e.preventDefault()
    const updatedGroup = {
      ...group,
      ...formData,
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    }
    onSave(updatedGroup)
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Study Group</h3>
        <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Group Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter group name..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe what this group is about..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Schedule</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.schedule}
              onChange={(e) => setFormData((prev) => ({ ...prev, schedule: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Sunday, 3:00 PM"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tag1, tag2, tag3..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg hover:from-blue-700 hover:to-green-700 transition-colors"
          >
            Update Group
          </button>
        </div>
      </form>
    </motion.div>
  )
}

const ManageGroupMembersInline = ({ group, onRemoveMember, onAddMember, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [newMemberName, setNewMemberName] = useState("")
  const [showAddMember, setShowAddMember] = useState(false)

  const filteredMembers =
    group?.members?.filter((member) => member.name.toLowerCase().includes(searchTerm.toLowerCase())) || []

  const handleRemoveMember = (memberId) => {
    if (group.members.find((m) => m.id === memberId)?.role === "creator") {
      toast.error("Cannot remove group creator")
      return
    }
    onRemoveMember(group.id, memberId)
  }

  const handleAddMember = (e) => {
    e.preventDefault()
    if (!newMemberName.trim()) return

    const newMember = {
      id: Date.now(),
      name: newMemberName.trim(),
    }
    onAddMember(group.id, newMember)
    setNewMemberName("")
    setShowAddMember(false)
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "creator":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "moderator":
        return <Shield className="w-4 h-4 text-blue-500" />
      default:
        return <User className="w-4 h-4 text-gray-500" />
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "creator":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20"
      case "moderator":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20"
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Members</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {group.name} • {group.memberCount} members
          </p>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 mr-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={() => setShowAddMember(!showAddMember)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </button>
      </div>

      {/* Add Member Form */}
      {showAddMember && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
        >
          <form onSubmit={handleAddMember} className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Enter member name..."
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddMember(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </form>
        </motion.div>
      )}

      {/* Members List */}
      <div className="max-h-96 overflow-y-auto">
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                    {getRoleIcon(member.role)}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}
                    >
                      {member.role}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {member.role !== "creator" && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Remove Member"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {filteredMembers.length === 0 && (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No members found</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const CreateBadgeInline = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    icon: "🏆",
    title: "",
    description: "",
    triggerRule: "",
    color: "#FFD700",
    isActive: true,
  })

  const commonIcons = ["🏆", "🎯", "🌟", "👨‍🏫", "🚀", "💎", "🔥", "⚡", "🎖️", "🏅"]
  const commonColors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"]

  const handleSubmit = (e) => {
    e.preventDefault()
    const badgeData = {
      ...formData,
      createdAt: new Date().toISOString(),
    }
    onSave(badgeData)
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Badge</h3>
        <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Badge Preview */}
        <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-6xl mb-2">{formData.icon}</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formData.title || "Badge Title"}</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{formData.description || "Badge description"}</p>
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {commonIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                className={`p-3 text-2xl rounded-lg border-2 transition-colors ${
                  formData.icon === icon
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-purple-300"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Or enter custom emoji..."
          />
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {commonColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, color }))}
                className={`w-full h-10 rounded-lg border-2 transition-colors ${
                  formData.color === color
                    ? "border-gray-800 dark:border-white"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
            className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
        </div>

        {/* Form Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter badge title..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Describe how to earn this badge..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trigger Rule *</label>
          <input
            type="text"
            value={formData.triggerRule}
            onChange={(e) => setFormData((prev) => ({ ...prev, triggerRule: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., 10+ helpful posts, Complete 5 courses..."
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
            className="mr-2"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
            Badge is active and can be earned
          </label>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
          >
            Create Badge
          </button>
        </div>
      </form>
    </motion.div>
  )
}

const EditBadgeInline = ({ badge, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    icon: badge.icon || "🏆",
    title: badge.title || "",
    description: badge.description || "",
    triggerRule: badge.triggerRule || "",
    color: badge.color || "#FFD700",
    isActive: badge.isActive !== undefined ? badge.isActive : true,
  })

  const commonIcons = ["🏆", "🎯", "🌟", "👨‍🏫", "🚀", "💎", "🔥", "⚡", "🎖️", "🏅"]
  const commonColors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"]

  const handleSubmit = (e) => {
    e.preventDefault()
    const badgeData = {
      ...badge,
      ...formData,
    }
    onSave(badgeData)
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Badge</h3>
        <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Badge Preview */}
        <div className="text-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-6xl mb-2">{formData.icon}</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formData.title || "Badge Title"}</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{formData.description || "Badge description"}</p>
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {commonIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                className={`p-3 text-2xl rounded-lg border-2 transition-colors ${
                  formData.icon === icon
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-purple-300"
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={formData.icon}
            onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Or enter custom emoji..."
          />
        </div>

        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {commonColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, color }))}
                className={`w-full h-10 rounded-lg border-2 transition-colors ${
                  formData.color === color
                    ? "border-gray-800 dark:border-white"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <input
            type="color"
            value={formData.color}
            onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
            className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
        </div>

        {/* Form Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter badge title..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Describe how to earn this badge..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trigger Rule *</label>
          <input
            type="text"
            value={formData.triggerRule}
            onChange={(e) => setFormData((prev) => ({ ...prev, triggerRule: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g., 10+ helpful posts, Complete 5 courses..."
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
            className="mr-2"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
            Badge is active and can be earned
          </label>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
          >
            Update Badge
          </button>
        </div>
      </form>
    </motion.div>
  )
}
