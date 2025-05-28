import { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Flex,
  Text,
  Input,
  Button,
  VStack,
  Avatar,
  HStack,
  InputGroup,
  InputRightElement,
  keyframes,
  Tooltip,
  Spinner,
  ScaleFade,
  SlideFade,
} from '@chakra-ui/react';
import { FaRobot, FaPaperPlane, FaUserCircle, FaSyncAlt, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useChatbot } from '../../context/ChatbotContext';
import './chatbot.css';

// Animation for the floating button
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Animation for the pulse effect
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(29, 185, 84, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(29, 185, 84, 0); }
  100% { box-shadow: 0 0 0 0 rgba(29, 185, 84, 0); }
`;

// Animation for chat bubble appearance
const bubbleIn = keyframes`
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

// Animation for chat bubble opening
const bubbleOpen = keyframes`
  0% { transform: scale(0); opacity: 0; transform-origin: bottom right; }
  100% { transform: scale(1); opacity: 1; transform-origin: bottom right; }
`;

// Animation for chat bubble closing
const bubbleClose = keyframes`
  0% { transform: scale(1); opacity: 1; transform-origin: bottom right; }
  100% { transform: scale(0); opacity: 0; transform-origin: bottom right; }
`;

// Message component for chat messages
const Message = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <HStack 
      alignSelf={isUser ? 'flex-end' : 'flex-start'} 
      spacing={2} 
      maxW={['220px', '250px', '280px']}
      w="fit-content"
      mb={2}
      animation={`${bubbleIn} 0.3s ease-out forwards`}
    >
      {!isUser && (
        <Avatar 
          size="sm" 
          bg="brand.500" 
          icon={<FaRobot color="white" />} 
          mt={1}
        />
      )}
      
      <Box
        p={3}
        borderRadius={isUser ? "15px 15px 0 15px" : "15px 15px 15px 0"}
        bg={isUser ? 'brand.500' : 'dark.300'}
        color="white"
        boxShadow="md"
      >
        <Text fontSize="sm">{message.content}</Text>
      </Box>
      
      {isUser && (
        <Avatar 
          size="sm" 
          bg="accent.500" 
          icon={<FaUserCircle color="white" />} 
          mt={1}
        />
      )}
    </HStack>
  );
};

