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
