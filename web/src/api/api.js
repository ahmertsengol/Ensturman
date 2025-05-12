// src/api/api.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000 // 15 saniye timeout
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    // CORS hatasını kaydet ve göster
    if (error.message === 'Network Error') {
      console.error('CORS veya Network hatası:', error);
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const registerUser = (userData) => {
  return api.post('/users/register', userData);
};

export const loginUser = (credentials) => {
  return api.post('/users/login', credentials);
};

export const getUserProfile = () => {
  return api.get('/users/profile');
};

// Audio recordings API calls
export const uploadAudio = (formData) => {
  return api.post('/audio/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getUserRecordings = () => {
  return api.get('/audio');
};

export const getRecording = (id) => {
  return api.get(`/audio/${id}`);
};

export const deleteRecording = (id) => {
  return api.delete(`/audio/${id}`);
};

// Training module API calls
export const getTrainingModules = (level) => {
  const params = level ? { level } : {};
  return api.get('/training/modules', { params });
};

export const getTrainingModule = (id) => {
  return api.get(`/training/modules/${id}`);
};

export const createTrainingModule = (moduleData) => {
  return api.post('/training/modules', moduleData);
};

export const saveTrainingSession = (sessionData) => {
  return api.post('/training/sessions', sessionData);
};

export const getUserTrainingHistory = () => {
  return api.get('/training/history');
};

export const getUserProgress = () => {
  return api.get('/training/progress');
};

// Test CORS sorununu tespit etmek için
export const testCors = () => {
  return axios({
    method: 'get',
    url: 'http://localhost:3001/test-cors',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
};

export default api; 