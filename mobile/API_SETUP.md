# API Setup Instructions

## Gemini API Key Setup

To use the chatbot features, you need to configure Google Gemini API keys for both web and mobile projects.

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API key"
4. Copy the generated API key

### 2. Web Project Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace the placeholder with your actual API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

3. Restart the development server:
   ```bash
   npm run dev
   ```

### 3. Mobile Project Setup

1. Navigate to the mobile folder:
   ```bash
   cd ../mobile
   ```

2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` and replace the placeholder with your actual API key:
   ```
   EXPO_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key_here
   EXPO_PUBLIC_API_URL=http://192.168.1.2:3001/api
   ```

4. Restart the Expo development server:
   ```bash
   npx expo start --clear
   ```

## Important Notes

- **Separate API Keys**: Use different API keys for web and mobile projects to avoid quota conflicts
- **Rate Limits**: Free tier has limitations (15 RPM, 250K TPM, 500 RPD for gemini-pro)
- **Fallback Mode**: If no API key is configured, the chatbot will work in offline mode with local responses
- **Security**: Never commit `.env` files to version control

## Troubleshooting

### Network Request Failed
- Check your internet connection
- Verify the API key is correct
- Ensure you haven't exceeded rate limits

### API Key Not Configured
- Make sure `.env` file exists
- Check the variable names are correct
- Restart the development server after changes

### Quota Exceeded
- Wait for the quota to reset (daily limits)
- Consider upgrading to a paid tier
- Use separate API keys for different projects 