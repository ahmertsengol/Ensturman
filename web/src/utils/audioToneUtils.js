/**
 * Musical Note Utilities for Web Audio API
 */

// Note frequencies (A4 = 440 Hz)
const noteFrequencies = {
  'C': 261.63,  // C4
  'D': 293.66,  // D4
  'E': 329.63,  // E4
  'F': 349.23,  // F4
  'G': 392.00,  // G4
  'A': 440.00,  // A4
  'B': 493.88   // B4
};

// Audio context for generating tones
let audioContext = null;

// Initialize audio context on first user interaction
const initAudioContext = () => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (error) {
      console.error("Web Audio API is not supported in this browser", error);
    }
  }
  return audioContext;
};

// Play a tone with the given frequency
const playTone = (frequency, duration = 0.5) => {
  const context = initAudioContext();
  if (!context) return;
  
  // Create oscillator and gain nodes
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  
  // Configure oscillator
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  
  // Configure amplitude envelope
  gainNode.gain.setValueAtTime(0, context.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.7, context.currentTime + 0.05);
  gainNode.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.4);
  gainNode.gain.linearRampToValueAtTime(0, context.currentTime + duration);
  
  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  
  // Start and stop
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
  
  return { oscillator, gainNode };
};

// Play a musical note by its name
const playNote = (noteName, duration = 0.5) => {
  if (noteFrequencies[noteName]) {
    return playTone(noteFrequencies[noteName], duration);
  } else {
    console.error(`Note ${noteName} not found`);
    return null;
  }
};

export { noteFrequencies, playTone, playNote, initAudioContext };
