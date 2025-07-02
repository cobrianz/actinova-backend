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
    const { userId, courseId, userName, courseName } = body

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
    const page = pdfDoc.addPage([600, 400])
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
    const smallFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    const fontSize = 30
    const smallFontSize = 14

    // Certificate design
    page.drawRectangle({
      x: 10,
      y: 10,
      width: width - 20,
      height: height - 20,
      borderColor: rgb(0.2, 0.4, 0.6),
      borderWidth: 4,
    })
    page.drawText("Certificate of Achievement", {
      x: 50,
      y: height - 60,
      size: fontSize,
      font,
      color: rgb(0.2, 0.4, 0.6),
    })
    page.drawText(`Awarded to`, {
      x: 50,
      y: height - 100,
      size: smallFontSize,
      font: smallFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(userName, {
      x: 50,
      y: height - 140,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    })
    page.drawText(`for successfully completing`, {
      x: 50,
      y: height - 180,
      size: smallFontSize,
      font: smallFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(courseName, {
      x: 50,
      y: height - 220,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    })
    page.drawText(`Issued on: ${new Date().toISOString().split("T")[0]}`, {
      x: 50,
      y: height - 260,
      size: smallFontSize,
      font: smallFont,
      color: rgb(0, 0, 0),
    })
    page.drawText(`Certificate ID: ${certificateId}`, {
      x: 50,
      y: height - 280,
      size: smallFontSize,
      font: smallFont,
      color: rgb(0, 0, 0),
    })
    page.drawText("Instructor Signature", {
      x: width - 150,
      y: height - 280,
      size: smallFontSize,
      font: smallFont,
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
    }

    const result = await db.collection("certificates").insertOne(certificate)
    certificate._id = result.insertedId

    return NextResponse.json(certificate)
  } catch (error) {
    console.error("POST /api/certificates error:", error.message, error.stack)
    return NextResponse.json({ error: `Failed to generate certificate: ${error.message}` }, { status: 500 })
  }
}