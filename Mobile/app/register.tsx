import { Image, StyleSheet, Platform, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { api } from './services/api';
import { useAuth } from './context/AuthContext';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const handleRegister = async () => {
    // Doğrulama
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    
    try {
      // API'ye kayıt isteği gönder
      await api.registerUser(email, password, name);
      
      Alert.alert('Başarılı', 'Kaydınız başarıyla tamamlandı. Şimdi giriş yapabilirsiniz.', [
        {
          text: 'Giriş Yap',
          onPress: async () => {
            try {
              // Başarılı kayıt sonrası otomatik giriş yap
              await login(email, password);
              // Auth context isLoggedIn state'ini günceller ve otomatik olarak tabs'e yönlendirilir
            } catch (error: any) {
              Alert.alert('Giriş Hatası', error.message || 'Otomatik giriş yapılamadı.');
            }
          }
        }
      ]);
    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error.message || 'Kayıt sırasında bir hata oluştu.');
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
        <ThemedText style={{fontSize: 20, fontWeight: 'bold'}}>Kayıt Ol</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <ThemedText>Ad Soyad</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Adınızı ve soyadınızı girin"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />
        </View>
        
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
        
        <View style={styles.inputContainer}>
          <ThemedText>Şifre Tekrar</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Şifrenizi tekrar girin"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.registerButton, isLoading && styles.disabledButton]} 
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.registerButtonText}>Kayıt Ol</ThemedText>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.loginButton}
          disabled={isLoading}
          onPress={() => router.push('/')}
        >
          <ThemedText style={styles.loginButtonText}>Zaten hesabım var</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
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
  registerButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
  },
  loginButtonText: {
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