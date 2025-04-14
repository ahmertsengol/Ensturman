import 'react-native-get-random-values'; // Bu import UUID için gerekli, ilk satırda olmalı
import { Recording } from '../models/Recording';
import { api } from './api';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Önbellek süresi (milisaniye): 2 dakika
const CACHE_EXPIRY = 2 * 60 * 1000;

// Kayıtların önbellekteki anahtarı
const RECORDINGS_CACHE_KEY = 'cached_recordings';
const RECORDING_TIMESTAMP_KEY = 'cached_recordings_timestamp';

export const recordingService = {
  /**
   * Tüm ses kayıtlarını getir, önbellekten kontrol et ve gerekirse API'den al
   */
  async getAllRecordings(): Promise<Recording[]> {
    try {
      console.log('Getting all recordings...');
      
      // Öncelikle önbellekteki kayıtları kontrol et
      const cachedRecordings = await this.getCachedRecordings();
      if (cachedRecordings) {
        console.log(`Retrieved ${cachedRecordings.length} recordings from cache`);
        return cachedRecordings;
      }
      
      // Önbellekte yoksa API'den al
      const recordings = await api.getRecordings();
      console.log(`Retrieved ${recordings.length} recordings from API`);
      
      // Kayıtları önbelleğe al
      await this.cacheRecordings(recordings);
      
      return recordings;
    } catch (error) {
      console.error('Error in getAllRecordings:', error);
      
      // Hata durumunda önbellekteki kayıtları kullanmaya çalış (internet bağlantısı yoksa)
      const cachedRecordings = await this.getCachedRecordings(true);
      if (cachedRecordings) {
        console.log(`Fallback: Using ${cachedRecordings.length} cached recordings due to API error`);
        return cachedRecordings;
      }
      
      throw error;
    }
  },

  /**
   * Kayıtları önbelleğe al
   */
  async cacheRecordings(recordings: Recording[]): Promise<void> {
    try {
      await AsyncStorage.setItem(RECORDINGS_CACHE_KEY, JSON.stringify(recordings));
      await AsyncStorage.setItem(RECORDING_TIMESTAMP_KEY, Date.now().toString());
      console.log(`Cached ${recordings.length} recordings`);
    } catch (error) {
      console.error('Error caching recordings:', error);
      // Önbelleğe alma hatası kritik değil, sessizce devam et
    }
  },

  /**
   * Önbellekteki kayıtları getir
   * @param ignoreExpiry Süre aşımını kontrol etme (acil durum için)
   */
  async getCachedRecordings(ignoreExpiry = false): Promise<Recording[] | null> {
    try {
      // Önbellek zaman damgasını kontrol et
      const timestampStr = await AsyncStorage.getItem(RECORDING_TIMESTAMP_KEY);
      
      if (!ignoreExpiry && timestampStr) {
        const timestamp = parseInt(timestampStr);
        const now = Date.now();
        
        // Önbellek süresi dolmuşsa null döndür
        if (now - timestamp > CACHE_EXPIRY) {
          console.log('Cache expired, will fetch fresh data');
          return null;
        }
      }
      
      // Önbellekteki kayıtları al
      const recordingsJson = await AsyncStorage.getItem(RECORDINGS_CACHE_KEY);
      if (!recordingsJson) return null;
      
      return JSON.parse(recordingsJson);
    } catch (error) {
      console.error('Error retrieving cached recordings:', error);
      return null;
    }
  },

  /**
   * Önbelleği temizle
   */
  async clearRecordingsCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(RECORDINGS_CACHE_KEY);
      await AsyncStorage.removeItem(RECORDING_TIMESTAMP_KEY);
      console.log('Recordings cache cleared');
    } catch (error) {
      console.error('Error clearing recordings cache:', error);
    }
  },

  /**
   * Belirli bir kullanıcının ses kayıtlarını getir
   */
  async getUserRecordings(userId: string): Promise<Recording[]> {
    try {
      console.log(`Getting recordings for user ${userId}...`);
      
      // Tüm kayıtları getir (önbellekten veya API'den)
      const allRecordings = await this.getAllRecordings();
      
      // Kullanıcıya ait olanları filtrele
      const userRecordings = allRecordings.filter(rec => rec.userId === userId);
      
      console.log(`Retrieved ${userRecordings.length} recordings for user ${userId}`);
      return userRecordings;
    } catch (error) {
      console.error(`Error in getUserRecordings for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Yeni bir ses kaydı ekle
   */
  async addRecording(newRecording: Omit<Recording, 'id' | 'created'>): Promise<Recording> {
    try {
      console.log('Adding new recording:', newRecording.title);
      
      // API'ye yükle
      const result = await api.uploadRecording(
        newRecording.uri,
        newRecording.title,
        newRecording.duration
      );
      
      console.log('Recording added successfully:', result.id);
      
      // Önbelleği temizle (yeni kayıt eklendi)
      await this.clearRecordingsCache();
      
      return result;
    } catch (error) {
      console.error('Error in addRecording:', error);
      throw error;
    }
  },

  /**
   * Bir ses kaydını sil
   */
  async deleteRecording(id: string): Promise<void> {
    try {
      console.log(`Deleting recording ${id}...`);
      await api.deleteRecording(id);
      console.log(`Recording ${id} deleted successfully`);
      
      // Önbelleği temizle (kayıt silindi)
      await this.clearRecordingsCache();
    } catch (error) {
      console.error(`Error in deleteRecording for id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Kimlik doğrulama token'ını getir
   */
  async getAuthToken(): Promise<string | null> {
    try {
      return await api.getToken();
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  /**
   * Bir ses kaydını güncelle
   * Not: Backend'de şu an güncelleme endpointi bulunmuyor
   */
  async updateRecording(updatedRecording: Recording): Promise<void> {
    try {
      // Şu an backend'de güncelleme desteği yok,
      // ileride eklendiğinde burada API çağrısı yapılacak
      throw new Error('Güncelleme özelliği henüz desteklenmiyor');
    } catch (error) {
      console.error('Kayıt güncellenirken hata oluştu:', error);
      throw error;
    }
  },

  /**
   * Bir ses kaydını yerel önbelleğe indir
   */
  async downloadRecording(recordingId: string): Promise<string> {
    try {
      console.log(`Downloading recording ${recordingId} to cache...`);
      const localUri = await api.downloadAudioToCache(recordingId);
      console.log(`Recording downloaded successfully to ${localUri}`);
      return localUri;
    } catch (error) {
      console.error(`Error downloading recording ${recordingId}:`, error);
      throw error;
    }
  },

  /**
   * Tüm önbelleğe alınmış ses kayıtlarını temizle
   */
  async clearCache(): Promise<void> {
    try {
      const cacheDir = `${FileSystem.cacheDirectory}audio/`;
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(cacheDir, { idempotent: true });
        console.log('Audio cache cleared successfully');
      }
      
      // Kayıt önbelleğini de temizle
      await this.clearRecordingsCache();
    } catch (error) {
      console.error('Error clearing audio cache:', error);
      throw error;
    }
  }
};

// Default export for Expo Router
export default function RecordingService() {
  return null;
} 