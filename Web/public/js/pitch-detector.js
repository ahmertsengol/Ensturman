// public/js/pitch-detector.js - Real-time pitch detection implementation
class PitchDetector {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.isAnalyzing = false;
    this.detectedNotes = [];
    this.buffer = new Float32Array(2048);
    this.noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    this.debugMode = true; // Enable debug mode
    this.availableMicrophones = []; // Store available microphones
    this.selectedDeviceId = null; // Store selected microphone ID
  }

  // List available microphones and add them to the dropdown
  async listMicrophones() {
    try {
      // First get permission to access audio devices
      console.log("Requesting temporary microphone access for listing devices...");
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop temporary stream
      tempStream.getTracks().forEach(track => track.stop());
      
      // Now we can get all devices (with labels since we have permission)
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableMicrophones = devices.filter(device => device.kind === 'audioinput');
      
      console.log("Available microphones:", this.availableMicrophones);
      
      // Add microphone list to dropdown
      const microphoneSelect = document.getElementById('microphone-select');
      if (!microphoneSelect) {
        console.error("Microphone select dropdown not found in DOM");
        return false;
      }
      
      // Clear dropdown
      microphoneSelect.innerHTML = '';
      
      // Add an option for each microphone
      this.availableMicrophones.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Microphone ${index + 1}`;
        microphoneSelect.appendChild(option);
      });
      
      // Select first microphone as default
      if (this.availableMicrophones.length > 0) {
        this.selectedDeviceId = this.availableMicrophones[0].deviceId;
        microphoneSelect.value = this.selectedDeviceId;
      }
      
      // Add event listener for microphone change
      microphoneSelect.addEventListener('change', (e) => {
        this.selectedDeviceId = e.target.value;
        console.log("Selected microphone changed to:", this.selectedDeviceId);
        
        // If analysis is in progress, continue with the new microphone
        if (this.isAnalyzing) {
          this.stopAnalysis();
          this.initialize().then(() => {
            this.startAnalysis();
          });
        }
      });
      
      return true;
    } catch (err) {
      console.error("Error listing microphones:", err);
      return false;
    }
  }

  async initialize() {
    try {
      // Clean up previous connections
      if (this.source) {
        this.source.disconnect();
      }
      
      // Create AudioContext
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } else if (this.audioContext.state === 'closed') {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Setup analyser with better settings
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.minDecibels = -90; // Detect lower volume levels
      this.analyser.maxDecibels = -10;
      this.analyser.smoothingTimeConstant = 0.85;
      
      // Get microphone permission and stream with explicit constraints and selected device
      const constraints = {
        audio: {
          deviceId: this.selectedDeviceId ? { exact: this.selectedDeviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      
      console.log("Requesting microphone access with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Microphone access granted!", stream);
      
      // Connect audio nodes
      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
      
      // Resume audio context (needed for Chrome's autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Enable dropdown
      const microphoneSelect = document.getElementById('microphone-select');
      if (microphoneSelect) {
        microphoneSelect.disabled = false;
      }
      
      console.log("Audio context state:", this.audioContext.state);
      console.log("Audio initialization complete");
      
      return true;
    } catch (err) {
      console.error("Error accessing microphone:", err);
      return false;
    }
  }

  startAnalysis() {
    this.isAnalyzing = true;
    console.log("Starting audio analysis...");
    this.analyzeAudio();
    
    // Disable microphone selection during analysis
    const microphoneSelect = document.getElementById('microphone-select');
    if (microphoneSelect) {
      microphoneSelect.disabled = true;
    }
  }

  stopAnalysis() {
    this.isAnalyzing = false;
    console.log("Stopping audio analysis");
    
    // Enable microphone selection
    const microphoneSelect = document.getElementById('microphone-select');
    if (microphoneSelect) {
      microphoneSelect.disabled = false;
    }
    
    // Clean up audio source
    if (this.source) {
      this.source.mediaStream.getTracks().forEach(track => {
        track.stop();
      });
      this.source.disconnect();
    }
  }

  analyzeAudio() {
    if (!this.isAnalyzing) return;

    // Get frequency data
    this.analyser.getFloatTimeDomainData(this.buffer);
    
    // Check if there's any significant audio signal
    const rms = this.getRootMeanSquare(this.buffer);
    
    // Log RMS level for debugging
    if (this.debugMode && Math.random() < 0.05) { // Only log occasionally to avoid console flood
      console.log("Current RMS level:", rms);
    }
    
    if (rms > 0.005) { // Lower threshold to detect quieter sounds
      // Detect pitch using autocorrelation
      const pitch = this.detectPitchACF(this.buffer, this.audioContext.sampleRate);
      
      if (pitch > 0) {
        console.log("Detected pitch:", pitch);
        // Convert frequency to note
        const noteNum = 12 * (Math.log(pitch / 440) / Math.log(2));
        const noteInt = Math.round(noteNum) + 69; // MIDI note number (A4 = 69)
        const noteName = this.noteStrings[noteInt % 12];
        const octave = Math.floor(noteInt / 12) - 1;
        
        // Store the detected note
        this.detectedNotes.push({
          frequency: pitch,
          note: `${noteName}${octave}`,
          timestamp: Date.now()
        });
        
        // Trigger note detected event
        const event = new CustomEvent('noteDetected', { 
          detail: { note: `${noteName}${octave}`, frequency: pitch } 
        });
        document.dispatchEvent(event);
      }
    }

    // Continue analysis loop
    requestAnimationFrame(() => this.analyzeAudio());
  }
  
  // Calculate RMS (Root Mean Square) of the buffer
  getRootMeanSquare(buffer) {
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i] * buffer[i];
    }
    return Math.sqrt(sum / buffer.length);
  }

  // Improved autocorrelation function for pitch detection
  detectPitchACF(buffer, sampleRate) {
    const SIZE = buffer.length;
    const MAX_SAMPLES = SIZE / 2;
    
    // Find A.C.F
    let bestR = 0;
    let bestK = -1;
    
    // Calculate the A.C.F
    for (let k = 8; k <= MAX_SAMPLES; k++) {
      let sum = 0;
      
      for (let i = 0; i < MAX_SAMPLES; i++) {
        sum += buffer[i] * buffer[i + k];
      }
      
      let r = sum / MAX_SAMPLES;
      
      if (r > bestR) {
        bestR = r;
        bestK = k;
      }
      
      if (r > 0.9) {
        // Strong correlation found
        break;
      }
    }
    
    // console.log("Best K:", bestK, "Best R:", bestR);
    
    if (bestK > 0 && bestR > 0.01) {
      const fundamentalFreq = sampleRate / bestK;
      return fundamentalFreq;
    }
    
    return -1; // No pitch detected
  }
  
  // Get most recent detected notes
  getRecentNotes(count = 10) {
    // Filter out old notes (older than 5 seconds)
    const now = Date.now();
    this.detectedNotes = this.detectedNotes.filter(note => (now - note.timestamp) < 5000);
    
    // Return most recent notes
    return this.detectedNotes.slice(-count);
  }
}

// Initialize the pitch detector when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, initializing pitch detector...");
  const pitchDetector = new PitchDetector();
  
  // Add event listeners for buttons
  const startButton = document.getElementById('start-analysis');
  const stopButton = document.getElementById('stop-analysis');
  const noteDisplay = document.getElementById('note-display');
  const noteVisualization = document.getElementById('note-visualization');
  
  // Get access to microphone and list available devices
  const initializeMicrophoneHandler = async () => {
    noteDisplay.textContent = "Requesting microphone access...";
    
    // List available microphones
    await pitchDetector.listMicrophones();
    
    // Initialize audio context and analyser
    const initialized = await pitchDetector.initialize();
    
    if (initialized) {
      // Change button text and enable
      startButton.textContent = "Start Listening";
      noteDisplay.textContent = "Ready to detect notes";
      
      // Setup button event listeners for actual analysis
      startButton.removeEventListener('click', initializeMicrophoneHandler);
      startButton.addEventListener('click', () => {
        pitchDetector.startAnalysis();
        startButton.disabled = true;
        stopButton.disabled = false;
        noteDisplay.textContent = "Listening for notes...";
        noteVisualization.innerHTML = '';
      });
      
      stopButton.addEventListener('click', () => {
        pitchDetector.stopAnalysis();
        startButton.disabled = false;
        stopButton.disabled = true;
        noteDisplay.textContent = "Listening stopped";
      });
    } else {
      noteDisplay.textContent = "Failed to access microphone";
    }
  };
  
  // Initial setup - request microphone access
  startButton.addEventListener('click', initializeMicrophoneHandler);
  
  // Listen for note detected events
  document.addEventListener('noteDetected', (e) => {
    const { note, frequency } = e.detail;
    noteDisplay.textContent = `Detected: ${note} (${Math.round(frequency)} Hz)`;
    updateNoteVisualization(note);
  });
});

// Update the note visualization
function updateNoteVisualization(noteName) {
  const noteVisualization = document.getElementById('note-visualization');
  if (!noteVisualization) return;
  
  // Clear old notes (keep only last 5)
  while (noteVisualization.childElementCount > 4) {
    noteVisualization.removeChild(noteVisualization.firstChild);
  }
  
  // Create new note element
  const noteElement = document.createElement('div');
  noteElement.className = 'note';
  noteElement.textContent = noteName;
  
  // Apply random position and animation
  noteElement.style.left = `${Math.random() * 80 + 10}%`;
  noteElement.style.animationDuration = `${Math.random() * 2 + 1}s`;
  
  // Add to visualization
  noteVisualization.appendChild(noteElement);
  
  // Remove after animation completes
  setTimeout(() => {
    if (noteElement.parentNode === noteVisualization) {
      noteVisualization.removeChild(noteElement);
    }
  }, 3000);
} 