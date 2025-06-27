import { MongoClient } from "mongodb"
import jwt from "jsonwebtoken"

const client = new MongoClient(process.env.MONGODB_URI)
const db = client.db("actinova")
const collection = db.collection("helpArticles")

const authenticate = async (req) => {
  const token = req.headers.get("authorization")?.split(" ")[1]
  if (!token) throw new Error("No authentication token provided")
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    throw new Error("Invalid or expired token")
  }
}

export async function GET(req) {
  try {
    await client.connect()
    const user = await authenticate(req)
    const articles = await collection
      .find({ createdBy: user.id })
      .sort({ lastUpdated: -1 })
      .toArray()
    return new Response(JSON.stringify({ articles, user: { name: user.name, email: user.email } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  } finally {
    await client.close()
  }
}

export async function POST(req) {
  try {
    await client.connect()
    const user = await authenticate(req)
    const { title, category, content } = await req.json()
    if (!title || !content || !category) {
      return new Response(JSON.stringify({ message: "Title, category, and content are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    if (!categories.includes(category)) {
      return new Response(JSON.stringify({ message: "Invalid category" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    const article = {
      title,
      category,
      content,
      lastUpdated: new Date().toISOString().split("T")[0],
      views: 0,
      createdBy: user.id,
      createdAt: new Date(),
    }
    const result = await collection.insertOne(article)
    article.id = result.insertedId.toString()
    return new Response(JSON.stringify({ article }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  } finally {
    await client.close()
  }
}

export async function PUT(req) {
  try {
    await client.connect()
    const user = await authenticate(req)
    const { id } = req.url.split("/").pop()
    const { title, category, content } = await req.json()
    if (!title || !content || !category) {
      return new Response(JSON.stringify({ message: "Title, category, and content are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    if (!categories.includes(category)) {
      return new Response(JSON.stringify({ message: "Invalid category" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    const result = await collection.updateOne(
      { _id: new MongoClient.ObjectId(id), createdBy: user.id },
      { $set: { title, category, content, lastUpdated: new Date().toISOString().split("T")[0] } },
    )
    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ message: "Article not found or unauthorized" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }
    const article = await collection.findOne({ _id: new MongoClient.ObjectId(id) })
    article.id = article._id.toString()
    return new Response(JSON.stringify({ article }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  } finally {
    await client.close()
  }
}

export async function DELETE(req) {
  try {
    await client.connect()
    const user = await authenticate(req)
    const { id } = req.url.split("/").pop()
    const result = await collection.deleteOne({ _id: new MongoClient.ObjectId(id), createdBy: user.id })
    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ message: "Article not found or unauthorized" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }
    return new Response(JSON.stringify({ message: "Article deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  } finally {
    await client.close()
  }
}

const categories = ["Getting Started", "Features", "Certificates", "Billing", "Technical"]