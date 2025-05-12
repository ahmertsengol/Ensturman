// mobile/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { getUserProfile } from '../api/api';
import * as FileSystem from 'expo-file-system';

// User type definition
type User = {
  id: string;
  username: string;
  email: string;
};

// Auth context type definition
type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from token on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Ensure the storage directory exists
        if (Platform.OS === 'ios') {
          try {
            const documentDir = FileSystem.documentDirectory;
            const expoDir = documentDir + 'ExponentExperienceData';
            const dirInfo = await FileSystem.getInfoAsync(expoDir);
            
            if (!dirInfo.exists) {
              await FileSystem.makeDirectoryAsync(expoDir, { intermediates: true });
              console.log('Created ExponentExperienceData directory');
            }
          } catch (dirError) {
            console.warn('Failed to verify/create storage directory', dirError);
            // Continue anyway as AsyncStorage might work through different paths
          }
        }
        
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await getUserProfile();
        setCurrentUser(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load user', err);
        
        // More detailed error logging
        if (err.message) {
          console.error('Error message:', err.message);
        }
        
        if (err.response) {
          console.error('Error response:', JSON.stringify(err.response, null, 2));
        }
        
        // Token invalid or expired
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          await AsyncStorage.removeItem('token');
          setError('Session expired. Please login again.');
        } 
        // Network error
        else if (err.message === 'Network Error') {
          setError('Cannot connect to server. Please check your connection.');
        }
        // Server not running
        else if (err.request) {
          setError('Cannot connect to server. Please check if the backend is running.');
        }
        // Storage error
        else if (err.message && err.message.includes('storage directory')) {
          setError('Storage access error. The app may need to be reinstalled.');
        }
        // Other errors
        else {
          setError('An unexpected error occurred. Please try again.');
        }
        
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login user
  const login = async (userData: User, token: string) => {
    try {
      await AsyncStorage.setItem('token', token);
      setCurrentUser(userData);
      setError(null);
    } catch (err) {
      console.error('Error saving token', err);
      Alert.alert('Error', 'Failed to save login information');
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setCurrentUser(null);
    } catch (err) {
      console.error('Error removing token', err);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };

  const contextValue = {
    currentUser,
    loading,
    error,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 