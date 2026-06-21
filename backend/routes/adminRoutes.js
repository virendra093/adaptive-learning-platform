import express from 'express';
import { getAdminDashboardStats, getStudentsList, getStudentResults } from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, admin, getAdminDashboardStats);
router.get('/students', protect, admin, getStudentsList);
router.get('/results', protect, admin, getStudentResults);

export default router;
