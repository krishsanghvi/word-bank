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
          x: rect.left + window.scrollX,
          y: rect.bottom + window.scrollY
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
  
      // Calculate popup position
      const popupWidth = 320;
      const popupHeight = 200;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Ensure popup stays within viewport
      const left = Math.min(Math.max(x, 0), viewportWidth - popupWidth);
      const top = Math.min(Math.max(y, 0), viewportHeight - popupHeight);

      this.definitionPopup.style.left = `${left}px`;
      this.definitionPopup.style.top = `${top}px`;
  
      document.body.appendChild(this.definitionPopup);
  
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
        saveBtn.addEventListener('click', () => this.saveWord(entry));
  
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
  
        const saveBtn = contentDiv.querySelector('.save-word-btn');
        saveBtn.addEventListener('click', () => this.saveWord(null));
      }
    }
  
    async saveWord(definitionData) {
      try {
        console.log('Attempting to save word:', this.selectedWord);
        const wordEntry = {
          word: this.selectedWord,
          timestamp: Date.now(),
          url: window.location.href,
          pageTitle: document.title,
          definitions: definitionData ? this.extractDefinitions(definitionData) : [],
          saved: true
        };
        console.log('Word entry prepared:', wordEntry);

        // Send to background script for storage and wait for response
        const response = await new Promise((resolve) => {
          console.log('Sending message to background script...');
          chrome.runtime.sendMessage({
            action: 'saveWord',
            wordEntry: wordEntry
          }, (response) => {
            console.log('Received response from background:', response);
            resolve(response);
          });
        });

        if (response && response.success) {
          console.log('Word saved successfully');
          this.showSaveConfirmation();
        } else {
          console.error('Failed to save word - no success response');
          throw new Error('Failed to save word');
        }
      } catch (error) {
        console.error('Error saving word:', error);
        this.showSaveError();
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
      const saveBtn = this.definitionPopup.querySelector('.save-word-btn');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = '✅ Saved!';
      saveBtn.style.backgroundColor = '#4CAF50';
      
      setTimeout(() => {
        if (this.definitionPopup) {
          saveBtn.textContent = originalText;
          saveBtn.style.backgroundColor = '';
        }
      }, 2000);
    }
  
    showSaveError() {
      const saveBtn = this.definitionPopup.querySelector('.save-word-btn');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = '❌ Save Failed';
      saveBtn.style.backgroundColor = '#f44336';
      
      setTimeout(() => {
        if (this.definitionPopup) {
          saveBtn.textContent = originalText;
          saveBtn.style.backgroundColor = '';
        }
      }, 2000);
    }
  
    hidePopup() {
      if (this.definitionPopup) {
        this.definitionPopup.remove();
        this.definitionPopup = null;
      }
    }
  }
  
  // Initialize the extension
  const wordBankExtension = new WordBankExtension();