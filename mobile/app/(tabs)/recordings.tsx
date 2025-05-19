import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Alert, ActivityIndicator, Text } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedLayout } from '@/components/ThemedLayout';
import { getUserRecordings, deleteRecording, getAudioStreamUrl } from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import AppBackground from '@/components/AppBackground';

// Define PlaybackStatus interface with error property
interface PlaybackStatus {
  isLoaded: boolean;
  didJustFinish?: boolean;
  error?: string;
  [key: string]: any;
}

type Recording = {
  id: string;
  title: string;
  description: string;
  file_path: string;
  created_at: string;
  duration: number | null;
  file_size: number;
  file_url: string;
};

export default function RecordingsScreen() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { isAuthenticated } = useAuth();
  const isFocused = useIsFocused();
  const soundRef = useRef<Audio.Sound | null>(null);
  const router = useRouter();
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Load recordings from the server
  const loadRecordings = useCallback(async (retry = true) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching recordings from server...');
      const response = await getUserRecordings();
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`Loaded ${response.data.length} recordings`);
        
        // Process each recording to ensure URLs are properly set
        const processedRecordings = response.data.map(recording => {
          // Ensure file_url is absolute
          if (recording.file_url && !recording.file_url.startsWith('http')) {
            const fileName = recording.file_path.split('/').pop();
            recording.file_url = getAudioStreamUrl(fileName || '');
          }
          return recording;
        });
        
        setRecordings(processedRecordings);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Received invalid data from server.');
      }
    } catch (error: any) {
      console.error('Error loading recordings:', error);
      
      // Check for network errors which might need retry
      if (error.message && error.message.includes('Network Error') && retry) {
        console.log('Network error detected, retrying in 3 seconds...');
        setTimeout(() => loadRecordings(false), 3000);
        return;
      }
      
      let errorMessage = 'Could not load recordings. Please try again.';
      if (error.response && error.response.data && error.response.data.error) {
        errorMessage = error.response.data.error;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load recordings when the screen is focused
  useEffect(() => {
    if (isFocused && isAuthenticated()) {
      loadRecordings();
    }
  }, [isFocused, isAuthenticated, loadRecordings]);
  
  // Initialize audio system
  useEffect(() => {
    const setupAudio = async () => {
      try {
        // Configure audio for optimal playback
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          staysActiveInBackground: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('Audio system initialized');
      } catch (error) {
        console.error('Failed to configure audio mode:', error);
      }
    };
    
    setupAudio();
  }, []);
  
  // Clean up sound on unmount
  useEffect(() => {
    return () => {
      const cleanup = async () => {
        if (soundRef.current) {
          try {
            await soundRef.current.unloadAsync();
          } catch (error) {
            console.error('Error unloading sound:', error);
          }
        }
      };
      
      cleanup();
    };
  }, []);
  
  // Play or pause a recording
  const playRecording = async (recording: Recording) => {
    try {
      // If already playing this recording, toggle pause/play
      if (soundRef.current && playingId === recording.id) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
          } else {
            await soundRef.current.playAsync();
            setIsPlaying(true);
          }
        }
        return;
      }

      // If another recording is playing, stop it
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Get the file URL - use file_url from server if available, otherwise build it
      let audioUrl = recording.file_url;
      if (!audioUrl || !audioUrl.startsWith('http')) {
        const fileName = recording.file_path.split('/').pop();
        if (!fileName) {
          Alert.alert('Error', 'Invalid file path');
          return;
        }
        audioUrl = getAudioStreamUrl(fileName);
      }
      const fileExtension = audioUrl.split('.').pop()?.toLowerCase() || '';
      const initialStatus = {
        shouldPlay: true,
        progressUpdateIntervalMillis: 100,
        volume: 1.0,
      };
      const source: any = { uri: audioUrl };
      if (fileExtension === 'm4a') {
        source.overrideFileExtensionAndroid = 'm4a';
      } else if (fileExtension === 'webm') {
        source.overrideFileExtensionIOS = 'mp4';
      }
      const { sound } = await Audio.Sound.createAsync(
        source,
        initialStatus,
        (status: PlaybackStatus) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying ?? false);
            if (status.didJustFinish) {
              setPlayingId(null);
              setIsPlaying(false);
            }
          }
        }
      );
      soundRef.current = sound;
      setPlayingId(recording.id);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error in playRecording function:', error);
      Alert.alert('Playback Error', 'Could not play the recording. Please try again.');
    }
  };
  
  // Delete a recording
  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Recording',
      'Are you sure you want to delete this recording?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecording(id);
              
              // Stop if currently playing
              if (playingId === id && soundRef.current) {
                await soundRef.current.unloadAsync();
                soundRef.current = null;
                setPlayingId(null);
              }
              
              // Update the list
              setRecordings(recordings.filter(r => r.id !== id));
              
            } catch (error) {
              console.error('Error deleting recording:', error);
              Alert.alert('Delete Failed', 'Could not delete the recording.');
            }
          }
        }
      ]
    );
  };
  
  // Render a recording item
  const renderItem = ({ item }: { item: Recording }) => {
    const isCurrent = playingId === item.id;
    
    return (
      <View style={styles.recordingItem}>
        <View style={styles.recordingInfo}>
          <ThemedText type="default" style={styles.recordingTitle}>
            {item.title}
          </ThemedText>
          
          {item.description ? (
            <ThemedText numberOfLines={2} style={styles.recordingDescription}>
              {item.description}
            </ThemedText>
          ) : null}
          
          <ThemedText style={styles.recordingMeta}>
            {formatDate(item.created_at)} • {formatFileSize(item.file_size)}
          </ThemedText>
        </View>
        
        <View style={styles.recordingActions}>
          <TouchableOpacity
            style={[styles.actionButton, isCurrent && isPlaying ? styles.activeButton : null]}
            onPress={() => playRecording(item)}
          >
            <MaterialIcons
              name={isCurrent && isPlaying ? 'pause' : 'play-arrow'}
              size={24}
              color={isCurrent && isPlaying ? '#fff' : '#1DB954'}
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
          >
            <MaterialIcons name="delete" size={24} color="#E91E63" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  if (loading) {
    return (
      <AppBackground>
        <ThemedLayout>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#1DB954" />
          </View>
        </ThemedLayout>
      </AppBackground>
    );
  }
  
  if (error) {
    return (
      <AppBackground>
        <ThemedLayout>
          <View style={styles.centerContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => loadRecordings(true)}
            >
              <ThemedText style={styles.retryText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedLayout>
      </AppBackground>
    );
  }
  
  if (recordings.length === 0) {
    return (
      <AppBackground>
        <ThemedLayout>
          <View style={styles.centerContainer}>
            <MaterialIcons name="audiotrack" size={56} color="#1DB954" style={{opacity: 0.6, marginBottom: 16}} />
            <ThemedText style={styles.emptyText}>No recordings yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Create a new recording by going to the Record tab
            </ThemedText>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push('/record')}
            >
              <MaterialIcons name="mic" size={20} color="#fff" />
              <Text style={styles.createButtonText}>Record Now</Text>
            </TouchableOpacity>
          </View>
        </ThemedLayout>
      </AppBackground>
    );
  }
  
  return (
    <AppBackground>
      <ThemedLayout>
        <View style={styles.container}>
          <ThemedText type="title" style={styles.title}>Your Recordings</ThemedText>
          
          <FlatList
            data={recordings}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ThemedLayout>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  list: {
    paddingBottom: 20,
  },
  recordingItem: {
    flexDirection: 'row',
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 185, 84, 0.3)',
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(47, 42, 75, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  recordingInfo: {
    flex: 1,
    paddingRight: 8,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    color: '#E0E0E0',
  },
  recordingDescription: {
    fontSize: 14,
    marginBottom: 8,
    color: '#A0AEC0',
    lineHeight: 20,
  },
  recordingMeta: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  recordingActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 12,
    marginLeft: 10,
    borderRadius: 30,
    backgroundColor: 'rgba(30, 30, 50, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeButton: {
    backgroundColor: '#1DB954',
  },
  errorText: {
    marginBottom: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#1DB954',
    borderRadius: 8,
    marginTop: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#E0E0E0',
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#A0AEC0',
    marginBottom: 24,
    maxWidth: 260,
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 8,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },
}); 