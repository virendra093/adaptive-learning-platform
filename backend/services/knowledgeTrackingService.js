import pool from '../config/db.js';

/**
 * Lightweight DKT-inspired knowledge tracking.
 * Updates the knowledge_state table based on student performance.
 */
export const updateKnowledgeState = async (userId, domainId, topicId, difficultyId, isCorrect, responseTimeMs, expectedTimeMs = 30000, wasSkipped = false) => {
    try {
        // 1. Fetch current state or initialize
        const [rows] = await pool.execute(
            `SELECT mastery_score, attempts, correct_attempts FROM knowledge_state 
             WHERE user_id = ? AND topic_id = ? AND difficulty_id = ?`,
            [userId, topicId, difficultyId]
        );

        let mastery = 50.0;
        let attempts = 0;
        let correctAttempts = 0;

        if (rows.length > 0) {
            mastery = parseFloat(rows[0].mastery_score);
            attempts = parseInt(rows[0].attempts);
            correctAttempts = parseInt(rows[0].correct_attempts);
        } else {
            // Initialize if not exists
            await pool.execute(
                `INSERT IGNORE INTO knowledge_state (user_id, domain_id, topic_id, difficulty_id, mastery_score)
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, domainId, topicId, difficultyId, mastery]
            );
        }

        // 2. Calculate adjustments
        attempts++;
        if (isCorrect && !wasSkipped) correctAttempts++;

        let adjustment = 0;

        if (wasSkipped) {
            adjustment = -2.0; // Penalty for skipping
        } else if (isCorrect) {
            adjustment += 2.0; // Base correct
            // Speed bonus
            if (responseTimeMs < expectedTimeMs * 0.8) {
                adjustment += 1.0; 
            } else if (responseTimeMs > expectedTimeMs * 1.5) {
                adjustment -= 0.5; // Slight penalty for taking too long even if correct
            }
        } else {
            adjustment -= 2.0; // Base wrong
            // Careless mistake penalty (wrong but answered super fast)
            if (responseTimeMs < expectedTimeMs * 0.3) {
                adjustment -= 1.0; 
            }
        }

        // 3. Repeated mistakes check
        const correctnessRatio = correctAttempts / attempts;
        if (!isCorrect && correctnessRatio < 0.3 && attempts > 3) {
            adjustment -= 1.5; // Compounding penalty for failing this topic repeatedly
        }

        // Apply and bound between 0 and 100
        mastery += adjustment;
        mastery = Math.max(0.0, Math.min(100.0, mastery));

        // 4. Save to DB
        await pool.execute(
            `UPDATE knowledge_state 
             SET mastery_score = ?, attempts = ?, correct_attempts = ?
             WHERE user_id = ? AND topic_id = ? AND difficulty_id = ?`,
            [mastery, attempts, correctAttempts, userId, topicId, difficultyId]
        );

        // 5. Update overall knowledge_score in student_profile
        await updateOverallKnowledgeScore(userId);

        return mastery;
    } catch (error) {
        console.error("Error updating knowledge state:", error);
        throw error;
    }
};

const updateOverallKnowledgeScore = async (userId) => {
    try {
        const [rows] = await pool.execute(
            `SELECT AVG(mastery_score) as avg_mastery FROM knowledge_state WHERE user_id = ?`,
            [userId]
        );
        const avgMastery = rows[0].avg_mastery || 0.0;

        await pool.execute(
            `UPDATE student_profile SET knowledge_score = ? WHERE user_id = ?`,
            [avgMastery, userId]
        );
    } catch (error) {
        console.error("Error updating overall knowledge score:", error);
    }
};
