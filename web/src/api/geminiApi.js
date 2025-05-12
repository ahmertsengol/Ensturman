import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your API key
const API_KEY = "AIzaSyD1JChEFUKKLOrSnP7AESKgJaQKJ2muPKI";
const genAI = new GoogleGenerativeAI(API_KEY);

// Create a chat session with history
export const createChatSession = async () => {
  try {
    // Change to gemini-2.0-flash model which has higher quota limits
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Create a chat without system instruction (will be added in the first message)
    const chat = model.startChat({
      history: [],
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 1024,
      }
    });
    
    return chat;
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw error;
  }
};

// Send a message to the Gemini API and get a response
export const sendMessage = async (chat, message) => {
  try {
    const result = await chat.sendMessage(message);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error sending message to Gemini API:", error);
    throw error;
  }
};

// Initialize a chat session with a greeting message
export const initializeChatWithGreeting = async () => {
  try {
    const chat = await createChatSession();
    
    // Use a system instruction as the first message from the "user"
    const initialPrompt = `
You are a helpful assistant for a music learning web application.
Please help users with finding training modules, understanding audio recording features, 
explaining pitch detection, providing music tips, navigating the app, and troubleshooting issues.

The application includes audio recording, real-time pitch detection, training modules, 
user profiles, and a performance dashboard.

Please introduce yourself as a music learning assistant.
`;
    
    const greeting = await sendMessage(chat, initialPrompt);
    return { chat, greeting };
  } catch (error) {
    console.error("Error initializing chat with greeting:", error);
    throw error;
  }
}; 