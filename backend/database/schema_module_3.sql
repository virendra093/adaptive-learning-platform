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
