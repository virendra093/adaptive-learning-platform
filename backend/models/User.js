import pool from '../config/db.js';

export const createUser = async (name, email, password, role = 'student') => {
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role]
  );
  return result.insertId;
};

export const findUserByEmail = async (email) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};

export const findUserById = async (id) => {
  const [rows] = await pool.execute('SELECT id, name, email, role, createdAt FROM users WHERE id = ?', [id]);
  return rows[0];
};
