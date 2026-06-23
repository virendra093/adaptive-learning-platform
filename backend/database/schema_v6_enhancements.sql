USE adaptive_learning;

-- Module 2: Mandatory General Test Flow
ALTER TABLE student_profile 
ADD COLUMN general_test_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN general_test_score DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN general_test_date TIMESTAMP NULL;

-- Module 4: Student Feedback and Support System
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    rating INT DEFAULT 5,
    status ENUM('pending', 'reviewed', 'resolved') DEFAULT 'pending',
    admin_notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Module 5: Raise Question Module (Support Tickets)
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    question_context TEXT,
    description TEXT NOT NULL,
    status ENUM('Open', 'In Progress', 'Resolved', 'Closed') DEFAULT 'Open',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    admin_notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Module 3: Achievement System
CREATE TABLE IF NOT EXISTS student_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Module 3: Goals
CREATE TABLE IF NOT EXISTS student_daily_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    goal_date DATE NOT NULL,
    questions_target INT DEFAULT 10,
    questions_solved INT DEFAULT 0,
    tests_target INT DEFAULT 1,
    tests_completed INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY user_date_unique (user_id, goal_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
