import pool from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const [studentCount] = await pool.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const [testCount] = await pool.execute("SELECT COUNT(*) as count FROM tests WHERE status = 'in_progress'");
    const [questionCount] = await pool.execute("SELECT COUNT(*) as count FROM questions");

    res.json(new ApiResponse(200, {
      totalStudents: studentCount[0].count,
      activeTests: testCount[0].count,
      totalQuestions: questionCount[0].count
    }, "Admin dashboard stats fetched"));
  } catch (error) {
    next(error);
  }
};

export const getStudentsList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;
    const searchTerm = `%${search}%`;

    const [rows] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.createdAt,
        COUNT(r.id) as testsTaken,
        AVG(r.accuracy) as avgAccuracy
      FROM users u
      LEFT JOIN results r ON u.id = r.user_id
      WHERE u.role = 'student' AND (u.name LIKE ? OR u.email LIKE ?)
      GROUP BY u.id
      ORDER BY u.createdAt DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `, [searchTerm, searchTerm]);
    
    const [countRows] = await pool.execute(`
      SELECT COUNT(*) as total FROM users WHERE role = 'student' AND (name LIKE ? OR email LIKE ?)
    `, [searchTerm, searchTerm]);
    const total = countRows[0].total;

    res.json(new ApiResponse(200, {
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    }, "Students list fetched"));
  } catch (error) {
    next(error);
  }
};

export const getStudentResults = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;
    const searchTerm = `%${search}%`;

    const [rows] = await pool.execute(`
      SELECT 
        r.id as resultId, r.total_score, r.accuracy, r.createdAt as testDate,
        u.name as studentName, u.email
      FROM results r
      JOIN users u ON r.user_id = u.id
      WHERE u.name LIKE ? OR u.email LIKE ?
      ORDER BY r.createdAt DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `, [searchTerm, searchTerm]);

    const [countRows] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM results r
      JOIN users u ON r.user_id = u.id
      WHERE u.name LIKE ? OR u.email LIKE ?
    `, [searchTerm, searchTerm]);
    const total = countRows[0].total;

    res.json(new ApiResponse(200, {
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    }, "Results fetched"));
  } catch (error) {
    next(error);
  }
};
