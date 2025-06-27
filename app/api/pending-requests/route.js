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
    const requests = await db.collection("pending_requests").find({}).toArray();
    return new Response(
      JSON.stringify({
        message: "Pending requests fetched successfully",
        requests: requests.map(req => ({
          _id: req._id.toString(),
          name: req.name,
          email: req.email,
          type: req.type,
          phone: req.phone,
          message: req.message,
          experience: req.experience,
          requestDate: req.requestDate,
          password: undefined,
        })),
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Error fetching pending requests: ${error.message}` }),
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
      type,
      role,
      password,
    } = body;

    if (!name || !email || !role || !type || !phone || !password) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    if (type !== "staff" || !["writer", "moderator", "instructor", "analyst", "support", "admin"].includes(role)) {
      return new Response(
        JSON.stringify({ message: "Invalid user type or role" }),
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

    const existingRequestByEmail = await db.collection("pending_requests").findOne({ email });
    if (existingRequestByEmail) {
      return new Response(
        JSON.stringify({ message: "Pending request for this email already exists" }),
        { status: 400 }
      );
    }

    const existingUserByPhone = await db.collection("users").findOne({ phone });
    if (existingUserByPhone) {
      return new Response(
        JSON.stringify({ message: "Phone number already in use" }),
        { status: 400 }
      );
    }

    const existingRequestByPhone = await db.collection("pending_requests").findOne({ phone });
    if (existingRequestByPhone) {
      return new Response(
        JSON.stringify({ message: "Phone number already in use in a pending request" }),
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const requestData = {
      name,
      firstName,
      lastName,
      email,
      phone,
      type: role,
      requestDate: new Date().toISOString(),
      password: hashedPassword,
    };

    const result = await db.collection("pending_requests").insertOne(requestData);
    return new Response(
      JSON.stringify({
        message: "Pending request created successfully",
        request: { _id: result.insertedId.toString(), ...requestData, password: undefined },
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Error creating pending request: ${error.message}` }),
      { status: 500 }
    );
  }
}