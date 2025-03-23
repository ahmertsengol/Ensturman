# Voice Recorder Application

A full-featured voice recording web application with user authentication built using Node.js, Express.js, PostgreSQL, and the Web Audio API.

## Features

- User registration and authentication
- Record audio directly from your browser
- Save, edit, and delete recordings
- Visualize audio with a real-time waveform
- Mobile-responsive design
- Multiple microphone recording
- Playback recordings from the system
- PostgreSQL database integration

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
- **Frontend**: HTML, CSS, JavaScript
- **Audio**: Web Audio API for recording and visualization

## Database Schema

- **Users**: Username, email, password (hashed)
- **Recordings**: Title, description, file path, duration, user reference
- **Sessions**: Session data for authentication

## Folder Structure

- `/config` - Configuration files
- `/controllers` - Route controllers
- `/middlewares` - Custom middleware functions
- `/models` - Database models
- `/public` - Static assets (CSS, JavaScript, etc.)
- `/routes` - Application routes
- `/uploads` - Stored audio files
- `/views` - HTML templates

## License

MIT 