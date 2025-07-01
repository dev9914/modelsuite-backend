import express from "express";
import { createTask, getAgencyTasks, getTaskById, getTasksForModel, saveTaskAttachment, updateTaskStatusByModel } from "../../controllers/task/taskController.js";
import {addCommentToTask, getCommentsForTask} from '../../controllers/task/commentController.js';
import { verifyToken } from "../../middlewares/authMiddleware.js";
import attachmentUpload from "../../middlewares/attachmentMulter.js";

const router = express.Router();

router.post("/create", verifyToken, createTask);
router.get("/my-tasks", verifyToken, getAgencyTasks);
router.get("/model/:agencyId", verifyToken, getTasksForModel);
router.get("/:id", verifyToken, getTaskById);
router.put("/update-status/:taskId", verifyToken, updateTaskStatusByModel);
router.post("/comment", verifyToken, addCommentToTask);
router.get("/comment/:taskId", verifyToken, getCommentsForTask);
router.post(
  "/:taskId/attachments",
  verifyToken,
  attachmentUpload.single("file"), // <-- use this
  saveTaskAttachment
);

export default router;
