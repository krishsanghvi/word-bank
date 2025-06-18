# 🎓 Word Bank Learning Platform

A comprehensive language learning platform built with React + Vite that transforms your vocabulary collection into an intelligent learning system with spaced repetition, flashcards, and progress tracking.

## ✨ Features

### 📚 **Core Word Bank**

- **Smart Word Collection**: Collect words from web browsing with Chrome extension
- **Intelligent Categorization**: Auto-categorize words by part of speech
- **Rich Definitions**: Store multiple definitions with examples
- **Source Tracking**: Keep track of where you found each word

### 🧠 **Spaced Repetition System (SRS)**

- **SM-2 Algorithm**: Research-based spaced repetition for optimal retention
- **Adaptive Scheduling**: Words appear more frequently based on difficulty
- **Mastery Tracking**: Visual progress indicators (0-100% mastery)
- **Learning Stages**: Progress through Learning → Review → Mastered stages
- **Smart Difficulty Assessment**: Automatic difficulty adjustment based on performance

### 🎯 **Interactive Learning Modes**

#### **Flashcard Review**

- **Dual Mode Learning**: Word→Definition and Definition→Word
- **4-Point Rating System**: Rate difficulty from "Again" to "Easy"
- **Keyboard Shortcuts**: Space to flip, 1-6 to rate, S to speak
- **Text-to-Speech**: Built-in pronunciation using Web Speech API
- **Session Statistics**: Track accuracy and progress in real-time

#### **Learning Dashboard**

- **Smart Review Queue**: See exactly which words need review
- **New Word Introduction**: Controlled introduction of new vocabulary
- **Progress Visualization**: Beautiful charts showing learning stages
- **Performance Analytics**: Accuracy rates, mastery levels, and trends

### 📊 **Analytics & Progress Tracking**

- **Comprehensive Stats**: Total words, mastered count, accuracy percentages
- **Learning Stages Breakdown**: Visual representation of learning progress
- **Mastery Indicators**: Individual word progress shown on each card
- **Historical Tracking**: Review intervals and performance over time

### 🎨 **Modern UI/UX**

- **Responsive Design**: Works perfectly on desktop and mobile
- **Dark/Light Themes**: Automatic theme switching with CSS variables
- **Smooth Animations**: Micro-interactions and hover effects
- **Card-Based Layout**: Clean, modern interface with intuitive navigation
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 **Getting Started**

### Prerequisites

- Node.js 16+ and npm
- Modern web browser with ES6+ support

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd word-bank-extension/wordbank-ui
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Chrome Extension Integration

1. **Load the extension**

   - Open Chrome → Extensions → Developer mode
   - Load unpacked → Select `word-bank-extension` folder

2. **Collect words**
   - Right-click on any word while browsing
   - Select "Add to Word Bank"
   - Words automatically sync with the learning platform

## 🎯 **How to Use**

### **Word Bank View**

- Browse your collected vocabulary
- Search and filter by category
- Export your word bank as JSON
- View mastery progress for each word

### **Learning Dashboard**

- **Review Due**: See words that need review with difficulty breakdown
- **Learn New Words**: Introduce new vocabulary in controlled batches
- **Progress Tracking**: Monitor your learning journey with visual indicators
- **Quick Stats**: Get insights into your learning performance

### **Flashcard Review**

- Choose between Word→Definition or Definition→Word mode
- Use keyboard shortcuts for efficient review:
  - **Space**: Flip card
  - **1-6**: Rate difficulty (1=Again, 6=Easy)
  - **S**: Speak word aloud
- Rate each word based on how well you knew it
- Complete sessions to see your progress

## 🧠 **Learning Algorithm**

Our spaced repetition system is based on the proven SM-2 algorithm:

### **Rating System**

- **6 (Easy)**: Perfect recall, increase interval significantly
- **5 (Good)**: Correct recall, normal interval increase
- **4 (Hard)**: Correct but difficult, smaller interval increase
- **3 (Correct)**: Barely correct, minimal interval increase
- **2 (Incorrect)**: Wrong but remembered with hint, reset interval
- **1 (Again)**: Complete failure, reset to beginning

### **Mastery Calculation**

- **Accuracy**: Percentage of correct answers
- **Consistency Bonus**: Extra points for consistent correct answers
- **Final Score**: Accuracy + Consistency (0-100%)

### **Review Scheduling**

- **New Words**: Review immediately, then after 6 days
- **Learning**: 1 day intervals until consistently correct
- **Review**: Exponentially increasing intervals (6, 15, 35+ days)
- **Mastered**: Long intervals (21+ days) for maintenance

## 🛠 **Technical Architecture**

### **Frontend Stack**

- **React 18**: Modern hooks-based components
- **Vite**: Fast development and optimized builds
- **CSS Variables**: Dynamic theming system
- **Web Speech API**: Text-to-speech functionality
- **Chrome Storage API**: Persistent data storage

### **Key Components**

```
src/
├── components/
│   ├── LearningDashboard.jsx    # Main learning interface
│   ├── FlashcardReview.jsx      # SRS flashcard system
│   └── *.css                    # Component styles
├── utils/
│   └── srsAlgorithm.js          # Spaced repetition logic
├── types.js                     # TypeScript-style interfaces
└── App.jsx                      # Main application
```

### **Data Structures**

- **Word Objects**: Complete vocabulary entries with progress
- **Progress Tracking**: SRS intervals, mastery levels, statistics
- **User Stats**: Learning analytics and achievement tracking

## 🎨 **Customization**

### **Themes**

The app uses CSS variables for easy theming:

```css
:root {
  --primary-color: #4caf50;
  --bg-color: #f8f9fa;
  --card-bg: #ffffff;
  --text-primary: #333333;
  /* ... */
}
```

### **SRS Parameters**

Adjust learning algorithm in `src/utils/srsAlgorithm.js`:

- Initial intervals
- Ease factor calculations
- Mastery thresholds
- Difficulty weights

## 📈 **Roadmap**

### **Phase 2: Interactive Learning Modes**

- [ ] Multiple choice quizzes
- [ ] Fill-in-the-blank exercises
- [ ] Sentence building games
- [ ] Synonym/antonym matching

### **Phase 3: Gamification**

- [ ] Streak counters and XP system
- [ ] Achievement badges
- [ ] Daily challenges
- [ ] Leaderboards

### **Phase 4: Advanced Features**

- [ ] AI-powered suggestions
- [ ] Image associations
- [ ] Voice recording practice
- [ ] Cross-platform sync

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **SM-2 Algorithm**: Based on SuperMemo research
- **Material Design**: UI inspiration
- **React Community**: Excellent documentation and tools
- **Chrome Extensions**: Seamless browser integration

---

**Start your vocabulary learning journey today! 🚀**
