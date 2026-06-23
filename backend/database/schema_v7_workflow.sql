USE adaptive_learning;

-- Rename general_test_completed to general_assessment_completed and add new columns
ALTER TABLE student_profile 
CHANGE COLUMN general_test_completed general_assessment_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN general_assessment_completed_at TIMESTAMP NULL,
ADD COLUMN initial_profile_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN adaptive_access_enabled BOOLEAN DEFAULT FALSE;
