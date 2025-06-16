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
      switch (request.action) {
        case 'saveWord':
          const result = await this.saveWordToStorage(request.wordEntry);
          sendResponse({ success: result });
          break;
          
        case 'getWordBank':
          const wordBank = await this.getWordBank();
          sendResponse({ wordBank });
          break;
          
        case 'deleteWord':
          const deleted = await this.deleteWord(request.word);
          sendResponse({ success: deleted });
          break;
          
        case 'exportWordBank':
          const exportData = await this.exportWordBank();
          sendResponse({ data: exportData });
          break;
      }
      return true; // Keep message channel open for async response
    }
  
    async saveWordToStorage(wordEntry) {
      try {
        // Get existing word bank
        const result = await chrome.storage.local.get(['wordBank']);
        const wordBank = result.wordBank || {};
        
        // Add new word (or update existing)
        wordBank[wordEntry.word] = wordEntry;
        
        // Save back to storage
        await chrome.storage.local.set({ wordBank });
        
        // Update badge
        this.updateBadge(Object.keys(wordBank).length);
        
        return true;
      } catch (error) {
        console.error('Error saving word:', error);
        return false;
      }
    }
  
    async getWordBank() {
      try {
        const result = await chrome.storage.local.get(['wordBank']);
        return result.wordBank || {};
      } catch (error) {
        console.error('Error getting word bank:', error);
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