import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  View, 
  ActivityIndicator, 
  RefreshControl, 
  Alert,
  Animated,
  Easing
} from 'react-native';
import { Audio } from 'expo-av';
import { router, useNavigation } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '../context/AuthContext';
import { recordingService } from '../services/recordingService';
import { Recording, RecordingMetadata } from '../models/Recording';
import { api } from '../services/api';

export default function Welcome() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<{[key: string]: RecordingMetadata}>({});
  const [selectedRecordings, setSelectedRecordings] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [scaleAnimation] = useState(new Animated.Value(1));
  
  // Kayıtları yükle
  useEffect(() => {
    loadRecordings();
    
    // Navigation event listener ekle
    const unsubscribe = navigation.addListener('focus', () => {
      // Ekran odaklandığında kayıtları güncelle
      loadRecordings();
    });
    
    return () => {
      // Temizlik
      if (sound) {
        sound.unloadAsync();
      }
      // Event listener'ı kaldır
      unsubscribe();
    };
  }, [navigation]);
  
  // Kayıtları yenile
  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecordings();
    setRefreshing(false);
  };
  
  // Kayıtları getir
  const loadRecordings = async () => {
    try {
      setLoading(true);
      if (user) {
        const userRecordings = await recordingService.getUserRecordings(user.id);
        setRecordings(userRecordings);
        
        // Playback durumlarını ayarla
        const statusObj: {[key: string]: RecordingMetadata} = {};
        userRecordings.forEach(rec => {
          statusObj[rec.id] = {
            title: rec.title,
            isPlaying: false,
            duration: rec.duration,
            position: 0
          };
        });
        setPlaybackStatus(statusObj);
      }
    } catch (error) {
      console.error('Failed to load recordings', error);
      Alert.alert('Hata', 'Kayıtlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  // Kayıt sil
  const deleteRecording = async (id: string) => {
    try {
      Alert.alert(
        'Kayıt Silinecek',
        'Bu ses kaydını silmek istediğinizden emin misiniz?',
        [
          {
            text: 'İptal',
            style: 'cancel'
          },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: async () => {
              try {
                await recordingService.deleteRecording(id);
                
                // State'i doğrudan güncelle
                setRecordings(prev => prev.filter(rec => rec.id !== id));
                
                // Playback durumunu güncelle
                setPlaybackStatus(prev => {
                  const newStatus = { ...prev };
                  delete newStatus[id];
                  return newStatus;
                });
                
                // Eğer çalınan kayıt siliniyorsa sesi durdur
                if (playbackStatus[id]?.isPlaying && sound) {
                  await sound.unloadAsync();
                  setSound(null);
                }
              } catch (error) {
                console.error('Failed to delete recording:', error);
                Alert.alert('Hata', 'Kayıt silinirken bir hata oluştu.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to delete recording', error);
      Alert.alert('Hata', 'Kayıt silinirken bir hata oluştu.');
    }
  };
  
  // Kaydı oynat
  const playRecording = async (recording: Recording) => {
    try {
      // Önceki sesi durdur
      if (sound) {
        await sound.unloadAsync();
      }
      
      // Token al
      const token = await api.getToken();
      if (!token) {
        throw new Error('Oturum açmanız gerekiyor');
      }

      console.log('Playing recording:', recording.uri);
      
      // Yeni sesi yükle
      const { sound: newSound } = await Audio.Sound.createAsync(
        { 
          uri: recording.uri,
          headers: {
            'x-auth-token': token
          }
        },
        { shouldPlay: true },
        onPlaybackStatusUpdate(recording.id)
      );
      
      setSound(newSound);
      
      // Durumları güncelle
      setPlaybackStatus(prev => ({
        ...prev,
        [recording.id]: {
          ...prev[recording.id],
          isPlaying: true
        }
      }));
    } catch (error) {
      console.error('Failed to play recording:', error);
      Alert.alert('Hata', 'Kayıt oynatılamadı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };
  
  // Kaydı durdur
  const stopPlayback = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        
        // Tüm oynatma durumlarını sıfırla
        const resetStatus: {[key: string]: RecordingMetadata} = {};
        Object.keys(playbackStatus).forEach(id => {
          resetStatus[id] = {
            ...playbackStatus[id],
            isPlaying: false,
            position: 0
          };
        });
        setPlaybackStatus(resetStatus);
      }
    } catch (error) {
      console.error('Failed to stop playback', error);
    }
  };
  
  // Oynatma durumunu izle
  const onPlaybackStatusUpdate = (id: string) => (status: any) => {
    if (status.isLoaded) {
      setPlaybackStatus(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          position: status.positionMillis || 0,
          isPlaying: status.isPlaying
        }
      }));
      
      // Ses tamamlandıysa
      if (status.didJustFinish) {
        setPlaybackStatus(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            isPlaying: false,
            position: 0
          }
        }));
      }
    }
  };
  
  // Süre formatı
  const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Tarih formatı
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Toplu silme işlemi
  const deleteSelectedRecordings = async () => {
    try {
      Alert.alert(
        'Kayıtlar Silinecek',
        `${selectedRecordings.size} adet kaydı silmek istediğinizden emin misiniz?`,
        [
          {
            text: 'İptal',
            style: 'cancel'
          },
          {
            text: 'Sil',
            style: 'destructive',
            onPress: async () => {
              setLoading(true);
              try {
                // Seçili kayıtları sil
                const deletePromises = Array.from(selectedRecordings).map(id =>
                  recordingService.deleteRecording(id)
                );
                await Promise.all(deletePromises);

                // State'i güncelle
                setRecordings(prev => prev.filter(rec => !selectedRecordings.has(rec.id)));
                
                // Playback durumlarını güncelle
                setPlaybackStatus(prev => {
                  const newStatus = { ...prev };
                  selectedRecordings.forEach(id => {
                    delete newStatus[id];
                  });
                  return newStatus;
                });

                // Seçim modunu kapat
                setSelectedRecordings(new Set());
                setIsSelectionMode(false);

                Alert.alert('Başarılı', 'Seçili kayıtlar başarıyla silindi.');
              } catch (error) {
                console.error('Failed to delete recordings:', error);
                Alert.alert('Hata', 'Kayıtlar silinirken bir hata oluştu.');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to delete recordings:', error);
      Alert.alert('Hata', 'Kayıtlar silinirken bir hata oluştu.');
    }
  };

  // Kayıt seçme/seçimi kaldırma
  const toggleRecordingSelection = (id: string) => {
    setSelectedRecordings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Tüm kayıtları seç/seçimi kaldır
  const toggleSelectAll = () => {
    if (selectedRecordings.size === recordings.length) {
      setSelectedRecordings(new Set());
    } else {
      setSelectedRecordings(new Set(recordings.map(rec => rec.id)));
    }
  };

  // Animasyon efektleri
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateDelete = (callback: () => void) => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start(() => {
      animation.setValue(0);
      callback();
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.mainTitle}>Kayıtlarım</ThemedText>
          {recordings.length > 0 && (
            <TouchableOpacity
              onPress={() => setIsSelectionMode(!isSelectionMode)}
              style={styles.selectionButton}
            >
              <IconSymbol 
                name={isSelectionMode ? "xmark" : "checkmark.circle"} 
                size={20} 
                color="#FFFFFF" 
              />
              <ThemedText style={styles.selectionButtonText}>
                {isSelectionMode ? 'İptal' : 'Seç'}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {isSelectionMode && recordings.length > 0 && (
          <View style={styles.selectionToolbar}>
            <TouchableOpacity
              onPress={toggleSelectAll}
              style={styles.selectAllButton}
            >
              <IconSymbol 
                name={selectedRecordings.size === recordings.length ? "checkmark.circle.fill" : "circle"} 
                size={22} 
                color="#FFFFFF" 
              />
              <ThemedText style={styles.selectAllText}>
                {selectedRecordings.size === recordings.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
              </ThemedText>
            </TouchableOpacity>
            {selectedRecordings.size > 0 && (
              <TouchableOpacity
                onPress={deleteSelectedRecordings}
                style={styles.deleteSelectedButton}
              >
                <IconSymbol name="trash.square.fill" size={20} color="#FFFFFF" />
                <ThemedText style={styles.deleteButtonText}>
                  {selectedRecordings.size} Kaydı Sil
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <FlatList
        data={recordings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4A90E2"
          />
        }
        renderItem={({ item }) => (
          <Animated.View style={[styles.recordingItem]}>
            <View style={styles.recordingHeader}>
              <View style={styles.titleContainer}>
                <ThemedText style={styles.recordingTitle}>{item.title}</ThemedText>
                <ThemedText style={styles.dateText}>{formatDate(item.created)}</ThemedText>
              </View>
              {isSelectionMode ? (
                <TouchableOpacity
                  onPress={() => toggleRecordingSelection(item.id)}
                  style={styles.checkboxContainer}
                >
                  <View style={[
                    styles.checkbox,
                    selectedRecordings.has(item.id) && styles.checkboxSelected
                  ]}>
                    {selectedRecordings.has(item.id) && (
                      <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.itemDeleteButton}
                  onPress={() => deleteRecording(item.id)}
                >
                  <IconSymbol name="trash.square.fill" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.playbackContainer}>
              <TouchableOpacity
                onPress={() => playbackStatus[item.id]?.isPlaying 
                  ? stopPlayback() 
                  : playRecording(item)
                }
                style={[
                  styles.playButton,
                  playbackStatus[item.id]?.isPlaying && styles.playButtonActive
                ]}
              >
                <IconSymbol 
                  name={playbackStatus[item.id]?.isPlaying ? "pause.circle.fill" : "play.circle.fill"} 
                  size={28} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
              
              <View style={styles.durationContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${(playbackStatus[item.id]?.position / item.duration) * 100 || 0}%` 
                      }
                    ]} 
                  />
                </View>
                <View style={styles.timeContainer}>
                  <ThemedText style={styles.timeText}>
                    {formatDuration(playbackStatus[item.id]?.position || 0)}
                  </ThemedText>
                  <ThemedText style={styles.timeText}>
                    {formatDuration(item.duration)}
                  </ThemedText>
                </View>
              </View>
            </View>
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="waveform" size={60} color="#8E8E93" style={styles.emptyIcon} />
            <ThemedText style={styles.emptyText}>
              Henüz kayıt bulunmuyor
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  selectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
  },
  selectionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#FFFFFF',
  },
  selectionToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
  },
  selectAllText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#FFFFFF',
  },
  deleteSelectedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 16,
  },
  recordingItem: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recordingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  checkboxContainer: {
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#4A90E2',
  },
  itemDeleteButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  playButtonActive: {
    backgroundColor: '#FF9500',
  },
  durationContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(142, 142, 147, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeText: {
    fontSize: 11,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
