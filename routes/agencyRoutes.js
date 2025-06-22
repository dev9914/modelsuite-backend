import express from 'express';
import { registerAgency,loginAgency } from '../controllers/agencyController.js';

const router = express.Router();

router.post('/register', registerAgency);
router.post('/login', loginAgency);


export default router;
