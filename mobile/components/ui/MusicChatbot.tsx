import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  FAB,
  Card,
  Avatar,
  IconButton,
  Button,
  ActivityIndicator,
  useTheme,
  Portal,
} from 'react-native-paper';
import { useChatbot, Message } from '../../context/ChatbotContext';
import { useColorScheme } from '@/hooks/useColorScheme';

const { width: screenWidth } = Dimensions.get('window');

// Message component for individual chat bubbles
interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const theme = useTheme();
  const isUser = message.role === 'user';
  
  return (
    <View style={[
      styles.messageContainer,
      isUser ? styles.userMessageContainer : styles.assistantMessageContainer
    ]}>
      {!isUser && (
        <Avatar.Icon
          size={32}
          icon="robot"
          style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
        />
      )}
      
      <View style={[
        styles.messageBubble,
        isUser 
          ? [styles.userBubble, { backgroundColor: theme.colors.primary }]
          : [styles.assistantBubble, { backgroundColor: theme.colors.surface }]
      ]}>
        <Text style={[
          styles.messageText,
          { color: isUser ? theme.colors.onPrimary : theme.colors.onSurface }
        ]}>
          {message.content}
        </Text>
      </View>
      
      {isUser && (
        <Avatar.Icon
          size={32}
          icon="account"
          style={[styles.avatar, { backgroundColor: theme.colors.secondary }]}
        />
      )}
    </View>
  );
};

// Error state component
interface ErrorStateProps {
  error: string;
  retryInitialization: () => void;
  isLoading: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, retryInitialization, isLoading }) => {
  const theme = useTheme();
  const isQuotaError = error.includes('kota');

  return (
    <Card style={[styles.errorCard, { backgroundColor: theme.colors.errorContainer }]}>
      <Card.Content style={styles.errorContent}>
        <Avatar.Icon
          size={48}
          icon="alert-circle"
          style={{ backgroundColor: theme.colors.error }}
        />
        <Text style={[styles.errorText, { color: theme.colors.onErrorContainer }]}>
          {error}
        </Text>
        {isQuotaError && (
          <>
            <Text style={[styles.errorSubtext, { color: theme.colors.onErrorContainer }]}>
              Gemini API&apos;sinin ücretsiz katman kotasına ulaşılmış olabilir.
              Başka bir model kullanmayı deneyebilir veya daha sonra tekrar deneyebilirsiniz.
            </Text>
            <Button
              mode="contained"
              onPress={retryInitialization}
              loading={isLoading}
              style={styles.retryButton}
              icon="refresh"
            >
              Yeniden Dene
            </Button>
          </>
        )}
      </Card.Content>
    </Card>
  );
};

