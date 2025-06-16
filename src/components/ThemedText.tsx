import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '../utils/theme';

interface ThemedTextProps extends TextProps {
  variant?: 'body' | 'title' | 'subtitle' | 'caption' | 'button';
}

const ThemedText: React.FC<ThemedTextProps> = ({ 
  children, 
  style, 
  variant = 'body',
  ...props 
}) => {
  const theme = useTheme();
  
  const getVariantStyle = () => {
    switch (variant) {
      case 'title':
        return styles.title;
      case 'subtitle':
        return styles.subtitle;
      case 'caption':
        return styles.caption;
      case 'button':
        return styles.button;
      default:
        return styles.body;
    }
  };
  
  return (
    <Text 
      style={[
        getVariantStyle(),
        { color: theme.colors.text },
        style
      ]} 
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  body: {
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  caption: {
    fontSize: 14,
    color: '#64748B', // This will be overridden by the theme color
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ThemedText;