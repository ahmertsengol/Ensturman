import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, FlatList, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/Button';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { recordingService } from '../services/recordingService';
import { Recording } from '../models/Recording';
import { Audio } from 'expo-av';
import { RecordingCard } from '@/components/RecordingCard';
import Feather from '@expo/vector-icons/Feather';
import { api } from '../services/api';

// Error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Dashboard Error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ThemedView style={styles.errorContainer}>
          <IconSymbol size={50} color="#D32F2F" name="exclamationmark.triangle" />
          <ThemedText style={styles.errorText}>
            Bir sorun oluştu. Lütfen sayfayı yeniden yükleyin.
          </ThemedText>
          <Button
            label="Sayfayı Yenile"
            variant="primary"
            onPress={() => this.setState({ hasError: false })}
            style={styles.errorButton}
          />
        </ThemedView>
      );
    }
    return this.props.children;
  }
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const isMounted = useRef(true);
  const abortController = useRef<AbortController | null>(null);

  // Audio playback related states
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const playbackPositionRef = useRef(0);
  const positionUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // Kullanıcının kayıtlarını getir
  const loadUserRecordings = async () => {
    if (!user) return;
    
    // Set refreshing state first
    setRefreshing(true);
    
    // Abort any existing requests
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    
    try {
      setIsLoading(true);
      const userRecordings = await recordingService.getUserRecordings(user.id);
      
      // Validate and clean data
      const validRecordings = userRecordings
        .filter(record => record && record.uri && record.id)
        .map(record => ({
          ...record,
          title: record.title || 'İsimsiz Kayıt',
          duration: record.duration || 0
        }));
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setRecordings(validRecordings);
        
        // Optimize by preloading first recording audio
        if (validRecordings.length > 0) {
          // Start downloading the first recording audio in background
          api.preloadFirstRecordingAudio(validRecordings);
        }
      }
    } catch (error) {
      console.error('Error loading recordings:', error);
      if (isMounted.current) {
        Alert.alert('Hata', 'Kayıtlar yüklenirken bir sorun oluştu.');
      }
    } finally {
      // Only update state if component is still mounted
      if (isMounted.current) {
        setIsLoading(false);
        setRefreshing(false);
      }
    }
  };

  // Sayfa yüklendiğinde ve user değiştiğinde kayıtları getir
  useEffect(() => {
    loadUserRecordings();
    
    // Setup audio session
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    };
    
    setupAudio();
    
    // Cleanup function to handle component unmounting
    return () => {
      isMounted.current = false;
      if (abortController.current) {
        abortController.current.abort();
      }
      
      // Clean up audio
      if (sound) {
        stopAndUnloadSound();
      }
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
    };
  }, [user]);

  // Kayıt silme işlemi
  const handleDeleteRecording = async (recordingId: string) => {
    if (!recordingId) {
      console.error('Invalid recording ID');
      return;
    }
    
    Alert.alert(
      'Kaydı Sil',
      'Bu kaydı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            try {
              // If this recording is currently playing, stop it first
              if (recordingId === playingRecordingId) {
                await stopAndUnloadSound();
              }
              
              await recordingService.deleteRecording(recordingId);
              // Başarılı silme sonrası listeyi güncelle
              if (isMounted.current) {
                setRecordings(prevRecordings => 
                  prevRecordings.filter(rec => rec.id !== recordingId)
                );
              }
            } catch (error) {
              console.error('Error deleting recording:', error);
              if (isMounted.current) {
                Alert.alert('Hata', 'Kayıt silinirken bir sorun oluştu.');
              }
            }
          }
        }
      ]
    );
  };

  // Audio playback handling functions
  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) return;
    
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      
      if (status.durationMillis) {
        setDuration(status.durationMillis);
      }
      
      if (status.positionMillis) {
        setPlaybackPosition(status.positionMillis);
        playbackPositionRef.current = status.positionMillis;
      }
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
        playbackPositionRef.current = 0;
      }
    }
  };

  const loadSound = async (uri: string) => {
    try {
      if (sound) {
        await stopAndUnloadSound();
      }
      
      console.log('Loading sound from URI:', uri);
      setPlaybackError(null);
      
      // Create and load the sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      
      setSound(newSound);
      return newSound;
      
    } catch (error) {
      console.error('Error loading sound:', error);
      setPlaybackError('Ses dosyası açılamadı. Format desteklenmiyor olabilir.');
      throw error;
    }
  };

  const togglePlayback = async (currentSound: Audio.Sound) => {
    try {
      if (isPlaying) {
        await currentSound.pauseAsync();
      } else {
        const status = await currentSound.getStatusAsync();
        if (status.isLoaded && status.positionMillis === status.durationMillis) {
          await currentSound.setPositionAsync(0);
        }
        await currentSound.playAsync();
        
        // Start the interval to update UI more frequently
        if (!positionUpdateInterval.current) {
          positionUpdateInterval.current = setInterval(() => {
            setPlaybackPosition(playbackPositionRef.current);
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      setPlaybackError('Ses oynatılırken bir sorun oluştu.');
    }
  };

  const stopAndUnloadSound = async () => {
    if (!sound) return;
    
    try {
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
        positionUpdateInterval.current = null;
      }
      
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      setPlaybackPosition(0);
      setPlayingRecordingId(null);
      setPlaybackError(null);
    } catch (error) {
      console.error('Error unloading sound:', error);
    }
  };
  
  // Kayıt oynatma işlemi - directly in the dashboard
  const handlePlayRecording = async (recording: Recording) => {
    if (!recording || !recording.id || !recording.uri) {
      Alert.alert('Hata', 'Kayıt bilgileri eksik, oynatılamıyor.');
      return;
    }
    
    try {
      // If this is already the playing recording, just toggle play/pause
      if (playingRecordingId === recording.id && sound) {
        await togglePlayback(sound);
        return;
      }
      
      setIsLoading(true);
      
      // Download the file to local cache first
      let localUri = '';
      try {
        localUri = await recordingService.downloadRecording(recording.id);
        console.log('Using local file for playback:', localUri);
      } catch (downloadError) {
        console.error('Error downloading file:', downloadError);
        // If we can't download, try to play directly from URL with auth header
        localUri = recording.uri;
      }
      
      // Otherwise, load and play the new recording
      const newSound = await loadSound(localUri);
      setPlayingRecordingId(recording.id);
      setDuration(recording.duration);
      await togglePlayback(newSound);
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Hata', 'Ses kaydı oynatılırken bir sorun oluştu.');
      setPlaybackError('Ses dosyası yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Tarih formatını düzenle
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Geçersiz Tarih';
    }
  };

  // Süre formatını düzenle (ms -> dakika:saniye)
  const formatDuration = (duration: number) => {
    try {
      const totalSeconds = Math.floor(duration / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } catch (error) {
      return '0:00';
    }
  };

  // Render a recording item (for FlatList)
  const renderRecordingItem = ({ item }: { item: Recording }) => {
    const isCurrentlyPlaying = playingRecordingId === item.id;
    
    if (isCurrentlyPlaying) {
      return (
        <ThemedView key={item.id} card style={styles.recordingItem}>
          <RecordingCard
            recording={item}
            isPlaying={isPlaying}
            playbackPosition={playbackPosition}
            duration={duration || item.duration}
            onPress={() => handlePlayRecording(item)}
            style={styles.recordingCard}
          />
          
          {playbackError ? (
            <ThemedText style={styles.errorText}>{playbackError}</ThemedText>
          ) : (
            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handlePlayRecording(item)}
              >
                <Feather
                  name={isPlaying ? 'pause' : 'play'}
                  size={24}
                  color="#4A90E2"
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.controlButton}
                onPress={stopAndUnloadSound}
              >
                <Feather name="stop-circle" size={24} color="#4A90E2" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => handleDeleteRecording(item.id)}
              >
                <Feather name="trash-2" size={24} color="#D32F2F" />
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>
      );
    }
    
    return (
      <ThemedView 
        key={item.id} 
        card 
        style={styles.recordingItem}
      >
        <View style={styles.recordingInfo}>
          <ThemedText weight="semiBold" style={styles.recordingTitle}>
            {item.title || 'İsimsiz Kayıt'}
          </ThemedText>
          <ThemedText style={styles.recordingDate}>
            {formatDate(item.created)}
          </ThemedText>
          <ThemedText style={styles.recordingDuration}>
            Süre: {formatDuration(item.duration)}
          </ThemedText>
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            label="Dinle" 
            variant="outline" 
            size="sm"
            onPress={() => handlePlayRecording(item)}
            style={styles.playButton}
          />
          <Button 
            label="Sil" 
            variant="secondary" 
            size="sm"
            onPress={() => handleDeleteRecording(item.id)}
            style={styles.deleteButton}
          />
        </View>
      </ThemedView>
    );
  };

  // Header component for the FlatList
  const ListHeaderComponent = () => (
    <View>
      <ThemedText variant="h1" style={styles.title}>
        Kayıtlarım
      </ThemedText>
      
      <Button
        label="Kayıtları Yenile"
        variant="outline"
        size="sm"
        onPress={loadUserRecordings}
        style={styles.refreshButton}
        loading={refreshing}
      />
    </View>
  );

  // Render the content based on loading state and data availability
  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />;
    }
    
    if (recordings.length === 0) {
      return (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol size={50} color="#909090" name="exclamationmark.circle" />
          <ThemedText style={styles.emptyText}>
            Henüz kaydedilmiş ses dosyanız bulunmuyor.
          </ThemedText>
          <Button
            label="Yeni Kayıt Oluştur"
            variant="primary"
            onPress={() => router.push('/(tabs)/record')}
            style={styles.newRecordingButton}
          />
        </ThemedView>
      );
    }
    
    return (
      <FlatList
        data={recordings}
        renderItem={renderRecordingItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeaderComponent}
        contentContainerStyle={styles.listContentContainer}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        initialNumToRender={8}
        windowSize={5}
      />
    );
  };

  return (
    <ErrorBoundary>
      <ThemedView style={styles.container}>
        {isLoading || recordings.length === 0 ? (
          <ParallaxScrollView
            headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
            headerImage={
              <IconSymbol
                size={310}
                color="#808080"
                name="waveform"
                style={styles.headerImage}
              />
            }
          >
            <ThemedView style={styles.container}>
              <ListHeaderComponent />
              {renderContent()}
            </ThemedView>
          </ParallaxScrollView>
        ) : (
          renderContent()
        )}
      </ThemedView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  title: {
    marginBottom: 20,
    fontSize: 28,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  refreshButton: {
    alignSelf: 'flex-end',
    marginBottom: 15,
    marginRight: 16,
  },
  loader: {
    marginTop: 40,
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  recordingItem: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 10,
  },
  recordingInfo: {
    marginBottom: 10,
  },
  recordingTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  recordingDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  recordingDuration: {
    fontSize: 14,
    opacity: 0.7,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  playButton: {
    minWidth: 80,
  },
  deleteButton: {
    minWidth: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
  newRecordingButton: {
    minWidth: 200,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#D32F2F',
    margin: 20,
    textAlign: 'center',
  },
  errorButton: {
    minWidth: 200,
  },
  // Audio player styles
  recordingCard: {
    marginBottom: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 24,
  },
  controlButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 