import mongoose from "mongoose";

const pendingRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      "content_writer",
      "course_instructor",
      "community_moderator",
      "data_analyst",
      "support_agent",
      "admin",
    ],
  },
  requestDate: { type: Date, required: true, default: Date.now },
  message: { type: String },
  experience: { type: String },
});

export default mongoose.models.PendingRequest ||
  mongoose.model("PendingRequest", pendingRequestSchema);