// Main MusicChatbot component
const MusicChatbot = () => {
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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus the input when the chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendUserMessage(input);
      setInput('');
    }
  };

  // Render the quota error message
  const renderErrorState = () => {
    const isQuotaError = error && error.includes('kota');

    return (
      <VStack spacing={4} p={4} bg="red.900" borderRadius="md" align="center" mt={4}>
        <Box 
          p={3} 
          bg="dark.300" 
          borderRadius="full"
          color="red.500"
        >
          <FaExclamationTriangle size={24} />
        </Box>
        
        <Text fontSize="md" textAlign="center">
          {error}
        </Text>
        
        {isQuotaError && (
          <Box>
            <Text fontSize="sm" textAlign="center" mb={3}>
              You can try another model or try again later.
              Gemini API's free tier quota has been reached.
            </Text>
            
            <Button 
              leftIcon={<FaSyncAlt />} 
              onClick={retryInitialization}
              colorScheme="brand"
              size="sm"
              isLoading={isLoading}
            >
              Yeniden Dene
            </Button>
          </Box>
        )}
      </VStack>
    );
  };

  return (
    <>
      {/* Floating chat button */}
      <Tooltip label="Ask me anything..." placement="left">
        <IconButton
          aria-label="Sohbeti aç"
          icon={<FaRobot />}
          colorScheme="brand"
          borderRadius="full"
          boxSize={['60px', '65px']}
          position="fixed"
          bottom={['20px', '30px']}
          right={['20px', '30px']}
          zIndex={999}
          onClick={toggleChatbot}
          animation={`${float} 3s ease-in-out infinite, ${pulse} 2s infinite`}
          transition="all 0.3s"
          _hover={{ transform: 'scale(1.1)' }}
          boxShadow="0 4px 20px rgba(29, 185, 84, 0.4)"
        />
      </Tooltip>

      {/* Chat Bubble */}
      <Box
        position="fixed"
        bottom={['90px', '100px']}
        right={['20px', '30px']}
        zIndex={1000}
        animation={isOpen ? `${bubbleOpen} 0.3s ease-out forwards` : `${bubbleClose} 0.3s ease-in forwards`}
        display={isOpen ? 'block' : 'none'}
        transformOrigin="bottom right"
        className="music-chatbot-bubble"
      >
        {/* Chat Bubble Triangle */}
        <Box
          position="absolute"
          bottom="-10px"
          right="24px"
          width="0"
          height="0"
          borderLeft="10px solid transparent"
          borderRight="10px solid transparent"
          borderTop="15px solid"
          borderTopColor="dark.400"
          zIndex={1001}
          className="music-chatbot-pointer"
        />
        
        {/* Chat Bubble Main Container */}
        <Box
          width={['300px', '350px']}
          maxHeight="500px"
          bg="dark.400"
          borderRadius="24px"
          boxShadow="0 10px 30px rgba(0,0,0,0.5)"
          overflow="hidden"
          border="1px solid"
          borderColor="dark.300"
          display="flex"
          flexDirection="column"
          className="music-chatbot-container"
          sx={{
            // Override specific Chakra UI generated classes
            '&.css-1ht6jsg, & .css-1ht6jsg': {
              color: 'white !important',
              background: 'var(--chakra-colors-dark-300) !important',
              borderColor: 'var(--chakra-colors-dark-200) !important',
            },
            '&.css-h2yqag, & .css-h2yqag': {
              color: 'white !important',
              background: 'var(--chakra-colors-dark-400) !important',
              borderColor: 'var(--chakra-colors-dark-300) !important',
            }
          }}
        >
          {/* Chat Header */}
          <Flex 
            align="center" 
            p={3} 
            bg="dark.300" 
            color="white"
            borderBottom="1px solid"
            borderColor="dark.200"
            borderTopRadius="24px"
          >
            <Avatar size="sm" bg="brand.500" icon={<FaRobot color="white" />} />
            <Text ml={2} fontWeight="medium"> EnsAI Assistant</Text>
            
            <Flex ml="auto" gap={2}>
              <IconButton
                aria-label="Sohbeti sıfırla"
                icon={<FaSyncAlt />}
                size="sm"
                variant="ghost"
                onClick={resetChat}
                isLoading={isLoading}
                color="white"
                _hover={{ bg: 'dark.200' }}
              />
              <IconButton
                aria-label="Kapat"
                icon={<FaTimes />}
                size="sm"
                variant="ghost"
                onClick={toggleChatbot}
                color="white"
                _hover={{ bg: 'dark.200' }}
              />
            </Flex>
          </Flex>
          
          {/* Chat Body */}
          <Flex 
            direction="column" 
            flex={1} 
            p={4} 
            overflowY="auto"
            maxHeight="350px"
            css={{
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                width: '6px',
                background: 'rgba(0,0,0,0.1)',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(29, 185, 84, 0.4)',
                borderRadius: '24px',
              },
            }}
            bg="dark.400"
          >
            {/* Error message */}
            {error && renderErrorState()}
            
            {/* Welcome message when empty */}
            {!error && messages.length === 0 && (
              <Flex 
                direction="column" 
                align="center" 
                justify="center" 
                h="200px"
                p={6}
                textAlign="center"
              >
                <Avatar 
                  size="lg" 
                  bg="brand.500" 
                  icon={<FaRobot color="white" size={32} />}
                  mb={4}
                />
                <Text fontSize="lg" fontWeight="medium" mb={2} color="white">EnsAI is loading...</Text>
                <Spinner color="brand.500" size="md" />
              </Flex>
            )}
            
            {/* Chat messages */}
            <VStack spacing={4} align="stretch">
              {messages.map((msg, index) => (
                <Message key={index} message={msg} />
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <HStack alignSelf="flex-start" spacing={2}>
                  <Avatar size="sm" bg="brand.500" icon={<FaRobot color="white" />} />
                  <Flex 
                    p={3} 
                    borderRadius="15px 15px 15px 0"
                    bg="dark.300" 
                    align="center" 
                    justify="center"
                    color="white"
                  >
                    <Spinner size="sm" color="brand.500" mr={2} />
                    <Text fontSize="sm">Düşünüyor...</Text>
                  </Flex>
                </HStack>
              )}
              
              <div ref={messagesEndRef} />
            </VStack>
          </Flex>
          
          {/* Chat Input */}
          <Box p={3} borderTop="1px solid" borderColor="dark.200" bg="dark.300">
            <form onSubmit={handleSubmit}>
              <InputGroup size="md">
                <Input
                  pr="4.5rem"
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  bg="dark.400"
                  color="white"
                  borderRadius="full"
                  _focus={{ boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                  borderColor="dark.300"
                  ref={inputRef}
                  disabled={isLoading || !!error}
                />
                <InputRightElement width="3.5rem">
                  <IconButton
                    h="1.75rem" 
                    size="sm" 
                    colorScheme="brand"
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    type="submit"
                    borderRadius="full"
                    icon={<FaPaperPlane size="14px" />}
                    disabled={!!error}
                    aria-label="Gönder"
                  />
                </InputRightElement>
              </InputGroup>
            </form>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MusicChatbot; 