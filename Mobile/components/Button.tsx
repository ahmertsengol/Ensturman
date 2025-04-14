import React from 'react';
import { 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  ViewStyle, 
  TouchableOpacityProps,
  Pressable,
  Platform
} from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Layout, Spacing } from '@/constants/Spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Button component with multiple variants and sizes
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  disabled,
  ...otherProps
}: ButtonProps) {
  // Get theme colors
  const primaryColor = useThemeColor({}, 'buttonPrimary');
  const primaryPressedColor = useThemeColor({}, 'buttonPrimaryPressed');
  const secondaryColor = useThemeColor({}, 'buttonSecondary');
  const secondaryPressedColor = useThemeColor({}, 'buttonSecondaryPressed');
  const textColor = useThemeColor({}, 'buttonText');
  const disabledColor = useThemeColor({}, 'buttonDisabled');
  const buttonTextColor = useThemeColor({}, 'text');
  
  // Set height based on size
  const height = Layout.buttonHeight[size];
  
  // Determine padding based on size
  let paddingHorizontal;
  switch (size) {
    case 'sm':
      paddingHorizontal = Spacing.md;
      break;
    case 'lg':
      paddingHorizontal = Spacing.lg;
      break;
    default:
      paddingHorizontal = Spacing.md;
  }
  
  // Base button style
  const baseStyle: ViewStyle = {
    height,
    paddingHorizontal,
    borderRadius: Layout.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.6 : 1,
    ...(fullWidth && { width: '100%' }),
  };
  
  // Style variations based on variant
  const getVariantStyle = (pressed: boolean): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: pressed ? primaryPressedColor : primaryColor,
        };
      case 'secondary':
        return {
          backgroundColor: pressed ? secondaryPressedColor : secondaryColor,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: primaryColor,
        };
      case 'ghost':
        return {
          backgroundColor: pressed ? 'rgba(0,0,0,0.05)' : 'transparent',
        };
      default:
        return {};
    }
  };
  
  // Determine text color based on variant
  const getTextColor = () => {
    if (disabled) return disabledColor;
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        return textColor;
      case 'outline':
      case 'ghost':
        return primaryColor;
      default:
        return buttonTextColor;
    }
  };
  
  const textColorStyle = { color: getTextColor() };
  
  // Text size based on button size
  const getTextVariant = () => {
    switch (size) {
      case 'sm':
        return 'buttonSmall';
      case 'lg':
        return 'button';
      default:
        return 'button';
    }
  };
  
  // Get space between items
  const getGap = () => {
    switch (size) {
      case 'sm':
        return Spacing.xs;
      case 'lg':
        return Spacing.md;
      default:
        return Spacing.sm;
    }
  };
  
  // Different rendering for iOS and Android for better press states
  if (Platform.OS === 'ios') {
    return (
      <TouchableOpacity
        style={[baseStyle, getVariantStyle(false), style]}
        disabled={disabled || loading}
        activeOpacity={0.7}
        {...otherProps}
      >
        {leftIcon && <View style={{ marginRight: getGap() }}>{leftIcon}</View>}
        
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' || variant === 'secondary' ? textColor : primaryColor} 
          />
        ) : (
          <ThemedText 
            variant={getTextVariant()} 
            weight="semiBold"
            style={textColorStyle}
          >
            {label}
          </ThemedText>
        )}
        
        {rightIcon && <View style={{ marginLeft: getGap() }}>{rightIcon}</View>}
      </TouchableOpacity>
    );
  }
  
  // Android version using Pressable for better press states
  return (
    <Pressable
      style={({ pressed }) => [
        baseStyle, 
        getVariantStyle(pressed),
        style
      ]}
      disabled={disabled || loading}
      {...otherProps}
    >
      {({ pressed }) => (
        <>
          {leftIcon && <View style={{ marginRight: getGap() }}>{leftIcon}</View>}
          
          {loading ? (
            <ActivityIndicator 
              size="small" 
              color={variant === 'primary' || variant === 'secondary' ? textColor : primaryColor} 
            />
          ) : (
            <ThemedText 
              variant={getTextVariant()} 
              weight="semiBold"
              style={textColorStyle}
            >
              {label}
            </ThemedText>
          )}
          
          {rightIcon && <View style={{ marginLeft: getGap() }}>{rightIcon}</View>}
        </>
      )}
    </Pressable>
  );
}

// Helper component for spacing in button
const View = ({ children, style }: { children: React.ReactNode, style?: ViewStyle }) => (
  <React.Fragment>{children}</React.Fragment>
); 