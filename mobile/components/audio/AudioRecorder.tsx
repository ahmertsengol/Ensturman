import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Alert, TextInput, Animated, Easing, Platform, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedLayout } from '@/components/ThemedLayout';
import AudioRecorder from '@/utils/AudioRecorder';
import { uploadAudio, getCurrentNetworkStatus, refreshNetworkConnection } from '@/api/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Define PlaybackStatus interface
interface PlaybackStatus {
  isLoaded: boolean;
  didJustFinish?: boolean;
  [key: string]: any;
}

interface NetworkStatus {
  host: string;
  isConnected: boolean;
  isLocal: boolean;
}

export default function AudioRecorderComponent() {
  // Safe area insets for proper layout on notched devices
  const insets = useSafeAreaInsets();
  
  const [recorder] = useState(new AudioRecorder());
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingStep, setRecordingStep] = useState<'initial' | 'recording' | 'preview' | 'submit'>('initial');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [recordingQuality, setRecordingQuality] = useState<'checking' | 'ready' | 'error'>('checking');
  
  // Animation references
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // Audio level values for the visualizer bars
  const NUM_BARS = 12;
  const audioLevelBars = useRef(
    Array.from({ length: NUM_BARS }, (_, i) => new Animated.Value(0.3))
  ).current;
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioLevelTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const router = useRouter();

  // Check network status on mount
  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        const status = await getCurrentNetworkStatus();
        setNetworkStatus(status);
        console.log('🌐 Network Status:', status);
      } catch (error) {
        console.error('❌ Failed to check network status:', error);
        setNetworkStatus({ host: 'Unknown', isConnected: false, isLocal: false });
      }
    };

    checkNetworkStatus();
  }, []);

  // Check audio permissions and quality on mount
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        setRecordingQuality('checking');
        
        // Check permissions
        const permissionResult = await recorder.requestPermissions();
        setPermissionStatus(permissionResult.granted ? 'granted' : 'denied');
        
        if (permissionResult.granted) {
          setRecordingQuality('ready');
          console.log('✅ Audio recorder ready');
        } else {
          setRecordingQuality('error');
          console.warn('⚠️ Audio permission denied:', permissionResult.error);
        }
      } catch (error) {
        console.error('❌ Failed to initialize audio:', error);
        setRecordingQuality('error');
        setPermissionStatus('denied');
      }
    };

    initializeAudio();
  }, [recorder]);
  
  // Entry animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [recordingStep]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioLevelTimerRef.current) clearInterval(audioLevelTimerRef.current);
      if (soundRef.current) soundRef.current.unloadAsync();
      recorder.cleanup();
    };
  }, [recorder]);
  
  // Animation effects for pulse and audio level visualization when recording
  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation | null = null;
    
    if (isRecording) {
      // Pulsating ring animation
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      
      pulseAnimation.start();
      
      // Enhanced audio level visualization
      audioLevelTimerRef.current = setInterval(() => {
        const animations = audioLevelBars.map((bar, index) => {
          // Simulate realistic audio levels based on recording duration
          const time = Date.now();
          const baseLevel = Math.sin((time / 400) + (index * 0.4)) * 0.3 + 0.5;
          const centerFactor = 1 - Math.abs((index - (NUM_BARS / 2 - 0.5)) / (NUM_BARS / 2)) * 0.4;
          const randomFactor = Math.random() * 0.2;
          
          const finalLevel = Math.max(0.2, Math.min(0.95, 
            baseLevel * centerFactor + randomFactor
          ));
          
          return Animated.timing(bar, {
            toValue: finalLevel,
            duration: 150,
            useNativeDriver: true,
          });
        });
        
        Animated.parallel(animations).start();
      }, 100);
      
    } else {
      // Reset animations when not recording
      pulseAnim.setValue(1);
      audioLevelBars.forEach(bar => bar.setValue(0.3));
      
      if (audioLevelTimerRef.current) {
        clearInterval(audioLevelTimerRef.current);
        audioLevelTimerRef.current = null;
      }
    }
    
    return () => {
      if (pulseAnimation) pulseAnimation.stop();
      
      if (audioLevelTimerRef.current) {
        clearInterval(audioLevelTimerRef.current);
        audioLevelTimerRef.current = null;
      }
    };
  }, [isRecording, audioLevelBars, pulseAnim]);
  
  // Format time display (00:00)
  const formatTime = useCallback((milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  // Enhanced start recording with better error handling
  const startRecording = useCallback(async () => {
    try {
      if (permissionStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required to record audio. Please grant permission in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Retry', 
              onPress: async () => {
                const permissionResult = await recorder.requestPermissions();
                setPermissionStatus(permissionResult.granted ? 'granted' : 'denied');
                if (permissionResult.granted) {
                  setRecordingQuality('ready');
                  startRecording();
                }
              }
            }
          ]
        );
        return;
      }

      // Visual feedback animation
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
      
      const result = await recorder.startRecording((status) => {
        setRecordingDuration(status.durationMillis || 0);
      });

      if (result.success) {
        setIsRecording(true);
        setRecordingStep('recording');
        setRecordingDuration(0);
        console.log('✅ Recording started successfully');
      } else {
        throw new Error(result.error || 'Failed to start recording');
      }
      
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      Alert.alert(
        'Recording Error',
        `Could not start recording: ${errorMessage}`,
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'Check Network', 
            onPress: async () => {
              await refreshNetworkConnection();
              const status = await getCurrentNetworkStatus();
              setNetworkStatus(status);
            }
          }
        ]
      );
    }
  }, [recorder, fadeAnim, permissionStatus]);

  // Enhanced stop recording
  const stopRecording = useCallback(async () => {
    try {
      const result = await recorder.stopRecording();
      setIsRecording(false);
      
      if (result.success && result.uri) {
        setAudioUri(result.uri);
        setRecordingStep('preview');
        console.log('✅ Recording stopped successfully');
        console.log('📁 File URI:', result.uri);
        console.log('⏱️ Duration:', result.duration, 'ms');
        if (result.fileSize) {
          console.log('📊 File size:', result.fileSize, 'bytes');
        }
      } else {
        throw new Error(result.error || 'Failed to stop recording');
      }
      
    } catch (error) {
      console.error('❌ Error stopping recording:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Recording Error',
        `Could not stop recording: ${errorMessage}`
      );
    }
  }, [recorder]);
  
  // Cancel recording with useCallback
  const cancelRecording = useCallback(async () => {
    try {
      // If currently recording, cancel it
      if (isRecording) {
        await recorder.cleanup();
        setIsRecording(false);
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
      
      // If we have a sound object, unload it
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      
      // Reset recording state
      setRecordingDuration(0);
      setAudioUri(null);
      setRecordingStep('initial');
      setTitle('');
      setDescription('');
      
    } catch (error) {
      console.error('Error cancelling recording:', error);
    }
  }, [isRecording, recorder]);
  
  // Play recording with useCallback
  const playRecording = useCallback(async () => {
    if (!audioUri) return;
    
    try {
      if (soundRef.current) {
        if (isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
          return;
        }
        await soundRef.current.playAsync();
        setIsPlaying(true);
        return;
      }
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
      setIsPlaying(true);
      
      // Handle playback status updates
      sound.setOnPlaybackStatusUpdate((status: PlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
      
    } catch (error) {
      console.error('Error playing recording:', error);
      Alert.alert('Playback Error', 'Could not play the recording.');
    }
  }, [audioUri, isPlaying]);
  
  // Continue to submission step
  const proceedToSubmit = useCallback(() => {
    setRecordingStep('submit');
  }, []);
  
  // Submit recording with metadata
  const submitRecording = useCallback(async () => {
    if (!audioUri) {
      Alert.alert('Error', 'No recording available.');
      return;
    }
    
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your recording.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create form data
      const formData = new FormData();
      const extension = audioUri.split('.').pop()?.toLowerCase() || 'm4a';
      
      // Map extension to appropriate MIME type
      const mimeTypes = {
        mp3: 'audio/mpeg',
        m4a: 'audio/aac',
        aac: 'audio/aac',
        wav: 'audio/wav',
        webm: 'audio/webm',
      };
      const mimeType = mimeTypes[extension as keyof typeof mimeTypes] || 'audio/aac';
      
      // @ts-ignore - React Native types for FormData are incomplete
      formData.append('audio', {
        uri: audioUri,
        name: `recording.${extension}`,
        type: mimeType,
      });
      
      // Add metadata
      formData.append('title', title);
      formData.append('description', description || '');
      
      // Upload to server
      await uploadAudio(formData);
      
      // Show success message
      Alert.alert(
        'Success',
        'Audio recording uploaded successfully.',
        [{ text: 'OK', onPress: () => router.push('/recordings') }]
      );
      
      // Reset state
      cancelRecording();
      
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', 'Could not upload the recording. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [audioUri, title, description, cancelRecording, router]);

  // Render recording screen with improved visual design
  if (recordingStep === 'recording') {
    return (
      <ThemedLayout withBorder={false}>
        <Animated.View 
          style={[
            styles.recordingContainer, 
            { opacity: fadeAnim, paddingTop: insets.top }
          ]}
        >
          {/* Top section - Timer display */}
          <View style={styles.recordingTopSection}>
            <ThemedText style={styles.recordingTitle}>Recording in progress</ThemedText>
            <Text style={styles.timerDisplay}>
              {formatTime(recordingDuration)}
            </Text>
          </View>
          
          {/* Middle section - Recording controls with visualizer */}
          <View style={styles.recordingMiddleSection}>
            {/* Audio level visualization above the stop button */}
            <View style={styles.visualizerContainer}>
              <View style={styles.outerVisualizer}>
                {audioLevelBars.map((bar, index) => (
                  <Animated.View 
                    key={index}
                    style={[
                      styles.visualizerBar,
                      {
                        opacity: bar.interpolate({
                          inputRange: [0.3, 0.7, 1],
                          outputRange: [0.5, 0.8, 1]
                        }),
                        backgroundColor: bar.interpolate({
                          inputRange: [0.3, 0.6, 0.9],
                          outputRange: ['#134a21', '#1DB954', '#25e868']
                        }),
                        transform: [
                          { scaleX: Platform.OS === 'ios' ? 1 : 0.9 }, // Slight platform adjustment
                          { scaleY: bar.interpolate({
                              inputRange: [0.3, 1],
                              outputRange: [1, 4] // Scale from 15px to 60px (15 * 4 = 60)
                            })
                          }
                        ]
                      }
                    ]} 
                  />
                ))}
              </View>
            </View>
            
            <Animated.View style={[
              styles.recordButtonRing, 
              { 
                transform: [{ scale: pulseAnim }],
                borderColor: '#1DB954'
              }
            ]}>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopRecording}
                activeOpacity={0.8}
              >
                <View style={styles.stopIconSquare} />
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          {/* Bottom section - Cancel button */}
          <View style={styles.recordingBottomSection}>
            <TouchableOpacity
              style={styles.cancelButtonContainer}
              onPress={cancelRecording}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={24} color="#E91E63" />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ThemedLayout>
    );
  }

  // Render initial screen with improved layout
  if (recordingStep === 'initial') {
    return (
      <ThemedLayout withBorder={false}>
        <Animated.View 
          style={[
            styles.initialContainer, 
            { opacity: fadeAnim, paddingTop: insets.top }
          ]}
        >
          <View style={styles.initialTopSection}>
            <ThemedText style={styles.formHeading}>Record Audio</ThemedText>
            <ThemedText style={styles.subheading}>Tap the microphone to start recording</ThemedText>
          </View>
          
          <View style={styles.initialMiddleSection}>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={startRecording}
              activeOpacity={0.7}
            >
              <MaterialIcons name="mic" size={40} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.initialBottomSection}>
            {/* Empty view for balanced layout */}
          </View>
        </Animated.View>
      </ThemedLayout>
    );
  }

  // Preview screen with improved design
  if (recordingStep === 'preview') {
    return (
      <ThemedLayout withBorder={false}>
        <Animated.View 
          style={[
            styles.previewScreenContainer, 
            { opacity: fadeAnim, paddingTop: insets.top }
          ]}
        >
          <View style={styles.previewTopSection}>
            <Text style={styles.previewTitle}>Preview Recording</Text>
          </View>
          
          <View style={styles.previewMiddleSection}>
            <View style={styles.previewContainer}>
              <View style={styles.durationContainer}>
                <MaterialIcons name="timer" size={22} color="#1DB954" />
                <Text style={styles.durationText}>
                  {formatTime(recordingDuration)}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.playButton}
                onPress={playRecording}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={isPlaying ? "pause" : "play-arrow"}
                  size={28}
                  color="white" 
                />
                <Text style={styles.buttonText}>
                  {isPlaying ? "Pause" : "Play"}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.previewButtonRow}>
              <TouchableOpacity
                style={styles.discardButton}
                onPress={cancelRecording}
                activeOpacity={0.7}
              >
                <MaterialIcons name="delete" size={20} color="#E91E63" />
                <Text style={styles.discardText}>Discard</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={proceedToSubmit}
                activeOpacity={0.7}
              >
                <MaterialIcons name="save" size={20} color="white" />
                <Text style={styles.saveText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.previewBottomSection}>
            {/* Empty space for balanced layout */}
          </View>
        </Animated.View>
      </ThemedLayout>
    );
  }

  // Submit screen with improved layout and form design
  if (recordingStep === 'submit') {
    return (
      <ThemedLayout withBorder={false}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <Animated.View 
            style={[
              styles.submitContainer, 
              { opacity: fadeAnim, paddingTop: insets.top }
            ]}
          >
            <View style={styles.submitTopSection}>
              <ThemedText style={styles.formHeading}>Save Recording</ThemedText>
            </View>
            
            <View style={styles.submitMiddleSection}>
              <View style={styles.formContainer}>
                {/* Title Input with character counter */}
                <View style={styles.inputWrapper}>
                  <View style={styles.labelContainer}>
                    <MaterialIcons name="title" size={18} color="#1DB954" style={{marginRight: 8}} />
                    <ThemedText style={styles.labelText}>Title</ThemedText>
                  </View>
                  <View style={styles.inputFieldContainer}>
                    <MaterialIcons name="music-note" size={20} color="#1DB954" style={{marginRight: 8}} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Enter a title for your recording"
                      placeholderTextColor="#888"
                      value={title}
                      onChangeText={setTitle}
                      maxLength={50}
                      autoFocus={true}
                      autoCapitalize="sentences"
                      autoComplete="off"
                      autoCorrect={false}
                      returnKeyType="next"
                      keyboardType="default"
                    />
                  </View>
                  <Text style={[
                    styles.characterCount,
                    title.length >= 40 ? {color: '#E91E63'} : {}
                  ]}>
                    {title.length}/50
                  </Text>
                </View>
                
                {/* Description Input with character counter */}
                <View style={styles.inputWrapper}>
                  <View style={styles.labelContainer}>
                    <MaterialIcons name="notes" size={18} color="#1DB954" style={{marginRight: 8}} />
                    <ThemedText style={styles.labelText}>Description (optional)</ThemedText>
                  </View>
                  <View style={[styles.inputFieldContainer, { height: 120, alignItems: 'flex-start', paddingVertical: 12 }]}>
                    <MaterialIcons name="description" size={20} color="#1DB954" style={{marginRight: 8, marginTop: 4}} />
                    <TextInput
                      style={[styles.textInput, { height: '100%', textAlignVertical: 'top' }]}
                      placeholder="Add a description for your recording"
                      placeholderTextColor="#888"
                      value={description}
                      onChangeText={setDescription}
                      multiline
                      maxLength={200}
                      autoCapitalize="sentences"
                      autoComplete="off"
                      autoCorrect={false}
                      returnKeyType="done"
                      keyboardType="default"
                    />
                  </View>
                  <Text style={[
                    styles.characterCount,
                    description.length >= 180 ? {color: '#E91E63'} : {}
                  ]}>
                    {description.length}/200
                  </Text>
                </View>
              
                {/* Action Buttons */}
                <View style={styles.formButtonContainer}>
                  <TouchableOpacity
                    style={styles.cancelFormButton}
                    onPress={cancelRecording}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons name="close" size={22} color="#E91E63" />
                    <Text style={styles.cancelFormText}>Discard</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.saveFormButton,
                      !title.trim() && styles.disabledButton
                    ]}
                    onPress={submitRecording}
                    disabled={isSubmitting || !title.trim()}
                    activeOpacity={0.7}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <MaterialIcons name="check" size={22} color="white" />
                        <Text style={styles.saveFormText}>Save</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <View style={styles.submitBottomSection}>
              {/* Empty space for balanced layout */}
            </View>
          </Animated.View>
        </ScrollView>
      </ThemedLayout>
    );
  }
  
  return null;
}

