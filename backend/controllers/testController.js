import { createTest, submitResponse, completeTest, calculateTestStats, saveResult, saveRecommendation, getDashboardStats } from '../models/Test.js';
import { updateKnowledgeState } from '../services/knowledgeTrackingService.js';
import { calculateRewardAndUpdatePolicy, determineDifficultyAdjustment } from '../services/rewardEngineService.js';
import { generateAdaptiveTestQuestions, recordAdaptiveHistory } from '../services/adaptiveEngineService.js';
import { getStudentDashboardMetrics, snapshotLearningProgress } from '../services/studentAnalyticsService.js';
import { analyzeTestBehavior, updateQuestionStatistics } from '../services/behaviorAnalysisService.js';
import { analyzeLearningTrend } from '../services/learningTrendService.js';
import { getQuestionOptions } from '../models/Question.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import pool from '../config/db.js';

export const startTest = async (req, res, next) => {
  const { testType } = req.body;
  try {
    const testId = await createTest(req.user.id, testType || 'general');
    res.status(201).json(new ApiResponse(201, { testId }, 'Test started'));
  } catch (error) {
    next(error);
  }
};

// Generate 20 questions for General Test
export const generateGeneralTest = async (req, res, next) => {
  try {
    // Balanced distribution
    const [questions] = await pool.execute(`
        (SELECT * FROM questions WHERE domain_id = 1 AND id NOT IN (SELECT question_id FROM question_history WHERE user_id = ?) ORDER BY RAND() LIMIT 7)
        UNION ALL
        (SELECT * FROM questions WHERE domain_id = 2 AND id NOT IN (SELECT question_id FROM question_history WHERE user_id = ?) ORDER BY RAND() LIMIT 7)
        UNION ALL
        (SELECT * FROM questions WHERE domain_id = 3 AND id NOT IN (SELECT question_id FROM question_history WHERE user_id = ?) ORDER BY RAND() LIMIT 6)
    `, [req.user.id, req.user.id, req.user.id]);
    
    for (let q of questions) {
      q.options = await getQuestionOptions(q.id);
    }
    res.json(new ApiResponse(200, questions, "General test questions fetched"));
  } catch (error) {
    next(error);
  }
};

// Generate 15-20 questions for Adaptive Test based on Knowledge Profile
export const generateAdaptiveTest = async (req, res, next) => {
  try {
    const targetCount = 20;
    const { questions, targetTopics } = await generateAdaptiveTestQuestions(req.user.id, targetCount);
    
    for (let q of questions) {
      q.options = await getQuestionOptions(q.id);
    }
    
    res.json(new ApiResponse(200, questions, "Adaptive test questions generated"));
  } catch (error) {
    next(error);
  }
};

export const evaluateAdaptive = async (req, res, next) => {
  const { accuracy, avgResponseTimeMs, wrongAnswers, skippedQuestions } = req.body;
  try {
    const nextDifficulty = await determineDifficultyAdjustment(req.user.id);
    let diffStr = nextDifficulty === 'increase' ? 'hard' : (nextDifficulty === 'decrease' ? 'easy' : 'medium');
    res.json(new ApiResponse(200, { nextDifficulty: diffStr, explanation: "Adjusting based on RL reward policy" }, 'Adaptive evaluation complete'));
  } catch (error) {
    next(error);
  }
};

export const submitTest = async (req, res, next) => {
  const { testId, responses } = req.body;
  const userId = req.user.id;

  try {
    // We will process each response sequentially to simulate "updating mastery after every question"
    for (const response of responses) {
      const isSkip = !response.optionId;
      const wasSkipped = isSkip || response.wasSkipped;
      
      // Submit response to original tables
      if (!isSkip) {
         await submitResponse(testId, response.questionId, response.optionId, response.responseTimeMs, response.isCorrect);
      }

      // Fetch question metadata
      const [qRows] = await pool.execute(
          `SELECT domain_id, topic_id, difficulty_id, estimated_solving_time FROM questions WHERE id = ?`,
          [response.questionId]
      );
      if (qRows.length > 0) {
          const q = qRows[0];
          
          // 1. RL Reward engine
          const { reward } = await calculateRewardAndUpdatePolicy(
              userId, response.isCorrect, response.responseTimeMs, (q.estimated_solving_time || 30) * 1000, wasSkipped
          );

          // 2. DKT Knowledge tracking (V3.0)
          await updateKnowledgeState(
              userId, q.domain_id, q.topic_id, q.difficulty_id, response.isCorrect, response.responseTimeMs, 
              (q.estimated_solving_time || 30) * 1000, wasSkipped, false, q.weight || 1.0, 1.0
          );

          // 3. Question History V2
          await pool.execute(
              `INSERT INTO question_history (user_id, test_id, question_id, topic_id, difficulty_id, response_time_ms, is_correct, was_skipped, reward_earned)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [userId, testId, response.questionId, q.topic_id, q.difficulty_id, response.responseTimeMs, response.isCorrect ? 1:0, wasSkipped ? 1:0, reward]
          );
      }
    }
    
    await completeTest(testId);
    const stats = await calculateTestStats(testId);
    
    // Update basic results table
    await saveResult(testId, userId, stats.correct * 10, stats.accuracy, stats.avgTime);
    
    // Create daily snapshot of progress
    await snapshotLearningProgress(userId);

    // Continuous Evaluation Pipeline (V3.0)
    const behaviorMetrics = await analyzeTestBehavior(userId, testId, responses);
    await updateQuestionStatistics(responses);
    const learningTrend = await analyzeLearningTrend(userId);

    const nextDifficulty = await determineDifficultyAdjustment(userId);
    let diffStr = nextDifficulty === 'increase' ? 'hard' : (nextDifficulty === 'decrease' ? 'easy' : 'medium');
    const explanation = `Your reward score dictates a ${nextDifficulty} in difficulty.`;
    
    await saveRecommendation(userId, testId, diffStr, explanation);
    
    res.json(new ApiResponse(200, {
      stats,
      recommendation: {
        difficulty: diffStr,
        explanation
      }
    }, 'Test submitted and knowledge state updated.'));
  } catch (error) {
    console.error("Submit test error", error);
    next(error);
  }
};

export const getResult = async (req, res, next) => {
  try {
    res.json(new ApiResponse(200, { testId: req.params.id }, 'Result fetched'));
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (req, res, next) => {
  try {
    res.json(new ApiResponse(200, [], 'Recommendations fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const dashboardMetrics = await getStudentDashboardMetrics(req.user.id);
    // Include original stats to not break any legacy UI components
    const legacyStats = await getDashboardStats(req.user.id);
    
    res.json(new ApiResponse(200, { ...legacyStats, ...dashboardMetrics }, 'Dashboard stats fetched successfully'));
  } catch (error) {
    next(error);
  }
};
