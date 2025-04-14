/**
 * Typography definitions for the app
 * This provides consistent text styling across the entire application
 */

export const Typography = {
  // Font families - defaults to system fonts
  fontFamily: {
    regular: undefined, // System font
    medium: undefined,
    semiBold: undefined,
    bold: undefined,
    // Add custom fonts if needed
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18, 
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },

  // Line heights
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 30,
    xxl: 36,
    xxxl: 40,
    display: 48,
  },

  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },

  // Text variants - ready to use text styles
  variant: {
    // Display text
    display: {
      fontSize: 40,
      lineHeight: 48,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    
    // Headings
    h1: {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      lineHeight: 36,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 20,
      lineHeight: 30,
      fontWeight: '600',
      letterSpacing: -0.2,
    },
    h4: {
      fontSize: 18,
      lineHeight: 28,
      fontWeight: '600',
      letterSpacing: -0.1,
    },
    
    // Body text
    bodyLarge: {
      fontSize: 18,
      lineHeight: 28,
      fontWeight: '400',
      letterSpacing: 0,
    },
    bodyMedium: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400',
      letterSpacing: 0,
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400',
      letterSpacing: 0,
    },
    
    // UI elements
    button: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    buttonSmall: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400',
      letterSpacing: 0.2,
    },
    label: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
      letterSpacing: 0.1,
    },
  }
}; 