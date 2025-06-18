import React, { useState, useEffect, useCallback } from 'react';
import { updateProgress, QUALITY_RATINGS } from '../utils/srsAlgorithm';
import './FlashcardReview.css';

const FlashcardReview = ({ words, onUpdateWord, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState('word-to-definition'); // 'word-to-definition' | 'definition-to-word'
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  });
  const [showResults, setShowResults] = useState(false);

  const currentWord = words[currentIndex];
  const isLastCard = currentIndex === words.length - 1;

  // Text-to-speech functionality
  const speakWord = useCallback((text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  }, []);

  // Handle answer rating
  const handleRating = useCallback((quality) => {
    if (!currentWord) return;

    const updatedProgress = updateProgress(
      currentWord.progress || { 
        correctCount: 0, 
        incorrectCount: 0, 
        totalReviews: 0,
        lastReviewed: 0,
        nextReview: Date.now(),
        interval: 1,
        easeFactor: 2.5,
        stage: 'learning',
        difficulty: 'medium',
        masteryLevel: 0
      },
      quality
    );

    const updatedWord = {
      ...currentWord,
      progress: updatedProgress
    };

    onUpdateWord(updatedWord);

    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      total: prev.total + 1,
      correct: quality >= 3 ? prev.correct + 1 : prev.correct,
      incorrect: quality < 3 ? prev.incorrect + 1 : prev.incorrect
    }));

    // Move to next card or show results
    if (isLastCard) {
      setShowResults(true);
    } else {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  }, [currentWord, isLastCard, onUpdateWord]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (showResults) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsFlipped(!isFlipped);
          break;
        case '1':
          if (isFlipped) handleRating(QUALITY_RATINGS.BLACKOUT);
          break;
        case '2':
          if (isFlipped) handleRating(QUALITY_RATINGS.INCORRECT);
          break;
        case '3':
          if (isFlipped) handleRating(QUALITY_RATINGS.INCORRECT_EASY);
          break;
        case '4':
          if (isFlipped) handleRating(QUALITY_RATINGS.CORRECT_HARD);
          break;
        case '5':
          if (isFlipped) handleRating(QUALITY_RATINGS.CORRECT);
          break;
        case '6':
          if (isFlipped) handleRating(QUALITY_RATINGS.PERFECT);
          break;
        case 's':
          if (currentWord) speakWord(currentWord.word);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, showResults, currentWord, handleRating, speakWord]);

  if (!words || words.length === 0) {
    return (
      <div className="flashcard-review">
        <div className="no-cards">
          <h3>No cards to review!</h3>
          <p>Great job! You're all caught up.</p>
          <button onClick={onComplete} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const accuracy = sessionStats.total > 0 ? 
      Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;

    return (
      <div className="flashcard-review">
        <div className="session-results">
          <h2>🎉 Session Complete!</h2>
          <div className="results-stats">
            <div className="stat-card">
              <div className="stat-number">{sessionStats.total}</div>
              <div className="stat-label">Cards Reviewed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{sessionStats.correct}</div>
              <div className="stat-label">Correct</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{accuracy}%</div>
              <div className="stat-label">Accuracy</div>
            </div>
          </div>
          <div className="results-actions">
            <button onClick={onComplete} className="btn btn-primary">
              Continue Learning
            </button>
            <button 
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setShowResults(false);
                setSessionStats({ correct: 0, incorrect: 0, total: 0 });
              }}
              className="btn btn-secondary"
            >
              Review Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flashcard-review">
      <div className="review-header">
        <div className="progress-info">
          <span className="card-counter">
            {currentIndex + 1} / {words.length}
          </span>
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'word-to-definition' ? 'active' : ''}`}
              onClick={() => setMode('word-to-definition')}
            >
              Word → Definition
            </button>
            <button
              className={`mode-btn ${mode === 'definition-to-word' ? 'active' : ''}`}
              onClick={() => setMode('definition-to-word')}
            >
              Definition → Word
            </button>
          </div>
        </div>
        <div className="session-stats">
          <span className="correct">✓ {sessionStats.correct}</span>
          <span className="incorrect">✗ {sessionStats.incorrect}</span>
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
        />
      </div>

      <div className={`flashcard ${isFlipped ? 'flipped' : ''}`}>
        <div className="card-front">
          <div className="card-content">
            {mode === 'word-to-definition' ? (
              <>
                <div className="word-display">
                  <h2>{currentWord?.word}</h2>
                  <button 
                    className="speak-btn"
                    onClick={() => speakWord(currentWord?.word)}
                    title="Pronounce word (S)"
                  >
                    🔊
                  </button>
                </div>
                <div className="card-hint">
                  <span className="category-badge">
                    {currentWord?.category || 'unknown'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="definition-display">
                  <p>{currentWord?.definitions?.[0]?.definition}</p>
                </div>
                <div className="card-hint">
                  <span className="pos-badge">
                    {currentWord?.definitions?.[0]?.partOfSpeech || 'unknown'}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="card-footer">
            <button 
              className="flip-btn"
              onClick={() => setIsFlipped(true)}
            >
              Show Answer (Space)
            </button>
          </div>
        </div>

        <div className="card-back">
          <div className="card-content">
            {mode === 'word-to-definition' ? (
              <>
                <div className="definition-display">
                  <p>{currentWord?.definitions?.[0]?.definition}</p>
                  {currentWord?.definitions?.[0]?.example && (
                    <div className="example">
                      <em>"{currentWord.definitions[0].example}"</em>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="word-display">
                  <h2>{currentWord?.word}</h2>
                  <button 
                    className="speak-btn"
                    onClick={() => speakWord(currentWord?.word)}
                  >
                    🔊
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="rating-buttons">
            <button 
              className="rating-btn blackout"
              onClick={() => handleRating(QUALITY_RATINGS.BLACKOUT)}
              title="Complete blackout (1)"
            >
              😵 Again
            </button>
            <button 
              className="rating-btn hard"
              onClick={() => handleRating(QUALITY_RATINGS.CORRECT_HARD)}
              title="Correct but difficult (4)"
            >
              😓 Hard
            </button>
            <button 
              className="rating-btn good"
              onClick={() => handleRating(QUALITY_RATINGS.CORRECT)}
              title="Correct (5)"
            >
              😊 Good
            </button>
            <button 
              className="rating-btn easy"
              onClick={() => handleRating(QUALITY_RATINGS.PERFECT)}
              title="Perfect response (6)"
            >
              😎 Easy
            </button>
          </div>
        </div>
      </div>

      <div className="keyboard-hints">
        <span>Space: Flip card</span>
        <span>1-6: Rate difficulty</span>
        <span>S: Speak word</span>
      </div>
    </div>
  );
};

export default FlashcardReview; 