import React from 'react';
import { StyleSheet, Text as RNText, TextProps } from 'react-native';
import { useTheme } from 'react-native-paper';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'subtitle' | 'label' | 'error';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...otherProps
}: ThemedTextProps) {
  const theme = useTheme();
  
  // Get correct text color based on theme
  let color = lightColor || darkColor
    ? theme.dark ? darkColor : lightColor
    : theme.colors.onBackground;
    
  // If error type, use error color
  if (type === 'error') {
    color = theme.colors.error;
  }

  return (
    <RNText
      style={[
        styles.text,
        type === 'title' && styles.title,
        type === 'subtitle' && styles.subtitle,
        type === 'label' && styles.label,
        { color, 
          fontFamily: getFontFamily(type, theme.dark) 
        },
        style,
      ]}
      {...otherProps}
    />
  );
}

// Helper function to get the appropriate font family based on text type
function getFontFamily(type: string, isDark: boolean) {
  switch (type) {
    case 'title':
      return 'Poppins_700Bold';
    case 'subtitle':
      return 'Poppins_600SemiBold';
    case 'label':
      return 'Inter_500Medium';
    default:
      return 'Inter_400Regular';
  }
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});
