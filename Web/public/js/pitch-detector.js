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
    this.debugMode = true; // Hata ayıklama modunu etkinleştir
    this.availableMicrophones = []; // Kullanılabilir mikrofonları saklayacak
    this.selectedDeviceId = null; // Seçili mikrofon ID'sini saklayacak
  }

  // Kullanılabilir mikrofonları listeleyip dropdown'a ekler
  async listMicrophones() {
    try {
      // Önce ses cihazlarına erişim izni alalım
      console.log("Requesting temporary microphone access for listing devices...");
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Geçici stream'i durduralım
      tempStream.getTracks().forEach(track => track.stop());
      
      // Şimdi tüm cihazları alabiliriz (izinli olduğumuz için etiketlerle birlikte)
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableMicrophones = devices.filter(device => device.kind === 'audioinput');
      
      console.log("Available microphones:", this.availableMicrophones);
      
      // Mikrofon listesini dropdown'a ekleyelim
      const microphoneSelect = document.getElementById('microphone-select');
      if (!microphoneSelect) {
        console.error("Microphone select dropdown not found in DOM");
        return false;
      }
      
      // Dropdown'ı temizleyelim
      microphoneSelect.innerHTML = '';
      
      // Her mikrofon için bir option ekleyelim
      this.availableMicrophones.forEach((device, index) => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Mikrofon ${index + 1}`;
        microphoneSelect.appendChild(option);
      });
      
      // İlk mikrofonu varsayılan olarak seçelim
      if (this.availableMicrophones.length > 0) {
        this.selectedDeviceId = this.availableMicrophones[0].deviceId;
        microphoneSelect.value = this.selectedDeviceId;
      }
      
      // Mikrofon değiştiğinde event listener ekleyelim
      microphoneSelect.addEventListener('change', (e) => {
        this.selectedDeviceId = e.target.value;
        console.log("Selected microphone changed to:", this.selectedDeviceId);
        
        // Eğer analiz devam ediyorsa, yeni mikrofon ile devam edelim
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
      // Önceki bağlantıları temizle
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
      this.analyser.minDecibels = -90; // Daha düşük ses seviyelerini algılayabilme
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
      
      // Dropdown'u aktifleştir
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
    
    // Mikrofon seçimini devre dışı bırakma
    const microphoneSelect = document.getElementById('microphone-select');
    if (microphoneSelect) {
      microphoneSelect.disabled = true;
    }
  }

  stopAnalysis() {
    this.isAnalyzing = false;
    console.log("Stopping audio analysis");
    
    // Mikrofon seçimini aktifleştirme
    const microphoneSelect = document.getElementById('microphone-select');
    if (microphoneSelect) {
      microphoneSelect.disabled = false;
    }
    
    // Audio kaynağını temizle
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
    
    if (bestK > 0) {
      const fundamentalFreq = sampleRate / bestK;
      // Only return frequencies in the audible range (20Hz - 4500Hz)
      if (fundamentalFreq > 20 && fundamentalFreq < 4500) {
        return fundamentalFreq;
      }
    }
    
    return -1; // No pitch detected
  }

  // Get the most recent detected notes
  getRecentNotes(count = 10) {
    return this.detectedNotes.slice(-count);
  }
}

// Initialize and use the PitchDetector when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const detector = new PitchDetector();
  const startButton = document.getElementById('start-analysis');
  const stopButton = document.getElementById('stop-analysis');
  const noteDisplay = document.getElementById('note-display');
  
  if (!startButton || !stopButton || !noteDisplay) {
    console.error('Required elements not found in the DOM');
    return;
  }
  
  // Check if the browser supports the necessary APIs
  if (!window.AudioContext && !window.webkitAudioContext) {
    noteDisplay.textContent = 'Web Audio API desteklenmiyor. Lütfen Chrome veya Firefox kullanın.';
    startButton.disabled = true;
    stopButton.disabled = true;
    return;
  }
  
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    noteDisplay.textContent = 'Mikrofon erişimi desteklenmiyor. Lütfen HTTPS kullanın.';
    startButton.disabled = true;
    stopButton.disabled = true;
    return;
  }
  
  // Mikrofonları listele
  await detector.listMicrophones();
  
  // Add click handler to initialize audio when user interacts
  startButton.textContent = "Mikrofona Erişim İzni Ver";
  
  // İlk tıklama işleyicisini bir değişkene atıyoruz (arguments.callee yerine)
  const initializeMicrophoneHandler = async () => {
    noteDisplay.textContent = 'Mikrofon izni isteniyor...';
    
    const initialized = await detector.initialize();
    
    if (!initialized) {
      noteDisplay.textContent = 'Mikrofon erişimi başarısız. Tarayıcı izinlerini kontrol edin.';
      return;
    }
    
    startButton.textContent = "Dinlemeye Başla";
    // Bu satırı değiştiriyoruz - artık önceki işleyiciyi named handler ile kaldırıyoruz
    startButton.removeEventListener('click', initializeMicrophoneHandler);
    
    startButton.addEventListener('click', () => {
      detector.startAnalysis();
      startButton.disabled = true;
      stopButton.disabled = false;
      noteDisplay.textContent = 'Dinleniyor...';
    });
    
    stopButton.addEventListener('click', () => {
      detector.stopAnalysis();
      startButton.disabled = false;
      stopButton.disabled = true;
      noteDisplay.textContent = 'Dinleme durduruldu';
    });
  };
  
  // Event listener'ı değişken ile ekliyoruz
  startButton.addEventListener('click', initializeMicrophoneHandler);
  
  // Listen for detected notes
  document.addEventListener('noteDetected', (e) => {
    noteDisplay.textContent = `Algılanan Nota: ${e.detail.note} (${e.detail.frequency.toFixed(2)} Hz)`;
    
    // Visual feedback for the current note
    updateNoteVisualization(e.detail.note);
  });
});

// Function to provide visual feedback for detected notes
function updateNoteVisualization(noteName) {
  const visualizationElement = document.getElementById('note-visualization');
  
  if (!visualizationElement) return;
  
  // Extract just the note letter (without octave)
  const noteOnly = noteName.replace(/[0-9]/g, '');
  
  // Clear previous visualization
  visualizationElement.innerHTML = '';
  
  // Create visual representation of the note
  const noteElement = document.createElement('div');
  noteElement.className = 'note-circle';
  noteElement.textContent = noteOnly;
  noteElement.style.animation = 'pulse 0.5s';
  
  // Determine if this is a correct note (for exercise)
  const expectedNotes = document.querySelectorAll('.expected-notes span');
  let isCorrectNote = false;
  
  expectedNotes.forEach(expected => {
    if (expected.textContent === noteOnly) {
      isCorrectNote = true;
      expected.classList.add('highlighted');
      
      // Remove highlight after a short delay
      setTimeout(() => {
        expected.classList.remove('highlighted');
      }, 1000);
    }
  });
  
  // Add class based on correctness
  if (isCorrectNote) {
    noteElement.classList.add('correct-note');
  } else {
    noteElement.classList.add('incorrect-note');
  }
  
  visualizationElement.appendChild(noteElement);
} 