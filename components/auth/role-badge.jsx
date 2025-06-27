"use client"

import { Shield, Edit, Users, GraduationCap, BarChart3, Headphones } from "lucide-react"

const roleConfig = {
  admin: {
    label: "Administrator",
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    icon: Shield,
    description: "Full system access and management",
  },
  writer: {
    label: "Content Writer",
    color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
    icon: Edit,
    description: "Create and manage content",
  },
  moderator: {
    label: "Community Moderator",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
    icon: Users,
    description: "Manage community and discussions",
  },
  instructor: {
    label: "Course Instructor",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
    icon: GraduationCap,
    description: "Create and manage courses",
  },
  analyst: {
    label: "Data Analyst",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
    icon: BarChart3,
    description: "Access analytics and reports",
  },
  support: {
    label: "Support Agent",
    color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300",
    icon: Headphones,
    description: "Handle user support and tickets",
  },
}

export default function RoleBadge({ role, showDescription = false, size = "sm" }) {
  const config = roleConfig[role] || roleConfig.admin
  const Icon = config.icon

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  }

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.color} ${sizeClasses[size]}`}
      >
        <Icon className={iconSizes[size]} />
        {config.label}
      </span>
      {showDescription && <span className="text-xs text-gray-500 dark:text-gray-400">{config.description}</span>}
    </div>
  )
}

export { roleConfig }
