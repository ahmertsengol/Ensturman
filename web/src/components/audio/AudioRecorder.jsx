import { useState, useEffect, useRef } from 'react';
import { Box, Button, VStack, HStack, Text, useToast, Heading, Progress, Tooltip, IconButton, FormControl, FormLabel, Input, Textarea, keyframes, useColorModeValue, Flex, Center, ScaleFade, Fade, SlideFade, Spinner } from '@chakra-ui/react';
import { FaMicrophone, FaStop, FaSave, FaTrash, FaPlay, FaPause, FaCheck, FaMusic, FaInfoCircle } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import AudioRecorderUtil from '../../utils/audioRecorder';
import { uploadAudio } from '../../api/api';
import { useNavigate } from 'react-router-dom';

// Define keyframe animations
const pulseKeyframes = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const waveKeyframes1 = keyframes`
  0% { transform: scale(0.8); opacity: 0.3; }
  50% { transform: scale(1.2); opacity: 0.6; }
  100% { transform: scale(0.8); opacity: 0.3; }
`;

const waveKeyframes2 = keyframes`
  0% { transform: scale(0.9); opacity: 0.4; }
  50% { transform: scale(1.3); opacity: 0.7; }
  100% { transform: scale(0.9); opacity: 0.4; }
`;

const waveKeyframes3 = keyframes`
  0% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.4); opacity: 0.5; }
  100% { transform: scale(1); opacity: 0.2; }
`;

const floatKeyframes = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0); }
`;

const riseKeyframes = keyframes`
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const celebrateKeyframes = keyframes`
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  50% { transform: scale(1.2) rotate(10deg); opacity: 1; }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`;

const fadeOutKeyframes = keyframes`
  0% { opacity: 1; }
  100% { opacity: 0; }
`;

// Enhanced visualizer with more realistic, dynamic sound wave patterns
const dynamicVisKeyframes = () => keyframes`
  0% { height: ${5 + Math.random() * 20}%; }
  20% { height: ${30 + Math.random() * 50}%; }
  40% { height: ${10 + Math.random() * 30}%; }
  60% { height: ${40 + Math.random() * 60}%; }
  80% { height: ${20 + Math.random() * 40}%; }
  100% { height: ${5 + Math.random() * 25}%; }
`;

