import pool from '../config/db.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const [studentCount] = await pool.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    const [testCount] = await pool.execute("SELECT COUNT(*) as count FROM tests WHERE status = 'in_progress'");
    const [questionCount] = await pool.execute("SELECT COUNT(*) as count FROM questions");

    res.json(new ApiResponse(200, {
      totalStudents: studentCount[0].count,
      activeTests: testCount[0].count,
      totalQuestions: questionCount[0].count
    }, "Admin dashboard stats fetched"));
  } catch (error) {
    next(error);
  }
};

export const getStudentsList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;
    const searchTerm = `%${search}%`;

    const [rows] = await pool.execute(`
      SELECT 
        u.id, u.name, u.email, u.createdAt,
        COUNT(DISTINCT r.id) as testsTaken,
        AVG(r.accuracy) as avgAccuracy,
        up.current_level as currentLevel,
        MAX(t.end_time) as lastActiveDate
      FROM users u
      LEFT JOIN results r ON u.id = r.user_id
      LEFT JOIN user_progress up ON u.id = up.user_id
      LEFT JOIN tests t ON u.id = t.user_id AND t.status = 'completed'
      WHERE u.role = 'student' AND (u.name LIKE ? OR u.email LIKE ?)
      GROUP BY u.id, up.current_level
      ORDER BY u.createdAt DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `, [searchTerm, searchTerm]);
    
    // Synthesize some UI-specific data like Persona
    const enhancedRows = rows.map(row => {
      let persona = "New Learner";
      if (row.testsTaken > 0) {
        if (row.avgAccuracy >= 0.8) persona = "Fast Learner";
        else if (row.avgAccuracy >= 0.5) persona = "Consistent Learner";
        else persona = "Needs Reinforcement";
      }
      return {
        ...row,
        persona,
        status: row.lastActiveDate && (new Date() - new Date(row.lastActiveDate) < 7*24*60*60*1000) ? 'Active' : 'Inactive'
      };
    });
    
    const [countRows] = await pool.execute(`
      SELECT COUNT(*) as total FROM users WHERE role = 'student' AND (name LIKE ? OR email LIKE ?)
    `, [searchTerm, searchTerm]);
    const total = countRows[0].total;

    res.json(new ApiResponse(200, {
      data: enhancedRows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    }, "Students list fetched"));
  } catch (error) {
    next(error);
  }
};

export const getStudentResults = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;
    const searchTerm = `%${search}%`;

    const [rows] = await pool.execute(`
      SELECT 
        r.id as resultId, r.total_score, r.accuracy, r.createdAt as testDate,
        u.name as studentName, u.email
      FROM results r
      JOIN users u ON r.user_id = u.id
      WHERE u.name LIKE ? OR u.email LIKE ?
      ORDER BY r.createdAt DESC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `, [searchTerm, searchTerm]);

    const [countRows] = await pool.execute(`
      SELECT COUNT(*) as total 
      FROM results r
      JOIN users u ON r.user_id = u.id
      WHERE u.name LIKE ? OR u.email LIKE ?
    `, [searchTerm, searchTerm]);
    const total = countRows[0].total;

    res.json(new ApiResponse(200, {
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    }, "Results fetched"));
  } catch (error) {
    next(error);
  }
};

