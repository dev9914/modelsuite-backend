import express from "express";
import { createTask, getAgencyTasks, getTaskById, getTasksForModel, updateTaskStatusByModel } from "../../controllers/task/taskController.js";
import { verifyToken } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, createTask);
router.get("/my-tasks", verifyToken, getAgencyTasks);
router.get("/model/:agencyId", verifyToken, getTasksForModel);
router.get("/:id", verifyToken, getTaskById);
router.put("/update-status/:taskId", verifyToken, updateTaskStatusByModel);


export default router;
