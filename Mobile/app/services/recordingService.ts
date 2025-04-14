import 'react-native-get-random-values'; // Bu import UUID için gerekli, ilk satırda olmalı
import { Recording } from '../models/Recording';
import { api } from './api';
import * as FileSystem from 'expo-file-system';

export const recordingService = {
  /**
   * Tüm ses kayıtlarını getir
   */
  async getAllRecordings(): Promise<Recording[]> {
    try {
      console.log('Getting all recordings...');
      const recordings = await api.getRecordings();
      console.log(`Retrieved ${recordings.length} recordings`);
      return recordings;
    } catch (error) {
      console.error('Error in getAllRecordings:', error);
      throw error;
    }
  },

  /**
   * Belirli bir kullanıcının ses kayıtlarını getir
   */
  async getUserRecordings(userId: string): Promise<Recording[]> {
    try {
      console.log(`Getting recordings for user ${userId}...`);
      const recordings = await api.getRecordings();
      console.log(`Retrieved ${recordings.length} recordings for user ${userId}`);
      return recordings;
    } catch (error) {
      console.error(`Error in getUserRecordings for user ${userId}:`, error);
      throw error; // Hatayı yukarı ilet
    }
  },

  /**
   * Yeni bir ses kaydı ekle
   */
  async addRecording(newRecording: Omit<Recording, 'id' | 'created'>): Promise<Recording> {
    try {
      console.log('Adding new recording:', newRecording.title);
      const result = await api.uploadRecording(
        newRecording.uri,
        newRecording.title,
        newRecording.duration
      );
      console.log('Recording added successfully:', result.id);
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