import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req) {
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

    const { db } = await connectToDatabase();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {

      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.approved) {

      return NextResponse.json(
        { message: "Account awaiting admin approval" },
        { status: 403 }
      );
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        { message: "Account is suspended" },
        { status: 403 }
      );
    }


    return NextResponse.json(
      {
        message: "Session valid",
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role || "administrator",
          name: user.name,
          phone: user.phone,
          type: user.type,
          status: user.status,
          joinDate: user.joinDate,
          lastActive: user.lastActive,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `Invalid session: ${error.message}` },
      { status: 401 }
    );
  }
}
