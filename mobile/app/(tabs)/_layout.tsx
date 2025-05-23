// mobile/app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Colors } from '../../constants/Colors';
import MusicChatbot from '../../components/ui/MusicChatbot';

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const brandColor = '#9C27B0';

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#1F1D36', // Dark background from login theme
            borderTopWidth: 0, // Remove top border
            elevation: 0, // Remove shadow on Android
            shadowOpacity: 0, // Remove shadow on iOS
            height: 60, // Slightly taller tab bar
            paddingBottom: 8, // Add padding at the bottom
          },
          tabBarActiveTintColor: brandColor,
          tabBarInactiveTintColor: '#A0AEC0',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
          headerStyle: {
            backgroundColor: '#191729', // Match dark theme
          },
          headerTintColor: '#E0E0E0', // Light text for dark background
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitle: 'EnsAI',
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="recordings"
          options={{
            title: 'Recordings',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="library-music" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="record"
          options={{
            title: 'Record',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="mic" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="explore" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      <MusicChatbot />
    </>
  );
}