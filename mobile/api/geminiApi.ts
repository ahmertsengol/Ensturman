import { GoogleGenerativeAI } from "@google/generative-ai";

// API key - Web projesindeki ile aynı
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY as string);

// Chat session interface
export interface ChatSession {
  sendMessage: (message: string) => Promise<any>;
}

// Network error checker
const isNetworkError = (error: any): boolean => {
  const errorMessage = error?.message?.toLowerCase() || '';
  return errorMessage.includes('network') || 
         errorMessage.includes('fetch') || 
         errorMessage.includes('connection') ||
         errorMessage.includes('timeout');
};

// Create a chat session with history
export const createChatSession = async (): Promise<ChatSession> => {
  try {
    // Use gemini-pro model which is more stable for mobile
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
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
    if (isNetworkError(error)) {
      throw new Error("İnternet bağlantısı sorunu. Lütfen internet bağlantınızı kontrol edin.");
    }
    throw error;
  }
};

// Send a message to the Gemini API and get a response
export const sendMessage = async (chat: ChatSession, message: string): Promise<string> => {
  try {
    const result = await chat.sendMessage(message);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error sending message to Gemini API:", error);
    if (isNetworkError(error)) {
      throw new Error("İnternet bağlantısı sorunu. Lütfen internet bağlantınızı kontrol edin.");
    }
    throw error;
  }
};

// Initialize a chat session with a greeting message
export const initializeChatWithGreeting = async (): Promise<{ chat: ChatSession; greeting: string }> => {
  try {
    const chat = await createChatSession();
    
    // Use a system instruction as the first message from the "user"
    const initialPrompt = `
Sen bir müzik öğrenme mobil uygulaması için yardımcı bir asistansın.
Kullanıcılara eğitim modülleri bulma, ses kaydetme özelliklerini anlama, 
perde tespit etme, müzik ipuçları sağlama, uygulamada gezinme ve sorun giderme konularında yardımcı ol.

Uygulama ses kaydetme, gerçek zamanlı perde tespit, eğitim modülleri, 
kullanıcı profilleri ve performans paneli içeriyor.

Lütfen kendini bir müzik öğrenme asistanı olarak tanıt. Türkçe konuş.
`;
    
    const greeting = await sendMessage(chat, initialPrompt);
    return { chat, greeting };
  } catch (error) {
    console.error("Error initializing chat with greeting:", error);
    if (isNetworkError(error)) {
      throw new Error("İnternet bağlantısı sorunu. Lütfen internet bağlantınızı kontrol edin.");
    }
    throw error;
  }
}; 