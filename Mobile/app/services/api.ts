import 'react-native-get-random-values'; // Bu import UUID için gerekli, ilk satırda olmalı
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../context/AuthContext';
import { Recording } from '../models/Recording';
import * as FileSystem from 'expo-file-system';
import { Platform, NativeModules } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// API istek zaman aşımı süresi (ms)
const REQUEST_TIMEOUT = 10000;

/**
 * Zaman aşımı ile HTTP isteği
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = REQUEST_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// API URL configuration based on platform - ensure it's directly accessible
// 10.0.2.2 is equivalent to localhost for Android emulator
// For iOS simulator, localhost works fine
// For physical devices, use the actual IP of your server
let API_URL = '';

// Sunucu IP adresi - gerçek cihazlar için bu IP'yi kendi sunucunuzun IP'si ile değiştirin
// Örneğin: '192.168.1.5' veya gerçek sunucunuzun IP'si
const SERVER_IP = '192.168.1.6'; // Bilgisayarınızın gerçek yerel IP adresi
const PORT = '3000';
const API_PATH = '/api';

if (Platform.OS === 'android') {
  if (__DEV__) {
    // Android emulator için
    if (Platform.constants && Platform.constants.Brand && typeof Platform.constants.Brand === 'string' 
        && Platform.constants.Brand.toLowerCase().includes('google')) {
      // Emülatör için 10.0.2.2 kullan
      API_URL = `http://10.0.2.2:${PORT}${API_PATH}`;
    } else {
      // Gerçek cihaz için localhost yerine bilgisayarın IP adresini kullan
      API_URL = `http://${SERVER_IP}:${PORT}${API_PATH}`;
    }
  } else {
    // Production mode for physical Android device
    API_URL = `http://${SERVER_IP}:${PORT}${API_PATH}`;
  }
} else if (Platform.OS === 'ios') {
  if (__DEV__) {
    // iOS simulator
    API_URL = `http://localhost:${PORT}${API_PATH}`;
  } else {
    // Physical iOS device
    API_URL = `http://${SERVER_IP}:${PORT}${API_PATH}`;
  }
} else {
  // Web or other platform
  API_URL = `http://localhost:${PORT}${API_PATH}`;
}

console.log(`API URL configured as: ${API_URL} for platform: ${Platform.OS}, dev mode: ${__DEV__}`);

// Media types configuration for high-quality audio
const AUDIO_MIME_TYPES = {
  m4a: 'audio/m4a',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  aac: 'audio/aac',
  default: 'audio/mpeg'
};

// Helper functions for API
const logNetworkError = (error: any, endpoint: string) => {
  console.error(`Network error for ${endpoint}:`, error);
  
  if (error.message === 'Network request failed') {
    console.error(`
      ⚠️ Network request failed for ${endpoint} ⚠️
      Olası nedenler:
      - Sunucu çalışmıyor olabilir (backend'in çalıştığından emin olun)
      - API_URL yanlış yapılandırılmış olabilir (şu anki değer: ${API_URL})
      - Cihazınız internete bağlı olmayabilir
      - Güvenlik duvarı veya CORS sorunları olabilir
      - Android emülatöründe 10.0.2.2 yerine localhost kullanılmamalı
      - iOS'ta server IP yanlış yapılandırılmış olabilir
    `);
  }
  
  return error;
};

// API yanıt türleri
interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

interface RegisterResponse {
  user: User;
  token: string;
  message: string;
}

interface RecordingResponse {
  id: number;
  user_id: number;
  title: string;
  file_path: string;
  duration: number;
  created_at: string;
}

// API fonksiyonları
export const api = {
  // Test bağlantısı
  async testConnection() {
    try {
      console.log('Testing API connection to:', `${API_URL}/auth/test`);
      
      try {
        const response = await fetchWithTimeout(`${API_URL}/auth/test`);
        
        const data = await response.json();
        console.log('API test response:', data);
        
        return {
          success: response.ok,
          status: response.status,
          data,
          url: `${API_URL}/auth/test`
        };
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.error('API test request timed out after 10 seconds');
          return {
            success: false,
            error: 'Timeout',
            message: 'API yanıt vermedi (10 saniye zaman aşımı)',
            url: `${API_URL}/auth/test`
          };
        }
        
        throw logNetworkError(error, 'testConnection');
      }
    } catch (error) {
      console.error('API test connection error:', error);
      return {
        success: false,
        error: String(error),
        url: `${API_URL}/auth/test`
      };
    }
  },

  // Kullanıcı girişi
  async loginUser(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetchWithTimeout(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Giriş yapılamadı');
      }

      return data;
    } catch (error) {
      console.error('API login error:', error);
      throw error;
    }
  },

  // Kullanıcı kaydı
  async registerUser(name: string, email: string, password: string): Promise<RegisterResponse> {
    try {
      const response = await fetchWithTimeout(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kayıt yapılamadı');
      }

      return data;
    } catch (error) {
      console.error('API register error:', error);
      throw error;
    }
  },

  // Token ile kimlik doğrulama kontrolü
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  // Token alma
  async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('token');
      console.debug('Retrieved token:', token ? 'exists' : 'null');
      return token;
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  },

  // Token kaldırma
  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('token');
      console.debug('Token removed successfully');
    } catch (error) {
      console.error('Error removing token:', error);
      throw error;
    }
  },

  // Ağ bağlantısı durumunu kontrol et
  async checkNetworkStatus() {
    try {
      const state = await NetInfo.fetch();
      
      console.log('Connection Type:', state.type);
      console.log('Is Connected?', state.isConnected);
      // NetInfo types may not include ipAddress in all connection types
      // Access it safely based on connection type
      console.log('IP Address:', 
        state.type === 'wifi' || state.type === 'cellular' 
          ? (state.details as any)?.ipAddress || 'Unknown'
          : 'Not available for this connection type'
      );
      
      // Android'de sunucuya ping atma
      if (Platform.OS === 'android') {
        try {
          const serverIP = API_URL.replace(/(^\w+:|^)\/\//, '').split(':')[0]; // URL'den IP kısmını çıkart
          const { PingModule } = NativeModules;
          
          if (PingModule) {
            const pingResult = await PingModule.pingHost(serverIP);
            console.log(`Ping result to ${serverIP}:`, pingResult);
          }
        } catch (pingError) {
          console.log('Ping error:', pingError);
        }
      }
      
      return {
        isConnected: state.isConnected,
        type: state.type,
        details: state.details || {},
        apiUrl: API_URL
      };
    } catch (error) {
      console.error('Error checking network status:', error);
      return {
        isConnected: false,
        error: String(error)
      };
    }
  },

  // Kimlik doğrulamalı ses URL'si oluştur
  async getAuthenticatedAudioUrl(recordingId: string): Promise<string> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('Oturum açmanız gerekiyor');
      }
      
      // Token'ı doğrudan URL içine gömmek yerine API çağrıları için headers kullan
      // ve doğrudan dosya URI'si döndür
      return `${API_URL}/recordings/file/${recordingId}`;
    } catch (error) {
      console.error('Error creating authenticated URL:', error);
      throw error;
    }
  },

  // Ses dosyasını doğrudan indir ve FileSystem'e kaydet
  async downloadAudioToCache(recordingId: string): Promise<string> {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('Oturum açmanız gerekiyor');
      }
      
      // Create cache directory if it doesn't exist
      const cacheDir = `${FileSystem.cacheDirectory}audio/`;
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      }
      
      // Define local path for cached file
      const localUri = `${cacheDir}recording-${recordingId}.m4a`;
      
      // Check if already cached
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) {
        console.log(`Using cached audio file: ${localUri}, size: ${
          'size' in fileInfo ? fileInfo.size : 'unknown'
        } bytes`);
        
        // Verify the file is valid (not empty or corrupted)
        if ('size' in fileInfo && fileInfo.size < 1000) {
          console.warn("Cached file is too small, might be corrupted. Re-downloading...");
          // Delete the potentially corrupted file
          await FileSystem.deleteAsync(localUri, { idempotent: true });
        } else {
          return localUri;
        }
      }
      
      // Download file with authentication headers
      console.log(`Downloading audio file ${recordingId} to cache`);
      
      // Use direct fetch first to check if file is accessible
      const testResponse = await fetch(
        `${API_URL}/recordings/file/${recordingId}`,
        { 
          method: 'HEAD',
          headers: { 'x-auth-token': token }
        }
      );
      
      if (!testResponse.ok) {
        console.error(`Server returned ${testResponse.status} for audio file`);
        throw new Error(`Server error: ${testResponse.status}`);
      }
      
      console.log("Server acknowledges file exists, downloading now...");
      
      const downloadResumable = FileSystem.createDownloadResumable(
        `${API_URL}/recordings/file/${recordingId}`,
        localUri,
        {
          headers: {
            'x-auth-token': token
          }
        }
      );
      
      const result = await downloadResumable.downloadAsync();
      if (!result || !result.uri) {
        throw new Error('Ses dosyası indirilemedi');
      }
      
      // Verify downloaded file
      const downloadedFileInfo = await FileSystem.getInfoAsync(result.uri);
      console.log(`Audio file downloaded to: ${result.uri}, size: ${
        downloadedFileInfo.exists && 'size' in downloadedFileInfo ? downloadedFileInfo.size : 'unknown'
      } bytes`);
      
      if (!downloadedFileInfo.exists || 
          ('size' in downloadedFileInfo && downloadedFileInfo.size < 1000)) {
        throw new Error('İndirilen dosya geçersiz veya hasarlı');
      }
      
      return result.uri;
    } catch (error) {
      console.error('Error downloading audio file:', error);
      throw error;
    }
  },

  // Kayıtları listele
  async getRecordings(): Promise<Recording[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.error('No auth token found');
        throw new Error('Oturum açmanız gerekiyor');
      }

      console.log('Fetching recordings from API...');
      const response = await fetchWithTimeout(`${API_URL}/recordings`, {
        headers: {
          'x-auth-token': token
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.message || 'Kayıtlar getirilemedi');
      }

      const data = await response.json();
      console.log(`Received ${data.length} recordings from API`);

      // API yanıtını Recording modeline dönüştür
      const recordings: Recording[] = data.map((item: RecordingResponse) => ({
        id: item.id.toString(),
        title: item.title,
        uri: `${API_URL}/recordings/file/${item.id}?token=${token}`,
        duration: item.duration,
        created: item.created_at,
        userId: item.user_id.toString()
      }));

      return recordings;
    } catch (error) {
      console.error('API get recordings error:', error);
      throw error;
    }
  },

  // Kayıtları önceden yükle (preload) - performans optimizasyonu
  async preloadFirstRecordingAudio(recordings: Recording[]): Promise<void> {
    if (!recordings || recordings.length === 0) return;
    
    try {
      // İlk kayıdı indirmeye başla (async)
      console.log(`Preloading first recording: ${recordings[0].id}`);
      this.downloadAudioToCache(recordings[0].id)
        .then((uri) => console.log(`Preload complete: ${uri}`))
        .catch((error) => console.warn(`Preload error: ${error}`));
    } catch (error) {
      console.warn('Error starting audio preload:', error);
      // Sessiz bir şekilde hataları yoksay - bu sadece performans optimizasyonu
    }
  },

  // Kayıt detayını getir
  async getRecording(id: string): Promise<Recording> {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('Oturum açmanız gerekiyor');

      const response = await fetch(`${API_URL}/recordings/${id}`, {
        headers: {
          'x-auth-token': token
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kayıt getirilemedi');
      }

      // API yanıtını Recording modeline dönüştür
      const recording: Recording = {
        id: data.id.toString(),
        title: data.title,
        uri: `${API_URL}/recordings/file/${data.id}?token=${token}`,
        duration: data.duration,
        created: data.created_at,
        userId: data.user_id.toString()
      };

      return recording;
    } catch (error) {
      console.error('API get recording error:', error);
      throw error;
    }
  },

  // Yeni kayıt yükleme
  async uploadRecording(uri: string, title: string, duration: number): Promise<Recording> {
    try {
      console.log(`[API] Starting upload process for "${title}" from ${uri}`);
      
      const token = await this.getToken();
      if (!token) {
        console.error('[API] No auth token found for upload');
        throw new Error('Oturum açmanız gerekiyor');
      }

      // 1. Adım: Dosyanın var olduğunu ve erişilebilir olduğunu doğrula
      if (Platform.OS !== 'web') {
        try {
          console.log(`[API] Verifying file exists: ${uri}`);
          const fileInfo = await FileSystem.getInfoAsync(uri);
          
          if (!fileInfo.exists) {
            console.error('[API] File does not exist:', uri);
            throw new Error('Yüklenecek ses dosyası bulunamadı');
          }
          
          if ('size' in fileInfo) {
            console.log(`[API] File size: ${fileInfo.size} bytes`);
            if (fileInfo.size < 100) {
              console.error('[API] File is too small, likely corrupted:', fileInfo.size);
              throw new Error('Ses dosyası boş veya hasarlı görünüyor');
            }
          }
        } catch (fileCheckError) {
          console.error('[API] Error checking file:', fileCheckError);
          throw new Error(`Ses dosyası kontrolünde hata: ${fileCheckError instanceof Error ? fileCheckError.message : 'Bilinmeyen hata'}`);
        }
      }
      
      // 2. Adım: Dosya türünü belirle ve MIME tipini ayarla
      let mimeType = AUDIO_MIME_TYPES.m4a; // Default olarak bu formatı kullan
      let extension = 'm4a';
      
      try {
        extension = uri.split('.').pop()?.toLowerCase() || 'm4a';
        if (extension in AUDIO_MIME_TYPES) {
          mimeType = AUDIO_MIME_TYPES[extension as keyof typeof AUDIO_MIME_TYPES];
        }
        console.log(`[API] Determined file type: ${extension}, MIME: ${mimeType}`);
      } catch (mimeError) {
        console.warn('[API] Error determining MIME type:', mimeError);
        // Devam et, varsayılan MIME tipi kullanılacak
      }
      
      // 3. Adım: Android için URI'yi doğru formata getir
      let processedUri = uri;
      if (Platform.OS === 'android') {
        if (uri.startsWith('file://')) {
          try {
            // Android'de dosya URI'lerini content URI'lerine dönüştürmek gerekiyor
            console.log('[API] Converting file URI to content URI on Android');
            processedUri = await FileSystem.getContentUriAsync(uri);
            console.log('[API] Content URI generated:', processedUri);
          } catch (uriError) {
            console.warn('[API] Failed to get content URI:', uriError);
            console.log('[API] Will attempt to use file URI directly');
            // Devam et, dosya URI'si kullanılacak
          }
        }
      } else if (Platform.OS === 'ios' && uri.startsWith('file://')) {
        // iOS için file:// önekini kaldır
        processedUri = uri.replace('file://', '');
        console.log('[API] iOS file path processed:', processedUri);
      }
      
      // 4. Adım: FormData oluştur ve dosyayı ekle
      console.log(`[API] Preparing FormData with URI: ${processedUri}`);
      const formData = new FormData();
      
      // Dosya nesnesini oluştur
      const fileInfo = {
        uri: processedUri,
        type: mimeType,
        name: `recording-${Date.now()}.${extension}`,
      };
      
      console.log('[API] File object prepared:', JSON.stringify(fileInfo));
      
      // @ts-ignore - FormData.append için tip uyumsuzluğu
      formData.append('audio', fileInfo);
      formData.append('title', title);
      formData.append('duration', duration.toString());
      
      console.log('[API] FormData prepared, sending to API...');
      
      // 5. Adım: API isteği gönder
      try {
        console.log(`[API] POST request to ${API_URL}/recordings`);
        const response = await fetch(`${API_URL}/recordings`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token
          },
          body: formData
        });
        
        console.log(`[API] Upload response status: ${response.status}`);
        
        const responseText = await response.text(); // Önce text olarak al
        let data;
        
        try {
          // JSON olarak parse et
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.error('[API] Error parsing JSON response:', jsonError);
          console.log('[API] Raw response:', responseText);
          throw new Error('Sunucu yanıtı geçersiz format içeriyor');
        }
        
        if (!response.ok) {
          console.error('[API] Error response from server:', data);
          throw new Error(data.message || `Sunucu hatası: ${response.status}`);
        }
        
        console.log('[API] Recording uploaded successfully with ID:', data.id);
        
        // 6. Adım: API yanıtını doğrula ve Recording modeline dönüştür
        if (!data.id) {
          console.error('[API] Missing ID in server response');
          throw new Error('Sunucu yanıtı geçersiz (ID eksik)');
        }
        
        // API yanıtını Recording modeline dönüştür
        const recording: Recording = {
          id: data.id.toString(),
          title: data.title,
          uri: `${API_URL}/recordings/file/${data.id}?token=${token}`,
          duration: data.duration,
          created: data.created_at,
          userId: data.user_id.toString()
        };
        
        return recording;
      } catch (fetchError: any) {
        // Fetch hatalarını özel olarak ele al
        if (fetchError.message === 'Network request failed') {
          console.error('[API] Network request failed during upload');
          throw new Error('Ağ bağlantısı hatası: Sunucuya bağlanılamadı veya yükleme zaman aşımına uğradı');
        }
        
        throw logNetworkError(fetchError, 'uploadRecording');
      }
    } catch (error) {
      console.error('[API] Error in uploadRecording:', error);
      throw error;
    }
  },

  // Kayıt sil
  async deleteRecording(id: string): Promise<void> {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('Oturum açmanız gerekiyor');

      const response = await fetch(`${API_URL}/recordings/${id}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kayıt silinemedi');
      }
    } catch (error) {
      console.error('API delete recording error:', error);
      throw error;
    }
  }
};

// Default export for Expo Router
export default function ApiService() {
  return null;
} 