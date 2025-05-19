import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { Theme } from '@react-navigation/native';

// Colors from web app's theme (Chakra UI)
const brandColors = {
  50: '#E3F9EC',
  100: '#C5F3D9',
  200: '#9EECBF',
  300: '#6EE29D',
  400: '#36D573',
  500: '#1DB954', // Spotify green
  600: '#17A449',
  700: '#118C3F',
  800: '#0B7433',
  900: '#065C29',
};

const accentColors = {
  50: '#FCE4EC',
  100: '#F8BBD0',
  200: '#F48FB1',
  300: '#F06292',
  400: '#EC407A',
  500: '#E91E63', // Pink
  600: '#D81B60',
  700: '#C2185B',
  800: '#AD1457',
  900: '#880E4F',
};

const darkColors = {
  100: '#444054',
  200: '#352F44',
  300: '#2A2438', // Card background dark
  400: '#1F1D36',
  500: '#191729', // Main background dark
  600: '#161525', // Even darker shade for depth
  700: '#13111F', // Deepest background elements
};

// Navigation theme properties
const navigationColors = {
  light: {
    primary: brandColors[500],
    background: '#FFFFFF',
    card: '#F7FAFC',
    text: '#11181C',
    border: '#E2E8F0',
    notification: accentColors[500],
  },
  dark: {
    primary: brandColors[500],
    background: darkColors[500],
    card: darkColors[400],
    text: '#E0E0E0',
    border: darkColors[300],
    notification: accentColors[500],
  }
};

export const CustomLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: brandColors[500],
    primaryContainer: brandColors[100],
    secondary: accentColors[500],
    secondaryContainer: accentColors[100],
    background: '#FFFFFF',
    surface: '#F7FAFC',
    elevation: {
      level0: 'transparent',
      level1: '#F7FAFC',
      level2: '#EDF2F7',
      level3: '#E2E8F0',
      level4: '#CBD5E0',
      level5: '#A0AEC0',
    },
  },
  fonts: {
    ...MD3LightTheme.fonts,
    headingLarge: {
      fontFamily: 'Poppins_700Bold',
      fontWeight: 'bold',
      letterSpacing: -0.5,
    },
    headingMedium: {
      fontFamily: 'Poppins_600SemiBold',
      fontWeight: 'bold',
      letterSpacing: -0.25,
    },
    headingSmall: {
      fontFamily: 'Poppins_500Medium',
      fontWeight: 'bold',
    },
    bodyLarge: {
      fontFamily: 'Inter_500Medium',
    },
    bodyMedium: {
      fontFamily: 'Inter_400Regular',
    },
    bodySmall: {
      fontFamily: 'Inter_400Regular',
    },
  },
};

export const CustomDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brandColors[500],
    primaryContainer: brandColors[900],
    secondary: accentColors[500],
    secondaryContainer: accentColors[900],
    background: darkColors[500],
    surface: darkColors[400],
    surfaceVariant: darkColors[300],
    elevation: {
      level0: darkColors[500],
      level1: darkColors[400],
      level2: darkColors[300],
      level3: darkColors[200],
      level4: darkColors[100],
      level5: '#444054',
    },
    text: '#E0E0E0',
    onSurface: '#E0E0E0',
    onBackground: '#E0E0E0',
  },
  fonts: {
    ...MD3DarkTheme.fonts,
    headingLarge: {
      fontFamily: 'Poppins_700Bold',
      fontWeight: 'bold',
      letterSpacing: -0.5,
    },
    headingMedium: {
      fontFamily: 'Poppins_600SemiBold',
      fontWeight: 'bold',
      letterSpacing: -0.25,
    },
    headingSmall: {
      fontFamily: 'Poppins_500Medium',
      fontWeight: 'bold',
    },
    bodyLarge: {
      fontFamily: 'Inter_500Medium',
    },
    bodyMedium: {
      fontFamily: 'Inter_400Regular',
    },
    bodySmall: {
      fontFamily: 'Inter_400Regular',
    },
  },
};

// Export navigation colors for React Navigation
export const NavigationLightTheme: Theme = {
  dark: false,
  colors: navigationColors.light,
  fonts: CustomLightTheme.fonts
};

export const NavigationDarkTheme: Theme = {
  dark: true,
  colors: navigationColors.dark,
  fonts: CustomDarkTheme.fonts
}; 