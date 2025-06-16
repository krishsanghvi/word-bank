// Popup script for managing the word bank interface

class WordBankPopup {
    constructor() {
      this.wordBank = {};
      this.filteredWords = [];
      this.sortOrder = 'recent'; // 'recent', 'alphabetical'
      this.init();
    }
  
    async init() {
      await this.loadWordBank();
      this.setupEventListeners();
      this.renderWordList();
      this.updateStats();
    }
  
    async loadWordBank() {
      try {
        console.log('Popup: Loading word bank...');
        const response = await new Promise((resolve) => {
          chrome.runtime.sendMessage({ action: 'getWordBank' }, (response) => {
            console.log('Popup: Raw response from background:', response);
            resolve(response);
          });
        });
        
        console.log('Popup: Processed word bank response:', response);
        
        if (!response) {
          console.error('Popup: No response received from background script');
          this.wordBank = {};
          this.filteredWords = [];
          return;
        }

        this.wordBank = response.wordBank || {};
        this.filteredWords = Object.values(this.wordBank);
        console.log('Popup: Word bank loaded with', Object.keys(this.wordBank).length, 'words');
        
        // Update the UI
        this.renderWordList();
        this.updateStats();
      } catch (error) {
        console.error('Popup: Error loading word bank:', error);
        this.wordBank = {};
        this.filteredWords = [];
      }
    }
  
    setupEventListeners() {
      // Search functionality
      const searchBox = document.getElementById('searchBox');
      searchBox.addEventListener('input', (e) => {
        this.filterWords(e.target.value);
      });
  
      // Sort button
      const sortBtn = document.getElementById('sortBtn');
      sortBtn.addEventListener('click', () => {
        this.toggleSort();
      });
  
      // Clear all button
      const clearBtn = document.getElementById('clearBtn');
      clearBtn.addEventListener('click', () => {
        this.clearAllWords();
      });
  
      // Export button
      const exportBtn = document.getElementById('exportBtn');
      exportBtn.addEventListener('click', () => {
        this.exportWordBank();
      });
    }
  
    filterWords(searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      
      if (!term) {
        this.filteredWords = Object.values(this.wordBank);
      } else {
        this.filteredWords = Object.values(this.wordBank).filter(word => 
          word.word.toLowerCase().includes(term) ||
          word.definitions.some(def => 
            def.definition.toLowerCase().includes(term) ||
            def.partOfSpeech.toLowerCase().includes(term)
          )
        );
      }
      
      this.renderWordList();
    }
  
    toggleSort() {
      const sortBtn = document.getElementById('sortBtn');
      
      if (this.sortOrder === 'recent') {
        this.sortOrder = 'alphabetical';
        sortBtn.textContent = 'Sort by Date';
        this.filteredWords.sort((a, b) => a.word.localeCompare(b.word));
      } else {
        this.sortOrder = 'recent';
        sortBtn.textContent = 'Sort A-Z';
        this.filteredWords.sort((a, b) => b.timestamp - a.timestamp);
      }
      
      this.renderWordList();
    }
  
    renderWordList() {
      const wordList = document.getElementById('wordList');
      
      if (this.filteredWords.length === 0) {
        wordList.innerHTML = `
          <div class="empty-state">
            <h3>No words yet!</h3>
            <p>Start building your vocabulary by right-clicking on words while browsing the web.</p>
          </div>
        `;
        return;
      }
  
      const wordsHtml = this.filteredWords.map(word => this.createWordItem(word)).join('');
      wordList.innerHTML = wordsHtml;
  
      // Add event listeners for delete buttons
      wordList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const wordToDelete = e.target.dataset.word;
          this.deleteWord(wordToDelete);
        });
      });
    }
  
    createWordItem(word) {
      const date = new Date(word.timestamp).toLocaleDateString();
      const mainDefinition = word.definitions.length > 0 
        ? word.definitions[0] 
        : { definition: 'No definition available', partOfSpeech: '' };
  
      const sourceInfo = word.pageTitle 
        ? `from "${word.pageTitle}"` 
        : `from ${new URL(word.url).hostname}`;
  
      return `
        <div class="word-item">
          <div class="word-header">
            <div class="word-title">${word.word}</div>
            <div class="word-date">${date}</div>
          </div>
          
          ${mainDefinition.partOfSpeech ? `<div class="part-of-speech" style="display: inline-block; background: #e8f5e8; color: #2e7d32; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-bottom: 5px;">${mainDefinition.partOfSpeech}</div>` : ''}
          
          <div class="word-definition">${mainDefinition.definition}</div>
          
          <div class="word-source">${sourceInfo}</div>
          
          <div class="word-actions">
            <button class="action-btn delete-btn" data-word="${word.word}">🗑️ Delete</button>
          </div>
        </div>
      `;
    }
  
    async deleteWord(wordToDelete) {
      if (confirm(`Are you sure you want to delete "${wordToDelete}" from your word bank?`)) {
        try {
          const response = await chrome.runtime.sendMessage({
            action: 'deleteWord',
            word: wordToDelete
          });
          
          if (response.success) {
            delete this.wordBank[wordToDelete];
            this.filteredWords = this.filteredWords.filter(word => word.word !== wordToDelete);
            this.renderWordList();
            this.updateStats();
          }
        } catch (error) {
          console.error('Error deleting word:', error);
          alert('Failed to delete word. Please try again.');
        }
      }
    }
  
    async clearAllWords() {
      if (confirm('Are you sure you want to clear your entire word bank? This action cannot be undone.')) {
        try {
          // Delete each word individually
          const deletePromises = Object.keys(this.wordBank).map(word => 
            chrome.runtime.sendMessage({ action: 'deleteWord', word })
          );
          
          await Promise.all(deletePromises);
          
          this.wordBank = {};
          this.filteredWords = [];
          this.renderWordList();
          this.updateStats();
        } catch (error) {
          console.error('Error clearing word bank:', error);
          alert('Failed to clear word bank. Please try again.');
        }
      }
    }
  
    updateStats() {
      const totalWords = Object.keys(this.wordBank).length;
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const thisWeekWords = Object.values(this.wordBank).filter(
        word => word.timestamp > oneWeekAgo
      ).length;
  
      document.getElementById('totalWords').textContent = totalWords;
      document.getElementById('thisWeek').textContent = thisWeekWords;
    }
  
    async exportWordBank() {
      try {
        const response = await chrome.runtime.sendMessage({ action: 'exportWordBank' });
        
        if (response.data) {
          const dataStr = JSON.stringify(response.data, null, 2);
          const dataBlob = new Blob([dataStr], { type: 'application/json' });
          
          const url = URL.createObjectURL(dataBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `word-bank-export-${new Date().toISOString().split('T')[0]}.json`;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          URL.revokeObjectURL(url);
          
          // Show confirmation
          const exportBtn = document.getElementById('exportBtn');
          const originalText = exportBtn.textContent;
          exportBtn.textContent = '✅ Exported!';
          setTimeout(() => {
            exportBtn.textContent = originalText;
          }, 2000);
        }
      } catch (error) {
        console.error('Error exporting word bank:', error);
        alert('Failed to export word bank. Please try again.');
      }
    }
  }
  
  // Initialize popup when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    new WordBankPopup();
  });