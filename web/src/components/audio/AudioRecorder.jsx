import { useState, useEffect, useRef } from 'react';
import { Box, Button, VStack, HStack, Text, useToast, Heading, Progress, Tooltip, IconButton, FormControl, FormLabel, Input, Textarea, keyframes, useColorModeValue } from '@chakra-ui/react';
import { FaMicrophone, FaStop, FaSave, FaTrash, FaPlay, FaPause } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import AudioRecorderUtil from '../../utils/audioRecorder';
import { uploadAudio } from '../../api/api';
import { useNavigate } from 'react-router-dom';

// Define keyframe animations
const pulseKeyframes = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
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

const levelKeyframes = keyframes`
  0% { height: 10%; }
  20% { height: 70%; }
  40% { height: 40%; }
  60% { height: 80%; }
  80% { height: 30%; }
  100% { height: 50%; }
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
  
  const toast = useToast();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const timerRef = useRef(null);
  
  // Color values
  const cardBg = useColorModeValue('white', 'dark.300');
  const borderColor = useColorModeValue('gray.200', 'dark.400');
  const primaryColor = 'brand.500';
  const accentColor = 'accent.500';
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const waveColor1 = useColorModeValue('red.100', 'rgba(229, 62, 62, 0.3)');
  const waveColor2 = useColorModeValue('red.200', 'rgba(229, 62, 62, 0.5)');
  const inputBg = useColorModeValue('white', 'dark.400');
  const inputBorderColor = useColorModeValue('gray.300', 'dark.500');
  const buttonHoverBg = useColorModeValue('gray.100', 'rgba(160, 174, 192, 0.1)');
  
  // Animation properties
  const pulseAnimation = `${pulseKeyframes} 1.5s infinite ease-in-out`;
  const wave1Animation = `${waveKeyframes1} 2s infinite ease-in-out`;
  const wave2Animation = `${waveKeyframes2} 2.5s infinite ease-in-out`;
  
  // Visualizer bar animations with different speeds for natural effect
  const levelAnimations = Array(10).fill().map((_, i) => 
    `${levelKeyframes} ${1 + (i * 0.2)}s infinite ease-in-out ${i * 0.1}s`
  );
  
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
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('ended', handleAudioEnd);
        }
      };
    }
  }, [audioRef.current]);
  
  // Start recording
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
      console.error('Error starting recording:', error);
      toast({
        title: 'Error',
        description: 'Could not access microphone. Please check permissions.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top'
      });
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
  
  // Audio visualizer component
  const AudioVisualizer = () => (
    <HStack h="80px" alignItems="flex-end" justifyContent="center" spacing={1} w="100%" my={6}>
      {Array(20).fill().map((_, i) => (
        <Box
          key={i}
          w="8px"
          h="100%"
          bg={i % 2 === 0 ? primaryColor : accentColor}
          borderRadius="2px"
          overflow="hidden"
        >
          <Box 
            h="100%" 
            w="100%" 
            bg={i % 2 === 0 ? primaryColor : accentColor}
            animation={levelAnimations[i % 10]}
          />
        </Box>
      ))}
    </HStack>
  );
  
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
      let fileExtension = 'mp3'; // Default to mp3 for better compatibility with mobile
      const mimeType = audioBlob.type;
      
      if (mimeType.includes('webm')) {
        fileExtension = 'webm';
      } else if (mimeType.includes('mp3') || mimeType.includes('mpeg')) {
        fileExtension = 'mp3';
      } else if (mimeType.includes('aac')) {
        fileExtension = 'm4a'; // Use m4a for AAC audio (iOS compatible)
      }
      
      console.log(`Uploading audio with MIME type: ${mimeType}, using extension: ${fileExtension}`);
      
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
  
  // Initial state - before recording
  if (recordingStep === 'initial') {
    return (
      <VStack spacing={6} align="center" w="100%">
        <Heading size="lg">Record Audio</Heading>
        <Text>Click the microphone button to start recording</Text>
        
        <Box 
          position="relative" 
          width="150px" 
          height="150px" 
          display="flex" 
          justifyContent="center" 
          alignItems="center"
          mt={4}
        >
        <IconButton
          colorScheme="red"
          aria-label="Start recording"
          size="lg"
          isRound
          icon={<FaMicrophone />}
          height="80px"
          width="80px"
          fontSize="2xl"
          onClick={startRecording}
            zIndex={2}
            _hover={{
              transform: 'scale(1.05)',
              bg: 'red.600'
            }}
            transition="all 0.2s"
        />
        </Box>
      </VStack>
    );
  }
  
  // Recording in progress
  if (recordingStep === 'recording') {
    return (
      <VStack spacing={6} align="center" w="100%">
        <Heading size="lg" color={headingColor}>Recording...</Heading>
        
        <Text fontSize="5xl" fontFamily="mono" fontWeight="bold" color={headingColor}>
            {formatTime(recordingTime)}
          </Text>
          
        {/* Audio Visualizer - animated bars */}
        <AudioVisualizer />
        
        <Box position="relative" width="150px" height="150px" display="flex" justifyContent="center" alignItems="center">
          {/* Wave effect circles */}
          <Box
            position="absolute"
            width="130px"
            height="130px"
            borderRadius="full"
            bg={waveColor1}
            opacity="0.6"
            animation={wave1Animation}
          />
          <Box
            position="absolute"
            width="110px"
            height="110px"
            borderRadius="full"
            bg={waveColor2}
            opacity="0.7"
            animation={wave2Animation}
          />
          
          {/* Stop button */}
          <IconButton
            colorScheme="red"
            aria-label="Stop recording"
            size="lg"
            isRound
            icon={<FaStop />}
            height="80px"
            width="80px"
            fontSize="2xl"
            onClick={stopRecording}
            zIndex={2}
            animation={pulseAnimation}
          />
        </Box>
        
        <Button
          leftIcon={<FaTrash />}
          variant="ghost"
              colorScheme="red"
              onClick={cancelRecording}
          mt={2}
        >
          Cancel
        </Button>
      </VStack>
    );
  }
  
  // Preview recording
  if (recordingStep === 'preview') {
    return (
      <VStack spacing={6} align="center" w="100%">
        <Heading size="lg" color={headingColor}>Preview Recording</Heading>
        
        <Box 
          p={4} 
          borderWidth="1px" 
          borderColor={borderColor}
          borderRadius="lg" 
          width="100%" 
          maxWidth="500px"
          boxShadow="md"
          bg={cardBg}
        >
          <VStack spacing={4} align="center">
            <Text fontSize="lg" fontWeight="500" color={textColor}>
              Length: {formatTime(recordingTime)}
          </Text>
          
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              style={{ display: 'none' }} 
            />
          
            <HStack spacing={4}>
              <IconButton
                aria-label={isPlaying ? "Pause" : "Play"}
                icon={isPlaying ? <FaPause /> : <FaPlay />}
                colorScheme="brand"
                size="lg"
                isRound
                onClick={togglePlayback}
              />
              
              <Progress 
                value={isPlaying ? 50 : 0} 
                width="100%" 
                colorScheme="brand" 
                height="12px" 
                borderRadius="full"
                hasStripe={isPlaying}
                isAnimated={isPlaying}
              />
          </HStack>
          
            <HStack spacing={4} width="100%" justifyContent="center">
            <Button
              leftIcon={<FaTrash />}
              variant="outline"
                colorScheme="gray" 
              onClick={cancelRecording}
                _hover={{ bg: buttonHoverBg }}
            >
              Discard
            </Button>
              
              <Button 
                leftIcon={<FaSave />} 
                colorScheme="brand" 
                onClick={proceedToSubmit}
                _hover={{ bg: 'brand.600' }}
              >
                Save
              </Button>
          </HStack>
          </VStack>
        </Box>
      </VStack>
    );
  }
  
  // Submit form
  if (recordingStep === 'submit') {
    return (
      <VStack spacing={6} align="center" w="100%" as="form" onSubmit={handleSubmit(onSubmit)}>
        <Heading size="lg" color={headingColor}>Save Recording</Heading>
        
        <FormControl isRequired isInvalid={errors.title}>
          <FormLabel color={textColor}>Title</FormLabel>
                <Input
            {...register("title", { required: "Title is required" })} 
                  placeholder="Enter a title for your recording"
            bg={inputBg}
            borderColor={inputBorderColor}
            _hover={{ borderColor: 'brand.500' }}
            _focus={{ borderColor: 'brand.500', boxShadow: 'none' }}
          />
              </FormControl>
              
              <FormControl>
          <FormLabel color={textColor}>Description</FormLabel>
                <Textarea
            {...register("description")} 
            placeholder="Enter an optional description" 
                  rows={4}
            bg={inputBg}
            borderColor={inputBorderColor}
            _hover={{ borderColor: 'brand.500' }}
            _focus={{ borderColor: 'brand.500', boxShadow: 'none' }}
                />
              </FormControl>
              
        <HStack spacing={4} width="100%" justifyContent="center">
                <Button
            leftIcon={<FaTrash />} 
                  variant="outline"
            colorScheme="gray" 
                    onClick={cancelRecording}
            _hover={{ bg: buttonHoverBg }}
                  >
                    Cancel
                  </Button>
                  
                  <Button
            leftIcon={<FaSave />} 
            colorScheme="brand" 
                    type="submit"
                    isLoading={isSubmitting}
            loadingText="Saving..."
            bg="brand.500"
            _hover={{ bg: 'brand.600' }}
                  >
            Submit
                  </Button>
                </HStack>
      </VStack>
    );
  }
};

export default AudioRecorder; 