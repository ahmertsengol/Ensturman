import 'react-native-get-random-values'; // Bu import UUID için gerekli, ilk satırda olmalı
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../context/AuthContext';
import { Recording } from '../models/Recording';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

// API URL
const API_URL = 'http://10.0.2.2:5000/api';

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
    const response = await fetch(`${API_URL}/auth/test`);
    return response.json();
  },

  // Kullanıcı girişi
  async loginUser(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
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
      const response = await fetch(`${API_URL}/auth/register`, {
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

  // Kayıtları listele
  async getRecordings(): Promise<Recording[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.error('No auth token found');
        throw new Error('Oturum açmanız gerekiyor');
      }

      console.log('Fetching recordings from API...');
      const response = await fetch(`${API_URL}/recordings`, {
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
        uri: `${API_URL}/recordings/file/${item.id}`,
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
        uri: `http://10.0.2.2:5000/api/recordings/file/${data.id}`,
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

  // Yeni kayıt yükle
  async uploadRecording(uri: string, title: string, duration: number): Promise<Recording> {
    try {
      const token = await this.getToken();
      if (!token) throw new Error('Oturum açmanız gerekiyor');

      console.log('Preparing to upload recording:', { uri, title, duration });

      // Dosya uzantısını kontrol et
      const fileExtension = uri.split('.').pop()?.toLowerCase() || 'm4a';
      const mimeType = fileExtension === 'mp3' ? 'audio/mp3' : 'audio/m4a';

      // Ses dosyasını form data olarak ekle
      const formData = new FormData();
      formData.append('audio', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: mimeType,
        name: `recording.${fileExtension}`,
      } as any);
      
      formData.append('title', title);
      formData.append('duration', duration.toString());

      console.log('Sending request to server...');
      const response = await fetch(`${API_URL}/recordings`, {
        method: 'POST',
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        body: formData,
      });

      console.log('Server response status:', response.status);
      const data = await response.json();
      console.log('Server response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Kayıt yüklenemedi');
      }

      // API yanıtını Recording modeline dönüştür
      const recording: Recording = {
        id: data.id.toString(),
        title: data.title,
        uri: `http://10.0.2.2:5000/api/recordings/file/${data.id}`,
        duration: data.duration,
        created: data.created_at,
        userId: data.user_id.toString()
      };

      return recording;
    } catch (error) {
      console.error('API upload recording error:', error);
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