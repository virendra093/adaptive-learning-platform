import pool from '../config/db.js';

export const getAllQuestions = async () => {
  const [rows] = await pool.execute('SELECT * FROM questions');
  return rows;
};

export const getQuestionById = async (id) => {
  const [rows] = await pool.execute('SELECT * FROM questions WHERE id = ?', [id]);
  return rows[0];
};

export const createQuestion = async (text, difficulty, category = 'General') => {
  const [result] = await pool.execute(
    'INSERT INTO questions (text, difficulty, category) VALUES (?, ?, ?)',
    [text, difficulty, category]
  );
  return result.insertId;
};

export const updateQuestion = async (id, text, difficulty, category) => {
  const [result] = await pool.execute(
    'UPDATE questions SET text = ?, difficulty = ?, category = ? WHERE id = ?',
    [text, difficulty, category, id]
  );
  return result.affectedRows;
};

export const deleteQuestion = async (id) => {
  const [result] = await pool.execute('DELETE FROM questions WHERE id = ?', [id]);
  return result.affectedRows;
};

export const addQuestionOption = async (questionId, text, isCorrect) => {
  const [result] = await pool.execute(
    'INSERT INTO question_options (question_id, text, is_correct) VALUES (?, ?, ?)',
    [questionId, text, isCorrect]
  );
  return result.insertId;
};

export const getQuestionOptions = async (questionId) => {
  const [rows] = await pool.execute('SELECT * FROM question_options WHERE question_id = ?', [questionId]);
  return rows;
};
