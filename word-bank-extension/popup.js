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
        
        // Access storage directly instead of through background script
        const result = await new Promise((resolve) => {
          chrome.storage.local.get(['wordBank'], (result) => {
            console.log('Popup: Direct storage access result:', result);
            resolve(result);
          });
        });

        // Handle word bank as an array
        this.wordBank = Array.isArray(result.wordBank) ? result.wordBank : [];
        this.filteredWords = [...this.wordBank];
        console.log('Popup: Word bank loaded with', this.wordBank.length, 'words');
        
        // Update the UI
        this.renderWordList();
        this.updateStats();
      } catch (error) {
        console.error('Popup: Error loading word bank:', error);
        this.wordBank = [];
        this.filteredWords = [];
        // Still update UI even if there's an error
        this.renderWordList();
        this.updateStats();
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
        this.filteredWords = [...this.wordBank];
      } else {
        this.filteredWords = this.wordBank.filter(word => 
          word.word.toLowerCase().includes(term) ||
          (word.definitions && word.definitions.some(def => 
            def.definition.toLowerCase().includes(term) ||
            (def.partOfSpeech && def.partOfSpeech.toLowerCase().includes(term))
          ))
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
      
      if (!this.filteredWords || this.filteredWords.length === 0) {
        wordList.innerHTML = `
          <div class="empty-state">
            <h3>No words yet!</h3>
            <p>Start building your vocabulary by right-clicking on words while browsing the web.</p>
          </div>
        `;
        return;
      }

      // Debug log to see the structure of filtered words
      console.log('Filtered words:', this.filteredWords);
  
      wordList.innerHTML = ''; // Clear the list first
      this.filteredWords.forEach(word => {
        if (word && typeof word === 'object') {
          const wordElement = this.createWordItem(word);
          if (wordElement) {
            wordList.appendChild(wordElement);
          }
        }
      });
    }
  
    createWordItem(word) {
        if (!word || typeof word !== 'object') {
            console.error('Invalid word object:', word);
            return null;
        }

        console.log('Creating word item for:', word);
        
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        
        // Create word header
        const wordHeader = document.createElement('div');
        wordHeader.className = 'word-header';
        
        const wordText = document.createElement('span');
        wordText.className = 'word-text';
        wordText.textContent = word.word || 'Unknown word';
        
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = word.timestamp ? new Date(word.timestamp).toLocaleDateString() : 'Unknown date';
        
        wordHeader.appendChild(wordText);
        wordHeader.appendChild(timestamp);
        
        // Create word details
        const wordDetails = document.createElement('div');
        wordDetails.className = 'word-details';
        
        // Add definitions if they exist
        if (word.definitions && Array.isArray(word.definitions)) {
            const definitionsList = document.createElement('ul');
            definitionsList.className = 'definitions-list';
            
            word.definitions.forEach(def => {
                if (def && typeof def === 'object') {
                    const li = document.createElement('li');
                    li.textContent = def.definition || 'No definition available';
                    definitionsList.appendChild(li);
                }
            });
            
            if (definitionsList.children.length > 0) {
                wordDetails.appendChild(definitionsList);
            }
        }
        
        // Add source information with URL
        const sourceInfo = document.createElement('div');
        sourceInfo.className = 'source-info';
        
        // Create source link
        const sourceLink = document.createElement('a');
        sourceLink.href = word.url || '#';
        sourceLink.target = '_blank';
        sourceLink.className = 'source-link';
        sourceLink.textContent = word.pageTitle || 'Source';
        sourceLink.title = word.url || '';
        
        // Create URL display
        const urlDisplay = document.createElement('div');
        urlDisplay.className = 'url-display';
        urlDisplay.textContent = word.url || 'No URL available';
        
        sourceInfo.appendChild(sourceLink);
        sourceInfo.appendChild(urlDisplay);
        wordDetails.appendChild(sourceInfo);
        
        // Add delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-word-btn';
        deleteBtn.textContent = '×';
        deleteBtn.title = 'Delete word';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            this.deleteWord(word.word);
        };
        
        wordItem.appendChild(wordHeader);
        wordItem.appendChild(wordDetails);
        wordItem.appendChild(deleteBtn);
        
        return wordItem;
    }
  
    async deleteWord(wordToDelete) {
      if (confirm(`Are you sure you want to delete "${wordToDelete}" from your word bank?`)) {
        try {
          // Remove word from storage
          const result = await chrome.storage.local.get('wordBank');
          const wordBank = Array.isArray(result.wordBank) ? result.wordBank : [];
          const updatedWordBank = wordBank.filter(word => word.word !== wordToDelete);
          await chrome.storage.local.set({ wordBank: updatedWordBank });
          
          // Update local state
          this.wordBank = updatedWordBank;
          this.filteredWords = this.filteredWords.filter(word => word.word !== wordToDelete);
          this.renderWordList();
          this.updateStats();
        } catch (error) {
          console.error('Error deleting word:', error);
          alert('Failed to delete word. Please try again.');
        }
      }
    }
  
    async clearAllWords() {
      if (confirm('Are you sure you want to clear your entire word bank? This action cannot be undone.')) {
        try {
          await chrome.storage.local.set({ wordBank: [] });
          this.wordBank = [];
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
        try {
            const totalWords = this.wordBank.length;
            const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            const thisWeekWords = this.wordBank.filter(
                word => word.timestamp > oneWeekAgo
            ).length;

            // Get stat elements
            const totalWordsElement = document.querySelector('.stat-number');
            const thisWeekElement = document.querySelector('.stat-label');

            // Update stats if elements exist
            if (totalWordsElement) {
                totalWordsElement.textContent = totalWords;
            }
            if (thisWeekElement) {
                thisWeekElement.textContent = `${thisWeekWords} words this week`;
            }
        } catch (error) {
            console.error('Error updating stats:', error);
        }
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

    async saveWord(wordEntry) {
      try {
        console.log('Popup: Saving word:', wordEntry.word);
        const result = await new Promise((resolve) => {
          chrome.storage.local.get(['wordBank'], (result) => {
            const wordBank = result.wordBank || {};
            wordBank[wordEntry.word] = {
              ...wordEntry,
              lastUpdated: Date.now()
            };
            chrome.storage.local.set({ wordBank }, () => {
              resolve(true);
            });
          });
        });

        if (result) {
          // Update local state
          this.wordBank[wordEntry.word] = wordEntry;
          this.filteredWords = Object.values(this.wordBank);
          this.renderWordList();
          this.updateStats();
          return true;
        }
        return false;
      } catch (error) {
        console.error('Popup: Error saving word:', error);
        return false;
      }
    }
  }
  
  // Initialize popup when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    new WordBankPopup();
  });