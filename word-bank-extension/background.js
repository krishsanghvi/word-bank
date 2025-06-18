// Background script for handling storage and context menus

// Listen for extension icon click to open/focus the word bank tab
chrome.action.onClicked.addListener(async () => {
  const url = chrome.runtime.getURL('wordbank.html');
  // Query all tabs to see if the word bank is already open
  const tabs = await chrome.tabs.query({ url });
  if (tabs.length > 0) {
    // Focus the first matching tab
    chrome.tabs.update(tabs[0].id, { active: true });
    chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    // Open a new tab
    chrome.tabs.create({ url });
  }
});

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

      // Automatically update badge when word bank changes
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.wordBank) {
          const wordBank = changes.wordBank.newValue || {};
          chrome.action.setBadgeText({
            text: Object.keys(wordBank).length > 0 ? Object.keys(wordBank).length.toString() : ''
          });
          chrome.action.setBadgeBackgroundColor({
            color: '#4CAF50'
          });
        }
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
      
      // Only handle context menu related actions
      if (request.action === 'updateBadge') {
        try {
          this.updateBadge(request.count);
          sendResponse({ success: true });
        } catch (error) {
          console.error('Error updating badge:', error);
          sendResponse({ success: false });
        }
        return true;
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
      try {
        const result = await chrome.storage.local.get(['wordBank']);
        const wordBank = result.wordBank || {};
        this.updateBadge(Object.keys(wordBank).length);
      } catch (error) {
        console.error('Error initializing badge:', error);
      }
    }
  }
  
  // Initialize background script
  const wordBankBackground = new WordBankBackground();
  wordBankBackground.initializeBadge();