import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'Viru@245771',
  database: process.env.DB_NAME || 'adaptive_learning',
  port: process.env.DB_PORT || 3307,
});

const seedDatabase = async () => {
  try {
    console.log('Seeding database...');
    const salt = await bcrypt.genSalt(10);

    const hashedAdmin = await bcrypt.hash('admin123', salt);
    await pool.execute(
      'INSERT IGNORE INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin', 'admin@example.com', hashedAdmin, 'admin']
    );

    const hashedStudent = await bcrypt.hash('student123', salt);
    await pool.execute(
      'INSERT IGNORE INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['John Doe', 'student@example.com', hashedStudent, 'student']
    );

    console.log('Users seeded successfully. Database ready.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
