SET FOREIGN_KEY_CHECKS = 0;
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
INSERT IGNORE INTO difficulties (name, weight) VALUES 
('Easy', 1), 
('Medium', 2), 
('Hard', 3);

-- ========================================================
-- 2. CORE QUESTIONS UPGRADE (BACKWARD COMPATIBLE)
-- ========================================================
-- The following columns are added as NULLABLE so existing
-- backend INSERT operations without them will not fail.

ALTER TABLE questions
    ADD COLUMN domain_id INT NULL,
    ADD COLUMN topic_id INT NULL,
    ADD COLUMN subtopic_id INT NULL,
    ADD COLUMN difficulty_id INT NULL,
    ADD COLUMN detailed_explanation TEXT,
    ADD COLUMN estimated_solving_time INT COMMENT 'in seconds',
    ADD COLUMN weightage INT DEFAULT 1,
    ADD COLUMN tags VARCHAR(255),
    ADD COLUMN hint TEXT,
    ADD COLUMN learning_objective TEXT;

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
-- Adaptive Learning Platform - Database Schema V3 (Adaptive Engine V2.0)
-- Extension tables for DKT and RL inspired adaptive tracking

USE adaptive_learning;

-- 1. Student Knowledge Profile
CREATE TABLE IF NOT EXISTS student_profile (
    user_id INT PRIMARY KEY,
    overall_accuracy FLOAT DEFAULT 0.0,
    average_response_time INT DEFAULT 0 COMMENT 'in ms',
    learning_speed FLOAT DEFAULT 1.0 COMMENT 'Multiplier based on response time vs accuracy',
    current_skill_level ENUM('novice', 'intermediate', 'advanced', 'expert') DEFAULT 'novice',
    current_adaptive_level INT DEFAULT 1 COMMENT '1 to 10 scale',
    knowledge_score FLOAT DEFAULT 0.0 COMMENT 'Overall aggregate score from DKT',
    behavior_score FLOAT DEFAULT 1.0 COMMENT 'Reflects skipping or rushing',
    confidence_score FLOAT DEFAULT 1.0,
    improvement_trend ENUM('improving', 'stagnant', 'declining') DEFAULT 'stagnant',
    strong_topics TEXT COMMENT 'JSON array of strong topic IDs',
    weak_topics TEXT COMMENT 'JSON array of weak topic IDs',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. DKT Inspired Knowledge State
-- Tracks mastery scores at the most granular level
CREATE TABLE IF NOT EXISTS knowledge_state (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    domain_id INT NOT NULL,
    topic_id INT NOT NULL,
    difficulty_id INT NOT NULL,
    mastery_score FLOAT DEFAULT 50.0 COMMENT '0.0 to 100.0 scale',
    attempts INT DEFAULT 0,
    correct_attempts INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (difficulty_id) REFERENCES difficulties(id) ON DELETE CASCADE,
    UNIQUE KEY unique_knowledge_node (user_id, topic_id, difficulty_id)
);

-- 3. RL Inspired Adaptive Rewards
-- Tracks the reward accumulated from the RL policy
CREATE TABLE IF NOT EXISTS adaptive_rewards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_reward FLOAT DEFAULT 0.0,
    last_reward_granted FLOAT DEFAULT 0.0,
    current_difficulty_multiplier FLOAT DEFAULT 1.0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Question History
-- High granularity tracking of every question served to a student
CREATE TABLE IF NOT EXISTS question_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_id INT NOT NULL,
    question_id INT NOT NULL,
    topic_id INT NOT NULL,
    difficulty_id INT NOT NULL,
    response_time_ms INT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    was_skipped BOOLEAN DEFAULT FALSE,
    confidence_level FLOAT DEFAULT 1.0,
    reward_earned FLOAT DEFAULT 0.0,
    served_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    INDEX idx_user_topic (user_id, topic_id)
);

-- 5. Learning Progress (Timeseries Data for Graphs)
-- Snapshots of the student's overall profile over time
CREATE TABLE IF NOT EXISTS learning_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    snapshot_date DATE NOT NULL,
    knowledge_score FLOAT NOT NULL,
    accuracy FLOAT NOT NULL,
    test_id INT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_daily_snapshot (user_id, snapshot_date)
);

