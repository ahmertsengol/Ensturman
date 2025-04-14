import { Image, StyleSheet, Platform, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, Link } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { api } from '../services/api';

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('Kontrol ediliyor...');
  const router = useRouter();

  // API bağlantısını kontrol et
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        const response = await fetch('http://10.0.2.2:3000/api/auth/test');
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
      setLoading(true);
      
      // API'ye giriş isteği gönder
      console.log('Giriş denemesi:', email, password);
      await api.loginUser(email, password);
      
      // Başarılı giriş sonrası explore ekranına yönlendir
      router.replace('/(tabs)/explore');
    } catch (error: any) {
      console.error('Login error client:', error);
      Alert.alert('Giriş Hatası', error.message || 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
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
        <ThemedText variant="h1">Keşfet</ThemedText>
        <HelloWave />
      </ThemedView>
      
      <ThemedView style={styles.statusContainer}>
        <ThemedText>{apiStatus}</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.formContainer}>
        <ThemedText variant="h2">Giriş Yap</ThemedText>
        
        <View style={styles.inputContainer}>
          <ThemedText>E-posta</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="E-posta adresinizi girin"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
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
            editable={!loading}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.disabledButton]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.loginButtonText}>Giriş Yap</ThemedText>
          )}
        </TouchableOpacity>
        
        <Link href="/(tabs)/register" asChild>
          <TouchableOpacity 
            style={styles.registerButton}
            disabled={loading}
          >
            <ThemedText style={styles.registerButtonText}>Hesap Oluştur</ThemedText>
          </TouchableOpacity>
        </Link>
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
