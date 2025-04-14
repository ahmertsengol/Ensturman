/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * App color scheme defining colors for both light and dark modes.
 * This uses a modern, cohesive palette with consistent primary, secondary and accent colors.
 */

// Base palette
const palette = {
  // Primary colors
  primary100: '#EBF7FF',
  primary200: '#C2E4FF',
  primary300: '#8ACBFF',
  primary400: '#4CA8FF',
  primary500: '#2E90E5',
  primary600: '#1A75C7',
  primary700: '#0D5BA8',
  primary800: '#044175',
  
  // Secondary colors - Teal tones
  secondary100: '#E6F9F7',
  secondary200: '#C1F0EA',
  secondary300: '#8DE0D7',
  secondary400: '#50C9BD',
  secondary500: '#2EABA0',
  secondary600: '#1E8C82',
  secondary700: '#136D65',
  secondary800: '#0A4D47',
  
  // Accent color - Warm orange
  accent100: '#FFF3E0',
  accent200: '#FFE0B2',
  accent300: '#FFCC80',
  accent400: '#FFA726',
  accent500: '#FF9800',
  accent600: '#FB8C00',
  accent700: '#F57C00',
  accent800: '#EF6C00',
  
  // Neutrals - Gray scale
  neutral100: '#F8F9FA',
  neutral200: '#E9ECEF',
  neutral300: '#DEE2E6',
  neutral400: '#CED4DA',
  neutral500: '#ADB5BD',
  neutral600: '#6C757D',
  neutral700: '#495057',
  neutral800: '#343A40',
  neutral900: '#212529',

  // Success/Error states
  success: '#28A745',
  error: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',

  // Pure colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const Colors = {
  light: {
    // Basic UI
    text: palette.neutral900,
    textSecondary: palette.neutral700,
    textMuted: palette.neutral600,
    background: palette.white,
    backgroundElevated: palette.white,
    backgroundMuted: palette.neutral100,
    
    // UI elements
    card: palette.white,
    cardBorder: palette.neutral200,
    divider: palette.neutral300,
    border: palette.neutral400,
    shadowColor: palette.black,
    
    // Accent colors
    primaryText: palette.primary800,
    primary: palette.primary500,
    primaryLight: palette.primary200,
    primaryDark: palette.primary700,

    secondaryText: palette.secondary800,
    secondary: palette.secondary500,
    secondaryLight: palette.secondary200,
    secondaryDark: palette.secondary700,

    accentText: palette.accent800,
    accent: palette.accent500,
    accentLight: palette.accent200,
    accentDark: palette.accent700,
    
    // Input fields
    inputBackground: palette.white,
    inputBorder: palette.neutral400,
    inputText: palette.neutral900,
    inputPlaceholder: palette.neutral500,
    
    // Button states
    buttonPrimary: palette.primary500,
    buttonPrimaryPressed: palette.primary600,
    buttonSecondary: palette.secondary500,
    buttonSecondaryPressed: palette.secondary600,
    buttonDisabled: palette.neutral400,
    buttonText: palette.white,
    
    // Status colors
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
    info: palette.info,
    
    // Tab navigation
    tabBackground: palette.white,
    tabBorder: palette.neutral200,
    tabIconDefault: palette.neutral600,
    tabIconSelected: palette.primary500,
    tabTextDefault: palette.neutral700,
    tabTextSelected: palette.primary700,
  },
  dark: {
    // Basic UI
    text: palette.neutral100,
    textSecondary: palette.neutral300,
    textMuted: palette.neutral400,
    background: palette.neutral900,
    backgroundElevated: palette.neutral800,
    backgroundMuted: palette.neutral800,
    
    // UI elements
    card: palette.neutral800,
    cardBorder: palette.neutral700,
    divider: palette.neutral700,
    border: palette.neutral600,
    shadowColor: palette.black,
    
    // Accent colors
    primaryText: palette.primary200,
    primary: palette.primary600,
    primaryLight: palette.primary400,
    primaryDark: palette.primary800,

    secondaryText: palette.secondary200,
    secondary: palette.secondary600,
    secondaryLight: palette.secondary400,
    secondaryDark: palette.secondary800,

    accentText: palette.accent200,
    accent: palette.accent600,
    accentLight: palette.accent400,
    accentDark: palette.accent800,
    
    // Input fields
    inputBackground: palette.neutral800,
    inputBorder: palette.neutral600,
    inputText: palette.neutral200,
    inputPlaceholder: palette.neutral500,
    
    // Button states
    buttonPrimary: palette.primary600,
    buttonPrimaryPressed: palette.primary700,
    buttonSecondary: palette.secondary600,
    buttonSecondaryPressed: palette.secondary700,
    buttonDisabled: palette.neutral700,
    buttonText: palette.white,
    
    // Status colors
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
    info: palette.info,
    
    // Tab navigation
    tabBackground: palette.neutral900,
    tabBorder: palette.neutral700,
    tabIconDefault: palette.neutral500,
    tabIconSelected: palette.primary400,
    tabTextDefault: palette.neutral400,
    tabTextSelected: palette.primary300,
  },
};

// Export the raw palette for access to specific color values when needed
export { palette };
