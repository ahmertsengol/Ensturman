import React, { useState } from 'react';
import { StyleSheet, View, Alert, Image, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { 
  Button, 
  TextInput, 
  Text, 
  Surface, 
  useTheme, 
  ActivityIndicator, 
  HelperText,
  Divider
} from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { loginUser } from '@/api/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();
  const theme = useTheme();
  const window = Dimensions.get('window');

  const handleLogin = async () => {
    // Clear previous errors
    setErrorMessage(null);
    
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser({ email, password });

      const { user, token } = response.data;
      
      if (!token) {
        console.error('Login error: Token is undefined');
        setErrorMessage('Login failed: Could not retrieve authentication token.');
        setIsLoading(false);
        return;
      }
      
      await login(user, token);
      router.replace('/');
    } catch (error: any) {
      // console.error('Login error:', error); // Bu satırı geçici olarak yorum satırı yapalım
      
      if (error.code === 'ERR_NETWORK') {
        setErrorMessage('Network error. Please check if the server is running.');
      } else if (error.code === 'ECONNABORTED') {
        setErrorMessage('Connection timeout. Server might be overloaded.');
      } else if (error.response) {
        if (error.response.status === 401) {
          setErrorMessage('E-posta adresiniz veya şifreniz yanlış. Lütfen tekrar deneyin.');
        } else {
          const serverMessage = error.response.data?.error || error.response.data?.message;
          setErrorMessage(serverMessage || `Bir şeyler ters gitti (${error.response.status}). Lütfen daha sonra tekrar deneyin.`);
        }
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  // Ana renk tonları - web'dekine benzer
  const brandColor = '#1DB954'; // Spotify yeşili
  const accentColor = '#E91E63'; // Pembe
  const darkColor = '#191729'; // Koyu arkaplan

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={['#13111F', '#191729', '#1F1D36']}
        style={styles.background}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerSection}>
          <Animatable.View animation="fadeIn" duration={1200}>
            <Animatable.Image 
              source={require('@/assets/images/Logo.png')} 
              style={styles.logo}
              animation="pulse"
              iterationCount="infinite"
              duration={2000}
            />
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" delay={300}>
            <Text style={styles.headingGreen}>
              Ens<Text style={styles.headingWhite}>AI</Text>
            </Text>
            <Text style={styles.subheading}>Smart musical training assistant</Text>
          </Animatable.View>
        </View>
        
        <Animatable.View animation="fadeInUp" delay={600} style={styles.formSection}>
          <Surface style={styles.formContainer}>
            <Text variant="headlineMedium" style={styles.title}>Welcome Back</Text>
            
            {errorMessage && (
              <Animatable.View animation="shake">
                <HelperText type="error" visible={!!errorMessage} style={styles.errorText}>
                  {errorMessage}
                </HelperText>
              </Animatable.View>
            )}
            
            <TextInput
              mode="outlined"
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              outlineColor="rgba(30, 185, 84, 0.5)"
              activeOutlineColor={brandColor}
              textColor="#E0E0E0"
              left={<TextInput.Icon icon="email" color={brandColor} />}
            />
            
            <TextInput
              mode="outlined"
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={secureTextEntry}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              outlineColor="rgba(30, 185, 84, 0.5)"
              activeOutlineColor={brandColor}
              textColor="#E0E0E0"
              left={<TextInput.Icon icon="lock" color={brandColor} />}
              right={
                <TextInput.Icon 
                  icon={secureTextEntry ? "eye" : "eye-off"} 
                  color={secureTextEntry ? 'rgba(224, 224, 224, 0.6)' : brandColor}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                />
              }
            />
            
            <Text variant="bodySmall" style={styles.forgotPassword}>
              Forgot Password?
            </Text>
            
            <LinearGradient
              colors={[brandColor, '#17A449']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Button 
                mode="contained" 
                onPress={handleLogin}
                disabled={isLoading}
                loading={isLoading}
                style={styles.button}
                labelStyle={styles.buttonLabel}
                buttonColor="transparent"
              >
                Login
              </Button>
            </LinearGradient>
            
            <View style={styles.dividerContainer}>
              <Divider style={styles.divider} />
              <Text variant="bodySmall" style={styles.dividerText}>OR</Text>
              <Divider style={styles.divider} />
            </View>
            
            <Button 
              mode="outlined" 
              onPress={navigateToRegister}
              style={styles.registerButton}
              textColor="#E0E0E0"
              labelStyle={styles.registerButtonLabel}
            >
              Create Account
            </Button>
          </Surface>
        </Animatable.View>
      </ScrollView>
      
      {/* Renkli border alanı */}
      <View style={styles.colorfulBorder}>
        {Array(10).fill(0).map((_, i) => (
          <View 
            key={i} 
            style={[
              styles.borderSegment, 
              { backgroundColor: i % 2 === 0 ? brandColor : accentColor }
            ]} 
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  headingGreen: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1DB954',
    textAlign: 'center',
  },
  headingWhite: {
    color: '#E0E0E0',
  },
  subheading: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
    marginTop: 8,
  },
  formSection: {
    paddingHorizontal: 24,
  },
  formContainer: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(47, 42, 75, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(30, 185, 84, 0.3)',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#E0E0E0',
    marginBottom: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(25, 23, 41, 0.6)',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    color: '#1DB954',
  },
  gradientButton: {
    borderRadius: 8,
    marginVertical: 8,
  },
  button: {
    elevation: 0,
    marginVertical: 0,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
    color: '#fff',
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    backgroundColor: 'rgba(160, 174, 192, 0.3)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#A0AEC0',
  },
  registerButton: {
    marginTop: 8,
    borderRadius: 8,
    borderColor: '#A0AEC0',
    borderWidth: 1,
  },
  registerButtonLabel: {
    paddingVertical: 4,
  },
  colorfulBorder: {
    height: 8,
    flexDirection: 'row',
  },
  borderSegment: {
    flex: 1,
    height: 8,
  },
});