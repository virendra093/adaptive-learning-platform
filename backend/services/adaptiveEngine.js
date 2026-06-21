/**
 * Adaptive Learning Engine (Rule-Based)
 * 
 * This service determines the next appropriate difficulty level for a student 
 * based on their ongoing or past test performance. It uses a strict rule-based 
 * approach, avoiding any machine learning models as per system constraints.
 */

/**
 * Evaluates student performance to determine the next difficulty level.
 * 
 * @param {number} accuracy - Float between 0.0 and 1.0 representing percentage of correct answers.
 * @param {number} avgResponseTimeMs - Average time taken per question in milliseconds.
 * @param {number} wrongAnswers - Total count of incorrect answers.
 * @param {number} skippedQuestions - Total count of skipped questions.
 * @returns {string} - The recommended next difficulty level ('easy', 'medium', 'hard').
 */
export const calculateNextDifficulty = (accuracy, avgResponseTimeMs, wrongAnswers, skippedQuestions) => {
  // Rule 1: High Skipped Count -> Instant Downgrade
  // If a student is skipping many questions, they are overwhelmed and need a confidence boost.
  if (skippedQuestions >= 3) {
    return 'easy';
  }

  // Rule 2: High Error Rate -> Downgrade
  // If they have made 4 or more mistakes, the current level is too hard for them.
  if (wrongAnswers >= 4) {
    return 'easy';
  }

  // Rule 3: High Accuracy & Fast Response -> Upgrade
  // If accuracy is above 80% and they answer in under 20 seconds on average, they need a challenge.
  if (accuracy >= 0.8 && avgResponseTimeMs <= 20000) {
    return 'hard';
  }

  // Rule 4: Moderate Accuracy & Fast Response -> Maintain Medium
  // If accuracy is good (between 50% and 80%) and response time is reasonable (under 30s)
  if (accuracy >= 0.5 && accuracy < 0.8 && avgResponseTimeMs <= 30000) {
    return 'medium';
  }

  // Rule 5: High Accuracy but Very Slow -> Maintain Medium
  // They are getting them right, but taking too long (>30s), so don't upgrade to hard yet.
  if (accuracy >= 0.8 && avgResponseTimeMs > 30000) {
    return 'medium';
  }

  // Default Rule: If none of the above conditions are met (e.g., low accuracy, slow response), 
  // drop them to easy to rebuild foundational knowledge.
  return 'easy';
};

/**
 * Generates a human-readable explanation based on the evaluated difficulty and inputs.
 * 
 * @param {string} difficulty - The calculated next difficulty.
 * @param {number} skippedQuestions - Count of skipped questions to customize message.
 * @param {number} avgResponseTimeMs - To customize speed-based messaging.
 * @returns {string} - A tailored recommendation text.
 */
export const generateRecommendationExplanation = (difficulty, skippedQuestions, avgResponseTimeMs) => {
  if (skippedQuestions >= 3) {
    return "You skipped several questions. We recommend switching to Easy mode to build your confidence and ensure you understand the core concepts before moving on.";
  }

  switch (difficulty) {
    case 'hard':
      return "Exceptional performance! Your accuracy is high and your response time is incredibly fast. You are ready for Hard questions to truly challenge your aptitude.";
    case 'medium':
      if (avgResponseTimeMs > 30000) {
        return "You have good accuracy, but your average response time is a bit slow. Let's stay on Medium difficulty to help you build speed without losing accuracy.";
      }
      return "Solid effort! You are consistently answering questions correctly. Medium difficulty is currently the sweet spot for your steady progression.";
    case 'easy':
      return "It looks like you're facing some challenges with the recent questions. We're adjusting the difficulty to Easy so you can strengthen your foundational knowledge step-by-step.";
    default:
      return "Keep practicing! We will adjust your questions dynamically.";
  }
};
