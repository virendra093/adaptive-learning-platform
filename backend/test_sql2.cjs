const mysql = require('mysql2/promise');
require('dotenv').config();
async function run() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    const [students] = await pool.execute('SELECT id FROM users WHERE role = "student" LIMIT 1');
    if (students.length === 0) {
      console.log('No students found');
      return;
    }
    const studentId = students[0].id;
    console.log('Testing student', studentId);
    
    // Test the 1st query
    const [userRows] = await pool.execute(`
      SELECT u.id, u.name, u.email, u.createdAt, up.current_level, up.total_tests_taken
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      WHERE u.id = ? AND u.role = 'student'
    `, [studentId]);
    console.log('UserRows:', userRows.length);
    
    // Test the responses query
    const [responsesRows] = await pool.execute(`
      SELECT 
        res.is_correct, res.response_time_ms,
        q.difficulty, q.domain_id, q.topic_id,
        d.name as domain_name, top.name as topic_name
      FROM responses res
      JOIN tests t ON res.test_id = t.id
      JOIN questions q ON res.question_id = q.id
      LEFT JOIN domains d ON q.domain_id = d.id
      LEFT JOIN topics top ON q.topic_id = top.id
      WHERE t.user_id = ?
    `, [studentId]);
    console.log('Responses:', responsesRows.length);
    
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}
run();
