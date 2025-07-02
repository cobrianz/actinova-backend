import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import fs from "fs/promises"
import path from "path"

export async function PUT(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      console.error("No token provided in PUT request")
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }
    const decoded = await verifyToken(token)

    const { id } = params
    if (!ObjectId.isValid(id)) {
      console.error(`Invalid ObjectId: ${id}`)
      return NextResponse.json({ error: "Invalid certificate ID format" }, { status: 400 })
    }

    const body = await request.json()
    const { action } = body // "revoke" or "unrevoke"

    if (!["revoke", "unrevoke"].includes(action)) {
      console.error(`Invalid action: ${action}`)
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const certificateId = new ObjectId(id)

    const certificate = await db.collection("certificates").findOne({ _id: certificateId })
    if (!certificate) {
      console.error(`Certificate not found: ${id}`)
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }
    if (certificate.createdBy.toString() !== decoded.userId) {
      console.error(`Unauthorized ${action} attempt by user ${decoded.userId} for certificate ${id}`)
      return NextResponse.json({ error: `Unauthorized to ${action} this certificate` }, { status: 403 })
    }

    const newStatus = action === "revoke" ? "Revoked" : "Issued"
    const result = await db.collection("certificates").updateOne(
      { _id: certificateId },
      { $set: { status: newStatus, updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      console.error(`Certificate not found during update: ${id}`)
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    const updatedCertificate = await db.collection("certificates").findOne({ _id: certificateId })
    return NextResponse.json(updatedCertificate)
  } catch (error) {
    console.error("PUT /api/certificates/[id] error:", error.message, error.stack)
    return NextResponse.json({ error: `Failed to update certificate: ${error.message}` }, { status: 500 })
  }
}

export async function GET(request, { params }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      console.error("No token provided in GET request")
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }
    const decoded = await verifyToken(token)

    const { id } = params
    if (!ObjectId.isValid(id)) {
      console.error(`Invalid ObjectId: ${id}`)
      return NextResponse.json({ error: "Invalid certificate ID format" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const certificateId = new ObjectId(id)
    const certificate = await db.collection("certificates").findOne({ _id: certificateId })

    if (!certificate) {
      console.error(`Certificate not found: ${id}`)
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    if (certificate.status === "Revoked") {
      console.error(`Attempt to download revoked certificate: ${id}`)
      return NextResponse.json({ error: "Certificate is revoked" }, { status: 400 })
    }

    // Log download
    await db.collection("certificates").updateOne(
      { _id: certificateId },
      {
        $push: {
          downloads: {
            userId: new ObjectId(decoded.userId),
            timestamp: new Date(),
          },
        },
        $set: { updatedAt: new Date() },
      }
    )

    const filePath = path.join(process.cwd(), "public", "certificates", `${certificate.certificateId}.pdf`)
    try {
      const fileBuffer = await fs.readFile(filePath)
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename=${certificate.certificateId}.pdf`,
        },
      })
    } catch (error) {
      console.error(`Failed to read certificate file: ${filePath}`, error.message)
      return NextResponse.json({ error: "Certificate file not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("GET /api/certificates/[id] error:", error.message, error.stack)
    return NextResponse.json({ error: `Failed to download certificate: ${error.message}` }, { status: 500 })
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
      return NextResponse.json({ error: "Invalid certificate ID format" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const certificateId = new ObjectId(id)
    const certificate = await db.collection("certificates").findOne({ _id: certificateId })

    if (!certificate) {
      console.error(`Certificate not found: ${id}`)
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }
    if (certificate.createdBy.toString() !== decoded.userId) {
      console.error(`Unauthorized delete attempt by user ${decoded.userId} for certificate ${id}`)
      return NextResponse.json({ error: "Unauthorized to delete this certificate" }, { status: 403 })
    }

    // Delete the PDF file
    const filePath = path.join(process.cwd(), "public", "certificates", `${certificate.certificateId}.pdf`)
    try {
      await fs.unlink(filePath)
    } catch (error) {
      console.warn(`Failed to delete PDF file: ${filePath}`, error.message)
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    const result = await db.collection("certificates").deleteOne({ _id: certificateId })
    if (result.deletedCount === 0) {
      console.error(`Certificate not found during deletion: ${id}`)
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Certificate deleted successfully" })
  } catch (error) {
    console.error("DELETE /api/certificates/[id] error:", error.message, error.stack)
    return NextResponse.json({ error: `Failed to delete certificate: ${error.message}` }, { status: 500 })
  }
}