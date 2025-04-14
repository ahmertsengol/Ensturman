import { StyleSheet, Image, Platform, TouchableOpacity, Alert, View } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/Button';
import { Recording } from '../models/Recording';
import { recordingService } from '../services/recordingService';

export default function TabTwoScreen() {
  const { user } = useAuth();
  const [localRecordings, setLocalRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Yerel updates klasöründeki ses kayıtlarını yükle
  useEffect(() => {
    loadLocalRecordings();
  }, []);

  const loadLocalRecordings = async () => {
    try {
      setIsLoading(true);
      
      // Asset klasöründeki kayıtları al
      const assetDir = `${FileSystem.documentDirectory}assets/recordings/1/`;
      const bundleDir = '../../../assets/recordings/1/';
      
      // İlk olarak directory oluşturup test dosyalarını kopyalayalım
      try {
        const dirInfo = await FileSystem.getInfoAsync(assetDir);
        if (!dirInfo.exists) {
          console.log('Creating assets directory structure');
          await FileSystem.makeDirectoryAsync(assetDir, { intermediates: true });
        }
      } catch (err) {
        console.log('Error checking/creating directory:', err);
      }
      
      // Önce bundle içindeki kayıtları kontrol et
      console.log('Checking assets for recordings:', bundleDir);
      
      // Doğrudan asset olarak ses dosyalarını oku
      const recordings: Recording[] = [
        {
          id: 'local_1',
          title: 'Örnek Kayıt 1',
          uri: require('@/assets/recordings/1/recording-2025-04-13T12-42-32-453Z.m4a'),
          duration: 10000,
          created: new Date().toISOString(),
          userId: '1'
        },
        {
          id: 'local_2',
          title: 'Örnek Kayıt 2',
          uri: require('@/assets/click.mp3'),
          duration: 8000,
          created: new Date().toISOString(),
          userId: '1'
        },
        {
          id: 'local_3',
          title: 'Örnek Kayıt 3 (Cihaz Mikrofonu)',
          uri: require('@/assets/recordings/1/recording-2025-04-13T12-34-52-191Z.m4a'),
          duration: 12000,
          created: new Date().toISOString(),
          userId: '1'
        }
      ];
      
      setLocalRecordings(recordings);
      console.log('Loaded local recordings:', recordings.length);
    } catch (error) {
      console.error('Error loading local recordings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayRecording = (recording: Recording) => {
    // Dashboard sayfasına git ve kaydı oynat
    router.push({
      pathname: '/(tabs)/home',
      params: { playRecordingId: recording.id, recordingUri: recording.uri }
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText variant="h1">Keşfet</ThemedText>
      </ThemedView>
      {user && (
        <ThemedView style={styles.userInfoContainer}>
          <ThemedText variant="h2">Hoş Geldin, {user.name}!</ThemedText>
          <ThemedText>Giriş yapılan hesap: {user.email}</ThemedText>
        </ThemedView>
      )}
      <ThemedText style={styles.descriptionText}>
        Bu ekranda uygulama içeriğiniz görüntülenecektir.
      </ThemedText>
      
      {/* Yerel kayıtlar bölümü */}
      <Collapsible title="Örnek Ses Kayıtları">
        <ThemedText>
          Bu bölümde örnek ses kayıtlarını dinleyebilirsiniz.
        </ThemedText>
        
        {localRecordings.length > 0 ? (
          <View style={styles.recordingsContainer}>
            {localRecordings.map(recording => (
              <ThemedView 
                key={recording.id} 
                card 
                style={styles.recordingItem}
              >
                <ThemedText weight="semiBold">{recording.title}</ThemedText>
                <Button 
                  label="Dinle" 
                  variant="outline" 
                  size="sm"
                  onPress={() => handlePlayRecording(recording)}
                  style={styles.playButton}
                />
              </ThemedView>
            ))}
          </View>
        ) : (
          <ThemedText style={styles.emptyText}>
            {isLoading ? 'Kayıtlar yükleniyor...' : 'Henüz örnek kayıt bulunamadı.'}
          </ThemedText>
        )}
        
        <Button
          label="Kayıtları Yenile"
          variant="outline"
          onPress={loadLocalRecordings}
          style={styles.refreshButton}
        />
      </Collapsible>
      
      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText weight="semiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText weight="semiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText weight="semiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText style={{ color: '#0066cc' }}>Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText weight="semiBold">w</ThemedText> in the terminal running this project.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the <ThemedText weight="semiBold">@2x</ThemedText> and{' '}
          <ThemedText weight="semiBold">@3x</ThemedText> suffixes to provide files for
          different screen densities
        </ThemedText>
        <Image source={require('@/assets/images/react-logo.png')} style={{ alignSelf: 'center' }} />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText style={{ color: '#0066cc' }}>Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Custom fonts">
        <ThemedText>
          Open <ThemedText weight="semiBold">app/_layout.tsx</ThemedText> to see how to load{' '}
          <ThemedText style={{ fontFamily: 'SpaceMono' }}>
            custom fonts such as this one.
          </ThemedText>
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
          <ThemedText style={{ color: '#0066cc' }}>Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <ThemedText>
          This template has light and dark mode support. The{' '}
          <ThemedText weight="semiBold">useColorScheme()</ThemedText> hook lets you inspect
          what the user's current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText style={{ color: '#0066cc' }}>Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <ThemedText>
          This template includes an example of an animated component. The{' '}
          <ThemedText weight="semiBold">components/HelloWave.tsx</ThemedText> component uses
          the powerful <ThemedText weight="semiBold">react-native-reanimated</ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              The <ThemedText weight="semiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  userInfoContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  descriptionText: {
    textAlign: 'center',
    marginBottom: 40,
  },
  recordingsContainer: {
    marginTop: 10,
    gap: 8,
  },
  recordingItem: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  playButton: {
    minWidth: 80,
  },
  emptyText: {
    marginTop: 10,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  refreshButton: {
    marginTop: 12,
  }
});
