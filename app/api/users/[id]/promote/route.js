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
        JSON.stringify({ message: "Invalid user ID" }),
        { status: 400 }
      );
    }

    const body = await req.json();
    const { role } = body;

    if (!["writer", "moderator", "instructor", "analyst", "support", "admin"].includes(role)) {
      return new Response(
        JSON.stringify({ message: "Invalid role" }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ _id: new ObjectId(id) });
    if (!user) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        { status: 404 }
      );
    }

    await db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: { role } }
    );

    return new Response(
      JSON.stringify({ message: "User promoted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Error promoting user: ${error.message}` }),
      { status: 500 }
    );
  }
}