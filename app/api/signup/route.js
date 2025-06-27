import { connectToDatabase } from "@/lib/mongodb";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, role, password } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !role || !password) {
      return new Response(
        JSON.stringify({ message: "All fields are required" }),
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Check if email or phone already exists
    const existingUser = await db.collection("users").findOne({
      $or: [{ email }, { phone }],
    });
    if (existingUser) {
      const errors = {};
      if (existingUser.email === email) {
        errors.email = "Email already registered";
      }
      if (existingUser.phone === phone) {
        errors.phone = "Phone number already registered";
      }
      return new Response(
        JSON.stringify({ message: "Registration failed", errors }),
        { status: 400 }
      );
    }

    // Hash password using auth library
    const hashedPassword = await hashPassword(password);

    // Create user object
    const user = {
      email,
      password: hashedPassword,
      role,
      name: `${firstName} ${lastName}`,
      phone,
      type: "staff",
      status: "suspended",
      joinDate: new Date(),
      lastActive: null,
      approved: false,
      plan: null,
    };

    // Insert user into database
    const result = await db.collection("users").insertOne(user);

    // Generate JWT token using auth library
    const token = await signToken(
      { userId: result.insertedId, email, role },
      { expiresIn: "7d" }
    );

    return new Response(
      JSON.stringify({
        message: "User created successfully",
        token,
        user: {
          id: result.insertedId,
          email,
          role,
          name: user.name,
          phone,
          type: user.type,
          status: user.status,
          joinDate: user.joinDate,
          approved: user.approved,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return new Response(
      JSON.stringify({ message: `Internal server error: ${error.message}` }),
      { status: 500 }
    );
  }
}