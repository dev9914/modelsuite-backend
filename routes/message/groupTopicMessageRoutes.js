import express from 'express';
import { sendGroupMessage , createGroup, getGroupsByAgencyOrModel, getGroupMessages, deleteGroup, deleteTopic} from '../../controllers/group/groupTopicMessageController.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/send', verifyToken, sendGroupMessage);
router.post('/create', verifyToken, createGroup);
router.get('/', verifyToken, getGroupsByAgencyOrModel);
router.get('/:groupId/topic/:topicId', verifyToken, getGroupMessages);
router.delete('/:groupId', verifyToken, deleteGroup);
router.delete('/:topicId',verifyToken, deleteTopic);



export default router;
