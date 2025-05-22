import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useCallback } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../context/AuthContext';
import { ChatbotProvider } from '../context/ChatbotContext';
import { 
  useFonts as useGoogleFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';
import { 
  CustomDarkTheme, 
  CustomLightTheme, 
  NavigationDarkTheme, 
  NavigationLightTheme 
} from '@/constants/Theme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  // Load custom fonts and space mono
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  
  // Load Google fonts
  const [googleFontsLoaded] = useGoogleFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });
  
  // Get the current theme
  const theme = colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme;
  const navigationTheme = colorScheme === 'dark' ? NavigationDarkTheme : NavigationLightTheme;

  const onLayoutRootView = useCallback(async () => {
    if ((fontsLoaded && googleFontsLoaded) || fontError) {
      // Hide splash screen once fonts are loaded or there's an error
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, googleFontsLoaded, fontError]);

  useEffect(() => {
    if ((fontsLoaded && googleFontsLoaded) || fontError) {
      // Hide splash screen after a short delay to ensure everything is initialized
      const timer = setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded, googleFontsLoaded, fontError]);

  if (!fontsLoaded || !googleFontsLoaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ChatbotProvider>
        <SafeAreaProvider onLayout={onLayoutRootView}>
          <PaperProvider theme={theme}>
            <NavigationThemeProvider value={navigationTheme}>
              <Stack 
                screenOptions={{ 
                  headerShown: false,
                  contentStyle: { backgroundColor: '#191729' },
                  animation: 'fade',
                }}
              >
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="light" />
            </NavigationThemeProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </ChatbotProvider>
    </AuthProvider>
  );
}
