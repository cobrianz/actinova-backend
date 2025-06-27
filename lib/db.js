import { connectToDatabase } from "./mongodb";
import crypto from "crypto";

export async function findUserByEmail(email) {
  const { db } = await connectToDatabase();
  const user = await db.collection("users").findOne({ email });
  return user
    ? {
        id: user._id,
        email: user.email,
        password: user.password,
        role: user.role,
        name: user.name,
        phone: user.phone,
        type: user.type,
        status: user.status,
        joinDate: user.joinDate,
        lastActive: user.lastActive,
        approved: user.approved,
        plan: user.plan,
      }
    : null;
}

export async function createUser(userData) {
  const { db } = await connectToDatabase();
  const _id = userData._id || crypto.randomUUID(); // Use provided _id or generate UUID
  const result = await db.collection("users").insertOne({
    ...userData,
    _id,
    type: "staff", // Enforce staff-only
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
  return { ...userData, id: result.insertedId };
}

export async function updateUserLastActive(userId) {
  const { db } = await connectToDatabase();
  try {
    const result = await db
      .collection("users")
      .updateOne(
        { _id: userId },
        { $set: { lastActive: new Date().toISOString() } }
      );
    if (result.matchedCount === 0) {
      console.warn("No user found for ID:", userId);
    }
  } catch (error) {
    console.error("Update user last active error:", error.message);
    throw error;
  }
}

export async function findUsers(filter = {}) {
  const { db } = await connectToDatabase();
  const users = await db
    .collection("users")
    .find({ ...filter, type: "staff" })
    .toArray(); // Enforce staff-only
  return users.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    plan: user.plan || "N/A", // Staff plans are N/A
    type: user.type,
    status: user.status || "Active",
    joinDate: user.joinDate || new Date().toISOString().split("T")[0],
    lastActive: user.lastActive || new Date().toISOString(),
    firstName: user.name.split(" ")[0] || "",
    lastName: user.name.split(" ").slice(1).join(" ") || "",
  }));
}

export async function insertUser(user) {
  const { db } = await connectToDatabase();
  const _id = user._id || crypto.randomUUID();
  const result = await db.collection("users").insertOne({
    ...user,
    _id,
    type: "staff",
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });
  return { ...user, id: result.insertedId };
}

export async function updateUser(id, updates) {
  const { db } = await connectToDatabase();
  await db
    .collection("users")
    .updateOne(
      { _id: id },
      { $set: { ...updates, lastActive: new Date().toISOString() } }
    );
  return findUserById(id);
}

export async function deleteUser(id) {
  const { db } = await connectToDatabase();
  await db.collection("users").deleteOne({ _id: id });
}

export async function findPendingRequests() {
  const { db } = await connectToDatabase();
  const requests = await db.collection("pendingRequests").find({}).toArray();
  return requests.map((req) => ({
    id: req._id,
    name: req.name,
    email: req.email,
    type: req.type,
    role: req.role,
    requestDate: req.requestDate || new Date().toISOString().split("T")[0],
    message: req.message || "",
    experience: req.experience || "",
  }));
}

export async function approveRequest(id, hashedPassword) {
  const { db } = await connectToDatabase();
  const request = await db.collection("pendingRequests").findOne({ _id: id });
  if (!request) {
    throw new Error("Pending request not found");
  }
  const newUser = {
    ...request,
    password: hashedPassword,
    approved: true,
    status: "active",
    type: "staff",
    lastActive: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  await db.collection("users").insertOne(newUser);
  await db.collection("pendingRequests").deleteOne({ _id: id });
  return findUserById(id);
}

export async function rejectRequest(id) {
  const { db } = await connectToDatabase();
  await db.collection("pendingRequests").deleteOne({ _id: id });
}

export async function findUserById(id) {
  const { db } = await connectToDatabase();
  const user = await db.collection("users").findOne({ _id: id });
  return user
    ? {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        plan: user.plan || "N/A",
        type: user.type,
        status: user.status,
        joinDate: user.joinDate,
        lastActive: user.lastActive,
        approved: user.approved,
        firstName: user.name.split(" ")[0] || "",
        lastName: user.name.split(" ").slice(1).join(" ") || "",
      }
    : null;
}
