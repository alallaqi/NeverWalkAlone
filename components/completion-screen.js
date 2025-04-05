class CompletionScreen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          text-align: center;
        }
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 0;
        }
        .mascot-container {
          position: relative;
          margin-bottom: 20px;
          width: 300px;
          height: 220px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .mascot-image {
          width: 220px;
          height: auto;
        }
        .shield-image {
          position: absolute;
          width: 80px;
          height: auto;
          right: 50px;
          top: 20px;
        }
        h1 {
          font-size: 48px;
          font-weight: bold;
          margin: 20px 0;
        }
        p {
          font-size: 24px;
          line-height: 1.4;
          margin-bottom: 20px;
          max-width: 600px;
        }
        .shield-info {
          margin: 30px 0;
          font-size: 20px;
          line-height: 1.5;
          max-width: 600px;
        }
        .continue-button {
          background-color: #3F75DD;
          color: white;
          border: none;
          border-radius: 24px;
          padding: 15px 30px;
          font-size: 22px;
          font-weight: bold;
          cursor: pointer;
          margin-top: 20px;
          width: 100%;
          max-width: 400px;
        }
        .continue-button:hover {
          opacity: 0.9;
        }
      </style>
      <div class="container">
        <div class="mascot-container">
          <img src="/assets/ChatGPT_Image_Apr_4__2025__07_46_19_PM-removebg-preview.png" alt="Wolf Mascot" class="mascot-image">
          <img src="/assets/images/shield.svg" alt="Shield" class="shield-image">
        </div>
        <h1>Well done!</h1>
        <p>You've completed your journey... now tell us your story.</p>
        <p class="shield-info">The shield will be part of your story that is published on the website of Never Walk Alone.</p>
        <button class="continue-button">Continue</button>
      </div>
    `;

    this.shadowRoot.querySelector('.continue-button').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('continue-clicked', {
        bubbles: true
      }));
    });
  }
}

customElements.define('completion-screen', CompletionScreen); 