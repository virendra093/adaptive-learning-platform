import pool from '../config/db.js';

/**
 * Advanced DKT-inspired Knowledge Tracking Engine (V3.0)
 * Evaluates continuous mastery utilizing multi-dimensional cognitive vectors.
 */
export const updateKnowledgeState = async (
    userId, domainId, topicId, difficultyId, isCorrect, responseTimeMs, expectedTimeMs = 30000, 
    wasSkipped = false, hintUsed = false, questionWeight = 1.0, behaviorScore = 1.0
) => {
    try {
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
            await pool.execute(
                `INSERT IGNORE INTO knowledge_state (user_id, domain_id, topic_id, difficulty_id, mastery_score)
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, domainId, topicId, difficultyId, mastery]
            );
        }

        attempts++;
        if (isCorrect && !wasSkipped) correctAttempts++;

        let adjustment = 0.0;
        const diffMultiplier = difficultyId === 3 ? 1.5 : (difficultyId === 1 ? 0.8 : 1.0);

        if (wasSkipped) {
            adjustment -= 3.0 * questionWeight * diffMultiplier;
        } else if (isCorrect) {
            adjustment += 5.0 * questionWeight * diffMultiplier;
            
            // Speed Bonus / Penalty
            if (responseTimeMs < expectedTimeMs * 0.5) {
                adjustment += 2.0; // Fluent mastery
            } else if (responseTimeMs > expectedTimeMs * 1.5) {
                adjustment -= 1.5; // Struggled but succeeded
            }
        } else {
            adjustment -= 5.0 * questionWeight * diffMultiplier;
            
            // Rapid Guessing Penalty
            if (responseTimeMs < expectedTimeMs * 0.2) {
                adjustment -= 3.0; 
            }
        }

        if (hintUsed) {
            adjustment *= 0.6; // Reduced reward if hint was used
        }

        // Apply behavior multiplier (Discipline, persistence)
        adjustment *= behaviorScore;

        // Bounded Learning Growth Formula
        if (adjustment > 0) {
            // Harder to gain mastery as you approach 100
            mastery += adjustment * ((100 - mastery) / 100);
        } else {
            // Easier to lose mastery if you are highly rated
            mastery += adjustment * (mastery / 100);
        }

        mastery = Math.max(0.0, Math.min(100.0, mastery));

        await pool.execute(
            `UPDATE knowledge_state 
             SET mastery_score = ?, attempts = ?, correct_attempts = ?
             WHERE user_id = ? AND topic_id = ? AND difficulty_id = ?`,
            [mastery, attempts, correctAttempts, userId, topicId, difficultyId]
        );

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
