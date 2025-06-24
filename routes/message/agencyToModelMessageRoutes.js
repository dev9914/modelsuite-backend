import express from 'express';
import { getAgencyToModelMessages } from '../../controllers/message/agencyToModelMessageController.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getAgencyToModelMessages);

export default router;