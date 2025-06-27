import { invalidateToken } from "@/lib/auth";

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
    await invalidateToken(token);

    return new Response(
      JSON.stringify({ message: "Logged out successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return new Response(
      JSON.stringify({ message: `Internal server error: ${error.message}` }),
      { status: 500 }
    );
  }
}