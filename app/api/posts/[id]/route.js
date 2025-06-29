import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function PUT(req, { params }) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.approved) {
      return NextResponse.json({ message: "Account awaiting admin approval" }, { status: 403 });
    }

    if (user.status === "suspended") {
      return NextResponse.json({ message: "Account is suspended" }, { status: 403 });
    }

    const postId = params.id;
    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    const body = await req.json();
    const { title, slug, description, content, keywords, category, readTime, status, featuredImage, views, likes, comments, isFeatured, createdAt } = body;

    if (!title || !description || !content || !readTime) {
      return NextResponse.json({ message: "Title, description, content, and read time are required" }, { status: 400 });
    }

    if (featuredImage && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(featuredImage)) {
      return NextResponse.json({ message: "Invalid featured image URL" }, { status: 400 });
    }

    const existingSlug = await db.collection("posts").findOne({ slug, _id: { $ne: new ObjectId(postId) } });
    if (existingSlug) {
      return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
    }

    // If setting as featured, unfeature existing featured post
    if (isFeatured) {
      await db.collection("posts").updateMany(
        { isFeatured: true },
        { $set: { isFeatured: false } }
      );
    }

    const today = new Date().toISOString().split("T")[0];
    const updateFields = {
      title,
      slug,
      status,
      publishDate: status === "published" ? today : null,
      createdAt,
      updatedAt: today,
      description,
      keywords: keywords || "",
      content,
      featuredImage: featuredImage || null,
      category: category || "Technology",
      readTime,
      views: parseInt(views) || 0,
      likes: parseInt(likes) || 0,
      comments: parseInt(comments) || 0,
      isFeatured: isFeatured || false,
      author: user.name,
      authorId: decoded.userId,
    };

    const result = await db.collection("posts").updateOne(
      { _id: new ObjectId(postId), createdBy: new ObjectId(decoded.userId) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Post not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Post updated successfully",
      post: {
        id: postId,
        ...updateFields,
        featuredImage: updateFields.featuredImage || "/placeholder.svg?height=200&width=400",
        author: user.name,
        authorId: user._id.toString(),
      },
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `Failed to update post: ${error.message}` }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    const { db } = await connectToDatabase();
    const user = await db.collection("users").findOne({ _id: new ObjectId(decoded.userId) });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.approved) {
      return NextResponse.json({ message: "Account awaiting admin approval" }, { status: 403 });
    }

    if (user.status === "suspended") {
      return NextResponse.json({ message: "Account is suspended" }, { status: 403 });
    }

    const postId = params.id;
    if (!ObjectId.isValid(postId)) {
      return NextResponse.json({ message: "Invalid post ID" }, { status: 400 });
    }

    const post = await db.collection("posts").findOne({ _id: new ObjectId(postId), createdBy: new ObjectId(decoded.userId) });
    if (!post) {
      return NextResponse.json({ message: "Post not found or unauthorized" }, { status: 404 });
    }

    const result = await db.collection("posts").deleteOne({
      _id: new ObjectId(postId),
      createdBy: new ObjectId(decoded.userId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Post not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: `Failed to delete post: ${error.message}` }, { status: 400 });
  }
}