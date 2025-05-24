import { Box, Button, Container, Heading, Text, VStack, Flex, Image, Stack, Icon, HStack, SimpleGrid } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaMicrophone, FaHeadphones, FaCloudUploadAlt, FaMusic, FaPlayCircle, FaBrain, FaUser, FaDashboard } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { AnimatedElement, GlassmorphicCard, AudioDecorations } from '../components/ui';
import { useState } from 'react';

// Etkileşimli Kart Component'ı
const InteractiveCard = ({ icon, title, description, to, colorScheme = "brand", delay = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <AnimatedElement animationType="slideUp" delay={delay}>
      <Box
        as={RouterLink}
        to={to}
        position="relative"
        p={8}
        borderRadius="xl"
        bg="rgba(255, 255, 255, 0.05)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(255, 255, 255, 0.1)"
        textAlign="center"
        height="300px"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        cursor="pointer"
        transition="all 0.4s ease"
        overflow="hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        _hover={{
          transform: "translateY(-10px) scale(1.02)",
          boxShadow: `0 20px 40px rgba(29, 185, 84, 0.3), 0 0 30px rgba(233, 30, 99, 0.2)`,
          bg: "rgba(255, 255, 255, 0.1)",
          borderColor: colorScheme === "brand" ? "brand.400" : "accent.400"
        }}
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: `linear(45deg, ${colorScheme === "brand" ? "brand.500" : "accent.500"}, transparent, ${colorScheme === "brand" ? "accent.500" : "brand.500"})`,
          opacity: isHovered ? 0.1 : 0,
          transition: "opacity 0.4s ease",
          borderRadius: "xl"
        }}
      >
        {/* Animated Background Pattern */}
        <Box
          position="absolute"
          top="-50%"
          left="-50%"
          width="200%"
          height="200%"
          bgGradient={`radial(circle, ${colorScheme === "brand" ? "brand.500" : "accent.500"}, transparent)`}
          opacity={isHovered ? 0.1 : 0}
          transform={isHovered ? "rotate(180deg)" : "rotate(0deg)"}
          transition="all 1s ease"
        />
        
        {/* Icon */}
        <Box position="relative" zIndex={2}>
          <Icon 
            as={icon} 
            boxSize={16} 
            color={colorScheme === "brand" ? "brand.400" : "accent.400"}
            mb={6}
            transform={isHovered ? "scale(1.1) rotate(5deg)" : "scale(1)"}
            transition="all 0.3s ease"
          />
        </Box>
        
        {/* Title */}
        <Heading 
          as="h3" 
          size="lg" 
          mb={4} 
          color="white"
          position="relative" 
          zIndex={2}
          transform={isHovered ? "translateY(-5px)" : "translateY(0)"}
          transition="all 0.3s ease"
        >
          {title}
        </Heading>
        
        {/* Description */}
        <Text 
          color="gray.300" 
          fontSize="md"
          position="relative" 
          zIndex={2}
          maxW="250px"
          opacity={isHovered ? 1 : 0.8}
          transform={isHovered ? "translateY(-5px)" : "translateY(0)"}
          transition="all 0.3s ease"
        >
          {description}
        </Text>
        
        {/* Hover Effect Particles */}
        {isHovered && (
          <>
            <Box
              position="absolute"
              top="20%"
              right="20%"
              width="4px"
              height="4px"
              bg={colorScheme === "brand" ? "brand.400" : "accent.400"}
              borderRadius="full"
              animation="float 2s ease-in-out infinite"
            />
            <Box
              position="absolute"
              bottom="30%"
              left="15%"
              width="6px"
              height="6px"
              bg={colorScheme === "brand" ? "accent.400" : "brand.400"}
              borderRadius="full"
              animation="float 2.5s ease-in-out infinite reverse"
            />
            <Box
              position="absolute"
              top="60%"
              right="10%"
              width="3px"
              height="3px"
              bg={colorScheme === "brand" ? "brand.300" : "accent.300"}
              borderRadius="full"
              animation="float 3s ease-in-out infinite"
            />
          </>
        )}
      </Box>
    </AnimatedElement>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <GlassmorphicCard
      p={6}
      borderRadius="lg"
      textAlign="center"
      animationType="slideUp"
      hoverEffect={true}
      glowEffect={true}
      height="100%"
    >
      <AnimatedElement animationType="scale" delay={0.3}>
        <Icon as={icon} boxSize={12} color="brand.500" mb={4} />
      </AnimatedElement>
      <Heading as="h3" size="md" mb={3}>
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
  const bgGradient = 'linear-gradient(to bottom, #191729, #1F1D36)';
  const [isPlaying, setIsPlaying] = useState(false);
  
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // Simulate audio playback effect
    setTimeout(() => setIsPlaying(false), 3000);
  };
  
  return (
    <Box minHeight="100vh">
      {/* Hero Section */}
      <Box
        bgGradient={bgGradient}
        py={{ base: 16, md: 24 }}
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
        
        <Container maxW="container.xl">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align="center"
            justify="space-between"
            gap={8}
          >
            <AnimatedElement
              animationType="slideRight"
              asBox={true}
              align={{ base: 'center', md: 'flex-start' }}
              spacing={6}
              maxW={{ base: 'full', md: '50%' }}
              textAlign={{ base: 'center', md: 'left' }}
            >
              <Heading
                as="h1"
                size="2xl"
                fontWeight="bold"
                color="white"
                bgGradient="linear(to-r, brand.500, accent.500)"
                bgClip="text"
              >
                EnsAI - AI-Powered Instrument Learning
              </Heading>
              <Text fontSize="xl" color="gray.300">
                Master musical instruments with EnsAI! Your AI-powered personal music assistant featuring real-time pitch detection, intelligent training modules, and interactive learning experience. The future of instrument education powered by artificial intelligence.
              </Text>
              
              <HStack spacing={4} mt={2} mb={6}>
                <AudioDecorations.Wave 
                  isActive={isPlaying}
                  waveCount={5}
                  height="40px"
                  width="120px"
                />
                <Icon 
                  as={isPlaying ? FaMusic : FaPlayCircle} 
                  color={isPlaying ? "accent.500" : "brand.500"} 
                  boxSize={8} 
                  cursor="pointer"
                  onClick={togglePlayback}
                  transition="all 0.3s ease"
                  _hover={{ transform: "scale(1.1)" }}
                />
              </HStack>
              
              {/* Interactive Navigation Cards */}
              <VStack spacing={6} w="full" mt={8}>
                <Text fontSize="lg" color="brand.300" fontWeight="semibold">
                  Explore EnsAI Features
                </Text>
                
                <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6} w="full">
                  {isAuthenticated() ? (
                    <>
                      <InteractiveCard
                        icon={FaMicrophone}
                        title="Start Recording"
                        description="Begin your AI-powered recording session"
                        to="/record"
                        colorScheme="brand"
                        delay={0.1}
                      />
                      <InteractiveCard
                        icon={FaDashboard}
                        title="My Dashboard"
                        description="View your recordings and progress"
                        to="/dashboard"
                        colorScheme="accent"
                        delay={0.3}
                      />
                      <InteractiveCard
                        icon={FaBrain}
                        title="AI Training"
                        description="Personalized instrument training"
                        to="/training"
                        colorScheme="brand"
                        delay={0.5}
                      />
                    </>
                  ) : (
                    <>
                      <InteractiveCard
                        icon={FaMusic}
                        title="Start with AI"
                        description="Join EnsAI and begin your musical journey"
                        to="/auth"
                        colorScheme="brand"
                        delay={0.1}
                      />
                      <InteractiveCard
                        icon={FaHeadphones}
                        title="Learn More"
                        description="Discover AI-powered features"
                        to="#features"
                        colorScheme="accent"
                        delay={0.3}
                      />
                      <InteractiveCard
                        icon={FaBrain}
                        title="AI Training"
                        description="See training capabilities"
                        to="/auth"
                        colorScheme="brand"
                        delay={0.5}
                      />
                    </>
                  )}
                </SimpleGrid>
              </VStack>
            </AnimatedElement>
            
            <AnimatedElement
              animationType="slideLeft"
              delay={0.3}
              maxW={{ base: '80%', md: '45%' }}
              overflow="hidden"
              borderRadius="xl"
              boxShadow="2xl"
              position="relative"
            >
              <Image
                src="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Recording studio"
                fallbackSrc="https://via.placeholder.com/500x300?text=Audio+Recorder"
                transition="all 0.5s ease"
                _hover={{ transform: "scale(1.03)" }}
              />
              
              {/* Decorative equalizer overlay */}
              <Box position="absolute" bottom="10px" left="10px" right="10px" zIndex={2}>
                <AudioDecorations.BarGraph 
                  isActive={true}
                  height="30px"
                  barCount={20}
                  primaryColor="rgba(29, 185, 84, 0.7)"
                  secondaryColor="rgba(233, 30, 99, 0.7)"
              />
            </Box>
              
              {/* Overlay gradient */}
              <Box 
                position="absolute"
                bottom="0"
                left="0"
                right="0"
                height="40%"
                bgGradient="linear(to-t, rgba(25, 23, 41, 0.8), transparent)"
                borderBottomRadius="xl"
                zIndex={1}
              />
            </AnimatedElement>
          </Flex>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Container maxW="container.xl" py={{ base: 12, md: 20 }} id="features">
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
              
              <Box mt={6}>
                <AudioDecorations.Equalizer 
                  isActive={true} 
                  barCount={16} 
                  height="30px"
                  spacing={1.5}
                />
              </Box>
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
      
      {/* CTA Section */}
      <Box
        bgGradient="linear(to-r, brand.600, accent.600)"
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
            
            <AnimatedElement animationType="slideLeft" flex={1} display={{ base: 'none', md: 'flex' }} justifyContent="center">
              <AudioDecorations.Visualizer 
                isActive={true} 
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