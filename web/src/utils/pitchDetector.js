/**
 * A class that handles pitch detection using the Web Audio API
 * Uses the YIN algorithm for pitch detection
 */
class PitchDetector {
  constructor(options = {}) {
    this.audioContext = null;
    this.analyser = null;
    this.mediaStreamSource = null;
    this.stream = null;
    this.isListening = false;
    this.callbackFunction = null;
    this.bufferSize = options.bufferSize || 2048;
    this.noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    
    // YIN algorithm parameters
    this.threshold = options.threshold || 0.15;
    
    // Noise handling parameters
    this.silenceThreshold = options.silenceThreshold || 0.01;
    this.consecutiveSilenceFrames = 0;
    this.silenceFramesThreshold = options.silenceFramesThreshold || 3;
    
    // Frequency range limits based on instrument type
    this.minFrequency = options.minFrequency || 20;   // Default minimum
    this.maxFrequency = options.maxFrequency || 4000; // Default maximum
    
    // Instrument settings
    this.instrumentType = options.instrumentType || 'general';
    this.configureForInstrument(this.instrumentType);
    
    // Note history for smoothing
    this.noteHistory = [];
    this.noteHistoryMaxLength = options.noteHistoryLength || 5;
    
    // Browser compatibility flag
    this.isCompatible = this.checkCompatibility();
  }
  
  /**
   * Configure detector parameters for specific instrument types
   * @param {string} instrumentType - Type of instrument being used
   */
  configureForInstrument(instrumentType) {
    switch (instrumentType.toLowerCase()) {
      case 'piano':
        this.minFrequency = 27.5;  // A0
        this.maxFrequency = 4186.0; // C8
        this.threshold = 0.15;
        this.silenceThreshold = 0.008;
        break;
      case 'guitar':
        this.minFrequency = 80;    // E2
        this.maxFrequency = 1200;  // Highest practical guitar note
        this.threshold = 0.15;
        this.silenceThreshold = 0.01;
        break;
      case 'violin':
        this.minFrequency = 196;   // G3
        this.maxFrequency = 2800;  // Highest practical violin note
        this.threshold = 0.14;
        this.silenceThreshold = 0.01;
        break;
      case 'voice':
        this.minFrequency = 80;    // Typical low male voice
        this.maxFrequency = 1100;  // Typical high female voice
        this.threshold = 0.12;     // More sensitive for voice
        this.silenceThreshold = 0.015;
        this.silenceFramesThreshold = 5; // Voice needs more frames to confirm silence
        break;
      case 'bass':
        this.minFrequency = 41;    // E1
        this.maxFrequency = 400;   // Highest practical bass note
        this.threshold = 0.15;
        this.silenceThreshold = 0.012;
        break;
      case 'general':
      default:
        // Default values for general use
        this.minFrequency = 20;
        this.maxFrequency = 4000;
        this.threshold = 0.15;
        this.silenceThreshold = 0.01;
    }
  }
  
  /**
   * Check if the browser supports the Web Audio API
   * @returns {boolean} Whether the browser is compatible
   */
  checkCompatibility() {
    return (
      typeof window !== 'undefined' &&
      (window.AudioContext || window.webkitAudioContext) &&
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia
    );
  }

  /**
   * Start the pitch detector
   * @param {Function} callback - Function to call with pitch data
   * @returns {Promise<boolean>} Whether the pitch detector started successfully
   */
  async start(callback) {
    if (!this.isCompatible) {
      console.error('Browser does not support Web Audio API');
      return false;
    }
    
    if (this.isListening) {
      return true;
    }
    
    try {
      // Initialize Web Audio API
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Create audio nodes
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = this.bufferSize;
      
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(this.stream);
      this.mediaStreamSource.connect(this.analyser);
      
      // Set up callback
      this.callbackFunction = callback;
      
      // Start the detection loop
      this.isListening = true;
      this.noteHistory = [];
      this.detectLoop();
      
      console.log('Pitch detector started');
      return true;
    } catch (error) {
      console.error('Error starting pitch detector:', error);
      this.cleanup();
      throw error;
    }
  }
  
  /**
   * The main detection loop
   */
  detectLoop = () => {
    if (!this.isListening) return;
    
    const frequency = this.detectPitch();
    
    if (frequency > 0) {
      const noteData = this.getNote(frequency);
      
      // Apply note smoothing
      const smoothedNote = this.smoothNote(noteData);
      
      if (this.callbackFunction) {
        this.callbackFunction(smoothedNote);
      }
    } else if (this.callbackFunction) {
      // No pitch detected, reset note history
      this.noteHistory = [];
      this.callbackFunction({ note: 'N/A', octave: -1, frequency: 0, confidence: 0 });
    }
    
    // Continue the loop
    requestAnimationFrame(this.detectLoop);
  }
  
