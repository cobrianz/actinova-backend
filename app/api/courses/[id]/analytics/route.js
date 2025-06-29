import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }
    await verifyToken(token) // Only verify token, no role check

    const { id } = params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "6months"

    const { db } = await connectToDatabase()
    const course = await db.collection("courses").findOne({ _id: new ObjectId(id) })
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const now = new Date()
    let startDate
    switch (timeRange) {
      case "1month":
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case "3months":
        startDate = new Date(now.setMonth(now.getMonth() - 3))
        break
      case "1year":
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 6))
    }

    const enrollments = await db.collection("enrollments").find({
      courseId: new ObjectId(id),
      enrolledAt: { $gte: startDate },
    }).toArray()

    const months = []
    const currentDate = new Date(startDate)
    while (currentDate <= new Date()) {
      months.push({
        month: currentDate.toLocaleString("default", { month: "short" }),
        enrollments: 0,
        completions: 0,
      })
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    enrollments.forEach(enrollment => {
      const month = new Date(enrollment.enrolledAt).toLocaleString("default", { month: "short" })
      const monthData = months.find(m => m.month === month)
      if (monthData) {
        monthData.enrollments += 1
        if (enrollment.progress >= 100) monthData.completions += 1
      }
    })

    const engagementData = [
      { name: "Video Watched", value: 45, color: "#3B82F6" },
      { name: "Assignments", value: 25, color: "#10B981" },
      { name: "Discussions", value: 20, color: "#F59E0B" },
      { name: "Quizzes", value: 10, color: "#EF4444" },
    ]

    const progressData = Array.from({ length: 8 }, (_, i) => ({
      week: `Week ${i + 1}`,
      progress: Math.min(15 + i * 10, 100),
    }))

    const totalStudents = enrollments.length
    const completionRate = enrollments.length > 0
      ? Math.round((enrollments.filter(e => e.progress >= 100).length / enrollments.length) * 100)
      : 0
    const avgRating = course.rating || 0
    const totalStudyTime = enrollments.reduce((sum, e) => sum + (e.progress / 10), 0)

    const analytics = {
      enrollmentData: months,
      performanceData: [{
        course: course.title,
        completion: course.completionRate,
        rating: course.rating,
        students: course.enrolledUsers,
      }],
      engagementData,
      progressData,
      kpiData: {
        totalStudents,
        completionRate,
        avgRating,
        totalStudyTime: Math.round(totalStudyTime),
      },
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("GET /api/courses/[id]/analytics error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}