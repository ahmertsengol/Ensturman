import { Text, type TextProps, StyleSheet, TextStyle } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { Typography } from '@/constants/Typography';

// Define all available text variants
export type TextVariant = keyof typeof Typography.variant | 'default';
// Define valid font weight values for React Native
export type FontWeight = '400' | '500' | '600' | '700' | 'normal' | 'bold' | 'medium' | 'semi-bold';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: TextVariant;
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  muted?: boolean;
  secondary?: boolean;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
};

/**
 * Text component that uses the theme colors and typography
 */
export function ThemedText({
  style,
  lightColor,
  darkColor,
  variant = 'bodyMedium',
  weight,
  muted = false,
  secondary = false,
  align,
  ...rest
}: ThemedTextProps) {
  // Get the appropriate text color from the theme
  const color = useThemeColor(
    { light: lightColor, dark: darkColor }, 
    muted ? 'textMuted' : secondary ? 'textSecondary' : 'text'
  );

  // Get typography styles based on the variant
  const variantStyle = variant === 'default' 
    ? Typography.variant.bodyMedium
    : Typography.variant[variant];

  // Get font weight if specified
  const fontWeightStyle: Partial<TextStyle> = weight 
    ? { fontWeight: Typography.fontWeight[weight] as TextStyle['fontWeight'] } 
    : {};

  // Text alignment
  const alignStyle: Partial<TextStyle> = align ? { textAlign: align } : {};

  return (
    <Text
      style={[
        { color },
        variantStyle as TextStyle,
        fontWeightStyle,
        alignStyle,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