-- 6. Adaptive History
-- Tracks the specific generation of an adaptive test
CREATE TABLE IF NOT EXISTS adaptive_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    user_id INT NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    target_weak_topics TEXT COMMENT 'JSON array',
    target_medium_topics TEXT COMMENT 'JSON array',
    target_strong_topics TEXT COMMENT 'JSON array',
    average_target_difficulty FLOAT NOT NULL,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Ensure domains and topics have proper coverage for new questions
INSERT IGNORE INTO domains (id, name, description) VALUES
(1, 'Quantitative Aptitude', 'Mathematical and numerical ability'),
(2, 'Logical Reasoning', 'Logical and analytical reasoning'),
(3, 'Verbal Ability', 'English grammar, vocabulary, and comprehension');

INSERT IGNORE INTO topics (id, domain_id, name) VALUES
(1, 1, 'Number System'),
(2, 2, 'Blood Relations'),
(3, 1, 'Algebra'),
(4, 1, 'Geometry'),
(5, 3, 'Grammar'),
(6, 3, 'Vocabulary'),
(7, 2, 'Puzzles'),
(8, 2, 'Syllogism');
-- Adaptive Learning Platform - Database Schema V4 (Adaptive Intelligence V3.0)
-- Extension tables and modifications for Deep Behavior Analysis & Math Engine

USE adaptive_learning;

-- 1. Extend questions table with pedagogical metadata
ALTER TABLE questions 
ADD COLUMN bloom_taxonomy_level ENUM('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create') DEFAULT 'apply',
ADD COLUMN expected_accuracy FLOAT DEFAULT 50.0;

-- 2. Extend student_profile with continuous estimation vectors
ALTER TABLE student_profile
ADD COLUMN consistency_score FLOAT DEFAULT 1.0 COMMENT '1.0 to 10.0 scale',
ADD COLUMN improvement_score FLOAT DEFAULT 0.0,
ADD COLUMN preferred_domain INT NULL,
ADD COLUMN preferred_difficulty INT NULL,
ADD COLUMN growth_rate FLOAT DEFAULT 0.0,
ADD COLUMN learning_trend ENUM('improving', 'stable', 'declining', 'fast_learner', 'slow_learner') DEFAULT 'stable',
ADD COLUMN last_five_scores TEXT COMMENT 'JSON array of last 5 test accuracy',
ADD FOREIGN KEY (preferred_domain) REFERENCES domains(id) ON DELETE SET NULL,
ADD FOREIGN KEY (preferred_difficulty) REFERENCES difficulties(id) ON DELETE SET NULL;

-- 3. Behavior Metrics Tracking
CREATE TABLE IF NOT EXISTS behavior_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_id INT NOT NULL,
    question_skip_rate FLOAT DEFAULT 0.0,
    rapid_guessing_count INT DEFAULT 0 COMMENT 'Responses < 3 seconds',
    avg_thinking_time_ms INT DEFAULT 0,
    max_consecutive_wrong INT DEFAULT 0,
    max_consecutive_correct INT DEFAULT 0,
    attention_score FLOAT DEFAULT 1.0 COMMENT 'Based on consistent pacing',
    persistence_score FLOAT DEFAULT 1.0 COMMENT 'Based on time spent on hard questions before failure',
    learning_discipline FLOAT DEFAULT 1.0 COMMENT 'Based on completion rate and test frequency',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- 4. Learning Trend History
