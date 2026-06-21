import pool from '../config/db.js';

/**
 * Advanced RL-inspired Reward Engine (V3.0)
 * Evaluates behavioral states and dictates difficulty progression policies.
 */
export const calculateRewardAndUpdatePolicy = async (
    userId, isCorrect, responseTimeMs, expectedTimeMs = 30000, 
    wasSkipped = false, difficultyId = 1, consistencyScore = 1.0, behaviorScore = 1.0
) => {
    try {
        let reward = 0.0;
        const diffMultiplier = difficultyId === 3 ? 1.5 : (difficultyId === 1 ? 0.8 : 1.0);

        // Continuous Reward Function (RL Policy Equation)
        if (wasSkipped) {
            reward = -8.0; 
        } else if (isCorrect) {
            reward = 10.0 * diffMultiplier;
            // Time bonus for efficiency
            const timeRatio = responseTimeMs / expectedTimeMs;
            if (timeRatio < 0.8 && timeRatio > 0.2) { // Exclude rapid guessing
                reward += (1.0 - timeRatio) * 5.0; 
            }
        } else {
            reward = -5.0 * diffMultiplier;
            const timeRatio = responseTimeMs / expectedTimeMs;
            if (timeRatio < 0.2) {
                reward -= 5.0; // Heavy penalty for rapid guessing (carelessness)
            } else if (timeRatio > 1.2) {
                reward += 2.0; // Mitigation for trying hard but failing (persistence)
            }
        }

        // Apply global behavior & consistency modifiers
        reward *= consistencyScore;
        reward *= behaviorScore;

        const [rows] = await pool.execute(
            `SELECT total_reward, current_difficulty_multiplier FROM adaptive_rewards WHERE user_id = ?`,
            [userId]
        );

        let totalReward = reward;
        let diffMult = 1.0;

        if (rows.length > 0) {
            totalReward = parseFloat(rows[0].total_reward) + reward;
            diffMult = parseFloat(rows[0].current_difficulty_multiplier);
            
            await pool.execute(
                `UPDATE adaptive_rewards 
                 SET total_reward = ?, last_reward_granted = ?, current_difficulty_multiplier = ? 
                 WHERE user_id = ?`,
                [totalReward, reward, diffMult, userId]
            );
        } else {
            await pool.execute(
                `INSERT INTO adaptive_rewards (user_id, total_reward, last_reward_granted, current_difficulty_multiplier) 
                 VALUES (?, ?, ?, ?)`,
                [userId, totalReward, reward, diffMult]
            );
        }

        return { reward, totalReward };
    } catch (error) {
        console.error("Error calculating reward:", error);
        throw error;
    }
};

/**
 * Advanced Policy Decision
 * Decides exactly how to generate the next test based on the RL state vector.
 */
export const determineDifficultyAdjustment = async (userId) => {
    try {
        const [rows] = await pool.execute(
            `SELECT total_reward FROM adaptive_rewards WHERE user_id = ?`,
            [userId]
        );
        
        if (rows.length === 0) return 'maintain';
        const total = parseFloat(rows[0].total_reward);

        // V3 Thresholds for difficulty
        if (total > 80.0) {
            return 'increase';
        } else if (total < -30.0) {
            return 'decrease';
        }
        return 'maintain';
    } catch (error) {
        console.error("Error determining difficulty adjustment:", error);
        return 'maintain';
    }
};
