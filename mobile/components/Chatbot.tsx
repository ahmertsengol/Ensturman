import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useChatbot } from '../context/ChatbotContext';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

interface ChatMessageProps {
  content: string;
  isUser: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ content, isUser }) => {
  const pulseAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (!isUser) {
      // Start the pulse animation for AI messages
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          })
        ])
      ).start();
    }
  }, []);

  return (
    <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.aiMessage]}>
      {!isUser && (
        <AnimatedLinearGradient
          colors={['rgba(29, 185, 84, 0.05)', 'rgba(45, 212, 191, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.aiMessageGradient,
            {
              transform: [{ scale: pulseAnim }]
            }
          ]}
        />
      )}
      <Text style={[styles.messageText, isUser ? styles.userMessageText : styles.aiMessageText]}>
        {content}
      </Text>
    </View>
  );
};

const Chatbot = () => {
  const { 
    messages, 
    isLoading, 
    isOpen, 
    error, 
    sendUserMessage, 
    toggleChatbot, 
    resetChat 
  } = useChatbot();
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Animation effect when the chatbot is opened/closed
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease)
    }).start();
  }, [isOpen]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (inputText.trim() === '') return;
    
    const message = inputText;
    setInputText('');
    Keyboard.dismiss();
    await sendUserMessage(message);
  };

  const renderItem = ({ item }: { item: { role: string; content: string } }) => (
    <ChatMessage content={item.content} isUser={item.role === 'user'} />
  );

  if (!isOpen) {
    return (
      <TouchableOpacity 
        style={[styles.chatButton, { bottom: insets.bottom + 20 }]} 
        onPress={toggleChatbot}
      >
        <LinearGradient
          colors={['#1DB954', '#11998e']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0]
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          paddingBottom: insets.bottom,
          transform: [{ translateY }]
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(13, 17, 23, 0.95)', 'rgba(20, 30, 48, 0.9)']}
        style={styles.background}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Müzik Asistanı</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={resetChat}>
            <Ionicons name="refresh" size={20} color="#1DB954" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={toggleChatbot}>
            <Ionicons name="close" size={22} color="#1DB954" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {/* Input area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Mesajınızı yazın..."
          placeholderTextColor="#666"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity 
          style={[styles.sendButton, inputText.trim() === '' && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={inputText.trim() === '' || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    zIndex: 999,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(29, 185, 84, 0.3)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1DB954',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 12,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: '85%',
    marginVertical: 6,
    padding: 12,
    borderRadius: 18,
    position: 'relative',
    overflow: 'hidden',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1DB954',
    borderTopRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(45, 45, 50, 0.7)',
    borderTopLeftRadius: 4,
  },
  aiMessageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#eee',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(29, 185, 84, 0.3)',
    backgroundColor: 'rgba(30, 30, 35, 0.5)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(45, 45, 50, 0.5)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#555',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 10,
  },
  errorText: {
    color: '#ff3b30',
    textAlign: 'center',
  },
  chatButton: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default Chatbot; 