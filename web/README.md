# LAZ Audio Recorder - Frontend

This is the frontend application for the LAZ Audio Recorder. It provides a responsive, mobile-compatible user interface for recording, storing, and playing back audio recordings.

## Technologies Used

- React
- React Router
- Chakra UI
- Axios for API requests
- React Hook Form for form handling
- Web Audio API for audio recording

## Features

- User authentication (login/register)
- Audio recording directly in the browser
- Recording playback and management
- Responsive design for mobile and desktop
- Modern and clean user interface

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Usage

1. Register an account or login with existing credentials
2. Navigate to the recording page using the navigation menu
3. Record audio using the microphone button
4. Stop the recording when finished
5. Preview the recording and save with a title and description
6. View all recordings in the dashboard
7. Play back or delete recordings as needed

## Folder Structure

- `src/api` - API connection and services
- `src/components` - React components
  - `src/components/auth` - Authentication components
  - `src/components/audio` - Audio recording components
  - `src/components/layout` - Layout components
- `src/context` - React context providers
- `src/pages` - Page components
- `src/utils` - Utility functions
- `public` - Public assets

## Chatbot Configuration

The application includes a chatbot powered by Google's Gemini AI. To use this feature, you need to:

1. Get a Gemini API key from the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a `.env` file in the root directory of the web project based on `.env.example`
3. Add your Gemini API key:

```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Without a valid API key, the chatbot will not function correctly.
