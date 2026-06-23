import express from 'express';
import { submitFeedback, createTicket, getUserTickets, getAllFeedback, getAllTickets, updateTicketStatus } from '../controllers/supportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Student Routes
router.post('/feedback', protect, submitFeedback);
router.post('/tickets', protect, createTicket);
router.get('/tickets', protect, getUserTickets);

// Admin Routes
router.get('/admin/feedback', protect, admin, getAllFeedback);
router.get('/admin/tickets', protect, admin, getAllTickets);
router.put('/admin/tickets/:id', protect, admin, updateTicketStatus);

export default router;
