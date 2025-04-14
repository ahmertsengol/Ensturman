import { StyleSheet, TouchableOpacity, View, Image, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel"
        },
        {
          text: "Çıkış Yap",
          onPress: async () => {
            await logout();
          },
          style: "destructive"
        }
      ]
    );
  };

  const navigateToNetworkDiagnostic = () => {
    router.push('/network-diagnostic');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E0E0E0', dark: '#2D2E2F' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#909090"
          name="person.crop.circle.fill"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <IconSymbol size={60} name="person.fill" color="#FFFFFF" />
            </View>
          </View>
          
          <ThemedView style={styles.profileInfo}>
            <ThemedText variant="h1">{user?.name || 'Kullanıcı'}</ThemedText>
            <ThemedText>{user?.email || 'Email yok'}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText variant="h2">Hesap Bilgileri</ThemedText>
          
          <ThemedView style={styles.infoItem}>
            <IconSymbol size={24} name="person.fill" color="#909090" />
            <ThemedText>Ad Soyad: {user?.name}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoItem}>
            <IconSymbol size={24} name="envelope.fill" color="#909090" />
            <ThemedText>E-posta: {user?.email}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.infoItem}>
            <IconSymbol size={24} name="key.fill" color="#909090" />
            <ThemedText>Hesap ID: {user?.id}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText variant="h2">Ayarlar</ThemedText>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <IconSymbol size={24} name="bell.fill" color="#909090" />
              <ThemedText>Bildirimler</ThemedText>
            </View>
            <IconSymbol size={24} name="chevron.right" color="#909090" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <IconSymbol size={24} name="lock.fill" color="#909090" />
              <ThemedText>Gizlilik ve Güvenlik</ThemedText>
            </View>
            <IconSymbol size={24} name="chevron.right" color="#909090" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={navigateToNetworkDiagnostic}>
            <View style={styles.settingItemContent}>
              <IconSymbol size={24} name="wifi" color="#909090" />
              <ThemedText>Ağ Teşhis</ThemedText>
            </View>
            <IconSymbol size={24} name="chevron.right" color="#909090" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemContent}>
              <IconSymbol size={24} name="questionmark.circle.fill" color="#909090" />
              <ThemedText>Yardım ve Destek</ThemedText>
            </View>
            <IconSymbol size={24} name="chevron.right" color="#909090" />
          </TouchableOpacity>
        </ThemedView>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutButtonText}>Çıkış Yap</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerImage: {
    color: '#909090',
    bottom: -90,
    left: -35,
    position: 'absolute',
    opacity: 0.3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    marginRight: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
    gap: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 