import { Image, StyleSheet, Platform, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { api } from '../services/api';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      setLoading(true);
      
      // API'ye kayıt isteği gönder
      await api.registerUser(email, password, name);
      
      // Başarılı kayıt sonrası explore ekranına yönlendir
      Alert.alert('Başarılı', 'Kaydınız başarıyla tamamlandı.', [
        {
          text: 'Tamam',
          onPress: () => router.replace('/(tabs)/explore')
        }
      ]);
    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error.message || 'Kayıt sırasında bir hata oluştu.');
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
        <ThemedText variant="h1">Kayıt Ol</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <ThemedText>Ad Soyad</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Adınızı ve soyadınızı girin"
            value={name}
            onChangeText={setName}
            editable={!loading}
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
        
        <View style={styles.inputContainer}>
          <ThemedText>Şifre Tekrar</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Şifrenizi tekrar girin"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.registerButton, loading && styles.disabledButton]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.registerButtonText}>Kayıt Ol</ThemedText>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.loginButton}
          disabled={loading}
          onPress={() => router.push('/(tabs)')}
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