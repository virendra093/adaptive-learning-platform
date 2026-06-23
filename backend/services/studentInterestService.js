import pool from '../config/db.js';

/**
 * Module 2: Student Interest Detection Engine
 * A rule-based engine to determine domains and topics the student naturally enjoys.
 */
export const updateStudentInterest = async (userId) => {
    try {
        // Fetch all question history for the user
        const [historyRows] = await pool.execute(
            `SELECT q.domain_id, q.topic_id, q.difficulty_id, 
                    qh.is_correct, qh.was_skipped, qh.response_time_ms, qh.confidence_level
             FROM question_history qh
             JOIN questions q ON qh.question_id = q.id
             WHERE qh.user_id = ?`,
            [userId]
        );

        if (historyRows.length === 0) return null;

        // Group by Domain
        const domainStats = {};
        // Group by Topic
        const topicStats = {};
        // Group by Difficulty
        const difficultyStats = {};

        historyRows.forEach(row => {
            // Aggregate Domain
            if (!domainStats[row.domain_id]) {
                domainStats[row.domain_id] = { total: 0, correct: 0, time: 0, skipped: 0, confidence: 0 };
            }
            domainStats[row.domain_id].total++;
            domainStats[row.domain_id].correct += row.is_correct ? 1 : 0;
            domainStats[row.domain_id].time += row.response_time_ms;
            domainStats[row.domain_id].skipped += row.was_skipped ? 1 : 0;
            domainStats[row.domain_id].confidence += row.confidence_level || 1;

            // Aggregate Topic
            if (!topicStats[row.topic_id]) {
                topicStats[row.topic_id] = { total: 0, correct: 0, time: 0, skipped: 0, confidence: 0 };
            }
            topicStats[row.topic_id].total++;
            topicStats[row.topic_id].correct += row.is_correct ? 1 : 0;
            topicStats[row.topic_id].time += row.response_time_ms;
            topicStats[row.topic_id].skipped += row.was_skipped ? 1 : 0;
            topicStats[row.topic_id].confidence += row.confidence_level || 1;

            // Aggregate Difficulty
            if (!difficultyStats[row.difficulty_id]) {
                difficultyStats[row.difficulty_id] = { total: 0, correct: 0 };
            }
            difficultyStats[row.difficulty_id].total++;
            difficultyStats[row.difficulty_id].correct += row.is_correct ? 1 : 0;
        });

        const calculateAffinity = (stats) => {
            const affinity = {};
            let bestId = null;
            let highestScore = -1;

            for (const id in stats) {
                const s = stats[id];
                const accuracy = s.correct / s.total;
                const skipRate = s.skipped / s.total;
                const avgConfidence = s.confidence / s.total;
                
                // Rule-based score: 
                // Weight: 40% Accuracy, 30% Volume (Attempted), 20% Low Skip Rate, 10% Confidence
                // Engagement is implicitly rewarded by volume.
                const volumeScore = Math.min(s.total / 50, 1.0); // Normalize to ~50 questions
                const score = (accuracy * 40) + (volumeScore * 30) + ((1 - skipRate) * 20) + (avgConfidence * 10);
                
                affinity[id] = score;

                if (score > highestScore) {
                    highestScore = score;
                    bestId = id;
                }
            }
            return { affinity, bestId, highestScore };
        };

        const domainResult = calculateAffinity(domainStats);
        const topicResult = calculateAffinity(topicStats);

        // Determine Preferred Difficulty (Simple majority of correct answers)
        let preferredDifficultyId = null;
        let maxDifficultyScore = -1;
        for (const diffId in difficultyStats) {
            const d = difficultyStats[diffId];
            const acc = d.correct / d.total;
            // Balance between high accuracy and volume
            const score = acc * d.total; 
            if (score > maxDifficultyScore) {
                maxDifficultyScore = score;
                preferredDifficultyId = diffId;
            }
        }

        const preferredDomainId = domainResult.bestId;
        const preferredTopicId = topicResult.bestId;
        const interestScore = domainResult.highestScore; // Use domain as primary interest score

        // Insert or update the student_interest table
        await pool.execute(
            `INSERT INTO student_interest 
             (user_id, preferred_domain_id, preferred_topic_id, preferred_difficulty_id, interest_score, domain_affinity, topic_affinity) 
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                preferred_domain_id = VALUES(preferred_domain_id),
                preferred_topic_id = VALUES(preferred_topic_id),
                preferred_difficulty_id = VALUES(preferred_difficulty_id),
                interest_score = VALUES(interest_score),
                domain_affinity = VALUES(domain_affinity),
                topic_affinity = VALUES(topic_affinity)`,
            [
                userId, 
                preferredDomainId, 
                preferredTopicId, 
                preferredDifficultyId, 
                interestScore, 
                JSON.stringify(domainResult.affinity), 
                JSON.stringify(topicResult.affinity)
            ]
        );

        // Also update student profile directly if columns exist
        await pool.execute(
            `UPDATE student_profile SET preferred_domain = ?, preferred_difficulty = ? WHERE user_id = ?`,
            [preferredDomainId, preferredDifficultyId, userId]
        ).catch(e => console.log("Note: preferred_domain columns might not exist on student_profile yet."));

        return {
            preferredDomainId,
            preferredTopicId,
            preferredDifficultyId,
            interestScore,
            domainAffinity: domainResult.affinity,
            topicAffinity: topicResult.affinity
        };
    } catch (error) {
        console.error("Error updating student interest:", error);
        return null;
    }
};
