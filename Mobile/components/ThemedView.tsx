import { View, type ViewProps, StyleSheet, Platform, ViewStyle } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Layout } from '@/constants/Spacing';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  elevated?: boolean | number; // Can be true or specific elevation level
  borderRadius?: keyof typeof Layout.borderRadius | number;
  border?: boolean;
  card?: boolean; // For card-styled containers
};

/**
 * A themed View component that supports elevation, borders, and cards
 */
export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  elevated,
  borderRadius,
  border,
  card,
  ...otherProps 
}: ThemedViewProps) {
  // Get theme colors
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    card ? 'card' : 'background'
  );
  
  const borderColor = useThemeColor({}, card ? 'cardBorder' : 'border');
  const shadowColor = useThemeColor({}, 'shadowColor');
  
  // Determine elevation level
  let elevationLevel = 0;
  if (elevated === true) {
    elevationLevel = 2; // Default elevation when true
  } else if (typeof elevated === 'number') {
    elevationLevel = elevated;
  }
  
  // Create shadow style based on elevation
  let shadowStyle: ViewStyle = {};
  if (elevationLevel > 0) {
    if (Platform.OS === 'ios') {
      shadowStyle = {
        shadowColor,
        shadowOffset: { width: 0, height: elevationLevel },
        shadowOpacity: 0.1,
        shadowRadius: elevationLevel * 2,
      };
    } else if (Platform.OS === 'android') {
      shadowStyle = {
        elevation: elevationLevel,
      };
    }
  }
  
  // Border radius
  let radiusValue: number = 0;
  if (typeof borderRadius === 'string' && borderRadius in Layout.borderRadius) {
    radiusValue = Layout.borderRadius[borderRadius];
  } else if (typeof borderRadius === 'number') {
    radiusValue = borderRadius;
  } else if (card) {
    radiusValue = Layout.borderRadius.md; // Default card radius
  }
  
  // Border style
  const borderStyle: ViewStyle = border ? {
    borderWidth: 1,
    borderColor,
  } : {};
  
  // Card style
  const cardStyle: ViewStyle = card ? {
    padding: 16,
    borderRadius: radiusValue || Layout.borderRadius.md,
    backgroundColor,
    ...borderStyle,
  } : {};
  
  return (
    <View 
      style={[
        { backgroundColor },
        radiusValue > 0 && { borderRadius: radiusValue },
        shadowStyle,
        border && !card && borderStyle,
        card && cardStyle,
        style,
      ]} 
      {...otherProps} 
    />
  );
}
