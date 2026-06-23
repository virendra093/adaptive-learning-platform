import pool from '../config/db.js';

/**
 * Module 8: Learning Goal Engine
 * Manages student learning goals and goal progress.
 */
export const updateGoalProgress = async (userId, selectedGoal = 'General Aptitude') => {
    try {
        // Fetch current mastery to calculate progress
        const [kRows] = await pool.execute(
            `SELECT AVG(mastery_score) as avg_mastery FROM knowledge_state WHERE user_id = ?`,
            [userId]
        );
        
        const avgMastery = kRows[0]?.avg_mastery || 0;
        
        // Progress heuristically based on goal
        let progressMultiplier = 1.0;
        switch(selectedGoal) {
            case 'GATE': progressMultiplier = 0.7; break; // Harder, progress is slower
            case 'CAT': progressMultiplier = 0.6; break;
            case 'Campus Placement': progressMultiplier = 1.0; break;
            case 'Government Exams': progressMultiplier = 0.8; break;
            default: progressMultiplier = 1.2; break; // General Aptitude
        }

        const progressPercentage = Math.min(avgMastery * progressMultiplier, 100);

        await pool.execute(
            `INSERT INTO goal_progress (user_id, selected_goal, progress_percentage)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                progress_percentage = VALUES(progress_percentage)`,
            [userId, selectedGoal, progressPercentage]
        );

        return { selectedGoal, progressPercentage };
    } catch (error) {
        console.error("Error updating goal progress:", error);
        return null;
    }
};

export const getUserGoal = async (userId) => {
    try {
        const [rows] = await pool.execute(
            `SELECT selected_goal FROM goal_progress WHERE user_id = ? ORDER BY updatedAt DESC LIMIT 1`,
            [userId]
        );
        return rows[0] ? rows[0].selected_goal : 'General Aptitude';
    } catch (error) {
        return 'General Aptitude';
    }
};
