import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL configuration
// Your development machine's local IP address
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!! ÖNEMLİ: Mobil cihazınızdan backend'e bağlanmak için               !!!
// !!! aşağıdaki `LOCAL_IP` değerini KENDİ BİLGİSAYARINIZIN YEREL AĞ     !!!
// !!! IP ADRESİ ile değiştirin (örneğin: '192.168.1.10').              !!!
// !!! macOS: ifconfig | grep "inet " | grep -v 127.0.0.1             !!!
// !!! Windows: ipconfig (IPv4 Address)                                 !!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const LOCAL_IP = '192.168.1.5'; // Kullanıcının sağladığı IP adresi ile güncellendi

// Backend host configuration - EXPO GO ile test edilen fiziksel cihazlar için basitleştirilmiş
// Her durumda LOCAL_IP kullanılacak şekilde ayarlandı - Expo Go için kesin çözüm
export const BACKEND_HOST = `http://${LOCAL_IP}:3001`;

const API_URL = `${BACKEND_HOST}/api`;

console.log('API URL:', API_URL); // Debug logging

// Create axios instance with improved configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 30000, // 30 second timeout
  // Retry logic
  validateStatus: (status) => status < 500 // Don't reject if status is less than 500
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('API Success:', response.config.url);
    return response;
  },
  error => {
    console.error('API Error:', error.message, error.config ? error.config.url : 'No URL');
    
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error: Backend server might not be running at', API_URL);
      console.error('Please make sure your backend server is running on port 3001');
    }
    
    // Log any response data if available
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API calls
export const registerUser = (userData: { username: string; email: string; password: string }) => {
  return api.post('/users/register', userData);
};

export const loginUser = (credentials: { email: string; password: string }) => {
  return api.post('/users/login', credentials);
};

export const getUserProfile = () => {
  return api.get('/users/profile');
};

// Audio recordings API calls
export const uploadAudio = (formData: FormData) => {
  return api.post('/audio/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getUserRecordings = () => {
  return api.get('/audio');
};

export const getRecording = (id: string) => {
  return api.get(`/audio/${id}`);
};

export const deleteRecording = (id: string) => {
  return api.delete(`/audio/${id}`);
};

// Function to get the full URL for audio streams
export const getAudioStreamUrl = (filename: string) => {
  // Make sure the filename is correctly encoded to handle special characters
  const encodedFilename = encodeURIComponent(filename);
  
  // Use direct host connection to avoid potential CORS issues
  // Return the direct /uploads path for better streaming compatibility
  return `${BACKEND_HOST}/uploads/${encodedFilename}`;
  
  // Alternative API URL if direct access doesn't work
  // return `${BACKEND_HOST}/api/audio/stream/${encodedFilename}`;
};

export default api; 