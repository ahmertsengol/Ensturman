// app/models/Recording.ts
/**
 * Model definitions for audio recordings
 */

/**
 * Core Recording model representing a saved audio recording
 */
export interface Recording {
  id: string;
  title: string;
  uri: string;
  duration: number; // milisaniye cinsinden
  created: string; // ISO date string
  userId: string;
}

/**
 * Recording metadata used during playback
 */
export interface RecordingMetadata {
  title: string;
  isPlaying: boolean;
  duration: number;
  position: number;
}

// Default export for Expo Router
export default function RecordingModel() {
  return null;
} 