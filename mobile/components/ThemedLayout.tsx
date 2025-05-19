// mobile/components/ThemedLayout.tsx
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';

interface ThemedLayoutProps extends ViewProps {
  children: React.ReactNode;
  withAnimation?: boolean;
  animationDelay?: number;
  withGradient?: boolean;
  withBorder?: boolean;
}

export function ThemedLayout({ 
  children, 
  withAnimation = true,
  animationDelay = 300,
  withGradient = true,
  withBorder = false,
  style,
  ...otherProps 
}: ThemedLayoutProps) {
  const theme = useTheme();
  
  // Theme colors from login screen
  const brandColor = '#1DB954'; // Spotify green
  const accentColor = '#E91E63'; // Pink
  const darkColor = '#191729'; // Koyu arkaplan
  
  const content = (
    <View style={[styles.container, style]} {...otherProps}>
      {withGradient && (
        <LinearGradient
          colors={['#13111F', '#191729', '#1F1D36']}
          style={styles.background}
        />
      )}
      
      <View style={styles.contentContainer}>
        {children}
      </View>
      
      {withBorder && (
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
      )}
    </View>
  );
  
  if (withAnimation) {
    return (
      <Animatable.View 
        animation="fadeIn" 
        duration={800}
        delay={animationDelay}
        style={styles.animContainer}
      >
        {content}
      </Animatable.View>
    );
  }
  
  return content;
}

const styles = StyleSheet.create({
  animContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
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