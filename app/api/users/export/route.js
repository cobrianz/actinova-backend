import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { parse } from "json2csv";

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
    const { format, filter } = body;
    if (format !== "csv") {
      return new Response(
        JSON.stringify({ message: "Only CSV export is supported" }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const query = filter.type ? { type: filter.type } : {};
    const users = await db.collection("users").find(query).toArray();

    const csvData = users.map(user => ({
      Name: user.name,
      Email: user.email,
      Role: user.role,
      Plan: user.plan || "N/A",
      "Last Login": new Date(user.lastActive).toLocaleString(),
      Status: user.status,
    }));

    const csv = parse(csvData, {
      fields: ["Name", "Email", "Role", "Plan", "Last Login", "Status"],
    });

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=users_${filter.type || "all"}_${new Date().toISOString().split("T")[0]}.csv`,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: `Error exporting users: ${error.message}` }),
      { status: 500 }
    );
  }
}