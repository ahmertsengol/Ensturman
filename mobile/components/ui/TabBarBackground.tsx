import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { BlurView } from 'expo-blur';

// This is a shim for web and Android where the tab bar is generally opaque.
export default function TabBarBackground() {
  const theme = useTheme();
  
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        style={StyleSheet.absoluteFill}
        intensity={80}
        tint={theme.dark ? 'dark' : 'light'}
      />
    );
  }
  
  // For Android and Web, use a solid background with opacity
  return (
    <View 
      style={[
        StyleSheet.absoluteFill, 
        { 
          backgroundColor: theme.colors.elevation.level2,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderColor: theme.colors.outline,
        }
      ]} 
    />
  );
}

export function useBottomTabOverflow() {
  // Return overflow value if needed
  return 0;
}
