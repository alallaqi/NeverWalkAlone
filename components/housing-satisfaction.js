/**
 * Housing Satisfaction Slider Component
 * Displays housing quality options with a satisfaction slider
 */
class HousingSatisfaction extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Housing options from worst to best
    this.housingOptions = [
      {
        image: '/assets/images/housing/abdachlos.png',
        title: 'Stark beschädigt',
        description: 'Unbewohnbare Räumlichkeiten'
      },
      {
        image: '/assets/images/housing/institution.png',
        title: 'Notunterkunft',
        description: 'Einfache Unterkunft'
      },
      {
        image: '/assets/images/housing/keinstabil.png',
        title: 'Einfache Wohnung',
        description: 'Grundlegende Einrichtung'
      },
      {
        image: '/assets/images/housing/wg.png',
        title: 'Moderne Wohnung',
        description: 'Gut eingerichtetes Zuhause'
      },
      {
        image: '/assets/images/housing/Hausallien.png',
        title: 'Luxuriös',
        description: 'Hochwertiges Wohnen'
      }
    ];
    
    this.selectedValue = 50; // Default to middle value
    
    this.render();
    this.setupEventListeners();
  }
  
  connectedCallback() {
    // Any initialization when component is added to DOM
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          font-family: Arial, sans-serif;
        }
        
        h1 {
          font-size: 2.5rem;
          text-align: center;
          color: #333;
          margin-bottom: 0.5rem;
        }
        
        h2 {
          font-size: 1.8rem;
          text-align: center;
          color: #333;
          margin-bottom: 2rem;
        }
        
        .housing-options {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        
        .housing-option {
          width: 19%;
          border-radius: 8px;
          overflow: hidden;
          border: 3px solid transparent;
          transition: all 0.3s;
        }
        
        .housing-option img {
          width: 100%;
          height: 150px;
          object-fit: cover;
        }
        
        .slider-container {
          position: relative;
          width: 100%;
          height: 20px;
          margin-top: 40px;
        }
        
        .slider-track {
          position: absolute;
          width: 100%;
          height: 10px;
          background-color: #e0e0e0;
          border-radius: 5px;
        }
        
        .slider-fill {
          position: absolute;
          height: 10px;
          background-color: #FF8C00;
          border-radius: 5px;
          transition: width 0.3s;
        }
        
        .slider-thumb {
          position: absolute;
          width: 40px;
          height: 40px;
          background-color: #FF8C00;
          border-radius: 50%;
          top: -15px;
          transform: translateX(-50%);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          transition: left 0.3s;
        }
        
        .mascot {
          width: 200px;
          position: relative;
          margin-top: 20px;
          margin-left: auto;
        }
        
        .mascot img {
          width: 100%;
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        
        .mascot {
          animation: float 3s ease-in-out infinite;
        }
      </style>
      
      <h1>Wohnen</h1>
      <h2>Wie zufrieden bist du mit deiner aktuellen Wohnsituation?</h2>
      
      <div class="housing-options">
        ${this.housingOptions.map(option => `
          <div class="housing-option">
            <img src="${option.image}" alt="${option.title}">
          </div>
        `).join('')}
      </div>
      
      <div class="slider-container">
        <div class="slider-track"></div>
        <div class="slider-fill" style="width: ${this.selectedValue}%"></div>
        <div class="slider-thumb" style="left: ${this.selectedValue}%"></div>
      </div>
      
      <div class="mascot">
        <img src="/assets/ChatGPT_Image_Apr_4__2025__07_46_19_PM-removebg-preview.png" alt="Wolf mascot">
      </div>
    `;
  }
  
  setupEventListeners() {
    const thumb = this.shadowRoot.querySelector('.slider-thumb');
    const track = this.shadowRoot.querySelector('.slider-track');
    const fill = this.shadowRoot.querySelector('.slider-fill');
    
    let isDragging = false;
    
    // Function to update slider position
    const updateSlider = (e) => {
      const trackRect = track.getBoundingClientRect();
      let position = (e.clientX - trackRect.left) / trackRect.width;
      position = Math.max(0, Math.min(1, position)); // Clamp between 0 and 1
      
      const percentage = position * 100;
      this.selectedValue = percentage;
      
      thumb.style.left = `${percentage}%`;
      fill.style.width = `${percentage}%`;
      
      // Highlight closest housing option
      this.updateActiveHousingOption(percentage);
      
      // Dispatch custom event with the selected value
      this.dispatchEvent(new CustomEvent('satisfaction-changed', {
        bubbles: true,
        composed: true,
        detail: { value: percentage }
      }));
    };
    
    // Mouse events for dragging
    thumb.addEventListener('mousedown', () => {
      isDragging = true;
    });
    
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        updateSlider(e);
      }
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    // Click on track to jump
    track.addEventListener('click', (e) => {
      updateSlider(e);
    });
    
    // Touch events for mobile
    thumb.addEventListener('touchstart', () => {
      isDragging = true;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches[0]) {
        e.preventDefault();
        updateSlider(e.touches[0]);
      }
    }, { passive: false });
    
    document.addEventListener('touchend', () => {
      isDragging = false;
    });
  }
  
  updateActiveHousingOption(percentage) {
    const housingOptions = this.shadowRoot.querySelectorAll('.housing-option');
    const optionCount = housingOptions.length;
    
    // Calculate which housing option should be active based on percentage
    const activeIndex = Math.min(
      Math.floor(percentage / (100 / optionCount)),
      optionCount - 1
    );
    
    // Update border for all options
    housingOptions.forEach((option, index) => {
      if (index === activeIndex) {
        option.style.borderColor = '#FF8C00';
        option.style.transform = 'scale(1.05)';
      } else {
        option.style.borderColor = 'transparent';
        option.style.transform = 'scale(1)';
      }
    });
  }
  
  /**
   * Get the current selected value
   * Required for compatibility with the tiel1-loader
   */
  getValue() {
    // Calculate which housing option is selected based on slider value
    const optionCount = this.housingOptions.length;
    const activeIndex = Math.min(
      Math.floor(this.selectedValue / (100 / optionCount)),
      optionCount - 1
    );
    
    return {
      satisfactionLevel: this.selectedValue,
      selectedHousingType: this.housingOptions[activeIndex].title
    };
  }
}

// Register custom element
customElements.define('housing-satisfaction', HousingSatisfaction); 