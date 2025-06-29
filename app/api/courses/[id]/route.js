import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      console.error("No token provided in PUT request")
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }
    const decoded = await verifyToken(token) // Decode token to get user info

    const { id } = params
    if (!ObjectId.isValid(id)) {
      console.error(`Invalid ObjectId: ${id}`)
      return NextResponse.json({ error: "Invalid course ID format" }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, level, tags, skills, roadmapSteps, price, duration, instructor, status } = body

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim() === "") {
      console.error("Invalid title:", title)
      return NextResponse.json({ error: "Title is required and must be a non-empty string" }, { status: 400 })
    }
    if (!description || typeof description !== "string" || description.trim() === "") {
      console.error("Invalid description:", description)
      return NextResponse.json({ error: "Description is required and must be a non-empty string" }, { status: 400 })
    }
    if (!level || !["Beginner", "Intermediate", "Advanced"].includes(level)) {
      console.error("Invalid level:", level)
      return NextResponse.json({ error: "Level must be Beginner, Intermediate, or Advanced" }, { status: 400 })
    }
    if (!Array.isArray(tags) || tags.some(tag => typeof tag !== "string" || tag.trim() === "")) {
      return NextResponse.json({ error: "Tags must be an array of non-empty strings" }, { status: 400 })
    }
    if (!Array.isArray(skills) || skills.some(skill => typeof skill !== "string" || skill.trim() === "")) {
      return NextResponse.json({ error: "Skills must be an array of non-empty strings" }, { status: 400 })
    }
    if (!Array.isArray(roadmapSteps) || roadmapSteps.some(step => typeof step !== "string" || step.trim() === "")) {
      return NextResponse.json({ error: "Roadmap steps must be an array of non-empty strings" }, { status: 400 })
    }
    if (typeof price !== "number" || price < 0) {
      return NextResponse.json({ error: "Price must be a non-negative number" }, { status: 400 })
    }
    if (!duration || typeof duration !== "string" || duration.trim() === "") {
      return NextResponse.json({ error: "Duration is required and must be a non-empty string" }, { status: 400 })
    }
    if (!instructor || typeof instructor !== "string" || instructor.trim() === "") {
      return NextResponse.json({ error: "Instructor is required and must be a non-empty string" }, { status: 400 })
    }
    if (status && !["Draft", "Published"].includes(status)) {
      return NextResponse.json({ error: "Status must be Draft or Published" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const courseId = new ObjectId(id)

    // Check if course exists and creator matches
    const existingCourse = await db.collection("courses").findOne({ _id: courseId })
    if (!existingCourse) {
      console.error(`Course not found for ID: ${id}`)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }
    if (existingCourse.creator.id.toString() !== decoded.userId) {
      console.error(`Unauthorized update attempt by user ${decoded.userId} for course ${id}`)
      return NextResponse.json({ error: "Unauthorized to update this course" }, { status: 403 })
    }

    const update = {
      title: title.trim(),
      description: description.trim(),
      status: status || existingCourse.status || "Draft",
      level,
      tags: tags.map(tag => tag.trim()).filter(Boolean),
      skills: skills.map(skill => skill.trim()).filter(Boolean),
      roadmapSteps: roadmapSteps.map(step => step.trim()).filter(Boolean),
      price: Number(price),
      duration: duration.trim(),
      instructor: instructor.trim(),
      updatedAt: new Date(),
    }

    const result = await db.collection("courses").updateOne(
      { _id: courseId },
      { $set: update },
      { writeConcern: { w: "majority" } }
    )



    if (result.matchedCount === 0) {
      console.error(`Course not found during update for ID: ${id}`)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }
    if (result.modifiedCount === 0 && result.matchedCount > 0) {
      console.warn(`No changes applied to course ID: ${id}, data unchanged`)
    }

    // Fetch the updated course to return
    const updatedCourse = await db.collection("courses").findOne({ _id: courseId })
    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error("PUT /api/courses/[id] error:", error.message, error.stack)
    return NextResponse.json({ error: `Failed to update course: ${error.message}` }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      console.error("No token provided in DELETE request")
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }
    const decoded = await verifyToken(token)

    const { id } = params
    if (!ObjectId.isValid(id)) {
      console.error(`Invalid ObjectId: ${id}`)
      return NextResponse.json({ error: "Invalid course ID format" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const courseId = new ObjectId(id)

    // Check if course exists and creator matches
    const existingCourse = await db.collection("courses").findOne({ _id: courseId })
    if (!existingCourse) {
      console.error(`Course not found for ID: ${id}`)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }
    if (existingCourse.creator.id.toString() !== decoded.userId) {
      console.error(`Unauthorized delete attempt by user ${decoded.userId} for course ${id}`)
      return NextResponse.json({ error: "Unauthorized to delete this course" }, { status: 403 })
    }

    const result = await db.collection("courses").deleteOne({ _id: courseId })

    if (result.deletedCount === 0) {
      console.error(`Course not found for ID: ${id}`)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    await db.collection("enrollments").deleteMany({ courseId })

    return NextResponse.json({ message: "Course deleted successfully" })
  } catch (error) {
    console.error("DELETE /api/courses/[id] error:", error.message, error.stack)
    return NextResponse.json({ error: `Failed to delete course: ${error.message}` }, { status: 500 })
  }
}