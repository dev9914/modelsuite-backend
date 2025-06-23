import express from 'express';
import { registerAgency,loginAgency, searchModels, getAgencyModels, addModelToAgency } from '../controllers/agencyController.js';
import {verifyToken} from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerAgency);
router.post('/login', loginAgency);
router.get('/models', verifyToken, searchModels);
router.get('/agency-models', verifyToken, getAgencyModels);
router.post('/add-model', verifyToken, addModelToAgency);



export default router;
