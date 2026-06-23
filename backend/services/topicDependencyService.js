import pool from '../config/db.js';

/**
 * Module 6: Topic Dependency Graph Engine
 * Ensures prerequisite topics are mastered before recommending advanced topics.
 */
export const getAvailableTopicsBasedOnDependencies = async (userId, targetTopics) => {
    try {
        if (!targetTopics || targetTopics.length === 0) return targetTopics;

        const placeholders = targetTopics.map(() => '?').join(',');

        // Fetch dependencies for the requested topics
        const [dependencies] = await pool.execute(
            `SELECT topic_id, prerequisite_topic_id, min_mastery_required 
             FROM topic_dependency 
             WHERE topic_id IN (${placeholders})`,
            [...targetTopics]
        );

        if (dependencies.length === 0) {
            return targetTopics; // No dependencies to check
        }

        // Fetch user's current mastery for all relevant prerequisite topics
        const prereqIds = [...new Set(dependencies.map(d => d.prerequisite_topic_id))];
        const pPlaceholders = prereqIds.map(() => '?').join(',');

        let masteryMap = {};
        if (prereqIds.length > 0) {
            const [masteryRows] = await pool.execute(
                `SELECT topic_id, mastery_score 
                 FROM knowledge_state 
                 WHERE user_id = ? AND topic_id IN (${pPlaceholders})`,
                [userId, ...prereqIds]
            );
            
            masteryRows.forEach(row => {
                masteryMap[row.topic_id] = row.mastery_score;
            });
        }

        // Filter out target topics whose prerequisites are NOT met
        const validTopics = targetTopics.filter(topicId => {
            // Find all prerequisites for this specific topic
            const topicDeps = dependencies.filter(d => d.topic_id === topicId);
            
            // If any prerequisite is not met, filter out this topic
            for (const dep of topicDeps) {
                const currentMastery = masteryMap[dep.prerequisite_topic_id] || 0.0;
                if (currentMastery < dep.min_mastery_required) {
                    return false; // Prerequisite not met
                }
            }
            return true; // All prerequisites met
        });

        // If strict filtering removes all topics, return original (or fallback) to avoid empty tests
        if (validTopics.length === 0) {
            console.warn(`All target topics filtered out due to dependencies. Reverting to base topics.`);
            return targetTopics; 
        }

        return validTopics;
    } catch (error) {
        console.error("Error evaluating topic dependencies:", error);
        return targetTopics; // Fail open
    }
};
