import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import AudioRecorderComponent from '@/components/audio/AudioRecorder';
import { useAuth } from '@/context/AuthContext';

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
    return <ThemedView style={styles.container} />;
  }
  
  return (
    <ThemedView style={styles.container}>
      <AudioRecorderComponent />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
}); 