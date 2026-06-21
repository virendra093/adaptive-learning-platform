CREATE DATABASE IF NOT EXISTS adaptive_learning;
USE adaptive_learning;

-- Drop tables in correct dependency order
DROP TABLE IF EXISTS question_usage_history;
DROP TABLE IF EXISTS question_statistics;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS tests;
DROP TABLE IF EXISTS question_options;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS subtopics;
DROP TABLE IF EXISTS topics;
DROP TABLE IF EXISTS domains;
DROP TABLE IF EXISTS difficulties;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role (role)
);

CREATE TABLE domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
);

CREATE TABLE subtopics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topic_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

CREATE TABLE difficulties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    weight INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    category VARCHAR(255) DEFAULT 'General',
    
    -- New normalized columns (NULLABLE for backward compatibility)
    domain_id INT NULL,
    topic_id INT NULL,
    subtopic_id INT NULL,
    difficulty_id INT NULL,
    detailed_explanation TEXT,
    estimated_solving_time INT COMMENT 'in seconds',
    weightage INT DEFAULT 1,
    tags VARCHAR(255),
    hint TEXT,
    learning_objective TEXT,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_difficulty (difficulty),
    INDEX idx_category (category),
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE SET NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    FOREIGN KEY (subtopic_id) REFERENCES subtopics(id) ON DELETE SET NULL,
    FOREIGN KEY (difficulty_id) REFERENCES difficulties(id) ON DELETE SET NULL
);

CREATE TABLE question_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Analytics & Adaptive Tables
CREATE TABLE question_statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    total_attempts INT DEFAULT 0,
    correct_attempts INT DEFAULT 0,
    average_solving_time FLOAT DEFAULT 0.0 COMMENT 'in seconds',
    difficulty_index FLOAT DEFAULT 0.0 COMMENT 'Calculated dynamically based on user performance',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_difficulty_index (difficulty_index)
);

CREATE TABLE tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_type ENUM('general', 'adaptive') NOT NULL,
    start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    status ENUM('in_progress', 'completed') DEFAULT 'in_progress',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status)
);

CREATE TABLE question_usage_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    test_id INT NOT NULL,
    user_id INT NOT NULL,
    presented_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    question_id INT NOT NULL,
    option_id INT NOT NULL,
    response_time_ms INT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (option_id) REFERENCES question_options(id) ON DELETE CASCADE
);

CREATE TABLE results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    user_id INT NOT NULL,
    total_score INT DEFAULT 0,
    accuracy FLOAT DEFAULT 0.0,
    avg_response_time FLOAT DEFAULT 0.0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_accuracy (accuracy)
);

CREATE TABLE recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_id INT NOT NULL,
    recommended_difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    explanation TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

CREATE TABLE user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    current_level ENUM('easy', 'medium', 'hard') DEFAULT 'easy',
    total_tests_taken INT DEFAULT 0,
    average_accuracy FLOAT DEFAULT 0.0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Sample Data
INSERT INTO users (name, email, password, role) VALUES 
('Alex Student', 'student@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'), 
('Admin User', 'admin@test.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Default Difficulties
INSERT INTO difficulties (name, weight) VALUES 
('easy', 1), ('medium', 2), ('hard', 3);

-- Default Domain, Topic, Subtopic
INSERT INTO domains (name, description) VALUES ('Quantitative Aptitude', 'Mathematical and numerical ability');
INSERT INTO topics (domain_id, name) VALUES (1, 'Number System');
INSERT INTO subtopics (topic_id, name) VALUES (1, 'Sequences');

INSERT INTO domains (name, description) VALUES ('Logical Reasoning', 'Logical and analytical reasoning');
INSERT INTO topics (domain_id, name) VALUES (2, 'Blood Relations');
INSERT INTO subtopics (topic_id, name) VALUES (2, 'Family Tree');

INSERT INTO questions (text, difficulty, category, domain_id, topic_id, subtopic_id, difficulty_id) VALUES 
('What is the next number in the sequence: 2, 4, 8, 16, ...?', 'easy', 'Math', 1, 1, 1, 1),
('If A is the brother of B; B is the sister of C; and C is the father of D, how D is related to A?', 'medium', 'Logical Reasoning', 2, 2, 2, 2),
('A train 120 meters long is running with a speed of 60 km/hr. In what time will it pass a boy who is running at 6 km/hr in the direction opposite to that in which the train is going?', 'hard', 'Math', 1, 1, 1, 3);

INSERT INTO question_options (question_id, text, is_correct) VALUES 
(1, '24', 0), (1, '32', 1), (1, '20', 0), (1, '64', 0),
(2, 'Brother', 0), (2, 'Sister', 0), (2, 'Nephew', 0), (2, 'Cannot be determined', 1),
(3, '6.54 sec', 1), (3, '44.32 sec', 0), (3, '55 sec', 0), (3, '30.2 sec', 0);

INSERT INTO question_statistics (question_id, total_attempts, correct_attempts, average_solving_time, difficulty_index) VALUES
(1, 10, 8, 15.0, 0.2),
(2, 5, 2, 45.0, 0.6),
(3, 2, 0, 90.0, 0.9);

INSERT INTO tests (user_id, test_type, status) VALUES 
(1, 'general', 'completed');

INSERT INTO question_usage_history (question_id, test_id, user_id) VALUES 
(1, 1, 1), (2, 1, 1), (3, 1, 1);

INSERT INTO responses (test_id, question_id, option_id, response_time_ms, is_correct) VALUES 
(1, 1, 2, 5000, 1),
(1, 2, 8, 15000, 1),
(1, 3, 9, 25000, 1);

INSERT INTO results (test_id, user_id, total_score, accuracy, avg_response_time) VALUES 
(1, 1, 30, 1.0, 15000);

INSERT INTO recommendations (user_id, test_id, recommended_difficulty, explanation) VALUES 
(1, 1, 'hard', 'Excellent performance! You answered all questions correctly. We recommend attempting hard difficulty.');

INSERT INTO user_progress (user_id, current_level, total_tests_taken, average_accuracy) VALUES 
(1, 'hard', 1, 1.0);