const AudioRecorder = () => {
  const [recorder] = useState(new AudioRecorderUtil());
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recordingStep, setRecordingStep] = useState('initial'); // initial, recording, preview, submit
  const [showCelebration, setShowCelebration] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  
  const toast = useToast();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  
  // Color values
  const cardBg = useColorModeValue('gray.700', 'gray.800');
  const borderColor = useColorModeValue('gray.600', 'gray.600');
  const primaryColor = useColorModeValue('brand.100', 'brand.400');
  const accentColor = useColorModeValue('accent.600', 'accent.400');
  const headingColor = useColorModeValue('gray.300', 'white');
  const textColor = useColorModeValue('gray.500', 'gray.100');
  const waveColor1 = useColorModeValue('red.100', 'rgba(229, 62, 62, 0.3)');
  const waveColor2 = useColorModeValue('red.200', 'rgba(229, 62, 62, 0.5)');
  const waveColor3 = useColorModeValue('red.300', 'rgba(229, 62, 62, 0.7)');
  const stepBgActive = useColorModeValue('brand.500', 'brand.400');
  const stepBgInactive = useColorModeValue('gray.500', 'gray.600');
  const stepActiveTextColor = useColorModeValue('white', 'white');
  const stepInactiveTextColor = useColorModeValue('gray.300', 'gray.200');
  const activeStepShadow = useColorModeValue('0 0 0 4px rgba(49, 130, 206, 0.3)', '0 0 0 4px rgba(99, 179, 237, 0.3)');
  const inputBg = useColorModeValue('gray.600', 'gray.700');
  const inputBorderColor = useColorModeValue('gray.500', 'gray.600');
  const ghostButtonColor = useColorModeValue('blue.300', 'blue.400');
  const cancelButtonColor = useColorModeValue('red.300', 'red.400');
  const placeholderColor = useColorModeValue('gray.400', 'gray.400');
  
  // Animation properties
  const pulseAnimation = `${pulseKeyframes} 1.5s infinite ease-in-out`;
  const wave1Animation = `${waveKeyframes1} 2s infinite ease-in-out`;
  const wave2Animation = `${waveKeyframes2} 2.5s infinite ease-in-out`;
  const wave3Animation = `${waveKeyframes3} 3s infinite ease-in-out`;
  const floatAnimation = `${floatKeyframes} 3s infinite ease-in-out`;
  const riseAnimation = `${riseKeyframes} 0.5s ease-out`;
  const celebrateAnimation = `${celebrateKeyframes} 0.8s ease-out`;
  const fadeOutAnimation = `${fadeOutKeyframes} 0.5s ease-out forwards`;
  
  // Generate random animation delays for a more natural effect
  const getRandomDelay = () => {
    return Math.random() * 0.5;
  };
  
  // Visualizer bar animations with different speeds for natural effect
  const generateLevelAnimations = () => {
    return Array(30).fill().map((_, i) => ({
      animation: `${dynamicVisKeyframes()} ${1.5 + Math.random()}s infinite ease-in-out ${getRandomDelay()}s`,
      height: `${10 + Math.random() * 90}%`,
      color: i % 3 === 0 ? primaryColor : i % 3 === 1 ? accentColor : 'purple.500'
    }));
  };
  
  const [visualizerBars] = useState(generateLevelAnimations());
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (recorder.isRecording) recorder.cancelRecording();
    };
  }, [recorder, audioUrl]);
  
  // Handle audio playback end
  useEffect(() => {
    const handleAudioEnd = () => setIsPlaying(false);
    
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', handleAudioEnd);
      audioRef.current.addEventListener('timeupdate', updatePlaybackProgress);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleAudioEnd);
          audioRef.current.removeEventListener('timeupdate', updatePlaybackProgress);
        }
      };
    }
  }, [audioRef.current]);
  
  // Update playback progress
  const updatePlaybackProgress = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setPlaybackProgress(progress);
    }
  };
  
  // Show celebration animation when recording is successfully stopped
  useEffect(() => {
    if (recordingStep === 'preview' && audioBlob) {
      setShowCelebration(true);
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [recordingStep, audioBlob]);
  
  // Apply fade-out animation to celebration
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  useEffect(() => {
    if (showCelebration) {
      // Start fade-out animation shortly before hiding
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 2000);
      
      return () => {
        clearTimeout(fadeTimer);
        setIsFadingOut(false);
      };
    }
  }, [showCelebration]);
  
  // Start recording with enhanced error handling
  const startRecording = async () => {
    try {
      await recorder.startRecording();
      setIsRecording(true);
      setRecordingStep('recording');
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      
      // Get specific error message from enhanced AudioRecorder
      const errorMessage = error.message || 'Could not access microphone. Please check permissions.';
      
      // Show appropriate error based on error type
      if (error.originalError?.name === 'NotAllowedError') {
        toast({
          title: 'Microphone Permission Denied',
          description: 'Please allow microphone access and refresh the page to record audio.',
          status: 'error',
          duration: 8000,
          isClosable: true,
          position: 'top'
        });
      } else if (error.originalError?.name === 'NotFoundError') {
        toast({
          title: 'No Microphone Found',
          description: 'Please connect a microphone and try again.',
          status: 'error',
          duration: 6000,
          isClosable: true,
          position: 'top'
        });
      } else if (error.originalError?.name === 'NotReadableError') {
        toast({
          title: 'Microphone In Use',
          description: 'Your microphone is being used by another application. Please close other apps and try again.',
          status: 'error',
          duration: 6000,
          isClosable: true,
          position: 'top'
        });
      } else if (error.message.includes('not supported')) {
        toast({
          title: 'Browser Not Supported',
          description: 'Audio recording is not supported in this browser. Please try Chrome, Firefox, or Safari.',
          status: 'error',
          duration: 8000,
          isClosable: true,
          position: 'top'
        });
      } else {
        toast({
          title: 'Recording Error',
          description: errorMessage,
          status: 'error',
          duration: 6000,
          isClosable: true,
          position: 'top'
        });
      }
    }
  };
  
  // Stop recording
  const stopRecording = async () => {
    try {
      const blob = await recorder.stopRecording();
      setIsRecording(false);
      setAudioBlob(blob);
      
      // Create object URL for playback
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setRecordingStep('preview');
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      
      toast({
        title: 'Error',
        description: 'There was a problem with the recording.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
    }
  };
  
  // Play recorded audio
  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  // Cancel recording
  const cancelRecording = () => {
    if (isRecording) {
      recorder.cancelRecording();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    setAudioBlob(null);
    setRecordingTime(0);
    setRecordingStep('initial');
    setPlaybackProgress(0);
  };
  
  // Move to submission step
  const proceedToSubmit = () => {
    setRecordingStep('submit');
  };
  
  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Audio visualizer component with enhanced animated bars
  const AudioVisualizer = () => (
    <HStack h="120px" alignItems="flex-end" justifyContent="center" spacing={1} w="100%" my={6}>
      {visualizerBars.map((bar, i) => (
        <Box
          key={i}
          w="6px"
          h="100%"
          opacity={0.8}
          borderRadius="2px"
          overflow="hidden"
        >
          <Box 
            h={bar.height}
            w="100%" 
            bg={bar.color}
            animation={bar.animation}
            borderRadius="2px"
            transition="height 0.1s ease-in-out"
          />
        </Box>
      ))}
    </HStack>
  );
  
  // Steps indicator component
  const RecordingSteps = () => {
    const steps = [
      { id: 'initial', label: 'Start', icon: <FaMicrophone /> },
      { id: 'recording', label: 'Record', icon: <FaMusic /> },
      { id: 'preview', label: 'Review', icon: <FaPlay /> },
      { id: 'submit', label: 'Save', icon: <FaSave /> }
    ];
    
    return (
      <Flex w="100%" justify="space-between" mb={8} px={8}>
        {steps.map((step, i) => {
          const isActive = steps.findIndex(s => s.id === recordingStep) >= i;
          const isCurrent = step.id === recordingStep;
          
          return (
            <VStack key={step.id} spacing={2}>
              <Box
                w="50px"
                h="50px"
                borderRadius="full"
                bg={isActive ? stepBgActive : stepBgInactive}
                color={isActive ? stepActiveTextColor : stepInactiveTextColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="xl"
                boxShadow={isCurrent ? activeStepShadow : "none"}
                transition="all 0.3s ease"
                transform={isCurrent ? "scale(1.1)" : "scale(1)"}
                borderWidth={isActive ? "0px" : "1px"}
                borderColor="gray.300"
              >
                {step.icon}
              </Box>
              <Text 
                fontWeight={isCurrent ? "bold" : "semibold"} 
                fontSize="sm"
                color={isCurrent ? headingColor : stepInactiveTextColor}
                textShadow={isCurrent ? "0 0 1px rgba(0,0,0,0.2)" : "none"}
                bg={isCurrent ? "rgba(255,255,255,0.6)" : "transparent"}
                px={isCurrent ? 2 : 0}
                borderRadius={isCurrent ? "md" : "none"}
              >
                {step.label}
              </Text>
              
              {/* Line connector (except for the last item) */}
              {i < steps.length - 1 && (
                <Box
                  position="absolute"
                  h="3px"
                  bg={isActive && steps.findIndex(s => s.id === recordingStep) > i ? stepBgActive : stepBgInactive}
                  w="calc(25% - 60px)"
                  left={`calc(${i * 25}% + 55px)`}
                  top="25px"
                  transition="background 0.3s ease"
                  borderRadius="full"
                />
              )}
            </VStack>
          );
        })}
      </Flex>
    );
  };
  
  // Submit recording with metadata
  const onSubmit = async (data) => {
    if (!audioBlob) {
      toast({
        title: 'Error',
        description: 'No recording available.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Determine best file extension based on the MIME type
      // This ensures compatibility with mobile app files
      let fileExtension = 'm4a'; // Default to m4a for better compatibility with mobile
      const mimeType = audioBlob.type;
      
      console.log('🎯 File Extension Detection:');
      console.log(`📋 audioBlob.type: ${mimeType}`);
      console.log(`📋 Default extension: ${fileExtension}`);
      
      // FORCE M4A: Always use .m4a extension regardless of browser format
      // This ensures consistency across platforms and better mobile compatibility
      fileExtension = 'm4a';
      console.log('🔧 FORCING .m4a extension for cross-platform compatibility');
      
      // Keep original logic for logging purposes only
      if (mimeType.includes('webm')) {
        console.log('📁 Original format: WebM (but using .m4a extension)');
      } else if (mimeType.includes('mp3') || mimeType.includes('mpeg')) {
        console.log('📁 Original format: MP3/MPEG (but using .m4a extension)');
      } else if (mimeType.includes('aac') || mimeType.includes('mp4')) {
        console.log('📁 Original format: AAC/MP4 (using .m4a extension)');
      } else {
        console.log('📁 Original format: Unknown (using .m4a extension)');
      }
      
      console.log(`🎵 Final file extension: ${fileExtension}`);
      console.log(`📝 Final filename: recording.${fileExtension}`);
      console.log(`🔧 Uploading audio with MIME type: ${mimeType}, using extension: ${fileExtension}`);
      
      // Create form data
      const formData = new FormData();
      formData.append('audio', audioBlob, `recording.${fileExtension}`);
      formData.append('title', data.title);
      formData.append('description', data.description || '');
      
      // Upload to server
      await uploadAudio(formData);
      
      toast({
        title: 'Success',
        description: 'Audio recording uploaded successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top'
      });
      
      // Reset and navigate to dashboard
      reset();
      cancelRecording();
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.response?.data?.error || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <VStack spacing={6} align="center" w="100%" position="relative">
      {/* Header */}
      <SlideFade in={true} offsetY="-20px">
        <Heading size="lg" mb={4} textAlign="center" color={headingColor} fontWeight="bold">
                              
        </Heading>
        <Text textAlign="center" mb={6} color={textColor} fontSize="md" fontWeight="medium">
                                                   
        </Text>
      </SlideFade>
      
      {/* Steps indicator */}
      <RecordingSteps />
      
      {/* Celebration animation */}
      {showCelebration && (
        <Box
          position="absolute"
          top="30%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={10}
          pointerEvents="auto"
          cursor="pointer"
          onClick={() => setShowCelebration(false)}
          animation={isFadingOut ? fadeOutAnimation : undefined}
        >
          <Center
            position="relative"
            w="200px"
            h="200px"
            animation={celebrateAnimation}
            flexDirection="column"
          >
            <Box
              position="absolute"
              borderRadius="full"
              bg="green.500"
              w="150px"
              h="150px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 0 20px rgba(72, 187, 120, 0.6)"
            >
              <FaCheck color="white" size="60px" />
            </Box>
            
          </Center>
        </Box>
      )}
  
      {/* Content based on current step */}
      <Box w="100%" position="relative" bg="transparent">
        {/* Initial state - before recording */}
        {recordingStep === 'initial' && (
          <ScaleFade initialScale={0.9} in={recordingStep === 'initial'}>
            <VStack spacing={6} align="center" w="100%">
              <Text fontSize="lg" mb={2} color={textColor} fontWeight="medium" textShadow="0 0 1px rgba(0,0,0,0.1)">
                Click the microphone button to start recording
              </Text>
              
              <Box 
                position="relative" 
                width="200px" 
                height="200px" 
                display="flex" 
                justifyContent="center" 
                alignItems="center"
                mt={4}
                animation={floatAnimation}
              >
                {/* Decorative waves */}
                <Box
                  position="absolute"
                  width="180px"
                  height="180px"
                  borderRadius="full"
                  bg={waveColor1}
                  opacity="0.4"
                />
                <Box
                  position="absolute"
                  width="150px"
                  height="150px"
                  borderRadius="full"
                  bg={waveColor2}
                  opacity="0.5"
                />
                
                <IconButton
                  colorScheme="red"
                  aria-label="Start recording"
                  size="lg"
                  isRound
                  icon={<FaMicrophone />}
                  height="100px"
                  width="100px"
                  fontSize="3xl"
                  onClick={startRecording}
                  zIndex={2}
                  boxShadow="0 0 15px rgba(229, 62, 62, 0.5)"
                  _hover={{
                    transform: 'scale(1.05)',
                    bg: 'red.600',
                    boxShadow: '0 0 20px rgba(229, 62, 62, 0.7)'
                  }}
                  transition="all 0.3s ease"
                />
              </Box>
              
              <Tooltip label="Make sure you're in a quiet environment for best results" placement="bottom">
                <Button
                  leftIcon={<FaInfoCircle />}
                  variant="ghost"
                  colorScheme="blue"
                  size="sm"
                  mt={4}
                  color={ghostButtonColor}
                >
                  Recording Tips
                </Button>
              </Tooltip>
            </VStack>
          </ScaleFade>
        )}
        
        {/* Recording in progress */}
        {recordingStep === 'recording' && (
          <SlideFade in={recordingStep === 'recording'} offsetY="20px">
            <VStack spacing={6} align="center" w="100%">
              <Heading size="lg" color={headingColor} fontWeight="bold">Recording in Progress</Heading>
              
              <Text fontSize="6xl" fontFamily="mono" fontWeight="bold" color="red.500">
                {formatTime(recordingTime)}
              </Text>
              
              {/* Enhanced Audio Visualizer */}
              <AudioVisualizer />
              
              <Box position="relative" width="180px" height="180px" display="flex" justifyContent="center" alignItems="center">
                {/* Multiple wave effect circles */}
                <Box
                  position="absolute"
                  width="170px"
                  height="170px"
                  borderRadius="full"
                  bg={waveColor1}
                  opacity="0.5"
                  animation={wave1Animation}
                />
                <Box
                  position="absolute"
                  width="140px"
                  height="140px"
                  borderRadius="full"
                  bg={waveColor2}
                  opacity="0.6"
                  animation={wave2Animation}
                />
                <Box
                  position="absolute"
                  width="110px"
                  height="110px"
                  borderRadius="full"
                  bg={waveColor3}
                  opacity="0.7"
                  animation={wave3Animation}
                />
                
                {/* Stop button */}
                <IconButton
                  colorScheme="red"
                  aria-label="Stop recording"
                  size="lg"
                  isRound
                  icon={<FaStop />}
                  height="90px"
                  width="90px"
                  fontSize="2xl"
                  onClick={stopRecording}
                  zIndex={2}
                  animation={pulseAnimation}
                  boxShadow="0 0 20px rgba(229, 62, 62, 0.6)"
                  _hover={{
                    transform: 'scale(1.05)',
                    bg: 'red.600'
                  }}
                  transition="all 0.2s"
                />
              </Box>
              
              <Button
                leftIcon={<FaTrash />}
                variant="ghost"
                colorScheme="red"
                onClick={cancelRecording}
                mt={4}
                _hover={{
                  bg: 'rgba(229, 62, 62, 0.1)'
                }}
                color={cancelButtonColor}
              >
                Cancel Recording
              </Button>
            </VStack>
          </SlideFade>
        )}
        
        {/* Preview recording */}
        {recordingStep === 'preview' && (
          <ScaleFade initialScale={0.9} in={recordingStep === 'preview'}>
            <VStack spacing={6} align="center" w="100%">
              <Heading size="lg" color={headingColor} fontWeight="bold">Preview Recording</Heading>
              
              <Box 
                p={6} 
                borderWidth="1px" 
                borderColor={borderColor}
                borderRadius="lg" 
                width="100%" 
                maxWidth="500px"
                boxShadow="lg"
                bg={cardBg}
                color={textColor}
                position="relative"
                overflow="hidden"
                animation={riseAnimation}
              >
                {/* Decorative background wave */}
                <Box
                  position="absolute"
                  top="-20px"
                  right="-20px"
                  width="120px"
                  height="120px"
                  borderRadius="full"
                  bg={waveColor1}
                  opacity="0.2"
                  zIndex={0}
                />
                
                <VStack spacing={5} align="center" position="relative" zIndex={1}>
                  <HStack spacing={3} align="center">
                    <FaMusic color={primaryColor} />
                    <Text fontSize="lg" fontWeight="500" color={headingColor}>
                      Length: {formatTime(recordingTime)}
                    </Text>
                  </HStack>
                  
                  <audio 
                    ref={audioRef} 
                    src={audioUrl} 
                    style={{ display: 'none' }} 
                  />
                  
                  <Box w="100%">
                    <HStack spacing={4} mb={3} align="center">
                      <IconButton
                        aria-label={isPlaying ? "Pause" : "Play"}
                        icon={isPlaying ? <FaPause /> : <FaPlay />}
                        colorScheme="brand"
                        size="lg"
                        isRound
                        onClick={togglePlayback}
                        _hover={{
                          transform: 'scale(1.05)'
                        }}
                        transition="all 0.2s"
                      />
                      
                      <Box w="100%">
                        <Progress 
                          value={playbackProgress} 
                          width="100%" 
                          colorScheme="brand" 
                          height="12px" 
                          borderRadius="full"
                          hasStripe={isPlaying}
                          isAnimated={isPlaying}
                          bg={stepBgInactive}
                        />
                        
                        <Flex justify="space-between" w="100%" mt={1}>
                          <Text fontSize="xs" color={headingColor} fontWeight="medium">0:00</Text>
                          <Text fontSize="xs" color={headingColor} fontWeight="medium">{formatTime(recordingTime)}</Text>
                        </Flex>
                      </Box>
                    </HStack>
                  </Box>
                  
                  <HStack spacing={4} width="100%" justifyContent="center" mt={2}>
                    <Button
                      leftIcon={<FaTrash />}
                      variant="outline"
                      colorScheme="red" 
                      onClick={cancelRecording}
                      _hover={{ bg: 'rgba(245, 101, 101, 0.2)' }}
                      size="md"
                      color="red.300"
                      borderColor="red.500"
                    >
                      Discard
                    </Button>
                    
                    <Button 
                      leftIcon={<FaSave />} 
                      colorScheme="green" 
                      onClick={proceedToSubmit}
                      _hover={{ bg: 'green.600' }}
                      size="md"
                      color="white"
                    >
                      Continue
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </ScaleFade>
        )}
        
        {/* Submit form */}
        {recordingStep === 'submit' && (
          <SlideFade in={recordingStep === 'submit'} offsetY="20px">
            <VStack spacing={8} align="center" w="100%" as="form" onSubmit={handleSubmit(onSubmit)}>
              <Heading size="lg" color={headingColor}>Save Your Recording</Heading>
              
              <Box 
                p={6} 
                borderWidth="1px" 
                borderColor={borderColor}
                borderRadius="lg" 
                width="100%" 
                maxWidth="500px"
                boxShadow="lg"
                bg={cardBg}
              >
                <VStack spacing={5}>
                  <FormControl isRequired isInvalid={errors.title}>
                    <FormLabel color={headingColor} fontWeight="semibold">Title</FormLabel>
                    <Input
                      {...register("title", { required: "Title is required" })} 
                      placeholder="Enter a title for your recording"
                      bg={inputBg}
                      color={headingColor}
                      borderColor={inputBorderColor}
                      _hover={{ borderColor: 'brand.500' }}
                      _focus={{ borderColor: 'brand.500', boxShadow: 'none' }}
                      _placeholder={{ color: placeholderColor }}
                      size="md"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel color={headingColor} fontWeight="semibold">Description</FormLabel>
                    <Textarea
                      {...register("description")} 
                      placeholder="Enter an optional description" 
                      rows={4}
                      bg={inputBg}
                      color={headingColor}
                      borderColor={inputBorderColor}
                      _hover={{ borderColor: 'brand.500' }}
                      _focus={{ borderColor: 'brand.500', boxShadow: 'none' }}
                      _placeholder={{ color: placeholderColor }}
                    />
                  </FormControl>
                  
                  <HStack spacing={4} width="100%" justifyContent="center" mt={4}>
                    <Button
                      leftIcon={<FaTrash />} 
                      variant="outline"
                      colorScheme="red" 
                      onClick={cancelRecording}
                      _hover={{ bg: 'rgba(245, 101, 101, 0.2)' }}
                      color="red.300"
                      borderColor="red.500"
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      leftIcon={isSubmitting ? undefined : <FaSave />} 
                      colorScheme="green" 
                      type="submit"
                      isLoading={isSubmitting}
                      loadingText="Saving..."
                      spinner={<Spinner size="sm" />}
                      _hover={{ bg: 'green.600' }}
                      color="white"
                    >
                      Save Recording
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </SlideFade>
        )}
      </Box>
    </VStack>
  );
};

export default AudioRecorder; 