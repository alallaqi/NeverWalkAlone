class MultipleChoice extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.selectedOptions = new Set();
    }
  
    connectedCallback() {
      const question = this.getAttribute('question') || 'Bitte wähle eine Option:';
      const options = JSON.parse(this.getAttribute('options') || '[]');
      
      // Icons mapping for different options
      const iconMap = {
        'Wohnung': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M23,9.32 L19,5.32 L19,1.5 C19,0.67 18.33,0 17.5,0 C16.67,0 16,0.67 16,1.5 L16,2.32 L11,0.32 C10.38,-0.13 9.44,-0.13 8.82,0.32 L0.93,5.32 C0.36,5.69 0,6.31 0,7 C0,8.1 0.9,9 2,9 L3,9 L3,16.5 C3,17.33 3.67,18 4.5,18 L6,18 L6,16 L18,16 L18,18 L19.5,18 C20.33,18 21,17.33 21,16.5 L21,9 L22,9 C23.1,9 24,8.1 24,7 C24,6.31 23.64,5.69 23.07,5.32 L23,9.32 Z M12,3.25 L19,9 L12,9 L5,9 L12,3.25 Z"></path></svg>',
        'Finanzen': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12,0 C18.63,0 24,5.37 24,12 C24,18.63 18.63,24 12,24 C5.37,24 0,18.63 0,12 C0,5.37 5.37,0 12,0 Z M13.39,4.69 C13.17,4.29 12.75,4.05 12.29,4.05 L8.57,4.05 C7.82,4.05 7.2,4.66 7.2,5.41 L7.2,8.57 C7.2,9.32 7.82,9.94 8.57,9.94 L12.29,9.94 C12.75,9.94 13.17,9.7 13.39,9.3 C13.62,8.9 13.62,8.42 13.4,8.01 L13.4,6.29 C13.62,5.88 13.62,5.4 13.39,5 L13.39,4.69 Z M16.8,14.59 C16.8,13.84 16.18,13.22 15.43,13.22 L11.71,13.22 C11.25,13.22 10.83,13.45 10.6,13.86 C10.38,14.26 10.38,14.74 10.6,15.15 L10.6,16.86 C10.38,17.27 10.38,17.75 10.6,18.15 C10.83,18.56 11.25,18.79 11.71,18.79 L15.43,18.79 C16.18,18.79 16.8,18.18 16.8,17.43 L16.8,14.59 Z"></path></svg>',
        'Bildung & Ausbildung': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12.32,2.29 C12.12,2.19 11.88,2.19 11.68,2.29 L0.68,7.29 C0.26,7.49 0.26,8.09 0.68,8.29 L11.68,13.29 C11.88,13.39 12.12,13.39 12.32,13.29 L23.32,8.29 C23.74,8.09 23.74,7.49 23.32,7.29 L12.32,2.29 Z M12,11.29 C11.72,11.29 11.5,11.07 11.5,10.79 C11.5,10.51 11.72,10.29 12,10.29 C12.28,10.29 12.5,10.51 12.5,10.79 C12.5,11.07 12.28,11.29 12,11.29 Z M11.5,14.87 L4.5,11.59 L4.5,16.29 C4.5,17.19 7.82,18.29 12,18.29 C16.18,18.29 19.5,17.19 19.5,16.29 L19.5,11.59 L12.5,14.87 L12.5,19.29 C12.5,19.57 12.28,19.79 12,19.79 C11.72,19.79 11.5,19.57 11.5,19.29 L11.5,14.87 Z"></path></svg>',
        'Persönliche Probleme': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12,0 C5.38,0 0,5.38 0,12 C0,18.62 5.38,24 12,24 C18.62,24 24,18.62 24,12 C24,5.38 18.62,0 12,0 Z M12,4 C13.1,4 14,4.9 14,6 C14,7.1 13.1,8 12,8 C10.9,8 10,7.1 10,6 C10,4.9 10.9,4 12,4 Z M12,20 C9,20 6.36,18.45 5,16 C5.05,14 9,13 12,13 C14.99,13 18.95,14 19,16 C17.64,18.45 15,20 12,20 Z"></path></svg>',
        'Soziale Fähigkeiten': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15.99,10 L15.23,8.55 C14.83,7.75 14.22,7.11 13.46,6.7 L11.99,6 L13.45,5.3 C14.21,4.89 14.82,4.25 15.22,3.45 L15.98,2 L16.74,3.45 C17.14,4.25 17.75,4.89 18.51,5.3 L19.97,6 L18.5,6.7 C17.74,7.11 17.13,7.75 16.73,8.55 L15.99,10 Z M9.75,21 L10.38,21 C11.97,21 13.31,19.92 13.7,18.43 L14.67,14.43 L13.95,13 L9.2,13 L8.89,13.95 L9.75,21 Z M8.94,3 L8.38,5.06 C8.11,6.18 7.23,7.06 6.11,7.33 L4.06,7.88 L6.11,8.44 C7.23,8.71 8.11,9.59 8.38,10.71 L8.94,12.76 L9.5,10.71 C9.77,9.59 10.65,8.71 11.77,8.44 L13.82,7.88 L11.77,7.33 C10.65,7.06 9.77,6.18 9.5,5.06 L8.94,3 Z M4.06,16.94 L3.06,14 L2.06,16.94 C1.79,18.06 0.91,18.94 -0.21,19.21 L-3.15,20.21 L-0.21,21.21 C0.91,21.48 1.79,22.36 2.06,23.48 L3.06,26.42 L4.06,23.48 C4.33,22.36 5.21,21.48 6.33,21.21 L9.27,20.21 L6.33,19.21 C5.21,18.94 4.33,18.06 4.06,16.94 Z"></path></svg>'
      };

      // Default icon for options not in the map
      const defaultIcon = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12,2 C17.52,2 22,6.48 22,12 C22,17.52 17.52,22 12,22 C6.48,22 2,17.52 2,12 C2,6.48 6.48,2 12,2 Z M13,7 L11,7 L11,11 L7,11 L7,13 L11,13 L11,17 L13,17 L13,13 L17,13 L17,11 L13,11 L13,7 Z"></path></svg>';

      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
          }
          .question-text {
            font-size: 32px;
            font-weight: bold;
            line-height: 1.2;
            margin-bottom: 30px;
          }
          .options-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            width: 100%;
          }
          .option-item {
            display: flex;
            align-items: center;
            padding: 16px;
            border: 1px solid #E4E4E4;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            gap: 12px;
          }
          .option-item.full-width {
            grid-column: 1 / -1;
          }
          .option-item.selected {
            border-color: #FFDE3A;
            background-color: #FFFBEA;
          }
          .option-icon {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .option-text {
            font-size: 18px;
            font-weight: 500;
          }
          @media (max-width: 480px) {
            .options-grid {
              grid-template-columns: 1fr;
            }
          }
        </style>
        <div class="question-text">${question}</div>
        <div class="options-grid">
          ${options.map(opt => {
            const icon = iconMap[opt] || defaultIcon;
            const isLongOption = opt.length > 10;
            return `
              <div class="option-item ${isLongOption ? 'full-width' : ''}" data-value="${opt}">
                <div class="option-icon">${icon}</div>
                <div class="option-text">${opt}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;

      this.shadowRoot.querySelectorAll('.option-item').forEach(item => {
        item.addEventListener('click', () => {
          const value = item.getAttribute('data-value');
          
          if (this.selectedOptions.has(value)) {
            this.selectedOptions.delete(value);
            item.classList.remove('selected');
          } else {
            this.selectedOptions.add(value);
            item.classList.add('selected');
          }
          
          this.dispatchEvent(new CustomEvent('selection-changed', {
            detail: Array.from(this.selectedOptions),
            bubbles: true
          }));
        });
      });
    }

    getValue() {
      return Array.from(this.selectedOptions);
    }
  }
  
  customElements.define('multiple-choice', MultipleChoice);
  