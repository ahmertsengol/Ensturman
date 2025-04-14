import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Image, Platform, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/Button';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { RecordingCard } from '@/components/RecordingCard';
import { Recording } from '../models/Recording';
import { api } from '../services/api';
import Feather from '@expo/vector-icons/Feather';

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playbackPositionRef = useRef(0);
  const positionUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if we have recording parameters
    const recordingId = params.playRecordingId as string;
    const recordingUri = params.recordingUri as string;
    
    if (recordingId && recordingUri) {
      loadRecording(recordingId, recordingUri);
    }
    
    // Clean up on unmount
    return () => {
      if (sound) {
        stopAndUnloadSound();
      }
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
    };
  }, [params]);

  const loadRecording = async (id: string, uri: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create a recording object or fetch it from API
      const tempRecording: Recording = {
        id,
        uri,
        title: 'Ses Kaydı',
        duration: 0,
        created: new Date().toISOString(),
        userId: '1'
      };
      
      setRecording(tempRecording);
      
      // Load and prepare the sound
      await loadSound(uri);
      
    } catch (error) {
      console.error('Error loading recording:', error);
      setError('Ses kaydı yüklenirken bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSound = async (uri: string) => {
    try {
      if (sound) {
        await stopAndUnloadSound();
      }
      
      console.log('Loading sound from URI:', uri);
      
      // Create and load the sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      
      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
      
      setSound(newSound);
      
    } catch (error) {
      console.error('Error loading sound:', error);
      setError('Ses dosyası açılamadı. Format desteklenmiyor olabilir.');
      throw error;
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) return;
    
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      
      if (status.durationMillis) {
        setDuration(status.durationMillis);
        
        // Update the recording object with the duration
        if (recording && !recording.duration && status.durationMillis) {
          setRecording(prev => 
            prev ? { ...prev, duration: status.durationMillis || 0 } : null
          );
        }
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

  const togglePlayback = async () => {
    if (!sound) return;
    
    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.positionMillis === status.durationMillis) {
          await sound.setPositionAsync(0);
        }
        await sound.playAsync();
        
        // Start the interval to update UI more frequently
        if (!positionUpdateInterval.current) {
          positionUpdateInterval.current = setInterval(() => {
            setPlaybackPosition(playbackPositionRef.current);
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      Alert.alert('Hata', 'Ses oynatılırken bir sorun oluştu.');
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
    } catch (error) {
      console.error('Error unloading sound:', error);
    }
  };

  // Render recording player when there's a recording to play
  const renderPlayer = () => {
    if (!recording) return null;
    
    return (
      <ThemedView style={styles.playerContainer} card>
        <ThemedText variant="h2" style={styles.playerTitle}>
          Şu an oynatılıyor
        </ThemedText>
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#4A90E2" style={styles.loader} />
        ) : error ? (
          <ThemedView style={styles.errorContainer}>
            <IconSymbol size={40} color="#D32F2F" name="exclamationmark.triangle" />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <Button
              label="Geri Dön"
              variant="outline"
              onPress={() => router.back()}
              style={styles.backButton}
            />
          </ThemedView>
        ) : (
          <>
            <RecordingCard
              recording={recording}
              isPlaying={isPlaying}
              playbackPosition={playbackPosition}
              duration={duration}
              onPress={togglePlayback}
              style={styles.recordingCard}
            />
            
            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={togglePlayback}
              >
                <Feather
                  name={isPlaying ? 'pause' : 'play'}
                  size={32}
                  color="#4A90E2"
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.controlButton}
                onPress={stopAndUnloadSound}
              >
                <Feather name="stop-circle" size={32} color="#4A90E2" />
              </TouchableOpacity>
            </View>
            
            <Button
              label="Kayıtlar Sayfasına Dön"
              variant="outline"
              onPress={() => router.push('/(tabs)/dashboard')}
              style={styles.backToDashboardButton}
            />
          </>
        )}
      </ThemedView>
    );
  };

  // Default welcome screen when no recording is playing
  const renderWelcomeScreen = () => (
    <ThemedView style={styles.contentContainer}>
      <ThemedText variant="h1" style={styles.title}>
        Hoş Geldiniz!
      </ThemedText>
      <ThemedText variant="bodyMedium" style={styles.subtitle}>
        Uygulamamıza hoş geldiniz. Ses kayıtlarınızı yönetmek ve dinlemek için
        aşağıdaki butona tıklayarak başlayabilirsiniz.
      </ThemedText>
      <Button
        label="Kayıtları Görüntüle"
        variant="primary"
        onPress={() => router.push('/(tabs)/dashboard')}
        style={styles.button}
      />
    </ThemedView>
  );

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="sparkles"
          style={styles.headerImage}
        />
      }>
      {recording ? renderPlayer() : renderWelcomeScreen()}
      
      {Platform.OS === 'web' && !recording && (
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    minWidth: 200,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginTop: 40,
  },
  playerContainer: {
    margin: 16,
    padding: 16,
  },
  playerTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  recordingCard: {
    marginBottom: 16,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 24,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToDashboardButton: {
    marginTop: 16,
  },
  loader: {
    marginVertical: 32,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#D32F2F',
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
  },
}); 