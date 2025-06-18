import React, { useState, useEffect } from "react";
import LearningDashboard from "./components/LearningDashboard";
import { initializeWordProgress } from "./utils/srsAlgorithm";
import "./index.css";

const CATEGORY_COLORS = {
  noun: "#42a5f5",
  verb: "#66bb6a",
  adjective: "#ab47bc",
  other: "#ffa726",
};

function getCategory(word) {
  return (word.category || word.definitions?.[0]?.partOfSpeech || "other").toLowerCase();
}

function App() {
  const [words, setWords] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("recent");
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("wordbank"); // 'wordbank' | 'learning'

  useEffect(() => {
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
      // Demo data for local dev
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
      ];
      setWords(demoWords);
      setLoading(false);
    }
  }, []);

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
  };

  // Clear all
  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear your entire word bank?")) {
      setWords([]);
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
  };

  if (currentView === "learning") {
    return (
      <div className="app-container">
        <nav className="app-nav">
          <button 
            className="nav-btn"
            onClick={() => setCurrentView("wordbank")}
          >
            📚 Word Bank
          </button>
          <button 
            className="nav-btn active"
            onClick={() => setCurrentView("learning")}
          >
            🎓 Learning
          </button>
        </nav>
        <LearningDashboard 
          words={words} 
          onUpdateWord={updateWord}
          onUpdateWords={updateWords}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav className="app-nav">
        <button 
          className="nav-btn active"
          onClick={() => setCurrentView("wordbank")}
        >
          📚 Word Bank
        </button>
        <button 
          className="nav-btn"
          onClick={() => setCurrentView("learning")}
        >
          🎓 Learning
        </button>
      </nav>
      
      <div className="container">
        <div className="header">
          <h1>📚 Word Bank</h1>
          <p>Your personal vocabulary collection</p>
        </div>
        <div className="stats">
          <div className="stat-item">
            <div className="stat-number">{totalWords}</div>
            <div className="stat-label">Total Words</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{thisWeek}</div>
            <div className="stat-label">This Week</div>
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
            <label htmlFor="categoryFilter" className="visually-hidden">
              Category Filter
            </label>
            <select
              className="filter-dropdown"
              id="categoryFilter"
              title="Category Filter"
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
            <button className="btn btn-primary" onClick={clearAll}>
              Clear All
            </button>
          </div>
        </div>
        <div className="word-list">
          {loading ? (
            <div className="loading">Loading your word bank...</div>
          ) : filteredWords.length === 0 ? (
            <div className="empty-state">
              <h3>No words yet!</h3>
              <p>
                Start building your vocabulary by right-clicking on words while
                browsing the web.
              </p>
            </div>
          ) : (
            filteredWords.map((word) => (
              <WordTile key={word.word} word={word} onDelete={deleteWord} />
            ))
          )}
        </div>
        <div className="footer">
          <button className="export-btn" onClick={exportWordBank}>
            📤 Export Word Bank
          </button>
        </div>
      </div>
    </div>
  );
}

function WordTile({ word, onDelete }) {
  const category = getCategory(word);
  const badgeClass = `category-badge category-${category}`;
  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(word.word);
  };

  // Ripple effect
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
      <span className={badgeClass} style={{ background: CATEGORY_COLORS[category] || CATEGORY_COLORS.other }}>
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
          >
            <i className="fas fa-external-link-alt"></i>
            {word.pageTitle || "Source"}
          </a>
          <div className="url-display">{word.url || "No URL available"}</div>
        </div>
      </div>
      <button className="delete-word-btn" title="Delete word" onClick={handleDelete}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}

export default App;
