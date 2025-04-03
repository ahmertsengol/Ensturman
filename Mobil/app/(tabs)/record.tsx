import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Alert, Platform, Modal, FlatList, Animated, Easing } from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { router, useNavigation } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '../context/AuthContext';
import { recordingService } from '../services/recordingService';

interface InputDevice {
  deviceId: string;
  name: string;
  type: 'bluetooth' | 'wired' | 'builtin';
}

export default function RecordScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'paused'>('idle');
  const [audioPermission, setAudioPermission] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [durationTimer, setDurationTimer] = useState<NodeJS.Timeout | null>(null);
  const [inputDevices, setInputDevices] = useState<InputDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<InputDevice | null>(null);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [recordingName, setRecordingName] = useState('');
  const [waveAnimation] = useState(new Animated.Value(0));
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const [dots, setDots] = useState('.');
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioSamples, setAudioSamples] = useState<number[]>(Array(50).fill(0));
  const audioLevelRef = useRef(0);
  const dotsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer for the recording indicator dots
  useEffect(() => {
    // Clear any existing timer first
    if (dotsTimerRef.current) {
      clearInterval(dotsTimerRef.current);
      dotsTimerRef.current = null;
    }
    
    if (recordingStatus === 'recording') {
      dotsTimerRef.current = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '.' : prev + '.');
      }, 500);
    } else {
      setDots('.');
    }
    
    return () => {
      if (dotsTimerRef.current) {
        clearInterval(dotsTimerRef.current);
        dotsTimerRef.current = null;
      }
    };
  }, [recordingStatus]);

  // Ses kayıt izinlerini ve cihazları al
  useEffect(() => {
    const setupAudio = async () => {
      try {
        // Make sure any existing recording is released
        if (recording) {
          try {
            await recording.stopAndUnloadAsync();
          } catch (err) {
            console.log('Error stopping existing recording', err);
          }
          setRecording(null);
        }
        
        // Reset Audio mode to ensure clean state
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: false,
          staysActiveInBackground: false,
          interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false
        });
        
        // Audio Session ayarları
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false
        });

        // Mikrofon izinlerini al
        const { status } = await Audio.requestPermissionsAsync();
        setAudioPermission(status === 'granted');
        
        if (status !== 'granted') {
          Alert.alert(
            'İzin Gerekli',
            'Ses kaydı yapabilmek için mikrofon izni gereklidir.',
            [{ text: 'Tamam' }]
          );
          return;
        }

        // Kullanılabilir ses giriş cihazlarını kontrol et
        const devices: InputDevice[] = [
          {
            deviceId: 'builtin',
            name: 'Telefon Mikrofonu',
            type: 'builtin'
          }
        ];

        // Android için harici mikrofon kontrolü
        if (Platform.OS === 'android') {
          try {
            // Android ses yönlendirme durumunu kontrol et
            const audioMode = await Audio.setAudioModeAsync({
              allowsRecordingIOS: true,
              playsInSilentModeIOS: true,
              staysActiveInBackground: true,
              interruptionModeIOS: InterruptionModeIOS.DuckOthers,
              interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
              shouldDuckAndroid: true,
              playThroughEarpieceAndroid: true
            });

            // Harici mikrofon seçeneğini ekle
            devices.push({
              deviceId: 'external',
              name: 'Harici Mikrofon',
              type: 'wired'
            });

            // Bluetooth seçeneğini ekle
            devices.push({
              deviceId: 'bluetooth',
              name: 'Bluetooth Mikrofon',
              type: 'bluetooth'
            });
          } catch (error) {
            console.warn('Android audio routing check failed:', error);
          }
        }

        setInputDevices(devices);
        // Eğer harici mikrofon varsa onu seç, yoksa dahili mikrofonu seç
        const externalDevice = devices.find(d => d.deviceId === 'external') || 
                             devices.find(d => d.deviceId === 'bluetooth');
        setSelectedDevice(externalDevice || devices[0]);

      } catch (error) {
        console.error('Audio setup error:', error);
        Alert.alert('Hata', 'Ses sistemi başlatılamadı.');
      }
    };

    setupAudio();
    
    // Cleanup on component unmount
    return () => {
      if (recording) {
        try {
          recording.stopAndUnloadAsync().catch(err => 
            console.error('Error cleaning up recording:', err)
          );
        } catch (err) {
          console.error('Error in cleanup:', err);
        }
      }
      if (durationTimer) {
        clearInterval(durationTimer);
      }
      if (dotsTimerRef.current) {
        clearInterval(dotsTimerRef.current);
      }
    };
  }, []);

  // Kayıt başlat
  const startRecording = async () => {
    try {
      if (!audioPermission) {
        Alert.alert('İzin Gerekli', 'Ses kaydı için mikrofon izni gerekli.');
        return;
      }

      if (!selectedDevice) {
        Alert.alert('Hata', 'Lütfen bir mikrofon seçin.');
        return;
      }

      // Eğer hala aktif bir kayıt varsa önce temizle
      if (recording) {
        console.log('Cleaning up existing recording before starting new one');
        try {
          await recording.stopAndUnloadAsync();
        } catch (err) {
          console.warn('Error stopping existing recording:', err);
          // Continue anyway
        }
        setRecording(null);
      }
      
      // Reset anything that might be in memory
      await Audio.setIsEnabledAsync(false);
      await Audio.setIsEnabledAsync(true);

      console.log('Starting recording with device:', selectedDevice);
      
      // Seçilen cihaza göre ses ayarlarını güncelle
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: selectedDevice.type !== 'builtin'
      });

      // Süre sıfırla
      setRecordingDuration(0);
      setAudioSamples(Array(50).fill(0));

      // Yeni kayıt başlat
      console.log('Creating new recording...');
      const { recording: newRecording } = await Audio.Recording.createAsync(
        {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
          android: {
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android,
            extension: '.m4a',
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
          ios: {
            ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
            extension: '.m4a',
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
          },
        },
        onRecordingStatusUpdate
      );
      
      console.log('Recording started successfully');
      setRecording(newRecording);
      setRecordingStatus('recording');
      
      // Süre sayacını başlat
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1000);
      }, 1000);
      
      setDurationTimer(timer);

      // Start wave animation
      startWaveAnimation();
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Hata', 'Kayıt başlatılamadı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  };

  // Audio seviyesini izle
  const onRecordingStatusUpdate = (status: any) => {
    if (status.isRecording) {
      // Metering özelliği iOS ve Android'de farklı çalışabilir
      if (status.metering !== undefined) {
        // metering değeri dB olarak gelir, genellikle -160 ile 0 arasında
        // 0'a yakın değerler daha yüksek ses anlamına gelir
        // -160 tamamen sessiz (veya mikrofon sınırının altında) anlamına gelir
        let level = Math.max(-160, status.metering); // -160 dB'den küçük değerleri kırp
        level = (level + 160) / 160; // 0-1 aralığına normalize et
        
        // Değerleri yumuşat
        audioLevelRef.current = audioLevelRef.current * 0.6 + level * 0.4; // Daha hızlı tepki için ağırlıkları değiştirdim
        setAudioLevel(audioLevelRef.current);
        
        // Yeni örneği ekle ve en eskisini çıkar
        setAudioSamples(prev => {
          const newSamples = [...prev.slice(1), audioLevelRef.current];
          return newSamples;
        });
      } else {
        // Metering yoksa sahte dalga hareketi oluştur
        setAudioSamples(prev => {
          // Rastgele değerler oluştur, ama tamamen rastgele değil
          // Önceki değerle bağlantılı olsun ki daha doğal görünsün
          const lastValue = prev[prev.length - 1];
          const randomChange = (Math.random() - 0.5) * 0.3; // Daha büyük değişimler için aralığı genişlettim
          let newValue = lastValue + randomChange;
          // 0-1 aralığında tut
          newValue = Math.max(0.05, Math.min(0.95, newValue));
          
          return [...prev.slice(1), newValue];
        });
      }
    }
  };

  // Explicitly start animation
  const startWaveAnimation = () => {
    console.log('Starting wave animation');
    // Cancel any existing animation
    if (animationRef.current) {
      animationRef.current.stop();
    }
    
    // Create and store animation reference
    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    
    // Start the animation
    animationRef.current.start();
  };

  // Explicitly stop animation
  const stopWaveAnimation = () => {
    console.log('Stopping wave animation');
    if (animationRef.current) {
      animationRef.current.stop();
    }
    waveAnimation.setValue(0);
  };

  // Kaydı duraklat
  const pauseRecording = async () => {
    try {
      if (!recording) return;
      
      await recording.pauseAsync();
      setRecordingStatus('paused');
      
      // Süre sayacını durdur
      if (durationTimer) {
        clearInterval(durationTimer);
        setDurationTimer(null);
      }
      
      // Stop animation when paused
      stopWaveAnimation();
    } catch (error) {
      console.error('Failed to pause recording', error);
    }
  };

  // Kaydı devam ettir
  const resumeRecording = async () => {
    try {
      if (!recording) return;
      
      await recording.startAsync();
      setRecordingStatus('recording');
      
      // Süre sayacını başlat
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1000);
      }, 1000);
      
      setDurationTimer(timer);
      
      // Restart animation when resumed
      startWaveAnimation();
    } catch (error) {
      console.error('Failed to resume recording', error);
    }
  };

  // Kaydı durdur ve kaydet
  const stopRecording = async () => {
    try {
      if (!recording) {
        return;
      }
      
      console.log('Stopping recording...');
      
      // Süre sayacını durdur ve temizle
      if (durationTimer) {
        clearInterval(durationTimer);
        setDurationTimer(null);
      }
      
      await recording.stopAndUnloadAsync();
      
      // Kayıt dosyasını al
      const uri = recording.getURI();
      console.log('Recording URI:', uri);
      
      if (!uri) {
        throw new Error('Kayıt URI bulunamadı');
      }
      
      // Kayıt başlığı olmadığında tarih ile başlık oluştur
      const title = recordingName.trim() || `Kayıt ${new Date().toLocaleString()}`;
      
      // Yükleme durumunu göster
      setRecordingStatus('idle');
      Alert.alert('Yükleniyor', 'Ses kaydınız sunucuya yükleniyor...');
      
      // Veritabanına kaydet
      if (user) {
        console.log('Uploading recording...');
        const result = await recordingService.addRecording({
          title,
          uri,
          duration: recordingDuration,
          userId: user.id
        });
        
        console.log('Upload successful:', result);
        
        // Kayıt durumunu sıfırla
        setRecording(null);
        setRecordingDuration(0);
        setRecordingName('');
        
        // Başarı mesajı göster ve ana ekrana dön
        Alert.alert(
          'Kayıt Tamamlandı', 
          'Ses kaydınız başarıyla yüklendi.',
          [
            { 
              text: 'Tamam',
              onPress: () => {
                // Ana ekrana dön
                navigation.goBack();
              }
            }
          ]
        );
      }
      
      // Stop animation when recording stops
      stopWaveAnimation();
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Hata', 'Kayıt durdurulamadı veya yüklenemedi: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
      
      // Hata durumunda da sayacı ve animasyonu temizle
      if (durationTimer) {
        clearInterval(durationTimer);
        setDurationTimer(null);
      }
      stopWaveAnimation();
    }
  };

  // Süre formatını düzenle (ms -> mm:ss)
  const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Mikrofon seçim modalı
  const DeviceSelectionModal = () => (
    <Modal
      visible={showDeviceModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDeviceModal(false)}
    >
      <ThemedView style={styles.modalContainer}>
        <ThemedView style={styles.modalContent}>
          <ThemedText type="title" style={styles.modalTitle}>Mikrofon Seç</ThemedText>
          
          <FlatList
            data={inputDevices}
            keyExtractor={(item) => item.deviceId}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.deviceItem,
                  selectedDevice?.deviceId === item.deviceId && styles.selectedDevice
                ]}
                onPress={() => {
                  setSelectedDevice(item);
                  setShowDeviceModal(false);
                }}
              >
                <IconSymbol
                  name={item.type === 'bluetooth' ? 'airpodspro' : 'mic.fill'}
                  size={24}
                  color={selectedDevice?.deviceId === item.deviceId ? '#FFFFFF' : '#4A90E2'}
                />
                <ThemedText style={[
                  styles.deviceName,
                  selectedDevice?.deviceId === item.deviceId && styles.selectedDeviceText
                ]}>
                  {item.name}
                </ThemedText>
              </TouchableOpacity>
            )}
          />
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowDeviceModal(false)}
          >
            <ThemedText style={styles.closeButtonText}>Kapat</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </Modal>
  );

  // Define animation interpolations
  const waveScale = waveAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  const waveOpacity = waveAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.8, 0.4],
  });

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F5A742', dark: '#8B4513' }}
      headerImage={<View />}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Ses Kaydı</ThemedText>
        
        <ThemedView style={styles.titleContainer}>
          <TextInput
            style={styles.titleInput}
            placeholder="Kayıt Başlığı"
            placeholderTextColor="#8E8E93"
            value={recordingName}
            onChangeText={setRecordingName}
            editable={recordingStatus !== 'recording'}
          />
        </ThemedView>

        <ThemedView style={styles.durationContainer}>
          <ThemedText style={styles.durationCaption}>
            SÜRE
          </ThemedText>
          <ThemedText style={styles.duration}>
            {formatDuration(recordingDuration)}
          </ThemedText>
        </ThemedView>

        {recordingStatus !== 'idle' && (
          <ThemedView style={styles.waveformContainer}>
            <View style={styles.recordingIndicator}>
              <View style={styles.statusDot} />
              <ThemedText style={styles.recordingText}>
                Kayıt yapılıyor{dots}
              </ThemedText>
            </View>
            <View style={styles.waveBars}>
              {audioSamples.map((sample, i) => {
                // Animasyon faktörü - daha hızlı animasyon için frekansı artırdım
                const animFactor = recordingStatus === 'recording' 
                  ? 1 
                  : Math.sin(Date.now() / 300 + i * 0.15) * 0.5 + 0.5;
                
                // Ses seviyesine göre yükseklik hesapla
                const height = recordingStatus === 'recording'
                  ? 5 + (sample * animFactor * 70) // Sample 0-1 arası bir değer
                  : 5 + (Math.sin(i * 0.3) * 10 + 15) * animFactor; // Daha hızlı hareket için frekansı artırdım
                
                // Renk hesapla - ses seviyesine göre değişim
                const intensity = sample * animFactor;
                const speed = (Date.now() % 3000) / 3000; // 3 saniyede tamamlanan renk döngüsü
                
                return (
                  <View 
                    key={i} 
                    style={[
                      styles.waveBar, 
                      { 
                        height,
                        backgroundColor: recordingStatus === 'recording'
                          ? `rgba(65, 132, 255, ${0.5 + intensity * 0.5})` // Mavi ton, ses yükseldikçe opaklık artar
                          : `rgba(126, 167, 255, ${0.3 + (i % 5) / 10})`, // Durgun halde daha açık mavi
                        marginHorizontal: 0.5,
                      }
                    ]} 
                  />
                );
              })}
            </View>
          </ThemedView>
        )}

        <TouchableOpacity
          style={styles.deviceSelector}
          onPress={() => setShowDeviceModal(true)}
        >
          <IconSymbol
            name={selectedDevice?.type === 'bluetooth' ? 'airpodspro' : 'mic.fill'}
            size={24}
            color="#4A90E2"
          />
          <ThemedText style={styles.deviceSelectorText}>
            {selectedDevice?.name || 'Mikrofon Seç'}
          </ThemedText>
          <IconSymbol name="chevron.right" size={20} color="#4A90E2" />
        </TouchableOpacity>

        <ThemedView style={styles.controlsContainer}>
          {recordingStatus === 'idle' && (
            <TouchableOpacity 
              style={styles.recordButton} 
              onPress={startRecording}
            >
              <IconSymbol name="mic.fill" size={36} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>Kaydı Başlat</ThemedText>
            </TouchableOpacity>
          )}
          
          {recordingStatus === 'recording' && (
            <ThemedView style={styles.activeControls}>
              <TouchableOpacity 
                style={styles.controlButton} 
                onPress={pauseRecording}
              >
                <IconSymbol name="pause.fill" size={28} color="#FFFFFF" />
                <ThemedText style={styles.buttonText}>Duraklat</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, styles.stopButton]} 
                onPress={stopRecording}
              >
                <IconSymbol name="stop.fill" size={28} color="#FFFFFF" />
                <ThemedText style={styles.buttonText}>Durdur</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
          
          {recordingStatus === 'paused' && (
            <ThemedView style={styles.activeControls}>
              <TouchableOpacity 
                style={styles.controlButton} 
                onPress={resumeRecording}
              >
                <IconSymbol name="play.fill" size={28} color="#FFFFFF" />
                <ThemedText style={styles.buttonText}>Devam Et</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, styles.stopButton]} 
                onPress={stopRecording}
              >
                <IconSymbol name="stop.fill" size={28} color="#FFFFFF" />
                <ThemedText style={styles.buttonText}>Durdur</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          )}
        </ThemedView>
        
        <ThemedView style={styles.infoContainer}>
          <ThemedText style={styles.infoText}>
            {recordingStatus === 'idle' 
              ? 'Kayda başlamak için butona dokunun' 
              : recordingStatus === 'recording'
                ? 'Kayıt yapılıyor...'
                : 'Kayıt duraklatıldı'}
          </ThemedText>
        </ThemedView>

        <DeviceSelectionModal />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginVertical: 20,
  },
  headerImageContainer: {
    position: 'absolute',
    bottom: -20,
    left: -35,
    width: '100%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 0,
  },
  waveContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveIcon: {
    opacity: 0.9,
  },
  baseWaveIcon: {
    position: 'absolute',
    opacity: 0.3,
  },
  titleContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  titleInput: {
    fontSize: 18,
    color: '#1A1A1A',
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
    paddingVertical: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  durationContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: 120,
  },
  durationCaption: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
    fontWeight: '500',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  duration: {
    fontSize: 48,
    fontWeight: '700',
    color: '#4A90E2',
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    includeFontPadding: false,
    lineHeight: 56,
  },
  recordingInfo: {
    alignItems: 'center',
    marginVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlsContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  recordButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 50,
    padding: 20,
    alignItems: 'center',
    width: 150,
    height: 150,
    justifyContent: 'center',
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  controlButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 50,
    padding: 20,
    alignItems: 'center',
    width: 120,
    height: 120,
    justifyContent: 'center',
  },
  stopButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: 'white',
    marginTop: 8,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoText: {
    textAlign: 'center',
    fontSize: 16,
  },
  deviceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceSelectorText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  selectedDevice: {
    backgroundColor: '#4A90E2',
  },
  deviceName: {
    marginLeft: 10,
    fontSize: 16,
  },
  selectedDeviceText: {
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#E74C3C',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  waveformContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4184FF', // Parlak mavi
    marginRight: 8,
  },
  recordingText: {
    fontSize: 13,
    color: '#4184FF', // Parlak mavi
    fontWeight: '600',
  },
  waveBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 70,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  waveBar: {
    width: 3.5,
    borderRadius: 8,
    marginHorizontal: 1,
  },
}); 