const mysql = require('mysql2/promise');
require('dotenv').config();
async function run() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  const page = 1;
  const limit = 10;
  const search = '';
  const offset = (page - 1) * limit;
  const searchTerm = '%' + search + '%';

  try {
    const [rows] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.createdAt,
        COUNT(DISTINCT r.id) as testsTaken,
        AVG(r.accuracy) as avgAccuracy,
        up.current_level as currentLevel,
        MAX(t.end_time) as lastActiveDate
      FROM users u
      LEFT JOIN results r ON u.id = r.user_id
      LEFT JOIN user_progress up ON u.id = up.user_id
      LEFT JOIN tests t ON u.id = t.user_id AND t.status = 'completed'
      WHERE u.role = 'student' AND (u.name LIKE ? OR u.email LIKE ?)
      GROUP BY u.id, up.current_level
      ORDER BY u.createdAt DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `, [searchTerm, searchTerm]);
    console.log('Success:', rows.length);
  } catch (err) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}
run();
