# 🎵 EnsAI - AI-Powered Instrument Learning Platform

EnsAI is an innovative platform that combines artificial intelligence technologies with instrument education. Start your musical journey with your Gemini AI-powered personal music instructor!

## 🚀 Project Overview

EnsAI is designed as a democratizing and inclusive platform for instrument learning. It offers a personalized learning experience through AI technologies.

### 🎯 Core Objectives
- **Personalized Education**: AI-customized instrument training programs for every user
- **Accessible Learning**: Appropriate content for users of all skill levels
- **Real-Time Analysis**: Audio analysis and performance evaluation for instruments
- **Interactive Experience**: Natural language interaction with AI assistant

## 🏗️ Project Architecture

```
EnsAI/
├── 📱 mobile/          # React Native mobile application
├── 🖥️ web/            # React web application
├── ⚙️ backend/         # Node.js API server
└── 📚 docs/           # Project documentation
```

### Technology Stack

| Platform | Technologies |
|----------|-------------|
| **Web Frontend** | React 19, Vite, Chakra UI, TypeScript |
| **Mobile** | React Native, Expo, TypeScript |
| **Backend** | Node.js, Express, MongoDB, PostgreSQL |
| **AI Integration** | Google Gemini AI, OpenAI (optional) |
| **Audio Processing** | Web Audio API, WaveSurfer.js, FFmpeg |

## 🌟 Main Features

### 🤖 AI-Powered Features
- **Gemini AI Assistant**: 24/7 instrument learning support
- **Intelligent Audio Analysis**: Real-time pitch and rhythm detection for instruments
- **Personalized Modules**: AI-optimized training content for instrument mastery
- **Natural Language Processing**: Interactive conversational learning experience

### 🎵 Instrument Learning Features
- **Multi-Instrument Support**: Piano, guitar, violin, and more
- **Audio Recording and Analysis**: High-quality audio processing for instruments
- **Interactive Training**: Gamified instrument learning experience
- **Progress Tracking**: Detailed performance reports for instrument skills

### 📱 Platform Features
- **Cross-Platform**: Web and mobile support
- **Offline Mode**: Functionality without internet connection
- **Sync**: Cross-device synchronization
- **Social**: Music community integration

## 🛠️ Installation and Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB
- PostgreSQL (optional)
- Gemini AI API Key

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/ensai.git
cd ensai
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Configure API keys
npm run dev
```

### 3. Web Frontend Setup  
```bash
cd web
npm install
cp .env.example .env  # Configure API URLs
npm run dev
```

### 4. Mobile App Setup
```bash
cd mobile
npm install
npx expo start
```

## 🔧 Development

### Development Scripts
```bash
# Backend
npm run dev          # Development server
npm run start        # Production server
npm test             # Run tests

# Frontend (Web)
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Build preview

# Mobile
npx expo start       # Expo dev server
npx expo build       # Production build
```

### Environment Variables

#### Backend (.env)
```
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ensai
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

#### Web (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_GEMINI_API_KEY=your_gemini_api_key
```

#### Mobile (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

## 🚀 Deployment

### Docker Deployment
```bash
# Run all services
docker-compose up -d

# Backend only
docker-compose up backend

# Frontend only
docker-compose up web
```

### Cloud Deployment
- **Backend**: Heroku, AWS, Google Cloud
- **Web**: Vercel, Netlify, GitHub Pages
- **Mobile**: Expo Application Services (EAS)
- **Database**: MongoDB Atlas, PlanetScale

## 📚 API Documentation

### Main Endpoints

| Category | Endpoint | Description |
|----------|----------|-------------|
| **Auth** | `POST /api/users/register` | User registration |
| **Auth** | `POST /api/users/login` | User login |
| **Audio** | `POST /api/audio/upload` | Audio file upload |
| **Audio** | `GET /api/audio/stream/:filename` | Audio file streaming |
| **Training** | `GET /api/training/modules` | Training modules |
| **Training** | `POST /api/training/sessions` | Save training session |

For detailed API documentation: [API Docs](./backend/README.md)

## 🎨 UI/UX Design

### Design System
- **Color Palette**: Spotify green, pink accents, dark theme
- **Typography**: Poppins (headings), Inter (body)
- **Components**: Custom components based on Chakra UI
- **Animations**: Smooth transitions with Framer Motion

### Responsive Design
- **Mobile First**: Responsive design starting from 320px
- **Tablet**: iPad and Android tablet support
- **Desktop**: 1024px+ large screen optimization

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd web && npm test

# E2E tests
npm run test:e2e
```

### Test Coverage
- Unit tests: Jest
- Integration tests: Supertest
- E2E tests: Cypress
- Performance tests: Lighthouse

## 🤝 Contributing

EnsAI is an open source project and we welcome your contributions!

### Contribution Process
1. **Fork** the repository
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'feat: Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### Development Guidelines
- Follow Clean Code principles
- Use TypeScript
- Write tests
- Update documentation
- Use Conventional Commits

## 📊 Project Status

### Development Stages
- [x] **Alpha**: Core features and AI integration
- [x] **Beta**: Web and mobile platforms
- [ ] **v1.0**: Production-ready release
- [ ] **v2.0**: Advanced AI features

### Roadmap
- [ ] Multi-language support
- [ ] Social features
- [ ] Advanced AI models
- [ ] VR/AR integration
- [ ] Blockchain integration

## 📞 Contact and Support

### Community
- **Discord**: [EnsAI Community](https://discord.gg/ensai)
- **GitHub Discussions**: Project discussions
- **Reddit**: r/EnsAI

### Support
- **Issues**: Use GitHub Issues
- **Email**: support@ensai.com
- **Documentation**: [docs.ensai.com](https://docs.ensai.com)

## 📄 License

This project is distributed under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Google AI Team (Gemini API)
- Open Source Community
- Beta test users
- Contributing developers

---

## 🎵 Start Your Instrument Learning Journey with EnsAI!

**Discover the future of AI-powered instrument learning. Develop your musical skills with your personal AI instructor and unleash your creativity.**

[🚀 **Try Demo**](https://ensai-demo.vercel.app) | [📖 **Documentation**](./docs) | [💬 **Community**](https://discord.gg/ensai) 