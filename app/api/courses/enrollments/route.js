import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }
    const decoded = await verifyToken(token)
    if (decoded.role !== "student") {
      return NextResponse.json({ error: "Only students can enroll in courses" }, { status: 403 })
    }

    const body = await request.json()
    const { courseId, userId } = body

    if (!ObjectId.isValid(courseId) || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid course or user ID" }, { status: 400 })
    }

    if (userId !== decoded._id) {
      return NextResponse.json({ error: "Unauthorized user ID" }, { status: 403 })
    }

    const { db } = await connectToDatabase()
    const course = await db.collection("courses").findOne({ _id: new ObjectId(courseId) })
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const existingEnrollment = await db.collection("enrollments").findOne({
      courseId: new ObjectId(courseId),
      userId: new ObjectId(userId),
    })
    if (existingEnrollment) {
      return NextResponse.json({ error: "User already enrolled in this course" }, { status: 400 })
    }

    const enrollment = {
      courseId: new ObjectId(courseId),
      userId: new ObjectId(userId),
      enrolledAt: new Date(),
      progress: 0,
    }

    await db.collection("enrollments").insertOne(enrollment)
    await db.collection("courses").updateOne(
      { _id: new ObjectId(courseId) },
      { $inc: { enrolledUsers: 1 } }
    )

    return NextResponse.json({ message: "Enrolled successfully" }, { status: 201 })
  } catch (error) {
    console.error("POST /api/enrollments error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
