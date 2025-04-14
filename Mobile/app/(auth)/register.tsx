import { StyleSheet, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const handleRegister = async () => {
    // Basit doğrulama
    if (!name || !email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    
    try {
      // Auth context ile kayıt ol
      await register(name, email, password);
      // Başarılı kayıt sonrası useAuth hookuna bağlı olarak otomatik yönlendirme olacak
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Kayıt Hatası', error.message || 'Kayıt olurken bir hata oluştu.');
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1AADC', dark: '#1D2D47' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#6080D0"
          name="person.fill.badge.plus"
          style={styles.headerImage}
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
          <ThemedText>Şifre (Tekrar)</ThemedText>
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
          <ThemedText style={styles.loginButtonText}>Giriş Yap</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
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
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#4A90E2',
    fontSize: 16,
  },
  headerImage: {
    color: '#6080D0',
    bottom: -90,
    left: -35,
    position: 'absolute',
    opacity: 0.3,
  },
}); 