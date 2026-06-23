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
