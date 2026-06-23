import express from 'express';
import { getAdminDashboardStats, getStudentsList, getStudentResults, getQuestionAnalytics, getStudentIntelligence } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, admin, getAdminDashboardStats);
router.get('/students', protect, admin, getStudentsList);
router.get('/student-intelligence/:id', protect, admin, getStudentIntelligence);
router.get('/results', protect, admin, getStudentResults);
router.get('/question-analytics', protect, admin, getQuestionAnalytics);

export default router;
