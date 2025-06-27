import { MongoClient } from "mongodb"
import jwt from "jsonwebtoken"

const client = new MongoClient(process.env.MONGODB_URI)
const db = client.db("actinova")
const collection = db.collection("helpLegalPages")

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
    const pages = await collection
      .find({ createdBy: user.id })
      .sort({ lastUpdated: -1 })
      .toArray()
    return new Response(JSON.stringify({ pages, user: { name: user.name, email: user.email } }), {
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
    const { title, content } = await req.json()
    if (!title || !content) {
      return new Response(JSON.stringify({ message: "Title and content are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    const page = {
      title,
      content,
      lastUpdated: new Date().toISOString().split("T")[0],
      createdBy: user.id,
      createdAt: new Date(),
    }
    const result = await collection.insertOne(page)
    page.id = result.insertedId.toString()
    return new Response(JSON.stringify({ page }), {
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
    const { title, content } = await req.json()
    if (!title || !content) {
      return new Response(JSON.stringify({ message: "Title and content are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    const result = await collection.updateOne(
      { _id: new MongoClient.ObjectId(id), createdBy: user.id },
      { $set: { title, content, lastUpdated: new Date().toISOString().split("T")[0] } },
    )
    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ message: "Legal page not found or unauthorized" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }
    const page = await collection.findOne({ _id: new MongoClient.ObjectId(id) })
    page.id = page._id.toString()
    return new Response(JSON.stringify({ page }), {
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
      return new Response(JSON.stringify({ message: "Legal page not found or unauthorized" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }
    return new Response(JSON.stringify({ message: "Legal page deleted successfully" }), {
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