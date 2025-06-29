import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }
    await verifyToken(token) // Only verify token, no role check

    const { db } = await connectToDatabase()
    const courses = await db.collection("courses").find({}).toArray()

    return NextResponse.json(courses)
  } catch (error) {
    console.error("GET /api/courses error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 401 })
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }
    await verifyToken(token) // Only verify token, no role check

    const body = await request.json()
    const { title, description, level, tags, skills, roadmapSteps, price, duration, instructor } = body

    if (!title || !description || !level || !tags || !skills || !roadmapSteps || price <= 0 || !duration || !instructor) {
      return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const course = {
      title,
      description,
      status: "Draft",
      completionRate: 0,
      enrolledUsers: 0,
      level,
      tags: tags.map(tag => tag.trim()).filter(Boolean),
      skills: skills.map(skill => skill.trim()).filter(Boolean),
      roadmapSteps,
      price: Number(price),
      duration,
      rating: 0,
      instructor,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("courses").insertOne(course)
    const newCourse = { _id: result.insertedId, ...course }

    return NextResponse.json(newCourse, { status: 201 })
  } catch (error) {
    console.error("POST /api/courses error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
