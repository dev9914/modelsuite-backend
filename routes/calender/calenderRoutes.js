import express from "express";
const router = express.Router();

import { verifyToken } from "../../middlewares/authMiddleware.js";
import { createEvent, deleteEvent, getEventsForModelByAgency, updateEvent } from "../../controllers/calender/calenderController.js";

router.post("/create", verifyToken, createEvent);
router.get("/agency/:agencyId/model/:modelId", verifyToken, getEventsForModelByAgency);
router.put("/update/:eventId", verifyToken, updateEvent);
router.delete("/delete/:eventId", verifyToken, deleteEvent);

export default router;