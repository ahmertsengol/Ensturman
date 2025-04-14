import React from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ViewStyle, 
  Animated,
  Image
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Layout, Spacing } from '@/constants/Spacing';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Recording } from '../app/models/Recording';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Entypo from '@expo/vector-icons/Entypo';
import * as Haptics from 'expo-haptics';

interface RecordingCardProps {
  recording: Recording;
  isPlaying: boolean;
  playbackPosition?: number;
  duration: number;
  onPress: () => void;
  onLongPress?: () => void;
  isSelected?: boolean;
  style?: ViewStyle;
}

/**
 * Card component that displays a recording with playback controls and progress
 */
export function RecordingCard({
  recording,
  isPlaying,
  playbackPosition = 0,
  duration,
  onPress,
  onLongPress,
  isSelected = false,
  style
}: RecordingCardProps) {
  // Get theme colors
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const primaryLight = useThemeColor({}, 'primaryLight');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const selectedColor = useThemeColor({}, 'accent');
  
  // Calculate progress percentage for the progress bar
  const progressPercentage = Math.min(
    Math.max((playbackPosition / duration) * 100, 0),
    100
  );
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format duration
  const formatDuration = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Format time for current position
  const formatPosition = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle the play/pause button press with haptic feedback
  const handlePlayPausePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <ThemedView
      card
      elevated={1}
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        isSelected && { borderColor: selectedColor },
        style
      ]}
    >
      {isSelected && (
        <View style={[styles.selectedIndicator, { backgroundColor: selectedColor }]}>
          <FontAwesome5 name="trash-alt" size={12} color="#FFFFFF" />
        </View>
      )}
      
      <TouchableOpacity
        style={styles.content}
        onPress={handlePlayPausePress}
        onLongPress={onLongPress}
        delayLongPress={200}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <View style={[
            styles.playIcon, 
            { 
              borderColor: isPlaying ? secondaryColor : primaryColor,
              backgroundColor: isPlaying ? 'rgba(46, 144, 229, 0.1)' : 'transparent'
            }
          ]}>
            {isPlaying ? (
              <Feather 
                name="pause" 
                size={18} 
                color={secondaryColor} 
                style={styles.playIconInner}
              />
            ) : (
              <Feather 
                name="play" 
                size={18} 
                color={primaryColor} 
                style={styles.playIconInner}
              />
            )}
          </View>
        </View>
        
        <View style={styles.textContainer}>
          <ThemedText variant="bodyMedium" weight="semiBold" numberOfLines={1} style={styles.title}>
            {recording.title}
          </ThemedText>
          
          <View style={styles.detailsContainer}>
            <ThemedText variant="caption" muted style={styles.date}>
              {formatDate(recording.created)}
            </ThemedText>
            
            <ThemedText variant="caption" muted>
              {formatDuration(duration)}
            </ThemedText>
          </View>
          
          {/* Progress bar with time indicators */}
          <View style={styles.progressSection}>
            {isPlaying && (
              <ThemedText variant="caption" muted style={styles.timeIndicator}>
                {formatPosition(playbackPosition)}
              </ThemedText>
            )}
            
            <View style={[styles.progressContainer, { backgroundColor: borderColor }]}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${progressPercentage}%`,
                    backgroundColor: isPlaying ? secondaryColor : primaryColor
                  }
                ]} 
              />
            </View>
            
            {isPlaying && (
              <ThemedText variant="caption" muted style={styles.timeIndicator}>
                {formatDuration(duration)}
              </ThemedText>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    padding: 0,
  },
  selectedContainer: {
    borderWidth: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: Layout.borderRadius.sm,
    zIndex: 1,
  },
  checkIcon: {
    fontSize: 12,
    color: '#fff',
  },
  content: {
    flexDirection: 'row',
    padding: Spacing.md,
  },
  iconContainer: {
    marginRight: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconInner: {
    alignSelf: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    flex: 1,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressContainer: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  timeIndicator: {
    fontSize: 10,
    width: 36,
    textAlign: 'center',
  },
}); 