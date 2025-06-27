import { connectToDatabase } from "@/lib/mongodb";
import { verifyPassword, signToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "Email and password are required" }),
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Find user by email
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return new Response(
        JSON.stringify({ errors: { email: "Email not found" } }),
        { status: 401 }
      );
    }

    // Check if account is approved
    if (!user.approved) {
      return new Response(
        JSON.stringify({
          errors: { approved: "Account awaiting admin approval" },
        }),
        { status: 403 }
      );
    }

    // Check if account is suspended
    if (user.status === "suspended") {
      return new Response(
        JSON.stringify({
          errors: { status: "Account is suspended" },
        }),
        { status: 403 }
      );
    }

    // Verify password using auth library
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return new Response(
        JSON.stringify({ errors: { password: "Invalid password" } }),
        { status: 401 }
      );
    }

    // Update lastActive timestamp
    await db.collection("users").updateOne(
      { _id: new ObjectId(user._id) },
      { $set: { lastActive: new Date() } }
    );

    // Generate JWT token using auth library
    const token = await signToken(
      { userId: user._id.toString(), email: user.email, role: user.role },
      { expiresIn: "7d" }
    );

    return new Response(
      JSON.stringify({
        message: "Sign-in successful",
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name,
          phone: user.phone,
          type: user.type,
          status: user.status,
          joinDate: user.joinDate,
          lastActive: new Date(),
          approved: user.approved,
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Sign-in error:", error.message);
    return new Response(
      JSON.stringify({ message: `Internal server error: ${error.message}` }),
      { status: 500 }
    );
  }
}