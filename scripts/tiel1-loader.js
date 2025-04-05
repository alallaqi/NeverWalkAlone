let currentStep = 0;
let responses = [];

const container = document.getElementById('flow-container');
const nextButton = document.getElementById('next-button');
const mascotImage = document.getElementById('mascot-image');
const progressFill = document.querySelector('.progress-fill');
const pageTitle = document.querySelector('.page-title');
const progressBar = document.querySelector('.progress-bar');

fetch('/tiel1.json')
  .then(res => res.json())
  .then(data => {
    window.tiel1Flow = data;
    renderStep(currentStep);
  });

function renderStep(index) {
  container.innerHTML = ''; // clear previous content

  // Check if we've reached the end of the questions
  if (index >= window.tiel1Flow.length) {
    showCompletionScreen();
    return;
  }

  const step = window.tiel1Flow[index];
  
  // Show normal UI elements for questions
  pageTitle.style.display = 'block';
  progressBar.style.display = 'block';
  nextButton.style.display = 'block';
  
  // Update progress bar
  const progressPercentage = ((index + 1) / window.tiel1Flow.length) * 100;
  progressFill.style.width = `${progressPercentage}%`;

  // Use the same wolf mascot for all question types
  mascotImage.src = '/assets/ChatGPT_Image_Apr_4__2025__07_46_19_PM-removebg-preview.png';
  mascotImage.style.width = '240px';
  
  // Only hide mascot for unsupported question types
  if (step.type === 'multiple_choice' || step.type === 'slider' || step.type === 'dropdown' || step.type === 'text') {
    mascotImage.style.display = 'block';
  } else {
    mascotImage.style.display = 'none';
  }

  let component;

  switch (step.type) {
    case 'multiple_choice':
      component = document.createElement('multiple-choice');
      component.setAttribute('question', step.question);
      component.setAttribute('options', JSON.stringify(step.options));
      break;

    case 'dropdown':
      component = document.createElement('dropdown-select');
      component.setAttribute('question', step.question);
      component.setAttribute('options', JSON.stringify(step.options));
      break;

    case 'text':
      component = document.createElement('free-text');
      component.setAttribute('question', step.question);
      break;

    case 'slider':
      component = document.createElement('image-slider');
      if (step.title) {
        component.setAttribute('title', step.title);
      }
      component.setAttribute('question', step.question);
      component.setAttribute('images', JSON.stringify(step.images));
      break;
  }

  if (component) container.appendChild(component);
}

function showCompletionScreen() {
  // Hide normal UI elements
  pageTitle.style.display = 'none';
  progressBar.style.display = 'none';
  nextButton.style.display = 'none';
  mascotImage.style.display = 'none';
  
  // Create and show completion screen
  const completionScreen = document.createElement('completion-screen');
  container.appendChild(completionScreen);
  
  // Listen for continue button click
  completionScreen.addEventListener('continue-clicked', () => {
    // Redirect to the Tiel 2 audio recording page
    window.location.href = '/tiel2.html';
  });
}

nextButton.addEventListener('click', () => {
  const step = window.tiel1Flow[currentStep];
  const component = container.firstElementChild;
  let value;

  if (!component) return;

  switch (step.type) {
    case 'multiple_choice':
    case 'dropdown':
    case 'text':
    case 'slider':
      if (typeof component.getValue === 'function') {
        value = component.getValue();
      }
      break;
  }

  responses.push({ step: currentStep + 1, type: step.type, value });
  currentStep++;

  if (currentStep < window.tiel1Flow.length) {
    renderStep(currentStep);
  } else {
    console.log('Responses:', responses);
    // Instead of alert, show the completion screen
    renderStep(currentStep);
    
    // Here you would normally send the responses to a server
    // For now, we just log them to the console
    console.log('Final responses:', responses);
  }
});
