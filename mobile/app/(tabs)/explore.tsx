// mobile/app/(tabs)/explore.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withRepeat,
  Easing
} from 'react-native-reanimated';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedLayout } from '@/components/ThemedLayout';
import AppBackground from '@/components/AppBackground';
import { useAuth } from '@/context/AuthContext';

// Mock data types
interface Note {
  note: string;
}

interface TrainingModule {
  id: number;
  title: string;
  description: string;
  level: number;
  notes: Note[];
}

interface NoteData {
  note: string;
  octave: number;
  frequency: number;
  confidence: number;
  cents?: number;
  idealFrequency?: number;
}

interface NoteRecord {
  timestamp: number;
  expected: string;
  played: string;
  correct: boolean;
  frequency: number;
  cents?: number;
  confidence: number;
  idealFrequency?: number;
}

interface SessionData {
  notes_played: NoteRecord[];
  accuracy: number;
  duration: number;
  completed: boolean;
  module_id?: number;
  instrument_type?: string;
  best_streak?: number;
}

// Placeholder API functions - will need to implement these
const getTrainingModules = async (): Promise<{data: TrainingModule[]}> => {
  // Mock data for now
  return {
    data: [
      {
        id: 1,
        title: 'Basic Notes Recognition',
        description: 'Learn to identify basic notes in the middle octave',
        level: 1,
        notes: [
          { note: 'C4' },
          { note: 'D4' },
          { note: 'E4' },
          { note: 'F4' },
          { note: 'G4' },
          { note: 'A4' },
          { note: 'B4' }
        ]
      },
      {
        id: 2,
        title: 'Major Scale Training',
        description: 'Practice identifying notes in the C major scale',
        level: 2,
        notes: [
          { note: 'C4' },
          { note: 'D4' },
          { note: 'E4' },
          { note: 'F4' },
          { note: 'G4' },
          { note: 'A4' },
          { note: 'B4' },
          { note: 'C5' }
        ]
      },
      {
        id: 3,
        title: 'Minor Scales',
        description: 'Learn to recognize notes in the minor scale',
        level: 3,
        notes: [
          { note: 'A4' },
          { note: 'B4' },
          { note: 'C5' },
          { note: 'D5' },
          { note: 'E5' },
          { note: 'F5' },
          { note: 'G5' },
          { note: 'A5' }
        ]
      }
    ]
  };
};

// Placeholder for PitchDetector class
class PitchDetector {
  isCompatible = Platform.OS !== 'web';
  recording: Audio.Recording | null = null;
  callback: ((noteData: NoteData) => void) | null = null;
  isRecording = false;
  mockInterval: ReturnType<typeof setTimeout> | null = null;
  
  constructor() {
    // Initialize
  }
  
  async start(callback: (noteData: NoteData) => void) {
    this.callback = callback;
    
    try {
      await Audio.requestPermissionsAsync();
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
      
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      
      // Set up audio data listener
      recording.setOnRecordingStatusUpdate(this._onRecordingStatusUpdate);
      
      await recording.startAsync();
      this.recording = recording;
      this.isRecording = true;
      
      // Simulate pitch detection for now
      this._startMockPitchDetection();
      
      return true;
    } catch (error) {
      console.error('Failed to start recording', error);
      return false;
    }
  }
  
  _startMockPitchDetection() {
    // Mock pitch detection for prototype
    this.mockInterval = setInterval(() => {
      if (!this.callback) return;
      
      const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
      const randomNote = notes[Math.floor(Math.random() * notes.length)];
      const randomOctave = Math.floor(Math.random() * 2) + 3; // 3 or 4
      const randomFreq = 220 + Math.random() * 440;
      const confidence = 0.5 + Math.random() * 0.5;
      
      this.callback({
        note: randomNote,
        octave: randomOctave,
        frequency: randomFreq,
        confidence: confidence,
        cents: (Math.random() * 50) - 25, // -25 to +25 cents
        idealFrequency: randomFreq - ((Math.random() * 20) - 10) // Slightly off from actual frequency
      });
    }, 500);
  }
  
