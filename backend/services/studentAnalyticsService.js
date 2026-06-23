import pool from '../config/db.js';

export const getStudentDashboardMetrics = async (userId) => {
    try {
        // 1. Fetch Profile
        const [profileRows] = await pool.execute(
            `SELECT * FROM student_profile WHERE user_id = ?`,
            [userId]
        );
        let profile = profileRows[0] || {};

        if (!profile.general_assessment_completed) {
            return { profile };
        }

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

        // 6. Fetch Latest Behavior Metrics (V3)
        const [behaviorRows] = await pool.execute(
            `SELECT * FROM behavior_metrics WHERE user_id = ? ORDER BY createdAt DESC LIMIT 1`,
            [userId]
        );
        const behavior = behaviorRows[0] || { attention_score: 1.0, persistence_score: 1.0, learning_discipline: 1.0 };

        // 7. V4 Metrics
        const [personaRows] = await pool.execute(`SELECT * FROM learning_persona WHERE user_id = ? ORDER BY generated_at DESC LIMIT 1`, [userId]);
        const [interestRows] = await pool.execute(
            `SELECT si.*, d.name as domain_name, t.name as topic_name 
             FROM student_interest si
             LEFT JOIN domains d ON si.preferred_domain_id = d.id
             LEFT JOIN topics t ON si.preferred_topic_id = t.id
             WHERE si.user_id = ? ORDER BY si.last_updated DESC LIMIT 1`, [userId]
        );
        const [confidenceRows] = await pool.execute(`SELECT * FROM confidence_history WHERE user_id = ? ORDER BY calculated_at DESC LIMIT 10`, [userId]);
        const [goalRows] = await pool.execute(`SELECT * FROM goal_progress WHERE user_id = ? ORDER BY updatedAt DESC LIMIT 1`, [userId]);
        const [pathRows] = await pool.execute(`SELECT * FROM learning_path WHERE user_id = ? ORDER BY generated_at DESC LIMIT 1`, [userId]);

        const persona = personaRows[0] || null;
        const interest = interestRows[0] || null;
        const confidenceHistory = confidenceRows.reverse(); // oldest to newest
        const goalProgress = goalRows[0] || null;
        const learningPath = pathRows[0] ? JSON.parse(pathRows[0].roadmap_json) : null;
        const estimatedImprovement = pathRows[0]?.estimated_improvement || 0;

        return {
            profile,
            radarData: radarRows,
            progressData: progressRows,
            rewardScore,
            strongTopics,
            weakTopics,
            nextRecommended,
            behavior,
            persona,
            interest,
            confidenceHistory,
            goalProgress,
            learningPath,
            estimatedImprovement
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
