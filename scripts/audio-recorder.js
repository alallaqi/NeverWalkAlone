/**
 * Audio Recorder Module
 * Handles all audio recording, playback, and transcription functionality.
 */

class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.startTime = null;
    this.timerInterval = null;
    this.audioUrl = null;
    this.transcriptionContent = "";
    this.urlParams = this.getUrlParams();
    this.pageType = this.urlParams.type || 'default';
    
    // DOM elements
    this.elements = {
      privacyScreen: document.getElementById('privacy-screen'),
      initialScreen: document.getElementById('initial-screen'),
      recordingScreen: document.getElementById('recording-screen'),
      completionScreen: document.getElementById('completion-screen'),
      startRecordingBtn: document.getElementById('start-recording-btn'),
      stopRecordingBtn: document.getElementById('stop-recording-btn'),
      finishBtn: document.getElementById('finish-btn'),
      timer: document.getElementById('timer'),
      waveform: document.getElementById('waveform'),
      audioPlayback: document.getElementById('audio-playback'),
      playBtn: document.getElementById('play-btn'),
      recordAgainBtn: document.getElementById('record-again-btn'),
      downloadTranscriptionBtn: document.getElementById('download-transcription'),
      transcriptionText: document.getElementById('transcription-text'),
      continueBtn: document.getElementById('continue-btn'),
      consentCheckbox1: document.getElementById('consent-checkbox-1'),
      consentCheckbox2: document.getElementById('consent-checkbox-2'),
      whatsappBtn: document.getElementById('whatsapp-btn')
    };
    
    this.init();
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
   * Initialize the recorder and set up event listeners
   */
  init() {
    console.log('Page type:', this.pageType);
    this.customizePageByType();
    this.setupEventListeners();
    this.checkPreviousConsent();
  }
  
  /**
   * Customize page elements based on the URL parameters
   */
  customizePageByType() {
    // Add a data attribute to the body for potential CSS targeting
    document.body.setAttribute('data-page-type', this.pageType);
    
    // Customize the page based on the type parameter
    if (this.pageType === 'social') {
      document.title = 'Share Your Social Experience';
    } else if (this.pageType === 'health') {
      document.title = 'Share Your Health Journey';
    } else if (this.pageType === 'education') {
      document.title = 'Share Your Learning Experience';
    }
  }
  
  /**
   * Check if consent was already given in this session
   */
  checkPreviousConsent() {
    const consentGiven = sessionStorage.getItem('consentGiven');
    if (consentGiven === 'true') {
      this.elements.privacyScreen.classList.remove('active');
      this.elements.initialScreen.classList.add('active');
    }
  }
  
  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Recording controls
    this.elements.startRecordingBtn.addEventListener('click', () => this.startRecording());
    this.elements.stopRecordingBtn.addEventListener('click', () => this.stopRecording());
    this.elements.playBtn.addEventListener('click', () => this.playAudio());
    this.elements.recordAgainBtn.addEventListener('click', () => this.recordAgain());
    
    // Audio playback
    this.elements.audioPlayback.addEventListener('ended', () => {
      this.elements.playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="white">
        <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
      </svg>`;
    });
    
    // Finish button
    this.elements.finishBtn.addEventListener('click', () => {
      this.elements.audioPlayback.pause();
      alert(`Your ${this.pageType} recording has been submitted successfully!`);
    });
    
    // WhatsApp button
    this.elements.whatsappBtn.addEventListener('click', () => {
      this.elements.audioPlayback.pause();
      const phoneNumber = ''; 
      const message = encodeURIComponent(`I've shared my story (Type: ${this.pageType}). Thank you for listening!`);
      window.location.href = `https://wa.me/${phoneNumber}?text=${message}`;
    });
    
    // Download transcription button
    this.elements.downloadTranscriptionBtn.addEventListener('click', (e) => {
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
    
    // Consent checkboxes
    this.elements.consentCheckbox1.addEventListener('change', () => this.updateContinueButton());
    this.elements.consentCheckbox2.addEventListener('change', () => this.updateContinueButton());
    this.elements.continueBtn.addEventListener('click', () => this.continueToInitialScreen());
  }
  
  /**
   * Generate visual waveform for audio recording visualization
   */
  generateWaveform() {
    this.elements.waveform.innerHTML = '';
    const barCount = 40;
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = `${Math.floor(Math.random() * 5 + 3)}px`;
      this.elements.waveform.appendChild(bar);
    }
  }
  
  /**
   * Update the timer during recording
   */
  updateTimer() {
    const now = new Date();
    const elapsedTime = Math.floor((now - this.startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
    const seconds = (elapsedTime % 60).toString().padStart(2, '0');
    this.elements.timer.textContent = `${minutes}:${seconds}`;
  }
  
  /**
   * Update the visual waveform during recording
   */
  updateWaveform() {
    const bars = this.elements.waveform.querySelectorAll('.bar');
    bars.forEach(bar => {
      const height = Math.floor(Math.random() * 50 + 3);
      bar.style.height = `${height}px`;
      bar.style.transition = 'height 0.15s ease';
    });
  }
  
  /**
   * Start audio recording
   */
  async startRecording() {
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
        this.elements.audioPlayback.src = this.audioUrl;
        
        clearInterval(this.timerInterval);
        this.showCompletionScreen();
        
        // Generate simulated transcription 
        this.generateSimulatedTranscription();
      };
      
      // Show recording screen
      this.elements.initialScreen.classList.remove('active');
      this.elements.recordingScreen.classList.add('active');
      
      // Start recording and timer
      this.audioChunks = [];
      this.mediaRecorder.start();
      this.startTime = new Date();
      this.updateTimer();
      this.timerInterval = setInterval(() => {
        this.updateTimer();
        this.updateWaveform();
      }, 100);
      
      this.generateWaveform();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access your microphone. Please check your permissions.');
    }
  }
  
  /**
   * Stop audio recording
   */
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  }
  
  /**
   * Show the completion screen after recording
   */
  showCompletionScreen() {
    this.elements.recordingScreen.classList.remove('active');
    this.elements.completionScreen.classList.add('active');
  }
  
  /**
   * Play/pause the recorded audio
   */
  playAudio() {
    if (this.elements.audioPlayback.paused) {
      this.elements.audioPlayback.play();
      this.elements.playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="white">
        <path d="M14,19H18V5H14M6,19H10V5H6V19Z" />
      </svg>`;
    } else {
      this.elements.audioPlayback.pause();
      this.elements.playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="white">
        <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
      </svg>`;
    }
  }
  
  /**
   * Reset and go back to initial screen to record again
   */
  recordAgain() {
    this.elements.completionScreen.classList.remove('active');
    this.elements.initialScreen.classList.add('active');
    
    // Reset audio player
    this.elements.audioPlayback.pause();
    this.elements.audioPlayback.currentTime = 0;
    
    // Reset play button
    this.elements.playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="white">
      <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
    </svg>`;
  }
  
  /**
   * Generate a simulated transcription of the recording
   */
  generateSimulatedTranscription() {
    this.elements.transcriptionText.textContent = "Processing audio...";
    
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
      this.elements.transcriptionText.textContent = this.transcriptionContent;
    }, 2000);
  }
  
  /**
   * Update the continue button based on consent checkboxes
   */
  updateContinueButton() {
    if (this.elements.consentCheckbox1.checked && this.elements.consentCheckbox2.checked) {
      this.elements.continueBtn.classList.remove('button-disabled');
      this.elements.continueBtn.disabled = false;
    } else {
      this.elements.continueBtn.classList.add('button-disabled');
      this.elements.continueBtn.disabled = true;
    }
  }
  
  /**
   * Continue to the initial screen after consent is given
   */
  continueToInitialScreen() {
    if (this.elements.consentCheckbox1.checked && this.elements.consentCheckbox2.checked) {
      this.elements.privacyScreen.classList.remove('active');
      this.elements.initialScreen.classList.add('active');
      
      // Store consent in sessionStorage
      sessionStorage.setItem('consentGiven', 'true');
      sessionStorage.setItem('consentTimestamp', new Date().toISOString());
    }
  }
}

// Initialize the audio recorder when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  const audioRecorder = new AudioRecorder();
}); 