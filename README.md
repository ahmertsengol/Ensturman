# Real-Time Note Detection Training System

This project is a comprehensive training system for music note detection that provides real-time feedback to users during practice sessions.

## Overview

The system consists of:
- **Backend**: Node.js server handling user authentication, training modules, and session tracking
- **Web Interface**: React application with real-time pitch detection
- **Mobile App**: Cross-platform mobile application (React Native)

The application uses the YIN algorithm with the Web Audio API to detect musical notes in real-time, providing immediate feedback on pitch accuracy.

## Features

- Real-time pitch detection with adaptive noise gate filtering
- Training modules with sequential note practice
- Performance tracking and session history
- Visual feedback on note accuracy (cents deviation)
- Consecutive silence frame detection for improved accuracy
- Comprehensive error handling for microphone access

## Project Structure

```
├── backend/             # Node.js server
│   ├── src/             # Server source code
│   │   ├── controllers/ # API controllers
│   │   ├── routes/      # API routes
│   │   ├── models/      # Database models
│   │   └── migrations/  # Database migration scripts
│   └── ...
├── web/                 # Web application
│   ├── src/             # Frontend source code
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utility functions
│   │   └── ...
│   └── ...
└── mobile/              # Mobile application
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MySQL database

### Installation

1. Clone the repository:
   ```
   git clone [repository-url]
   cd [repository-name]
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install web application dependencies:
   ```
   cd ../web
   npm install
   ```

4. Configure environment variables:
   - Create `.env` files in both the `backend` and `web` directories
   - Set necessary environment variables (database configuration, API endpoints, etc.)

5. Run database migrations:
   ```
   cd ../backend
   npm run migrate
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm start
   ```

2. Start the web application:
   ```
   cd ../web
   npm run dev
   ```

3. Access the web application at `http://localhost:5173` (or the port configured in your environment)

## Technical Details

### Pitch Detection Algorithm

The system uses the YIN algorithm implemented with the Web Audio API to detect musical notes. Key improvements include:
- Adaptive noise gate filtering
- Consecutive silence frame detection
- Enhanced confidence calculation using both cents deviation and frequency difference

### Database Schema

- `training_modules`: Stores information about available training modules
- `training_sessions`: Tracks user practice sessions and performance metrics

## Browser Compatibility

The application includes browser compatibility detection for the Web Audio API features and provides appropriate error messages for unsupported browsers.

## License

[License information]

## Contributors

[Contributor information] 