/**
 * Spacing constants for the app
 * This provides a consistent grid system for margins, paddings, and gaps
 */

export const Spacing = {
  // Base spacing unit
  base: 4,
  
  // Named spacing values
  xs: 4,    // Extra small: 4px
  sm: 8,    // Small: 8px
  md: 16,   // Medium: 16px
  lg: 24,   // Large: 24px
  xl: 32,   // Extra large: 32px
  xxl: 48,  // 2X large: 48px
  xxxl: 64, // 3X large: 64px
  
  // Specific use cases
  screenPadding: 16,
  cardPadding: 16,
  sectionGap: 32,
  itemGap: 16,
  inputPadding: 12,
  iconPadding: 8,
  
  // Helper function to get multiples of the base spacing
  multiply: (factor: number) => 4 * factor,
};

// Layout constants for common dimensions
export const Layout = {
  // Used for rounded corners
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  // Screen max width (for tablets or web)
  maxWidth: 540,
  
  // Common component dimensions
  buttonHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  
  inputHeight: {
    sm: 36,
    md: 44,
    lg: 52,
  },
  
  iconSize: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
  },
  
  // Elevation (shadow) levels
  elevation: {
    none: 0,
    xs: 1,
    sm: 2,
    md: 4,
    lg: 8,
    xl: 16,
  },
}; 