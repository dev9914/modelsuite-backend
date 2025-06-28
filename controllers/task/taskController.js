import Task from "../../models/task/task.js";

let currentTaskNumber = 1000; // you can store and increment this from DB if needed

// Create a new task
export const createTask = async (req, res) => {
  try {
    const {
      requestedBy,
      requestedFor,
      legacyCompany,
      serviceLocation,
      timezone,
      preferredLanguage,
      preferredContactMethod,
      status,
      onHoldReason,
      category,
      priority,
      assignedTo,
      shortDescription,
      description,
    } = req.body;

    // Get latest task number
    const latestTask = await Task.findOne().sort({ number: -1 }).select("number");
    const newNumber = latestTask ? latestTask.number + 1 : 1000;

    const newTask = await Task.create({
      number: newNumber,
      requestedBy,
      requestedFor,
      legacyCompany,
      serviceLocation,
      timezone,
      preferredLanguage,
      preferredContactMethod,
      status,
      onHoldReason,
      category,
      priority,
      assignedTo,
      shortDescription,
      description,
    });

    res.status(201).json(newTask);
  } catch (err) {
    console.error("❌ Failed to create task:", err.message);
    res.status(500).json({ error: "Failed to create task" });
  }
};


// Get tasks for a specific agency
export const getAgencyTasks = async (req, res) => {
  try {
    const agencyId = req.user.id;
    const tasks = await Task.find({ requestedFor: agencyId }).populate("assignedTo requestedBy");
    res.json(tasks);
  } catch (err) {
    console.error("Failed to get tasks:", err);
    res.status(500).json({ error: "Failed to get tasks" });
  }
};

export const getTasksForModel = async (req, res) => {
  try {
    const { agencyId } = req.params;
    const modelId = req.user.id;

    const tasks = await Task.find({
      requestedFor: agencyId,
      assignedTo: modelId
    }).populate("requestedBy assignedTo");

    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("requestedBy", "agencyName fullName")
      .populate("requestedFor", "agencyName fullName")
      .populate("assignedTo", "fullName profilePhoto");

    if (!task) return res.status(404).json({ error: "Task not found" });

    res.json(task);
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({ error: "Failed to fetch task" });
  }
};

export const updateTaskStatusByModel = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, onHoldReason } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (role !== "model") {
      return res.status(403).json({ error: "Only models can update task status" });
    }

    const task = await Task.findOne({ _id: taskId, assignedTo: userId });

    if (!task) {
      return res.status(404).json({ error: "Task not found or not assigned to this model" });
    }

    // Only allow status update to "On Hold" or "Resolved"
    if (!["On Hold", "Resolved"].includes(status)) {
      return res.status(400).json({ error: "Invalid status update" });
    }

    task.status = status;
    if (status === "On Hold") {
      task.onHoldReason = onHoldReason || "";
    } else {
      task.onHoldReason = "";
    }

    await task.save();
    res.json({ message: "Task status updated successfully", task });
  } catch (err) {
    console.error("Failed to update task status:", err);
    res.status(500).json({ error: "Failed to update task status" });
  }
};

export const saveTaskAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { url, type, originalName } = req.body;

    if (req.user.role !== "model") {
      return res.status(403).json({ error: "Only models can upload attachments" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const attachment = {
      url,
      type,
      originalName,
      uploadedBy: req.user.id,
      uploadedAt: new Date(),
    };

    task.attachments.push(attachment);
    await task.save();

    res.status(200).json({ message: "Attachment saved", attachment });
  } catch (err) {
    console.error("Failed to save attachment:", err);
    res.status(500).json({ error: "Attachment save failed" });
  }
};