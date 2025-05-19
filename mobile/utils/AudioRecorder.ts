import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// Define RecordingStatus interface
interface RecordingStatus {
  isRecording: boolean;
  durationMillis: number;
  metering?: number; // Audio level for visualization
  [key: string]: any;
}

/**
 * Class to handle audio recording functionality for mobile
 */
class AudioRecorder {
  recording: Audio.Recording | null;
  recordingURI: string | null;
  recordingStatus: RecordingStatus | null;
  audioLevel: number;

  constructor() {
    this.recording = null;
    this.recordingURI = null;
    this.recordingStatus = null;
    this.audioLevel = 0;
  }

  /**
   * Initialize audio recording permissions and settings
   */
  async init() {
    try {
      // Request audio recording permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Audio recording permission not granted');
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log('Audio recorder initialized');
    } catch (error) {
      console.error('Error initializing audio recorder:', error);
      throw error;
    }
  }

  /**
   * Start recording audio
   * @returns {Promise<void>}
   */
  async startRecording() {
    try {
      // Initialize first
      await this.init();

      // Create and prepare recording object
      this.recording = new Audio.Recording();
      
      // Create recording options with high quality preset
      await this.recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      
      // Start recording
      await this.recording.startAsync();
      console.log('Recording started');

      // Setup recording status updates
      this.recording.setOnRecordingStatusUpdate((status: RecordingStatus) => {
        this.recordingStatus = status;
        
        // Since the metering might not be available in all Expo versions,
        // simulate audio levels for visualization
        if (this.isRecording()) {
          // Use a dynamic simulation for audio levels
          // More natural than fixed random values - fluctuates based on duration
          const duration = status.durationMillis || 0;
          // Create a wave pattern using sine and time
          const base = Math.sin(duration / 400) * 0.3 + 0.5; // Value between 0.2 and 0.8
          // Add some randomness
          const random = Math.random() * 0.3 - 0.15; // -0.15 to +0.15
          this.audioLevel = Math.max(0.2, Math.min(1, base + random));
        } else {
          this.audioLevel = 0;
        }
      });
      await this.recording.setProgressUpdateInterval(100);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and get the audio file
   * @returns {Promise<string>} The file URI of the recording
   */
  async stopRecording() {
    try {
      if (!this.recording) {
        throw new Error('No active recording');
      }

      // Stop recording
      await this.recording.stopAndUnloadAsync();
      
      // Get the recording URI
      const uri = this.recording.getURI();
      if (!uri) {
        throw new Error('Recording URI not found');
      }
      
      this.recordingURI = uri;
      console.log('Recording stopped:', uri);
      
      // Reset recording object
      this.recording = null;
      this.audioLevel = 0;
      
      return uri;
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }

  /**
   * Cancel recording without saving
   */
  async cancelRecording() {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
        console.log('Recording cancelled');
      }
      
      // Delete the file if it exists
      if (this.recordingURI) {
        await FileSystem.deleteAsync(this.recordingURI, { idempotent: true });
        this.recordingURI = null;
      }
      
      this.audioLevel = 0;
    } catch (error) {
      console.error('Error cancelling recording:', error);
    }
  }

  /**
   * Get current duration of recording
   * @returns {number} Current duration in milliseconds
   */
  getCurrentDuration() {
    return this.recordingStatus?.durationMillis || 0;
  }

  /**
   * Get current audio level for visualization
   * @returns {number} Audio level from 0-1
   */
  getAudioLevel() {
    return this.audioLevel;
  }

  /**
   * Check if currently recording
   * @returns {boolean}
   */
  isRecording() {
    return this.recording !== null;
  }
}

export default AudioRecorder; 