  /**
   * Apply smoothing to note detection to reduce jitter
   * @param {Object} noteData - The detected note data
   * @returns {Object} The smoothed note data
   */
  smoothNote(noteData) {
    if (noteData.confidence < 0.3 || noteData.note === 'N/A') {
      return noteData; // Don't smooth low-confidence or invalid notes
    }
    
    // Add to history
    this.noteHistory.push(noteData);
    
    // Limit history length
    if (this.noteHistory.length > this.noteHistoryMaxLength) {
      this.noteHistory.shift();
    }
    
    // If history is too short, just return the current note
    if (this.noteHistory.length < 3) {
      return noteData;
    }
    
    // Count occurrences of each note
    const noteCounts = {};
    let highestCount = 0;
    let mostFrequentNote = noteData;
    
    this.noteHistory.forEach(note => {
      const noteKey = `${note.note}${note.octave}`;
      noteCounts[noteKey] = (noteCounts[noteKey] || 0) + 1;
      
      if (noteCounts[noteKey] > highestCount) {
        highestCount = noteCounts[noteKey];
        mostFrequentNote = note;
      }
    });
    
    // If the most frequent note is significantly represented, return it
    if (highestCount >= Math.ceil(this.noteHistory.length / 2)) {
      // Calculate average frequency for this note
      const sameNotes = this.noteHistory.filter(
        n => n.note === mostFrequentNote.note && n.octave === mostFrequentNote.octave
      );
      
      const avgFrequency = sameNotes.reduce((sum, n) => sum + n.frequency, 0) / sameNotes.length;
      const avgConfidence = sameNotes.reduce((sum, n) => sum + n.confidence, 0) / sameNotes.length;
      
      return {
        ...mostFrequentNote,
        frequency: avgFrequency,
        confidence: Math.min(avgConfidence * 1.1, 1.0) // Slightly boost confidence for stable notes
      };
    }
    
    // Default to current note if no clear winner
    return noteData;
  }

  /**
   * Get the current frequency from the audio data
   * Uses YIN algorithm for pitch detection
   * @returns {number} The detected frequency
   */
  detectPitch() {
    // Get audio data
    const buffer = new Float32Array(this.bufferSize);
    this.analyser.getFloatTimeDomainData(buffer);
    
    // Check for silence - avoid processing very quiet signals
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sum / buffer.length);
    
    if (rms < this.silenceThreshold) {
      this.consecutiveSilenceFrames++;
      if (this.consecutiveSilenceFrames >= this.silenceFramesThreshold) {
        return -1; // Signal is consistently too quiet, return "no pitch"
      }
    } else {
      this.consecutiveSilenceFrames = 0;
    }
    
    // Apply adaptive noise gate to filter out background noise
    const noiseGateThreshold = Math.max(this.silenceThreshold, rms * 0.2);
    for (let i = 0; i < buffer.length; i++) {
      if (Math.abs(buffer[i]) < noiseGateThreshold) {
        buffer[i] = 0;
      }
    }
    
    // Use YIN algorithm for pitch detection
    const frequency = this.yinPitchDetection(buffer, this.audioContext.sampleRate);
    
    // Apply frequency range limits based on instrument
    if (frequency < this.minFrequency || frequency > this.maxFrequency) {
      return -1;
    }
    
