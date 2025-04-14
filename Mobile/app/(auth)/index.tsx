import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Alert, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { TextInputField } from '@/components/TextInputField';
import { Button } from '@/components/Button';
import { useAuth } from '../context/AuthContext';
import { Layout, Spacing } from '@/constants/Spacing';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const router = useRouter();
  const { login, isLoading } = useAuth();
  
  // Get theme colors
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');
  const errorColor = useThemeColor({}, 'error');
  const successColor = useThemeColor({}, 'success');

  // API bağlantısını kontrol et
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        // Zaman aşımı kontrolü ile API'ye istek at
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 saniye zaman aşımı
        
        try {
          const response = await fetch('http://10.0.2.2:3000/api/auth/test', {
            signal: controller.signal,
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });
          
          clearTimeout(timeoutId);
          const data = await response.json();
          
          if (data.message === 'Auth API is working') {
            setApiStatus('success');
          } else {
            setApiStatus('error');
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          console.error('API bağlantı hatası (fetch):', fetchError);
          
          // Sunucu IP adresini alternatif olarak dene
          try {
            // Alternatif IP adresi ile deneme yap (yerel IP)
            const backupController = new AbortController();
            const backupTimeoutId = setTimeout(() => backupController.abort(), 5000); // 5 saniye zaman aşımı
            
            const backupResponse = await fetch('http://192.168.1.6:3000/api/auth/test', {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
              signal: backupController.signal
            });
            
            clearTimeout(backupTimeoutId);
            const backupData = await backupResponse.json();
            if (backupData.message === 'Auth API is working') {
              setApiStatus('success');
              console.log("Alternatif sunucu adresi başarılı");
              return;
            }
          } catch (backupError) {
            console.error('Alternatif API adresi de başarısız:', backupError);
          }
          
          setApiStatus('error');
        }
      } catch (error) {
        console.error('API genel bağlantı hatası:', error);
        setApiStatus('error');
      }
    };

    checkApiConnection();
  }, []);

  const validateForm = () => {
    let isValid = true;
    
    // Email validation
    if (!email.trim()) {
      setEmailError('E-posta adresi gerekli');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Geçerli bir e-posta adresi girin');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Şifre gerekli');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };

  const handleLogin = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Auth context ile giriş yap
      await login(email, password);
      // Başarılı giriş sonrası useAuth hookuna bağlı olarak otomatik yönlendirme olacak
    } catch (error: any) {
      console.error('Login error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Giriş Hatası', error.message || 'Giriş yapılırken bir hata oluştu.');
    }
  };

  // Get API status indicator color
  const getStatusColor = () => {
    switch (apiStatus) {
      case 'success':
        return successColor;
      case 'error':
        return errorColor;
      default:
        return '#aaa';
    }
  };

  // Get API status message
  const getStatusMessage = () => {
    switch (apiStatus) {
      case 'checking':
        return 'API bağlantısı kontrol ediliyor...';
      case 'success':
        return 'API bağlantısı başarılı ✓';
      case 'error':
        return 'API bağlantısı başarısız! Lütfen internet bağlantınızı kontrol edin.';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          <ThemedView card elevated={2} style={styles.formCard}>
            <ThemedText variant="h1" style={styles.title}>
              Hoş Geldiniz
            </ThemedText>
            
            <ThemedText variant="bodyMedium" muted style={styles.subtitle}>
              Ses kayıtlarınıza erişmek için giriş yapın
            </ThemedText>

            <View style={styles.apiStatusContainer}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
              <ThemedText variant="caption" style={{ color: getStatusColor() }}>
                {getStatusMessage()}
              </ThemedText>
            </View>
            
            <TextInputField
              label="E-posta Adresi"
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              error={emailError}
              editable={!isLoading}
            />
            
            <TextInputField
              label="Şifre"
              value={password}
              onChangeText={setPassword}
              placeholder="Şifreniz"
              secureTextEntry
              error={passwordError}
              editable={!isLoading}
            />
            
            <Button
              label="Giriş Yap"
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              onPress={handleLogin}
              style={styles.loginButton}
            />
            
            <TouchableOpacity 
              onPress={() => router.push('/register')}
              style={styles.registerLink}
              disabled={isLoading}
            >
              <ThemedText variant="bodySmall">
                Hesabınız yok mu? <ThemedText variant="bodySmall" style={{ color: primaryColor }}>Kayıt Olun</ThemedText>
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    paddingBottom: Spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 120,
    height: 120,
  },
  formCard: {
    padding: Spacing.xl,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  apiStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: Layout.borderRadius.sm,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  loginButton: {
    marginTop: Spacing.md,
  },
  registerLink: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  }
}); 