export const getQuestionAnalytics = async (req, res, next) => {
  try {
    // 1. Most Difficult Questions (Lowest Accuracy)
    const [difficultQuestions] = await pool.execute(`
      SELECT q.id, q.text, qs.total_attempts, qs.correct_attempts, qs.difficulty_index
      FROM question_statistics qs
      JOIN questions q ON qs.question_id = q.id
      WHERE qs.total_attempts > 5
      ORDER BY qs.difficulty_index DESC
      LIMIT 10
    `);

    // 2. Most Easy Questions (Highest Accuracy)
    const [easyQuestions] = await pool.execute(`
      SELECT q.id, q.text, qs.total_attempts, qs.correct_attempts, qs.difficulty_index
      FROM question_statistics qs
      JOIN questions q ON qs.question_id = q.id
      WHERE qs.total_attempts > 5
      ORDER BY qs.difficulty_index ASC
      LIMIT 10
    `);

    // 3. Frequently Skipped Questions
    const [skippedQuestions] = await pool.execute(`
      SELECT q.id, q.text, qs.total_attempts, qs.skip_count
      FROM question_statistics qs
      JOIN questions q ON qs.question_id = q.id
      WHERE qs.total_attempts > 0
      ORDER BY (qs.skip_count / qs.total_attempts) DESC
      LIMIT 10
    `);

    // 4. Confusing Questions (High attempts, very low accuracy or long solving time)
    const [confusingQuestions] = await pool.execute(`
      SELECT q.id, q.text, qs.total_attempts, qs.correct_attempts, qs.average_solving_time
      FROM question_statistics qs
      JOIN questions q ON qs.question_id = q.id
      WHERE qs.total_attempts > 10 AND (qs.correct_attempts / qs.total_attempts) < 0.2 AND qs.average_solving_time > 45000
      LIMIT 10
    `);

    // 5. Unused Questions
    const [unusedQuestions] = await pool.execute(`
      SELECT q.id, q.text
      FROM questions q
      LEFT JOIN question_statistics qs ON q.id = qs.question_id
      WHERE qs.total_attempts IS NULL OR qs.total_attempts = 0
      LIMIT 10
    `);

    res.json(new ApiResponse(200, {
      difficultQuestions,
      easyQuestions,
      skippedQuestions,
      confusingQuestions,
      unusedQuestions
    }, "Question analytics fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export const getStudentIntelligence = async (req, res, next) => {
  try {
    const studentId = req.params.id;

    // 1. Overview
    const [userRows] = await pool.execute(`
      SELECT u.id, u.name, u.email, u.createdAt, up.current_level, up.total_tests_taken
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      WHERE u.id = ? AND u.role = 'student'
    `, [studentId]);

    if (userRows.length === 0) {
      return res.status(404).json(new ApiResponse(404, null, "Student not found"));
    }
    const user = userRows[0];

    // 2. Timeline & Growth (Tests & Results)
    const [timelineRows] = await pool.execute(`
      SELECT r.id, r.test_id, t.test_type, t.end_time, r.total_score, r.accuracy, r.avg_response_time
      FROM results r
      JOIN tests t ON r.test_id = t.id
      WHERE r.user_id = ?
      ORDER BY t.end_time ASC
    `, [studentId]);

    // 3. Overall Academic Performance Summary
    let totalAttempts = 0;
    let correctAnswers = 0;
    let avgResponseTimeMs = 0;
    
    // Detailed responses for mastery analysis
    const [responsesRows] = await pool.execute(`
      SELECT 
        res.is_correct, res.response_time_ms,
        q.difficulty, q.domain_id, q.topic_id,
        d.name as domain_name, top.name as topic_name
      FROM responses res
      JOIN tests t ON res.test_id = t.id
      JOIN questions q ON res.question_id = q.id
      LEFT JOIN domains d ON q.domain_id = d.id
      LEFT JOIN topics top ON q.topic_id = top.id
      WHERE t.user_id = ?
    `, [studentId]);

    const domainPerformance = {};
    const topicMastery = {};

    responsesRows.forEach(r => {
      totalAttempts++;
      if (r.is_correct) correctAnswers++;
      avgResponseTimeMs += r.response_time_ms;

      // Domain Aggregation
      if (r.domain_id) {
        if (!domainPerformance[r.domain_id]) {
           domainPerformance[r.domain_id] = { id: r.domain_id, name: r.domain_name || 'Unknown', attempted: 0, correct: 0, time: 0 };
        }
        domainPerformance[r.domain_id].attempted++;
        if (r.is_correct) domainPerformance[r.domain_id].correct++;
        domainPerformance[r.domain_id].time += r.response_time_ms;
      }

      // Topic Aggregation
      if (r.topic_id) {
         if (!topicMastery[r.topic_id]) {
            topicMastery[r.topic_id] = { id: r.topic_id, name: r.topic_name || 'Unknown', attempted: 0, correct: 0, time: 0 };
         }
         topicMastery[r.topic_id].attempted++;
         if (r.is_correct) topicMastery[r.topic_id].correct++;
         topicMastery[r.topic_id].time += r.response_time_ms;
      }
    });

    // Formatting Domains
    const domains = Object.values(domainPerformance).map(d => ({
      ...d,
      accuracy: d.attempted > 0 ? d.correct / d.attempted : 0,
      avgTime: d.attempted > 0 ? Math.round(d.time / d.attempted) : 0
    }));

    // Formatting Topics
    const topics = Object.values(topicMastery).map(t => {
      const accuracy = t.attempted > 0 ? t.correct / t.attempted : 0;
      let status = 'Beginner';
      if (accuracy >= 0.8) status = 'Mastered';
      else if (accuracy >= 0.6) status = 'Advanced';
      else if (accuracy >= 0.4) status = 'Intermediate';
      
      return {
        ...t,
        accuracy,
        avgTime: t.attempted > 0 ? Math.round(t.time / t.attempted) : 0,
        status
      };
    });

    // 4. Recommendation History
    const [recommendationRows] = await pool.execute(`
      SELECT recommended_difficulty, explanation, createdAt
      FROM recommendations
      WHERE user_id = ?
      ORDER BY createdAt DESC
      LIMIT 10
    `, [studentId]);

    // 5. Synthesize AI Metrics (Behavior, Persona, Risk)
    const overallAccuracy = totalAttempts > 0 ? correctAnswers / totalAttempts : 0;
    
    let persona = "New Learner";
    let riskLevel = "Moderate Risk";
    let focusScore = 75; // Mock synthetic
    let persistenceScore = 80; // Mock synthetic
    
    if (totalAttempts > 0) {
      if (overallAccuracy >= 0.8) { persona = "Fast Learner"; riskLevel = "Low Risk"; focusScore = 90; }
      else if (overallAccuracy >= 0.5) { persona = "Consistent Learner"; riskLevel = "Moderate Risk"; }
      else { persona = "Needs Reinforcement"; riskLevel = "High Risk"; focusScore = 40; }
    }

    // Try fetching feedback and tickets if tables exist
    let feedback = [];
    let tickets = [];
    try {
      const [fRows] = await pool.execute(`SELECT * FROM feedback WHERE user_id = ? ORDER BY createdAt DESC LIMIT 5`, [studentId]);
      feedback = fRows;
    } catch(e) { /* table might not exist */ }
    
    try {
      const [tRows] = await pool.execute(`SELECT * FROM support_tickets WHERE user_id = ? ORDER BY createdAt DESC LIMIT 5`, [studentId]);
      tickets = tRows;
    } catch(e) { /* table might not exist */ }

    // Construct final payload
    const data = {
      overview: {
        ...user,
        persona,
        riskLevel,
        overallAccuracy,
        focusScore,
        persistenceScore,
        behaviorScore: Math.round((focusScore + persistenceScore) / 2)
      },
      academicSummary: {
        totalAttempts,
        correctAnswers,
        wrongAnswers: totalAttempts - correctAnswers,
        avgResponseTimeMs: totalAttempts > 0 ? Math.round(avgResponseTimeMs / totalAttempts) : 0,
        highestScore: timelineRows.length > 0 ? Math.max(...timelineRows.map(r => r.total_score)) : 0,
        averageScore: timelineRows.length > 0 ? Math.round(timelineRows.reduce((acc, r) => acc + r.total_score, 0) / timelineRows.length) : 0
      },
      timeline: timelineRows,
      domains,
      topics,
      recommendations: recommendationRows,
      feedback,
      tickets
    };

    res.json(new ApiResponse(200, data, "Student intelligence aggregated successfully"));
  } catch (error) {
    next(error);
  }
};

