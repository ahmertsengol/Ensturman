import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text } from 'react-native';
import { router } from 'expo-router';

// Kullanıcı tipi tanımı
export interface User {
  id: string;
  name: string;
  email: string;
}

// Context tipi tanımı
export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Default değerler
const defaultContextValue: AuthContextType = {
  user: null,
  isLoggedIn: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
};

// Context oluşturma
export const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Hook oluşturma
export const useAuth = () => useContext(AuthContext);

// Provider bileşeni
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // AsyncStorage'dan kullanıcı bilgisini çekme
  useEffect(() => {
    const loadUserFromStorage = async () => {
      try {
        const userJSON = await AsyncStorage.getItem('user');
        const token = await AsyncStorage.getItem('token');
        
        if (userJSON && token) {
          const userData = JSON.parse(userJSON);
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Giriş fonksiyonu
  const login = async (email: string, password: string) => {
    try {
      // API isteği yapma
      const response = await api.loginUser(email, password);
      
      // Response'dan kullanıcı bilgilerini al
      const { user, token } = response;
      
      // AsyncStorage'a kaydet
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);
      
      // Context state'ini güncelle
      setUser(user);
      
      // Yönlendirme (opsiyonel, çünkü _layout.tsx'de zaten kontrol var)
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };
  
  // Kayıt fonksiyonu
  const register = async (name: string, email: string, password: string) => {
    try {
      // API isteği yapma
      const response = await api.registerUser(name, email, password);
      
      // Response'dan kullanıcı bilgilerini al
      const { user, token } = response;
      
      // AsyncStorage'a kaydet
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);
      
      // Context state'ini güncelle
      setUser(user);
      
      // Yönlendirme (opsiyonel, çünkü _layout.tsx'de zaten kontrol var)
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Register error in context:', error);
      throw error;
    }
  };

  // Çıkış fonksiyonu
  const logout = async () => {
    try {
      // AsyncStorage'dan kullanıcı bilgilerini sil
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      
      // Context state'ini güncelle
      setUser(null);
      
      // Giriş ekranına yönlendir
      router.replace('/(auth)');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        login,
        register,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// Default export for Expo Router
export default function AuthContextComponent() {
  return (
    <View>
      <Text>This is not a screen, but a context provider used by Expo Router.</Text>
    </View>
  );
} 