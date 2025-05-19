import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  elevation = 0,
  ...otherProps 
}: ThemedViewProps) {
  const theme = useTheme();

  // Use the theme's background color by default
  const backgroundColor = lightColor || darkColor 
    ? theme.dark ? darkColor : lightColor
    : theme.colors.background;

  // Avoid using Surface directly with ViewProps to prevent type errors
  return (
    <View
      style={[
        { 
          backgroundColor,
          ...getShadowStyle(elevation),
        }, 
        style
      ]}
      {...otherProps}
    />
  );
}

// Helper function to get shadow style based on elevation
function getShadowStyle(elevation: 0 | 1 | 2 | 3 | 4 | 5) {
  const shadowOpacity = 0.15 * Math.min(elevation, 5);
  
  return {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: elevation,
    },
    shadowOpacity,
    shadowRadius: elevation,
    elevation,
  };
}
