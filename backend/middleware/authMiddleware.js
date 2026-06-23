import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Contains id, role
      next();
    } catch (error) {
      next(new ApiError(401, 'Not authorized, token failed'));
    }
  } else {
    next(new ApiError(401, 'Not authorized, no token'));
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new ApiError(403, 'Not authorized as an admin'));
  }
};

import pool from '../config/db.js';

export const requireGeneralTest = async (req, res, next) => {
  try {
    const [rows] = await pool.execute('SELECT general_assessment_completed FROM student_profile WHERE user_id = ?', [req.user.id]);
    if (rows.length > 0 && rows[0].general_assessment_completed) {
      next();
    } else {
      next(new ApiError(403, 'General Assessment must be completed before accessing Adaptive Learning.'));
    }
  } catch (error) {
    next(error);
  }
};

