import CalendarEvent from "../../models/Calender/Calender.js";

export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      start,
      end,
      isAllDay,
      location,
      assignedTo,
      assignedToModel,
    } = req.body;

    const now = new Date();
    const startDate = new Date(start);

    // 🛑 Reject if start date is in the past
    if (startDate < now) {
      return res.status(400).json({
        success: false,
        message: "Cannot create events in the past",
      });
    }

    const createdBy = req.user.id;
    const createdByModel = req.user.role === "agency" ? "Agency" : "ModelUser";

    const newEvent = await CalendarEvent.create({
      title,
      description,
      start,
      end,
      isAllDay,
      location,
      createdBy,
      createdByModel,
      assignedTo,
      assignedToModel: assignedToModel === "agency" ? "Agency" : "ModelUser",
    });

    res.status(201).json({ success: true, event: newEvent });
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const getEventsForModelByAgency = async (req, res) => {
  try {
    const { agencyId, modelId } = req.params;

    const events = await CalendarEvent.find({
      createdBy: agencyId,
      assignedTo: modelId,
    }).sort({ start: 1 });

    res.status(200).json({ success: true, events });
  } catch (error) {
    console.error("Fetch Events Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updateFields = req.body;

    const event = await CalendarEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this event" });
    }

    const updatedEvent = await CalendarEvent.findByIdAndUpdate(
      eventId,
      updateFields,
      { new: true }
    );

    res.status(200).json({ success: true, event: updatedEvent });
  } catch (error) {
    console.error("Update Event Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await CalendarEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this event" });
    }

    await CalendarEvent.findByIdAndDelete(eventId);

    res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("Delete Event Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
