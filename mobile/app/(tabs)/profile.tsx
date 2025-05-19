import React from 'react';
import { StyleSheet, View, ScrollView, Image } from 'react-native';
import { Text, Button, Divider, Avatar, Surface, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { ThemedLayout } from '@/components/ThemedLayout';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import AppBackground from '@/components/AppBackground';

export default function ProfileScreen() {
  const { currentUser, logout } = useAuth();
  const theme = useTheme();
  const brandColor = '#1DB954'; // Spotify green
  const accentColor = '#E91E63'; // Pink
  
  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };
  
  return (
    <AppBackground>
      <ThemedLayout>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animatable.View animation="fadeInUp" delay={300} style={styles.profileHeader}>
            <Avatar.Text 
              size={80} 
              label={currentUser?.username?.substring(0, 2)?.toUpperCase() || 'U'} 
              style={[styles.avatar, { backgroundColor: brandColor }]}
              color="#fff"
            />
            <Text style={styles.username}>{currentUser?.username || 'User'}</Text>
            <Text style={styles.email}>{currentUser?.email || 'user@example.com'}</Text>
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" delay={500}>
            <Surface style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Recordings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>0</Text>
                <Text style={styles.statLabel}>Hours</Text>
              </View>
            </Surface>
            
            <Surface style={styles.menuContainer}>
              <View style={styles.menuItem}>
                <Ionicons name="settings-outline" size={24} color="#E0E0E0" />
                <Text style={styles.menuText}>Settings</Text>
                <Ionicons name="chevron-forward" size={20} color="#E0E0E0" style={styles.menuArrow} />
              </View>
              <Divider style={styles.menuDivider} />
              <View style={styles.menuItem}>
                <Ionicons name="shield-outline" size={24} color="#E0E0E0" />
                <Text style={styles.menuText}>Privacy</Text>
                <Ionicons name="chevron-forward" size={20} color="#E0E0E0" style={styles.menuArrow} />
              </View>
              <Divider style={styles.menuDivider} />
              <View style={styles.menuItem}>
                <Ionicons name="help-circle-outline" size={24} color="#E0E0E0" />
                <Text style={styles.menuText}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={20} color="#E0E0E0" style={styles.menuArrow} />
              </View>
              <Divider style={styles.menuDivider} />
              <View style={styles.menuItem}>
                <Ionicons name="information-circle-outline" size={24} color="#E0E0E0" />
                <Text style={styles.menuText}>About</Text>
                <Ionicons name="chevron-forward" size={20} color="#E0E0E0" style={styles.menuArrow} />
              </View>
            </Surface>
            
            <Button 
              mode="outlined" 
              onPress={handleLogout}
              style={styles.logoutButton}
              textColor="#E91E63"
            >
              Logout
            </Button>
          </Animatable.View>
        </ScrollView>
      </ThemedLayout>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    marginBottom: 16,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#A0AEC0',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(47, 42, 75, 0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(30, 185, 84, 0.3)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1DB954',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#A0AEC0',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(160, 174, 192, 0.3)',
  },
  menuContainer: {
    backgroundColor: 'rgba(47, 42, 75, 0.8)',
    borderRadius: 16,
    padding: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(30, 185, 84, 0.3)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#E0E0E0',
    marginLeft: 16,
    flex: 1,
  },
  menuArrow: {
    opacity: 0.5,
  },
  menuDivider: {
    backgroundColor: 'rgba(160, 174, 192, 0.2)',
  },
  logoutButton: {
    borderColor: '#E91E63',
    borderWidth: 1,
    marginTop: 8,
  },
}); 