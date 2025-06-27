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

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "6", 10);
    const category = url.searchParams.get("category");
    const skip = (page - 1) * limit;

    const query = { createdBy: new ObjectId(decoded.userId) };
    if (category && category !== "all") {
      query.category = category;
    }

    const totalPosts = await db.collection("posts").countDocuments(query);
    const posts = await db
      .collection("posts")
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json(
      {
        message: "Posts fetched successfully",
        user: {
          name: user.name,
          email: user.email || "Unknown",
        },
        posts: posts.map((post) => ({
          id: post._id.toString(),
          title: post.title,
          slug: post.slug,
          status: post.status || "Draft",
          publishDate: post.publishDate,
          views: post.views || 0,
          likes: post.likes || 0,
          comments: post.comments || 0,
          description: post.description,
          keywords: post.keywords,
          content: post.content,
          featuredImage:
            post.featuredImage || "/placeholder.svg?height=200&width=400",
          category: post.category,
          readTime: post.readTime || "5 min read",
          author: user.name,
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
          limit,
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

export async function POST(req) {
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

    const body = await req.json();
    const {
      title,
      slug,
      description,
      content,
      keywords,
      category,
      publishDate,
      status,
      featuredImage,
    } = body;

    if (!title || !description || !content) {
      return NextResponse.json(
        { message: "Title, description, and content are required" },
        { status: 400 }
      );
    }

    if (
      featuredImage &&
      !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(featuredImage)
    ) {
      return NextResponse.json(
        { message: "Invalid featured image URL" },
        { status: 400 }
      );
    }

    const existingSlug = await db.collection("posts").findOne({ slug });
    if (existingSlug) {
      return NextResponse.json(
        { message: "Slug already exists" },
        { status: 400 }
      );
    }

    const post = {
      title,
      slug,
      status: status || "Draft",
      publishDate: publishDate || null,
      views: 0,
      likes: 0,
      comments: 0,
      description,
      keywords: keywords || "",
      content,
      featuredImage: featuredImage || null,
      category: category || "Technology",
      readTime: "5 min read",
      createdBy: new ObjectId(decoded.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("posts").insertOne(post);

    return NextResponse.json(
      {
        message: "Post created successfully",
        post: {
          id: result.insertedId.toString(),
          ...post,
          featuredImage:
            post.featuredImage || "/placeholder.svg?height=200&width=400",
          author: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: `Failed to create post: ${error.message}` },
      { status: 400 }
    );
  }
}
