import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken, hashPassword } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req) {
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

    const { db } = await connectToDatabase();
    const users = await db.collection("users").find({}).toArray();
    return new Response(
      JSON.stringify({
        message: "Users fetched successfully",
        users: users.map(user => ({
          id: user._id.toString(),
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          type: user.type,
          status: user.status,
          joinDate: user.joinDate,
          lastActive: user.lastActive,
          approved: user.approved,
          plan: user.plan,
        })),
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Error fetching users: ${error.message}` }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
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

    const body = await req.json();
    const {
      name,
      firstName,
      lastName,
      email,
      phone,
      role,
      type,
      status,
      joinDate,
      lastActive,
      approved,
      plan,
      password,
    } = body;

    if (type === "staff") {
      return new Response(
        JSON.stringify({ message: "Staff users must be created via /api/pending-requests" }),
        { status: 400 }
      );
    }

    if (!name || !email || !role || !type || !plan || !password) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    if (type !== "student" || !["free", "pro", "enterprise"].includes(plan)) {
      return new Response(
        JSON.stringify({ message: "Invalid user type or plan" }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const existingUserByEmail = await db.collection("users").findOne({ email });
    if (existingUserByEmail) {
      return new Response(
        JSON.stringify({ message: "User with this email already exists" }),
        { status: 400 }
      );
    }

    if (phone) {
      const existingUserByPhone = await db.collection("users").findOne({ phone });
      if (existingUserByPhone) {
        return new Response(
          JSON.stringify({ message: "Phone number already in use" }),
          { status: 400 }
        );
      }
    }

    const hashedPassword = await hashPassword(password);
    const userData = {
      name,
      firstName,
      lastName,
      email,
      phone,
      role,
      type,
      status: "active",
      joinDate: joinDate || new Date().toISOString(),
      lastActive: lastActive || new Date().toISOString(),
      approved: true,
      plan,
      password: hashedPassword,
    };

    const result = await db.collection("users").insertOne(userData);
    const newUser = {
      id: result.insertedId.toString(),
      ...userData,
      password: undefined,
    };

    return new Response(
      JSON.stringify({ message: "User created successfully", user: newUser }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Error creating user: ${error.message}` }),
      { status: 500 }
    );
  }
}

export async function PUT(req) {
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

    const body = await req.json();
    const {
      _id,
      name,
      firstName,
      lastName,
      email,
      phone,
      role,
      type,
      status,
      joinDate,
      lastActive,
      approved,
      plan,
      password,
    } = body;

    if (!_id || !ObjectId.isValid(_id)) {
      return new Response(
        JSON.stringify({ message: "Invalid user ID" }),
        { status: 400 }
      );
    }

    if (!name || !email || !role || !type || !plan) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const existingUserByEmail = await db.collection("users").findOne({ email, _id: { $ne: new ObjectId(_id) } });
    if (existingUserByEmail) {
      return new Response(
        JSON.stringify({ message: "User with this email already exists" }),
        { status: 400 }
      );
    }

    if (phone) {
      const existingUserByPhone = await db.collection("users").findOne({ phone, _id: { $ne: new ObjectId(_id) } });
      if (existingUserByPhone) {
        return new Response(
          JSON.stringify({ message: "Phone number already in use" }),
          { status: 400 }
        );
      }
    }

    const updateData = {
      name,
      firstName,
      lastName,
      email,
      phone,
      role,
      type,
      status,
      joinDate,
      lastActive,
      approved,
      plan,
    };

    if (password) {
      updateData.password = await hashPassword(password);
    }

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return new Response(
        JSON.stringify({ message: "User not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        message: "User updated successfully",
        user: { id: _id, ...updateData, password: undefined },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Error updating user: ${error.message}` }),
      { status: 500 }
    );
  }
}