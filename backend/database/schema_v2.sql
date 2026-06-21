-- Adaptive Learning Platform - Database Schema V2
-- This script contains all schemas including backward compatible updates for existing tables.

CREATE DATABASE IF NOT EXISTS adaptive_learning;
USE adaptive_learning;

-- ========================================================
-- 1. NORMALIZED TAXONOMY TABLES
-- ========================================================

CREATE TABLE IF NOT EXISTS domains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
    UNIQUE KEY unique_topic_domain (domain_id, name)
);

CREATE TABLE IF NOT EXISTS subtopics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topic_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE KEY unique_subtopic_topic (topic_id, name)
);

CREATE TABLE IF NOT EXISTS difficulties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level_name VARCHAR(50) NOT NULL UNIQUE,
    score_multiplier FLOAT DEFAULT 1.0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default difficulties to map to legacy ENUM
INSERT IGNORE INTO difficulties (level_name, score_multiplier) VALUES 
('Easy', 1.0), 
('Medium', 1.5), 
('Hard', 2.0);

-- ========================================================
-- 2. CORE QUESTIONS UPGRADE (BACKWARD COMPATIBLE)
-- ========================================================
-- The following columns are added as NULLABLE so existing
-- backend INSERT operations without them will not fail.

ALTER TABLE questions
    ADD COLUMN IF NOT EXISTS domain_id INT NULL,
    ADD COLUMN IF NOT EXISTS topic_id INT NULL,
    ADD COLUMN IF NOT EXISTS subtopic_id INT NULL,
    ADD COLUMN IF NOT EXISTS difficulty_id INT NULL,
    ADD COLUMN IF NOT EXISTS detailed_explanation TEXT,
    ADD COLUMN IF NOT EXISTS estimated_solving_time INT COMMENT 'in seconds',
    ADD COLUMN IF NOT EXISTS weightage INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS tags VARCHAR(255),
    ADD COLUMN IF NOT EXISTS hint TEXT,
    ADD COLUMN IF NOT EXISTS learning_objective TEXT;

-- Safely applying foreign keys to questions table
-- (Will throw warning/error if already exists, but won't break new DB setup)
ALTER TABLE questions
    ADD CONSTRAINT fk_q_domain FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_q_topic FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_q_subtopic FOREIGN KEY (subtopic_id) REFERENCES subtopics(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_q_diff FOREIGN KEY (difficulty_id) REFERENCES difficulties(id) ON DELETE SET NULL;

-- ========================================================
-- 3. ADAPTIVE ENGINE ANALYTICS & HISTORY TABLES
-- ========================================================

-- Aggregated usage statistics (updated either via backend or triggers)
CREATE TABLE IF NOT EXISTS question_statistics (
    question_id INT PRIMARY KEY,
    total_attempts INT DEFAULT 0,
    correct_attempts INT DEFAULT 0,
    total_time_ms BIGINT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Performance metrics calculated by the adaptive engine
CREATE TABLE IF NOT EXISTS question_performance (
    question_id INT PRIMARY KEY,
    difficulty_index FLOAT DEFAULT NULL COMMENT 'Percentage of correct attempts (P-value)',
    discrimination_index FLOAT DEFAULT NULL COMMENT 'Ability to differentiate top/bottom students',
    avg_solving_time_ms INT DEFAULT NULL,
    last_calculated_at TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Audit log for tracking engine serving behavior and predicted difficulty
CREATE TABLE IF NOT EXISTS question_usage_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    user_id INT NOT NULL,
    test_id INT NOT NULL,
    served_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    engine_predicted_difficulty FLOAT NULL COMMENT 'Difficulty score predicted by the engine at the time of serving',
    is_correct BOOLEAN NULL COMMENT 'Will be updated when user responds',
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- ========================================================
-- 4. OPTIMIZING INDEXES
-- ========================================================

-- Indexes for read-heavy operations in the adaptive engine
CREATE INDEX idx_adaptive_select ON questions (domain_id, topic_id, difficulty_id);
CREATE INDEX idx_perf_diff ON question_performance (difficulty_index, avg_solving_time_ms);
CREATE INDEX idx_user_history ON question_usage_history (user_id, question_id);
