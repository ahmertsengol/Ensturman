import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Alert, ActivityIndicator, Text, TextInput, ScrollView } from 'react-native';
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
import { Chip, Menu, Button } from 'react-native-paper';

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
  category?: string;
};

// Mock data for sample recordings
const MOCK_RECORDINGS: Recording[] = [
  {
    id: '1',
    title: 'Piano Practice - Moonlight Sonata',
    description: 'First movement practice session, still working on dynamics',
    file_path: 'piano_practice_1.m4a',
    created_at: new Date(2023, 11, 10).toISOString(),
    duration: 180,
    file_size: 1564000,
    file_url: 'https://example.com/audio/piano1.m4a',
    category: 'Practice'
  },
  {
    id: '2',
    title: 'Voice Lesson - Breath Control',
    description: 'Working on diaphragmatic breathing techniques',
    file_path: 'voice_lesson_1.m4a',
    created_at: new Date(2023, 11, 12).toISOString(),
    duration: 240,
    file_size: 2145000,
    file_url: 'https://example.com/audio/voice1.m4a',
    category: 'Lesson'
  },
  {
    id: '3',
    title: 'Guitar - New Song Draft',
    description: 'First draft of original composition, needs work on bridge section',
    file_path: 'guitar_draft_1.m4a',
    created_at: new Date(2023, 11, 15).toISOString(),
    duration: 195,
    file_size: 1840000,
    file_url: 'https://example.com/audio/guitar1.m4a',
    category: 'Composition'
  },
  {
    id: '4',
    title: 'Drum Pattern Ideas',
    description: 'Several rhythm patterns for upcoming project',
    file_path: 'drum_patterns.m4a',
    created_at: new Date(2023, 11, 18).toISOString(),
    duration: 120,
    file_size: 1248000,
    file_url: 'https://example.com/audio/drums1.m4a',
    category: 'Practice'
  },
  {
    id: '5',
    title: 'Vocal Warm-up Routine',
    description: 'Standard morning warm-up exercise sequence',
    file_path: 'vocal_warmup.m4a',
    created_at: new Date(2023, 11, 20).toISOString(),
    duration: 300,
    file_size: 2840000,
    file_url: 'https://example.com/audio/vocal_warmup.m4a',
    category: 'Warm-up'
  }
];

const CATEGORIES = ['All', 'Practice', 'Lesson', 'Composition', 'Warm-up', 'Performance'];

