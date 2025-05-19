// mobile/app/(tabs)/index.tsx
import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Button, Surface, useTheme } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { ThemedLayout } from '@/components/ThemedLayout';
import AppBackground from '@/components/AppBackground';

export default function HomeScreen() {
  const theme = useTheme();
  const brandColor = '#1DB954'; // Spotify green
  
  return (
    <AppBackground>
      <ThemedLayout>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animatable.View animation="fadeInUp" delay={300}>
            <Text style={styles.welcomeText}>
              Welcome to <Text style={styles.brandText}>Audio Recorder</Text>
            </Text>
            
            <Text style={styles.subtitle}>
              Record, analyze, and improve your music
            </Text>
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" delay={600}>
            <Surface style={styles.cardContainer}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              
              <View style={styles.cardsRow}>
                <Card style={styles.actionCard} mode="elevated">
                  <Card.Content>
                    <Text style={styles.cardTitle}>New Recording</Text>
                  </Card.Content>
                  <Card.Actions>
                    <Button
                      buttonColor={brandColor}
                      textColor="#fff"
                      mode="contained"
                    >
                      Record
                    </Button>
                  </Card.Actions>
                </Card>
                
                <Card style={styles.actionCard} mode="elevated">
                  <Card.Content>
                    <Text style={styles.cardTitle}>Training</Text>
                  </Card.Content>
                  <Card.Actions>
                    <Button
                      buttonColor={brandColor}
                      textColor="#fff"
                      mode="contained"
                    >
                      Start
                    </Button>
                  </Card.Actions>
                </Card>
              </View>
              
              <Text style={styles.sectionTitle}>Recent Recordings</Text>
              
              <Card style={styles.listCard} mode="elevated">
                <Card.Content>
                  <Text style={styles.emptyText}>No recent recordings found</Text>
                </Card.Content>
              </Card>
            </Surface>
          </Animatable.View>
        </ScrollView>
      </ThemedLayout>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E0E0E0',
    textAlign: 'center',
    marginVertical: 16,
  },
  brandText: {
    color: '#1DB954', // Spotify green
  },
  subtitle: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
    marginBottom: 24,
  },
  cardContainer: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(47, 42, 75, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(30, 185, 84, 0.3)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginVertical: 12,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCard: {
    width: '47%',
    backgroundColor: 'rgba(25, 23, 41, 0.8)',
  },
  cardTitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginBottom: 8,
  },
  listCard: {
    backgroundColor: 'rgba(25, 23, 41, 0.8)',
    marginBottom: 16,
  },
  emptyText: {
    color: '#A0AEC0',
    textAlign: 'center',
    padding: 16,
  },
});