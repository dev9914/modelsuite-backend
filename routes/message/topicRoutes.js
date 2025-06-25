import express from 'express';
import { createTopic } from '../../controllers/group/topicController.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/create', verifyToken, createTopic);

export default router;
