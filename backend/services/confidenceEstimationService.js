import pool from '../config/db.js';

/**
 * Module 3: Confidence Estimation Engine
 * Calculates a Confidence Score (0-100) using Correctness, Time, Attempts, 
 * Hints Used, Rapid Guessing, Consistency, and Previous Performance.
 */
export const updateConfidenceEstimation = async (userId, testId, responses) => {
    try {
        if (!responses || responses.length === 0) return null;

        // Fetch recent performance (Consistency & Previous Performance)
        const [profileRows] = await pool.execute(
            `SELECT overall_accuracy, confidence_score FROM student_profile WHERE user_id = ?`,
            [userId]
        );
        const profile = profileRows[0] || { overall_accuracy: 50, confidence_score: 5.0 };
        const previousConfidence = profile.confidence_score * 10; // 0-10 to 0-100 scale

        let correctCount = 0;
        let rapidGuessingCount = 0;
        let totalTime = 0;
        let consistencyHits = 0;

        responses.forEach(r => {
            const isCorrect = r.isCorrect;
            const timeMs = r.responseTimeMs || 0;
            const isSkip = r.wasSkipped || !r.optionId;

            if (isCorrect) correctCount++;
            if (!isSkip && timeMs < 3000) rapidGuessingCount++;
            
            totalTime += timeMs;

            // Proxy for consistency: Answering correctly without rushing
            if (isCorrect && timeMs >= 3000 && timeMs <= 60000) {
                consistencyHits++;
            }
        });

        const totalQuestions = responses.length;
        const correctnessFactor = (correctCount / totalQuestions) * 100;
        
        // Time factor: Optimal time per question assumed ~30s. If average is good, high score.
        const avgTime = totalTime / totalQuestions;
        let timeFactor = 100;
        if (avgTime > 60000) timeFactor = 70; // Penalize taking too long
        if (avgTime < 5000) timeFactor = 50;  // Heavily penalize rushing overall

        // Consistency factor
        const consistencyFactor = (consistencyHits / totalQuestions) * 100;

        // Rapid guessing penalty: lose 10 points per rapid guess
        const rapidGuessingPenalty = Math.min(rapidGuessingCount * 10, 50);

        // Calculate new Confidence Score (0-100)
        // Formula weights: 40% Correctness, 20% Consistency, 20% Time Factor, 20% Previous Confidence
        let confidenceScore = 
            (correctnessFactor * 0.40) + 
            (consistencyFactor * 0.20) + 
            (timeFactor * 0.20) + 
            (previousConfidence * 0.20) - 
            rapidGuessingPenalty;

        // Bound between 0 and 100
        if (confidenceScore > 100) confidenceScore = 100;
        if (confidenceScore < 0) confidenceScore = 0;

        // Store confidence history
        await pool.execute(
            `INSERT INTO confidence_history 
             (user_id, test_id, confidence_score, correctness_factor, time_factor, consistency_factor, rapid_guessing_penalty) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, testId, confidenceScore, correctnessFactor, timeFactor, consistencyFactor, rapidGuessingPenalty]
        );

        // Update student profile directly (scale back to 0-10 or just store as is if needed, but keeping 0-10 for backward compatibility or using 0-100 as new standard)
        await pool.execute(
            `UPDATE student_profile SET confidence_score = ? WHERE user_id = ?`,
            [confidenceScore / 10, userId] // Storing back as 0-10 to maintain V3 compatibility
        );

        return {
            confidenceScore,
            correctnessFactor,
            timeFactor,
            consistencyFactor,
            rapidGuessingPenalty
        };
    } catch (error) {
        console.error("Error updating confidence estimation:", error);
        return null;
    }
};
