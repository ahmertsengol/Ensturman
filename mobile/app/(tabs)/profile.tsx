import React from 'react';
import { StyleSheet, Alert, ScrollView, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const { currentUser, logout } = useAuth();
  const tintColor = Colors[colorScheme ?? 'light'].tint;
  
  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (!currentUser) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>Giriş yapılmadı</ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: tintColor }]}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text style={styles.buttonText}>Giriş Yap</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        
        <ThemedView style={styles.header}>
          <ThemedView style={styles.avatarContainer}>
            <IconSymbol 
              name="person.fill" 
              size={60} 
              color={Colors[colorScheme ?? 'light'].tint} 
            />
          </ThemedView>
          <ThemedText style={styles.username}>{currentUser.username}</ThemedText>
          <ThemedText style={styles.email}>{currentUser.email}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.infoSection}>
          <ThemedText style={styles.sectionTitle}>Hesap Bilgileri</ThemedText>
          
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Kullanıcı Adı</ThemedText>
            <ThemedText style={styles.infoValue}>{currentUser.username}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>E-posta</ThemedText>
            <ThemedText style={styles.infoValue}>{currentUser.email}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Kullanıcı ID</ThemedText>
            <ThemedText style={styles.infoValue}>{currentUser.id}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    opacity: 0.8,
  },
  infoSection: {
    marginBottom: 30,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontWeight: '500',
  },
  infoValue: {
    opacity: 0.8,
  },
  actionsSection: {
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
}); 