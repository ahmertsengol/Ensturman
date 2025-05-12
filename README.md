# Ensturman 🎵

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

<p align="center">
  <img src="web/public/vite.svg" alt="Ensturman Logo" width="120" height="120">
</p>

## 📖 Overview


Ensturman is a comprehensive music education platform that provides real-time note detection and feedback for musical training. The system helps musicians improve their pitch accuracy through interactive training modules and real-time audio analysis.

Built with modern web technologies and featuring cross-platform compatibility, Ensturman aims to make music education more accessible, interactive, and effective.

## ✨ Key Features

- **Real-time Pitch Detection**: Advanced YIN algorithm implementation with the Web Audio API
- **Adaptive Audio Processing**:
  - Dynamic noise gate filtering for improved detection accuracy
  - Silence detection to eliminate false positives
  - Fine-tuned confidence calculation combining cents deviation and frequency analysis
- **Interactive Training Modules**:
  - Progressive difficulty levels
  - Sequential note practice exercises
  - Customizable training sessions
- **Performance Analytics**:
  - Detailed accuracy metrics
  - Progress tracking over time
  - Session history and performance insights
- **Cross-Platform Compatibility**:
  - Web application (desktop and mobile browsers)
  - Native mobile application (iOS and Android)

## 🏗️ Architecture

Ensturman follows a modern three-tier architecture:

```
├── Backend (Node.js)
│   ├── RESTful API with Express
│   ├── MySQL database integration
│   ├── JWT authentication
│   └── Audio processing utilities
│
├── Web Frontend (React)
│   ├── Real-time audio processing
│   ├── Interactive UI components
│   ├── Training module interface
│   └── Performance visualization
│
└── Mobile App (React Native with Expo)
    ├── Native audio recording
    ├── Cross-platform compatibility
    ├── Offline capability
    └── Native UI components
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16.x or higher)
- npm (v8.x or higher) or yarn (v1.22.x or higher)
- MySQL (v8.x or higher)
- Web browser with Web Audio API support
- For mobile development: Expo CLI and Android Studio/Xcode

### Installation

#### Clone the Repository

```bash
git clone https://github.com/ahmertsengol/Ensturman.git
cd Ensturman
```

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and other configuration

# Run database migrations
npm run migrate

# Start the server
npm start
```

#### Web Application Setup

```bash
cd web

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API endpoint and other settings

# Start development server
npm run dev
```

#### Mobile Application Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

## 📱 Usage

### Training Modules

1. Log in to your account
2. Navigate to the Training section
3. Select a training module based on your skill level
4. Grant microphone permissions when prompted
5. Follow the on-screen instructions to practice notes
6. Receive real-time feedback on your pitch accuracy

### Recording and Analysis

1. Navigate to the Record section
2. Create a new recording session
3. Play your instrument or sing
4. Review the detailed analysis of your performance
5. Save and track your progress over time

## 🧪 Technical Details

### Pitch Detection Algorithm

Ensturman implements an enhanced version of the YIN algorithm with the following improvements:

- **Adaptive Threshold**: Dynamically adjusts to ambient noise levels
- **Harmonic Reinforcement**: Improved detection of fundamental frequencies
- **Consecutive Frame Analysis**: Reduces jitter and improves stability
- **Cents Deviation Calculation**: Precise measurement of pitch accuracy

### Database Schema

- `users`: User authentication and profile information
- `training_modules`: Available training exercises and configurations
- `training_sessions`: User session data and performance metrics
- `audio_recordings`: Saved audio data and analysis results

## 🛠️ Development

### Codebase Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── routes/       # API endpoint definitions
│   │   ├── models/       # Database models
│   │   ├── middlewares/  # Express middlewares
│   │   ├── utils/        # Utility functions
│   │   └── config/       # Configuration files
│   └── ...
│
├── web/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page definitions
│   │   ├── utils/        # Utility functions
│   │   ├── context/      # React context providers
│   │   └── api/          # API integration
│   └── ...
│
└── mobile/
    ├── app/              # Expo Router screens
    ├── components/       # React Native components
    ├── utils/            # Mobile-specific utilities
    └── ...
```

### API Documentation

The backend provides a RESTful API with the following main endpoints:

- `/api/auth`: Authentication endpoints (register, login, refresh)
- `/api/users`: User profile management
- `/api/training`: Training module endpoints
- `/api/audio`: Audio recording and analysis

Detailed API documentation can be generated using the backend codebase.

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run web application tests
cd web
npm test

# Run mobile application tests
cd mobile
npm test
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- Ahmet Şengöl - Project Lead & Developer

## 📊 Performance Considerations

- Audio processing is optimized for low-latency feedback
- WebAssembly is used for computationally intensive operations
- Efficient database queries with proper indexing
- Lazy loading of application components for faster initial load

## 🔗 Links

- [Project Repository](https://github.com/ahmertsengol/Ensturman)
- [Issue Tracker](https://github.com/ahmertsengol/Ensturman/issues)
- [Documentation](https://github.com/ahmertsengol/Ensturman/wiki)

---

<p align="center">
  Built with ❤️ for music education
</p> 