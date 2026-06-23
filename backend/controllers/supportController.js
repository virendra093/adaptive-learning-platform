import pool from '../config/db.js';
import ApiResponse from '../utils/ApiResponse.js';

export const submitFeedback = async (req, res, next) => {
    try {
        const { category, content, rating } = req.body;
        const userId = req.user.id;

        await pool.execute(
            `INSERT INTO feedback (user_id, category, content, rating) VALUES (?, ?, ?, ?)`,
            [userId, category, content, rating || 5]
        );

        res.status(201).json(new ApiResponse(201, null, "Feedback submitted successfully."));
    } catch (error) {
        next(error);
    }
};

export const createTicket = async (req, res, next) => {
    try {
        const { category, questionContext, description, priority } = req.body;
        const userId = req.user.id;

        await pool.execute(
            `INSERT INTO support_tickets (user_id, category, question_context, description, priority) VALUES (?, ?, ?, ?, ?)`,
            [userId, category, questionContext || null, description, priority || 'Medium']
        );

        res.status(201).json(new ApiResponse(201, null, "Support ticket created successfully."));
    } catch (error) {
        next(error);
    }
};

export const getUserTickets = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const [rows] = await pool.execute(
            `SELECT * FROM support_tickets WHERE user_id = ? ORDER BY createdAt DESC`,
            [userId]
        );
        res.status(200).json(new ApiResponse(200, rows, "User tickets fetched."));
    } catch (error) {
        next(error);
    }
};

// Admin endpoints
export const getAllFeedback = async (req, res, next) => {
    try {
        const [rows] = await pool.execute(
            `SELECT f.*, u.name as user_name, u.email as user_email 
             FROM feedback f 
             JOIN users u ON f.user_id = u.id 
             ORDER BY createdAt DESC`
        );
        res.status(200).json(new ApiResponse(200, rows, "All feedback fetched."));
    } catch (error) {
        next(error);
    }
};

export const getAllTickets = async (req, res, next) => {
    try {
        const [rows] = await pool.execute(
            `SELECT t.*, u.name as user_name, u.email as user_email 
             FROM support_tickets t 
             JOIN users u ON t.user_id = u.id 
             ORDER BY createdAt DESC`
        );
        res.status(200).json(new ApiResponse(200, rows, "All tickets fetched."));
    } catch (error) {
        next(error);
    }
};

export const updateTicketStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        await pool.execute(
            `UPDATE support_tickets SET status = ?, admin_notes = ? WHERE id = ?`,
            [status, adminNotes || null, id]
        );

        res.status(200).json(new ApiResponse(200, null, "Ticket updated successfully."));
    } catch (error) {
        next(error);
    }
};
