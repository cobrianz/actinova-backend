import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, role, password } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !role || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (
      ![
        "writer",
        "moderator",
        "instructor",
        "analyst",
        "support",
        "admin",
      ].includes(role)
    ) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Check if email or phone already exists in users or pending_requests
    const existingUser = await db.collection("users").findOne({
      $or: [{ email }, { phone }],
    });
    const existingRequest = await db.collection("pending_requests").findOne({
      $or: [{ email }, { phone }],
    });

    const errors = {};
    if (existingUser && existingUser.email === email) {
      errors.email = "Email already registered";
    }
    if (existingUser && existingUser.phone === phone) {
      errors.phone = "Phone number already registered";
    }
    if (existingRequest && existingRequest.email === email) {
      errors.email = "Pending request with this email already exists";
    }
    if (existingRequest && existingRequest.phone === phone) {
      errors.phone = "Pending request with this phone number already exists";
    }
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { message: "Registration failed", errors },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create pending request object
    const requestData = {
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      phone,
      type: role,
      password: hashedPassword,
      requestDate: new Date().toISOString(),
    };

    // Insert into pending_requests
    const result = await db
      .collection("pending_requests")
      .insertOne(requestData);

    return NextResponse.json(
      {
        message:
          "Signup request submitted successfully. Awaiting admin approval.",
        request: {
          id: result.insertedId.toString(),
          ...requestData,
          password: undefined,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/signup error:", error);
    return NextResponse.json(
      { message: `Internal server error: ${error.message}` },
      { status: 500 }
    );
  }
}
