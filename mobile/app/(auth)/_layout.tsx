import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  // Redirect to tabs if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated()) {
      router.replace('/');
    }
  }, [loading, isAuthenticated]);
  
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
} 