    return frequency;
  }

  /**
   * YIN algorithm implementation for pitch detection
   * @param {Float32Array} buffer - Audio buffer
   * @param {number} sampleRate - Audio sample rate
   * @returns {number} The detected frequency
   */
  yinPitchDetection(buffer, sampleRate) {
    // Difference function
    const yinBuffer = new Float32Array(this.bufferSize / 2);
    let runningSum = 0;
    
    // Step 1: Calculate autocorrelation for each lag
    for (let t = 0; t < yinBuffer.length; t++) {
      yinBuffer[t] = 0;
      
      for (let i = 0; i < yinBuffer.length; i++) {
        const delta = buffer[i] - buffer[i + t];
        yinBuffer[t] += delta * delta;
      }
    }
    
    // Step 2: Cumulative mean normalized difference function
    yinBuffer[0] = 1;
    runningSum = 0;
    
    for (let t = 1; t < yinBuffer.length; t++) {
      runningSum += yinBuffer[t];
      yinBuffer[t] *= t / runningSum;
    }
    
    // Step 3: Find the first local minimum below the threshold
    let minValue = 1000;
    let minTau = -1;
    
    // Start search from a higher index for low frequencies to improve detection
    const startIndex = Math.max(2, Math.floor(sampleRate / this.maxFrequency));
    
    for (let t = startIndex; t < yinBuffer.length; t++) {
      if (yinBuffer[t] < this.threshold) {
        while (t + 1 < yinBuffer.length && yinBuffer[t + 1] < yinBuffer[t]) {
          t++;
        }
        
        // Parabolic interpolation for better frequency accuracy
        const t_interp = this.parabolicInterpolation(yinBuffer, t);
        return sampleRate / t_interp;
      }
      
      if (yinBuffer[t] < minValue) {
        minValue = yinBuffer[t];
        minTau = t;
      }
    }
    
    // If no pitch found but we have a minimum, use it if it's below a higher threshold
    if (minTau > 0 && minValue < 0.3) {
      // Parabolic interpolation for better frequency accuracy
      const t_interp = this.parabolicInterpolation(yinBuffer, minTau);
      return sampleRate / t_interp;
    }
    
    return -1; // No pitch detected
  }
  
  /**
   * Parabolic interpolation to improve frequency accuracy
   * @param {Float32Array} array - The buffer array
   * @param {number} index - The index of the minimum
   * @returns {number} The interpolated minimum position
   */
  parabolicInterpolation(array, index) {
    if (index <= 0 || index >= array.length - 1) {
      return index;
    }
    
    const a = array[index - 1];
    const b = array[index];
    const c = array[index + 1];
    
    const delta = 0.5 * (a - c) / (a - 2*b + c);
    
    return index + delta;
  }

  /**
   * Convert frequency to musical note
   * @param {number} frequency - Frequency in Hz
   * @returns {Object} Object containing note name and octave
   */
  getNote(frequency) {
    if (frequency <= 0) {
      return { note: 'N/A', octave: -1, frequency: 0, confidence: 0 };
    }
    
    // Check for unrealistic frequencies based on configured range
    if (frequency < this.minFrequency || frequency > this.maxFrequency) {
      return { note: 'N/A', octave: -1, frequency: frequency, confidence: 0 };
    }
    
    // A4 is 440Hz, which is note number 69 on the MIDI scale
    const noteNumber = 12 * (Math.log(frequency / 440) / Math.log(2)) + 69;
    const note = Math.round(noteNumber);
    
    // Calculate how far we are from the closest note (in cents)
    const cents = Math.floor((noteNumber - note) * 100);
    
    // Calculate the octave and note name
    const octave = Math.floor((note - 12) / 12);
    const noteName = this.noteStrings[note % 12];
    
    // More refined confidence calculation
    // Closer to 0 cents = higher confidence
    const centConfidence = 1 - (Math.abs(cents) / 50);
    
    // Calculate frequency accuracy - how close we are to the ideal frequency of this note
    const idealFrequency = 440 * Math.pow(2, (note - 69) / 12);
    const frequencyDifference = Math.abs(frequency - idealFrequency) / idealFrequency;
    const frequencyConfidence = 1 - Math.min(1, frequencyDifference * 10);
    
    // If we're more than 30 cents off, reduce confidence significantly
    const confidence = Math.abs(cents) > 30 
      ? centConfidence * 0.7 
      : (centConfidence * 0.7 + frequencyConfidence * 0.3);
    
    return {
      note: noteName,
      octave: octave,
      frequency: Math.round(frequency * 100) / 100,
      cents: cents,
      confidence: Math.round(confidence * 100) / 100,
      idealFrequency: Math.round(idealFrequency * 100) / 100
    };
  }

  /**
   * Stop the pitch detector
   */
  stop() {
    this.isListening = false;
    
    // Stop microphone stream
    if (this.stream) {
      const tracks = this.stream.getTracks();
      tracks.forEach(track => track.stop());
      this.stream = null;
    }
    
    // Disconnect audio nodes
    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
      this.mediaStreamSource = null;
    }
    
    console.log('Pitch detector stopped');
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.stop();
    
    if (this.audioContext) {
      this.audioContext.close().catch(err => console.error('Error closing audio context:', err));
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.noteHistory = [];
  }
  
  /**
   * Set the instrument type to optimize detection parameters
   * @param {string} instrumentType - Type of instrument (piano, guitar, violin, voice, bass, general)
   */
  setInstrumentType(instrumentType) {
    this.instrumentType = instrumentType;
    this.configureForInstrument(instrumentType);
    console.log(`Configured for instrument: ${instrumentType}`);
  }
}

export default PitchDetector; 