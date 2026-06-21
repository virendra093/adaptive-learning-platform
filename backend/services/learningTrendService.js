import pool from '../config/db.js';

/**
 * Advanced Learning Trend Engine (Phase 5)
 * Analyzes the last 5-10 tests to classify the student's continuous learning trajectory.
 */
export const analyzeLearningTrend = async (userId) => {
    try {
        // Fetch the last 5 snapshots from learning_progress
        const [rows] = await pool.execute(
            `SELECT knowledge_score, accuracy, snapshot_date 
             FROM learning_progress 
             WHERE user_id = ? 
             ORDER BY snapshot_date DESC LIMIT 5`,
            [userId]
        );

        if (rows.length < 2) return; // Need at least 2 points for a trend

        // Reverse to get chronological order (oldest first)
        const history = rows.reverse();

        let deltaMastery = 0;
        let deltaAccuracy = 0;

        for (let i = 1; i < history.length; i++) {
            deltaMastery += (history[i].knowledge_score - history[i - 1].knowledge_score);
            deltaAccuracy += (history[i].accuracy - history[i - 1].accuracy);
        }

        const avgMasteryDelta = deltaMastery / (history.length - 1);
        const avgAccuracyDelta = deltaAccuracy / (history.length - 1);

        let trend = 'stable';
        
        // Advanced classification matrix
        if (avgMasteryDelta > 5.0 && avgAccuracyDelta > 0.05) {
            trend = 'fast_learner';
        } else if (avgMasteryDelta > 1.0) {
            trend = 'improving';
        } else if (avgMasteryDelta < -3.0 || avgAccuracyDelta < -0.05) {
            trend = 'declining';
        } else if (avgMasteryDelta < -1.0 && avgMasteryDelta >= -3.0) {
            trend = 'slow_learner';
        }

        const today = new Date().toISOString().split('T')[0];

        // Store evaluation in learning_trend
        await pool.execute(
            `INSERT INTO learning_trend (user_id, evaluation_date, trend_classification, mastery_delta, test_count_period)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, today, trend, avgMasteryDelta, history.length]
        );

        // Update Student Profile
        await pool.execute(
            `UPDATE student_profile 
             SET learning_trend = ?, growth_rate = ? 
             WHERE user_id = ?`,
            [trend, avgMasteryDelta, userId]
        );

        return trend;
    } catch (error) {
        console.error("Error analyzing learning trend:", error);
    }
};
