# NeverWalkAlone

A voice recording and housing situation assessment application for social good initiatives. This project helps collect user stories and feedback about housing situations to better understand and support vulnerable populations.

## Features

- Interactive housing situation assessment slider
- Voice recording functionality for sharing personal stories
- Multi-step user survey with multiple choice, dropdown, and free-text questions
- User-friendly UI with animated wolf mascot
- GDPR-compliant data consent system

## Project Structure

- `components/`: Web components used throughout the application
- `scripts/`: JavaScript files for application logic
- `assets/`: Images and other static assets
- `styles/`: CSS stylesheets

## Setup

1. Clone the repository
2. Use a local server to run the application (e.g., `npx serve`)
3. Open the application in your browser

## Screens

- Welcome Screen: Introduces users to the application
- Data Protection Screen: Ensures GDPR compliance
- Survey Screens: Collects user input about housing and other needs
- Voice Recording Screen: Allows users to record their stories
- Completion Screen: Thanks users for their participation

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Web Components API
- Media Recording API

## Next Steps

### Git & Project Management

```bash
# Create development and feature branches
git checkout -b development
git checkout -b feature/backend-integration

# After changes are made and tested
git add .
git commit -m "Add backend integration"
git push -u origin feature/backend-integration

# Create pull request on GitHub and merge to development
```

Consider creating a package.json for better project management:

```bash
npm init -y
npm install express mongoose dotenv cors
npm install --save-dev nodemon
```

### Image Updates

Create an organized image structure:
```
/assets
  /images
    /mascot
      wolf-idle.svg
      wolf-talking.svg
      wolf-excited.svg
      wolf-thinking.svg
    /housing
      /optimized  # Store optimized versions here
```

Optimize all images with compression tools.

### Backend Connection

Create a basic Express server and MongoDB connection for storing user responses and recordings.

Example server setup:
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI);

// Define routes
app.use('/api/responses', require('./routes/responses'));
app.use('/api/recordings', require('./routes/recordings'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Dynamic Content

Update the application to fetch housing options, questions, and content from a backend API.

### Wolf Animation Enhancements

Improve the wolf mascot with additional animations:

- Floating animation when idle
- Blinking eyes
- Tail wagging on positive responses
- Different expressions based on user interactions

Consider using GSAP for advanced animations:

```javascript
// Create a timeline for wolf animations
const wolfTimeline = gsap.timeline({ repeat: -1 });

// Add animations to the timeline
wolfTimeline
  .to('.wolf-ears', { rotation: 5, duration: 0.3 })
  .to('.wolf-ears', { rotation: -5, duration: 0.3 })
  .to('.wolf-ears', { rotation: 0, duration: 0.3 });
``` 