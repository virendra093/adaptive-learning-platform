import pool from '../config/db.js';

/**
 * Advanced Behavior Analysis Engine (Phase 2)
 * Analyzes the raw telemetry of a student's test session to extract cognitive and behavioral metrics.
 */
export const analyzeTestBehavior = async (userId, testId, responses) => {
    try {
        if (!responses || responses.length === 0) return null;

        const totalQuestions = responses.length;
        let skippedCount = 0;
        let rapidGuessingCount = 0;
        let totalThinkingTime = 0;
        
        let currentConsecutiveWrong = 0;
        let maxConsecutiveWrong = 0;
        let currentConsecutiveCorrect = 0;
        let maxConsecutiveCorrect = 0;

        responses.forEach(r => {
            // Track Skips
            if (r.wasSkipped || !r.optionId) {
                skippedCount++;
                currentConsecutiveWrong = 0;
                currentConsecutiveCorrect = 0;
            } else {
                totalThinkingTime += r.responseTimeMs;

                // Rapid Guessing (Under 3 seconds)
                if (r.responseTimeMs < 3000) {
                    rapidGuessingCount++;
                }

                // Consecutive streaks
                if (r.isCorrect) {
                    currentConsecutiveCorrect++;
                    if (currentConsecutiveCorrect > maxConsecutiveCorrect) maxConsecutiveCorrect = currentConsecutiveCorrect;
                    currentConsecutiveWrong = 0;
                } else {
                    currentConsecutiveWrong++;
                    if (currentConsecutiveWrong > maxConsecutiveWrong) maxConsecutiveWrong = currentConsecutiveWrong;
                    currentConsecutiveCorrect = 0;
                }
            }
        });

        const skipRate = skippedCount / totalQuestions;
        const avgThinkingTime = (totalQuestions - skippedCount) > 0 ? totalThinkingTime / (totalQuestions - skippedCount) : 0;
        
        // Attention Score (1.0 is baseline). Drops if rapid guessing is high.
        let attentionScore = 1.0 - (rapidGuessingCount / totalQuestions) * 0.5;
        if (attentionScore < 0.1) attentionScore = 0.1;

        // Persistence Score (1.0 is baseline). Drops if skip rate is high.
        let persistenceScore = 1.0 - (skipRate * 0.7);
        if (persistenceScore < 0.1) persistenceScore = 0.1;

        // Learning Discipline. Evaluated by completion of the test vs aborting.
        let learningDiscipline = 1.0; 

        await pool.execute(
            `INSERT INTO behavior_metrics (
                user_id, test_id, question_skip_rate, rapid_guessing_count, 
                avg_thinking_time_ms, max_consecutive_wrong, max_consecutive_correct, 
                attention_score, persistence_score, learning_discipline
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, testId, skipRate, rapidGuessingCount, avgThinkingTime, maxConsecutiveWrong, maxConsecutiveCorrect, attentionScore, persistenceScore, learningDiscipline]
        );

        return {
            skipRate,
            rapidGuessingCount,
            avgThinkingTime,
            maxConsecutiveWrong,
            maxConsecutiveCorrect,
            attentionScore,
            persistenceScore,
            learningDiscipline
        };
    } catch (error) {
        console.error("Error analyzing behavior:", error);
        return null;
    }
};

/**
 * Updates question-level statistics based on massive student interaction data.
 */
export const updateQuestionStatistics = async (responses) => {
    try {
        for (const r of responses) {
            const isCorrect = r.isCorrect ? 1 : 0;
            const isSkipped = r.wasSkipped || !r.optionId ? 1 : 0;
            const responseTime = r.responseTimeMs || 0;

            await pool.execute(
                `INSERT INTO question_statistics (question_id, total_attempts, correct_attempts, avg_response_time, skip_rate, actual_accuracy)
                 VALUES (?, 1, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                    total_attempts = total_attempts + 1,
                    correct_attempts = correct_attempts + VALUES(correct_attempts),
                    avg_response_time = (avg_response_time * (total_attempts - 1) + VALUES(avg_response_time)) / total_attempts,
                    skip_rate = ((skip_rate * (total_attempts - 1)) + VALUES(skip_rate)) / total_attempts,
                    actual_accuracy = correct_attempts / total_attempts`,
                [r.questionId, isCorrect, responseTime, isSkipped, isCorrect]
            );
        }
    } catch (error) {
        console.error("Error updating question statistics:", error);
    }
};
