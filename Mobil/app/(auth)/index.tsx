import { Image, StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiStatus, setApiStatus] = useState('Kontrol ediliyor...');
  
  const router = useRouter();
  const { login, isLoading } = useAuth();

  // API bağlantısını kontrol et
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await fetch('http://10.0.2.2:5000/api/auth/test');
        const data = await response.json();
        if (data.message === 'Auth API is working') {
          setApiStatus('API bağlantısı başarılı ✓');
        } else {
          setApiStatus('API bağlantısı başarısız ✗');
        }
      } catch (error) {
        console.error('API bağlantısı hatası:', error);
        setApiStatus('API bağlantısı başarısız ✗');
      }
    };

    checkApiConnection();
  }, []);

  const handleLogin = async () => {
    // Basit doğrulama
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifre alanlarını doldurun.');
      return;
    }
    
    try {
      // Auth context ile giriş yap
      await login(email, password);
      // Başarılı giriş sonrası useAuth hookuna bağlı olarak otomatik yönlendirme olacak
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Giriş Hatası', error.message || 'Giriş yapılırken bir hata oluştu.');
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Hoş Geldiniz!</ThemedText>
        <HelloWave />
      </ThemedView>
      
      <ThemedView style={styles.statusContainer}>
        <ThemedText>{apiStatus}</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.formContainer}>
        <ThemedText type="subtitle">Giriş Yap</ThemedText>
        
        <View style={styles.inputContainer}>
          <ThemedText>E-posta</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="E-posta adresinizi girin"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <ThemedText>Şifre</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Şifrenizi girin"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.loginButton, isLoading && styles.disabledButton]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.loginButtonText}>Giriş Yap</ThemedText>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.registerButton}
          disabled={isLoading}
          onPress={() => router.push('/register')}
        >
          <ThemedText style={styles.registerButtonText}>Hesap Oluştur</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  statusContainer: {
    marginBottom: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  formContainer: {
    gap: 16,
    marginBottom: 20,
  },
  inputContainer: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 8,
  },
  registerButtonText: {
    color: '#4A90E2',
    fontSize: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
}); 