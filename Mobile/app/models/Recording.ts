// app/models/Recording.ts
export interface Recording {
  id: string;
  title: string;
  uri: string;
  duration: number; // milisaniye cinsinden
  created: string; // ISO date string
  userId: string;
}

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