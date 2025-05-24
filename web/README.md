# EnsAI - AI-Powered Instrument Learning Platform

EnsAI is an innovative web application that uses artificial intelligence to help users learn musical instruments through real-time pitch detection, intelligent training modules, and personalized feedback.

## 🚀 Features

- **AI-Powered Learning**: Gemini AI integration for personalized music instruction
- **Real-time Pitch Detection**: Advanced audio analysis for immediate feedback
- **Interactive Training Modules**: Structured lessons for different skill levels
- **Audio Recording & Analysis**: Record your practice sessions and track progress
- **Multi-instrument Support**: Piano, guitar, violin, and more
- **Progress Tracking**: Monitor your improvement over time
- **AI Music Assistant**: Get help and tips from our intelligent chatbot

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Chakra UI
- **AI Integration**: Google Gemini AI (gemini-2.0-flash)
- **Audio Processing**: Web Audio API, WaveSurfer.js
- **Animations**: Framer Motion
- **State Management**: React Context API
- **HTTP Client**: Axios

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Google AI Studio API key (for Gemini AI)

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ensai/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables Setup**
   Create a `.env` file in the web directory and add the following variables:
   ```bash
   # Gemini AI API Key - Get from Google AI Studio
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   
   # Backend API URL
   VITE_API_URL=http://localhost:3001/api
   ```

   **Getting your Gemini API Key:**
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Sign in with your Google account
   - Create a new API key
   - Copy the key and add it to your `.env` file

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🎵 How to Use

### Getting Started
1. **Register/Login**: Create an account or log in to access all features
2. **Dashboard**: View your recordings and progress
3. **Record**: Start recording your instrument practice
4. **Training**: Access AI-powered training modules
5. **AI Assistant**: Get help from the intelligent music chatbot

### Recording Features
- Real-time pitch detection and visualization
- Multi-format audio support (MP3, WAV, OGG, M4A)
- Waveform visualization
- Performance analysis and feedback

### Training Modules
- Beginner to advanced skill levels
- Instrument-specific lessons
- Real-time feedback during practice
- Progress tracking and scoring

### AI Assistant
- Ask questions about music theory
- Get practice tips and techniques
- Troubleshoot technical issues
- Receive personalized learning suggestions

## 🔒 Security

- API keys are stored in environment variables (not in code)
- JWT-based authentication
- Protected routes for authenticated content
- CORS handling for API requests

## 🎨 UI/UX Features

- Dark theme optimized for music learning
- Responsive design for all devices
- Smooth animations and transitions
- Interactive audio visualizations
- Modern glassmorphism design elements

## 📱 Browser Compatibility

- Chrome (recommended for best audio support)
- Firefox
- Safari
- Edge

Note: Microphone access is required for recording features.

## 🚫 Important Notes

- Never commit your actual API keys to version control
- The `.env` file is gitignored for security
- Make sure to keep your Gemini API key secure
- For production deployment, use environment variables on your hosting platform

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the EnsAI platform for AI-powered instrument learning.

---

**Made with ❤️ for music learners worldwide** 