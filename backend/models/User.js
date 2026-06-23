import pool from '../config/db.js';

export const createUser = async (name, email, password, role = 'student') => {
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role]
  );
  return result.insertId;
};

export const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    `SELECT u.*, 
            COALESCE(sp.general_assessment_completed, FALSE) as general_assessment_completed
     FROM users u
     LEFT JOIN student_profile sp ON u.id = sp.user_id
     WHERE u.email = ?`, 
    [email]
  );
  return rows[0];
};

export const findUserById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT u.id, u.name, u.email, u.role, u.createdAt, 
            COALESCE(sp.general_assessment_completed, FALSE) as general_assessment_completed
     FROM users u
     LEFT JOIN student_profile sp ON u.id = sp.user_id
     WHERE u.id = ?`, 
    [id]
  );
  return rows[0];
};
