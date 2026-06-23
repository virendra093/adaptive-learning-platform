import pool from '../config/db.js';

/**
 * Module 1: Learning Persona Engine
 * Classifies every student according to their learning behaviour.
 */
export const updateLearningPersona = async (userId) => {
    try {
        // Fetch necessary data from student_profile
        const [profileRows] = await pool.execute(
            `SELECT overall_accuracy, average_response_time, knowledge_score, behavior_score, confidence_score, learning_trend 
             FROM student_profile WHERE user_id = ?`,
            [userId]
        );

        if (profileRows.length === 0) return null;
        const profile = profileRows[0];

        // Fetch behavior metrics average
        const [behaviorRows] = await pool.execute(
            `SELECT AVG(question_skip_rate) as avg_skip_rate, 
                    SUM(rapid_guessing_count) as total_rapid_guessing,
                    AVG(attention_score) as avg_attention,
                    AVG(persistence_score) as avg_persistence
             FROM behavior_metrics WHERE user_id = ?`,
            [userId]
        );

        const behavior = behaviorRows[0] || {
            avg_skip_rate: 0,
            total_rapid_guessing: 0,
            avg_attention: 1,
            avg_persistence: 1
        };

        // Fetch adaptive rewards
        const [rewardRows] = await pool.execute(
            `SELECT total_reward FROM adaptive_rewards WHERE user_id = ?`,
            [userId]
        );
        const reward = rewardRows[0] ? rewardRows[0].total_reward : 0;

        let persona = 'Adaptive Learner';
        let confidence = (profile.confidence_score || 0) * 10; // Convert to 0-100 scale
        if (confidence > 100) confidence = 100;
        let reason = 'Balanced learning approach with adaptive strategies.';

        // Classification Logic Sequence (Priority based)
        if (profile.overall_accuracy > 80 && profile.average_response_time < 30000 && profile.learning_trend === 'improving') {
            persona = 'Fast Learner';
            reason = 'High accuracy with quick response times and positive improvement trend.';
        } else if (behavior.total_rapid_guessing > 15 && profile.overall_accuracy < 50) {
            persona = 'Fast Guesser';
            reason = 'High rapid guessing count resulting in lower accuracy.';
        } else if (profile.overall_accuracy > 85 && behavior.avg_persistence > 0.8 && profile.average_response_time > 30000) {
            persona = 'Careful Learner';
            reason = 'Takes time to answer but maintains high accuracy and persistence.';
        } else if (profile.knowledge_score < 40 && reward < -20) {
            persona = 'Needs Reinforcement';
            reason = 'Low knowledge score and multiple reward penalties indicate fundamental gaps.';
        } else if (profile.overall_accuracy < 50 && profile.average_response_time > 45000) {
            persona = 'Slow Learner';
            reason = 'Spends significant time per question but struggles with accuracy.';
        } else if (behavior.avg_skip_rate > 0.3 && behavior.total_rapid_guessing < 5) {
            persona = 'Explorer';
            reason = 'Skips questions frequently to browse the test rather than guessing.';
        } else if (behavior.avg_attention > 0.9 && behavior.avg_skip_rate < 0.1 && profile.overall_accuracy > 70) {
            persona = 'Focused Learner';
            reason = 'Rarely skips and maintains high attention throughout the test.';
        } else if (profile.learning_trend === 'improving') {
            persona = 'Improving Learner';
            reason = 'Consistent positive trajectory over recent tests.';
        } else if (profile.learning_trend === 'stable' && profile.overall_accuracy > 60) {
            persona = 'Consistent Learner';
            reason = 'Maintains steady accuracy without major fluctuations.';
        }

        // Insert the new persona classification into the database
        await pool.execute(
            `INSERT INTO learning_persona (user_id, persona, confidence, reason) 
             VALUES (?, ?, ?, ?)`,
            [userId, persona, confidence, reason]
        );

        return { persona, confidence, reason };
    } catch (error) {
        console.error("Error updating learning persona:", error);
        return null;
    }
};
