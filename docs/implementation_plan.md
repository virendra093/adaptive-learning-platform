# Adaptive Learning Platform Version 2.0 Implementation Plan

This plan outlines the architecture and steps required to enhance the project to Version 2.0 with a lightweight Adaptive Learning Engine inspired by Deep Knowledge Tracing (DKT) and Reinforcement Learning (RL), strictly using JavaScript (Node.js/React.js) without external AI libraries or tools.

## User Review Required

> [!IMPORTANT]  
> Please review the plan, specifically the strategy for generating 2250+ questions. Since using external AI APIs or Python is restricted, I will write a Node.js synthetic seeder script that uses templates and variable injection to mathematically/procedurally generate thousands of unique questions to meet the 2250+ requirement. Does this approach work for you?

## Proposed Changes

### Database Enhancements
*Extend schema to support advanced analytics and adaptive metrics.*

#### [NEW] `backend/database/schema_v3_adaptive.sql`
- **Tables**: `student_profile`, `knowledge_state`, `adaptive_history`, `learning_progress`, `question_history`, `adaptive_rewards`.
- **Modifications**: Ensure existing `question_statistics` is updated if needed.
- **Constraints**: Will strictly avoid enterprise features, triggers, or stored procedures as requested, ensuring 100% XAMPP compatibility.

---

### Backend Services (Core Adaptive Engine)
*Create modular, rule-based JS services following MVC.*

#### [NEW] `backend/services/knowledgeTrackingService.js` (DKT Inspired)
- Maintains a knowledge mastery score (e.g., 0-100) per Domain, Topic, and Difficulty.
- **Rules**: 
  - Increases for Correct + Fast Response + High Confidence.
  - Decreases for Wrong + Slow Response + Skipped + Repeated mistakes.
- Updates DB `knowledge_state` after every question.

#### [NEW] `backend/services/rewardEngineService.js` (RL Inspired)
- Calculates rewards based on a rule-based policy.
- **Rules**:
  - Correct + Fast = Positive Reward
  - Correct + Slow = Small Reward
  - Wrong + Fast = Penalty
  - Wrong + Slow = Large Penalty
  - Skipped = Penalty
- Updates DB `adaptive_rewards` and dictates difficulty adjustments (Increase/Maintain/Decrease).

#### [NEW] `backend/services/adaptiveEngineService.js`
- Generates 15-20 question unique tests.
- **Rules**: Excludes previously attempted questions. 
- **Priority**: 70% Weak Topics, 20% Medium Topics, 10% Strong Topics based on `knowledge_state`.
- Manages difficulty progression dynamically.

#### [NEW] `backend/services/studentAnalyticsService.js`
- Computes metrics for the `student_profile` (Accuracy, Learning Speed, Confidence, Improvement Trend).

---

### Backend Controllers & Routes
*Integrate services into the API.*

#### [MODIFY] `backend/controllers/testController.js`
- Update `startTest` to select 20 balanced questions (Quant, Verbal, Reasoning) for General Test, preventing duplicates using `question_history`.
- Implement `startAdaptiveTest` utilizing `adaptiveEngineService.js`.
- Update `submitTest` and `submitResponse` to iteratively trigger `knowledgeTrackingService.js` and `rewardEngineService.js`.

#### [MODIFY] `backend/controllers/questionController.js`
- Enhanced question fetching logic to support the new domain/topic mappings and difficulty calculations.

---

### Question Bank Expansion
*Procedural generation to hit the 2250+ target.*

#### [NEW] `backend/database/seed_v2_questions.js`
- A script using synthetic generation (templates with randomized variables) to populate the `questions` table with Easy, Medium, and Hard questions for:
  - Quantitative Aptitude (750+)
  - Verbal Ability (750+)
  - Logical Reasoning (750+)
- Includes expected metrics (weight, estimated time, hints, tags).

---

### Frontend Dashboard & UI Enhancements
*Visualize the new adaptive metrics using Recharts.*

#### [MODIFY] `frontend/src/pages/student/GeneralTest.jsx` & `AdaptiveTest.jsx`
- Ensure test pages track skips, exact response times, and optionally confidence levels.

#### [MODIFY] `frontend/src/pages/student/StudentDashboard.jsx` & Components
- Add Knowledge Graph (Line chart over time).
- Add Skill Radar (Radar chart of Domain Mastery).
- Display Domain/Difficulty Accuracy, Improvement Trend, Weak/Strong Topics, Next Recommended Topics, and Reward Score.

#### [MODIFY] `frontend/src/pages/admin/AdminDashboard.jsx`
- Display aggregate platform-wide knowledge metrics and engine performance.

## Verification Plan

### Automated/Scripted Verification
- Run `node backend/database/seed_v2_questions.js` and verify `SELECT COUNT(*) FROM questions` returns >= 2250.
- Execute unit-test scripts for Reward and Knowledge Tracking logic to verify mathematical correctness.

### Manual Verification
- Start a General Test -> Submit -> Verify `student_profile`, `knowledge_state`, and `adaptive_rewards` tables update correctly.
- Start Adaptive Test -> Verify 70/20/10 topic split and no repeated questions.
- View Dashboard to ensure Radar and Line charts render correctly without React errors.
