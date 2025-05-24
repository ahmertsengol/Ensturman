import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Define RecordingStatus interface
interface RecordingStatus {
  isRecording: boolean;
  durationMillis: number;
  metering?: number; // Audio level for visualization
  [key: string]: any;
}

/**
 * Platform-optimized audio recorder with enhanced quality settings
 */
export class AudioRecorder {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private isRecording: boolean = false;
  private isPlaying: boolean = false;
  private recordingUri: string | null = null;
  private recordingDuration: number = 0;
  private onRecordingStatusUpdate?: (status: any) => void;

  constructor() {
    this.initializeAudioMode();
  }

  /**
   * Initialize audio mode with optimal settings
   */
  private async initializeAudioMode(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
      console.log('✅ Audio mode initialized');
    } catch (error) {
      console.error('❌ Failed to initialize audio mode:', error);
    }
  }

  /**
   * Get platform-optimized recording options
   */
  private getRecordingOptions(): Audio.RecordingOptions {
    const baseOptions: Audio.RecordingOptions = {
      isMeteringEnabled: true,
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
    };

    if (Platform.OS === 'ios') {
      return {
        ...baseOptions,
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1, // Mono for smaller file size
          bitRate: 128000, // High quality bitrate
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };
    } else {
      // Android
      return {
        ...baseOptions,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1, // Mono for smaller file size
          bitRate: 128000, // High quality bitrate
        },
      };
    }
  }

  /**
   * Check and request audio permissions
   */
  async requestPermissions(): Promise<{ granted: boolean; canAskAgain: boolean; error?: string }> {
    try {
      console.log('🎤 Requesting audio permissions...');
      
      const permission = await Audio.requestPermissionsAsync();
      
      if (permission.status === 'granted') {
        console.log('✅ Audio permission granted');
        return { granted: true, canAskAgain: true };
      } else {
        const errorMessage = permission.status === 'denied' 
          ? 'Audio permission denied by user'
          : `Audio permission status: ${permission.status}`;
        
        console.error('❌ Audio permission not granted:', errorMessage);
        return { 
          granted: false, 
          canAskAgain: permission.canAskAgain,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return { 
        granted: false, 
        canAskAgain: true, 
        error: error instanceof Error ? error.message : 'Unknown permission error'
      };
    }
  }

  /**
   * Start recording with optimized settings
   */
  async startRecording(onStatusUpdate?: (status: any) => void): Promise<{ success: boolean; error?: string }> {
    try {
      if (this.isRecording) {
        return { success: false, error: 'Recording already in progress' };
      }

      // Request permissions first
      const permissionResult = await this.requestPermissions();
      if (!permissionResult.granted) {
        return { 
          success: false, 
          error: permissionResult.error || 'Audio permission required'
        };
      }

      // Prepare new recording
      console.log('🎤 Starting audio recording...');
      this.recording = new Audio.Recording();
      this.onRecordingStatusUpdate = onStatusUpdate;

      const options = this.getRecordingOptions();
      
      await this.recording.prepareToRecordAsync(options);
      
      // Set up status updates
      this.recording.setOnRecordingStatusUpdate((status) => {
        this.recordingDuration = status.durationMillis || 0;
        if (this.onRecordingStatusUpdate) {
          this.onRecordingStatusUpdate(status);
        }
      });

      await this.recording.startAsync();
      this.isRecording = true;
      
      console.log('✅ Recording started successfully');
      console.log('📊 Recording options:', JSON.stringify(options, null, 2));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      
      // Clean up on error
      if (this.recording) {
        try {
          await this.recording.stopAndUnloadAsync();
        } catch (cleanupError) {
          console.error('❌ Error during cleanup:', cleanupError);
        }
        this.recording = null;
      }
      
      this.isRecording = false;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown recording error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Stop recording and get result
   */
  async stopRecording(): Promise<{ 
    success: boolean; 
    uri?: string; 
    duration?: number;
    fileSize?: number;
    error?: string;
  }> {
    try {
      if (!this.isRecording || !this.recording) {
        return { success: false, error: 'No active recording to stop' };
      }

      console.log('⏹️ Stopping recording...');
      
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      this.isRecording = false;
      this.recordingUri = uri;
      this.recording = null;
      
      if (!uri) {
        return { success: false, error: 'Recording URI not available' };
      }

      // Get file info for validation
      let fileSize: number | undefined;
      try {
        const fileInfo = await fetch(uri, { method: 'HEAD' });
        const contentLength = fileInfo.headers.get('content-length');
        if (contentLength) {
          fileSize = parseInt(contentLength, 10);
        }
      } catch (infoError) {
        console.warn('⚠️ Could not get file size:', infoError);
      }

      console.log('✅ Recording stopped successfully');
      console.log('📁 Recording URI:', uri);
      console.log('⏱️ Duration:', this.recordingDuration, 'ms');
      if (fileSize) {
        console.log('📊 File size:', fileSize, 'bytes');
      }
      
      return { 
        success: true, 
        uri, 
        duration: this.recordingDuration,
        fileSize
      };
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      
      // Clean up on error
      this.isRecording = false;
      this.recording = null;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown stop recording error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Play recorded audio
   */
  async playRecording(uri?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const audioUri = uri || this.recordingUri;
      
      if (!audioUri) {
        return { success: false, error: 'No recording available to play' };
      }

      if (this.isPlaying) {
        await this.stopPlayback();
      }

      console.log('▶️ Playing recording:', audioUri);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      
      this.sound = sound;
      this.isPlaying = true;
      
      // Set up playback completion handler
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.isPlaying = false;
          console.log('✅ Playback completed');
        }
      });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to play recording:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown playback error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Stop audio playback
   */
  async stopPlayback(): Promise<void> {
    try {
      if (this.sound) {
        console.log('⏹️ Stopping playback...');
        await this.sound.unloadAsync();
        this.sound = null;
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('❌ Error stopping playback:', error);
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 Cleaning up audio resources...');
      
      if (this.isRecording && this.recording) {
        await this.recording.stopAndUnloadAsync();
      }
      
      if (this.sound) {
        await this.sound.unloadAsync();
      }
      
      this.recording = null;
      this.sound = null;
      this.isRecording = false;
      this.isPlaying = false;
      this.recordingUri = null;
      this.recordingDuration = 0;
      
      console.log('✅ Audio cleanup completed');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }

  // Getters
  get isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  get isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  get currentRecordingUri(): string | null {
    return this.recordingUri;
  }

  get currentDuration(): number {
    return this.recordingDuration;
  }

  /**
   * Get detailed recording information
   */
  getRecordingInfo(): {
    isRecording: boolean;
    isPlaying: boolean;
    uri: string | null;
    duration: number;
    platform: string;
  } {
    return {
      isRecording: this.isRecording,
      isPlaying: this.isPlaying,
      uri: this.recordingUri,
      duration: this.recordingDuration,
      platform: Platform.OS,
    };
  }
}

export default AudioRecorder; 