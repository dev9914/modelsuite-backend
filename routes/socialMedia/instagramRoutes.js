import express from 'express';
import { handleInstagramCallback } from '../../controllers/socialMedia/handleInstagramCallback.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { disconnectInstagram, getInstagramAccountInfo, getInstagramDemographics, getInstagramInsights, getInstagramStoryInsights } from '../../controllers/socialMedia/insightsController.js';
import { getFacebookPageInfo, getFacebookPageInsights, getFacebookPagePosts, getFacebookPostInsights } from '../../controllers/socialMedia/facebookController.js';

const router = express.Router();

// 👇 Instagram OAuth callback route
router.get('/callback', handleInstagramCallback);
router.get('/account-info/:modelId', verifyToken, getInstagramAccountInfo);
router.get('/insights/:modelId', verifyToken, getInstagramInsights);
router.get('/demographics/:modelId', verifyToken, getInstagramDemographics);
router.get('/story-insights/:modelId', verifyToken, getInstagramStoryInsights);
router.delete('/disconnect/:modelId', verifyToken, disconnectInstagram);
router.get('/facebook/insights/:modelId', verifyToken, getFacebookPageInsights);
router.get('/facebook/page-info/:modelId', verifyToken, getFacebookPageInfo);
router.get('/facebook/posts/:modelId', verifyToken, getFacebookPagePosts);
router.get('/facebook/post/:postId/insights', verifyToken, getFacebookPostInsights);

export default router;
