import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
  requestedFor: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", required: true },
  legacyCompany: { type: String, required: true },
  serviceLocation: { type: String },
  timezone: { type: String },
  preferredLanguage: { type: String, default: "English" },
  preferredContactMethod: {
    method: { type: String, enum: ["","Mail", "Phone Number"] },
    value: { type: String }
  },
attachments: [
  {
    url: { type: String, required: true },
    type: { type: String, required: true },
    originalName: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "ModelUser", required: true },
    uploadedAt: { type: Date, default: Date.now }
  }
],
  status: {
    type: String,
    enum: ["In Progress", "On Hold", "Resolved"],
    default: "In Progress"
  },
  onHoldReason: { type: String },
  category: { type: String,
  required: true},
  priority: {
    type: Number,
    enum: [1, 2, 3, 4], // 1-Critical, 2-High, 3-Medium, 4-Low
    default: 4
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "ModelUser" },
  // escalation: { type: Boolean, default: false },
  shortDescription: { type: String },
  description: { type: String },
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
