import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      console.error("No token provided in GET request")
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }
    await verifyToken(token)

    const { db } = await connectToDatabase()
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const enrollments = await db.collection("enrollments").aggregate([
      {
        $match: {
          completionDate: {
            $gte: new Date(),
            $lte: sevenDaysFromNow,
          },
          status: "completed",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id",
          as: "course",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $unwind: "$course",
      },
      {
        $match: {
          "user.type": "student",
        },
      },
      {
        $project: {
          completionDate: 1,
          userName: "$user.name",
          courseTitle: "$course.title",
        },
      },
    ]).toArray()

    const upcomingCompletions = {}
    enrollments.forEach((enrollment) => {
      const dateStr = enrollment.completionDate.toISOString().split("T")[0]
      if (!upcomingCompletions[dateStr]) {
        upcomingCompletions[dateStr] = []
      }
      upcomingCompletions[dateStr].push(`${enrollment.userName} - ${enrollment.courseTitle}`)
    })

    return NextResponse.json(upcomingCompletions)
  } catch (error) {
    console.error("GET /api/enrollments/upcoming-completions error:", error.message, error.stack)
    return NextResponse.json({ error: `Failed to fetch upcoming completions: ${error.message}` }, { status: 500 })
  }
}