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

    // Status distribution
    const statusDistribution = await db.collection("certificates").aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]).toArray()

    // Certificates by course
    const certificatesByCourse = await db.collection("certificates").aggregate([
      {
        $group: {
          _id: "$courseName",
          count: { $sum: 1 },
        },
      },
    ]).toArray()

    const analytics = {
      statusDistribution: statusDistribution.map(item => ({
        name: item._id,
        value: item.count,
      })),
      certificatesByCourse: certificatesByCourse.map(item => ({
        course: item._id,
        count: item.count,
      })),
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("GET /api/certificates/analytics error:", error.message, error.stack)
    return NextResponse.json({ error: `Failed to fetch analytics: ${error.message}` }, { status: 500 })
  }
}