import { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Box, 
  VStack, 
  HStack, 
  Heading, 
  Text, 
  Button, 
  Badge, 
  useToast, 
  Progress,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  keyframes,
  Tooltip,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  List,
  ListItem,
  ListIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react';
import { FaMicrophone, FaStop, FaPlay, FaMusic, FaCheck, FaTimes, FaChartLine, FaVolumeUp, FaQuestion, FaInfoCircle, FaLightbulb, FaHeadphones } from 'react-icons/fa';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PitchDetector from '../utils/pitchDetector';
import { getTrainingModules, getTrainingModule, saveTrainingSession, getUserProgress } from '../api/api';
import AnimatedElement from '../components/ui/AnimatedElement';

// Animation for the note indicator
const pulseKeyframe = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const _waveMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const TrainingPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [detector] = useState(new PitchDetector());
  const [isListening, setIsListening] = useState(false);
  const [currentNote, setCurrentNote] = useState({ note: 'N/A', octave: -1, frequency: 0 });
  const [trainingModules, setTrainingModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionData, setSessionData] = useState({
    notes_played: [],
    accuracy: 0,
    duration: 0,
    completed: false
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userProgress, setUserProgress] = useState(null);
  const [trainingState, setTrainingState] = useState('idle'); // idle, ready, calibration, active, complete
  const [microphoneStatus, setMicrophoneStatus] = useState('standby'); // standby, testing, ready, error
  const [calibrationNote, setCalibrationNote] = useState(null);
  const [calibrationComplete, setCalibrationComplete] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState('general');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [visualHistory, setVisualHistory] = useState([]);
  const [practiceMode, setPracticeMode] = useState('standard'); // standard, freeplay, challenge
  
  // References for timers
  const sessionTimerRef = useRef(null);
  const progressTimerRef = useRef(null);
  const noteTimeoutRef = useRef(null);
  const calibrationTimerRef = useRef(null);
  
  // References for note history
  const notesCorrectRef = useRef(0);
  const notesTotalRef = useRef(0);
  
  const toast = useToast();
  
  // Theme Colors - Updated to match main theme
  const primaryColor = 'brand.500'; // Spotify green
  const errorColor = 'red.500';
  const successColor = 'green.500';
  const cardBg = 'dark.300';
  const noteBg = 'dark.400';
  const noteActiveBg = 'rgba(29, 185, 84, 0.1)'; // Brand color with low opacity
  const bgGradient = 'linear-gradient(to bottom, dark.500, dark.400)';
  const pulseAnimation = `${pulseKeyframe} 1.5s infinite ease-in-out`;
  
  // Load training modules
  useEffect(() => {
    const loadModules = async () => {
      try {
        const response = await getTrainingModules();
        setTrainingModules(response.data);
        
        // If id is provided in the URL, load that module
        if (id) {
          const moduleResponse = await getTrainingModule(id);
          setSelectedModule(moduleResponse.data);
          setTrainingState('ready');
        }
      } catch (error) {
        console.error('Error loading training modules:', error);
        toast({
          title: 'Error',
          description: 'Could not load training modules',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    
    const loadUserProgress = async () => {
      try {
        const response = await getUserProgress();
        setUserProgress(response.data);
      } catch (error) {
        console.error('Error loading user progress:', error);
      }
    };
    
    if (isAuthenticated()) {
      loadModules();
      loadUserProgress();
    }
  }, [id, isAuthenticated, toast]);
  
  // Set instrument type for the detector
  useEffect(() => {
    if (detector) {
      detector.setInstrumentType(selectedInstrument);
    }
  }, [selectedInstrument, detector]);
  
  // Handle note detection
  const handleNoteData = (noteData) => {
    setCurrentNote(noteData);
    
    // Handle calibration phase
    if (trainingState === 'calibration') {
      if (noteData.confidence > 0.7 && noteData.frequency > 0) {
        setCalibrationNote(noteData);
      }
      return;
    }
    
    // Skip if not in active training
    if (trainingState !== 'active' || !selectedModule) return;
    
    // Get the expected note from the training module
    const expectedNote = selectedModule.notes[currentIndex];
    
    if (!expectedNote) return;
    
    // Check if the detected note matches the expected note
    const expectedNoteName = expectedNote.note.substring(0, expectedNote.note.length - 1);
    const expectedOctave = parseInt(expectedNote.note.slice(-1));
    
    const isCorrect = noteData.note === expectedNoteName &&
                      parseInt(noteData.octave) === expectedOctave;
    
    // Only consider notes with good confidence
    if (noteData.confidence > 0.7) {
      // Add to notes played for this session
      const noteRecord = {
        timestamp: Date.now(),
        expected: expectedNote.note,
        played: `${noteData.note}${noteData.octave}`,
        correct: isCorrect,
        frequency: noteData.frequency,
        cents: noteData.cents,
        confidence: noteData.confidence,
        idealFrequency: noteData.idealFrequency
      };
      
      setSessionData(prev => ({
        ...prev,
        notes_played: [...prev.notes_played, noteRecord]
      }));
      
      // Update visual history (keep last 10 notes)
      setVisualHistory(prev => {
        const newHistory = [...prev, { ...noteRecord }];
        return newHistory.slice(-10);
      });
      
      // Update accuracy counters
      if (isCorrect) {
        notesCorrectRef.current += 1;
        
        // Update streak counter
        setCurrentStreak(prev => {
          const newStreak = prev + 1;
          // Update best streak if current streak is better
          if (newStreak > bestStreak) {
            setBestStreak(newStreak);
          }
          return newStreak;
        });
        
        // Clear any previous timeout
        if (noteTimeoutRef.current) {
          clearTimeout(noteTimeoutRef.current);
        }
        
        // Move to next note after a short delay
        noteTimeoutRef.current = setTimeout(() => {
          if (currentIndex < selectedModule.notes.length - 1) {
            setCurrentIndex(prevIndex => prevIndex + 1);
          } else {
            // Training complete
            completeTraining();
          }
        }, 1000);
      } else {
        // Reset streak on incorrect note
        setCurrentStreak(0);
      }
      
      notesTotalRef.current += 1;
      
      // Update accuracy percentage
      const accuracy = (notesCorrectRef.current / notesTotalRef.current) * 100;
      setSessionData(prev => ({
        ...prev,
        accuracy: Math.round(accuracy)
      }));
    }
  };
  
  // Start microphone calibration
  const startCalibration = async () => {
    try {
      setMicrophoneStatus('testing');
      setTrainingState('calibration');
      
      // Start pitch detector
      const success = await detector.start(handleNoteData);
      
      if (success) {
        setIsListening(true);
        setMicrophoneStatus('ready');
        
        // Set a timer to auto-complete calibration if a good note is detected
        calibrationTimerRef.current = setTimeout(() => {
          if (calibrationNote) {
            setCalibrationComplete(true);
          }
        }, 5000);
        
        toast({
          title: 'Microphone Ready',
          description: 'Play any note to calibrate',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        setMicrophoneStatus('error');
        setTrainingState('ready');
        
        toast({
          title: 'Microphone Error',
          description: 'Could not access microphone. Please check your browser permissions.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setMicrophoneStatus('error');
      setTrainingState('ready');
      
      toast({
        title: 'Microphone Error',
        description: error.message || 'Could not access microphone',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Complete calibration and start training
  const completeCalibration = () => {
    // Reset calibration timer
    if (calibrationTimerRef.current) {
      clearTimeout(calibrationTimerRef.current);
      calibrationTimerRef.current = null;
    }
    
    // If we didn't detect any notes during calibration, show warning
    if (!calibrationNote) {
      toast({
        title: 'No Sound Detected',
        description: 'We couldn\'t detect any notes during calibration. Please make sure your instrument is audible.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
    
    setCalibrationComplete(true);
    setTrainingState('ready');
    
    // Stop detector after calibration
    detector.stop();
    setIsListening(false);
  };
  
  // Start training
  const startTraining = async () => {
    if (!selectedModule) return;
    
    try {
      // If we haven't calibrated yet and the browser is compatible, show calibration step
      if (microphoneStatus === 'standby' && detector.isCompatible) {
        startCalibration();
        return;
      }
      
      // Reset state
      setCurrentIndex(0);
      setElapsedTime(0);
      setProgress(0);
      notesCorrectRef.current = 0;
      notesTotalRef.current = 0;
      setCurrentStreak(0);
      setBestStreak(0);
      setVisualHistory([]);
      setSessionData({
        notes_played: [],
        accuracy: 0,
        duration: 0,
        completed: false
      });
      
      // Start pitch detector
      const success = await detector.start(handleNoteData);
      
      if (success) {
        setIsListening(true);
        setTrainingState('active');
        
        // Start session timer
        sessionTimerRef.current = setInterval(() => {
          setElapsedTime(prev => prev + 1);
        }, 1000);
        
        // Start progress timer
        progressTimerRef.current = setInterval(() => {
          setProgress(() => {
            const newProgress = (currentIndex / selectedModule.notes.length) * 100;
            return newProgress;
          });
        }, 1000);
        
        toast({
          title: 'Training Started',
          description: 'Play the notes shown on the screen',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Could not access microphone',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error starting training:', error);
      toast({
        title: 'Error',
        description: 'Could not start training',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Stop training
  const stopTraining = () => {
    // Stop detector
    detector.stop();
    setIsListening(false);
    
    // Clear timers
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    
    if (noteTimeoutRef.current) {
      clearTimeout(noteTimeoutRef.current);
      noteTimeoutRef.current = null;
    }
    
    setTrainingState('ready');
    
    // Update duration
    setSessionData(prev => ({
      ...prev,
      duration: elapsedTime
    }));
  };
  
  // Complete training
  const completeTraining = async () => {
    stopTraining();
    
    setTrainingState('complete');
    
    // Mark as completed
    const completeSessionData = {
      ...sessionData,
      completed: true,
      duration: elapsedTime,
      module_id: selectedModule.id,
      instrument_type: selectedInstrument,
      practice_mode: practiceMode,
      best_streak: bestStreak
    };
    
    setSessionData(completeSessionData);
    
    // Save session to database
    try {
      await saveTrainingSession(completeSessionData);
      
      // Reload user progress
      const progressResponse = await getUserProgress();
      setUserProgress(progressResponse.data);
      
      toast({
        title: 'Training Complete',
        description: `Your accuracy was ${completeSessionData.accuracy}% with a best streak of ${bestStreak}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving training session:', error);
      toast({
        title: 'Error',
        description: 'Could not save training session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle module selection
  const handleModuleSelect = async (moduleId) => {
    if (!moduleId) return;
    
    try {
      const response = await getTrainingModule(moduleId);
      setSelectedModule(response.data);
      setTrainingState('ready');
    } catch (error) {
      console.error('Error loading training module:', error);
      toast({
        title: 'Error',
        description: 'Could not load training module',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Return to module selection
  const resetTraining = () => {
    setSelectedModule(null);
    setTrainingState('idle');
  };
  
  // Handle instrument selection
  const handleInstrumentChange = (event) => {
    setSelectedInstrument(event.target.value);
  };
  
  // Handle practice mode change
  const handlePracticeModeChange = (event) => {
    setPracticeMode(event.target.value);
  };
  
  // Render current note display
  const renderNoteDisplay = () => {
    if (!selectedModule || trainingState !== 'active') return null;
    
    const expectedNote = selectedModule.notes[currentIndex];
    const expectedNoteName = expectedNote.note.substring(0, expectedNote.note.length - 1);
    const expectedOctave = parseInt(expectedNote.note.slice(-1));
    
    const isCorrect = currentNote.note === expectedNoteName && 
                      parseInt(currentNote.octave) === expectedOctave;
    
    // Calculate cents from target for tuning meter
    const centsValue = currentNote.cents || 0;
    const inTune = Math.abs(centsValue) < 15;
    const sharpOrFlat = centsValue > 0 ? 'Sharp' : centsValue < 0 ? 'Flat' : 'In tune';
    const tuningColor = inTune ? 'brand.500' : Math.abs(centsValue) < 30 ? 'yellow.400' : 'red.500';
    
    return (
      <Box
        position="relative"
        pt={8}
        pb={8}
        borderRadius="xl"
        overflow="hidden"
        bgGradient={bgGradient}
      >
        {/* Decorative background elements */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="radial-gradient(circle at 30% 30%, #1db95420, transparent 60%)"
          opacity="0.6"
          pointerEvents="none"
          zIndex={0}
        />
        
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height="1px"
          bg="linear-gradient(to right, transparent, #1db95440, transparent)"
          opacity="0.8"
          pointerEvents="none"
        />
        
        <Box position="relative" zIndex={1}>
          <HStack spacing={6} justify="center" mb={8}>
            <VStack 
              spacing={1}
              bg={noteActiveBg}
              p={6}
              borderRadius="lg"
              shadow="lg"
              minW="200px"
              align="center"
              border="1px solid"
              borderColor="brand.500"
              borderTopWidth="3px"
            >
              <Text fontSize="sm" fontWeight="medium" color="gray.200">Expected Note</Text>
              <Text 
                fontSize="4xl" 
                fontWeight="bold" 
                color={primaryColor}
              >
                {expectedNote.note}
              </Text>
              {currentNote.idealFrequency && (
                <Text fontSize="xs" opacity={0.7} color="gray.300">
                  {currentNote.idealFrequency} Hz
                </Text>
              )}
            </VStack>
            
            <Box textAlign="center" py={2} color="gray.300">
              <FaMusic size={24} />
            </Box>
            
            <VStack 
              spacing={1}
              bg={noteBg}
              p={6}
              borderRadius="lg"
              shadow="lg"
              minW="200px"
              align="center"
              border="1px solid"
              borderColor={isCorrect ? "brand.500" : "gray.600"}
              animation={isListening ? pulseAnimation : undefined}
              transition="all 0.3s ease"
            >
              <Text fontSize="sm" fontWeight="medium" color="gray.200">You're Playing</Text>
              <HStack align="center" spacing={2}>
                <Text 
                  fontSize="4xl" 
                  fontWeight="bold" 
                  color={isCorrect ? primaryColor : errorColor}
                >
                  {currentNote.note}{currentNote.octave >= 0 ? currentNote.octave : ''}
                </Text>
                {isCorrect ? (
                  <Box color={primaryColor}>
                    <FaCheck />
                  </Box>
                ) : (
                  <Box color={errorColor}>
                    <FaTimes />
                  </Box>
                )}
              </HStack>
              <Text fontSize="xs" opacity={0.7} color="gray.300">
                {currentNote.frequency ? currentNote.frequency.toFixed(1) : 0} Hz
              </Text>
              
              {currentNote.confidence > 0 && (
                <Badge 
                  colorScheme={currentNote.confidence > 0.8 ? 'green' : currentNote.confidence > 0.6 ? 'yellow' : 'red'}
                  mt={1}
                  variant="subtle"
                  px={2}
                >
                  Confidence: {Math.round(currentNote.confidence * 100)}%
                </Badge>
              )}
            </VStack>
          </HStack>
          
          {/* Tuning meter */}
          {currentNote.frequency > 0 && (
            <VStack spacing={1} mb={6} position="relative" w="100%" maxW="400px" mx="auto">
              <Text fontSize="sm" fontWeight="medium" color="gray.200">Pitch Accuracy</Text>
              <Box 
                w="100%" 
                position="relative" 
                h="60px" 
                overflow="hidden" 
                borderRadius="md"
                bg="dark.400"
                border="1px solid"
                borderColor="dark.300"
              >
                {/* Center line */}
                <Box 
                  position="absolute" 
                  left="50%" 
                  top="0"
                  h="100%" 
                  w="2px" 
                  bg={primaryColor} 
                  transform="translateX(-50%)"
                  zIndex={1}
                  opacity={0.8}
                />
                
                {/* Pitch guides */}
                <Flex 
                  position="absolute" 
                  w="100%" 
                  h="100%" 
                  justify="space-between" 
                  px={4} 
                  pointerEvents="none"
                >
                  {[-40, -30, -20, -10, 0, 10, 20, 30, 40].map(value => (
                    <Box 
                      key={value} 
                      position="absolute" 
                      left={`${((value + 50) / 100) * 100}%`}
                      h="10px" 
                      w="1px" 
                      top="25px" 
                      bg={value === 0 ? primaryColor : "gray.500"}
                      opacity={value === 0 ? 1 : 0.5}
                    />
                  ))}
                </Flex>
                
                {/* Fixed scale slider track */}
                <Box
                  position="absolute"
                  top="50%"
                  left="10%"
                  right="10%"
                  h="12px"
                  bg="dark.300"
                  transform="translateY(-50%)"
                  borderRadius="full"
                />
                
                {/* Dynamic indicator */}
                <Box
                  position="absolute"
                  top="50%"
                  left={`${Math.max(10, Math.min(90, ((currentNote.cents || 0) + 50) / 100 * 80 + 10))}%`}
                  w="20px"
                  h="20px"
                  bg={inTune ? 'brand.500' : Math.abs(currentNote.cents || 0) < 30 ? 'yellow.400' : 'red.500'}
                  borderRadius="full"
                  transform="translate(-50%, -50%)"
                  transition="left 0.2s ease-out, background-color 0.3s ease"
                  boxShadow={`0 0 10px ${inTune ? 'var(--chakra-colors-brand-500)' : Math.abs(currentNote.cents || 0) < 30 ? 'var(--chakra-colors-yellow-400)' : 'var(--chakra-colors-red-500)'}`}
                  zIndex={2}
                />
                
                <HStack 
                  justify="space-between" 
                  w="100%" 
                  px={4} 
                  position="absolute" 
                  bottom="5px" 
                  fontSize="xs" 
                  color="gray.300"
                  pointerEvents="none"
                >
                  <Text>♭ Flat</Text>
                  <Text fontWeight={inTune ? "bold" : "normal"} color={inTune ? primaryColor : undefined}>
                    In Tune
                  </Text>
                  <Text>Sharp ♯</Text>
                </HStack>
              </Box>
              
              <Text 
                textAlign="center" 
                fontSize="sm" 
                fontWeight="medium" 
                color={tuningColor}
                position="relative"
                marginTop="2px !important"
              >
                {Math.abs(centsValue)} cents {sharpOrFlat}
              </Text>
            </VStack>
          )}
          
          {/* Frequency visualization */}
          {currentNote.frequency > 0 && (
            <Box mb={6} w="100%" maxW="400px" mx="auto">
              <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.200" textAlign="center">Frequency Visualization</Text>
              <Box 
                position="relative"
                bg="dark.400" 
                borderRadius="md"
                h="50px"
                overflow="hidden"
                border="1px solid"
                borderColor="dark.300"
              >
                <Flex 
                  justify="center" 
                  align="flex-end" 
                  h="100%" 
                  position="absolute"
                  bottom="0"
                  left="0"
                  right="0"
                  py={2}
                  px={4}
                >
                  {Array.from({ length: 16 }).map((_, i) => {
                    const isActive = currentNote.confidence > 0.2;
                    // Create a wave pattern based on index
                    const baseHeight = isActive ? 10 + (currentNote.confidence * 25) : 5;
                    const position = (i / 16) * Math.PI * 2; // Position in the wave cycle
                    const waveEffect = isActive ? Math.sin(position + (elapsedTime / 2)) * 10 : 0;
                    const height = Math.max(5, Math.min(35, baseHeight + waveEffect));
                    
                    return (
                      <Box 
                        key={i}
                        w="4px"
                        h={`${height}px`}
                        mx="2px"
                        bg={isActive ? 
                          i % 3 === 0 ? primaryColor : 
                          i % 3 === 1 ? 'brand.400' : 'brand.600'
                          : 'gray.600'}
                        transition="height 0.1s ease-in-out"
                        borderRadius="2px"
                        opacity={isActive ? 0.7 + (height / 100) : 0.4}
                        boxShadow={isActive ? "0 0 4px rgba(29, 185, 84, 0.4)" : "none"}
                      />
                    );
                  })}
                </Flex>
                
                {/* Horizontal guide lines */}
                <Box 
                  position="absolute" 
                  w="100%" 
                  h="1px" 
                  bg="rgba(255,255,255,0.1)" 
                  top="50%"
                />
                <Box 
                  position="absolute" 
                  w="100%" 
                  h="1px" 
                  bg="rgba(255,255,255,0.05)" 
                  top="25%"
                />
                <Box 
                  position="absolute" 
                  w="100%" 
                  h="1px" 
                  bg="rgba(255,255,255,0.05)" 
                  top="75%"
                />
              </Box>
              
              <HStack justify="space-between" w="100%" px={2} mt={1}>
                <Text fontSize="xs" color="gray.400">
                  {Math.floor(currentNote.frequency - 20)} Hz
                </Text>
                <Text fontSize="xs" color="white" fontWeight="medium">
                  {Math.floor(currentNote.frequency)} Hz
                </Text>
                <Text fontSize="xs" color="gray.400">
                  {Math.floor(currentNote.frequency + 20)} Hz
                </Text>
              </HStack>
            </Box>
          )}
          
          <CircularProgress 
            value={progress} 
            size="120px" 
            thickness="12px"
            color={primaryColor}
            trackColor="dark.300"
            mb={4}
            capIsRound
          >
            <CircularProgressLabel color="white">
              {Math.round(progress)}%
            </CircularProgressLabel>
          </CircularProgress>
          
          <HStack spacing={4} justify="center" mt={4}>
            <Stat textAlign="center" p={3} bg="dark.300" borderRadius="md" shadow="md">
              <StatLabel color="gray.300">Accuracy</StatLabel>
              <StatNumber color={sessionData.accuracy > 70 ? primaryColor : errorColor}>
                {sessionData.accuracy}%
              </StatNumber>
            </Stat>
            
            <Stat textAlign="center" p={3} bg="dark.300" borderRadius="md" shadow="md">
              <StatLabel color="gray.300">Time</StatLabel>
              <StatNumber color="white">{formatTime(elapsedTime)}</StatNumber>
            </Stat>
            
            <Stat textAlign="center" p={3} bg="dark.300" borderRadius="md" shadow="md">
              <StatLabel color="gray.300">Notes</StatLabel>
              <StatNumber color="white">{currentIndex + 1}/{selectedModule.notes.length}</StatNumber>
            </Stat>
            
            <Stat 
              textAlign="center" 
              p={3} 
              bg="dark.300" 
              borderRadius="md" 
              shadow="md"
              position="relative"
              overflow="hidden"
            >
              {currentStreak > 2 && (
                <Box 
                  position="absolute" 
                  top={0} 
                  left={0} 
                  right={0} 
                  bottom={0} 
                  bg="brand.500" 
                  opacity={0.15} 
                  animation={`${pulseKeyframe} 1s infinite ease-in-out`}
                />
              )}
              <StatLabel color="gray.300">Streak</StatLabel>
              <StatNumber 
                color={currentStreak > 5 ? "brand.400" : "white"}
                fontWeight={currentStreak > 5 ? "bold" : "normal"}
              >
                {currentStreak}
              </StatNumber>
              <StatHelpText color="gray.400" fontSize="xs">Best: {bestStreak}</StatHelpText>
            </Stat>
          </HStack>
          
          {renderVisualHistory()}
        </Box>
      </Box>
    );
  };
  
  // Render module selection
  const renderModuleSelection = () => {
    return (
      <Box>
        <Heading size="lg" mb={6}>Select a Training Module</Heading>
        
        {userProgress && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
            <Stat bg={cardBg} p={4} borderRadius="md" shadow="sm" textAlign="center">
              <StatLabel>Completed Modules</StatLabel>
              <StatNumber color={primaryColor}>{userProgress.completed_modules}</StatNumber>
            </Stat>
            
            <Stat bg={cardBg} p={4} borderRadius="md" shadow="sm" textAlign="center">
              <StatLabel>Average Accuracy</StatLabel>
              <StatNumber color={userProgress.average_accuracy > 70 ? successColor : errorColor}>
                {userProgress.average_accuracy.toFixed(1)}%
              </StatNumber>
            </Stat>
            
            <Stat bg={cardBg} p={4} borderRadius="md" shadow="sm" textAlign="center">
              <StatLabel>Practice Time</StatLabel>
              <StatNumber>{formatTime(userProgress.total_practice_time)}</StatNumber>
            </Stat>
          </SimpleGrid>
        )}
        
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {trainingModules.map((module) => (
            <AnimatedElement 
              key={module.id} 
              animationType="slideUp"
              delay={0.1 * module.id}
            >
              <Card bg={cardBg} shadow="md" _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }} transition="all 0.3s">
                <CardHeader pb={2}>
                  <Heading size="md">{module.title}</Heading>
                  <Badge colorScheme="green" mt={2}>Level {module.level}</Badge>
                </CardHeader>
                
                <CardBody pt={0}>
                  <Text noOfLines={2} mb={2}>{module.description}</Text>
                  <Text fontSize="sm" mb={2}>Notes: {module.notes.length}</Text>
                </CardBody>
                
                <CardFooter pt={0}>
                  <Button 
                    colorScheme="brand" 
                    onClick={() => handleModuleSelect(module.id)}
                    leftIcon={<FaPlay />}
                    w="full"
                  >
                    Select Module
                  </Button>
                </CardFooter>
              </Card>
            </AnimatedElement>
          ))}
        </SimpleGrid>
      </Box>
    );
  };
  
  // Render calibration step
  const renderCalibration = () => {
    if (!selectedModule || trainingState !== 'calibration') return null;
    
    const hasDetectedNote = calibrationNote && calibrationNote.note !== 'N/A';
    
    return (
      <VStack spacing={6} align="center">
        <Heading size="lg">Microphone Calibration</Heading>
        
        <Card bg={cardBg} p={8} borderRadius="lg" shadow="md" maxW="600px" w="full">
          <VStack spacing={6}>
            <CircularProgress 
              isIndeterminate={!hasDetectedNote}
              value={hasDetectedNote ? 100 : 0}
              size="120px" 
              thickness="12px"
              color={hasDetectedNote ? successColor : primaryColor}
              capIsRound
            >
              <CircularProgressLabel>
                <Box color={hasDetectedNote ? successColor : 'gray.400'}>
                  {hasDetectedNote ? <FaCheck size={30} /> : <FaMicrophone size={30} />}
                </Box>
              </CircularProgressLabel>
            </CircularProgress>
            
            <Text fontSize="lg" fontWeight="medium" textAlign="center">
              {hasDetectedNote 
                ? `Great! We detected a ${calibrationNote.note}${calibrationNote.octave} note.` 
                : 'Please play a note on your instrument'}
            </Text>
            
            {hasDetectedNote && (
              <VStack spacing={1}>
                <Text fontSize="sm">Detected Note</Text>
                <Text fontSize="3xl" fontWeight="bold" color={primaryColor}>
                  {calibrationNote.note}{calibrationNote.octave}
                </Text>
                <Text fontSize="xs">
                  Frequency: {calibrationNote.frequency.toFixed(1)} Hz
                </Text>
                <Text fontSize="xs">
                  Confidence: {Math.round(calibrationNote.confidence * 100)}%
                </Text>
              </VStack>
            )}
            
            <Text fontSize="sm" opacity={0.7} textAlign="center">
              This calibration helps ensure your microphone is working properly.
              Play any note on your instrument to test the sound detection.
            </Text>
            
            <HStack spacing={4}>
              <Button 
                colorScheme="gray" 
                onClick={() => {
                  detector.stop();
                  setIsListening(false);
                  setTrainingState('ready');
                  if (calibrationTimerRef.current) {
                    clearTimeout(calibrationTimerRef.current);
                  }
                }}
              >
                Skip
              </Button>
              
              <Button 
                colorScheme="brand" 
                isDisabled={!hasDetectedNote}
                onClick={completeCalibration}
              >
                Continue
              </Button>
            </HStack>
          </VStack>
        </Card>
      </VStack>
    );
  };
  
  // Render training complete
  const renderTrainingComplete = () => {
    // Determine achievements
    const achievements = [];
    if (sessionData.accuracy >= 90) achievements.push({ icon: '🏆', title: 'Precision Master', description: 'Achieved 90%+ accuracy' });
    if (bestStreak >= 10) achievements.push({ icon: '🔥', title: 'On Fire', description: `Hit a streak of ${bestStreak} notes` });
    if (sessionData.duration < 120 && notesCorrectRef.current > 0) achievements.push({ icon: '⚡', title: 'Speed Demon', description: 'Completed training in record time' });
    
    return (
      <VStack spacing={6} align="center">
        <Heading size="lg" color={successColor}>Training Complete!</Heading>
        
        <CircularProgress 
          value={sessionData.accuracy} 
          size="200px" 
          thickness="12px"
          color={sessionData.accuracy > 70 ? successColor : errorColor}
          trackColor={noteBg}
          mb={4}
          capIsRound
        >
          <CircularProgressLabel>
            <VStack spacing={0}>
              <Text fontSize="md">Accuracy</Text>
              <Text fontSize="2xl" fontWeight="bold">{sessionData.accuracy}%</Text>
            </VStack>
          </CircularProgressLabel>
        </CircularProgress>
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full" maxW="600px">
          <Stat bg={cardBg} p={4} borderRadius="md" shadow="sm" textAlign="center">
            <StatLabel>Duration</StatLabel>
            <StatNumber>{formatTime(sessionData.duration)}</StatNumber>
          </Stat>
          
          <Stat bg={cardBg} p={4} borderRadius="md" shadow="sm" textAlign="center">
            <StatLabel>Notes Played</StatLabel>
            <StatNumber>{sessionData.notes_played.length}</StatNumber>
          </Stat>
          
          <Stat bg={cardBg} p={4} borderRadius="md" shadow="sm" textAlign="center">
            <StatLabel>Best Streak</StatLabel>
            <StatNumber color={bestStreak > 5 ? successColor : 'white'}>
              {bestStreak}
            </StatNumber>
          </Stat>
        </SimpleGrid>
        
        {achievements.length > 0 && (
          <Box w="full" maxW="600px" mb={4}>
            <Text fontSize="md" fontWeight="medium" mb={2} color="white">Achievements Earned</Text>
            <SimpleGrid columns={{ base: 1, md: achievements.length }} spacing={4}>
              {achievements.map((achievement, index) => (
                <Box 
                  key={index} 
                  p={4} 
                  borderRadius="lg" 
                  bg="rgba(29, 185, 84, 0.1)"
                  border="1px solid"
                  borderColor="brand.500"
                  textAlign="center"
                  animation={`${pulseKeyframe} 3s infinite ease-in-out`}
                  style={{ animationDelay: `${index * 0.5}s` }}
                >
                  <Text fontSize="2xl" mb={2}>{achievement.icon}</Text>
                  <Text fontWeight="bold" color="brand.300">{achievement.title}</Text>
                  <Text fontSize="sm" color="gray.300">{achievement.description}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}
        
        <Box bg={cardBg} p={4} borderRadius="md" shadow="sm" w="full" maxW="600px" textAlign="center">
          <Text fontSize="sm" mb={1}>
            Instrument: <Badge colorScheme="blue">{selectedInstrument}</Badge>
          </Text>
          <Text fontSize="sm" mb={1}>
            Practice Mode: <Badge colorScheme="purple">{practiceMode}</Badge>
          </Text>
          <Text fontSize="sm">
            {sessionData.notes_played.length > 0 && (
              <>
                Average Confidence: {Math.round(
                  sessionData.notes_played.reduce((sum, note) => sum + (note.confidence || 0), 0) / 
                  sessionData.notes_played.length * 100
                )}%
              </>
            )}
          </Text>
        </Box>
        
        <HStack spacing={4} mt={4}>
          <Button 
            colorScheme="gray" 
            onClick={resetTraining}
          >
            Return to Modules
          </Button>
          
          <Button 
            colorScheme="brand" 
            leftIcon={<FaPlay />}
            onClick={() => {
              setTrainingState('ready');
            }}
          >
            Try Again
          </Button>
        </HStack>
      </VStack>
    );
  };
  
  // Check browser compatibility
  useEffect(() => {
    if (!detector.isCompatible && trainingState === 'ready') {
      toast({
        title: 'Browser Compatibility Issue',
        description: 'Your browser may not fully support the Web Audio API needed for pitch detection. For best results, use Chrome, Edge, or Safari.',
        status: 'warning',
        duration: 8000,
        isClosable: true,
      });
    }
  }, [detector.isCompatible, trainingState, toast]);
  
  // Help and tips component
  const renderHelpTips = () => {
    return (
      <Popover placement="bottom-start">
        <PopoverTrigger>
          <IconButton
            aria-label="Help and tips"
            icon={<FaQuestion />}
            colorScheme="blue"
            variant="ghost"
            size="md"
            position="fixed"
            bottom="20px"
            right="20px"
            borderRadius="full"
            boxShadow="md"
          />
        </PopoverTrigger>
        <PopoverContent width="350px" maxW="95vw">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader fontWeight="bold">
            <HStack>
              <FaLightbulb />
              <Text>Training Tips & Help</Text>
            </HStack>
          </PopoverHeader>
          <PopoverBody>
            <Accordion allowToggle defaultIndex={[0]}>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Setup Tips
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <List spacing={2} fontSize="sm">
                    <ListItem>
                      <ListIcon as={FaCheck} color="green.500" />
                      Use a good quality microphone or headset if possible
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheck} color="green.500" />
                      Reduce background noise in your environment
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheck} color="green.500" />
                      Position your microphone close to your instrument
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheck} color="green.500" />
                      Use Chrome, Edge or Safari for best compatibility
                    </ListItem>
                  </List>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Training Best Practices
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <List spacing={2} fontSize="sm">
                    <ListItem>
                      <ListIcon as={FaCheck} color="green.500" />
                      Play notes clearly and hold them for at least 1-2 seconds
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheck} color="green.500" />
                      Watch the tuning meter to adjust your pitch precisely
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheck} color="green.500" />
                      Start with easier modules before attempting harder ones
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaCheck} color="green.500" />
                      Practice regularly for best results
                    </ListItem>
                  </List>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Troubleshooting
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <List spacing={2} fontSize="sm">
                    <ListItem>
                      <ListIcon as={FaInfoCircle} color="blue.500" />
                      <strong>No sound detected:</strong> Make sure your microphone is connected and browser permissions are granted
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaInfoCircle} color="blue.500" />
                      <strong>Inaccurate detection:</strong> Try recalibrating or moving to a quieter environment
                    </ListItem>
                    <ListItem>
                      <ListIcon as={FaInfoCircle} color="blue.500" />
                      <strong>Browser issues:</strong> Try refreshing the page or using a different browser
                    </ListItem>
                  </List>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </PopoverBody>
          <PopoverFooter fontSize="xs" textAlign="center">
            For more help, visit our support center or contact us.
          </PopoverFooter>
        </PopoverContent>
      </Popover>
    );
  };

  // Render practice mode selection
  const renderPracticeModeSelection = () => {
    return (
      <Card bg={cardBg} p={4} borderRadius="lg" shadow="sm" maxW="600px" w="full" mt={4}>
        <CardHeader pb={1}>
          <HStack>
            <FaChartLine />
            <Text fontWeight="medium">Practice Mode</Text>
          </HStack>
        </CardHeader>
        <CardBody pt={2}>
          <VStack align="start" spacing={2} w="full">
            <Text fontSize="sm">
              Select your preferred practice mode:
            </Text>
            <Select 
              value={practiceMode} 
              onChange={handlePracticeModeChange}
              size="md"
              variant="filled"
            >
              <option value="standard">Standard Mode (Follow Sequence)</option>
              <option value="freeplay">Free Play (Any Note Order)</option>
              <option value="challenge">Challenge Mode (Speed + Accuracy)</option>
            </Select>
            <Text fontSize="xs" opacity={0.7}>
              {practiceMode === 'standard' && 'Play notes in the exact sequence shown.'}
              {practiceMode === 'freeplay' && 'Play any note from the module in any order.'}
              {practiceMode === 'challenge' && 'Play as fast and accurately as possible - time matters!'}
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  };
  
  // Render the training preparation tips
  const renderTrainingPreparation = () => {
    if (trainingState !== 'ready' || !selectedModule) return null;
    
    return (
      <>
        {renderInstrumentSelection()}
        {renderPracticeModeSelection()}
        
        <Card bg={cardBg} p={4} borderRadius="lg" shadow="sm" maxW="600px" w="full" mt={4}>
          <CardHeader pb={1}>
            <HStack>
              <FaHeadphones />
              <Text fontWeight="medium">Preparation Tips</Text>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <List spacing={1} fontSize="sm">
              <ListItem>
                <ListIcon as={FaCheck} color="green.500" />
                Ensure your instrument is properly tuned
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheck} color="green.500" />
                Position yourself in a quiet environment
              </ListItem>
              <ListItem>
                <ListIcon as={FaCheck} color="green.500" />
                Play notes clearly and hold them steady
              </ListItem>
            </List>
          </CardBody>
        </Card>
      </>
    );
  };
  
  // Render visual note history
  const renderVisualHistory = () => {
    if (visualHistory.length === 0) return null;
    
    return (
      <Box mt={6} mb={4}>
        <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.300">Note History</Text>
        <Flex justify="center" overflow="hidden">
          {visualHistory.map((note, index) => (
            <Box 
              key={index}
              px={1}
              transition="all 0.3s"
              transform={`scale(${index === visualHistory.length - 1 ? 1.2 : 1})`}
              zIndex={index === visualHistory.length - 1 ? 2 : 1}
            >
              <Box
                h="40px"
                minW="30px"
                borderRadius="md"
                bg={note.correct ? 'brand.500' : 'red.500'}
                opacity={0.5 + (index / (visualHistory.length * 2))}
                textAlign="center"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="xs"
                fontWeight="bold"
                color="white"
                boxShadow={index === visualHistory.length - 1 ? 'lg' : 'none'}
              >
                {note.played}
              </Box>
            </Box>
          ))}
        </Flex>
      </Box>
    );
  };
  
  // Render instrument selection
  const renderInstrumentSelection = () => {
    return (
      <Card bg={cardBg} p={4} borderRadius="lg" shadow="sm" maxW="600px" w="full" mt={4}>
        <CardHeader pb={1}>
          <HStack>
            <FaMusic />
            <Text fontWeight="medium">Instrument Selection</Text>
          </HStack>
        </CardHeader>
        <CardBody pt={2}>
          <VStack align="start" spacing={2} w="full">
            <Text fontSize="sm">
              Select your instrument type for more accurate pitch detection:
            </Text>
            <Select 
              value={selectedInstrument} 
              onChange={handleInstrumentChange}
              size="md"
              variant="filled"
            >
              <option value="general">General (All Instruments)</option>
              <option value="piano">Piano</option>
              <option value="guitar">Guitar</option>
              <option value="violin">Violin</option>
              <option value="voice">Voice</option>
              <option value="bass">Bass</option>
            </Select>
            <Text fontSize="xs" opacity={0.7}>
              This helps optimize the pitch detection algorithm for your specific instrument's frequency range.
            </Text>
          </VStack>
        </CardBody>
      </Card>
    );
  };
  
  // Redirect if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" mb={8} position="relative">
          {/* Decorative header background */}
          <Box
            position="absolute"
            top="-20px"
            left="50%"
            transform="translateX(-50%)"
            width="80%"
            height="100px"
            bgGradient="radial-gradient(circle, rgba(29, 185, 84, 0.1) 0%, transparent 70%)"
            filter="blur(20px)"
            zIndex={0}
          />
          
          <Heading 
            bgGradient="linear(to-r, brand.400, brand.600)" 
            bgClip="text" 
            position="relative" 
            zIndex={1}
          >
            Music Note Training
          </Heading>
          <Text mt={2} opacity={0.8} color="gray.300">Train your ear to recognize musical notes</Text>
        </Box>
        
        {trainingState === 'idle' && renderModuleSelection()}
        
        {trainingState === 'calibration' && renderCalibration()}
        
        {trainingState === 'ready' && selectedModule && (
          <VStack spacing={6} align="center">
            <Heading 
              size="lg" 
              bgGradient="linear(to-r, brand.400, brand.500)" 
              bgClip="text"
            >
              {selectedModule.title}
            </Heading>
            <Text maxW="600px" textAlign="center" color="gray.300">{selectedModule.description}</Text>
            
            <Text fontWeight="medium" mt={2} color="gray.200">
              This module contains {selectedModule.notes.length} notes to practice.
            </Text>
            
            <Card bg={cardBg} p={6} borderRadius="lg" shadow="md" maxW="600px" w="full" variant="elevated">
              <SimpleGrid columns={4} spacing={4}>
                {selectedModule.notes.map((note, index) => (
                  <Box 
                    key={index}
                    bg={noteBg}
                    p={3}
                    borderRadius="md"
                    textAlign="center"
                    fontWeight="bold"
                    color="white"
                    border="1px solid"
                    borderColor="dark.200"
                    _hover={{ borderColor: 'brand.500', transform: 'translateY(-2px)' }}
                    transition="all 0.2s"
                  >
                    {note.note}
                  </Box>
                ))}
              </SimpleGrid>
            </Card>
            
            {renderTrainingPreparation()}
            
            {microphoneStatus === 'error' && (
              <Box bg="red.900" p={4} borderRadius="md" borderLeft="4px solid" borderColor="red.500" maxW="600px" w="full">
                <Text color="red.300" fontWeight="medium">Microphone Access Error</Text>
                <Text fontSize="sm" color="gray.300">
                  We couldn't access your microphone. Please make sure your microphone is connected and you've granted permission in your browser.
                </Text>
              </Box>
            )}
            
            {calibrationComplete && (
              <Box bg="green.900" p={4} borderRadius="md" borderLeft="4px solid" borderColor="green.500" maxW="600px" w="full">
                <Text color="green.300" fontWeight="medium">Microphone Calibration Complete</Text>
                <Text fontSize="sm" color="gray.300">
                  Your microphone is working properly. You can now start the training session.
                </Text>
              </Box>
            )}
            
            <HStack spacing={4} mt={6}>
              <Button 
                leftIcon={<FaStop />} 
                colorScheme="gray" 
                onClick={resetTraining}
                variant="solid"
              >
                Back
              </Button>
              <Button 
                leftIcon={<FaMicrophone />} 
                colorScheme="brand" 
                onClick={startTraining}
                size="lg"
                bgGradient="linear(to-r, brand.500, brand.600)"
                _hover={{
                  bgGradient: "linear(to-r, brand.600, brand.700)",
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
              >
                Start Training
              </Button>
            </HStack>
          </VStack>
        )}
        
        {trainingState === 'active' && renderNoteDisplay()}
        
        {trainingState === 'active' && (
          <Box textAlign="center" mt={4}>
            <Button 
              leftIcon={<FaStop />} 
              colorScheme="red" 
              onClick={stopTraining}
              size="md"
              shadow="md"
            >
              Stop Training
            </Button>
          </Box>
        )}
        
        {trainingState === 'complete' && renderTrainingComplete()}
        
        {/* Help button that stays visible on all pages */}
        {renderHelpTips()}
      </VStack>
    </Container>
  );
};

export default TrainingPage; 