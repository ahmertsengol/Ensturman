// mobile/app/(tabs)/explore.tsx
import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Chip, Button, useTheme } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { ThemedLayout } from '@/components/ThemedLayout';
import AppBackground from '@/components/AppBackground';

export default function ExploreScreen() {
  const theme = useTheme();
  const brandColor = '#1DB954'; // Spotify green
  const accentColor = '#E91E63'; // Pink
  
  return (
    <AppBackground>
      <ThemedLayout>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animatable.View animation="fadeInUp" delay={300}>
            <Text style={styles.sectionTitle}>Training Modules</Text>
            
            <Card style={styles.moduleCard} mode="elevated">
              <Card.Content>
                <Text style={styles.cardTitle}>Beginner Pitch Training</Text>
                <Text style={styles.cardDescription}>
                  Learn to recognize and reproduce basic musical pitches
                </Text>
                <View style={styles.chipContainer}>
                  <Chip style={[styles.chip, {backgroundColor: 'rgba(30, 185, 84, 0.2)'}]} textStyle={{color: brandColor}}>
                    Beginner
                  </Chip>
                  <Chip style={[styles.chip, {backgroundColor: 'rgba(233, 30, 99, 0.2)'}]} textStyle={{color: accentColor}}>
                    15 minutes
                  </Chip>
                </View>
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
            
            <Card style={styles.moduleCard} mode="elevated">
              <Card.Content>
                <Text style={styles.cardTitle}>Intermediate Scale Training</Text>
                <Text style={styles.cardDescription}>
                  Practice major and minor scales with real-time feedback
                </Text>
                <View style={styles.chipContainer}>
                  <Chip style={[styles.chip, {backgroundColor: 'rgba(233, 30, 99, 0.2)'}]} textStyle={{color: accentColor}}>
                    Intermediate
                  </Chip>
                  <Chip style={[styles.chip, {backgroundColor: 'rgba(30, 185, 84, 0.2)'}]} textStyle={{color: brandColor}}>
                    20 minutes
                  </Chip>
                </View>
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
            
            <Text style={styles.sectionTitle}>Community</Text>
            
            <Card style={styles.communityCard} mode="elevated">
              <Card.Content>
                <Text style={styles.cardDescription}>
                  Join our community to share recordings and get feedback from other musicians.
                </Text>
              </Card.Content>
              <Card.Actions>
                <Button
                  buttonColor="transparent"
                  textColor={brandColor}
                  mode="outlined"
                  style={styles.outlinedButton}
                >
                  Learn More
                </Button>
              </Card.Actions>
            </Card>
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginVertical: 16,
  },
  moduleCard: {
    backgroundColor: 'rgba(47, 42, 75, 0.8)',
    marginBottom: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1DB954',
  },
  communityCard: {
    backgroundColor: 'rgba(47, 42, 75, 0.8)',
    marginBottom: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E91E63',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E0E0E0',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#A0AEC0',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  chip: {
    marginRight: 8,
    borderWidth: 0,
  },
  outlinedButton: {
    borderColor: '#1DB954',
    borderWidth: 1,
  },
});