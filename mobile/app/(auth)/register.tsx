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
import { registerUser } from '@/api/api';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [confirmSecureTextEntry, setConfirmSecureTextEntry] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const theme = useTheme();

  // Ana renk tonları - web'dekine benzer
  const brandColor = '#1DB954'; // Spotify yeşili
  const accentColor = '#E91E63'; // Pembe
  const darkColor = '#191729'; // Koyu arkaplan

  const handleRegister = async () => {
    // Clear previous errors
    setErrorMessage(null);
    
    // Basic validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await registerUser({ username, email, password });
      
      Alert.alert(
        'Registration Successful',
        'Your account has been created. Please login.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login')
          }
        ]
      );
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.code === 'ERR_NETWORK') {
        setErrorMessage('Network error. Please check if the server is running.');
      } else if (error.code === 'ECONNABORTED') {
        setErrorMessage('Connection timeout. Server might be overloaded.');
      } else if (error.response) {
        const serverMessage = error.response.data?.error || error.response.data?.message;
        setErrorMessage(serverMessage || `Registration failed (${error.response.status})`);
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    router.replace('/login');
  };

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
            <Text variant="headlineMedium" style={styles.title}>Create Account</Text>
            
            {errorMessage && (
              <Animatable.View animation="shake">
                <HelperText type="error" visible={!!errorMessage} style={styles.errorText}>
                  {errorMessage}
                </HelperText>
              </Animatable.View>
            )}
        
        <TextInput
              mode="outlined"
              label="Username"
              placeholder="Enter your username"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
              style={styles.input}
              outlineColor="rgba(30, 185, 84, 0.5)"
              activeOutlineColor={brandColor}
              textColor="#E0E0E0"
              left={<TextInput.Icon icon="account" color={brandColor} />}
        />
        
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
        
        <TextInput
              mode="outlined"
              label="Confirm Password"
              placeholder="Confirm your password"
              secureTextEntry={confirmSecureTextEntry}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
              style={styles.input}
              outlineColor="rgba(30, 185, 84, 0.5)"
              activeOutlineColor={brandColor}
              textColor="#E0E0E0"
              left={<TextInput.Icon icon="lock-check" color={brandColor} />}
              right={
                <TextInput.Icon 
                  icon={confirmSecureTextEntry ? "eye" : "eye-off"} 
                  color={confirmSecureTextEntry ? 'rgba(224, 224, 224, 0.6)' : brandColor}
                  onPress={() => setConfirmSecureTextEntry(!confirmSecureTextEntry)}
                />
              }
            />
            
            <LinearGradient
              colors={[brandColor, '#17A449']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientButton}
            >
              <Button 
                mode="contained" 
          onPress={handleRegister}
          disabled={isLoading}
                loading={isLoading}
                style={styles.button}
                labelStyle={styles.buttonLabel}
                buttonColor="transparent"
              >
                Create Account
              </Button>
            </LinearGradient>
            
            <View style={styles.dividerContainer}>
              <Divider style={styles.divider} />
              <Text variant="bodySmall" style={styles.dividerText}>OR</Text>
              <Divider style={styles.divider} />
            </View>
        
            <Button 
              mode="outlined" 
              onPress={navigateToLogin}
              style={styles.loginButton}
              textColor="#E0E0E0"
              labelStyle={styles.loginButtonLabel}
              icon="login"
            >
              Already have an account? Login
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
    paddingTop: 40,
    paddingBottom: 20,
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
  loginButton: {
    marginTop: 8,
    borderRadius: 8,
    borderColor: '#A0AEC0',
    borderWidth: 1,
  },
  loginButtonLabel: {
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