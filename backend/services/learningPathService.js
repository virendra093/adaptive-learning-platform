import pool from '../config/db.js';
import { getUserGoal } from './learningGoalService.js';

/**
 * Module 4: Learning Path Engine
 * Generates an intelligent Learning Roadmap based on Knowledge State and Goal.
 */
export const updateLearningPath = async (userId) => {
    try {
        // 1. Fetch user goal
        let goal = await getUserGoal(userId);
        
        // 2. Fetch Knowledge State to identify weak areas
        const [kRows] = await pool.execute(
            `SELECT t.id as topic_id, t.name as topic_name, ks.mastery_score, d.name as domain_name 
             FROM knowledge_state ks
             JOIN topics t ON ks.topic_id = t.id
             JOIN domains d ON t.domain_id = d.id
             WHERE ks.user_id = ?
             ORDER BY ks.mastery_score ASC`,
            [userId]
        );

        let topicsToLearn = [];
        if (kRows.length > 0) {
            topicsToLearn = kRows.filter(r => r.mastery_score < 70); // Anything below 70% needs practice
        } else {
            // Fallback: Default topic order
            const [allTopics] = await pool.execute(`SELECT id as topic_id, name as topic_name FROM topics LIMIT 10`);
            topicsToLearn = allTopics.map(t => ({ ...t, mastery_score: 0 }));
        }

        // 3. Generate Roadmap
        const roadmap = [];
        let weekCounter = 1;
        let estimatedTotalImprovement = 0;

        // Group topics into weeks (2 topics per week)
        for (let i = 0; i < topicsToLearn.length; i += 2) {
            const weekTopics = topicsToLearn.slice(i, i + 2);
            
            const weekPlan = {
                week: `Week ${weekCounter}`,
                topics: weekTopics.map(t => t.topic_name),
                subtopics: weekTopics.map(t => `Advanced ${t.topic_name} Problems`),
                recommended_difficulty: weekTopics[0].mastery_score < 30 ? 'Easy' : 'Medium',
                estimated_completion_time: `${weekTopics.length * 2} hours`,
                practice_order: weekTopics.map((t, index) => `${index + 1}. ${t.topic_name}`),
                expected_improvement: `+${Math.floor((100 - weekTopics[0].mastery_score) * 0.2)}%`
            };

            estimatedTotalImprovement += parseFloat(weekPlan.expected_improvement.replace(/\D/g, ''));
            roadmap.push(weekPlan);
            weekCounter++;

            if (weekCounter > 4) break; // Keep roadmap to 4 weeks maximum
        }

        const roadmapJson = JSON.stringify(roadmap);

        // 4. Store in learning_path
        await pool.execute(
            `INSERT INTO learning_path (user_id, goal, roadmap_json, estimated_improvement)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                goal = VALUES(goal),
                roadmap_json = VALUES(roadmap_json),
                estimated_improvement = VALUES(estimated_improvement)`,
            [userId, goal, roadmapJson, estimatedTotalImprovement]
        );

        return { roadmap, estimatedTotalImprovement, goal };

    } catch (error) {
        console.error("Error updating learning path:", error);
        return null;
    }
};