const styles = StyleSheet.create({
  // ======== GENERAL LAYOUT STYLES ========
  // General container styles
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 200,
  },
  
  // Initial recording screen (improved layout)
  initialContainer: {
    flex: 1,
    padding: 20,
  },
  initialTopSection: {
    flex: 2,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  initialMiddleSection: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialBottomSection: {
    flex: 1,
  },
  
  // Recording screen layout
  recordingContainer: {
    flex: 1,
    padding: 20,
  },
  recordingTopSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingMiddleSection: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingBottomSection: {
    flex: 3,
    alignItems: 'center',
  },
  
  // Preview screen layout
  previewScreenContainer: {
    flex: 1,
    padding: 20,
  },
  previewTopSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  previewMiddleSection: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBottomSection: {
    flex: 1,
  },
  
  // Submit screen layout
  submitContainer: {
    flex: 1,
    padding: 20,
  },
  submitTopSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  submitMiddleSection: {
    flex: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  submitBottomSection: {
    flex: 1,
  },
  
  // ======== TEXT STYLES ========
  heading: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 16,
    color: '#fff',
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  recordingTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 10,
    color: '#fff',
  },
  timerDisplay: {
    fontSize: 52,
    fontWeight: '300',
    color: '#1DB954',
    fontVariant: ['tabular-nums'],
    marginVertical: 10,
  },
  
  // ======== BUTTON STYLES ========
  recordButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  recordButtonRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E91E63',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  stopIconSquare: {
    width: 26,
    height: 26,
    backgroundColor: 'white',
    borderRadius: 3,
  },
  
  // ======== VISUALIZER STYLES ========
  visualizerContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
  },
  outerVisualizer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    width: '90%',
    maxWidth: 340,
  },
  visualizerBar: {
    width: 4,
    height: 15, // Base height for visualization bars
    borderRadius: 4,
    marginHorizontal: 3,
    backgroundColor: '#1DB954',
    transformOrigin: 'bottom', // Make sure scaling happens from bottom
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 25,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    minWidth: 120,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginTop: 20,
  },
  // This is an empty replacement to remove the duplicate style
  submitButton: {
    backgroundColor: '#4caf50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
  previewTitle: {
    fontSize: 32,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'rgba(25, 25, 35, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(30, 185, 84, 0.5)',
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 7,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  durationText: {
    fontSize: 28,
    color: '#E0E0E0',
    fontWeight: '300',
    textAlign: 'center',
    marginLeft: 10,
    fontVariant: ['tabular-nums'],
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 30,
    backgroundColor: '#1DB954',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    minWidth: 150,
  },
  previewButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  discardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 7,
    borderRadius: 25,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#1DB954',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    minWidth: 120,
  },
  discardText: {
    color: '#E91E63',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  saveText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
    maxWidth: 450,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E0E0E0',
  },
  inputFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(30, 185, 84, 0.4)',
    borderRadius: 12,
    backgroundColor: 'rgba(30, 30, 50, 0.6)',
    paddingHorizontal: 12,
    height: 56,
    width: '100%',
  },
  textInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    height: '100%',
  },
  characterCount: {
    alignSelf: 'flex-end',
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
  },
  formButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 30,
  },
  cancelFormButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 25,
    backgroundColor: 'rgba(233, 30, 99, 0.15)',
    minWidth: 120,
  },
  saveFormButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#1DB954',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    minWidth: 120,
  },
  disabledButton: {
    backgroundColor: '#555',
    opacity: 0.7,
  },
  cancelFormText: {
    color: '#E91E63',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  saveFormText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  formHeading: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 16,
    color: '#fff',
    textAlign: 'center',
    paddingTop: 100,
  },
  waveContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  wave: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1DB954',
    opacity: 0.2,
  },
  audioLevelContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: 150,
    height: 50,
    bottom: -60,
  },
  audioLevelBar: {
    width: 10,
    height: 20, // Base height that will be scaled with transform
    backgroundColor: '#1DB954',
    borderRadius: 5,
    marginHorizontal: 2,
    transformOrigin: 'bottom',
  },
  recordingText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    paddingTop: 100,
  },
  oldTimerDisplay: { /* Renamed to avoid duplicate */
    fontSize: 70,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'normal',
    fontWeight: '300',
    color: '#fff',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },
  recordButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  oldButtonRing: { /* Renamed to avoid duplicate */
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  cancelButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 30,
  },
  cancelText: {
    color: '#E91E63',
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '500',
  },
  audioLevelVisualization: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: '100%',
  },
  audioLevelDot: {
    width: 15,
    height: 15,
    borderRadius: 4,
    marginHorizontal: 6,
    backgroundColor: '#1DB954',
  },
  /* Removed duplicate heading/subheading styles */
  timer: {
    fontSize: 48,
    fontVariant: ['tabular-nums'],
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(47, 42, 75, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 185, 84, 0.3)',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
}); 