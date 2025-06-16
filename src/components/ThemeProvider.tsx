import React from 'react';
import { StatusBar, SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../utils/theme';

interface ThemeProviderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, style }) => {
  const theme = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      <StatusBar 
        barStyle={theme.statusBarStyle} 
        backgroundColor={theme.colors.statusBarBg} 
      />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ThemeProvider;