export default function RecordingsScreen() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [filteredRecordings, setFilteredRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest'|'oldest'|'alphabetical'>('newest');
  
  const { isAuthenticated } = useAuth();
  const isFocused = useIsFocused();
  const soundRef = useRef<Audio.Sound | null>(null);
  const router = useRouter();
  
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Handle input text changes without immediately filtering
  const handleInputChange = useCallback((text: string) => {
    setInputText(text);
    
    // Set a timeout to update the search query after typing stops
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      setSearchQuery(text); // This will trigger the filter effect
    }, 300);
  }, []);
  
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
  
  // Format duration
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Apply filters and search
  useEffect(() => {
    let result = [...recordings];
    
    // Apply category filter
    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item => 
          item.title.toLowerCase().includes(query) || 
          (item.description && item.description.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    switch(sortOrder) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    
    setFilteredRecordings(result);
  }, [recordings, searchQuery, selectedCategory, sortOrder]);
  
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
          
          // Add a random category if missing
          if (!recording.category) {
            const categories = CATEGORIES.filter(cat => cat !== 'All');
            const randomIndex = Math.floor(Math.random() * categories.length);
            recording.category = categories[randomIndex];
          }
          
          return recording;
        });
        
        setRecordings(processedRecordings);
      } else {
        console.log('No valid data from API, using mock data');
        // Use mock data if API returns no valid data
        setRecordings(MOCK_RECORDINGS);
      }
    } catch (error: any) {
      console.error('Error loading recordings:', error);
      
      // Check for network errors which might need retry
      if (error.message && error.message.includes('Network Error') && retry) {
        console.log('Network error detected, retrying in 3 seconds...');
        setTimeout(() => loadRecordings(false), 3000);
        return;
      }
      
      // If API fails, use mock data
      console.log('API failed, using mock data');
      setRecordings(MOCK_RECORDINGS);
      
      let errorMessage = 'Using sample recordings (API unavailable)';
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

      // For mock data, use a sample audio file if available
      if (MOCK_RECORDINGS.some(r => r.id === recording.id)) {
        // You could provide a local sample audio file here
        // For now, we'll just show an alert explaining this is mock data
        Alert.alert('Sample Recording', 'This is a sample recording for demonstration purposes.');
        // Let's pretend it's playing
        setPlayingId(recording.id);
        setIsPlaying(true);
        setTimeout(() => {
          setPlayingId(null);
          setIsPlaying(false);
        }, 3000); // Simulate 3 seconds of playback
        return;
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
              // For mock data, just remove from local state
              if (MOCK_RECORDINGS.some(r => r.id === id)) {
                setRecordings(prev => prev.filter(r => r.id !== id));
                return;
              }
              
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
          <View style={styles.titleRow}>
            <ThemedText type="default" style={styles.recordingTitle}>
              {item.title}
            </ThemedText>
            {item.category && (
              <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category, 0.3) }]}>
                <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
                  {item.category}
                </Text>
              </View>
            )}
          </View>
          
          {item.description ? (
            <ThemedText numberOfLines={2} style={styles.recordingDescription}>
              {item.description}
            </ThemedText>
          ) : null}
          
          <View style={styles.metaRow}>
            <ThemedText style={styles.recordingMeta}>
              {formatDate(item.created_at)}
            </ThemedText>
            <View style={styles.metaItem}>
              <MaterialIcons name="access-time" size={12} color="#A0AEC0" style={styles.metaIcon} />
              <ThemedText style={styles.recordingMeta}>
                {formatDuration(item.duration)}
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="storage" size={12} color="#A0AEC0" style={styles.metaIcon} />
              <ThemedText style={styles.recordingMeta}>
                {formatFileSize(item.file_size)}
              </ThemedText>
            </View>
          </View>
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
  
  // Helper to get category color
  const getCategoryColor = (category: string, opacity = 1) => {
    const colors: Record<string, string> = {
      'Practice': `rgba(29, 185, 84, ${opacity})`, // Green
      'Lesson': `rgba(233, 30, 99, ${opacity})`, // Pink
      'Composition': `rgba(33, 150, 243, ${opacity})`, // Blue
      'Warm-up': `rgba(255, 152, 0, ${opacity})`, // Orange
      'Performance': `rgba(156, 39, 176, ${opacity})`, // Purple
    };
    
    return colors[category] || `rgba(158, 158, 158, ${opacity})`;
  };
  
  const renderHeader = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <MaterialIcons name="search" size={20} color="#A0AEC0" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recordings..."
          placeholderTextColor="#A0AEC0"
          value={inputText}
          onChangeText={handleInputChange}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
          keyboardType="default"
        />
        {inputText.length > 0 && (
          <TouchableOpacity onPress={() => {
            setInputText('');
            setSearchQuery('');
          }}>
            <MaterialIcons name="close" size={20} color="#A0AEC0" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map(category => (
            <TouchableOpacity 
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && {
                  backgroundColor: getCategoryColor(category === 'All' ? 'Practice' : category, 0.2)
                }
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text 
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && {
                    color: getCategoryColor(category === 'All' ? 'Practice' : category),
                    fontWeight: '700'
                  }
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <View style={styles.sortContainer}>
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <TouchableOpacity 
                style={styles.sortButton}
                onPress={() => setSortMenuVisible(true)}
              >
                <MaterialIcons name="sort" size={20} color="#1DB954" />
                <Text style={styles.sortButtonText}>Sort</Text>
              </TouchableOpacity>
            }
          >
            <Menu.Item 
              onPress={() => {
                setSortOrder('newest');
                setSortMenuVisible(false);
              }} 
              title="Newest First" 
              leadingIcon="calendar-arrow-down"
            />
            <Menu.Item 
              onPress={() => {
                setSortOrder('oldest');
                setSortMenuVisible(false);
              }} 
              title="Oldest First" 
              leadingIcon="calendar-arrow-up"
            />
            <Menu.Item 
              onPress={() => {
                setSortOrder('alphabetical');
                setSortMenuVisible(false);
              }} 
              title="Alphabetical" 
              leadingIcon="sort-alphabetical-ascending"
            />
          </Menu>
        </View>
      </View>
    </View>
  );
  
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
  
  if (error && recordings.length === 0) {
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
  
  if (filteredRecordings.length === 0 && searchQuery === '' && selectedCategory === 'All') {
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
  
  if (filteredRecordings.length === 0) {
    return (
      <AppBackground>
        <ThemedLayout>
          <View style={styles.container}>
            <ThemedText type="title" style={styles.title}>EnsAI Recordings</ThemedText>
            
            {renderHeader()}
            
            <View style={styles.centerContainer}>
              <MaterialIcons name="search-off" size={48} color="#A0AEC0" style={{marginBottom: 16}} />
              <ThemedText style={styles.emptyText}>No matching recordings</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Try changing your search or filters
              </ThemedText>
              <TouchableOpacity
                style={[styles.createButton, {backgroundColor: '#666'}]}
                onPress={() => {
                  setInputText('');
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              >
                <MaterialIcons name="clear" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ThemedLayout>
      </AppBackground>
    );
  }
  
  return (
    <AppBackground>
      <ThemedLayout>
        <View style={styles.container}>
          <ThemedText type="title" style={styles.title}>EnsAI Recordings</ThemedText>
          
          <FlatList
            data={filteredRecordings}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderHeader}
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
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 50, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 185, 84, 0.2)',
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#E0E0E0',
    fontSize: 16,
    height: 50,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryScroll: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  categoryChip: {
    backgroundColor: 'rgba(30, 30, 50, 0.6)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryChipText: {
    color: '#A0AEC0',
    fontSize: 14,
  },
  sortContainer: {
    marginLeft: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 50, 0.6)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 185, 84, 0.2)',
  },
  sortButtonText: {
    color: '#1DB954',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '600',
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#E0E0E0',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  recordingDescription: {
    fontSize: 14,
    marginBottom: 8,
    color: '#A0AEC0',
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  metaIcon: {
    marginRight: 4,
  },
  recordingMeta: {
    fontSize: 12,
    color: '#A0AEC0',
    opacity: 0.8,
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