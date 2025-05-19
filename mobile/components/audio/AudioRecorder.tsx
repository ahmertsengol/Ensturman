import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Alert, TextInput, Animated, Easing } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedLayout } from '@/components/ThemedLayout';
import AudioRecorder from '@/utils/AudioRecorder';
import { uploadAudio } from '@/api/api';

// Define PlaybackStatus interface
interface PlaybackStatus {
  isLoaded: boolean;
  didJustFinish?: boolean;
  [key: string]: any;
}

export default function AudioRecorderComponent() {
  const [recorder] = useState(new AudioRecorder());
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingStep, setRecordingStep] = useState<'initial' | 'recording' | 'preview' | 'submit'>('initial');
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Animation references
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;
  const waveAnim3 = useRef(new Animated.Value(0)).current;
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const router = useRouter();
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (soundRef.current) soundRef.current.unloadAsync();
      if (recorder.isRecording()) recorder.cancelRecording();
    };
  }, []);
  
  // Animation effects when recording
  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation;
    let waveAnimation: Animated.CompositeAnimation;
    let waveAnimation2: Animated.CompositeAnimation;
    let waveAnimation3: Animated.CompositeAnimation;
    
    if (isRecording) {
      // Pulsating microphone animation
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      
      // Wave animations with different timings for natural effect
      waveAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 0,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      
      waveAnimation2 = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim2, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim2, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      
      waveAnimation3 = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim3, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim3, {
            toValue: 0,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      
      // Start all animations
      pulseAnimation.start();
      waveAnimation.start();
      
      // Stagger the start of wave animations for more natural effect
      setTimeout(() => waveAnimation2.start(), 200);
      setTimeout(() => waveAnimation3.start(), 400);
    } else {
      // Reset animations when not recording
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
      waveAnim2.setValue(0);
      waveAnim3.setValue(0);
    }
    
    // Clean up animations on state change
    return () => {
      if (pulseAnimation) pulseAnimation.stop();
      if (waveAnimation) waveAnimation.stop();
      if (waveAnimation2) waveAnimation2.stop();
      if (waveAnimation3) waveAnimation3.stop();
    };
  }, [isRecording]);
  
  // Format time display (00:00)
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Start recording
  const startRecording = async () => {
    try {
      await recorder.startRecording();
      setIsRecording(true);
      setRecordingStep('recording');
      setRecordingDuration(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        const duration = recorder.getCurrentDuration();
        setRecordingDuration(duration);
      }, 100);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert(
        'Microphone Error',
        'Could not access microphone. Please check permissions.'
      );
    }
  };
  
  // Stop recording
  const stopRecording = async () => {
    try {
      const uri = await recorder.stopRecording();
      setIsRecording(false);
      setAudioUri(uri);
      setRecordingStep('preview');
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      
      Alert.alert(
        'Recording Error',
        'There was a problem with the recording.'
      );
    }
  };
  
  // Play recorded audio
  const playRecording = async () => {
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
  };
  
  // Cancel recording
  const cancelRecording = async () => {
    try {
      // If currently recording, cancel it
      if (isRecording) {
        await recorder.cancelRecording();
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
  };
  
  // Continue to submission step
  const proceedToSubmit = () => {
    setRecordingStep('submit');
  };
  
  // Wave animation component
  const RecordingWaves = () => (
    <View style={styles.waveContainer}>
      <Animated.View 
        style={[
          styles.wave, 
          { 
            opacity: waveAnim,
            transform: [
              { scaleX: Animated.add(1, Animated.multiply(waveAnim, 0.4)) },
              { scaleY: Animated.add(1, Animated.multiply(waveAnim, 0.4)) }
            ] 
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.wave, 
          { 
            opacity: waveAnim2,
            transform: [
              { scaleX: Animated.add(1, Animated.multiply(waveAnim2, 0.7)) },
              { scaleY: Animated.add(1, Animated.multiply(waveAnim2, 0.7)) }
            ] 
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.wave, 
          { 
            opacity: waveAnim3,
            transform: [
              { scaleX: Animated.add(1, Animated.multiply(waveAnim3, 1)) },
              { scaleY: Animated.add(1, Animated.multiply(waveAnim3, 1)) }
            ] 
          }
        ]} 
      />
    </View>
  );
  
  // Submit recording with metadata
  const submitRecording = async () => {
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
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      
      // Create form data
      const formData = new FormData();
      
      // Determine file extension and mime type
      // Extract extension from the file URI
      const extension = audioUri.split('.').pop()?.toLowerCase() || 'm4a';
      
      // Map extension to appropriate MIME type for better cross-platform compatibility
      let mimeType;
      switch (extension) {
        case 'mp3':
          mimeType = 'audio/mpeg';
          break;
        case 'm4a':
          mimeType = 'audio/aac';
          break;
        case 'aac':
          mimeType = 'audio/aac';
          break;
        case 'wav':
          mimeType = 'audio/wav';
          break;
        case 'webm':
          mimeType = 'audio/webm';
          break;
        default:
          // Default to audio/aac for iOS recorded files
          mimeType = 'audio/aac';
      }
      
      console.log(`Uploading audio file with extension: ${extension}, MIME type: ${mimeType}`);
      
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
  };
  
  // Render based on current step
  if (recordingStep === 'initial') {
    return (
      <ThemedLayout>
        <View style={styles.container}>
          <ThemedText style={styles.heading}>Record Audio</ThemedText>
          <ThemedText style={styles.subheading}>Tap the microphone to start recording</ThemedText>
          
          <TouchableOpacity
            style={styles.recordButton}
            onPress={startRecording}
          >
            <MaterialIcons name="mic" size={40} color="white" />
          </TouchableOpacity>
        </View>
      </ThemedLayout>
    );
  }
  
  if (recordingStep === 'recording') {
    return (
      <ThemedLayout>
        <View style={styles.container}>
          <ThemedText style={styles.heading}>Recording...</ThemedText>
          <ThemedText style={styles.timer}>{formatTime(recordingDuration)}</ThemedText>
          
          {/* Animated recording wave effect */}
          <RecordingWaves />
          
          <Animated.View style={{
            transform: [{ scale: pulseAnim }]
          }}>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={stopRecording}
            >
              <MaterialIcons name="stop" size={40} color="white" />
            </TouchableOpacity>
          </Animated.View>
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={cancelRecording}
          >
            <MaterialIcons name="close" size={24} color="#E91E63" />
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedLayout>
    );
  }
  
  if (recordingStep === 'preview') {
    return (
      <ThemedLayout>
        <View style={styles.container}>
          <ThemedText style={styles.heading}>Preview Recording</ThemedText>
          
          <View style={styles.previewContainer}>
            <ThemedText style={styles.durationText}>
              Duration: {formatTime(recordingDuration)}
            </ThemedText>
            
            <TouchableOpacity
              style={styles.playButton}
              onPress={playRecording}
            >
              <MaterialIcons
                name={isPlaying ? "pause" : "play-arrow"}
                size={36}
                color="white" 
              />
              <Text style={styles.buttonText}>
                {isPlaying ? "Pause" : "Play"}
              </Text>
            </TouchableOpacity>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: 'rgba(47, 42, 75, 0.8)' }]}
              onPress={cancelRecording}
            >
                <MaterialIcons name="delete" size={24} color="#E91E63" />
              <Text style={[styles.buttonText, { color: '#E91E63' }]}>Discard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#1DB954' }]}
              onPress={proceedToSubmit}
            >
                <MaterialIcons name="save" size={24} color="white" />
                <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </ThemedLayout>
    );
  }
  
  if (recordingStep === 'submit') {
    return (
      <ThemedLayout>
        <View style={styles.container}>
          <ThemedText style={styles.heading}>Save Recording</ThemedText>
          
          <View style={styles.inputContainer}>
            <ThemedText>Title</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter a title for your recording"
              placeholderTextColor="#A0AEC0"
              value={title}
              onChangeText={setTitle}
            />
          </View>
            
          <View style={styles.inputContainer}>
            <ThemedText>Description (optional)</ThemedText>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Add a description"
              placeholderTextColor="#A0AEC0"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: 'rgba(47, 42, 75, 0.8)' }]}
              onPress={cancelRecording}
              >
              <MaterialIcons name="close" size={24} color="#E91E63" />
              <Text style={[styles.buttonText, { color: '#E91E63' }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#1DB954' }]}
                onPress={submitRecording}
                disabled={isSubmitting}
              >
              <MaterialIcons name="check" size={24} color="white" />
              <Text style={styles.buttonText}>
                {isSubmitting ? "Saving..." : "Submit"}
              </Text>
              </TouchableOpacity>
          </View>
          
          {isSubmitting && (
            <ActivityIndicator 
              size="large" 
              color="#1DB954" 
              style={{ marginTop: 20 }} 
            />
          )}
        </View>
      </ThemedLayout>
    );
  }
  
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 30,
    textAlign: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  timerText: {
    fontSize: 48,
    fontVariant: ['tabular-nums'],
    marginBottom: 20,
  },
  recordingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1DB954',
    opacity: 0.8,
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
  stopButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E91E63',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: '#4caf50',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },
  previewContainer: {
    alignItems: 'center',
    marginVertical: 30,
    padding: 20,
    backgroundColor: 'rgba(47, 42, 75, 0.8)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 185, 84, 0.3)',
    width: '100%',
    maxWidth: 500,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 40,
    backgroundColor: '#1DB954',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    minWidth: 150,
  },
  durationText: {
    fontSize: 18,
    marginVertical: 20,
    color: '#E0E0E0',
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(30, 185, 84, 0.3)',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    fontSize: 16,
    backgroundColor: 'rgba(30, 30, 50, 0.6)',
    color: '#E0E0E0',
    fontWeight: '500',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
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
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#E0E0E0',
  },
  subheading: {
    marginBottom: 30,
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 16,
    color: '#A0AEC0',
    lineHeight: 22,
  },
  timer: {
    fontSize: 48,
    fontVariant: ['tabular-nums'],
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#E0E0E0',
  },
  cancelText: {
    color: '#E91E63',
    marginLeft: 8,
    fontSize: 16,
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