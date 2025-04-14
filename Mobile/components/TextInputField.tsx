import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Platform
} from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Layout, Spacing } from '@/constants/Spacing';

export interface TextInputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

/**
 * Styled TextInput component with label and error state
 */
export function TextInputField({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  style,
  value,
  placeholder,
  editable = true,
  ...otherProps
}: TextInputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  
  // Get theme colors
  const textColor = useThemeColor({}, 'inputText');
  const backgroundColor = useThemeColor({}, 'inputBackground');
  const borderColor = useThemeColor({}, error ? 'error' : isFocused ? 'primary' : 'inputBorder');
  const placeholderColor = useThemeColor({}, 'inputPlaceholder');
  const errorColor = useThemeColor({}, 'error');
  
  // Container styles
  const containerStyles: ViewStyle[] = [
    styles.container,
    containerStyle || {},
  ];
  
  // Input container styles
  const inputContainerStyles = [
    styles.inputContainer,
    {
      backgroundColor,
      borderColor,
      opacity: editable ? 1 : 0.6,
    },
    inputStyle as any,
  ];
  
  return (
    <View style={containerStyles}>
      {label && (
        <ThemedText variant="label" style={styles.label}>
          {label}
        </ThemedText>
      )}
      
      <View style={inputContainerStyles}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            {
              color: textColor,
              paddingLeft: leftIcon ? 0 : Spacing.md,
              paddingRight: rightIcon ? 0 : Spacing.md,
            },
            style,
          ]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
          selectionColor={borderColor}
          {...otherProps}
        />
        
        {rightIcon && (
          <TouchableOpacity 
            style={styles.rightIcon}
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <ThemedText variant="caption" style={[styles.errorText, { color: errorColor }]}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
    height: Layout.inputHeight.md,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
  },
  leftIcon: {
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
  },
  rightIcon: {
    paddingRight: Spacing.md,
    paddingLeft: Spacing.xs,
  },
  errorText: {
    marginTop: Spacing.xs,
  },
}); 