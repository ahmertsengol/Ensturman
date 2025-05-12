import { createContext, useContext, useState, useEffect } from 'react';
import { sendMessage, initializeChatWithGreeting } from '../api/geminiApi';

// Create the context
const ChatbotContext = createContext();

// Custom hook to use the chatbot context
export const useChatbot = () => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
};

// Provider component
export const ChatbotProvider = ({ children }) => {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Check if error is related to quota limits
  const isQuotaError = (err) => {
    return err && err.message && err.message.includes('quota');
  };

  // Initialize the chat when the component mounts
  useEffect(() => {
    const initChat = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { chat, greeting } = await initializeChatWithGreeting();
        setChat(chat);
        setMessages([
          { role: 'assistant', content: greeting }
        ]);
      } catch (err) {
        console.error('Chatbot initialization error:', err);
        
        if (isQuotaError(err)) {
          setError('API kota sınırı aşıldı. Lütfen daha sonra tekrar deneyin veya farklı bir API anahtarı kullanın.');
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
  const sendUserMessage = async (message) => {
    if (!message.trim() || !chat) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message to the chat history
      setMessages(prev => [...prev, { role: 'user', content: message }]);
      
      // Send message to the API
      const response = await sendMessage(chat, message);
      
      // Add assistant response to the chat history
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error('Message sending error:', err);
      
      if (isQuotaError(err)) {
        setError('API kota sınırı aşıldı. Lütfen daha sonra tekrar deneyin.');
      } else {
        setError('Yanıt alınırken bir hata oluştu. Lütfen tekrar deneyin.');
      }
      
      // Add error message to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle the chatbot visibility
  const toggleChatbot = () => {
    setIsOpen(prev => !prev);
  };

  // Function to reset the chat
  const resetChat = async () => {
    try {
      setIsLoading(true);
      setMessages([]);
      setError(null);
      
      // Use the same initialization method as initial chat
      const { chat: newChat, greeting } = await initializeChatWithGreeting();
      setChat(newChat);
      setMessages([{ role: 'assistant', content: greeting }]);
    } catch (err) {
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
  const retryInitialization = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
    }
  };

  // Context value
  const value = {
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