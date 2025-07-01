import express from 'express';
import { handleInstagramCallback } from '../../controllers/socialMedia/handleInstagramCallback.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { disconnectInstagram, getInstagramAccountInfo, getInstagramDemographics, getInstagramInsights, getInstagramStoryInsights } from '../../controllers/socialMedia/insightsController.js';

const router = express.Router();

// 👇 Instagram OAuth callback route
router.get('/callback', handleInstagramCallback);
router.get('/account-info', verifyToken, getInstagramAccountInfo);
router.get('/insights', verifyToken, getInstagramInsights);
router.get('/demographics', verifyToken, getInstagramDemographics);
router.get('/story-insights', verifyToken, getInstagramStoryInsights);
router.delete('/disconnect', verifyToken, disconnectInstagram);

export default router;
