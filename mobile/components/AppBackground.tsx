import React from 'react';
import { StyleSheet, View } from 'react-native';

interface AppBackgroundProps {
  children: React.ReactNode;
}

export default function AppBackground({ children }: AppBackgroundProps) {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#191729', // Dark theme background color
  },
}); 