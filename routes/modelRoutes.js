import express from 'express';
import { registerModel ,loginModel} from '../controllers/modelController.js';

const router = express.Router();

router.post('/register', registerModel);
router.post('/login', loginModel);

export default router;
