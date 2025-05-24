import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetworkUtils, { NetworkConfig } from '@/utils/NetworkUtils';

// Dynamic network configuration
let currentNetworkConfig: NetworkConfig | null = null;

// Initialize network configuration
const initializeNetwork = async (): Promise<NetworkConfig> => {
  if (!currentNetworkConfig) {
    console.log('🔄 Initializing network configuration...');
    currentNetworkConfig = await NetworkUtils.getNetworkConfig();
  }
  return currentNetworkConfig;
};

// Get current backend configuration
export const getBackendConfig = async (): Promise<NetworkConfig> => {
  return await initializeNetwork();
};

// Create axios instance with dynamic configuration
const createApiInstance = async () => {
  const config = await initializeNetwork();
  
  console.log('🌐 API configured for:', config.apiUrl);
  
  return axios.create({
    baseURL: config.apiUrl,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 10000,
    validateStatus: (status) => status < 500
  });
};

// Initialize API instance
let api: any = null;
const getApiInstance = async () => {
  if (!api) {
    api = await createApiInstance();
    
    // Add response interceptor for debugging and network issues
    api.interceptors.response.use(
      (response: any) => {
        console.log('✅ API Success:', response.config.url);
        return response;
      },
      async (error: any) => {
        console.error('❌ API Error:', error.message, error.config ? error.config.url : 'No URL');
        
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
          console.error('🔄 Network Error detected, attempting to refresh backend configuration...');
          
          // Try to refresh network configuration
          try {
            currentNetworkConfig = await NetworkUtils.refreshNetworkConfig();
            api = await createApiInstance();
            console.log('🔄 API instance refreshed with new configuration');
            
            // Retry the failed request once with new configuration
            if (error.config && !error.config._retried) {
              error.config._retried = true;
              error.config.baseURL = currentNetworkConfig.apiUrl;
              return api.request(error.config);
            }
          } catch (refreshError) {
            console.error('❌ Failed to refresh network configuration:', refreshError);
          }
        }
        
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
        }
        
        return Promise.reject(error);
      }
    );

    // Request interceptor to add auth token
    api.interceptors.request.use(
      async (config: any) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );
  }
  
  return api;
};

// Authentication API calls
export const registerUser = async (userData: { username: string; email: string; password: string }) => {
  const apiInstance = await getApiInstance();
  return apiInstance.post('/users/register', userData);
};

export const loginUser = async (credentials: { email: string; password: string }) => {
  const apiInstance = await getApiInstance();
  return apiInstance.post('/users/login', credentials);
};

export const getUserProfile = async () => {
  const apiInstance = await getApiInstance();
  return apiInstance.get('/users/profile');
};

// Audio recordings API calls
export const uploadAudio = async (formData: FormData) => {
  const apiInstance = await getApiInstance();
  return apiInstance.post('/audio/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getUserRecordings = async () => {
  const apiInstance = await getApiInstance();
  return apiInstance.get('/audio');
};

export const getRecording = async (id: string) => {
  const apiInstance = await getApiInstance();
  return apiInstance.get(`/audio/${id}`);
};

export const deleteRecording = async (id: string) => {
  const apiInstance = await getApiInstance();
  return apiInstance.delete(`/audio/${id}`);
};

// Function to get the full URL for audio streams
export const getAudioStreamUrl = async (filename: string): Promise<string> => {
  const config = await getBackendConfig();
  const encodedFilename = encodeURIComponent(filename);
  
  // Return the direct /uploads path for better streaming compatibility
  return `${config.backendHost}/uploads/${encodedFilename}`;
};

// Network utility functions for components
export const refreshNetworkConnection = async (): Promise<void> => {
  console.log('🔄 Manually refreshing network connection...');
  currentNetworkConfig = await NetworkUtils.refreshNetworkConfig();
  api = null; // Force API instance recreation
};

export const getCurrentNetworkStatus = async (): Promise<{
  host: string;
  isConnected: boolean;
  isLocal: boolean;
}> => {
  const config = await getBackendConfig();
  
  try {
    const apiInstance = await getApiInstance();
    await apiInstance.get('/health');
    
    return {
      host: config.backendHost,
      isConnected: true,
      isLocal: config.isLocal
    };
  } catch (error) {
    return {
      host: config.backendHost,
      isConnected: false,
      isLocal: config.isLocal
    };
  }
};

// Initialize network on module load
initializeNetwork().catch(console.error);

export default { getApiInstance }; 