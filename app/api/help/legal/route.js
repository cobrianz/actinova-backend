import { MongoClient } from "mongodb"
import jwt from "jsonwebtoken"

const client = new MongoClient(process.env.MONGODB_URI)
const db = client.db("actinova")
const collection = db.collection("helpContactRequests")

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
    const requests = await collection
      .find({ createdBy: user.id })
      .sort({ date: -1 })
      .toArray()
    return new Response(JSON.stringify({ requests, user: { name: user.name, email: user.email } }), {
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
    const { name, email, subject, message } = await req.json()
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ message: "Name, email, subject, and message are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ message: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    const request = {
      name,
      email,
      subject,
      message,
      date: new Date().toISOString().split("T")[0],
      status: "Open",
      createdBy: user.id,
      createdAt: new Date(),
    }
    const result = await collection.insertOne(request)
    request.id = result.insertedId.toString()
    return new Response(JSON.stringify({ request }), {
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
    const { status } = await req.json()
    if (!["Open", "Resolved"].includes(status)) {
      return new Response(JSON.stringify({ message: "Invalid status" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }
    const result = await collection.updateOne(
      { _id: new MongoClient.ObjectId(id), createdBy: user.id },
      { $set: { status, updatedAt: new Date() } },
    )
    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ message: "Contact request not found or unauthorized" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }
    const request = await collection.findOne({ _id: new MongoClient.ObjectId(id) })
    request.id = request._id.toString()
    return new Response(JSON.stringify({ request }), {
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