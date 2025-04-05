/**
 * Image Slider Web Component
 * Displays a carousel of housing images with titles and navigation controls
 */
class ImageSlider extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Slider state
    this.currentSlide = 0;
    this.autoplayInterval = null;
    
    // Default slides - will be replaced if images are provided via attribute
    this.slides = [
      {
        image: '/assets/images/housing/abdachlos.png',
        title: 'Obdachlosigkeit',
        description: 'Leben ohne festen Wohnsitz auf der Straße.'
      },
      {
        image: '/assets/images/housing/institution.png',
        title: 'Institutionelle Unterbringung',
        description: 'Wohnen in betreuten Einrichtungen.'
      },
      {
        image: '/assets/images/housing/phlegefamile.png',
        title: 'Pflegefamilie',
        description: 'Aufwachsen in einer Familie, die die Betreuung übernimmt.'
      },
      {
        image: '/assets/images/housing/keinstabil.png',
        title: 'Instabile Wohnsituation',
        description: 'Wechselnde oder unsichere Wohnverhältnisse.'
      },
      {
        image: '/assets/images/housing/wg.png',
        title: 'Wohngemeinschaft',
        description: 'Leben in geteilten Wohnräumen mit anderen.'
      },
      {
        image: '/assets/images/housing/Hausallien.png',
        title: 'Eigene Wohnung',
        description: 'Selbständiges Leben im eigenen Wohnraum.'
      }
    ];
    
    // Title and question properties
    this.sliderTitle = 'Wohnen';
    this.sliderQuestion = 'Wie zufrieden bist du mit deiner aktuellen Wohnsituation?';
  }
  
  /**
   * Web component lifecycle - when added to DOM
   */
  connectedCallback() {
    // Parse images attribute if provided
    if (this.hasAttribute('images')) {
      try {
        const imageUrls = JSON.parse(this.getAttribute('images'));
        
        // Map the proper housing type titles to the images
        const housingTitles = {
          'abdachlos.png': 'Obdachlosigkeit',
          'institution.png': 'Institutionelle Unterbringung',
          'phlegefamile.png': 'Pflegefamilie',
          'keinstabil.png': 'Instabile Wohnsituation',
          'wg.png': 'Wohngemeinschaft',
          'Hausallien.png': 'Eigene Wohnung'
        };
        
        const housingDescriptions = {
          'abdachlos.png': 'Leben ohne festen Wohnsitz auf der Straße.',
          'institution.png': 'Wohnen in betreuten Einrichtungen.',
          'phlegefamile.png': 'Aufwachsen in einer Familie, die die Betreuung übernimmt.',
          'keinstabil.png': 'Wechselnde oder unsichere Wohnverhältnisse.',
          'wg.png': 'Leben in geteilten Wohnräumen mit anderen.',
          'Hausallien.png': 'Selbständiges Leben im eigenen Wohnraum.'
        };
        
        // Create slides from the provided images
        if (imageUrls && imageUrls.length > 0) {
          this.slides = imageUrls.map(url => {
            // Extract the filename from the URL
            const filename = url.split('/').pop();
            return {
              image: url,
              title: housingTitles[filename] || filename,
              description: housingDescriptions[filename] || ''
            };
          });
        }
      } catch (e) {
        console.error('Error parsing images attribute:', e);
      }
    }
    
    // Get title and question if provided
    if (this.hasAttribute('title')) {
      this.sliderTitle = this.getAttribute('title');
    }
    
    if (this.hasAttribute('question')) {
      this.sliderQuestion = this.getAttribute('question');
    }
    
    // Now render and start autoplay
    this.render();
    this.setupEventListeners();
    this.startAutoplay();
  }
  
  /**
   * Web component lifecycle - when removed from DOM
   */
  disconnectedCallback() {
    this.stopAutoplay();
  }
  
  /**
   * Render the slider HTML and CSS
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }
        
        .slider-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .slider-title {
          font-size: 36px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        
        .slider-question {
          font-size: 24px;
          margin-bottom: 30px;
        }
        
        .slider-container {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .slides {
          display: flex;
          transition: transform 0.5s ease-in-out;
          height: 400px;
        }
        
        .slide {
          min-width: 100%;
          position: relative;
        }
        
        .slide-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .slide-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          color: white;
          padding: 20px;
        }
        
        .slide-title {
          font-size: 24px;
          font-weight: bold;
          margin: 0 0 8px 0;
        }
        
        .slide-description {
          font-size: 16px;
          margin: 0;
          opacity: 0.9;
        }
        
        .slider-nav {
          display: flex;
          justify-content: space-between;
          position: absolute;
          top: 50%;
          left: 10px;
          right: 10px;
          transform: translateY(-50%);
          z-index: 1;
        }
        
        .nav-button {
          background-color: rgba(255, 255, 255, 0.7);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .nav-button:hover {
          background-color: rgba(255, 255, 255, 0.9);
        }
        
        .nav-button svg {
          width: 24px;
          height: 24px;
          fill: #333;
        }
        
        .dots-container {
          display: flex;
          justify-content: center;
          margin-top: 15px;
        }
        
        .dot {
          width: 12px;
          height: 12px;
          background-color: #ccc;
          border-radius: 50%;
          margin: 0 5px;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        
        .dot.active {
          background-color: #3F75DD;
        }
        
        .slide-selection {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          margin-top: 20px;
          gap: 10px;
        }
        
        .slide-thumbnail {
          width: 100px;
          height: 70px;
          border-radius: 6px;
          cursor: pointer;
          border: 3px solid transparent;
          object-fit: cover;
          transition: all 0.3s;
        }
        
        .slide-thumbnail.active {
          border-color: #3F75DD;
          transform: scale(1.05);
        }
      </style>
      
      <div class="slider-header">
        <h2 class="slider-title">${this.sliderTitle}</h2>
        <div class="slider-question">${this.sliderQuestion}</div>
      </div>
      
      <div class="slider-container">
        <div class="slides">
          ${this.slides.map(slide => `
            <div class="slide">
              <img src="${slide.image}" alt="${slide.title}" class="slide-image">
              <div class="slide-content">
                <h3 class="slide-title">${slide.title}</h3>
                <p class="slide-description">${slide.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="slider-nav">
          <button class="nav-button prev-button">
            <svg viewBox="0 0 24 24">
              <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
            </svg>
          </button>
          <button class="nav-button next-button">
            <svg viewBox="0 0 24 24">
              <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="dots-container">
        ${this.slides.map((_, index) => `
          <div class="dot${index === 0 ? ' active' : ''}" data-index="${index}"></div>
        `).join('')}
      </div>
      
      <div class="slide-selection">
        ${this.slides.map((slide, index) => `
          <img src="${slide.image}" alt="${slide.title}" class="slide-thumbnail${index === 0 ? ' active' : ''}" data-index="${index}">
        `).join('')}
      </div>
    `;
    
    // Show initial slide
    this.updateSlidePosition();
  }
  
  /**
   * Set up event listeners for navigation
   */
  setupEventListeners() {
    // Navigation buttons
    const prevButton = this.shadowRoot.querySelector('.prev-button');
    const nextButton = this.shadowRoot.querySelector('.next-button');
    
    prevButton.addEventListener('click', () => {
      this.prevSlide();
      this.resetAutoplay();
    });
    
    nextButton.addEventListener('click', () => {
      this.nextSlide();
      this.resetAutoplay();
    });
    
    // Dot indicators
    const dots = this.shadowRoot.querySelectorAll('.dot');
    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'));
        this.goToSlide(index);
        this.resetAutoplay();
      });
    });
    
    // Thumbnail selection
    const thumbnails = this.shadowRoot.querySelectorAll('.slide-thumbnail');
    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', () => {
        const index = parseInt(thumbnail.getAttribute('data-index'));
        this.goToSlide(index);
        this.resetAutoplay();
      });
    });
    
    // Key navigation
    this.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevSlide();
        this.resetAutoplay();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
        this.resetAutoplay();
      }
    });
    
    // Make component focusable for keyboard navigation
    this.setAttribute('tabindex', '0');
    
    // Pause autoplay on hover/focus
    this.addEventListener('mouseenter', () => this.stopAutoplay());
    this.addEventListener('mouseleave', () => this.startAutoplay());
    this.addEventListener('focus', () => this.stopAutoplay());
    this.addEventListener('blur', () => this.startAutoplay());
    
    // Dispatch change event when slide changes
    this.addEventListener('slide-changed', (e) => {
      // Here you can add custom behavior when a slide changes
      console.log('Slide changed to:', e.detail.index, e.detail.title);
    });
  }
  
  /**
   * Update slide position based on currentSlide
   */
  updateSlidePosition() {
    const slidesElement = this.shadowRoot.querySelector('.slides');
    slidesElement.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    
    // Update active dot
    const dots = this.shadowRoot.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
      if (index === this.currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
    
    // Update active thumbnail
    const thumbnails = this.shadowRoot.querySelectorAll('.slide-thumbnail');
    thumbnails.forEach((thumbnail, index) => {
      if (index === this.currentSlide) {
        thumbnail.classList.add('active');
      } else {
        thumbnail.classList.remove('active');
      }
    });
    
    // Dispatch custom event
    const currentSlideData = this.slides[this.currentSlide];
    this.dispatchEvent(new CustomEvent('slide-changed', {
      bubbles: true,
      composed: true,
      detail: {
        index: this.currentSlide,
        title: currentSlideData.title,
        description: currentSlideData.description,
        image: currentSlideData.image
      }
    }));
  }
  
  /**
   * Go to previous slide
   */
  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.updateSlidePosition();
  }
  
  /**
   * Go to next slide
   */
  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    this.updateSlidePosition();
  }
  
  /**
   * Go to a specific slide by index
   */
  goToSlide(index) {
    if (index >= 0 && index < this.slides.length) {
      this.currentSlide = index;
      this.updateSlidePosition();
    }
  }
  
  /**
   * Start autoplay
   */
  startAutoplay() {
    if (this.hasAttribute('autoplay')) {
      const interval = this.getAttribute('interval') || 5000;
      this.autoplayInterval = setInterval(() => this.nextSlide(), interval);
    }
  }
  
  /**
   * Stop autoplay
   */
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
  
  /**
   * Reset autoplay after user interaction
   */
  resetAutoplay() {
    this.stopAutoplay();
    this.startAutoplay();
  }
  
  /**
   * Get the current slide data
   */
  getCurrentSlide() {
    return this.slides[this.currentSlide];
  }
  
  /**
   * Observe attributes for changes
   */
  static get observedAttributes() {
    return ['autoplay', 'interval', 'images', 'title', 'question'];
  }
  
  /**
   * Handle attribute changes
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'autoplay') {
      if (newValue !== null) {
        this.startAutoplay();
      } else {
        this.stopAutoplay();
      }
    } else if (name === 'interval') {
      this.resetAutoplay();
    } else if (name === 'images' || name === 'title' || name === 'question') {
      // Re-render if these attributes change
      if (this.isConnected) {
        this.connectedCallback();
      }
    }
  }
  
  /**
   * Get the current selected value
   * Used by the loader to collect responses
   */
  getValue() {
    return {
      selectedIndex: this.currentSlide,
      selectedTitle: this.slides[this.currentSlide].title
    };
  }
}

// Register the custom element
customElements.define('image-slider', ImageSlider);
  