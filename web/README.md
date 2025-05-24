# EnsAI - AI-Powered Instrument Learning Platform

EnsAI is an innovative AI-powered interactive instrument learning platform. Master musical instruments with your Gemini AI-enhanced personal music instructor.

## 🎵 Features

### 🤖 AI-Powered Features
- **Gemini AI Music Instructor**: 24/7 personal instrument learning support
- **Intelligent Audio Analysis**: Real-time pitch detection and performance analysis
- **Personalized Training**: AI-optimized learning modules for instrument mastery
- **Natural Language Interaction**: Conversational AI for seamless learning experience

### 🎼 Instrument Learning Features
- **Multi-Format Support**: MP3, WAV, OGG, M4A and more
- **Real-Time Visualization**: Waveform display with WaveSurfer.js
- **3D Audio Visualizer**: Interactive music visualization with React Three Fiber
- **Audio Recording**: High-quality browser-based instrument recording

### 🔧 Technical Features
- **Modern UI/UX**: Dark theme design with Chakra UI
- **Responsive Design**: Compatible interface across all devices
- **Real-time Audio**: WebAudio API integration
- **Secure Storage**: JWT-based secure data management

## 🚀 Technology Stack

### Frontend
- **Framework**: React 19.0.0
- **Build Tool**: Vite 6.3.1
- **UI Library**: Chakra UI 2.8.2
- **Routing**: React Router DOM 7.5.3
- **State Management**: Context API
- **Animations**: Framer Motion 12.9.2
- **3D Graphics**: React Three Fiber
- **Audio Processing**: WaveSurfer.js 7.9.4
- **HTTP Client**: Axios 1.9.0
- **AI Integration**: Google Generative AI

### Styling & UX
- **Design System**: Chakra UI Components
- **Theme**: Custom Dark Music Theme
- **Icons**: React Icons 5.5.0
- **Responsive**: Mobile-first approach
- **Accessibility**: ARIA compliant

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create `.env` file:
   ```
   VITE_API_URL=http://localhost:3001/api
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Production build:**
   ```bash
   npm run build
   ```

## 📱 Pages

- **Home (`/`)**: EnsAI introduction and features
- **Authentication (`/auth`)**: Login/Register page
- **AI Dashboard (`/dashboard`)**: Personal instrument learning dashboard
- **Recording (`/record`)**: Audio recording and analysis
- **Training (`/training`)**: AI-powered instrument training
- **Profile (`/profile`)**: User profile management

## 🎨 UI/UX Design

### Color Palette
- **Primary Color**: Spotify Green (#1DB954)
- **Accent Color**: Pink (#E91E63)
- **Background**: Dark tones (#191729, #2A2438)
- **Text**: White and gray tones

### Typography
- **Headings**: Poppins
- **Body**: Inter
- **Weight**: 300-700 variations

### Animations
- **Entry Animations**: Fade, slide, scale effects
- **Hover Effects**: Transform and shadow changes
- **Music Visualization**: Dynamic audio wave animations

## 🤖 AI Integration

### Gemini AI Features
- **Instrument Training**: Personalized learning paths for musical instruments
- **Audio Analysis**: Pitch and rhythm assessment for instrument performance
- **Interactive Chat**: Ask instrument-related questions in natural language
- **Learning Support**: Adaptive AI assistance for skill development

### Context Management
- **AuthContext**: User authentication state
- **ChatbotContext**: AI chat history and state

## 📦 Project Structure

```
src/
├── api/                    # Backend API calls
├── components/             # React components
│   ├── auth/              # Authentication components
│   ├── audio/             # Audio processing components
│   ├── layout/            # Page layout components
│   └── ui/                # General UI components
├── context/               # React Context providers
├── pages/                 # Page components
├── utils/                 # Utility functions
└── assets/               # Static files
```

## 🎯 Use Cases

1. **Music Student**: Learn instrument fundamentals with AI instructor
2. **Amateur Musician**: Practice pitch control and audio analysis for instruments
3. **Music Educator**: Interactive training materials for students
4. **Professional**: Performance analysis and skill development tracking

## 🔒 Security

- **JWT Authentication**: Secure session management
- **API Rate Limiting**: DDoS protection
- **Input Validation**: XSS and injection attack protection
- **HTTPS Ready**: SSL/TLS support

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm run preview
```

### Docker (Optional)
```bash
docker build -t ensai-web .
docker run -p 80:80 ensai-web
```

## 🤝 Contributing

EnsAI is an open source project and we welcome contributions!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is distributed under the MIT License.

## 🎵 Start Your Instrument Learning Journey with EnsAI!

Discover the future of AI-powered instrument learning. Develop your musical skills with your personal AI instructor and unleash your creativity. 