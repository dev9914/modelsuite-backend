import express from 'express';
import { registerAgency,loginAgency, searchModels, getAgencyModels, addModelToAgency } from '../controllers/agencyController.js';
import {verifyRole, verifyToken} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerAgency);
router.post('/login', loginAgency);
router.get('/models', verifyToken,verifyRole('agency'), searchModels);
router.get('/agency-models', verifyToken,verifyRole('agency'), getAgencyModels);
router.post('/add-model', verifyToken,verifyRole('agency'), addModelToAgency);



export default router;
