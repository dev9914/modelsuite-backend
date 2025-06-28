import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "userRole", // Dynamic reference
    },
    userRole: {
      type: String,
      required: true,
      enum: ["ModelUser", "Agency", "Employee"], // whatever your model names are
    },
    role: {
      type: String,
      enum: ["model", "agency", "employee"],
      required: true,
    },
    commentText: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("TaskComment", commentSchema);
