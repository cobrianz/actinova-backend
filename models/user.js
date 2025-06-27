import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  role: { type: String, required: true },
  type: { type: String, required: true, enum: ["student", "staff"] },
  status: { type: String, required: true, enum: ["active", "Suspended"], default: "active" },
  joinDate: { type: Date, required: true, default: Date.now },
  lastActive: { type: Date, required: true, default: Date.now },
  createdAt: { type: Date },
  plan: { type: String, enum: ["free", "pro", "enterprise", "N/A"], default: "N/A" },
  approved: { type: Boolean, default: false },
  password: { type: String, required: true },
});

export default mongoose.models.User || mongoose.model("User", userSchema);