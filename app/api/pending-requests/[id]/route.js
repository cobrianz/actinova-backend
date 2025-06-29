import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(req, { params }) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;
    console.log("POST /api/pending-requests/[id] - Received ID:", id); // Debug log
    if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: `Invalid request ID: ${id || "undefined"}` },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const request = await db
      .collection("pending_requests")
      .findOne({ _id: new ObjectId(id) });
    if (!request) {
      return NextResponse.json(
        { message: `Request not found for ID: ${id}` },
        { status: 404 }
      );
    }

    const userData = {
      email: request.email,
      name: request.name,
      firstName: request.firstName,
      lastName: request.lastName,
      phone: request.phone,
      role: request.type,
      type: "staff",
      status: "active",
      joinDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      approved: true,
      plan: "N/A",
      password: request.password,
    };

    const result = await db.collection("users").insertOne(userData);
    await db
      .collection("pending_requests")
      .deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json(
      {
        message: "Request approved and user created",
        user: {
          id: result.insertedId.toString(),
          ...userData,
          password: undefined,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`POST /api/pending-requests/${params.id} error:`, error);
    return NextResponse.json(
      { message: `Error approving request: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);
    if (decoded.role !== "admin") {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = params;
    console.log("DELETE /api/pending-requests/[id] - Received ID:", id); // Debug log
    if (!id || typeof id !== "string" || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: `Invalid request ID: ${id || "undefined"}` },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const result = await db
      .collection("pending_requests")
      .deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: `Request not found for ID: ${id}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Request rejected successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`DELETE /api/pending-requests/${params.id} error:`, error);
    return NextResponse.json(
      { message: `Error rejecting request: ${error.message}` },
      { status: 500 }
    );
  }
}
