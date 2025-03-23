# Voice Recorder Application

A professional web application for recording, managing, and sharing voice recordings with secure authentication and comprehensive logging.

## Core Features

- User authentication with secure session management
- Browser-based audio recording with waveform visualization
- CRUD operations for recordings
- Structured logging system with different log levels
- RESTful API endpoints

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: Passport.js with session-based auth
- **Logging**: Winston + Morgan for HTTP request logging
- **Frontend**: HTML5, CSS3, JavaScript (Web Audio API)

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment (.env file)
PORT=3000
NODE_ENV=development
SESSION_SECRET=your_session_secret
PG_DATABASE=voice_recorder
PG_USER=postgres
PG_PASSWORD=postgres

# Start the server
npm start

# Development mode with auto-restart
npm run dev
```

Access the application at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### Recordings
- `GET /api/recordings` - List recordings
- `POST /api/recordings` - Create recording
- `GET /api/recordings/:id` - Get recording
- `PUT /api/recordings/:id` - Update recording
- `DELETE /api/recordings/:id` - Delete recording

### User
- `GET /api/user` - Get user profile

## Project Structure

```
├── config/         # Configuration (DB, auth, logging)
├── controllers/    # Route controllers
├── middlewares/    # Custom middleware
├── models/         # Database models
├── public/         # Static assets
├── routes/         # API routes
├── uploads/        # Audio file storage
├── views/          # HTML templates
└── logs/           # Application logs
```

## Security Features

- Bcrypt password hashing
- Session-based auth with secure cookies
- Input validation and sanitization
- Sensitive data redaction in logs

## License

MIT 