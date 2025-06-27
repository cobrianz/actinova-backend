import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

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
    console.log("api/profile: Verifying token");
    const decoded = await verifyToken(token);

    const { db } = await connectToDatabase();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      console.error("api/profile: User not found for ID:", decoded.userId);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.approved) {
      console.warn(
        "api/profile: Account awaiting approval for user:",
        user.email
      );
      return NextResponse.json(
        { message: "Account awaiting admin approval" },
        { status: 403 }
      );
    }

    if (user.status === "suspended") {
      console.warn("api/profile: Account suspended for user:", user.email);
      return NextResponse.json(
        { message: "Account is suspended" },
        { status: 403 }
      );
    }

    console.log("api/profile: Profile fetched for user:", user.email);
    return NextResponse.json(
      {
        message: "Profile fetched successfully",
        profile: {
          id: user._id.toString(),
          email: user.email,
          role: user.role || "administrator",
          name: user.name,
          phone: user.phone || "",
          bio: user.bio || "",
          location: user.location || "",
          timezone: user.timezone || "America/Los_Angeles",
          language: user.language || "English",
          twoFactorAuth: user.twoFactorAuth || false,
          loginAlerts: user.loginAlerts || false,
          sessionTimeout: user.sessionTimeout || 30,
          emailNotifications: user.emailNotifications || true,
          pushNotifications: user.pushNotifications || true,
          weeklyReports: user.weeklyReports || true,
          securityAlerts: user.securityAlerts || true,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("api/profile: Error:", error.message);
    return NextResponse.json(
      { message: `Invalid session: ${error.message}` },
      { status: 401 }
    );
  }
}

export async function PUT(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    console.log("api/profile: Verifying token for PUT");
    const decoded = await verifyToken(token);

    const { db } = await connectToDatabase();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      console.error("api/profile: User not found for ID:", decoded.userId);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.approved) {
      console.warn(
        "api/profile: Account awaiting approval for user:",
        user.email
      );
      return NextResponse.json(
        { message: "Account awaiting admin approval" },
        { status: 403 }
      );
    }

    if (user.status === "suspended") {
      console.warn("api/profile: Account suspended for user:", user.email);
      return NextResponse.json(
        { message: "Account is suspended" },
        { status: 403 }
      );
    }

    const body = await req.json();
    console.log("api/profile: PUT payload:", body);

    const updateFields = {
      name: body.name,
      email: body.email,
      phone: body.phone || "",
      bio: body.bio || "",
      location: body.location || "",
      timezone: body.timezone || "America/Los_Angeles",
      language: body.language || "English",
      twoFactorAuth: body.twoFactorAuth || false,
      loginAlerts: body.loginAlerts || false,
      sessionTimeout: body.sessionTimeout || 30,
      emailNotifications: body.emailNotifications || true,
      pushNotifications: body.pushNotifications || true,
      weeklyReports: body.weeklyReports || true,
      securityAlerts: body.securityAlerts || true,
      updatedAt: new Date(),
    };

    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(body.password, salt);
    }

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(decoded.userId) }, { $set: updateFields });

    if (result.matchedCount === 0) {
      console.error(
        "api/profile: No user matched for update, ID:",
        decoded.userId
      );
      return NextResponse.json(
        { message: "Failed to update profile" },
        { status: 404 }
      );
    }

    console.log("api/profile: Profile updated for user:", user.email);
    return NextResponse.json(
      {
        message: "Profile updated successfully",
        profile: {
          id: user._id.toString(),
          email: updateFields.email,
          role: user.role,
          name: updateFields.name,
          phone: updateFields.phone,
          bio: updateFields.bio,
          location: updateFields.location,
          timezone: updateFields.timezone,
          language: updateFields.language,
          twoFactorAuth: updateFields.twoFactorAuth,
          loginAlerts: updateFields.loginAlerts,
          sessionTimeout: updateFields.sessionTimeout,
          emailNotifications: updateFields.emailNotifications,
          pushNotifications: updateFields.pushNotifications,
          weeklyReports: updateFields.weeklyReports,
          securityAlerts: updateFields.securityAlerts,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("api/profile: PUT error:", error.message);
    return NextResponse.json(
      { message: `Failed to update profile: ${error.message}` },
      { status: 400 }
    );
  }
}
