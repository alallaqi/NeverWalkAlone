/**
 * Audio Recorder Web Component
 * Handles audio recording, playback, and transcription functionality.
 */
class AudioRecorder extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Initialize state variables
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.startTime = null;
    this.timerInterval = null;
    this.audioUrl = null;
    this.transcriptionContent = "";
    this.currentScreen = 'initial'; // initial, recording, completion
    this.urlParams = this.getUrlParams();
    this.pageType = this.urlParams.type || 'default';
    
    this.render();
    this.setupEventListeners();
  }
  
  /**
   * Parse URL parameters
   */
  getUrlParams() {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
    
    return params;
  }
  
  /**
   * Web component lifecycle - when component is added to DOM
   */
  connectedCallback() {
    this.customizePageByType();
  }
  
  /**
   * Web component lifecycle - when component is removed from DOM
   */
  disconnectedCallback() {
    // Clean up resources
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    
    clearInterval(this.timerInterval);
    
    // Revoke object URL
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }
  }
  
  /**
   * Customize component elements based on the URL parameters
   */
  customizePageByType() {
    // Add a data attribute for potential CSS targeting
    this.setAttribute('data-page-type', this.pageType);
    
    // Set custom title based on page type
    let title = 'Share Your Story';
    if (this.pageType === 'social') {
      title = 'Share Your Social Experience';
    } else if (this.pageType === 'health') {
      title = 'Share Your Health Journey';
    } else if (this.pageType === 'education') {
      title = 'Share Your Learning Experience';
    }
    
    const initialTitle = this.shadowRoot.querySelector('#initial-title');
    if (initialTitle) {
      initialTitle.textContent = title;
    }
  }
  
  /**
   * Render the component's HTML structure and CSS
   */
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Arial', sans-serif;
          color: #000000;
        }
        
        :host * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
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
        
        /* Screen management */
        .screen {
          display: none;
          width: 100%;
        }
        
        .screen.active {
          display: block;
        }
        
        /* Text elements */
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
        
        /* Mascot styling */
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
        
        /* Buttons */
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
        
        /* Recording specific styles */
        .record-button {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background-color: #F44336;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          margin: 20px auto;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .record-button svg {
          width: 50px;
          height: 50px;
        }
        
        .record-button:hover {
          opacity: 0.9;
        }
        
        .record-timer {
          font-size: 36px;
          margin: 20px 0;
        }
        
        .recording-status {
          font-size: 36px;
          margin-bottom: 30px;
        }
        
        /* Audio wave visualization */
        .audio-wave {
          width: 100%;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 20px 0;
        }
        
        .audio-wave .bar {
          width: 6px;
          margin: 0 2px;
          border-radius: 3px;
          background-color: #4285F4; /* Blue color for most bars */
        }
        
        .audio-wave .bar:nth-child(3n) {
          background-color: #FF7F00; /* Orange color for every third bar */
        }
        
        /* Audio player controls */
        .audio-player-container {
          width: 100%;
          max-width: 400px;
          margin: 20px auto;
        }
        
        .audio-player {
          width: 100%;
          height: 40px;
          margin-bottom: 10px;
        }
        
        .audio-controls {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .control-button {
          background-color: #3F75DD;
          color: white;
          border: none;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .control-button svg {
          width: 24px;
          height: 24px;
        }
        
        .control-button:hover {
          opacity: 0.9;
        }
        
        /* WhatsApp button */
        .whatsapp-button {
          background-color: #25D366;
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
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        
        .whatsapp-button svg {
          width: 24px;
          height: 24px;
        }
        
        .whatsapp-button:hover {
          opacity: 0.9;
        }
        
        /* Thank you container */
        .thank-you-container {
          background-color: #F5F5F5;
          border-radius: 16px;
          padding: 20px;
          margin: 20px 0;
          width: 100%;
          max-width: 500px;
        }
        
        .completion-message {
          font-size: 22px;
          line-height: 1.4;
          margin: 20px 0;
          max-width: 500px;
        }
        
        /* Transcription styles */
        .transcription-container {
          text-align: left;
          background-color: white;
          border: 1px solid #E4E4E4;
          border-radius: 12px;
          padding: 15px;
          margin: 20px 0;
          width: 100%;
          max-width: 500px;
        }
        
        .transcription-text {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 15px;
          white-space: pre-wrap;
        }
        
        .transcription-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .download-link {
          background-color: #3F75DD;
          color: white;
          text-decoration: none;
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 16px;
          font-weight: bold;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        
        .download-link svg {
          width: 18px;
          height: 18px;
        }
        
        .download-link:hover {
          opacity: 0.9;
        }
        
        .mic-icon-container {
          width: 60px;
          height: 60px;
          background-color: black;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: 0;
          right: 0;
        }
      </style>
      
      <!-- Initial Screen -->
      <div id="initial-screen" class="screen active">
        <div class="wrapper">
          <div class="mascot-container">
            <img src="/assets/ChatGPT_Image_Apr_4__2025__07_46_19_PM-removebg-preview.png" alt="Wolf Mascot" class="mascot-image">
            <div class="mic-icon-container">
              <svg viewBox="0 0 24 24" fill="white" width="30" height="30">
                <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
              </svg>
            </div>
          </div>
          <h1 id="initial-title">We'd love to hear your story.</h1>
          <p class="subtitle">It's up to you how much you share.</p>
          <button id="start-recording-btn" class="button">Start Recording</button>
        </div>
      </div>
      
      <!-- Recording Screen -->
      <div id="recording-screen" class="screen">
        <div class="wrapper">
          <div class="mascot-container">
            <img src="/assets/ChatGPT_Image_Apr_4__2025__07_46_19_PM-removebg-preview.png" alt="Wolf Mascot" class="mascot-image">
          </div>
          <h1>Thank you. Your voice matters.</h1>
          <p class="subtitle">You're doing great! Tell us anything you want.</p>
          <p class="recording-status">Recording...</p>
          <div class="audio-wave" id="waveform">
            <!-- Audio visualization will be generated here -->
          </div>
          <p class="record-timer" id="timer">00:00</p>
          <button id="stop-recording-btn" class="record-button">
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Completion Screen -->
      <div id="completion-screen" class="screen">
        <div class="wrapper">
          <div class="mascot-container">
            <img src="/assets/ChatGPT_Image_Apr_4__2025__07_46_19_PM-removebg-preview.png" alt="Wolf Mascot" class="mascot-image">
          </div>
          <h1>Thank you for sharing!</h1>
          <p class="subtitle">Your story has been recorded successfully.</p>
          
          <div class="audio-player-container">
            <p>Listen to your recording:</p>
            <audio id="audio-playback" class="audio-player" controls></audio>
            <div class="audio-controls">
              <button id="play-btn" class="control-button">
                <svg viewBox="0 0 24 24" fill="white">
                  <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                </svg>
              </button>
              <button id="record-again-btn" class="control-button">
                <svg viewBox="0 0 24 24" fill="white">
                  <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4C7.58,4 4,7.58 4,12C4,16.42 7.58,20 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18C8.69,18 6,15.31 6,12C6,8.69 8.69,6 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="transcription-container">
            <div class="transcription-header">
              <h3>Transcription</h3>
              <a href="#" id="download-transcription" class="download-link">
                <svg viewBox="0 0 24 24" fill="white">
                  <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                </svg>
                Download
              </a>
            </div>
            <p class="transcription-text" id="transcription-text">Generating transcription...</p>
          </div>
          
          <div class="thank-you-container">
            <p class="completion-message">
              Your story helps us understand your journey better. It will be used to improve our services and support for others in similar situations.
            </p>
          </div>
          
          <button id="finish-btn" class="button">Complete Survey</button>
          
          <button id="whatsapp-btn" class="whatsapp-button">
            <svg viewBox="0 0 24 24" fill="white">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7 8.5 7 9.71C7 10.93 7.89 12.1 8 12.27C8.14 12.44 9.76 14.94 12.25 16C12.84 16.27 13.3 16.42 13.66 16.53C14.25 16.72 14.79 16.69 15.22 16.63C15.7 16.56 16.68 16.03 16.89 15.45C17.1 14.87 17.1 14.38 17.04 14.27C16.97 14.17 16.81 14.11 16.56 14C16.31 13.86 15.09 13.26 14.87 13.18C14.64 13.1 14.5 13.06 14.31 13.3C14.15 13.55 13.67 14.11 13.53 14.27C13.38 14.44 13.24 14.46 13 14.34C12.74 14.21 11.94 13.95 11 13.11C10.26 12.45 9.77 11.64 9.62 11.39C9.5 11.15 9.61 11 9.73 10.89C9.84 10.78 10 10.6 10.1 10.45C10.23 10.31 10.27 10.2 10.35 10.04C10.43 9.87 10.39 9.73 10.33 9.61C10.27 9.5 9.77 8.26 9.56 7.77C9.36 7.29 9.16 7.35 9 7.34C8.86 7.34 8.7 7.33 8.53 7.33Z"/>
            </svg>
            Return to WhatsApp
          </button>
        </div>
      </div>
    `;
  }
  
  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Get DOM elements from Shadow DOM
    const elements = {
      initialScreen: this.shadowRoot.getElementById('initial-screen'),
      recordingScreen: this.shadowRoot.getElementById('recording-screen'),
      completionScreen: this.shadowRoot.getElementById('completion-screen'),
      startRecordingBtn: this.shadowRoot.getElementById('start-recording-btn'),
      stopRecordingBtn: this.shadowRoot.getElementById('stop-recording-btn'),
      finishBtn: this.shadowRoot.getElementById('finish-btn'),
      timer: this.shadowRoot.getElementById('timer'),
      waveform: this.shadowRoot.getElementById('waveform'),
      audioPlayback: this.shadowRoot.getElementById('audio-playback'),
      playBtn: this.shadowRoot.getElementById('play-btn'),
      recordAgainBtn: this.shadowRoot.getElementById('record-again-btn'),
      downloadTranscriptionBtn: this.shadowRoot.getElementById('download-transcription'),
      transcriptionText: this.shadowRoot.getElementById('transcription-text'),
      whatsappBtn: this.shadowRoot.getElementById('whatsapp-btn')
    };
    
    // Recording controls
    elements.startRecordingBtn.addEventListener('click', () => this.startRecording(elements));
    elements.stopRecordingBtn.addEventListener('click', () => this.stopRecording(elements));
    elements.playBtn.addEventListener('click', () => this.playAudio(elements));
    elements.recordAgainBtn.addEventListener('click', () => this.recordAgain(elements));
    
    // Audio playback ended event
    elements.audioPlayback.addEventListener('ended', () => {
      elements.playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="white">
        <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
      </svg>`;
    });
    
    // Finish button
    elements.finishBtn.addEventListener('click', () => {
      elements.audioPlayback.pause();
      
      // Dispatch a custom event to notify the completion
      const event = new CustomEvent('recording-completed', {
        bubbles: true,
        composed: true,
        detail: {
          audioUrl: this.audioUrl,
          transcription: this.transcriptionContent,
          pageType: this.pageType
        }
      });
      
      this.dispatchEvent(event);
      alert(`Your ${this.pageType} recording has been submitted successfully!`);
    });
    
    // WhatsApp button
    elements.whatsappBtn.addEventListener('click', () => {
      elements.audioPlayback.pause();
      const phoneNumber = ''; 
      const message = encodeURIComponent(`I've shared my story (Type: ${this.pageType}). Thank you for listening!`);
      window.location.href = `https://wa.me/${phoneNumber}?text=${message}`;
    });
    
    // Download transcription button
    elements.downloadTranscriptionBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (!this.transcriptionContent) {
        alert("Transcription is still being generated. Please wait a moment.");
        return;
      }
      
      // Create a blob from the transcription text
      const blob = new Blob([this.transcriptionContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'your_story_transcription.txt';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
  
  /**
   * Generate visual waveform for audio recording visualization
   */
  generateWaveform(elements) {
    elements.waveform.innerHTML = '';
    const barCount = 40;
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = `${Math.floor(Math.random() * 5 + 3)}px`;
      elements.waveform.appendChild(bar);
    }
  }
  
  /**
   * Update the timer during recording
   */
  updateTimer(elements) {
    const now = new Date();
    const elapsedTime = Math.floor((now - this.startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');
    elements.timer.textContent = `${minutes}:${seconds}`;
  }
  
  /**
   * Update the visual waveform during recording
   */
  updateWaveform(elements) {
    const bars = elements.waveform.querySelectorAll('.bar');
    bars.forEach(bar => {
      const height = Math.floor(Math.random() * 50 + 3);
      bar.style.height = `${height}px`;
      bar.style.transition = 'height 0.15s ease';
    });
  }
  
  /**
   * Start audio recording
   */
  async startRecording(elements) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };
      
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioUrl = URL.createObjectURL(audioBlob);
        
        // Set the audio source for playback
        elements.audioPlayback.src = this.audioUrl;
        
        clearInterval(this.timerInterval);
        this.showCompletionScreen(elements);
        
        // Generate simulated transcription 
        this.generateSimulatedTranscription(elements);
      };
      
      // Show recording screen
      elements.initialScreen.classList.remove('active');
      elements.recordingScreen.classList.add('active');
      this.currentScreen = 'recording';
      
      // Start recording and timer
      this.audioChunks = [];
      this.mediaRecorder.start();
      this.startTime = new Date();
      this.updateTimer(elements);
      this.timerInterval = setInterval(() => {
        this.updateTimer(elements);
        this.updateWaveform(elements);
      }, 100);
      
      this.generateWaveform(elements);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access your microphone. Please check your permissions.');
    }
  }
  
  /**
   * Stop audio recording
   */
  stopRecording(elements) {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  }
  
  /**
   * Show the completion screen after recording
   */
  showCompletionScreen(elements) {
    elements.recordingScreen.classList.remove('active');
    elements.completionScreen.classList.add('active');
    this.currentScreen = 'completion';
  }
  
  /**
   * Play/pause the recorded audio
   */
  playAudio(elements) {
    if (elements.audioPlayback.paused) {
      elements.audioPlayback.play();
      elements.playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="white">
        <path d="M14,19H18V5H14M6,19H10V5H6V19Z" />
      </svg>`;
    } else {
      elements.audioPlayback.pause();
      elements.playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="white">
        <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
      </svg>`;
    }
  }
  
  /**
   * Reset and go back to initial screen to record again
   */
  recordAgain(elements) {
    elements.completionScreen.classList.remove('active');
    elements.initialScreen.classList.add('active');
    this.currentScreen = 'initial';
    
    // Reset audio player
    elements.audioPlayback.pause();
    elements.audioPlayback.currentTime = 0;
    
    // Reset play button
    elements.playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="white">
      <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
    </svg>`;
  }
  
  /**
   * Generate a simulated transcription of the recording
   */
  generateSimulatedTranscription(elements) {
    elements.transcriptionText.textContent = "Processing audio...";
    
    setTimeout(() => {
      // Add type-specific phrases based on the page type
      let typeSpecificPhrases = [];
      
      if (this.pageType === 'social') {
        typeSpecificPhrases = [
          "My social interactions have been challenging but rewarding.",
          "I've found community support to be essential in my journey."
        ];
      } else if (this.pageType === 'health') {
        typeSpecificPhrases = [
          "Managing my health has been a priority throughout this process.",
          "The healthcare support I received made a significant difference."
        ];
      } else if (this.pageType === 'education') {
        typeSpecificPhrases = [
          "Learning new skills has been transformative for me.",
          "Education has opened doors I never thought possible."
        ];
      }
      
      const randomPhrases = [
        "Thank you for giving me this opportunity to share my story.",
        "I've been through quite a journey over the past few months.",
        "It means a lot to have someone listen to my experiences.",
        "I hope this information can help others who are going through similar situations.",
        "There were challenges along the way, but I've learned a lot from them.",
        ...typeSpecificPhrases
      ];
      
      // Create a simulated transcription by randomly selecting some phrases
      const transcription = [];
      const numPhrases = Math.floor(Math.random() * 3) + 2; // 2-4 phrases
      
      for (let i = 0; i < numPhrases; i++) {
        const randomIndex = Math.floor(Math.random() * randomPhrases.length);
        transcription.push(randomPhrases[randomIndex]);
      }
      
      this.transcriptionContent = transcription.join("\n\n");
      elements.transcriptionText.textContent = this.transcriptionContent;
    }, 2000);
  }
}

// Register the custom element
customElements.define('audio-recorder', AudioRecorder); 