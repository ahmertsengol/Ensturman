# Voice Recorder Application

A full-featured voice recording web application with user authentication, comprehensive logging, and session management built using Node.js, Express.js, PostgreSQL, and the Web Audio API.

## Features

- User registration and authentication with Passport.js
- Secure session management with PostgreSQL session store
- Record audio directly from your browser
- Save, edit, and delete recordings
- Visualize audio with a real-time waveform
- Mobile-responsive design
- Comprehensive logging system with different log levels
- REST API endpoints for recordings and user management

## Prerequisites

- Node.js (v14+ recommended)
- PostgreSQL (local installation or cloud service)
- Modern web browser (Chrome, Firefox, or Edge recommended)

## Installation

1. Clone this repository or download the files
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_session_secret

# PostgreSQL Configuration
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=voice_recorder
PG_USER=postgres
PG_PASSWORD=postgres
PG_SSL=false
```

4. Make sure PostgreSQL is running on your local machine and create a database named `voice_recorder`:

```sql
CREATE DATABASE voice_recorder;
```

## Running the Application

1. Start the application:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Register a new account or login with existing credentials
2. Navigate to the dashboard to see your recordings
3. Click "New Recording" to record audio
4. Use the recording controls to start/stop recording
5. Provide a title and optional description for your recording
6. Click "Save Recording" to save it to your account
7. On the dashboard, you can play, edit, or delete your recordings

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: Passport.js with local strategy
- **Session Management**: express-session with Sequelize session store
- **Logging**: Winston for structured logging with multiple transports and Morgan for HTTP request logging
- **Frontend**: HTML, CSS, JavaScript
- **Audio**: Web Audio API for recording and visualization

## Database Schema

- **Users**: Username, email, password (hashed)
- **Recordings**: Title, description, file path, duration, user reference
- **Sessions**: Session data for persistent authentication

## Logging System

The application includes a comprehensive logging system built with Winston:

- **Log Levels**: error, warn, info, http, debug
- **Log Transports**:
  - Console: All logs with colors for easy reading
  - error.log: Only error-level logs
  - combined.log: All logs
- **HTTP Request Logging**: Morgan middleware for detailed request/response logging
- **Sensitive Data Protection**: Automatic redaction of passwords and emails in logs

## Folder Structure

- `/config` - Configuration files (database, passport, logger)
- `/controllers` - Route controllers
- `/middlewares` - Custom middleware functions (auth, logging, flash messages)
- `/models` - Database models with Sequelize
- `/public` - Static assets (CSS, JavaScript, etc.)
- `/routes` - Application routes
- `/uploads` - Stored audio files
- `/views` - HTML templates
- `/logs` - Application logs (error.log, combined.log)

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### Recordings
- `GET /api/recordings` - Get all recordings for authenticated user
- `POST /api/recordings` - Create a new recording
- `GET /api/recordings/:id` - Get a specific recording
- `PUT /api/recordings/:id` - Update a recording
- `DELETE /api/recordings/:id` - Delete a recording

### User
- `GET /api/user` - Get current user information

## Security Features

- Password hashing with bcrypt
- Session-based authentication with secure cookies
- CSRF protection
- Input validation and sanitization
- Secure headers with Helmet.js
- Rate limiting for API requests

## License

MIT 