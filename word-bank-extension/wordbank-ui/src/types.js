/**
 * @typedef {Object} WordDefinition
 * @property {string} definition - The definition text
 * @property {string} partOfSpeech - Part of speech (noun, verb, etc.)
 * @property {string} [example] - Example sentence
 */

/**
 * @typedef {Object} WordProgress
 * @property {number} correctCount - Number of correct answers
 * @property {number} incorrectCount - Number of incorrect answers
 * @property {number} totalReviews - Total number of reviews
 * @property {number} lastReviewed - Timestamp of last review
 * @property {number} nextReview - Timestamp of next scheduled review
 * @property {number} interval - Current review interval in days
 * @property {number} easeFactor - Ease factor for spaced repetition (1.3-2.5)
 * @property {'learning' | 'review' | 'mastered'} stage - Current learning stage
 * @property {'easy' | 'medium' | 'hard'} difficulty - Perceived difficulty
 * @property {number} masteryLevel - Mastery percentage (0-100)
 */

/**
 * @typedef {Object} Word
 * @property {string} word - The word itself
 * @property {WordDefinition[]} definitions - Array of definitions
 * @property {string} category - Word category
 * @property {number} timestamp - When word was added
 * @property {string} url - Source URL
 * @property {string} pageTitle - Source page title
 * @property {WordProgress} progress - Learning progress data
 * @property {string} [personalNote] - User's personal note
 * @property {boolean} [isFavorite] - Whether word is favorited
 * @property {string[]} [tags] - Custom tags
 * @property {string} [image] - Associated image URL
 * @property {string} [pronunciation] - IPA pronunciation
 */

/**
 * @typedef {Object} UserStats
 * @property {number} totalWords - Total words in bank
 * @property {number} wordsLearned - Words with mastery > 70%
 * @property {number} currentStreak - Current daily streak
 * @property {number} longestStreak - Longest streak achieved
 * @property {number} totalXP - Total experience points
 * @property {number} dailyGoal - Daily learning goal
 * @property {number} wordsReviewedToday - Words reviewed today
 * @property {string[]} achievements - Unlocked achievements
 * @property {number} lastActiveDate - Last activity timestamp
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {string} id - Unique question ID
 * @property {'word-to-definition' | 'definition-to-word' | 'multiple-choice' | 'fill-blank' | 'true-false' | 'typing'} type
 * @property {Word} word - The target word
 * @property {string} question - Question text
 * @property {string[]} options - Answer options (for multiple choice)
 * @property {string} correctAnswer - Correct answer
 * @property {number} timeLimit - Time limit in seconds
 */

export {}; 