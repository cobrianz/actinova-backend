import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(req, { params }) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ message: "No token provided" }),
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);
    if (decoded.role !== "admin") {
      return new Response(
        JSON.stringify({ message: "Unauthorized: Admin access required" }),
        { status: 403 }
      );
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ message: "Invalid request ID" }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const request = await db.collection("pending_requests").findOne({ _id: new ObjectId(id) });
    if (!request) {
      return new Response(
        JSON.stringify({ message: "Request not found" }),
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
    await db.collection("pending_requests").deleteOne({ _id: new ObjectId(id) });

    return new Response(
      JSON.stringify({
        message: "Request approved and user created",
        user: { id: result.insertedId.toString(), ...userData, password: undefined },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Error approving request: ${error.message}` }),
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ message: "No token provided" }),
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);
    if (decoded.role !== "admin") {
      return new Response(
        JSON.stringify({ message: "Unauthorized: Admin access required" }),
        { status: 403 }
      );
    }

    const { id } = params;
    if (!ObjectId.isValid(id)) {
      return new Response(
        JSON.stringify({ message: "Invalid request ID" }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const result = await db.collection("pending_requests").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ message: "Request not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Request rejected successfully" }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Error rejecting request: ${error.message}` }),
      { status: 500 }
    );
  }
}