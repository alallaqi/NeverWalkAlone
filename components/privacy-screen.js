/**
 * Privacy Screen Web Component
 * Handles data protection and user consent functionality.
 */
class PrivacyScreen extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Initialize consent variables
    this.consentGiven = false;
    this.consentTimestamp = null;
    
    this.render();
    this.setupEventListeners();
  }
  
  /**
   * Web component lifecycle - when component is added to DOM
   */
  connectedCallback() {
    // Check if consent was already given in this session
    const consentGiven = sessionStorage.getItem('consentGiven');
    if (consentGiven === 'true') {
      this.style.display = 'none';
      this.dispatchConsentEvent(true); // Notify parent that consent is already given
    }
  }
  
  /**
   * Render the privacy screen HTML and CSS
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Arial', sans-serif;
          color: #000000;
        }
        
        .wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          height: 100%;
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
          width: 100%;
          text-align: center;
        }
        
        h1 {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .subtitle {
          font-size: 28px;
          margin-bottom: 40px;
          max-width: 500px;
          line-height: 1.3;
        }
        
        .mascot-container {
          position: relative;
          width: 240px;
          height: 200px;
          margin: 0 auto 20px;
        }
        
        .mascot-image {
          width: 100%;
          height: auto;
        }
        
        .privacy-text {
          text-align: left;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 30px;
          overflow-y: auto;
          max-height: 200px;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #E4E4E4;
        }
        
        .privacy-text h3 {
          margin-bottom: 10px;
        }
        
        .privacy-text p {
          margin-bottom: 15px;
        }
        
        .privacy-text ul {
          margin-left: 20px;
          margin-bottom: 15px;
        }
        
        .checkbox-container {
          display: flex;
          align-items: flex-start;
          margin: 15px 0;
          text-align: left;
        }
        
        .checkbox-container input[type="checkbox"] {
          margin-top: 4px;
          margin-right: 12px;
          width: 20px;
          height: 20px;
        }
        
        .checkbox-label {
          font-size: 16px;
          line-height: 1.5;
        }
        
        .button {
          background-color: #3F75DD;
          color: white;
          border: none;
          border-radius: 30px;
          padding: 15px 30px;
          font-size: 22px;
          font-weight: bold;
          cursor: pointer;
          margin: 15px auto;
          width: 100%;
          max-width: 400px;
        }
        
        .button:hover {
          opacity: 0.9;
        }
        
        .button-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      </style>
      
      <div class="wrapper">
        <div class="mascot-container">
          <img src="/assets/ChatGPT_Image_Apr_4__2025__07_46_19_PM-removebg-preview.png" alt="Wolf Mascot" class="mascot-image">
        </div>
        <h1>Data Protection</h1>
        <p class="subtitle">Before we continue, please review how we handle your data.</p>
        
        <div class="privacy-text">
          <h3>How We Use Your Data</h3>
          <p>We take your privacy seriously. The audio recording you provide will be used exclusively for:</p>
          <ul>
            <li>Understanding your experience better</li>
            <li>Improving our services for you and others</li>
            <li>Creating anonymized statistics</li>
          </ul>
          
          <h3>Storage and Security</h3>
          <p>Your recording will be stored securely on our servers for up to 12 months. We implement industry-standard security measures to protect your data from unauthorized access.</p>
          
          <h3>Your Rights</h3>
          <p>You have the right to access, correct, or delete your data at any time. If you wish to exercise these rights, please contact us at privacy@example.com.</p>
        </div>
        
        <div class="checkbox-container">
          <input type="checkbox" id="consent-checkbox-1">
          <label for="consent-checkbox-1" class="checkbox-label">I consent to the recording and processing of my audio story as described above.</label>
        </div>
        
        <div class="checkbox-container">
          <input type="checkbox" id="consent-checkbox-2">
          <label for="consent-checkbox-2" class="checkbox-label">I understand that I can withdraw my consent at any time, and my data will be deleted upon request.</label>
        </div>
        
        <button id="continue-btn" class="button button-disabled" disabled>Continue</button>
      </div>
    `;
  }
  
  /**
   * Set up event listeners for the consent checkboxes and continue button
   */
  setupEventListeners() {
    const continueBtn = this.shadowRoot.getElementById('continue-btn');
    const consentCheckbox1 = this.shadowRoot.getElementById('consent-checkbox-1');
    const consentCheckbox2 = this.shadowRoot.getElementById('consent-checkbox-2');
    
    // Update button state when checkboxes change
    const updateContinueButton = () => {
      if (consentCheckbox1.checked && consentCheckbox2.checked) {
        continueBtn.classList.remove('button-disabled');
        continueBtn.disabled = false;
      } else {
        continueBtn.classList.add('button-disabled');
        continueBtn.disabled = true;
      }
    };
    
    // Add event listeners
    consentCheckbox1.addEventListener('change', updateContinueButton);
    consentCheckbox2.addEventListener('change', updateContinueButton);
    
    // Continue button action
    continueBtn.addEventListener('click', () => {
      if (consentCheckbox1.checked && consentCheckbox2.checked) {
        this.consentGiven = true;
        this.consentTimestamp = new Date().toISOString();
        
        // Store consent in sessionStorage
        sessionStorage.setItem('consentGiven', 'true');
        sessionStorage.setItem('consentTimestamp', this.consentTimestamp);
        
        // Hide the privacy screen
        this.style.display = 'none';
        
        // Notify parent that consent is given
        this.dispatchConsentEvent(true);
      }
    });
  }
  
  /**
   * Dispatch a custom event to notify parent when consent is completed
   */
  dispatchConsentEvent(isConsented) {
    const event = new CustomEvent('consent-completed', {
      bubbles: true,
      composed: true,
      detail: {
        consented: isConsented,
        timestamp: this.consentTimestamp
      }
    });
    
    this.dispatchEvent(event);
  }
}

// Register the custom element
customElements.define('privacy-screen', PrivacyScreen); 