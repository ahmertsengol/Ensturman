/**
 * Class to handle audio recording functionality
 */
class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.isRecording = false;
  }

  /**
   * Start recording audio
   * @returns {Promise<void>}
   */
  async startRecording() {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder with compatible format (audio/mpeg for MP3)
      // Not all browsers support MP3 recording directly, so we use available options
      const mimeTypes = [
        'audio/mp3',           // MP3 - most compatible with mobile format
        'audio/mpeg',          // MP3 alternative MIME
        'audio/aac',           // AAC - also compatible with iOS
        'audio/webm;codecs=mp3', // WebM container with MP3 codec
        'audio/webm'           // WebM - fallback
      ];
      
      // Find the first supported MIME type
      let mimeType = 'audio/webm'; // Default fallback
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      console.log(`Using MIME type: ${mimeType} for recording`);
      
      // Create media recorder with the supported MIME type
      this.mediaRecorder = new MediaRecorder(this.stream, { 
        mimeType,
        audioBitsPerSecond: 128000 // 128 kbps - standard audio quality
      });
      
      this.audioChunks = [];
      
      // Handle data availability
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      // Start recording
      this.mediaRecorder.start();
      this.isRecording = true;
      
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * Stop recording and get the audio blob
   * @returns {Promise<Blob>} The recorded audio blob
   */
  stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      // Handle recording stop
      this.mediaRecorder.onstop = async () => {
        // Determine best mime type for output based on what we recorded
        const outputMimeType = this.mediaRecorder.mimeType || 'audio/mpeg';
        
        // Create audio blob from chunks
        const audioBlob = new Blob(this.audioChunks, { type: outputMimeType });
        
        // Stop all media tracks
        this.stream.getTracks().forEach(track => track.stop());
        
        this.isRecording = false;
        console.log('Recording stopped, format:', outputMimeType);
        
        resolve(audioBlob);
      };

      // Stop recording
      this.mediaRecorder.stop();
    });
  }

  /**
   * Cancel recording without saving
   */
  cancelRecording() {
    if (this.mediaRecorder && this.isRecording) {
      // Stop media recorder
      this.mediaRecorder.stop();
      
      // Stop all media tracks
      this.stream.getTracks().forEach(track => track.stop());
      
      this.isRecording = false;
      this.audioChunks = [];
      console.log('Recording cancelled');
    }
  }
}

export default AudioRecorder; 