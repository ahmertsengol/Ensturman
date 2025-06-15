import { Box, Button, Container, Heading, Text, VStack, Flex, Image, Stack, Icon, HStack, Badge } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaMicrophone, FaHeadphones, FaCloudUploadAlt, FaMusic, FaPlayCircle, FaArrowRight, FaCheck, FaPlay } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { AnimatedElement, GlassmorphicCard, AudioDecorations, AnimatedCard, MusicalBackground, InstrumentsCard, LearningCard } from '../components/ui';
import { useState } from 'react';

const FeatureCard = ({ icon, title, description, isHighlighted = false }) => {
  return (
    <GlassmorphicCard
      p={6}
      borderRadius="lg"
      textAlign="center"
      animationType="slideUp"
      hoverEffect={true}
      glowEffect={isHighlighted}
      height="100%"
    >
      <AnimatedElement animationType="scale" delay={0.3}>
        <Icon as={icon} boxSize={12} color="brand.500" mb={4} />
      </AnimatedElement>
      <Heading as="h3" size="md" mb={3} color="white">
        {title}
      </Heading>
      <Text color="gray.300">
        {description}
      </Text>
    </GlassmorphicCard>
  );
};

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const bgGradient = 'linear-gradient(to bottom, #191729, #1F1D36, #1a202c)';
  const [isPlaying, setIsPlaying] = useState(false);
  
  const togglePlayback = () => {
    console.log('Play button clicked! Current state:', isPlaying);
    setIsPlaying(!isPlaying);
  };
  
  return (
    <Box>
      {/* Musical Background Animation */}
      <MusicalBackground isActive={isPlaying} density={isPlaying ? 30 : 15} />
      
      {/* Hero Section */}
      <Box
        bgGradient={bgGradient}
        pt={{ base: 20, md: 28 }}
        pb={{ base: 16, md: 20 }}
        px={8}
        position="relative"
        overflow="hidden"
      >
        {/* Music-themed background pattern overlay */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.05"
          backgroundImage={`url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M29.9 47.5c7.5 0 13.5-6 13.5-13.5 0-7.4-6-13.5-13.5-13.5v-20c0-.6-.4-1-1-1s-1 .4-1 1v20c-7.4 0-13.5 6-13.5 13.5 0 7.4 6 13.5 13.5 13.5 7.5 0 13.5-6 13.5-13.5v-20m0 0c0-.7-.5-1-1-1s-1 .3-1 1M39.9 34c0 5.5-4.5 10-10 10s-10-4.5-10-10 4.5-10 10-10v-15c0-1 .4-1 1-1s1 0 1 1v15c5.5 0 10 4.5 10 10z' fill='white' fill-rule='evenodd'/%3E%3C/svg%3E")`}
          backgroundRepeat="repeat"
          pointerEvents="none"
        />
        
        <Container maxW="container.xl" position="relative" zIndex={2}>
          <VStack spacing={12} textAlign="center">
            {/* Header Badge */}
            <AnimatedElement animationType="fadeIn">
              <Badge
                bg="brand.500"
                color="white"
                px={4}
                py={2}
                borderRadius="full"
                fontSize="sm"
                fontWeight="600"
                textTransform="none"
                leftIcon={<FaMusic />}
              >
                AI-Powered Music Learning
              </Badge>
            </AnimatedElement>
            
            {/* Main Heading */}
            <AnimatedElement animationType="slideUp" delay={0.1}>
              <VStack spacing={6}>
              <Heading
                as="h1"
                  fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
                  fontWeight="800"
                  lineHeight="1.1"
                  letterSpacing="-0.02em"
                color="white"
                  maxW="5xl"
                >
                  Master instruments with{" "}
                  <Text
                    as="span"
                bgGradient="linear(to-r, brand.500, accent.500)"
                bgClip="text"
                    position="relative"
              >
                    EnsAI
                  </Text>
              </Heading>
                
                <Text 
                  fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                  color="gray.300"
                  maxW="3xl"
                  lineHeight="1.6"
                  fontWeight="400"
                >
                  Your AI-powered personal music assistant featuring real-time pitch detection, 
                  intelligent training modules, and interactive learning experience.
              </Text>
              </VStack>
              
            </AnimatedElement>
            
                <Box mt={6} mb={12}>
                  <AudioDecorations.Equalizer 
                  isActive={isPlaying}
                    barCount={16} 
                    height="30px"
                    spacing={1.5}
                  />
                  
                  {/* Play me Button - Minimalist */}
                  <HStack justify="center" mt={3}>
                    <Box
                      as="button"
                      onClick={togglePlayback}
                      position="relative"
                      display="flex"
                      alignItems="center"
                      gap={2}
                      px={4}
                      py={2}
                      bg="rgba(255, 255, 255, 0.05)"
                      backdropFilter="blur(20px)"
                      border="1px solid"
                      borderColor={isPlaying ? "rgba(239, 68, 68, 0.3)" : "rgba(255, 255, 255, 0.1)"}
                      borderRadius="full"
                      color="gray.300"
                      fontSize="xs"
                      fontWeight="500"
                      cursor="pointer"
                      transition="all 0.3s ease"
                      boxShadow={isPlaying ? "0 0 20px rgba(239, 68, 68, 0.3)" : "none"}
                      _hover={{
                        bg: "rgba(255, 255, 255, 0.08)",
                        borderColor: isPlaying ? "red.400" : "brand.400",
                        color: "white",
                        transform: "translateY(-1px)",
                        boxShadow: isPlaying ? "0 0 25px rgba(239, 68, 68, 0.4), 0 8px 32px rgba(0, 0, 0, 0.3)" : "0 0 20px rgba(128, 90, 213, 0.4), 0 8px 32px rgba(0, 0, 0, 0.3)"
                      }}
                    >
                <Icon 
                        as={isPlaying ? FaPlayCircle : FaPlay} 
                        boxSize={3} 
                        color={isPlaying ? "red.400" : "brand.400"}
                  transition="all 0.3s ease"
                        transform={isPlaying ? "scale(1.1)" : "scale(1)"}
                      />
                      <Text fontSize="xs">
                        {isPlaying ? 'Stop' : 'Play me'}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
            
            {/* CTA Buttons */}
            <AnimatedElement animationType="slideUp" delay={0.2}>
              <HStack spacing={4} flexWrap="wrap" justify="center">
                {!isAuthenticated() && (
                  <Button
                    as={RouterLink}
                    to="/auth"
                    size="lg"
                    bg="brand.500"
                    color="white"
                    px={8}
                    py={6}
                    borderRadius="xl"
                    fontSize="md"
                    fontWeight="600"
                    rightIcon={<FaArrowRight />}
                    _hover={{
                      bg: "brand.600",
                      transform: "translateY(-2px)",
                      boxShadow: "lg"
                    }}
                    transition="all 0.3s ease"
                  >
                    Start Learning
                  </Button>
                )}
              </HStack>
            </AnimatedElement>
            
            {/* Interactive Cards Layout */}
            <AnimatedElement animationType="fadeIn" delay={0.3}>
              <HStack 
                spacing={{ base: 8, md: 16, lg: 20 }} 
                justify="center"
                align="center"
                flexWrap="wrap"
                gap={{ base: 8, md: 12, lg: 20 }}
                mt={12}
              >
                <Box>
                  <InstrumentsCard />
            </Box>
              
                {/* Animated Card in the center */}
                <AnimatedElement animationType="scale" delay={0.4}>
                  <Box maxW="400px">
                    <AnimatedCard onPlayClick={togglePlayback} />
                  </Box>
                </AnimatedElement>
                
                <Box>
                  <LearningCard />
                </Box>
              </HStack>
            </AnimatedElement>
          </VStack>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Box
        bg="#1a202c"
        py={{ base: 12, md: 20 }}
      >
        <Container maxW="container.xl">
        <VStack spacing={12}>
          <AnimatedElement animationType="fadeIn">
          <VStack spacing={4} textAlign="center" maxW="3xl" mx="auto">
              <Heading 
                as="h2" 
                size="xl"
                bgGradient="linear(to-r, brand.500, accent.500)"
                bgClip="text"
              >
              AI-Powered Features
            </Heading>
              <Text fontSize="lg" color="gray.400">
              Revolutionary instrument learning experience enhanced by artificial intelligence
            </Text>
              
          </VStack>
          </AnimatedElement>
          
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={8}
            w="full"
          >
            <AnimatedElement delay={0.1} flex={1}>
            <FeatureCard
              icon={FaMicrophone}
              title="AI Audio Analysis"
              description="Real-time pitch detection and AI-powered audio analysis to improve your instrument performance"
            />
            </AnimatedElement>
            
            <AnimatedElement delay={0.3} flex={1}>
            <FeatureCard
              icon={FaCloudUploadAlt}
              title="Smart Training Modules"
              description="AI-personalized instrument training modules tailored to your skill level and learning pace"
                  isHighlighted={true}
            />
            </AnimatedElement>
            
            <AnimatedElement delay={0.5} flex={1}>
            <FeatureCard
              icon={FaHeadphones}
              title="AI Music Assistant"
              description="Gemini AI-powered personal music instructor providing 24/7 instrument learning support"
            />
            </AnimatedElement>
          </Stack>
        </VStack>
      </Container>
      </Box>
      
      {/* CTA Section */}
      <Box
        bgGradient="linear(to-r, gray.800, brand.700, accent.700)"
        py={12}
        px={8}
        color="white"
        position="relative"
        overflow="hidden"
      >
        {/* Sound wave pattern overlay */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          opacity="0.1"
          backgroundImage={`url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='smallGrid' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23smallGrid)' /%3E%3C/svg%3E")`}
          pointerEvents="none"
        />
        
        <Container maxW="container.xl">
          <Flex 
            direction={{ base: 'column', md: 'row' }}
            align="center"
            justify="space-between"
          >
            <AnimatedElement animationType="slideRight" flex={2}>
              <VStack spacing={6} textAlign={{ base: 'center', md: 'left' }} align={{ base: 'center', md: 'flex-start' }}>
            <Heading as="h2" size="xl">
              Ready to master instruments with EnsAI?
            </Heading>
            <Text fontSize="lg" maxW="2xl">
              Join EnsAI and discover the future of AI-powered instrument learning. Develop your musical skills with your personal AI instructor.
            </Text>
            {!isAuthenticated() && (
              <Button
                as={RouterLink}
                to="/auth"
                size="lg"
                colorScheme="whiteAlpha"
                mt={4}
                    _hover={{
                      bg: "whiteAlpha.300",
                      transform: "translateY(-2px)",
                    }}
              >
                Sign Up Now
              </Button>
            )}
          </VStack>
            </AnimatedElement>
            
                <Box mt={6}>
                  <AudioDecorations.Equalizer 
                    isActive={isPlaying} 
                    barCount={16} 
                    height="30px"
                    spacing={1.5}
                  />
                </Box>
            
            <AnimatedElement animationType="slideLeft" flex={1} display={{ base: 'none', md: 'flex' }} justifyContent="center">
              <AudioDecorations.Visualizer 
                isActive={isPlaying} 
                size="200px"
                primaryColor="rgba(255, 255, 255, 0.8)"
                secondaryColor="rgba(255, 255, 255, 0.5)"
              />
            </AnimatedElement>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage; 