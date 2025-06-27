"use client"

import { Shield, PenTool, Users, GraduationCap, BarChart3, Headphones } from "lucide-react"

const roleDescriptions = {
  admin: {
    icon: Shield,
    title: "Administrator",
    description: "Full system access and user management",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-900/20",
  },
  writer: {
    icon: PenTool,
    title: "Content Writer",
    description: "Create and manage blog posts and content",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  moderator: {
    icon: Users,
    title: "Community Moderator",
    description: "Moderate discussions and manage community",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  instructor: {
    icon: GraduationCap,
    title: "Course Instructor",
    description: "Create courses and manage student progress",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  analyst: {
    icon: BarChart3,
    title: "Data Analyst",
    description: "Access analytics and generate reports",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
  },
  support: {
    icon: Headphones,
    title: "Support Agent",
    description: "Handle support tickets and help users",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-900/20",
  },
}

export default function RoleDescription({ role }) {
  const roleInfo = roleDescriptions[role]

  if (!roleInfo) return null

  const IconComponent = roleInfo.icon

  return (
    <div className={`p-3 rounded-lg ${roleInfo.bgColor} border border-gray-200 dark:border-gray-600 mt-2`}>
      <div className="flex items-center">
        <IconComponent className={`w-4 h-4 ${roleInfo.color} mr-2`} />
        <div>
          <h4 className={`font-medium ${roleInfo.color} text-sm`}>{roleInfo.title}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{roleInfo.description}</p>
        </div>
      </div>
    </div>
  )
}
