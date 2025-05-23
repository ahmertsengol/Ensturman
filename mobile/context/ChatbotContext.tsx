import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sendMessage, initializeChatWithGreeting, ChatSession } from '../api/geminiApi';

// Message interface
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ChatbotContext interface
interface ChatbotContextType {
  chat: ChatSession | null;
  messages: Message[];
  isLoading: boolean;
  isOpen: boolean;
  error: string | null;
  sendUserMessage: (message: string) => Promise<void>;
  toggleChatbot: () => void;
  resetChat: () => Promise<void>;
  retryInitialization: () => void;
}

// Create the context
const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

// Custom hook to use the chatbot context
export const useChatbot = (): ChatbotContextType => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

// Provider props interface
interface ChatbotProviderProps {
  children: ReactNode;
}

// Provider component
export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({ children }) => {
  const [chat, setChat] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Check if error is related to quota limits or network issues
  const isQuotaError = (err: any): boolean => {
    return err && err.message && err.message.includes('quota');
  };

  const isNetworkError = (err: any): boolean => {
    const errorMessage = err?.message?.toLowerCase() || '';
    return errorMessage.includes('network') || 
           errorMessage.includes('fetch') || 
           errorMessage.includes('internet') ||
           errorMessage.includes('bağlantı');
  };

  // Initialize the chat when the component mounts
  useEffect(() => {
    const initChat = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // TEMPORARY: Use local fallback instead of API for testing
        // const { chat: newChat, greeting } = await initializeChatWithGreeting();
        // setChat(newChat);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Local fallback greeting
        const fallbackGreeting = "Merhaba! Ben müzik öğrenme asistanınızım. Size ses kaydetme, perde tespit etme, müzik teorisi ve uygulamanın özellikler hakkında yardımcı olabilirim. Ne öğrenmek istiyorsunuz?";
        
        setMessages([
          { role: 'assistant', content: fallbackGreeting }
        ]);
        
        // Set a mock chat object
        setChat({ sendMessage: async () => "" } as any);
        
      } catch (err: any) {
        console.error('Chatbot initialization error:', err);
        
        if (isQuotaError(err)) {
          setError('API kota sınırı aşıldı. Lütfen daha sonra tekrar deneyin veya farklı bir API anahtarı kullanın.');
        } else if (isNetworkError(err)) {
          setError('İnternet bağlantısı sorunu. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.');
          // Add fallback message when network fails
          setMessages([
            { role: 'assistant', content: 'Merhaba! Ben müzik öğrenme asistanınızım. Şu anda bağlantı sorunları yaşıyorum, lütfen daha sonra tekrar deneyin.' }
          ]);
        } else {
          setError('Sohbet robotu başlatılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, [retryCount]);

  // Function to send a user message
  const sendUserMessage = async (message: string): Promise<void> => {
    if (!message.trim() || !chat) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message to the chat history
      setMessages(prev => [...prev, { role: 'user', content: message }]);
      
      // TEMPORARY: Use local fallback responses instead of API
      // const response = await sendMessage(chat, message);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Local fallback responses based on user input
      let fallbackResponse = "Bu konuda yardımcı olmaya çalışayım. ";
      
      const lowerMessage = message.toLowerCase();
      
      if (lowerMessage.includes('ses') || lowerMessage.includes('kayıt') || lowerMessage.includes('mikrofon')) {
        fallbackResponse += "Ses kaydetme özelliği için 'Kayıt' sekmesini kullanabilirsiniz. Mikrofonunuza izin verdiğinizden emin olun. Yüksek kaliteli kayıt için sessiz bir ortam tercih edin.";
      } else if (lowerMessage.includes('perde') || lowerMessage.includes('nota') || lowerMessage.includes('frekans')) {
        fallbackResponse += "Perde tespit özelliği gerçek zamanlı olarak sesinizi analiz eder. Temiz bir ses çıkarmaya çalışın ve mikrofonunuzu ağzınıza yakın tutun.";
      } else if (lowerMessage.includes('eğitim') || lowerMessage.includes('öğren') || lowerMessage.includes('ders')) {
        fallbackResponse += "Eğitim modülleri 'Keşfet' sekmesinde bulunuyor. Temel müzik teorisinden ileri tekniklere kadar çeşitli konular mevcut.";
      } else if (lowerMessage.includes('kayıtlar') || lowerMessage.includes('dosya') || lowerMessage.includes('liste')) {
        fallbackResponse += "Tüm kayıtlarınızı 'Kayıtlarım' sekmesinde görebilirsiniz. Burada kayıtları çalabilir, silebilir ve analiz edebilirsiniz.";
      } else if (lowerMessage.includes('profil') || lowerMessage.includes('hesap') || lowerMessage.includes('ayar')) {
        fallbackResponse += "Profil ayarlarınızı 'Profil' sekmesinden düzenleyebilirsiniz. Burada performans istatistiklerinizi de görebilirsiniz.";
      } else {
        fallbackResponse += "Size nasıl yardımcı olabileceğim konusunda daha spesifik olabilir misiniz? Ses kaydetme, perde tespit, eğitim modülleri veya uygulama özellikleri hakkında soru sorabilirsiniz.";
      }
      
      // Add assistant response to the chat history
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackResponse }]);
      
    } catch (err: any) {
      console.error('Message sending error:', err);
      
      if (isQuotaError(err)) {
        setError('API kota sınırı aşıldı. Lütfen daha sonra tekrar deneyin.');
      } else if (isNetworkError(err)) {
        setError('İnternet bağlantısı sorunu. Lütfen internet bağlantınızı kontrol edin.');
        // Add fallback response for network errors
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Üzgünüm, şu anda internet bağlantısı sorunu yaşıyorum. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.' 
        }]);
      } else {
        setError('Yanıt alınırken bir hata oluştu. Lütfen tekrar deneyin.');
        // Add error message to chat
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.' 
        }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle the chatbot visibility
  const toggleChatbot = (): void => {
    setIsOpen(prev => !prev);
  };

  // Function to reset the chat
  const resetChat = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setMessages([]);
      setError(null);
      
      // Use the same initialization method as initial chat
      const { chat: newChat, greeting } = await initializeChatWithGreeting();
      setChat(newChat);
      setMessages([{ role: 'assistant', content: greeting }]);
    } catch (err: any) {
      console.error('Chatbot reset error:', err);
      
      if (isQuotaError(err)) {
        setError('API kota sınırı aşıldı. Lütfen daha sonra tekrar deneyin.');
      } else {
        setError('Sohbet robotunu sıfırlarken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to retry initialization
  const retryInitialization = (): void => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
    }
  };

  // Context value
  const value: ChatbotContextType = {
    chat,
    messages,
    isLoading,
    isOpen,
    error,
    sendUserMessage,
    toggleChatbot,
    resetChat,
    retryInitialization
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

export default ChatbotContext; 