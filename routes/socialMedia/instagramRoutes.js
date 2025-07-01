import express from 'express';
import { handleInstagramCallback } from '../../controllers/socialMedia/handleInstagramCallback.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { getInstagramAccountInfo } from '../../controllers/socialMedia/insightsController.js';

const router = express.Router();

// 👇 Instagram OAuth callback route
router.get('/callback', handleInstagramCallback);
router.get('/account-info', verifyToken, getInstagramAccountInfo);

// 👇 Fetch insights after connection
// router.get('/insights', verifyToken, getInstagramInsights);

export default router;
