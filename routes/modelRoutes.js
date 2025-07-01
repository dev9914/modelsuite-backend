import express from 'express';
import { registerModel ,loginModel, getModelById, getAllModels} from '../controllers/modelController.js';
import {verifyRole, verifyToken} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerModel);
router.post('/login', loginModel);
router.get('/:id', verifyToken, getModelById);
router.get('/', verifyToken,verifyRole('model'), getAllModels);


export default router;
