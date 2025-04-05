/**
 * Housing Information Web Component
 * Displays detailed information about selected housing types
 * Connected to the image-slider component
 */
class HousingInfo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Housing data with detailed information
    this.housingData = {
      'Obdachlosigkeit': {
        challenges: [
          'Fehlender Schutz vor Witterung',
          'Erhöhtes Gesundheitsrisiko',
          'Stigmatisierung und soziale Ausgrenzung',
          'Eingeschränkter Zugang zu sanitären Einrichtungen'
        ],
        support: [
          'Notunterkünfte und Wärmestuben',
          'Streetworker und aufsuchende Hilfe',
          'Medizinische Versorgung auf der Straße',
          'Beratung zu Sozialleistungen'
        ],
        stats: {
          percentage: '~0.2%',
          tendency: 'steigend',
          avgDuration: 'Variiert stark, oft mehrere Monate bis Jahre'
        }
      },
      'Institutionelle Unterbringung': {
        challenges: [
          'Eingeschränkte Privatsphäre',
          'Wenig individuelle Gestaltungsmöglichkeiten',
          'Oft strenge Regeln und Vorgaben',
          'Fehlende langfristige Perspektive'
        ],
        support: [
          'Fachpersonal vor Ort',
          'Strukturierter Tagesablauf',
          'Sozialberatung und -betreuung',
          'Vermittlung in eigenen Wohnraum'
        ],
        stats: {
          percentage: '~1.5%',
          tendency: 'stabil',
          avgDuration: '3-12 Monate'
        }
      },
      'Pflegefamilie': {
        challenges: [
          'Eingewöhnung in neue Familienstrukturen',
          'Mögliche Loyalitätskonflikte',
          'Umgang mit Traumata und Verlusterfahrungen',
          'Unsicherheit über Dauerhaftigkeit'
        ],
        support: [
          'Familiäres Umfeld und Beziehungsangebote',
          'Individuelle Förderung und Betreuung',
          'Begleitung durch Jugendamt und Fachdienste',
          'Hilfe beim Übergang in die Selbständigkeit'
        ],
        stats: {
          percentage: '~0.5%',
          tendency: 'leicht steigend',
          avgDuration: 'Oft mehrere Jahre, bis zur Volljährigkeit'
        }
      },
      'Instabile Wohnsituation': {
        challenges: [
          'Häufige Wohnungswechsel',
          'Fehlende langfristige Planung',
          'Oft beengte oder ungeeignete Wohnverhältnisse',
          'Finanzielle Unsicherheit'
        ],
        support: [
          'Wohnungsberatung und -vermittlung',
          'Mietschuldenberatung',
          'Finanzielle Hilfen und Wohngeld',
          'Unterstützung bei der Wohnungssuche'
        ],
        stats: {
          percentage: '~4%',
          tendency: 'steigend',
          avgDuration: 'Durchschnittlich 1-2 Jahre'
        }
      },
      'Wohngemeinschaft': {
        challenges: [
          'Abstimmung mit Mitbewohnern',
          'Gemeinsame Verantwortung für Haushalt',
          'Potenzial für Konflikte',
          'Eingeschränkte Privatsphäre'
        ],
        support: [
          'Gemeinschaft und soziale Kontakte',
          'Geteilte Kosten',
          'Gegenseitige Unterstützung',
          'Betreute WGs mit fachlicher Begleitung'
        ],
        stats: {
          percentage: '~7-10%',
          tendency: 'stabil',
          avgDuration: 'Durchschnittlich 2-4 Jahre'
        }
      },
      'Eigene Wohnung': {
        challenges: [
          'Hohe Kosten für Miete oder Eigentum',
          'Eigenverantwortung für Instandhaltung',
          'Mögliche Isolation',
          'Finanzielle Belastung'
        ],
        support: [
          'Volle Kontrolle über eigenen Wohnraum',
          'Unabhängigkeit und Privatsphäre',
          'Langfristige Sicherheit',
          'Möglichkeit zur freien Gestaltung'
        ],
        stats: {
          percentage: '~80+%',
          tendency: 'stabil',
          avgDuration: 'Oft mehrere Jahre bis Jahrzehnte'
        }
      }
    };
    
    // Default to first housing type
    this.currentHousingType = 'Obdachlosigkeit';
    
    this.render();
    this.setupEventListeners();
  }
  
  /**
   * Web component lifecycle - when component is added to DOM
   */
  connectedCallback() {
    // Listen for slide changes from the image slider
    document.addEventListener('slide-changed', (e) => {
      if (e.detail && e.detail.title) {
        this.updateHousingInfo(e.detail.title);
      }
    });
  }
  
  /**
   * Render the component's HTML structure and CSS
   */
  render() {
    const housingInfo = this.housingData[this.currentHousingType];
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Arial', sans-serif;
          margin-top: 40px;
          margin-bottom: 40px;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .icon {
          width: 40px;
          height: 40px;
          margin-right: 15px;
          background-color: #3F75DD;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .icon svg {
          width: 24px;
          height: 24px;
          fill: white;
        }
        
        h2 {
          font-size: 28px;
          margin: 0;
          color: #333;
        }
        
        .content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
        }
        
        @media (max-width: 600px) {
          .content {
            grid-template-columns: 1fr;
          }
        }
        
        .section {
          margin-bottom: 20px;
        }
        
        .section h3 {
          font-size: 20px;
          margin-top: 0;
          margin-bottom: 15px;
          color: #3F75DD;
          border-bottom: 2px solid #3F75DD;
          padding-bottom: 8px;
        }
        
        ul {
          padding-left: 20px;
          margin: 0;
        }
        
        li {
          margin-bottom: 8px;
          line-height: 1.5;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 10px 20px;
        }
        
        .stat-label {
          font-weight: bold;
        }
        
        .action-buttons {
          display: flex;
          justify-content: space-between;
          margin-top: 30px;
        }
        
        .button {
          background-color: #3F75DD;
          color: white;
          border: none;
          border-radius: 30px;
          padding: 12px 25px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .button:hover {
          background-color: #2C5BB7;
        }
        
        .button.secondary {
          background-color: transparent;
          color: #3F75DD;
          border: 2px solid #3F75DD;
        }
        
        .button.secondary:hover {
          background-color: rgba(63, 117, 221, 0.1);
        }
        
        .transition-fade {
          transition: opacity 0.5s;
        }
        
        .fade-out {
          opacity: 0;
        }
        
        .fade-in {
          opacity: 1;
        }
      </style>
      
      <div class="container transition-fade fade-in">
        <div class="header">
          <div class="icon">
            <svg viewBox="0 0 24 24">
              <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
            </svg>
          </div>
          <h2>${this.currentHousingType}</h2>
        </div>
        
        <div class="content">
          <div class="left-column">
            <div class="section">
              <h3>Herausforderungen</h3>
              <ul>
                ${housingInfo.challenges.map(challenge => `<li>${challenge}</li>`).join('')}
              </ul>
            </div>
            
            <div class="section">
              <h3>Unterstützungsmöglichkeiten</h3>
              <ul>
                ${housingInfo.support.map(support => `<li>${support}</li>`).join('')}
              </ul>
            </div>
          </div>
          
          <div class="right-column">
            <div class="section">
              <h3>Statistiken</h3>
              <div class="stats-grid">
                <div class="stat-label">Anteil in Deutschland:</div>
                <div>${housingInfo.stats.percentage}</div>
                
                <div class="stat-label">Tendenz:</div>
                <div>${housingInfo.stats.tendency}</div>
                
                <div class="stat-label">Durchschnittliche Dauer:</div>
                <div>${housingInfo.stats.avgDuration}</div>
              </div>
            </div>
            
            <div class="section">
              <h3>Handlungsempfehlungen</h3>
              <p>Für Betroffene oder Interessierte bieten wir weitere Informationen und Kontaktstellen zu dieser Wohnform an.</p>
            </div>
            
            <div class="action-buttons">
              <button class="button">Hilfe finden</button>
              <button class="button secondary">Mehr Informationen</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Add event listeners for buttons if needed
    const helpButton = this.shadowRoot.querySelector('.button');
    const infoButton = this.shadowRoot.querySelector('.button.secondary');
    
    helpButton.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('find-help', {
        bubbles: true,
        composed: true,
        detail: { housingType: this.currentHousingType }
      }));
    });
    
    infoButton.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('more-info', {
        bubbles: true,
        composed: true,
        detail: { housingType: this.currentHousingType }
      }));
    });
  }
  
  /**
   * Update housing information based on selected housing type
   */
  updateHousingInfo(housingType) {
    if (this.housingData[housingType]) {
      const container = this.shadowRoot.querySelector('.container');
      
      // Apply fade out animation
      container.classList.add('fade-out');
      
      // Update data after animation
      setTimeout(() => {
        this.currentHousingType = housingType;
        this.render();
        
        // Re-add event listeners after re-rendering
        this.setupEventListeners();
      }, 500);
    }
  }
}

// Register the custom element
customElements.define('housing-info', HousingInfo); 