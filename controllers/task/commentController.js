import Task from "../../models/task/task.js"
import TaskComment from "../../models/task/comment.js"

export const addCommentToTask = async (req, res) => {
  try {
    const { taskId, commentText } = req.body;
    const userId = req.user.id;
    const role = req.user.role; // "model", "agency", etc.

    // ✅ Map to actual Mongoose model names
    const roleModelMap = {
      model: "ModelUser",
      agency: "Agency",
      employee: "Employee", // If you support this later
    };

    const userRole = roleModelMap[role];

    if (!userRole) {
      return res.status(400).json({ error: "Invalid user role" });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const newComment = await TaskComment.create({
      taskId,
      userId,
      role,
      userRole, // this gets stored in DB for refPath
      commentText,
    });

    // ✅ Populate user based on refPath
    const populatedComment = await TaskComment.findById(newComment._id).populate({
      path: "userId",
      model: userRole,
      select: "fullName profilePhoto",
    });

    res.status(201).json(populatedComment);
  } catch (err) {
    console.error("❌ Failed to add comment:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

// 📥 Get all comments for a task
export const getCommentsForTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await TaskComment.find({ taskId })
      .sort({ createdAt: 1 }) // oldest first
      .populate("userId", "agencyName fullName profilePhoto");

    res.json(comments);
  } catch (err) {
    console.error("❌ Failed to get comments:", err);
    res.status(500).json({ error: "Failed to get comments" });
  }
};