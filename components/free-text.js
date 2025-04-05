class FreeTextInput extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
      const question = this.getAttribute('question') || 'Bitte beschreibe deine Erfahrung:';
  
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
          textarea {
            width: 100%;
            min-height: 120px;
            border: 1px solid #ccc;
            border-radius: 10px;
            padding: 0.75rem;
            font-size: 1rem;
            resize: vertical;
          }
        </style>
        <div class="wrapper">
          <div class="question">${question}</div>
          <textarea placeholder="Schreib hier..."></textarea>
        </div>
      `;
  
      this.shadowRoot.querySelector('textarea').addEventListener('input', (e) => {
        this.dispatchEvent(new CustomEvent('text-changed', {
          detail: e.target.value,
          bubbles: true
        }));
      });
    }
  
    getValue() {
      return this.shadowRoot.querySelector('textarea').value;
    }
  }
  
  customElements.define('free-text', FreeTextInput);