// Background script for handling storage and context menus

class WordBankBackground {
    constructor() {
      this.init();
    }
  
    init() {
      // Listen for messages from content script
      chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
      
      // Create context menu
      chrome.runtime.onInstalled.addListener(() => {
        this.createContextMenu();
      });
    }
  
    createContextMenu() {
      chrome.contextMenus.create({
        id: 'define-word',
        title: 'Define "%s"',
        contexts: ['selection']
      });
  
      chrome.contextMenus.onClicked.addListener((info, tab) => {
        if (info.menuItemId === 'define-word' && info.selectionText) {
          chrome.tabs.sendMessage(tab.id, {
            action: 'defineWord',
            word: info.selectionText.trim()
          });
        }
      });
    }
  
    async handleMessage(request, sender, sendResponse) {
      console.log('Background script received message:', request.action);
      
      // Wrap the entire handler in a Promise to ensure async operations complete
      const handleRequest = async () => {
        try {
          switch (request.action) {
            case 'saveWord':
              console.log('Attempting to save word:', request.wordEntry.word);
              const result = await this.saveWordToStorage(request.wordEntry);
              console.log('Save result:', result);
              return { success: result };
              
            case 'getWordBank':
              console.log('Fetching word bank');
              const wordBank = await this.getWordBank();
              console.log('Word bank retrieved:', Object.keys(wordBank).length, 'words');
              return { wordBank: wordBank };
              
            case 'deleteWord':
              console.log('Attempting to delete word:', request.word);
              const deleted = await this.deleteWord(request.word);
              console.log('Delete result:', deleted);
              return { success: deleted };
              
            case 'exportWordBank':
              console.log('Exporting word bank');
              const exportData = await this.exportWordBank();
              return { data: exportData };
          }
        } catch (error) {
          console.error('Error handling message:', error);
          return { success: false, error: error.message };
        }
      };

      // Execute the handler and send the response
      handleRequest().then(response => {
        console.log('Sending response:', response);
        sendResponse(response);
      });

      return true; // Keep message channel open for async response
    }
  
    async saveWordToStorage(wordEntry) {
      try {
        console.log('Getting existing word bank...');
        const result = await chrome.storage.local.get(['wordBank']);
        const wordBank = result.wordBank || {};
        console.log('Current word bank size:', Object.keys(wordBank).length);
        
        // Add new word (or update existing)
        wordBank[wordEntry.word] = {
          ...wordEntry,
          lastUpdated: Date.now()
        };
        console.log('Updated word bank size:', Object.keys(wordBank).length);
        
        // Save back to storage
        console.log('Saving to chrome.storage...');
        await chrome.storage.local.set({ wordBank });
        console.log('Storage update complete');
        
        // Update badge
        this.updateBadge(Object.keys(wordBank).length);
        
        return true;
      } catch (error) {
        console.error('Error in saveWordToStorage:', error);
        return false;
      }
    }
  
    async getWordBank() {
      try {
        console.log('Getting word bank from storage...');
        const result = await chrome.storage.local.get(['wordBank']);
        if (!result.wordBank) {
          console.log('No word bank found, initializing empty bank');
          const emptyBank = {};
          await chrome.storage.local.set({ wordBank: emptyBank });
          return emptyBank;
        }
        console.log('Word bank retrieved successfully');
        return result.wordBank;
      } catch (error) {
        console.error('Error in getWordBank:', error);
        return {};
      }
    }
  
    async deleteWord(word) {
      try {
        const result = await chrome.storage.local.get(['wordBank']);
        const wordBank = result.wordBank || {};
        
        if (wordBank[word]) {
          delete wordBank[word];
          await chrome.storage.local.set({ wordBank });
          this.updateBadge(Object.keys(wordBank).length);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error deleting word:', error);
        return false;
      }
    }
  
    async exportWordBank() {
      try {
        const wordBank = await this.getWordBank();
        const exportData = {
          exportDate: new Date().toISOString(),
          totalWords: Object.keys(wordBank).length,
          words: Object.values(wordBank).sort((a, b) => b.timestamp - a.timestamp)
        };
        return exportData;
      } catch (error) {
        console.error('Error exporting word bank:', error);
        return null;
      }
    }
  
    updateBadge(count) {
      chrome.action.setBadgeText({
        text: count > 0 ? count.toString() : ''
      });
      chrome.action.setBadgeBackgroundColor({
        color: '#4CAF50'
      });
    }
  
    // Initialize badge count on startup
    async initializeBadge() {
      const wordBank = await this.getWordBank();
      this.updateBadge(Object.keys(wordBank).length);
    }
  }
  
  // Initialize background script
  const wordBankBackground = new WordBankBackground();
  wordBankBackground.initializeBadge();