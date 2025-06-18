import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  Users, 
  UserCircle, 
  LogOut, 
  Book, 
  BarChart3, 
  Share2,
  Bell,
  Settings,
  Menu,
  X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

// Import components
import LearningDashboard from './components/LearningDashboard';
import SocialDashboard from './components/social/SocialDashboard';
import AuthProvider, { useAuth } from './components/auth/AuthProvider';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import WordSharingModal from './components/social/WordSharingModal';
import { initializeWordProgress } from './utils/srsAlgorithm';
import './App.css';

const CATEGORY_COLORS = {
  noun: "#42a5f5",
  verb: "#66bb6a",
  adjective: "#ab47bc",
  other: "#ffa726",
};

function getCategory(word) {
  return (word.category || word.definitions?.[0]?.partOfSpeech || "other").toLowerCase();
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading your learning platform...</p>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

// Auth Page Component
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <AnimatePresence mode="wait">
          {isLogin ? (
            <LoginForm
              key="login"
              onSwitchToSignup={() => setIsLogin(false)}
            />
          ) : (
            <SignupForm
              key="signup"
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Main App Component (protected content)
function MainApp() {
  const { user, userProfile, signOut, addXP } = useAuth();
  const [words, setWords] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("wordbank");
  const [shareWord, setShareWord] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = () => {
    // Load from chrome.storage if available, else use demo data
    if (window.chrome && chrome.storage) {
      chrome.storage.local.get(["wordBank"], (result) => {
        const loadedWords = Array.isArray(result.wordBank) ? result.wordBank : [];
        // Initialize progress for words that don't have it
        const wordsWithProgress = loadedWords.map(word => ({
          ...word,
          progress: word.progress || initializeWordProgress()
        }));
        setWords(wordsWithProgress);
        setLoading(false);
      });
    } else {
      // Enhanced demo data for local dev
      const demoWords = [
        {
          word: "serendipity",
          definitions: [{ definition: "The occurrence of events by chance in a happy or beneficial way.", partOfSpeech: "noun" }],
          category: "noun",
          timestamp: Date.now() - 1000000,
          url: "https://en.wikipedia.org/wiki/Serendipity",
          pageTitle: "Serendipity - Wikipedia",
          progress: initializeWordProgress()
        },
        {
          word: "elucidate",
          definitions: [{ definition: "Make (something) clear; explain.", partOfSpeech: "verb" }],
          category: "verb",
          timestamp: Date.now() - 2000000,
          url: "https://en.wiktionary.org/wiki/elucidate",
          pageTitle: "elucidate - Wiktionary",
          progress: initializeWordProgress()
        },
        {
          word: "gregarious",
          definitions: [{ definition: "(of a person) fond of company; sociable.", partOfSpeech: "adjective" }],
          category: "adjective",
          timestamp: Date.now() - 3000000,
          url: "https://en.wiktionary.org/wiki/gregarious",
          pageTitle: "gregarious - Wiktionary",
          progress: initializeWordProgress()
        },
        {
          word: "ephemeral",
          definitions: [{ definition: "Lasting for a very short time.", partOfSpeech: "adjective" }],
          category: "adjective",
          timestamp: Date.now() - 4000000,
          url: "https://en.wiktionary.org/wiki/ephemeral",
          pageTitle: "ephemeral - Wiktionary",
          progress: initializeWordProgress()
        },
        {
          word: "ubiquitous",
          definitions: [{ definition: "Present, appearing, or found everywhere.", partOfSpeech: "adjective" }],
          category: "adjective",
          timestamp: Date.now() - 5000000,
          url: "https://en.wiktionary.org/wiki/ubiquitous",
          pageTitle: "ubiquitous - Wiktionary",
          progress: initializeWordProgress()
        },
        {
          word: "perspicacious",
          definitions: [{ definition: "Having keen mental perception and understanding; discerning.", partOfSpeech: "adjective" }],
          category: "adjective",
          timestamp: Date.now() - 6000000,
          url: "https://en.wiktionary.org/wiki/perspicacious",
          pageTitle: "perspicacious - Wiktionary",
          progress: initializeWordProgress()
        }
      ];
      setWords(demoWords);
      setLoading(false);
    }
  };

  // Save words to storage when they change
  useEffect(() => {
    if (words.length > 0 && window.chrome && chrome.storage) {
      chrome.storage.local.set({ wordBank: words });
    }
  }, [words]);

  // Update a single word
  const updateWord = (updatedWord) => {
    setWords(prevWords => 
      prevWords.map(word => 
        word.word === updatedWord.word ? updatedWord : word
      )
    );
  };

  // Update all words
  const updateWords = (newWords) => {
    setWords(newWords);
  };

  // Handle word sharing
  const handleShareWord = (word) => {
    setShareWord(word);
    setShowShareModal(true);
  };

  // Filtering for word bank view
  const filteredWords = words
    .filter((word) => {
      const matchesTerm =
        !search ||
        word.word.toLowerCase().includes(search.toLowerCase()) ||
        (word.definitions &&
          word.definitions.some(
            (def) =>
              def.definition.toLowerCase().includes(search.toLowerCase()) ||
              (def.partOfSpeech &&
                def.partOfSpeech.toLowerCase().includes(search.toLowerCase()))
          ));
      const matchesCategory =
        !category || getCategory(word) === category.toLowerCase();
      return matchesTerm && matchesCategory;
    })
    .sort((a, b) =>
      sortOrder === "alphabetical"
        ? a.word.localeCompare(b.word)
        : b.timestamp - a.timestamp
    );

  // Stats for word bank view
  const totalWords = words.length;
  const thisWeek = words.filter((w) => {
    const now = new Date();
    const then = new Date(w.timestamp);
    const diff = (now - then) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;

  // Delete word
  const deleteWord = (wordToDelete) => {
    const updated = words.filter((w) => w.word !== wordToDelete);
    setWords(updated);
    toast.success('Word removed from your collection');
  };

  // Clear all
  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear your entire word bank?")) {
      setWords([]);
      toast.success('Word bank cleared');
    }
  };

  // Export
  const exportWordBank = () => {
    const data = JSON.stringify(words, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "word-bank.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Word bank exported successfully!');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const getViewTitle = () => {
    switch (currentView) {
      case 'wordbank': return '📚 Word Bank';
      case 'learning': return '🎓 Learning';
      case 'social': return '👥 Social';
      default: return '📚 Word Bank';
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">{getViewTitle()}</h1>
          <div className="user-info">
            <span className="welcome-text">
              Welcome back, <strong>{userProfile?.username || user?.email?.split('@')[0]}</strong>
            </span>
            <div className="user-stats">
              <span className="level-badge">Level {userProfile?.level || 1}</span>
              <span className="xp-badge">{userProfile?.total_xp || 0} XP</span>
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <button className="notification-btn">
            <Bell size={20} />
            <span className="notification-dot" />
          </button>
          
          <div className="user-menu-container">
            <button 
              className="user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <UserCircle size={24} />
            </button>
            
            {showUserMenu && (
              <div className="user-menu-dropdown">
                <div className="user-menu-header">
                  <UserCircle size={20} />
      <div>
                    <p className="user-name">{userProfile?.username || 'User'}</p>
                    <p className="user-email">{user?.email}</p>
                  </div>
                </div>
                <div className="user-menu-divider" />
                <button className="user-menu-item">
                  <Settings size={16} />
                  Settings
                </button>
                <button 
                  className="user-menu-item"
                  onClick={handleSignOut}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          <button 
            className="mobile-nav-toggle"
            onClick={() => setShowMobileNav(!showMobileNav)}
          >
            {showMobileNav ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`app-nav ${showMobileNav ? 'mobile-open' : ''}`}>
        <button 
          className={`nav-btn ${currentView === "wordbank" ? "active" : ""}`}
          onClick={() => {
            setCurrentView("wordbank");
            setShowMobileNav(false);
          }}
        >
          <Book size={20} />
          <span>Word Bank</span>
        </button>
        <button 
          className={`nav-btn ${currentView === "learning" ? "active" : ""}`}
          onClick={() => {
            setCurrentView("learning");
            setShowMobileNav(false);
          }}
        >
          <BarChart3 size={20} />
          <span>Learning</span>
        </button>
        <button 
          className={`nav-btn ${currentView === "social" ? "active" : ""}`}
          onClick={() => {
            setCurrentView("social");
            setShowMobileNav(false);
          }}
        >
          <Users size={20} />
          <span>Social</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="app-main">
        <AnimatePresence mode="wait">
          {currentView === "learning" && (
            <motion.div
              key="learning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <LearningDashboard 
                words={words} 
                onUpdateWord={updateWord}
                onUpdateWords={updateWords}
              />
            </motion.div>
          )}

          {currentView === "social" && (
            <motion.div
              key="social"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SocialDashboard />
            </motion.div>
          )}

          {currentView === "wordbank" && (
            <motion.div
              key="wordbank"
              className="wordbank-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="wordbank-header">
                <div className="stats">
                  <div className="stat-item">
                    <div className="stat-number">{totalWords}</div>
                    <div className="stat-label">Total Words</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{thisWeek}</div>
                    <div className="stat-label">This Week</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">
                      {Math.round((words.filter(w => w.progress?.masteryLevel >= 70).length / totalWords) * 100) || 0}%
                    </div>
                    <div className="stat-label">Mastered</div>
                  </div>
                </div>
              </div>

              <div className="controls">
                <div className="search-filter-row">
                  <input
                    type="text"
                    className="search-box"
                    placeholder="Search your words..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select
                    className="filter-dropdown"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    <option value="noun">Noun</option>
                    <option value="verb">Verb</option>
                    <option value="adjective">Adjective</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="button-group">
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      setSortOrder(sortOrder === "recent" ? "alphabetical" : "recent")
                    }
                  >
                    {sortOrder === "recent" ? "Sort A-Z" : "Sort by Date"}
                  </button>
                  <button className="btn btn-danger" onClick={clearAll}>
                    Clear All
                  </button>
                </div>
              </div>

              <div className="word-list">
                {loading ? (
                  <div className="loading">
                    <div className="loading-spinner" />
                    <p>Loading your word bank...</p>
                  </div>
                ) : filteredWords.length === 0 ? (
                  <div className="empty-state">
                    <h3>No words yet!</h3>
                    <p>
                      Start building your vocabulary by right-clicking on words while
                      browsing the web, or add words manually.
                    </p>
                  </div>
                ) : (
                  filteredWords.map((word) => (
                    <WordTile 
                      key={word.word} 
                      word={word} 
                      onDelete={deleteWord}
                      onShare={handleShareWord}
                    />
                  ))
                )}
              </div>

              <div className="footer">
                <button className="export-btn" onClick={exportWordBank}>
                  📤 Export Word Bank
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Word Sharing Modal */}
      <WordSharingModal
        word={shareWord}
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setShareWord(null);
        }}
      />

      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)'
          }
        }}
      />
    </div>
  );
}

// Enhanced WordTile component with sharing functionality
function WordTile({ word, onDelete, onShare }) {
  const category = getCategory(word);
  const badgeClass = `category-badge category-${category}`;
  
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(word.word);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onShare(word);
  };

  const handleRipple = (e) => {
    const tile = e.currentTarget;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${e.nativeEvent.offsetX}px`;
    ripple.style.top = `${e.nativeEvent.offsetY}px`;
    tile.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <div className="word-item" onClick={handleRipple}>
      <span 
        className={badgeClass} 
        style={{ background: CATEGORY_COLORS[category] || CATEGORY_COLORS.other }}
      >
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
      
      {word.progress && (
        <div className="mastery-indicator">
          <div 
            className="mastery-bar"
            style={{ width: `${word.progress.masteryLevel || 0}%` }}
          />
          <span className="mastery-text">{word.progress.masteryLevel || 0}%</span>
        </div>
      )}
      
      <div className="word-header">
        <div className="word-text">
          <i className="fas fa-book"></i>
          {word.word || "Unknown word"}
        </div>
        <span className="timestamp">
          {word.timestamp
            ? new Date(word.timestamp).toLocaleDateString()
            : "Unknown date"}
        </span>
      </div>
      
      <div className="word-details">
        {word.definitions && Array.isArray(word.definitions) && word.definitions.length > 0 && (
          <ul className="definitions-list">
            <li>{word.definitions[0].definition || "No definition available"}</li>
          </ul>
        )}
        <div className="source-info">
          <a
            href={word.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="source-link"
            title={word.url || ""}
            onClick={(e) => e.stopPropagation()}
          >
            <i className="fas fa-external-link-alt"></i>
            {word.pageTitle || "Source"}
          </a>
          <div className="url-display">{word.url || "No URL available"}</div>
        </div>
      </div>
      
      <div className="word-actions">
        <button 
          className="share-word-btn" 
          title="Share word"
          onClick={handleShare}
        >
          <Share2 size={16} />
        </button>
        <button 
          className="delete-word-btn" 
          title="Delete word" 
          onClick={handleDelete}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
}

// Main App wrapper with routing and authentication
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 