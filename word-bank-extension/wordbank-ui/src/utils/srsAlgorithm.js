/**
 * Spaced Repetition System (SRS) Algorithm
 * Based on SM-2 algorithm with adaptations for vocabulary learning
 */

/**
 * Initialize progress data for a new word
 * @returns {Object} Initial progress object
 */
export function initializeWordProgress() {
  return {
    correctCount: 0,
    incorrectCount: 0,
    totalReviews: 0,
    lastReviewed: 0,
    nextReview: Date.now(), // Available for immediate review
    interval: 1, // Start with 1 day
    easeFactor: 2.5, // Default ease factor
    stage: 'learning',
    difficulty: 'medium',
    masteryLevel: 0
  };
}

/**
 * Calculate next review interval based on performance
 * @param {Object} progress - Current progress data
 * @param {number} quality - Quality of response (0-5)
 * @returns {Object} Updated progress data
 */
export function updateProgress(progress, quality) {
  const newProgress = { ...progress };
  
  // Update counters
  newProgress.totalReviews += 1;
  newProgress.lastReviewed = Date.now();
  
  if (quality >= 3) {
    newProgress.correctCount += 1;
  } else {
    newProgress.incorrectCount += 1;
  }
  
  // Calculate new ease factor (SM-2 algorithm)
  newProgress.easeFactor = Math.max(1.3, 
    newProgress.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  
  // Calculate new interval
  if (quality < 3) {
    // Incorrect answer - reset interval
    newProgress.interval = 1;
    newProgress.stage = 'learning';
  } else {
    // Correct answer - increase interval
    if (newProgress.interval === 1) {
      newProgress.interval = 6;
    } else {
      newProgress.interval = Math.round(newProgress.interval * newProgress.easeFactor);
    }
    
    // Update stage based on performance
    if (newProgress.interval >= 21 && newProgress.correctCount >= 5) {
      newProgress.stage = 'mastered';
    } else if (newProgress.interval >= 6) {
      newProgress.stage = 'review';
    }
  }
  
  // Calculate next review time
  newProgress.nextReview = Date.now() + (newProgress.interval * 24 * 60 * 60 * 1000);
  
  // Update mastery level (0-100)
  const accuracy = newProgress.totalReviews > 0 ? 
    (newProgress.correctCount / newProgress.totalReviews) * 100 : 0;
  const consistencyBonus = Math.min(newProgress.correctCount * 2, 20);
  newProgress.masteryLevel = Math.min(100, Math.round(accuracy + consistencyBonus));
  
  // Update difficulty based on performance
  if (accuracy >= 90) {
    newProgress.difficulty = 'easy';
  } else if (accuracy >= 70) {
    newProgress.difficulty = 'medium';
  } else {
    newProgress.difficulty = 'hard';
  }
  
  return newProgress;
}

/**
 * Get words that are due for review
 * @param {Array} words - Array of words
 * @returns {Array} Words due for review
 */
export function getWordsForReview(words) {
  const now = Date.now();
  return words.filter(word => {
    const progress = word.progress || initializeWordProgress();
    return progress.nextReview <= now;
  }).sort((a, b) => {
    // Prioritize by difficulty and overdue time
    const aOverdue = now - (a.progress?.nextReview || 0);
    const bOverdue = now - (b.progress?.nextReview || 0);
    const aDifficultyWeight = getDifficultyWeight(a.progress?.difficulty);
    const bDifficultyWeight = getDifficultyWeight(b.progress?.difficulty);
    
    return (bOverdue * bDifficultyWeight) - (aOverdue * aDifficultyWeight);
  });
}

/**
 * Get difficulty weight for prioritization
 * @param {string} difficulty - Difficulty level
 * @returns {number} Weight multiplier
 */
function getDifficultyWeight(difficulty) {
  switch (difficulty) {
    case 'hard': return 3;
    case 'medium': return 2;
    case 'easy': return 1;
    default: return 2;
  }
}

/**
 * Get new words for learning
 * @param {Array} words - Array of words
 * @param {number} limit - Maximum number of new words
 * @returns {Array} New words to learn
 */
export function getNewWordsForLearning(words, limit = 5) {
  return words
    .filter(word => !word.progress || word.progress.totalReviews === 0)
    .slice(0, limit);
}

/**
 * Calculate overall learning statistics
 * @param {Array} words - Array of words
 * @returns {Object} Learning statistics
 */
export function calculateLearningStats(words) {
  const totalWords = words.length;
  const wordsWithProgress = words.filter(word => word.progress && word.progress.totalReviews > 0);
  const masteredWords = words.filter(word => word.progress?.masteryLevel >= 70);
  const wordsInLearning = words.filter(word => word.progress?.stage === 'learning');
  const wordsInReview = words.filter(word => word.progress?.stage === 'review');
  
  const totalReviews = words.reduce((sum, word) => 
    sum + (word.progress?.totalReviews || 0), 0);
  const totalCorrect = words.reduce((sum, word) => 
    sum + (word.progress?.correctCount || 0), 0);
  
  const overallAccuracy = totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;
  
  return {
    totalWords,
    wordsLearned: masteredWords.length,
    wordsInLearning: wordsInLearning.length,
    wordsInReview: wordsInReview.length,
    overallAccuracy: Math.round(overallAccuracy),
    totalReviews,
    averageMastery: totalWords > 0 ? 
      Math.round(words.reduce((sum, word) => 
        sum + (word.progress?.masteryLevel || 0), 0) / totalWords) : 0
  };
}

/**
 * Quality mapping for different response types
 */
export const QUALITY_RATINGS = {
  PERFECT: 5,      // Perfect response
  CORRECT: 4,      // Correct with slight hesitation
  CORRECT_HARD: 3, // Correct but difficult
  INCORRECT_EASY: 2, // Incorrect but remembered with hint
  INCORRECT: 1,    // Incorrect
  BLACKOUT: 0      // Complete blackout
}; 