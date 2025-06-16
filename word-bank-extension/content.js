// Content script for word selection and definition display

class WordBankExtension {
    constructor() {
      this.selectedWord = '';
      this.definitionPopup = null;
      this.init();
    }
  
    init() {
      // Add event listeners for word selection
      document.addEventListener('mouseup', this.handleTextSelection.bind(this));
      document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
      document.addEventListener('click', this.hidePopup.bind(this));
    }
  
    handleTextSelection(event) {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText && this.isValidWord(selectedText)) {
        this.selectedWord = selectedText.toLowerCase();
        // Store the selection coordinates for popup positioning
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        this.selectionCoords = {
          x: rect.left,
          y: rect.bottom,
          width: rect.width,
          height: rect.height
        };
      } else {
        this.selectedWord = '';
        this.selectionCoords = null;
      }
    }
  
    handleContextMenu(event) {
      if (this.selectedWord) {
        // Only prevent default if we have a valid word
        event.preventDefault();
        event.stopPropagation();
        
        // Use stored coordinates or fallback to event coordinates
        const x = this.selectionCoords ? this.selectionCoords.x : event.pageX;
        const y = this.selectionCoords ? this.selectionCoords.y : event.pageY;
        
        this.showDefinitionPopup(x, y);
      }
    }
  
    isValidWord(text) {
      // More lenient word validation
      return /^[a-zA-Z][a-zA-Z-']*$/.test(text) && text.length > 1 && text.length < 50;
    }
  
    async showDefinitionPopup(x, y) {
      // Remove existing popup
      this.hidePopup();
  
      // Create popup element
      this.definitionPopup = document.createElement('div');
      this.definitionPopup.className = 'word-bank-popup';
      this.definitionPopup.innerHTML = `
        <div class="popup-header">
          <h3>${this.selectedWord}</h3>
          <button class="close-btn">&times;</button>
        </div>
        <div class="popup-content">
          <div class="loading">Loading definition...</div>
        </div>
      `;
  
      // Add popup to document first (but make it invisible) to get its dimensions
      this.definitionPopup.style.visibility = 'hidden';
      document.body.appendChild(this.definitionPopup);
      
      // Get popup dimensions
      const popupRect = this.definitionPopup.getBoundingClientRect();
      const popupWidth = popupRect.width;
      const popupHeight = popupRect.height;
      
      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Get word position
      const wordRect = this.selectionCoords;
      
      // Calculate position
      let left, top;
      
      // Horizontal positioning (center under the word)
      left = wordRect.x + (wordRect.width / 2) - (popupWidth / 2);
      
      // Ensure popup stays within viewport horizontally
      if (left < 10) {
        left = 10; // Keep some margin from the left edge
      } else if (left + popupWidth > viewportWidth - 10) {
        left = viewportWidth - popupWidth - 10; // Keep some margin from the right edge
      }
      
      // Vertical positioning (below the word)
      top = wordRect.y + 5; // 5px gap between word and popup
      
      // If popup would go below viewport, position it above the word
      if (top + popupHeight > viewportHeight - 10) {
        top = wordRect.y - popupHeight - 5; // 5px gap above word
      }
      
      // Add scroll offset
      top += window.scrollY;
      left += window.scrollX;
      
      // Apply the position and make popup visible
      this.definitionPopup.style.position = 'absolute';
      this.definitionPopup.style.left = `${left}px`;
      this.definitionPopup.style.top = `${top}px`;
      this.definitionPopup.style.visibility = 'visible';
      this.definitionPopup.style.zIndex = '999999';
  
      // Add event listeners
      this.definitionPopup.querySelector('.close-btn').addEventListener('click', this.hidePopup.bind(this));
      
      // Fetch and display definition
      await this.fetchAndDisplayDefinition();
    }
  
    async fetchAndDisplayDefinition() {
      try {
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${this.selectedWord}`);
        
        if (!response.ok) {
          throw new Error('Word not found');
        }
  
        const data = await response.json();
        const entry = data[0];
        
        // Store definitions for later use
        this.definitions = this.extractDefinitions(entry);
        
        let definitionsHtml = '';
        
        entry.meanings.forEach((meaning, index) => {
          if (index < 3) { // Show max 3 meanings
            const definition = meaning.definitions[0];
            definitionsHtml += `
              <div class="definition-item">
                <span class="part-of-speech">${meaning.partOfSpeech}</span>
                <p class="definition">${definition.definition}</p>
                ${definition.example ? `<p class="example"><em>"${definition.example}"</em></p>` : ''}
              </div>
            `;
          }
        });
  
        const contentDiv = this.definitionPopup.querySelector('.popup-content');
        contentDiv.innerHTML = `
          ${definitionsHtml}
          <div class="popup-actions">
            <button class="save-word-btn" data-word="${this.selectedWord}">
              📚 Save to Word Bank
            </button>
          </div>
        `;
  
        // Add save functionality
        const saveBtn = contentDiv.querySelector('.save-word-btn');
        saveBtn.addEventListener('click', () => this.saveWord());
  
      } catch (error) {
        const contentDiv = this.definitionPopup.querySelector('.popup-content');
        contentDiv.innerHTML = `
          <div class="error">
            <p>Sorry, couldn't find a definition for "${this.selectedWord}"</p>
            <button class="save-word-btn" data-word="${this.selectedWord}">
              📚 Save anyway
            </button>
          </div>
        `;
  
        // Clear definitions when word is not found
        this.definitions = [];
        const saveBtn = contentDiv.querySelector('.save-word-btn');
        saveBtn.addEventListener('click', () => this.saveWord());
      }
    }
  
    async saveWord() {
        try {
            // Check if extension context is valid
            if (!chrome.runtime?.id) {
                throw new Error('Extension context invalidated');
            }

            console.log('Attempting to save word:', this.selectedWord);
            const wordEntry = {
                word: this.selectedWord,
                timestamp: Date.now(),
                url: window.location.href,
                pageTitle: document.title,
                definitions: this.definitions || [], // Use stored definitions or empty array
                saved: true
            };
            console.log('Word entry prepared:', wordEntry);

            // Save to storage
            const result = await chrome.storage.local.get('wordBank');
            const wordBank = Array.isArray(result.wordBank) ? result.wordBank : [];
            wordBank.push(wordEntry);
            await chrome.storage.local.set({ wordBank });
            console.log('Word saved successfully');

            // Show confirmation before closing
            this.showSaveConfirmation();
            
            // Close popup after a short delay
            setTimeout(() => {
                this.closePopup();
            }, 1500);
        } catch (error) {
            console.error('Error saving word:', error);
            
            // Handle extension context invalidation
            if (error.message === 'Extension context invalidated') {
                this.showNotification('Extension was reloaded. Please refresh the page to continue using the word bank.', 'error');
            } else {
                this.showNotification('Error saving word. Please try again.', 'error');
            }
            
            this.closePopup();
        }
    }
  
    extractDefinitions(data) {
      const definitions = [];
      data.meanings.forEach(meaning => {
        meaning.definitions.forEach(def => {
          definitions.push({
            partOfSpeech: meaning.partOfSpeech,
            definition: def.definition,
            example: def.example || null
          });
        });
      });
      return definitions.slice(0, 5); // Keep max 5 definitions
    }
  
    showSaveConfirmation() {
        const popup = document.getElementById('word-bank-popup');
        if (!popup) return;

        const message = document.createElement('div');
        message.className = 'save-confirmation';
        message.textContent = 'Word saved successfully!';
        popup.appendChild(message);
    }
  
    showSaveError() {
        const popup = document.getElementById('word-bank-popup');
        if (!popup) return;

        const message = document.createElement('div');
        message.className = 'save-error';
        message.textContent = 'Error saving word. Please try again.';
        popup.appendChild(message);
    }
  
    hidePopup() {
      if (this.definitionPopup) {
        this.definitionPopup.remove();
        this.definitionPopup = null;
      }
    }

    closePopup() {
        if (this.definitionPopup) {
            this.definitionPopup.remove();
            this.definitionPopup = null;
        }
        // Clear any existing notification
        const existingNotification = document.querySelector('.word-bank-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
    }

    showNotification(message, type = 'success') {
        // Remove any existing notification
        const existingNotification = document.querySelector('.word-bank-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `word-bank-notification ${type}`;
        notification.textContent = message;
        
        // Add styles for the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 14px;
            z-index: 10000;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: opacity 0.3s ease;
            ${type === 'error' ? 'background-color: #d32f2f;' : 'background-color: #4caf50;'}
        `;

        document.body.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
  }
  
  // Initialize the extension
  const wordBankExtension = new WordBankExtension();