import pool from '../config/db.js';

export const createTest = async (userId, testType) => {
  const [result] = await pool.execute(
    'INSERT INTO tests (user_id, test_type, status) VALUES (?, ?, ?)',
    [userId, testType, 'in_progress']
  );
  return result.insertId;
};

export const submitResponse = async (testId, questionId, optionId, responseTimeMs, isCorrect) => {
  const [result] = await pool.execute(
    'INSERT INTO responses (test_id, question_id, option_id, response_time_ms, is_correct) VALUES (?, ?, ?, ?, ?)',
    [testId, questionId, optionId, responseTimeMs, isCorrect ? 1 : 0]
  );
  return result.insertId;
};

export const completeTest = async (testId) => {
  const endTime = new Date();
  const [result] = await pool.execute(
    'UPDATE tests SET end_time = ?, status = ? WHERE id = ?',
    [endTime, 'completed', testId]
  );
  return result.affectedRows;
};

export const calculateTestStats = async (testId) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as totalQuestions, SUM(is_correct) as correctAnswers, AVG(response_time_ms) as avgTime FROM responses WHERE test_id = ?',
    [testId]
  );
  const stats = rows[0];
  const total = stats.totalQuestions || 0;
  const correct = stats.correctAnswers || 0;
  const accuracy = total > 0 ? correct / total : 0;
  const avgTime = stats.avgTime || 0;
  
  return { total, correct, accuracy, avgTime };
};

export const saveResult = async (testId, userId, totalScore, accuracy, avgResponseTime) => {
  const [result] = await pool.execute(
    'INSERT INTO results (test_id, user_id, total_score, accuracy, avg_response_time) VALUES (?, ?, ?, ?, ?)',
    [testId, userId, totalScore, accuracy, avgResponseTime]
  );
  return result.insertId;
};

export const saveRecommendation = async (userId, testId, recommendedDifficulty, explanation) => {
  const [result] = await pool.execute(
    'INSERT INTO recommendations (user_id, test_id, recommended_difficulty, explanation) VALUES (?, ?, ?, ?)',
    [userId, testId, recommendedDifficulty, explanation]
  );
  return result.insertId;
};

export const getResultsByUserId = async (userId) => {
  const [rows] = await pool.execute('SELECT * FROM results WHERE user_id = ? ORDER BY createdAt DESC', [userId]);
  return rows;
};

export const getRecommendationsByUserId = async (userId) => {
  const [rows] = await pool.execute('SELECT * FROM recommendations WHERE user_id = ? ORDER BY createdAt DESC', [userId]);
  return rows;
};

export const getDashboardStats = async (userId) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) as totalTests, AVG(accuracy) as avgAccuracy, AVG(total_score) as avgScore, AVG(avg_response_time) as avgResponseTime FROM results WHERE user_id = ?',
    [userId]
  );
  
  const [historyRows] = await pool.execute(
    'SELECT createdAt as date, accuracy, total_score as score FROM results WHERE user_id = ? ORDER BY createdAt ASC LIMIT 10',
    [userId]
  );
  
  const [difficultyRows] = await pool.execute(
    'SELECT recommended_difficulty as name, COUNT(*) as value FROM recommendations WHERE user_id = ? GROUP BY recommended_difficulty',
    [userId]
  );
  
  const [progressRows] = await pool.execute(
    'SELECT current_level FROM user_progress WHERE user_id = ? LIMIT 1',
    [userId]
  );
  
  return {
    overview: rows[0],
    recentHistory: historyRows.map(row => ({
      date: new Date(row.date).toLocaleDateString(),
      accuracy: parseFloat(row.accuracy),
      score: parseInt(row.score)
    })),
    difficultyDistribution: difficultyRows,
    currentLevel: progressRows[0]?.current_level || 'easy'
  };
};
