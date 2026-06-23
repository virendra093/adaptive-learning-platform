import pool from '../config/db.js';
import { getAvailableTopicsBasedOnDependencies } from './topicDependencyService.js';
import { getUserGoal } from './learningGoalService.js';

/**
 * Module 10: Question Selection Engine V2
 * Uses Student Profile -> Learning Persona -> Interest -> Learning Goal -> Knowledge State -> Confidence -> Learning Trend
 * Targets exactly 15 Questions.
 */
export const generateAdaptiveTestQuestions = async (userId, targetCount = 15) => {
    try {
        // 1. Fetch comprehensive profiles
        const [profileRows] = await pool.execute(`SELECT * FROM student_profile WHERE user_id = ?`, [userId]);
        const profile = profileRows[0] || {};
        
        const goal = await getUserGoal(userId);
        
        const [interestRows] = await pool.execute(`SELECT * FROM student_interest WHERE user_id = ? ORDER BY last_updated DESC LIMIT 1`, [userId]);
        const interest = interestRows[0] || {};
        
        const [personaRows] = await pool.execute(`SELECT * FROM learning_persona WHERE user_id = ? ORDER BY generated_at DESC LIMIT 1`, [userId]);
        const persona = personaRows[0] || { persona: 'Adaptive Learner' };

        // 2. Predict Knowledge State Priorities
        const [knowledgeRows] = await pool.execute(
            `SELECT ks.topic_id, AVG(ks.mastery_score) as avg_mastery, t.domain_id 
             FROM knowledge_state ks
             JOIN topics t ON ks.topic_id = t.id
             WHERE ks.user_id = ? 
             GROUP BY ks.topic_id, t.domain_id
             ORDER BY avg_mastery ASC`,
            [userId]
        );

        let weakTopics = [], mediumTopics = [], strongTopics = [];
        
        if (knowledgeRows.length > 0) {
            // Prioritize topics belonging to preferred domain if available
            let sortedKnowledge = [...knowledgeRows];
            if (interest.preferred_domain_id) {
                sortedKnowledge.sort((a, b) => {
                    if (a.domain_id === interest.preferred_domain_id && b.domain_id !== interest.preferred_domain_id) return -1;
                    if (a.domain_id !== interest.preferred_domain_id && b.domain_id === interest.preferred_domain_id) return 1;
                    return a.avg_mastery - b.avg_mastery;
                });
            }

            const third = Math.floor(sortedKnowledge.length / 3);
            weakTopics = sortedKnowledge.slice(0, third || 1).map(r => r.topic_id);
            mediumTopics = sortedKnowledge.slice(third || 1, (third*2) || 2).map(r => r.topic_id);
            strongTopics = sortedKnowledge.slice((third*2) || 2).map(r => r.topic_id);
        } else {
            weakTopics = [1,2,3]; mediumTopics = [4,5,6]; strongTopics = [7,8];
        }

        // 3. Adjust Ratios based on Persona and Trend
        let weakRatio = 0.7;
        let mediumRatio = 0.2;
        let strongRatio = 0.1;

        if (persona.persona === 'Fast Learner' || profile.learning_trend === 'improving') {
            // Push harder questions
            weakRatio = 0.4; mediumRatio = 0.4; strongRatio = 0.2;
        } else if (persona.persona === 'Needs Reinforcement' || profile.learning_trend === 'declining') {
            // Build confidence
            weakRatio = 0.5; mediumRatio = 0.3; strongRatio = 0.2;
        }

        const countWeak = Math.max(1, Math.floor(targetCount * weakRatio));
        const countMedium = Math.max(1, Math.floor(targetCount * mediumRatio));
        let countStrong = targetCount - countWeak - countMedium;
        if (countStrong < 0) countStrong = 0;

        // 4. Topic Dependency Filtering
        const filteredWeakTopics = await getAvailableTopicsBasedOnDependencies(userId, weakTopics);
        const filteredMediumTopics = await getAvailableTopicsBasedOnDependencies(userId, mediumTopics);
        const filteredStrongTopics = await getAvailableTopicsBasedOnDependencies(userId, strongTopics);

        const allSelectedQuestions = [];
        
        // 5. Strict Execution Function
        const fetchQuestions = async (topicIds, limit, diffLevel) => {
            if (limit <= 0 || !topicIds || topicIds.length === 0) return [];
            const placeholders = topicIds.map(() => '?').join(',');
            
            // Adjust difficulty based on goal and persona
            let diffCondition = "1=1";
            if (diffLevel === 'weak' && goal === 'GATE') diffCondition = "q.difficulty_id >= 2"; // Push harder
            if (diffLevel === 'strong') diffCondition = "q.difficulty_id >= 2"; // Strong topics get hard questions
            
            const [qRows] = await pool.execute(
                `SELECT q.id, q.text, q.difficulty, q.domain_id, q.topic_id, q.difficulty_id, 
                        q.estimated_solving_time, q.hint, q.detailed_explanation as explanation 
                 FROM questions q
                 WHERE q.topic_id IN (${placeholders})
                 AND ${diffCondition}
                 AND q.id NOT IN (
                     SELECT question_id FROM question_history WHERE user_id = ?
                 )
                 ORDER BY RAND() LIMIT ${parseInt(limit)}`,
                [...topicIds, userId]
            );
            return qRows;
        };

        const weakQ = await fetchQuestions(filteredWeakTopics.length ? filteredWeakTopics : [1,2,3], countWeak, 'weak');
        const mediumQ = await fetchQuestions(filteredMediumTopics.length ? filteredMediumTopics : [4,5,6], countMedium, 'medium');
        const strongQ = await fetchQuestions(filteredStrongTopics.length ? filteredStrongTopics : [7,8], countStrong, 'strong');

        allSelectedQuestions.push(...weakQ, ...mediumQ, ...strongQ);

        // 6. Fill deficit to exactly 15
        if (allSelectedQuestions.length < targetCount) {
            const deficit = targetCount - allSelectedQuestions.length;
            const existingIds = allSelectedQuestions.map(q => q.id);
            const excludeCondition = existingIds.length > 0 ? `AND q.id NOT IN (${existingIds.join(',')})` : '';

            const [fallbackQ] = await pool.execute(
                `SELECT q.id, q.text, q.difficulty, q.domain_id, q.topic_id, q.difficulty_id, 
                        q.estimated_solving_time, q.hint, q.detailed_explanation as explanation 
                 FROM questions q
                 WHERE q.id NOT IN (
                     SELECT question_id FROM question_history WHERE user_id = ?
                 )
                 ${excludeCondition}
                 ORDER BY RAND() LIMIT ${parseInt(deficit)}`,
                [userId]
            );
            allSelectedQuestions.push(...fallbackQ);
        }

        // Sort to maintain gradual difficulty progression (Easy -> Medium -> Hard)
        allSelectedQuestions.sort((a, b) => a.difficulty_id - b.difficulty_id);

        return {
            questions: allSelectedQuestions.slice(0, targetCount),
            targetTopics: { weak: weakTopics, medium: mediumTopics, strong: strongTopics }
        };
    } catch (error) {
        console.error("Error generating adaptive test V2:", error);
        throw error;
    }
};

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
