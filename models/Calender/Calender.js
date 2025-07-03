import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  isAllDay: { type: Boolean, default: false },
  location: String,

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "createdByModel",
    required: true,
  },
  createdByModel: {
    type: String,
    enum: ["Agency", "ModelUser"],
    required: true,
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "assignedToModel",
    required: true,
  },
  assignedToModel: {
    type: String,
    enum: ["ModelUser", "Agency"],
    required: true,
  },
}, { timestamps: true });

const CalendarEvent = mongoose.model("CalendarEvent", calendarEventSchema);
export default CalendarEvent;