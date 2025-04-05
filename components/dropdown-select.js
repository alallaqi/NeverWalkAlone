class DropdownSelect extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
      const question = this.getAttribute('question') || 'Bitte triff eine Auswahl:';
      const options = JSON.parse(this.getAttribute('options') || '[]');
  
      this.shadowRoot.innerHTML = `
        <style>
          .wrapper {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            font-family: sans-serif;
          }
          .question {
            font-size: 1.2rem;
            font-weight: bold;
          }
          select {
            padding: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 1rem;
          }
        </style>
        <div class="wrapper">
          <div class="question">${question}</div>
          <select>
            <option value="" disabled selected>Bitte wählen...</option>
            ${options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
          </select>
        </div>
      `;
  
      this.shadowRoot.querySelector('select').addEventListener('change', (e) => {
        this.dispatchEvent(new CustomEvent('selection-changed', {
          detail: e.target.value,
          bubbles: true
        }));
      });
    }
  
    getValue() {
      return this.shadowRoot.querySelector('select').value;
    }
  }
  
  customElements.define('dropdown-select', DropdownSelect);