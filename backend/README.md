# LAZ Audio Recorder - Backend API

This is the backend API for the LAZ Audio Recorder application. It provides authentication, audio recording storage, and retrieval functionality.

## Technologies Used

- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Multer for file uploads

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a PostgreSQL database named "Laz"

3. Set up environment variables in `.env` file:
   ```
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=Laz
   JWT_SECRET=laz_audio_recording_app_secret_key
   NODE_ENV=development
   ```

4. Initialize the database by running the SQL commands in `src/config/database.sql`

5. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)

### Audio Recordings
- `POST /api/audio/upload` - Upload a new audio recording (protected)
- `GET /api/audio` - Get all user recordings (protected)
- `GET /api/audio/:id` - Get a specific recording (protected)
- `DELETE /api/audio/:id` - Delete a recording (protected)

## Folder Structure

- `src/config` - Database and configuration files
- `src/controllers` - Route controllers
- `src/middlewares` - Express middlewares
- `src/models` - Database models
- `src/routes` - API routes
- `src/utils` - Utility functions
- `uploads` - Audio files storage directory 