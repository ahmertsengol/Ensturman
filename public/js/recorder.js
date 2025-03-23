// public/js/recorder.js - Audio recording functionality

document.addEventListener('DOMContentLoaded', () => {
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
  
  // Check browser support for MediaRecorder
  if (!window.MediaRecorder) {
    alert('Your browser does not support audio recording. Please use Chrome, Firefox, or another compatible browser.');
    recordButton.disabled = true;
    return;
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
      
      // Get user media
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize audio context if not already done
      if (!audioContext) {
        initAudioContext();
      }
      
      // Set up audio analyzer
      const source = audioContext.createMediaStreamSource(audioStream);
      source.connect(analyser);
      
      // Start visualizer
      drawVisualizer();
      
      // Create media recorder
      mediaRecorder = new MediaRecorder(audioStream);
      
      // Start recording
      mediaRecorder.start();
      startTime = Date.now();
      
      // Update UI
      recordStatus.textContent = 'Recording...';
      recordButton.disabled = true;
      stopButton.disabled = false;
      playButton.disabled = true;
      saveButton.disabled = true;
      
      // Start timer
      startTimer();
      
      // Collect recorded data
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      // When recording stops
      mediaRecorder.onstop = () => {
        // Create audio blob
        audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        audioUrl = URL.createObjectURL(audioBlob);
        
        // Set up audio player
        audioPlayer.src = audioUrl;
        audioPlayerContainer.style.display = 'block';
        
        // Create file from blob for form submission
        const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { 
          type: 'audio/webm',
          lastModified: new Date().getTime()
        });
        
        // Create a DataTransfer object for compatibility with all browsers
        try {
          // For browsers that support DataTransfer
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(audioFile);
          audioFileInput.files = dataTransfer.files;
        } catch (err) {
          // Fallback for browsers that don't support DataTransfer
          console.warn('DataTransfer not supported, using direct assignment');
          // Direct assignment works in some browsers but not all
          try {
            audioFileInput.files = [audioFile]; // This may not work in all browsers
          } catch (err2) {
            console.error('Cannot set files directly:', err2);
            // Last resort: make the input visible so user can select file manually if needed
            audioFileInput.style.display = 'block';
            alert('Please select the recording file manually if the Save button does not work');
          }
        }
        
        // Update UI
        recordStatus.textContent = 'Recording complete';
        recordButton.disabled = false;
        playButton.disabled = false;
        saveButton.disabled = false;
        
        // Stop all tracks
        audioStream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions and try again.');
      recordStatus.textContent = 'Error: Could not access microphone';
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
  
  // Event listeners
  recordButton.addEventListener('click', startRecording);
  stopButton.addEventListener('click', stopRecording);
  playButton.addEventListener('click', playRecording);
  
  // Form validation
  document.getElementById('recording-form').addEventListener('submit', function(e) {
    const titleInput = document.getElementById('title');
    
    if (!titleInput.value.trim()) {
      e.preventDefault();
      alert('Please enter a title for your recording');
      return;
    }
    
    if (!audioFileInput.files || !audioFileInput.files.length) {
      e.preventDefault();
      alert('Please make a recording first');
      return;
    }
    
    // Log file info for debugging
    console.log('Submitting file:', audioFileInput.files[0]);
  });
}); 