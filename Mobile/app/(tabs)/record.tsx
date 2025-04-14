import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Platform, 
  Modal, 
  FlatList, 
  Animated, 
  Easing, 
  StatusBar,
  SafeAreaView 
} from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { router, useNavigation } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Button } from '@/components/Button';
import { TextInputField } from '@/components/TextInputField';
import { useAuth } from '../context/AuthContext';
import { recordingService } from '../services/recordingService';
import { Layout, Spacing } from '@/constants/Spacing';
import { useThemeColor } from '@/hooks/useThemeColor';

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

  // Get theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const accentColor = useThemeColor({}, 'accent');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const errorColor = useThemeColor({}, 'error');

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
        console.log("Setting up audio recording...");
        
        // Make sure any existing recording is released
        if (recording) {
          try {
            await recording.stopAndUnloadAsync();
          } catch (err) {
            console.log('Error stopping existing recording', err);
          }
          setRecording(null);
        }
        
        // Explicitly request and check permissions first - most important step
        console.log("Requesting audio recording permissions...");
        const permissionResponse = await Audio.requestPermissionsAsync();
        console.log("Permission response:", permissionResponse);
        
        if (permissionResponse.status !== 'granted') {
          Alert.alert(
            'İzin Gerekli',
            'Ses kaydı yapabilmek için mikrofon izni gereklidir. Lütfen ayarlardan mikrofon iznini açın.',
            [{ 
              text: 'Tamam',
              onPress: () => navigation.goBack()
            }]
          );
          setAudioPermission(false);
          return;
        }
        
        setAudioPermission(true);
        console.log("Audio permission granted");
        
        // Reset Audio mode to ensure clean state
        console.log("Resetting audio mode...");
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
        console.log("Setting up audio mode for recording...");
        const audioModeResult = await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: InterruptionModeIOS.DuckOthers,
          interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false
        });
        
        console.log("Audio mode set:", audioModeResult);

        // Kullanılabilir ses giriş cihazlarını kontrol et
        const devices: InputDevice[] = [
          {
            deviceId: 'builtin',
            name: 'Telefon Mikrofonu',
            type: 'builtin'
          }
        ];
        
        console.log("Default microphone set");

        // Android için harici mikrofon kontrolü
        if (Platform.OS === 'android') {
          try {
            console.log("Checking for external microphones on Android...");
            // Harici mikrofon seçeneğini ekle
            devices.push({
              deviceId: 'external',
              name: 'Harici Mikrofon',
              type: 'wired'
            });

            // Bluetooth seçeneğini ekle - cihaz bağlı olmasa bile göster
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
        
        // Default olarak dahili mikrofonu seç - daha güvenli çalışır
        setSelectedDevice(devices[0]);
        console.log("Selected default device:", devices[0]);

      } catch (error) {
        console.error('Audio setup error:', error);
        Alert.alert('Hata', 'Ses sistemi başlatılamadı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
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
      console.log("Starting recording process...");
      
      if (!audioPermission) {
        console.log("No audio permission, requesting again...");
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('İzin Gerekli', 'Ses kaydı için mikrofon izni gerekli.');
          return;
        }
        setAudioPermission(true);
      }

      if (!selectedDevice) {
        Alert.alert('Hata', 'Lütfen bir mikrofon seçin.');
        return;
      }
      
      console.log("Using device:", selectedDevice);

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
      
      // Reset audio system completely
      await Audio.setIsEnabledAsync(false);
      await Audio.setIsEnabledAsync(true);
      
      console.log("Audio system reset");

      // Seçilen cihaza göre ses ayarlarını güncelle - high quality settings
      const audioModeResult = await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: false, // Don't reduce volume during recording
        playThroughEarpieceAndroid: selectedDevice.type !== 'builtin'
      });
      
      console.log("Audio mode set for recording:", audioModeResult);

      // Süre sıfırla
      setRecordingDuration(0);
      setAudioSamples(Array(50).fill(0));

      // Yeni kayıt başlat with much higher quality settings
      console.log('Creating new recording with enhanced quality options:');
      
      // Define enhanced high-quality recording options
      const highQualityOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 48000, // Increased from 44100
          numberOfChannels: 2,
          bitRate: 256000, // Increased from 128000 for better quality
          encodingBitRate: 256000, // Explicit bit rate for encoder
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX, // Use maximum quality
          sampleRate: 48000, // Increased from 44100
          numberOfChannels: 2,
          bitRate: 256000, // Increased from 128000
          linearPCMBitDepth: 24, // Increased from 16 for better dynamic range
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: true, // Use floating point for better precision
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 256000,
        },
        meteringEnabled: true,
      };
      
      // Create recording with enhanced quality settings
      const { recording: newRecording } = await Audio.Recording.createAsync(
        highQualityOptions,
        onRecordingStatusUpdate,
        50 // More frequent updates (50ms instead of 100ms)
      );
      
      console.log('High-quality recording started successfully');
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
    // Log status periodically (not too often)
    if (Math.random() < 0.05) { // Log ~5% of updates
      console.log('Recording status update:', 
        status.isRecording ? 
        `Recording: metering=${status.metering}, durationMillis=${status.durationMillis}` : 
        'Not recording');
    }
    
    if (status.isRecording) {
      // Metering özelliği iOS ve Android'de farklı çalışabilir
      if (status.metering !== undefined) {
        // metering değeri dB olarak gelir, genellikle -160 ile 0 arasında
        // 0'a yakın değerler daha yüksek ses anlamına gelir
        // -160 tamamen sessiz (veya mikrofon sınırının altında) anlamına gelir
        let level = Math.max(-160, status.metering); // -160 dB'den küçük değerleri kırp
        
        // Platform-based normalization
        if (Platform.OS === 'ios') {
          // iOS values typically range from -160 to 0
          level = (level + 160) / 160; // 0-1 aralığına normalize et
        } else {
          // Android values are typically lower, often around -40 to -10
          // Adjust the range to make it more sensitive
          level = (level + 40) / 40;
          level = Math.max(0, Math.min(1, level)); // Clamp between 0-1
        }
        
        // Değerleri yumuşat but make sure we see something
        const minValue = 0.05; // Ensure we always show some activity
        audioLevelRef.current = Math.max(
          minValue,
          audioLevelRef.current * 0.6 + level * 0.4 // Smooth transition
        );
        
        setAudioLevel(audioLevelRef.current);
        
        // Yeni örneği ekle ve en eskisini çıkar
        setAudioSamples(prev => {
          const newSamples = [...prev.slice(1), audioLevelRef.current];
          return newSamples;
        });
      } else {
        // Fall back to fake waveform
        setAudioSamples(prev => {
          // Create more pronounced random values to ensure visibility
          const lastValue = prev[prev.length - 1];
          const randomChange = (Math.random() - 0.5) * 0.4; // Larger changes
          let newValue = lastValue + randomChange;
          // Keep in 0.1-0.9 range to ensure visibility
          newValue = Math.max(0.1, Math.min(0.9, newValue));
          
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
        console.log('No active recording to stop');
        return;
      }
      
      console.log('Stopping recording...');
      
      // Süre sayacını durdur ve temizle
      if (durationTimer) {
        clearInterval(durationTimer);
        setDurationTimer(null);
      }
      
      try {
        // Get recording status before stopping to check duration
        const status = await recording.getStatusAsync();
        console.log('Final recording status:', status);
        
        if (status.durationMillis < 1000) {
          console.warn('Recording too short, may not have captured audio');
          Alert.alert('Uyarı', 'Kayıt çok kısa, ses kaydedilmemiş olabilir. Lütfen tekrar deneyin ve mikrofonunuzun çalıştığından emin olun.');
          await recording.stopAndUnloadAsync();
          setRecording(null);
          setRecordingStatus('idle');
          stopWaveAnimation();
          return;
        }
      } catch (statusError) {
        console.error('Error getting recording status:', statusError);
        // Devam et, bu bir kritik hata değil
      }
      
      try {
        // Kaydı durdur
        console.log('Stopping and unloading recording...');
        await recording.stopAndUnloadAsync();
        console.log('Recording stopped successfully');
      } catch (stopError) {
        console.error('Error stopping recording:', stopError);
        // Bu hatadan kurtulmak için recording nesnesini sıfırla
        setRecording(null);
        setRecordingStatus('idle');
        stopWaveAnimation();
        Alert.alert('Hata', 'Kayıt durdurulurken bir sorun oluştu. Lütfen tekrar deneyin.');
        return;
      }
      
      // Kayıt dosyasını al
      let uri;
      try {
        uri = recording.getURI();
        console.log('Recording URI:', uri);
        
        if (!uri) {
          throw new Error('Kayıt URI bulunamadı');
        }
      } catch (uriError) {
        console.error('Error getting recording URI:', uriError);
        setRecording(null);
        setRecordingStatus('idle');
        stopWaveAnimation();
        Alert.alert('Hata', 'Kayıt dosyası oluşturulamadı. Lütfen tekrar deneyin.');
        return;
      }
      
      // Try to get a content URI for Android
      let finalUri = uri;
      if (Platform.OS === 'android' && uri.startsWith('file://')) {
        try {
          console.log('Getting content URI for the recording file');
          finalUri = await FileSystem.getContentUriAsync(uri);
          console.log('Content URI generated:', finalUri);
        } catch (contentUriError) {
          console.warn('Failed to get content URI:', contentUriError);
          // Continue with file URI
        }
      }
      
      // Verify file exists and has content
      let fileSize = 0;
      try {
        if (Platform.OS !== 'web') {
          const fileInfo = await FileSystem.getInfoAsync(uri); // Use original uri for checking
          console.log('Recording file info:', fileInfo);
          
          if (!fileInfo.exists) {
            throw new Error('Kayıt dosyası oluşturulamadı');
          }
          
          if ('size' in fileInfo) {
            fileSize = fileInfo.size;
            console.log(`Recording file size: ${fileSize} bytes`);
            
            if (fileSize < 1000) { // Less than 1KB is suspicious
              console.warn('Recording file too small, may be corrupted or empty');
              Alert.alert('Uyarı', 'Kayıt dosyası çok küçük, ses kaydedilmemiş olabilir. Lütfen mikrofonunuzu kontrol edip tekrar deneyin.');
              setRecording(null);
              setRecordingStatus('idle');
              return;
            }
          }
        }
      } catch (fileError) {
        console.error('Error verifying recording file:', fileError);
        // Continue anyway, but log the error
      }
      
      // Kayıt başlığı olmadığında tarih ile başlık oluştur
      const title = recordingName.trim() || `Kayıt ${new Date().toLocaleString()}`;
      
      // Yükleme durumunu göster
      setRecordingStatus('idle');
      
      const loadingAlert = Alert.alert('Yükleniyor', 'Ses kaydınız sunucuya yükleniyor...', [
        {
          text: 'İptal',
          onPress: () => {
            console.log('Upload canceled by user');
          },
          style: 'cancel'
        }
      ]);
      
      try {
        // Veritabanına kaydet
        if (user) {
          console.log('Uploading recording...');
          console.log(`File details - URI: ${finalUri}, Size: ${fileSize} bytes, Title: ${title}, Duration: ${recordingDuration}ms`);
          
          const result = await recordingService.addRecording({
            title,
            uri: finalUri, // Use the content URI if available
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
      } catch (uploadError) {
        console.error('Failed to upload recording:', uploadError);
        
        // Daha detaylı hata mesajları
        let errorMessage = 'Bilinmeyen hata';
        let showDiagnosticOption = false;
        
        if (uploadError instanceof Error) {
          errorMessage = uploadError.message;
          
          // Network hatası kontrolü
          if (
            uploadError.message.includes('Network request failed') || 
            uploadError.message.includes('network') || 
            uploadError.message.includes('connection') ||
            uploadError.message.includes('bağlantı') ||
            uploadError.message.includes('ağ')
          ) {
            errorMessage = 'Ağ bağlantısı hatası: Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.';
            showDiagnosticOption = true;
          }
        }
        
        // Ağ hatası durumunda teşhis ekranına gitme seçeneği sun
        if (showDiagnosticOption) {
          Alert.alert(
            'Ağ Hatası', 
            `Kayıt yüklenemedi: ${errorMessage}`,
            [
              { 
                text: 'Tamam',
                style: 'cancel'
              },
              {
                text: 'Ağ Teşhis',
                onPress: () => router.push('/network-diagnostic')
              }
            ]
          );
        } else {
          Alert.alert('Hata', 'Kayıt yüklenemedi: ' + errorMessage);
        }
      } finally {
        // Stop animation when recording stops
        stopWaveAnimation();
      }
    } catch (error) {
      console.error('Unexpected error in stopRecording:', error);
      
      // Daha detaylı hata mesajları
      let errorMessage = 'Bilinmeyen hata';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert('Hata', 'Kayıt işleminde beklenmeyen bir hata oluştu: ' + errorMessage);
      
      // Hata durumunda da sayacı ve animasyonu temizle
      if (durationTimer) {
        clearInterval(durationTimer);
        setDurationTimer(null);
      }
      stopWaveAnimation();
      // Kayıt durumunu sıfırla
      setRecording(null);
      setRecordingStatus('idle');
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
        <ThemedView card elevated={2} style={styles.modalContent}>
          <ThemedText variant="h2" style={styles.modalTitle}>Mikrofon Seç</ThemedText>
          
          <FlatList
            data={inputDevices}
            keyExtractor={(item) => item.deviceId}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.deviceItem,
                  selectedDevice?.deviceId === item.deviceId && 
                  { backgroundColor: primaryColor }
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedDevice(item);
                  setShowDeviceModal(false);
                }}
              >
                <View style={styles.deviceIcon}>
                  <Feather 
                    name={item.type === 'bluetooth' ? 'bluetooth' : 'mic'} 
                    size={18} 
                    color={selectedDevice?.deviceId === item.deviceId ? '#FFFFFF' : textColor} 
                  />
                </View>
                <ThemedText 
                  variant="bodyMedium" 
                  style={[
                    selectedDevice?.deviceId === item.deviceId && { color: '#FFFFFF' }
                  ]}
                >
                  {item.name}
                </ThemedText>
              </TouchableOpacity>
            )}
          />
          
          <Button
            label="Kapat"
            variant="outline"
            onPress={() => setShowDeviceModal(false)}
            style={styles.closeButton}
          />
        </ThemedView>
      </ThemedView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.container}>
        <ThemedText variant="h1" style={styles.title}>Ses Kaydı</ThemedText>
        
        <ThemedView card elevated={1} style={styles.titleContainer}>
          <ThemedText variant="label">Kayıt Başlığı</ThemedText>
          <TextInputField
            value={recordingName}
            onChangeText={setRecordingName}
            placeholder="Kayıt başlığını girin"
            editable={recordingStatus !== 'recording'}
          />
        </ThemedView>

        <ThemedView card elevated={2} style={styles.durationContainer}>
          <ThemedText variant="caption" secondary style={styles.durationCaption}>
            SÜRE
          </ThemedText>
          <ThemedText variant="display" style={[styles.duration, { color: primaryColor }]}>
            {formatDuration(recordingDuration)}
          </ThemedText>
        </ThemedView>

        {recordingStatus !== 'idle' && (
          <ThemedView card elevated={1} style={styles.waveformContainer}>
            <View style={styles.recordingIndicator}>
              <View style={[styles.statusDot, { backgroundColor: recordingStatus === 'recording' ? primaryColor : secondaryColor }]} />
              <ThemedText style={[styles.recordingText, { color: recordingStatus === 'recording' ? primaryColor : secondaryColor }]}>
                {recordingStatus === 'recording' ? `Kayıt yapılıyor${dots}` : 'Duraklatıldı'}
              </ThemedText>
              {recordingStatus === 'recording' && (
                <Feather 
                  name="edit-3" 
                  size={16} 
                  color={primaryColor} 
                  style={styles.recordingIcon} 
                />
              )}
              {recordingStatus === 'paused' && (
                <Feather 
                  name="pause" 
                  size={16} 
                  color={secondaryColor} 
                  style={styles.recordingIcon} 
                />
              )}
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
                  : 5 + (Math.sin(i * 0.3) * 10 + 15) * animFactor;
                
                return (
                  <View 
                    key={i} 
                    style={[
                      styles.waveBar, 
                      { 
                        height,
                        backgroundColor: recordingStatus === 'recording'
                          ? primaryColor
                          : secondaryColor,
                        opacity: recordingStatus === 'recording' ? 0.5 + sample * 0.5 : 0.3 + (i % 5) / 10,
                      }
                    ]} 
                  />
                );
              })}
            </View>
          </ThemedView>
        )}

        <TouchableOpacity
          style={[styles.deviceSelector, { backgroundColor: cardColor, borderColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowDeviceModal(true);
          }}
        >
          <View style={[styles.deviceIconContainer, { backgroundColor: primaryColor }]}>
            <Feather 
              name={selectedDevice?.type === 'bluetooth' ? 'bluetooth' : 'mic'} 
              size={18} 
              color="#FFFFFF" 
            />
          </View>
          <ThemedText variant="bodyMedium" style={styles.deviceSelectorText}>
            {selectedDevice?.name || 'Mikrofon Seç'}
          </ThemedText>
          <Feather name="chevron-right" size={24} color={primaryColor} />
        </TouchableOpacity>

        <View style={styles.controlsContainer}>
          {recordingStatus === 'idle' && (
            <TouchableOpacity 
              style={[styles.recordButton, { backgroundColor: primaryColor }]} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                startRecording();
              }}
            >
              <Feather name="edit-3" size={36} color="#FFFFFF" style={styles.recordIcon} />
              <ThemedText variant="button" style={styles.buttonText}>Kaydı Başlat</ThemedText>
            </TouchableOpacity>
          )}
          
          {recordingStatus === 'recording' && (
            <View style={styles.activeControls}>
              <TouchableOpacity 
                style={[styles.controlButton, { backgroundColor: secondaryColor }]} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  pauseRecording();
                }}
              >
                <Feather name="pause" size={24} color="#FFFFFF" style={styles.controlIcon} />
                <ThemedText variant="button" style={styles.buttonText}>Duraklat</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, { backgroundColor: errorColor }]} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  stopRecording();
                }}
              >
                <FontAwesome5 name="trash-alt" size={24} color="#FFFFFF" style={styles.controlIcon} />
                <ThemedText variant="button" style={styles.buttonText}>Durdur</ThemedText>
              </TouchableOpacity>
            </View>
          )}
          
          {recordingStatus === 'paused' && (
            <View style={styles.activeControls}>
              <TouchableOpacity 
                style={[styles.controlButton, { backgroundColor: primaryColor }]} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  resumeRecording();
                }}
              >
                <Feather name="play" size={24} color="#FFFFFF" style={styles.controlIcon} />
                <ThemedText variant="button" style={styles.buttonText}>Devam Et</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.controlButton, { backgroundColor: errorColor }]} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  stopRecording();
                }}
              >
                <FontAwesome5 name="trash-alt" size={24} color="#FFFFFF" style={styles.controlIcon} />
                <ThemedText variant="button" style={styles.buttonText}>Durdur</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <ThemedView card style={styles.infoContainer}>
          <ThemedText variant="bodySmall" muted align="center">
            {recordingStatus === 'idle' 
              ? 'Kayda başlamak için butona dokunun' 
              : recordingStatus === 'recording'
                ? 'Kayıt yapılıyor... Durdurmak veya duraklatmak için butonları kullanın'
                : 'Kayıt duraklatıldı. Devam etmek veya durdurmak için seçenekleri kullanın'}
          </ThemedText>
        </ThemedView>

        <DeviceSelectionModal />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  titleContainer: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  durationContainer: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  durationCaption: {
    marginBottom: Spacing.xs,
  },
  duration: {
    fontVariant: ['tabular-nums'],
    letterSpacing: 2,
    includeFontPadding: false,
  },
  waveformContainer: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.xs,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recordingIcon: {
    marginLeft: Spacing.xs,
  },
  waveBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
  waveBar: {
    width: 4,
    borderRadius: Layout.borderRadius.sm,
    marginHorizontal: 1.5,
  },
  deviceSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  deviceIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  deviceSelectorText: {
    flex: 1,
  },
  controlsContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  recordButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordIcon: {
    marginBottom: Spacing.xs,
  },
  activeControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  controlButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlIcon: {
    marginBottom: Spacing.xs,
  },
  buttonText: {
    color: '#FFFFFF',
  },
  infoContainer: {
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: Layout.borderRadius.lg,
    borderTopRightRadius: Layout.borderRadius.lg,
    padding: Spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Spacing.sm,
  },
  deviceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  closeButton: {
    marginTop: Spacing.md,
  }
}); 