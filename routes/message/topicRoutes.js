import express from 'express';
import { createTopic, getTopicsByGroupId } from '../../controllers/group/topicController.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', verifyToken, createTopic);
router.get("/group/:groupId", verifyToken, getTopicsByGroupId);

export default router;
