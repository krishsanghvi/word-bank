import React, { useState, useEffect } from 'react';
import FlashcardReview from './FlashcardReview';
import { 
  getWordsForReview, 
  getNewWordsForLearning, 
  calculateLearningStats,
  initializeWordProgress 
} from '../utils/srsAlgorithm';
import './LearningDashboard.css';

const LearningDashboard = ({ words, onUpdateWord, onUpdateWords }) => {
  const [currentMode, setCurrentMode] = useState('dashboard');
  const [reviewWords, setReviewWords] = useState([]);
  const [newWords, setNewWords] = useState([]);
  const [stats, setStats] = useState({});

  // Initialize words with progress if they don't have it
  useEffect(() => {
    const wordsWithProgress = words.map(word => ({
      ...word,
      progress: word.progress || initializeWordProgress()
    }));
    
    if (JSON.stringify(wordsWithProgress) !== JSON.stringify(words)) {
      onUpdateWords(wordsWithProgress);
    }
  }, [words, onUpdateWords]);

  // Calculate stats and due words
  useEffect(() => {
    const reviewDue = getWordsForReview(words);
    const newWordsAvailable = getNewWordsForLearning(words, 10);
    const learningStats = calculateLearningStats(words);
    
    setReviewWords(reviewDue);
    setNewWords(newWordsAvailable);
    setStats(learningStats);
  }, [words]);

  const handleStartReview = () => {
    if (reviewWords.length > 0) {
      setCurrentMode('review');
    }
  };

  const handleStartNewWords = () => {
    if (newWords.length > 0) {
      setCurrentMode('new-words');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentMode('dashboard');
  };

  if (currentMode === 'review') {
    return (
      <FlashcardReview
        words={reviewWords}
        onUpdateWord={onUpdateWord}
        onComplete={handleBackToDashboard}
      />
    );
  }

  if (currentMode === 'new-words') {
    return (
      <FlashcardReview
        words={newWords.slice(0, 5)} // Limit new words per session
        onUpdateWord={onUpdateWord}
        onComplete={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="learning-dashboard">
      <div className="dashboard-header">
        <h1>🎓 Learning Dashboard</h1>
        <p>Master your vocabulary with spaced repetition</p>
      </div>

      <div className="stats-overview">
        <div className="stat-card primary">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalWords || 0}</div>
            <div className="stat-label">Total Words</div>
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-number">{stats.wordsLearned || 0}</div>
            <div className="stat-label">Mastered</div>
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-number">{stats.overallAccuracy || 0}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalReviews || 0}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
        </div>
      </div>

      <div className="learning-actions">
        <div className="action-card review-card">
          <div className="card-header">
            <h3>📝 Review Due</h3>
            <span className="due-count">{reviewWords.length}</span>
          </div>
          <div className="card-content">
            <p>
              {reviewWords.length === 0 
                ? "Great! No reviews due right now." 
                : `${reviewWords.length} ${reviewWords.length === 1 ? 'word' : 'words'} ready for review.`
              }
            </p>
            <div className="difficulty-breakdown">
              {reviewWords.length > 0 && (
                <>
                  <span className="diff-hard">
                    Hard: {reviewWords.filter(w => w.progress?.difficulty === 'hard').length}
                  </span>
                  <span className="diff-medium">
                    Medium: {reviewWords.filter(w => w.progress?.difficulty === 'medium').length}
                  </span>
                  <span className="diff-easy">
                    Easy: {reviewWords.filter(w => w.progress?.difficulty === 'easy').length}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="card-actions">
            <button 
              className="btn btn-primary"
              onClick={handleStartReview}
              disabled={reviewWords.length === 0}
            >
              {reviewWords.length === 0 ? 'No Reviews Due' : 'Start Review'}
            </button>
          </div>
        </div>

        <div className="action-card new-words-card">
          <div className="card-header">
            <h3>✨ Learn New Words</h3>
            <span className="new-count">{newWords.length}</span>
          </div>
          <div className="card-content">
            <p>
              {newWords.length === 0 
                ? "All words have been introduced!" 
                : `${newWords.length} new ${newWords.length === 1 ? 'word' : 'words'} waiting to be learned.`
              }
            </p>
            {newWords.length > 0 && (
              <div className="new-words-preview">
                {newWords.slice(0, 3).map((word, index) => (
                  <span key={index} className="word-preview">
                    {word.word}
                  </span>
                ))}
                {newWords.length > 3 && <span className="more-words">+{newWords.length - 3} more</span>}
              </div>
            )}
          </div>
          <div className="card-actions">
            <button 
              className="btn btn-secondary"
              onClick={handleStartNewWords}
              disabled={newWords.length === 0}
            >
              {newWords.length === 0 ? 'No New Words' : 'Learn New Words'}
            </button>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h3>📊 Learning Progress</h3>
        <div className="progress-cards">
          <div className="progress-card">
            <div className="progress-header">
              <span>Learning Stage</span>
              <span>{stats.wordsInLearning || 0} words</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill learning"
                style={{ 
                  width: stats.totalWords > 0 ? 
                    `${((stats.wordsInLearning || 0) / stats.totalWords) * 100}%` : '0%' 
                }}
              />
            </div>
          </div>
          
          <div className="progress-card">
            <div className="progress-header">
              <span>Review Stage</span>
              <span>{stats.wordsInReview || 0} words</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill review"
                style={{ 
                  width: stats.totalWords > 0 ? 
                    `${((stats.wordsInReview || 0) / stats.totalWords) * 100}%` : '0%' 
                }}
              />
            </div>
          </div>
          
          <div className="progress-card">
            <div className="progress-header">
              <span>Mastered</span>
              <span>{stats.wordsLearned || 0} words</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill mastered"
                style={{ 
                  width: stats.totalWords > 0 ? 
                    `${((stats.wordsLearned || 0) / stats.totalWords) * 100}%` : '0%' 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="quick-stats">
        <h3>🎯 Quick Stats</h3>
        <div className="stats-grid">
          <div className="quick-stat">
            <span className="stat-value">{stats.averageMastery || 0}%</span>
            <span className="stat-name">Average Mastery</span>
          </div>
          <div className="quick-stat">
            <span className="stat-value">{Math.round((stats.wordsLearned || 0) / Math.max(1, stats.totalWords || 1) * 100)}%</span>
            <span className="stat-name">Completion</span>
          </div>
          <div className="quick-stat">
            <span className="stat-value">{reviewWords.filter(w => w.progress?.difficulty === 'hard').length}</span>
            <span className="stat-name">Challenging Words</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningDashboard; 