  async stop() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
    
    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
        this.isRecording = false;
      } catch (error) {
        console.error('Failed to stop recording', error);
      }
    }
  }
  
  _onRecordingStatusUpdate = (status: Audio.RecordingStatus) => {
    // Process recording status updates
    // For now just a placeholder
  }
  
  setInstrumentType(instrument: string) {
    // Configuration based on instrument type
    console.log(`Instrument type set to: ${instrument}`);
  }
  
  getAudioLevel() {
    // Mock audio level for visualization
    return Math.random();
  }
}

export default function ExploreScreen() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // State variables
  const [detector] = useState(new PitchDetector());
  const [isListening, setIsListening] = useState(false);
  const [currentNote, setCurrentNote] = useState<NoteData>({ note: 'N/A', octave: -1, frequency: 0, confidence: 0 });
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionData, setSessionData] = useState<SessionData>({
    notes_played: [],
    accuracy: 0,
    duration: 0,
    completed: false
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [trainingState, setTrainingState] = useState('idle'); // idle, ready, calibration, active, complete
  const [microphoneStatus, setMicrophoneStatus] = useState('standby'); // standby, testing, ready, error
  const [calibrationNote, setCalibrationNote] = useState<NoteData | null>(null);
  const [calibrationComplete, setCalibrationComplete] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState('general');
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [visualHistory, setVisualHistory] = useState<NoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // References for timers
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const noteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const calibrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // References for note history
  const notesCorrectRef = useRef(0);
  const notesTotalRef = useRef(0);
  
  // Animation values
  const pulseAnim = useSharedValue(1);
  
  // Load training modules
  useEffect(() => {
    const loadModules = async () => {
      try {
        setLoading(true);
        const response = await getTrainingModules();
        setTrainingModules(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading training modules:', error);
        setLoading(false);
      }
    };
    
    loadModules();
  }, []);
  
  // Handle note detection
  const handleNoteData = (noteData: NoteData) => {
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
                      parseInt(noteData.octave.toString()) === expectedOctave;
    
    // Only consider notes with good confidence
    if (noteData.confidence > 0.7) {
      // Add to notes played for this session
      const noteRecord: NoteRecord = {
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
  
  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Render calibration screen
  const renderCalibration = () => {
    const hasDetectedNote = calibrationNote && calibrationNote.note !== 'N/A';
    
  return (
      <View style={styles.calibrationContainer}>
                  <ThemedText style={styles.calibrationTitle}>EnsAI Microphone Calibration</ThemedText>
        
        <View style={styles.calibrationCard}>
          <Animated.View 
            style={[styles.progressCircle, hasDetectedNote ? styles.progressCircleSuccess : {}]}
          >
            <MaterialIcons 
              name={hasDetectedNote ? "check" : "mic"} 
              size={30} 
              color={hasDetectedNote ? "#1DB954" : "#999"} 
            />
          </Animated.View>
          
          <ThemedText style={styles.calibrationText}>
            {hasDetectedNote 
              ? `Great! We detected a ${calibrationNote.note}${calibrationNote.octave} note.` 
              : 'Please play a note on your instrument'}
        </ThemedText>
          
          {hasDetectedNote && (
            <View style={styles.detectedNoteContainer}>
              <ThemedText style={styles.detectedNoteLabel}>Detected Note</ThemedText>
              <Text style={styles.detectedNoteValue}>
                {calibrationNote.note}{calibrationNote.octave}
              </Text>
              <ThemedText style={styles.detectedNoteDetail}>
                Frequency: {calibrationNote.frequency.toFixed(1)} Hz
        </ThemedText>
              <ThemedText style={styles.detectedNoteDetail}>
                Confidence: {Math.round(calibrationNote.confidence * 100)}%
        </ThemedText>
            </View>
          )}
          
          <ThemedText style={styles.calibrationSubtext}>
            This calibration helps ensure your microphone is working properly.
            Play any note on your instrument to test the sound detection.
        </ThemedText>
          
          <View style={styles.calibrationButtons}>
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => {
                detector.stop();
                setIsListening(false);
                setTrainingState('ready');
                if (calibrationTimerRef.current) {
                  clearTimeout(calibrationTimerRef.current);
                }
              }}
            >
              <Text style={styles.secondaryButtonText}>Skip</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.primaryButton,
                !hasDetectedNote && styles.disabledButton
              ]}
              disabled={!hasDetectedNote}
              onPress={completeCalibration}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
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
      } else {
        setMicrophoneStatus('error');
        setTrainingState('ready');
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setMicrophoneStatus('error');
      setTrainingState('ready');
    }
  };
  
  // Complete calibration and start training
  const completeCalibration = () => {
    // Reset calibration timer
    if (calibrationTimerRef.current) {
      clearTimeout(calibrationTimerRef.current);
      calibrationTimerRef.current = null;
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
      // If we haven't calibrated yet and the device is compatible, show calibration step
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
        
        // Start pulse animation
        pulseAnim.value = withRepeat(
          withSequence(
            withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1, // Infinite repeat
          true // Reverse
        );
      }
    } catch (error) {
      console.error('Error starting training:', error);
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
    
    // Stop animation
    pulseAnim.value = withTiming(1);
    
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
      module_id: selectedModule?.id,
      instrument_type: selectedInstrument,
      best_streak: bestStreak
    };
    
    setSessionData(completeSessionData);
    
    // In a real app, save session to database here
  };
  
  // Handle module selection
  const handleModuleSelect = (module: TrainingModule) => {
    setSelectedModule(module);
    setTrainingState('ready');
  };
  
  // Return to module selection
  const resetTraining = () => {
    setSelectedModule(null);
    setTrainingState('idle');
  };
  
  // Handle instrument selection
  const handleInstrumentChange = (instrument: string) => {
    setSelectedInstrument(instrument);
    if (detector) {
      detector.setInstrumentType(instrument);
    }
  };
  
  // Animation for pulse effect
  const pulseAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnim.value }]
    };
  });
  
  // Render module selection cards
  const renderModuleItem = (item: TrainingModule) => {
    return (
      <TouchableOpacity
        style={styles.moduleCard}
        onPress={() => handleModuleSelect(item)}
        activeOpacity={0.8}
      >
        <View style={styles.moduleCardHeader}>
          <ThemedText style={styles.moduleTitle}>{item.title}</ThemedText>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Level {item.level}</Text>
          </View>
        </View>
        
        <ThemedText style={styles.moduleDescription} numberOfLines={2}>
          {item.description}
          </ThemedText>
        
        <View style={styles.moduleFooter}>
          <ThemedText style={styles.moduleNotes}>Notes: {item.notes.length}</ThemedText>
          <MaterialIcons name="arrow-forward" size={20} color="#1DB954" />
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render ready state (before starting training)
  const renderReadyState = () => {
    if (!selectedModule) {
      return (
        <View style={styles.centerContainer}>
          <ThemedText>No module selected</ThemedText>
          <TouchableOpacity
            style={styles.backButton}
            onPress={resetTraining}
          >
            <MaterialIcons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.backButtonText}>Back to modules</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <ScrollView style={styles.readyContainer} contentContainerStyle={styles.readyContentContainer}>
        <ThemedText style={styles.moduleDetailTitle}>{selectedModule.title}</ThemedText>
        <ThemedText style={styles.moduleDetailDescription}>{selectedModule.description}</ThemedText>
        
        <View style={styles.notePreviewContainer}>
          <ThemedText style={styles.notePreviewTitle}>Notes in this module:</ThemedText>
          <View style={styles.noteGrid}>
            {selectedModule.notes.map((note, index) => (
              <View key={index} style={styles.noteItem}>
                <Text style={styles.noteText}>{note.note}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.instrumentSelectContainer}>
          <ThemedText style={styles.instrumentSelectTitle}>
            Select your instrument:
        </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.instrumentScroll}>
            {['general', 'piano', 'guitar', 'violin', 'voice', 'bass'].map(instrument => (
              <TouchableOpacity 
                key={instrument}
                style={[
                  styles.instrumentButton,
                  selectedInstrument === instrument && styles.instrumentButtonActive
                ]}
                onPress={() => handleInstrumentChange(instrument)}
              >
                <Text style={[
                  styles.instrumentButtonText,
                  selectedInstrument === instrument && styles.instrumentButtonTextActive
                ]}>
                  {instrument.charAt(0).toUpperCase() + instrument.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <TouchableOpacity
          style={styles.startButton}
          onPress={startTraining}
        >
          <MaterialIcons name="play-arrow" size={24} color="#fff" />
          <Text style={styles.startButtonText}>Start Training</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.backButton}
          onPress={resetTraining}
        >
          <MaterialIcons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.backButtonText}>Back to modules</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };
  
  // Render active training UI
  const renderActiveTraining = () => {
    if (!selectedModule) return null;
    
    // Safely access the expected note and avoid accessing if array is empty
    if (!selectedModule.notes || selectedModule.notes.length === 0 || currentIndex >= selectedModule.notes.length) {
      return (
        <View style={styles.centerContainer}>
          <ThemedText>No notes available for training</ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={resetTraining}>
            <MaterialIcons name="arrow-back" size={20} color="#fff" />
            <Text style={styles.backButtonText}>Back to modules</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    const expectedNote = selectedModule.notes[currentIndex];
    const expectedNoteName = expectedNote.note.substring(0, expectedNote.note.length - 1);
    const expectedOctave = parseInt(expectedNote.note.slice(-1));
    
    const isCorrect = currentNote.note === expectedNoteName && 
                      parseInt(currentNote.octave.toString()) === expectedOctave;
    
    // Calculate tuner position
    const centsValue = currentNote.cents || 0;
    const tunerPosition = Math.max(10, Math.min(90, ((centsValue || 0) + 50) / 100 * 80 + 10));
    const inTune = Math.abs(centsValue) < 15;
    const tunerColor = inTune ? '#1DB954' : Math.abs(centsValue) < 30 ? '#FFCA28' : '#F44336';
    
    return (
      <ScrollView style={styles.activeContainer} contentContainerStyle={styles.activeContentContainer}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <ThemedText style={styles.progressText}>
            {Math.round(progress)}% Complete
        </ThemedText>
          <ThemedText style={styles.timerText}>
            {formatTime(elapsedTime)}
        </ThemedText>
        </View>
        
        <View style={styles.notesContainer}>
          <View style={styles.expectedNoteContainer}>
            <ThemedText style={styles.noteLabel}>Expected Note</ThemedText>
            <Text style={styles.expectedNoteText}>{expectedNote.note}</Text>
          </View>
          
          <MaterialIcons name="arrow-forward" size={24} color="#999" style={styles.arrowIcon} />
          
          <Animated.View 
            style={[styles.currentNoteContainer, pulseAnimStyle, isCorrect && styles.correctNoteContainer]}
          >
            <ThemedText style={styles.noteLabel}>You&apos;re Playing</ThemedText>
            <View style={styles.noteRow}>
              <Text style={[styles.currentNoteText, isCorrect && styles.correctNoteText]}>
                {currentNote.note}{currentNote.octave >= 0 ? currentNote.octave : ''}
              </Text>
              {isCorrect ? (
                <MaterialIcons name="check" size={20} color="#1DB954" />
              ) : (
                <MaterialIcons name="close" size={20} color="#F44336" />
              )}
            </View>
            <ThemedText style={styles.frequencyText}>
              {currentNote.frequency ? currentNote.frequency.toFixed(1) : 0} Hz
            </ThemedText>
          </Animated.View>
        </View>
        
        {/* Tuning meter */}
        <View style={styles.tunerContainer}>
          <ThemedText style={styles.tunerLabelHeading}>Pitch Accuracy</ThemedText>
          <View style={styles.tunerBar}>
            <View style={styles.tunerScale} />
            <View 
              style={[
                styles.tunerIndicatorDot, 
                { left: `${tunerPosition}%`, backgroundColor: tunerColor }
              ]} 
            />
          </View>
          <View style={styles.tunerLabels}>
            <Text style={styles.tunerLabelText}>♭ Flat</Text>
            <Text style={[styles.tunerLabelText, inTune && styles.tunerInTuneText]}>In Tune</Text>
            <Text style={styles.tunerLabelText}>Sharp ♯</Text>
          </View>
          <Text style={[styles.centsText, { color: tunerColor }]}>
            {Math.abs(centsValue)} cents {centsValue > 0 ? 'Sharp' : centsValue < 0 ? 'Flat' : 'In Tune'}
          </Text>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Accuracy</ThemedText>
            <Text style={[styles.statValue, { color: sessionData.accuracy > 70 ? '#1DB954' : '#F44336' }]}>
              {sessionData.accuracy}%
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Current Streak</ThemedText>
            <Text style={[styles.statValue, { color: currentStreak > 3 ? '#1DB954' : '#fff' }]}>
              {currentStreak}
            </Text>
            <ThemedText style={styles.statSubtext}>Best: {bestStreak}</ThemedText>
          </View>
          
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Notes</ThemedText>
            <Text style={styles.statValue}>
              {currentIndex + 1}/{selectedModule.notes.length}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.stopButton}
          onPress={stopTraining}
        >
          <MaterialIcons name="stop" size={20} color="#fff" />
          <Text style={styles.stopButtonText}>Stop Training</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };
  
  // Render training completion screen
  const renderTrainingComplete = () => {
    // Determine achievements
    const achievements = [];
    if (sessionData.accuracy >= 90) achievements.push({ icon: '🏆', title: 'Precision Master', description: 'Achieved 90%+ accuracy' });
    if (bestStreak >= 10) achievements.push({ icon: '🔥', title: 'On Fire', description: `Hit a streak of ${bestStreak} notes` });
    if (sessionData.duration < 120 && notesCorrectRef.current > 0) achievements.push({ icon: '⚡', title: 'Speed Demon', description: 'Completed training in record time' });
    
    return (
      <ScrollView style={styles.completeContainer} contentContainerStyle={styles.completeContentContainer}>
        <Text style={styles.completeTitle}>EnsAI Training Complete!</Text>
        
        <View style={styles.accuracyCircle}>
          <Text style={styles.accuracyLabel}>Accuracy</Text>
          <Text style={styles.accuracyValue}>{sessionData.accuracy}%</Text>
        </View>
        
        <View style={styles.statsGrid}>
          <View style={styles.completeStatItem}>
            <ThemedText style={styles.completeStatLabel}>Duration</ThemedText>
            <Text style={styles.completeStatValue}>{formatTime(sessionData.duration)}</Text>
          </View>
          
          <View style={styles.completeStatItem}>
            <ThemedText style={styles.completeStatLabel}>Notes Played</ThemedText>
            <Text style={styles.completeStatValue}>{sessionData.notes_played.length}</Text>
          </View>
          
          <View style={styles.completeStatItem}>
            <ThemedText style={styles.completeStatLabel}>Best Streak</ThemedText>
            <Text style={[styles.completeStatValue, { color: bestStreak > 5 ? '#1DB954' : '#fff' }]}>
              {bestStreak}
            </Text>
          </View>
        </View>
        
        {achievements.length > 0 && (
          <View style={styles.achievementsContainer}>
            <ThemedText style={styles.achievementsTitle}>Achievements Earned</ThemedText>
            {achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementItem}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <ThemedText style={styles.achievementDescription}>{achievement.description}</ThemedText>
                </View>
              </View>
            ))}
          </View>
        )}
        
        <View style={styles.completeButtonsContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={resetTraining}
          >
            <MaterialIcons name="list" size={20} color="#fff" />
            <Text style={styles.backButtonText}>Module List</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => {
              setTrainingState('ready');
            }}
          >
            <MaterialIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.startButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };
  
  // Main render method
  return (
    <AppBackground>
      <ThemedLayout>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          <View style={styles.header}>
                    <ThemedText style={styles.headerTitle}>EnsAI</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Smart musical training assistant
          </ThemedText>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1DB954" />
              <ThemedText style={styles.loadingText}>Loading training modules...</ThemedText>
            </View>
          ) : (
            <>
              {trainingState === 'idle' && (
                <View style={styles.modulesContainer}>
                  <ThemedText style={styles.sectionTitle}>
                    Select an EnsAI Training Module
                  </ThemedText>
                  
                  <FlatList
                    data={trainingModules}
                    renderItem={({ item }: { item: TrainingModule }) => renderModuleItem(item)}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.modulesList}
                  />
                </View>
              )}
              
              {trainingState === 'calibration' && renderCalibration()}
              
              {trainingState === 'ready' && renderReadyState()}
              
              {trainingState === 'active' && renderActiveTraining()}
              
              {trainingState === 'complete' && renderTrainingComplete()}
              
              {(trainingState !== 'idle' && trainingState !== 'complete' && trainingState !== 'ready' && trainingState !== 'calibration' && trainingState !== 'active') && (
                <View style={styles.placeholder}>
                  <ThemedText style={styles.placeholderText}>
                    Unknown state
                  </ThemedText>
                  
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={resetTraining}
                  >
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    <Text style={styles.backButtonText}>Back to modules</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </ThemedLayout>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  modulesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  modulesList: {
    paddingBottom: 16,
  },
  moduleCard: {
    backgroundColor: 'rgba(40, 40, 60, 0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  moduleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  levelBadge: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  levelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  moduleDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 12,
  },
  moduleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moduleNotes: {
    fontSize: 13,
    color: '#aaa',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  calibrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calibrationCard: {
    backgroundColor: 'rgba(40, 40, 60, 0.8)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '90%',
  },
  calibrationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 20,
  },
  calibrationText: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  detectedNoteContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  detectedNoteLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 4,
  },
  detectedNoteValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 8,
  },
  detectedNoteDetail: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  calibrationSubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  calibrationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressCircleSuccess: {
    borderColor: '#1DB954',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readyContainer: {
    flex: 1,
    padding: 16,
  },
  readyContentContainer: {
    paddingBottom: 40,
  },
  moduleDetailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 16,
    textAlign: 'center',
  },
  moduleDetailDescription: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  notePreviewContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(40, 40, 60, 0.8)',
    borderRadius: 12,
    padding: 16,
  },
  notePreviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 12,
  },
  noteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  noteItem: {
    width: '33.33%',
    padding: 8,
    alignItems: 'center',
  },
  noteText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  instrumentSelectContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(40, 40, 60, 0.8)',
    borderRadius: 12,
    padding: 16,
  },
  instrumentSelectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 12,
  },
  instrumentScroll: {
    marginHorizontal: -4,
  },
  instrumentButton: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    minWidth: 100,
  },
  instrumentButtonActive: {
    backgroundColor: '#1DB954',
  },
  instrumentButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  instrumentButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#1DB954',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  activeContainer: {
    flex: 1,
    padding: 16,
  },
  activeContentContainer: {
    paddingBottom: 40,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    backgroundColor: '#333',
    borderRadius: 10,
    height: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#1DB954',
    borderRadius: 10,
    height: '100%',
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  timerText: {
    fontSize: 14,
    color: '#ccc',
  },
  notesContainer: {
    marginVertical: 20,
    backgroundColor: 'rgba(40, 40, 60, 0.8)',
    borderRadius: 12,
    padding: 16,
  },
  expectedNoteContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  noteLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 4,
  },
  expectedNoteText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  arrowIcon: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  currentNoteContainer: {
    backgroundColor: 'rgba(30, 30, 40, 0.8)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentNoteText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 8,
  },
  correctNoteContainer: {
    borderColor: '#1DB954',
    borderWidth: 2,
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  correctNoteText: {
    color: '#1DB954',
  },
  frequencyText: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
  },
  tunerContainer: {
    marginBottom: 20,
    backgroundColor: 'rgba(40, 40, 60, 0.8)',
    borderRadius: 12,
    padding: 16,
  },
  tunerLabelHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 8,
  },
  tunerBar: {
    backgroundColor: '#333',
    borderRadius: 10,
    height: 12,
    marginVertical: 12,
    position: 'relative',
  },
  tunerScale: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#1DB954',
  },
  tunerIndicatorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1DB954',
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -8 }],
  },
  tunerLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tunerLabelText: {
    fontSize: 14,
    color: '#ccc',
  },
  tunerInTuneText: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
  centsText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: 'rgba(40, 40, 60, 0.8)',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  stopButton: {
    backgroundColor: '#E53935',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  completeContainer: {
    flex: 1,
  },
  completeContentContainer: {
    padding: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 20,
    textAlign: 'center',
  },
  accuracyCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(29, 185, 84, 0.2)',
    borderWidth: 8,
    borderColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  accuracyLabel: {
    fontSize: 16,
    color: '#ccc',
  },
  accuracyValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
    backgroundColor: 'rgba(40, 40, 60, 0.8)',
    borderRadius: 12,
    padding: 16,
  },
  completeStatItem: {
    alignItems: 'center',
  },
  completeStatLabel: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  completeStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  achievementsContainer: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: 'rgba(40, 40, 60, 0.8)',
    borderRadius: 12,
    padding: 16,
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1DB954',
  },
  achievementIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#ccc',
  },
  completeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
});