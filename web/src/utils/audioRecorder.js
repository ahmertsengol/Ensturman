/**
 * Enhanced Audio Recorder Class with better browser compatibility
 */
class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.isRecording = false;
    this.supportedMimeType = null;
    this.checkBrowserSupport();
  }

  /**
   * Check browser support and determine best MIME type
   */
  checkBrowserSupport() {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('getUserMedia is not supported in this browser');
    }

    // Check if MediaRecorder is supported
    if (!window.MediaRecorder) {
      throw new Error('MediaRecorder is not supported in this browser');
    }

    // Determine best supported MIME type in priority order
    const mimeTypes = [
      'audio/mp4; codecs="mp4a.40.2"', // AAC-LC in MP4 container (mobile compatible)
      'audio/mp4',                      // M4A format (mobile compatible)
      'audio/aac',                      // AAC format (mobile compatible)
      'audio/mp4;codecs="mp4a.40.2"',   // Alternative syntax for AAC-LC
      'audio/webm;codecs=opus',         // WebM with Opus (fallback)
      'audio/webm',                     // Plain WebM (last resort)
      'audio/ogg;codecs=opus',          // Firefox preference (not mobile compatible)
      'audio/mpeg',                     // MP3 (rarely supported for recording)
      ''                                // Let browser decide
    ];

    console.log('🔍 Testing browser MIME type support:');
    
    // Test all MIME types and log results
    mimeTypes.forEach(mimeType => {
      const isSupported = MediaRecorder.isTypeSupported(mimeType);
      const displayName = mimeType || 'browser default';
      console.log(`${isSupported ? '✅' : '❌'} ${displayName}: ${isSupported ? 'SUPPORTED' : 'NOT SUPPORTED'}`);
    });

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        this.supportedMimeType = mimeType;
        console.log(`🎯 SELECTED MIME type: ${mimeType}`);
        console.log(`🎵 Expected file format: ${this.getExpectedFormat(mimeType)}`);
        
        // Check mobile compatibility
        this.checkMobileCompatibility(mimeType);
        
        break;
      }
    }

    if (!this.supportedMimeType && mimeTypes[mimeTypes.length - 1] === '') {
      this.supportedMimeType = ''; // Let browser use default
      console.log('⚠️ Using browser default MIME type');
    }
  }

  /**
   * Get expected file format from MIME type
   */
  getExpectedFormat(mimeType) {
    if (mimeType.includes('mp4')) return '.m4a';
    if (mimeType.includes('aac')) return '.aac';
    if (mimeType.includes('webm')) return '.webm';
    if (mimeType.includes('ogg')) return '.ogg';
    if (mimeType.includes('mpeg')) return '.mp3';
    return '.unknown';
  }

  /**
   * Check mobile compatibility of selected MIME type
   */
  checkMobileCompatibility(mimeType) {
    const mobileCompatible = [
      'audio/mp4',
      'audio/aac',
      'audio/mpeg'
    ];
    
    const isCompatible = mobileCompatible.some(compatible => 
      mimeType.includes(compatible.split(';')[0])
    );
    
    console.log(`📱 Mobile compatibility check:`, {
      mimeType,
      isCompatible,
      reason: isCompatible ? 'Uses mobile-compatible codec' : 'May not play on mobile devices'
    });
    
    return isCompatible;
  }

  /**
   * Get browser-specific error messages
   */
  getErrorMessage(error) {
    const errorMessages = {
      'NotAllowedError': 'Microphone access denied. Please allow microphone permissions and refresh the page.',
      'NotFoundError': 'No microphone found. Please connect a microphone and try again.',
      'NotReadableError': 'Microphone is already in use by another application.',
      'OverconstrainedError': 'No microphone meets the required constraints.',
      'SecurityError': 'Microphone access blocked due to security settings.',
      'AbortError': 'Recording was aborted unexpectedly.',
      'TypeError': 'Browser does not support audio recording.',
      'NotSupportedError': 'Audio recording is not supported in this browser.'
    };

    return errorMessages[error.name] || `Recording error: ${error.message}`;
  }

  /**
   * Start recording audio with enhanced error handling
   * @returns {Promise<void>}
   */
  async startRecording() {
    try {
      // Check browser support first
      this.checkBrowserSupport();

      // Request microphone access with specific constraints
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1, // Mono like mobile
          // Additional mobile-compatible settings
          latency: 0.2,
          volume: 1.0
        }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Create media recorder with mobile-compatible settings
      const options = {
        audioBitsPerSecond: 128000, // Same as mobile: 128 kbps
        bitsPerSecond: 128000       // Some browsers need this too
      };

      // Force the most mobile-compatible MIME type
      if (this.supportedMimeType) {
        options.mimeType = this.supportedMimeType;
        
        // Add codec specification for better mobile compatibility
        if (this.supportedMimeType.includes('mp4')) {
          // Try to force AAC codec like mobile
          options.mimeType = 'audio/mp4; codecs="mp4a.40.2"'; // AAC-LC
        }
      }

      console.log('🎯 Using MediaRecorder options for mobile compatibility:', options);

      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.audioChunks = [];
      
      // Handle data availability
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Handle errors during recording
      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        throw new Error(`Recording failed: ${event.error.message}`);
      };
      
      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second
      this.isRecording = true;
      
      console.log('✅ Recording started successfully', {
        mimeType: this.supportedMimeType || 'browser default',
        sampleRate: constraints.audio.sampleRate,
        audioBitsPerSecond: options.audioBitsPerSecond
      });
      
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      
      // Clean up on error
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
      }
      
      // Throw enhanced error message
      const enhancedError = new Error(this.getErrorMessage(error));
      enhancedError.originalError = error;
      throw enhancedError;
    }
  }

  /**
   * Stop recording and get the audio blob with enhanced error handling
   * @returns {Promise<Blob>} The recorded audio blob
   */
  stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording found'));
        return;
      }

      if (this.mediaRecorder.state === 'inactive') {
        reject(new Error('Recording is already stopped'));
        return;
      }

      // Handle recording stop
      this.mediaRecorder.onstop = async () => {
        try {
          // Determine output MIME type
          const outputMimeType = this.mediaRecorder.mimeType || this.supportedMimeType || 'audio/webm';
          
          console.log('🛑 Recording stopped - MIME type analysis:');
          console.log(`📋 MediaRecorder.mimeType: ${this.mediaRecorder.mimeType}`);
          console.log(`📋 this.supportedMimeType: ${this.supportedMimeType}`);
          console.log(`📋 Final outputMimeType: ${outputMimeType}`);
          console.log(`📁 Expected file extension: ${this.getExpectedFormat(outputMimeType)}`);
          
          // Check final mobile compatibility
          const isMobileCompatible = this.checkMobileCompatibility(outputMimeType);
          if (!isMobileCompatible) {
            console.warn('⚠️ WARNING: This format may not play on mobile devices!');
            console.warn('💡 Consider using a browser that supports MP4/AAC recording');
          }
          
          // Create audio blob from chunks
          const audioBlob = new Blob(this.audioChunks, { type: outputMimeType });
          
          // Validate blob
          if (audioBlob.size === 0) {
            throw new Error('Recording is empty. Please try recording again.');
          }

          // Stop all media tracks
          if (this.stream) {
            this.stream.getTracks().forEach(track => {
              track.stop();
              console.log('🛑 Media track stopped:', track.kind);
            });
            this.stream = null;
          }
          
          this.isRecording = false;
          
          console.log('✅ Recording stopped successfully', {
            format: outputMimeType,
            size: `${(audioBlob.size / 1024).toFixed(2)} KB`,
            chunks: this.audioChunks.length
          });
          
          resolve(audioBlob);
          
        } catch (error) {
          console.error('❌ Error processing recording:', error);
          reject(new Error(`Failed to process recording: ${error.message}`));
        }
      };

      // Handle stop errors
      this.mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder stop error:', event.error);
        reject(new Error(`Failed to stop recording: ${event.error.message}`));
      };

      try {
        // Stop recording
        this.mediaRecorder.stop();
      } catch (error) {
        console.error('❌ Error stopping MediaRecorder:', error);
        reject(new Error(`Failed to stop recording: ${error.message}`));
      }
    });
  }

  /**
   * Cancel recording without saving - enhanced cleanup
   */
  cancelRecording() {
    console.log('🚮 Cancelling recording...');
    
    try {
      if (this.mediaRecorder && this.isRecording) {
        // Stop media recorder safely
        if (this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
        }
      }
      
      // Stop all media tracks
      if (this.stream) {
        this.stream.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 Track stopped during cancel:', track.kind);
        });
        this.stream = null;
      }
      
      // Clear data
      this.isRecording = false;
      this.audioChunks = [];
      this.mediaRecorder = null;
      
      console.log('✅ Recording cancelled successfully');
      
    } catch (error) {
      console.error('⚠️ Error during recording cancellation:', error);
      // Force cleanup even if error occurs
      this.isRecording = false;
      this.audioChunks = [];
      this.stream = null;
      this.mediaRecorder = null;
    }
  }

  /**
   * Check if recording is currently active
   * @returns {boolean}
   */
  isCurrentlyRecording() {
    return this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'recording';
  }

  /**
   * Get current recording state info
   * @returns {object}
   */
  getRecordingState() {
    return {
      isRecording: this.isRecording,
      mediaRecorderState: this.mediaRecorder?.state || 'inactive',
      hasStream: !!this.stream,
      chunksCount: this.audioChunks.length,
      supportedMimeType: this.supportedMimeType
    };
  }
}

export default AudioRecorder;