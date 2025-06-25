import express from 'express';
import { sendGroupMessage , createGroup, getGroupsByAgencyOrModel, getGroupMessages} from '../../controllers/group/groupTopicMessageController.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/send', verifyToken, sendGroupMessage);
router.post('/create', verifyToken, createGroup);
router.get('/', verifyToken, getGroupsByAgencyOrModel);
router.get('/messages/:groupId', verifyToken, getGroupMessages);


export default router;
