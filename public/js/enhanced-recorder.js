// public/js/enhanced-recorder.js - Enhanced audio recording with microphone selection

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const recordButton = document.getElementById('record-button');
  const stopButton = document.getElementById('stop-button');
  const playButton = document.getElementById('play-button');
  const saveButton = document.getElementById('save-button');
  const recordStatus = document.getElementById('record-status');
  const timerDisplay = document.getElementById('timer');
  const visualizer = document.getElementById('visualizer');
  const audioPlayer = document.getElementById('audio-player');
  const audioPlayerContainer = document.getElementById('audio-player-container');
  const audioFileInput = document.getElementById('audio-file');
  const durationInput = document.getElementById('duration');
  const microphoneSelect = document.getElementById('microphone-select');
  
  // Variables
  let mediaRecorder;
  let audioChunks = [];
  let audioBlob;
  let audioUrl;
  let startTime;
  let timerInterval;
  let audioStream;
  let audioContext;
  let analyser;
  let canvasContext = visualizer.getContext('2d');
  let selectedDeviceId = '';
  
  // Check browser support for MediaRecorder
  if (!window.MediaRecorder) {
    showError('Your browser does not support audio recording. Please use Chrome, Firefox, or another compatible browser.');
    recordButton.disabled = true;
    return;
  }

  // Initialize microphone list
  try {
    await initMicrophoneList();
  } catch (error) {
    showError('Error accessing audio devices: ' + error.message);
  }
  
  // Get list of available audio input devices
  async function initMicrophoneList() {
    // We need to request permission first to get labeled devices
    try {
      // Temporary stream to get permission
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop all tracks from the temporary stream
      tempStream.getTracks().forEach(track => track.stop());
      
      // Now get the device list with labels
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
      
      // Clear existing options
      microphoneSelect.innerHTML = '';
      
      // Add each device as an option
      audioInputDevices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Microphone ${microphoneSelect.options.length + 1}`;
        microphoneSelect.appendChild(option);
      });
      
      // Select first device by default
      if (audioInputDevices.length > 0) {
        selectedDeviceId = audioInputDevices[0].deviceId;
        recordStatus.textContent = 'Ready to record using: ' + (audioInputDevices[0].label || 'Default microphone');
      } else {
        showError('No microphones detected');
        recordButton.disabled = true;
      }
    } catch (error) {
      console.error('Error enumerating devices:', error);
      throw error;
    }
  }
  
  // Initialize audio context
  function initAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
  }
  
  // Start recording
  async function startRecording() {
    try {
      // Reset any previous recording
      resetRecording();
      
      // Get user media with selected device
      const constraints = {
        audio: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      
      audioStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Initialize audio context if not already done
      if (!audioContext) {
        initAudioContext();
      }
      
      // Set up audio analyzer
      const source = audioContext.createMediaStreamSource(audioStream);
      source.connect(analyser);
      
      // Start visualizer
      drawVisualizer();
      
      // Create media recorder with options
      const options = { mimeType: getMimeType() };
      mediaRecorder = new MediaRecorder(audioStream, options);
      
      // Start recording
      mediaRecorder.start();
      startTime = Date.now();
      
      // Update UI
      recordStatus.textContent = 'Recording with: ' + (microphoneSelect.options[microphoneSelect.selectedIndex].text);
      recordButton.disabled = true;
      stopButton.disabled = false;
      playButton.disabled = true;
      saveButton.disabled = true;
      microphoneSelect.disabled = true;
      
      // Start timer
      startTimer();
      
      // Collect recorded data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      // When recording stops
      mediaRecorder.onstop = () => {
        // Create audio blob
        audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
        audioUrl = URL.createObjectURL(audioBlob);
        
        // Set up audio player
        audioPlayer.src = audioUrl;
        audioPlayerContainer.style.display = 'block';
        
        // Create file from blob for form submission
        const fileExtension = getFileExtension(mediaRecorder.mimeType);
        const audioFile = new File([audioBlob], `recording-${Date.now()}.${fileExtension}`, {
          type: mediaRecorder.mimeType,
          lastModified: Date.now()
        });
        
        // Create a DataTransfer object for compatibility with browsers
        try {
          // For browsers that support DataTransfer
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(audioFile);
          audioFileInput.files = dataTransfer.files;
        } catch (err) {
          // Fallback for browsers that don't support DataTransfer
          console.warn('DataTransfer not supported, using direct assignment');
          try {
            audioFileInput.files = [audioFile]; // This may not work in all browsers
          } catch (err2) {
            console.error('Cannot set files directly:', err2);
            // Last resort: make the input visible so user can select file manually
            audioFileInput.style.display = 'block';
            showError('Please select the recording file manually');
          }
        }
        
        // Update UI
        recordStatus.textContent = 'Recording complete - ' + formatBytes(audioBlob.size);
        recordButton.disabled = false;
        playButton.disabled = false;
        saveButton.disabled = false;
        microphoneSelect.disabled = false;
        
        // Stop all tracks
        audioStream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      showError('Could not access microphone. Please check permissions and try again.');
      recordStatus.textContent = 'Error: Could not access microphone';
      microphoneSelect.disabled = false;
      recordButton.disabled = false;
    }
  }
  
  // Stop recording
  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      clearInterval(timerInterval);
      stopVisualizer();
    }
  }
  
  // Play recording
  function playRecording() {
    audioPlayer.play();
  }
  
  // Reset recording
  function resetRecording() {
    audioChunks = [];
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    clearInterval(timerInterval);
    timerDisplay.textContent = '00:00';
    canvasContext.clearRect(0, 0, visualizer.width, visualizer.height);
    
    // Stop any existing audio stream
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
    }
  }
  
  // Start timer
  function startTimer() {
    timerDisplay.textContent = '00:00';
    startTime = Date.now();
    
    timerInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const seconds = Math.floor((elapsedTime / 1000) % 60);
      const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
      
      timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      // Update duration in form
      durationInput.value = Math.floor(elapsedTime / 1000);
    }, 1000);
  }
  
  // Draw audio visualizer
  function drawVisualizer() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
      requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      canvasContext.fillStyle = '#f4f4f4';
      canvasContext.fillRect(0, 0, visualizer.width, visualizer.height);
      
      const barWidth = (visualizer.width / bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;
        
        canvasContext.fillStyle = `rgb(${barHeight + 100}, 50, 150)`;
        canvasContext.fillRect(x, visualizer.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    }
    
    draw();
  }
  
  // Stop visualizer
  function stopVisualizer() {
    canvasContext.fillStyle = '#f4f4f4';
    canvasContext.fillRect(0, 0, visualizer.width, visualizer.height);
  }
  
  // Helper function to determine best supported MIME type
  function getMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
      'audio/mpeg'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return '';
  }
  
  // Helper function to get file extension from MIME type
  function getFileExtension(mimeType) {
    if (mimeType.includes('webm')) return 'webm';
    if (mimeType.includes('ogg')) return 'ogg';
    if (mimeType.includes('mp4')) return 'mp4';
    if (mimeType.includes('mpeg') || mimeType.includes('mp3')) return 'mp3';
    return 'audio';
  }
  
  // Helper function to format file size
  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  
  // Show error message
  function showError(message) {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
      
      setTimeout(() => {
        errorEl.style.display = 'none';
      }, 5000);
    } else {
      console.error(message);
      alert(message);
    }
  }
  
  // Handle microphone selection change
  microphoneSelect.addEventListener('change', function() {
    selectedDeviceId = this.value;
    const selectedOption = this.options[this.selectedIndex];
    recordStatus.textContent = 'Ready to record using: ' + selectedOption.text;
  });
  
  // Event listeners
  recordButton.addEventListener('click', startRecording);
  stopButton.addEventListener('click', stopRecording);
  playButton.addEventListener('click', playRecording);
  
  // Form validation
  document.getElementById('recording-form').addEventListener('submit', function(e) {
    const titleInput = document.getElementById('title');
    
    if (!titleInput.value.trim()) {
      e.preventDefault();
      showError('Please enter a title for your recording');
      return;
    }
    
    if (!audioFileInput.files || !audioFileInput.files.length) {
      e.preventDefault();
      showError('Please make a recording first');
      return;
    }
    
    // Log file info for debugging
    console.log('Submitting file:', audioFileInput.files[0]);
  });
}); 