// Main MusicChatbot component
const MusicChatbot: React.FC = () => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const { 
    isOpen, 
    toggleChatbot, 
    messages, 
    isLoading, 
    sendUserMessage, 
    resetChat,
    error,
    retryInitialization
  } = useChatbot();
  
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  // Animate chatbot open/close
  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Handle message submission
  const handleSubmit = async () => {
    if (input.trim() && !isLoading) {
      await sendUserMessage(input);
      setInput('');
    }
  };

  // Loading state component
  const LoadingIndicator = () => (
    <View style={styles.loadingContainer}>
      <Avatar.Icon
        size={32}
        icon="robot"
        style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
      />
      <View style={[styles.loadingBubble, { backgroundColor: theme.colors.surface }]}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          Düşünüyor...
        </Text>
      </View>
    </View>
  );

  return (
    <>
      {/* Floating Action Button */}
      <FAB
        icon="robot"
        style={[
          styles.fab,
          { backgroundColor: theme.colors.primary }
        ]}
        onPress={toggleChatbot}
        label="Asistan"
        visible={!isOpen}
      />

      {/* Chat Bubble Modal */}
      {isOpen && (
        <Portal>
          <TouchableWithoutFeedback onPress={toggleChatbot}>
            <View style={styles.overlay}>
              <TouchableWithoutFeedback>
                <Animated.View
                  style={[
                    styles.chatContainer,
                    {
                      backgroundColor: theme.colors.surface,
                      transform: [
                        { scale: scaleAnim },
                        {
                          translateY: slideAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [300, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {/* Chat Header */}
                  <View style={[styles.chatHeader, { backgroundColor: theme.colors.primaryContainer }]}>
                    <Avatar.Icon
                      size={32}
                      icon="robot"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <Text style={[styles.chatTitle, { color: theme.colors.onPrimaryContainer }]}>
                      Müzik Asistanı
                    </Text>
                    <View style={styles.headerActions}>
                      <IconButton
                        icon="refresh"
                        size={20}
                        onPress={resetChat}
                        disabled={isLoading}
                        iconColor={theme.colors.onPrimaryContainer}
                      />
                      <IconButton
                        icon="close"
                        size={20}
                        onPress={toggleChatbot}
                        iconColor={theme.colors.onPrimaryContainer}
                      />
                    </View>
                  </View>

                  {/* Chat Body */}
                  <KeyboardAvoidingView 
                    style={styles.chatBody}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  >
                    <ScrollView
                      ref={scrollViewRef}
                      style={styles.messagesContainer}
                      contentContainerStyle={styles.messagesContent}
                      showsVerticalScrollIndicator={false}
                    >
                      {/* Error State */}
                      {error && (
                        <ErrorState
                          error={error}
                          retryInitialization={retryInitialization}
                          isLoading={isLoading}
                        />
                      )}

                      {/* Welcome Message */}
                      {!error && messages.length === 0 && (
                        <View style={styles.welcomeContainer}>
                          <Avatar.Icon
                            size={64}
                            icon="robot"
                            style={{ backgroundColor: theme.colors.primary }}
                          />
                          <Text style={[styles.welcomeTitle, { color: theme.colors.onSurface }]}>
                            Müzik Asistanı Yükleniyor
                          </Text>
                          <ActivityIndicator size="large" color={theme.colors.primary} />
                        </View>
                      )}

                      {/* Messages */}
                      {messages.map((message, index) => (
                        <MessageBubble key={index} message={message} />
                      ))}

                      {/* Loading Indicator */}
                      {isLoading && <LoadingIndicator />}
                    </ScrollView>

                    {/* Chat Input */}
                    <View style={[styles.inputContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <TextInput
                        style={[
                          styles.textInput,
                          {
                            backgroundColor: theme.colors.surface,
                            color: theme.colors.onSurface,
                            borderColor: theme.colors.outline,
                          }
                        ]}
                        placeholder="Bir soru sorun..."
                        placeholderTextColor={theme.colors.onSurfaceVariant}
                        value={input}
                        onChangeText={setInput}
                        multiline
                        maxLength={500}
                        editable={!isLoading && !error}
                        onSubmitEditing={handleSubmit}
                      />
                      <IconButton
                        icon="send"
                        size={24}
                        mode="contained"
                        onPress={handleSubmit}
                        disabled={!input.trim() || isLoading || !!error}
                        style={styles.sendButton}
                        iconColor={theme.colors.onPrimary}
                        containerColor={theme.colors.primary}
                      />
                    </View>
                  </KeyboardAvoidingView>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Portal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  chatContainer: {
    height: '70%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  chatTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
  },
  chatBody: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatar: {
    marginHorizontal: 4,
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: screenWidth * 0.6,
  },
  userBubble: {
    borderBottomRightRadius: 4,
    marginRight: 8,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    marginLeft: 8,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginVertical: 4,
    maxWidth: '80%',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    marginLeft: 8,
  },
  loadingText: {
    fontSize: 14,
    marginLeft: 8,
  },
  errorCard: {
    marginVertical: 8,
  },
  errorContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
  },
  errorSubtext: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
    opacity: 0.8,
  },
  retryButton: {
    marginTop: 8,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    margin: 0,
  },
});

export default MusicChatbot; 