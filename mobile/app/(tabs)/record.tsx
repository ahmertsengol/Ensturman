import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedLayout } from '@/components/ThemedLayout';
import AudioRecorderComponent from '@/components/audio/AudioRecorder';
import { useAuth } from '@/context/AuthContext';
import AppBackground from '@/components/AppBackground';

export default function RecordScreen() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated]);
  
  if (loading) {
    return (
      <AppBackground>
        <ThemedLayout>
          <View style={styles.container} />
        </ThemedLayout>
      </AppBackground>
    );
  }
  
  return (
    <AppBackground>
      <ThemedLayout>
        <View style={styles.container}>
          <AudioRecorderComponent />
        </View>
      </ThemedLayout>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
}); 