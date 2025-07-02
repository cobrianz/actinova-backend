import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import fs from "fs/promises"
import path from "path"

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      console.error("No token provided in GET request")
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }
    await verifyToken(token)

    const { db } = await connectToDatabase()
    const certificates = await db.collection("certificates").find({}).toArray()
    return NextResponse.json(certificates)
  } catch (error) {
    console.error("GET /api/certificates error:", error.message, error.stack)
    return NextResponse.json({ error: `Failed to fetch certificates: ${error.message}` }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      console.error("No token provided in POST request")
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }
    const decoded = await verifyToken(token)

    const body = await request.json()
    const { userId, courseId, userName, courseName, skills = ["JavaScript", "Programming", "Web Development"], finalScore = 95, achievementLevel = "Beginner" } = body

    if (!userId || !courseId || !userName || !courseName) {
      console.error("Missing required fields:", { userId, courseId, userName, courseName })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Validate user and course
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId), type: "student" })
    if (!user) {
      console.error(`Student not found: ${userId}`)
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }
    const course = await db.collection("courses").findOne({ _id: new ObjectId(courseId) })
    if (!course) {
      console.error(`Course not found: ${courseId}`)
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    // Generate certificate ID
    const certificateCount = await db.collection("certificates").countDocuments()
    const certificateId = `CERT-${String(certificateCount + 1).padStart(3, "0")}-${new Date().getFullYear()}`

    // Generate PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 800])
    const { width, height } = page.getSize()
    const titleFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
    const bodyFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const titleFontSize = 36
    const subtitleFontSize = 20
    const bodyFontSize = 14
    const smallFontSize = 12

    // Certificate design
    page.drawRectangle({
      x: 20,
      y: 20,
      width: width - 40,
      height: height - 40,
      borderColor: rgb(0.2, 0.4, 0.6),
      borderWidth: 5,
    })
    page.drawText("Certificate of Excellence", {
      x: width / 2 - 100,
      y: height - 80,
      size: 24,
      font: titleFont,
      color: rgb(1, 0.84, 0),
    })
    page.drawText("Certificate of Achievement", {
      x: 50,
      y: height - 120,
      size: titleFontSize,
      font: titleFont,
      color: rgb(0, 0, 0),
    })
    page.drawText("Actinova AI Tutor - Personalized Learning Platform", {
      x: 50,
      y: height - 160,
      size: subtitleFontSize,
      font: bodyFont,
      color: rgb(0.4, 0.4, 0.4),
    })
    page.drawText("This certifies that", {
      x: 50,
      y: height - 220,
      size: bodyFontSize,
      font: bodyFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(userName, {
      x: 50,
      y: height - 260,
      size: titleFontSize,
      font: titleFont,
      color: rgb(0, 0, 0),
    })
    page.drawText("has successfully completed", {
      x: 50,
      y: height - 300,
      size: bodyFontSize,
      font: bodyFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(courseName, {
      x: 50,
      y: height - 340,
      size: titleFontSize,
      font: titleFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(`Completion Date: ${new Date().toISOString().split("T")[0]}`, {
      x: 50,
      y: height - 400,
      size: smallFontSize,
      font: bodyFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(`Achievement Level: ${achievementLevel}`, {
      x: 50,
      y: height - 420,
      size: smallFontSize,
      font: bodyFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(`Final Score: ${finalScore}%`, {
      x: 50,
      y: height - 440,
      size: smallFontSize,
      font: bodyFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(`Skills Demonstrated: ${skills.join(", ")}`, {
      x: 50,
      y: height - 480,
      size: smallFontSize,
      font: bodyFont,
      color: rgb(0, 0, 0),
    })
    page.drawText("This certificate validates the successful completion of the course requirements and demonstrates proficiency in the subject matter.", {
      x: 50,
      y: height - 540,
      size: smallFontSize,
      font: bodyFont,
      color: rgb(0, 0, 0),
      maxWidth: width - 100,
      lineHeight: 16,
    })
    page.drawText(`Actinova AI Tutor | Certificate ID: ${certificateId}`, {
      x: 50,
      y: height - 600,
      size: smallFontSize,
      font: bodyFont,
      color: rgb(0.4, 0.4, 0.4),
    })
    page.drawText("Instructor Signature", {
      x: width - 150,
      y: height - 600,
      size: smallFontSize,
      font: bodyFont,
      color: rgb(0, 0, 0),
    })

    const pdfBytes = await pdfDoc.save()
    const filePath = path.join(process.cwd(), "public", "certificates", `${certificateId}.pdf`)
    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, pdfBytes)

    const certificate = {
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId),
      userName,
      userEmail: user.email,
      courseName,
      issueDate: new Date().toISOString().split("T")[0],
      status: "Issued",
      certificateId,
      downloadUrl: `/certificates/${certificateId}.pdf`,
      createdBy: new ObjectId(decoded.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
      downloads: [],
      skills,
      finalScore,
      achievementLevel,
    }

    const result = await db.collection("certificates").insertOne(certificate)
    certificate._id = result.insertedId

    return NextResponse.json(certificate)
  } catch (error) {
    console.error("POST /api/certificates error:", error.message, error.stack)
    return NextResponse.json({ error: `Failed to generate certificate: ${error.message}` }, { status: 500 })
  }
}