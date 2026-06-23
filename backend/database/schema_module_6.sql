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
