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
