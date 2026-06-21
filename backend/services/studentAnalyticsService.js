import pool from '../config/db.js';

export const getStudentDashboardMetrics = async (userId) => {
    try {
        // 1. Fetch Profile
        const [profileRows] = await pool.execute(
            `SELECT * FROM student_profile WHERE user_id = ?`,
            [userId]
        );
        let profile = profileRows[0] || {};

        // 2. Fetch Knowledge Radar Data (Domain Mastery)
        const [radarRows] = await pool.execute(
            `SELECT d.name as domain, AVG(k.mastery_score) as mastery
             FROM knowledge_state k
             JOIN domains d ON k.domain_id = d.id
             WHERE k.user_id = ?
             GROUP BY d.id`,
            [userId]
        );

        // 3. Fetch Knowledge Graph Data (Over time)
        const [progressRows] = await pool.execute(
            `SELECT snapshot_date as date, knowledge_score, accuracy 
             FROM learning_progress 
             WHERE user_id = ? 
             ORDER BY snapshot_date ASC 
             LIMIT 30`,
            [userId]
        );

        // 4. Fetch Reward Score
        const [rewardRows] = await pool.execute(
            `SELECT total_reward FROM adaptive_rewards WHERE user_id = ?`,
            [userId]
        );
        const rewardScore = rewardRows[0]?.total_reward || 0;

        // 5. Fetch Weak/Strong Topics from DB based on Mastery
        const [topicsRows] = await pool.execute(
            `SELECT t.name as topic, AVG(k.mastery_score) as mastery
             FROM knowledge_state k
             JOIN topics t ON k.topic_id = t.id
             WHERE k.user_id = ?
             GROUP BY t.id
             ORDER BY mastery DESC`,
            [userId]
        );

        const strongTopics = topicsRows.filter(t => t.mastery > 70).map(t => t.topic);
        const weakTopics = topicsRows.filter(t => t.mastery < 50).map(t => t.topic);
        
        // Next recommended topics -> Weakest topics
        const nextRecommended = [...weakTopics].slice(0, 3);

        return {
            profile,
            radarData: radarRows,
            progressData: progressRows,
            rewardScore,
            strongTopics,
            weakTopics,
            nextRecommended
        };

    } catch (error) {
        console.error("Error fetching analytics:", error);
        throw error;
    }
};

/**
 * Utility to snapshot progress daily
 */
export const snapshotLearningProgress = async (userId) => {
    try {
        const [profileRows] = await pool.execute(
            `SELECT knowledge_score, overall_accuracy FROM student_profile WHERE user_id = ?`,
            [userId]
        );
        
        if (profileRows.length > 0) {
            const today = new Date().toISOString().split('T')[0];
            await pool.execute(
                `INSERT INTO learning_progress (user_id, snapshot_date, knowledge_score, accuracy)
                 VALUES (?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE knowledge_score = ?, accuracy = ?`,
                [userId, today, profileRows[0].knowledge_score, profileRows[0].overall_accuracy, 
                 profileRows[0].knowledge_score, profileRows[0].overall_accuracy]
            );
        }
    } catch (error) {
        console.error("Error saving progress snapshot:", error);
    }
};
