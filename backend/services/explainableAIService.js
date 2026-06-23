import pool from '../config/db.js';

/**
 * Module 7: Explainable AI Engine
 * Generates dynamic, natural language explanations for why a recommendation was made.
 */
export const generateExplanation = async (userId, testId, nextDifficulty, targetTopics) => {
    try {
        let explanationText = "";

        // 1. Fetch recent test performance
        const [testRows] = await pool.execute(
            `SELECT COUNT(*) as total, 
                    SUM(is_correct) as correct, 
                    AVG(response_time_ms) as avg_time 
             FROM responses 
             WHERE test_id = ?`,
            [testId]
        );
        const testStats = testRows[0];
        
        // Find most failed topic in recent test
        const [topicRows] = await pool.execute(
            `SELECT t.name as topic_name, COUNT(*) as t_total, SUM(r.is_correct) as t_correct
             FROM responses r
             JOIN questions q ON r.question_id = q.id
             JOIN topics t ON q.topic_id = t.id
             WHERE r.test_id = ?
             GROUP BY t.name
             ORDER BY (SUM(r.is_correct)/COUNT(*)) ASC
             LIMIT 1`,
            [testId]
        );

        let weakTopicText = "";
        let weakTopicName = targetTopics?.weak?.[0] ? `Topic ${targetTopics.weak[0]}` : "Mixed Topics";
        
        if (topicRows.length > 0) {
            const topic = topicRows[0];
            weakTopicName = topic.topic_name;
            weakTopicText = `You answered only ${topic.t_correct} out of ${topic.t_total} ${topic.topic_name} questions correctly. `;
        } else {
            weakTopicText = `You answered ${testStats.correct} out of ${testStats.total} questions correctly overall. `;
        }

        const avgTimeSeconds = Math.round((testStats.avg_time || 0) / 1000);
        const expectedTime = 30; // Assuming 30s is our standard
        
        let timeText = `Average solving time was ${avgTimeSeconds} seconds `;
        if (avgTimeSeconds > expectedTime) {
            timeText += `while the expected time was ${expectedTime} seconds. `;
        } else {
            timeText += `which is faster than the expected ${expectedTime} seconds. `;
        }

        // 2. Fetch Knowledge and Confidence Scores
        const [profileRows] = await pool.execute(
            `SELECT knowledge_score, confidence_score FROM student_profile WHERE user_id = ?`,
            [userId]
        );
        const profile = profileRows[0] || { knowledge_score: 0, confidence_score: 5 };
        const knowledgePercent = Math.round(profile.knowledge_score);
        const confidencePercent = Math.round(profile.confidence_score * 10); // if stored as 0-10

        const scoreText = `Knowledge Score is ${knowledgePercent}%. Confidence Score is ${confidencePercent}%. `;

        // 3. Compile recommendation string
        const recommendationText = `\nRecommendation: Practice ${weakTopicName}. Suggested Difficulty: ${nextDifficulty.charAt(0).toUpperCase() + nextDifficulty.slice(1)}. `;
        
        // Calculate estimated improvement heuristically based on distance to 100
        const estimatedImprovement = Math.round((100 - knowledgePercent) * 0.15);
        const improvementText = `Estimated Improvement: ${estimatedImprovement}%.`;

        explanationText = weakTopicText + timeText + scoreText + recommendationText + improvementText;

        return explanationText;
    } catch (error) {
        console.error("Error generating AI explanation:", error);
        return "Recommendation generated based on adaptive parameters.";
    }
};
