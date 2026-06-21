import pool from '../config/db.js';

/**
 * Adaptive Engine logic for generating next test.
 * Priority: 70% Weak Topics, 20% Medium Topics, 10% Strong Topics.
 */
export const generateAdaptiveTestQuestions = async (userId, targetCount = 20) => {
    try {
        // 1. Fetch user's knowledge state
        const [knowledgeRows] = await pool.execute(
            `SELECT topic_id, AVG(mastery_score) as avg_mastery 
             FROM knowledge_state 
             WHERE user_id = ? 
             GROUP BY topic_id
             ORDER BY avg_mastery ASC`,
            [userId]
        );

        let weakTopics = [], mediumTopics = [], strongTopics = [];
        
        if (knowledgeRows.length > 0) {
            // Divide into thirds for simplicity
            const third = Math.floor(knowledgeRows.length / 3);
            weakTopics = knowledgeRows.slice(0, third || 1).map(r => r.topic_id);
            mediumTopics = knowledgeRows.slice(third || 1, (third*2) || 2).map(r => r.topic_id);
            strongTopics = knowledgeRows.slice((third*2) || 2).map(r => r.topic_id);
        } else {
            // Default fallback if no history
            weakTopics = [1,2,3]; mediumTopics = [4,5,6]; strongTopics = [7,8];
        }

        const countWeak = Math.floor(targetCount * 0.7);
        const countMedium = Math.floor(targetCount * 0.2);
        const countStrong = targetCount - countWeak - countMedium;

        const allSelectedQuestions = [];
        
        // 2. Helper to fetch questions
        const fetchQuestions = async (topicIds, limit) => {
            if (limit <= 0 || !topicIds || topicIds.length === 0) return [];
            const placeholders = topicIds.map(() => '?').join(',');
            // Exclude previously attempted questions for this user
            const [qRows] = await pool.execute(
                `SELECT q.id, q.text, q.difficulty, q.domain_id, q.topic_id, q.difficulty_id, q.estimated_solving_time 
                 FROM questions q
                 WHERE q.topic_id IN (${placeholders})
                 AND q.id NOT IN (
                     SELECT question_id FROM question_history WHERE user_id = ?
                 )
                 ORDER BY RAND() LIMIT ${parseInt(limit)}`,
                [...topicIds, userId]
            );
            return qRows;
        };

        const weakQ = await fetchQuestions(weakTopics.length ? weakTopics : [1,2,3], countWeak);
        const mediumQ = await fetchQuestions(mediumTopics.length ? mediumTopics : [4,5,6], countMedium);
        const strongQ = await fetchQuestions(strongTopics.length ? strongTopics : [7,8], countStrong);

        allSelectedQuestions.push(...weakQ, ...mediumQ, ...strongQ);

        // Fallback: If not enough questions found (e.g. user exhausted them), pull any unused questions
        if (allSelectedQuestions.length < targetCount) {
            const deficit = targetCount - allSelectedQuestions.length;
            const [fallbackQ] = await pool.execute(
                `SELECT q.id, q.text, q.difficulty, q.domain_id, q.topic_id, q.difficulty_id, q.estimated_solving_time 
                 FROM questions q
                 WHERE q.id NOT IN (
                     SELECT question_id FROM question_history WHERE user_id = ?
                 )
                 ORDER BY RAND() LIMIT ${parseInt(deficit)}`,
                [userId]
            );
            allSelectedQuestions.push(...fallbackQ);
        }

        return {
            questions: allSelectedQuestions,
            targetTopics: { weak: weakTopics, medium: mediumTopics, strong: strongTopics }
        };
    } catch (error) {
        console.error("Error generating adaptive test:", error);
        throw error;
    }
};

/**
 * Record test generation in adaptive_history
 */
export const recordAdaptiveHistory = async (userId, testId, targetTopics, averageTargetDifficulty) => {
    try {
        await pool.execute(
            `INSERT INTO adaptive_history (test_id, user_id, target_weak_topics, target_medium_topics, target_strong_topics, average_target_difficulty)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [testId, userId, JSON.stringify(targetTopics.weak), JSON.stringify(targetTopics.medium), JSON.stringify(targetTopics.strong), averageTargetDifficulty]
        );
    } catch (error) {
        console.error("Error recording adaptive history:", error);
    }
};