CREATE TABLE IF NOT EXISTS learning_trend (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    evaluation_date DATE NOT NULL,
    trend_classification ENUM('improving', 'stable', 'declining', 'fast_learner', 'slow_learner') NOT NULL,
    confidence_delta FLOAT DEFAULT 0.0,
    mastery_delta FLOAT DEFAULT 0.0,
    test_count_period INT DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Question Statistics (Continuous aggregation of question performance)
CREATE TABLE IF NOT EXISTS question_statistics (
    question_id INT PRIMARY KEY,
    total_attempts INT DEFAULT 0,
    correct_attempts INT DEFAULT 0,
    avg_response_time INT DEFAULT 0,
    skip_rate FLOAT DEFAULT 0.0,
    actual_accuracy FLOAT DEFAULT 0.0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- 6. Recommendation Engine History
CREATE TABLE IF NOT EXISTS recommendation_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recommended_topic_id INT NOT NULL,
    target_difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
    reason TEXT,
    accepted BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recommended_topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- Initialize existing questions into question_statistics to prevent FK constraints issues later
INSERT IGNORE INTO question_statistics (question_id)
SELECT id FROM questions;
-- Adaptive Learning Platform - Database Schema V4 (Module 1-12 Updates)

USE adaptive_learning;

-- =========================================================================
-- MODULE 1: LEARNING PERSONA
-- =========================================================================

CREATE TABLE IF NOT EXISTS learning_persona (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    persona ENUM(
        'Fast Learner',
        'Slow Learner',
        'Fast Guesser',
        'Careful Learner',
        'Consistent Learner',
        'Improving Learner',
        'Needs Reinforcement',
        'Explorer',
        'Focused Learner',
        'Adaptive Learner'
    ) DEFAULT 'Adaptive Learner',
    confidence FLOAT DEFAULT 0.0,
    reason TEXT,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =========================================================================
-- MODULE 2: STUDENT INTEREST
-- =========================================================================

CREATE TABLE IF NOT EXISTS student_interest (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    preferred_domain_id INT NULL,
    preferred_topic_id INT NULL,
    preferred_difficulty_id INT NULL,
    interest_score FLOAT DEFAULT 0.0,
    domain_affinity TEXT COMMENT 'JSON object mapping domain_id to affinity score',
    topic_affinity TEXT COMMENT 'JSON object mapping topic_id to affinity score',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (preferred_domain_id) REFERENCES domains(id) ON DELETE SET NULL,
    FOREIGN KEY (preferred_topic_id) REFERENCES topics(id) ON DELETE SET NULL,
    FOREIGN KEY (preferred_difficulty_id) REFERENCES difficulties(id) ON DELETE SET NULL
);
-- MODULE 3: CONFIDENCE ESTIMATION
USE adaptive_learning;

CREATE TABLE IF NOT EXISTS confidence_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_id INT NULL,
    confidence_score FLOAT NOT NULL COMMENT 'Range 0-100',
    correctness_factor FLOAT,
    time_factor FLOAT,
    consistency_factor FLOAT,
    rapid_guessing_penalty FLOAT,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);
-- MODULE 4: LEARNING PATH
USE adaptive_learning;

CREATE TABLE IF NOT EXISTS learning_path (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goal VARCHAR(255) DEFAULT 'General Aptitude',
    roadmap_json TEXT COMMENT 'JSON array representing weeks/stages and recommended topics',
    estimated_improvement FLOAT DEFAULT 0.0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- MODULE 5: QUESTION QUALITY ANALYTICS
USE adaptive_learning;

-- Add new columns if they don't exist
ALTER TABLE question_statistics 
ADD COLUMN skip_count INT DEFAULT 0 AFTER correct_attempts,
ADD COLUMN discrimination_index FLOAT DEFAULT 0.0 COMMENT 'How well this question separates high/low performers';
-- MODULE 6: TOPIC DEPENDENCY GRAPH
USE adaptive_learning;

CREATE TABLE IF NOT EXISTS topic_dependency (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topic_id INT NOT NULL,
    prerequisite_topic_id INT NOT NULL,
    min_mastery_required FLOAT DEFAULT 60.0,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (prerequisite_topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    UNIQUE KEY unique_dependency (topic_id, prerequisite_topic_id)
);

-- Note: We need to know actual topic IDs to seed them accurately.
-- Assuming topics 1 (Percentages/Number System) is prerequisite for 3 (Profit & Loss).
-- We'll just insert some dummy links based on available topic IDs (1 to 10).
INSERT IGNORE INTO topic_dependency (topic_id, prerequisite_topic_id, min_mastery_required) VALUES
(3, 1, 60.0), -- Profit & Loss requires Number System/Percentages
(4, 1, 60.0), -- Simple Interest requires Number System/Percentages
(5, 1, 60.0); -- Time & Work requires Number System/Percentages
-- MODULE 8: LEARNING GOAL ENGINE
USE adaptive_learning;

CREATE TABLE IF NOT EXISTS goal_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    selected_goal ENUM('Campus Placement', 'GATE', 'CAT', 'MBA', 'Government Exams', 'General Aptitude') DEFAULT 'General Aptitude',
    progress_percentage FLOAT DEFAULT 0.0,
    target_completion_date DATE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
SET FOREIGN_KEY_CHECKS = 1;

