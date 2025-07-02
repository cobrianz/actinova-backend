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

    const { db } = await connectToDatabase()
    const certificateId = new ObjectId(id)

    const certificate = await db.collection("certificates").findOne({ _id: certificateId })
    if (!certificate) {
      console.error(`Certificate not found: ${id}`)
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }
    if (certificate.createdBy.toString() !== decoded.userId) {
      console.error(`Unauthorized revoke attempt by user ${decoded.userId} for certificate ${id}`)
      return NextResponse.json({ error: "Unauthorized to revoke this certificate" }, { status: 403 })
    }

    const result = await db.collection("certificates").updateOne(
      { _id: certificateId },
      { $set: { status: "Revoked", updatedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      console.error(`Certificate not found during update: ${id}`)
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 })
    }

    const updatedCertificate = await db.collection("certificates").findOne({ _id: certificateId })
    return NextResponse.json(updatedCertificate)
  } catch (error) {
    console.error("PUT /api/certificates/[id] error:", error.message, error.stack)
    return NextResponse.json({ error: `Failed to revoke certificate: ${error.message}` }, { status: 500 })
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