import express from 'express';
import { getRecommendations } from '../controllers/testController.js';
import { protect, requireGeneralTest } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, requireGeneralTest, getRecommendations);

export default router;
