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