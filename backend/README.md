# EnsAI - Backend API

Backend API service for EnsAI (AI-Powered Instrument Learning Platform). Provides user authentication, audio recording management, training modules, and AI integration for instrument learning.

## Technologies

- Node.js
- Express.js
- MongoDB (Mongoose) & PostgreSQL
- JWT Authentication
- Multer for file uploads
- AI Integration Ready

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables in `.env` file:
   ```
   PORT=3001
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=EnsAI
   JWT_SECRET=ensai_instrument_learning_app_secret_key
   NODE_ENV=development
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### User Management
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout (protected)
- `GET /api/users/profile` - Get user profile (protected)

### Audio Management
- `POST /api/audio/upload` - Upload audio file (protected)
- `GET /api/audio` - Get user audio recordings (protected)
- `GET /api/audio/stream/:filename` - Stream audio file
- `GET /api/audio/:id` - Get specific recording (protected)
- `DELETE /api/audio/:id` - Delete recording (protected)

### Training Modules (AI-Powered)
- `POST /api/training/modules` - Create training module (protected)
- `GET /api/training/modules` - List training modules (protected)
- `GET /api/training/modules/:id` - Get specific module (protected)
- `POST /api/training/sessions` - Save training session (protected)
- `GET /api/training/history` - Get user training history (protected)
- `GET /api/training/progress` - Get user progress report (protected)

### Utility
- `GET /health` - Server health check
- `GET /test-cors` - CORS test endpoint

## AI Features

- Gemini AI integration
- Instrument learning assistant
- Audio analysis and pitch detection
- Personalized training recommendations

## Folder Structure

- `src/config` - Database and configuration files
- `src/controllers` - Route controllers
- `src/middlewares` - Express middlewares
- `src/routes` - API routes
- `src/utils` - Utility functions
- `uploads` - Audio files storage directory