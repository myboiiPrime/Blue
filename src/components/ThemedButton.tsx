import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../utils/theme';
import ThemedText from './ThemedText';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

const ThemedButton: React.FC<ThemedButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
}) => {
  const theme = useTheme();
  
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.primary,
          borderWidth: 1,
        };
      default:
        return {
          backgroundColor: theme.colors.buttonBackground,
          borderColor: 'transparent',
        };
    }
  };
  
  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return theme.colors.text;
      case 'outline':
        return theme.colors.primary;
      default:
        return theme.colors.buttonText;
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <ThemedText 
        style={[
          styles.text, 
          { color: getTextColor() },
          disabled && styles.disabledText,
          textStyle,
        ]}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    opacity: 0.8,
  },
});

export default ThemedButton;