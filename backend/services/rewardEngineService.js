import pool from '../config/db.js';

/**
 * Lightweight RL-inspired reward engine.
 * Calculates rewards based on a rule-based policy.
 */
export const calculateRewardAndUpdatePolicy = async (userId, isCorrect, responseTimeMs, expectedTimeMs = 30000, wasSkipped = false) => {
    try {
        let reward = 0.0;

        // 1. Reward Function (Rule-based RL Policy)
        if (wasSkipped) {
            reward = -5.0; // Penalty
        } else if (isCorrect) {
            if (responseTimeMs <= expectedTimeMs) {
                reward = 10.0; // Correct + Fast -> Positive Reward
            } else {
                reward = 3.0; // Correct + Slow -> Small Reward
            }
        } else {
            if (responseTimeMs <= expectedTimeMs * 0.3) {
                reward = -8.0; // Wrong + Fast (Guessing/Careless) -> Large Penalty
            } else {
                reward = -3.0; // Wrong + Slow -> Standard Penalty
            }
        }

        // 2. Fetch and Update accumulated rewards
        const [rows] = await pool.execute(
            `SELECT total_reward, current_difficulty_multiplier FROM adaptive_rewards WHERE user_id = ?`,
            [userId]
        );

        let totalReward = reward;
        let difficultyMultiplier = 1.0;

        if (rows.length > 0) {
            totalReward = parseFloat(rows[0].total_reward) + reward;
            difficultyMultiplier = parseFloat(rows[0].current_difficulty_multiplier);
            
            await pool.execute(
                `UPDATE adaptive_rewards 
                 SET total_reward = ?, last_reward_granted = ?, current_difficulty_multiplier = ? 
                 WHERE user_id = ?`,
                [totalReward, reward, difficultyMultiplier, userId]
            );
        } else {
            await pool.execute(
                `INSERT INTO adaptive_rewards (user_id, total_reward, last_reward_granted, current_difficulty_multiplier) 
                 VALUES (?, ?, ?, ?)`,
                [userId, totalReward, reward, difficultyMultiplier]
            );
        }

        return { reward, totalReward };
    } catch (error) {
        console.error("Error calculating reward:", error);
        throw error;
    }
};

/**
 * Determine difficulty adjustment (Increase, Maintain, Decrease)
 * based on the recent rolling sum of rewards (or simply latest reward batch for a test).
 */
export const determineDifficultyAdjustment = async (userId) => {
    try {
        const [rows] = await pool.execute(
            `SELECT total_reward FROM adaptive_rewards WHERE user_id = ?`,
            [userId]
        );
        
        if (rows.length === 0) return 'maintain';
        const total = parseFloat(rows[0].total_reward);

        // Simple policy logic based on aggregate reward score
        // (In a real RL scenario, this would be Q-learning, here it's rule-based thresholds)
        if (total > 50.0) {
            return 'increase';
        } else if (total < -20.0) {
            return 'decrease';
        }
        return 'maintain';
    } catch (error) {
        console.error("Error determining difficulty adjustment:", error);
        return 'maintain';
    }
};
