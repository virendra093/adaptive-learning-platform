-- MODULE 5: QUESTION QUALITY ANALYTICS
USE adaptive_learning;

-- Add new columns if they don't exist
ALTER TABLE question_statistics 
ADD COLUMN skip_count INT DEFAULT 0 AFTER correct_attempts,
ADD COLUMN discrimination_index FLOAT DEFAULT 0.0 COMMENT 'How well this question separates high/low performers';
