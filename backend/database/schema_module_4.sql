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
