import { useColorScheme } from 'react-native';
import { useSettings } from '../context/SettingsContext';

// Define theme types for better type safety
export type ThemeColors = {
  background: string;
  text: string;
  primary: string;
  secondary: string;
  card: string;
  border: string;
  notification: string;
  positive: string;
  negative: string;
  statusBarBg: string;
  surfaceBackground: string;
  surfaceText: string;
  buttonBackground: string;
  buttonText: string;
  inputBackground: string;
  inputText: string;
  headerBackground: string;
  headerText: string;
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
  cardBackground: string;
  cardText: string;
  divider: string;
};

export type ThemeType = {
  isDark: boolean;
  colors: ThemeColors;
  statusBarStyle: 'light-content' | 'dark-content';
};

export const useTheme = (): ThemeType => {
  const { settings } = useSettings();
  const deviceTheme = useColorScheme();
  
  // Determine the actual theme to use based on settings
  const activeTheme = settings.theme === 'system' ? deviceTheme || 'light' : settings.theme;
  
  // Light theme colors
  const lightColors: ThemeColors = {
    background: '#FFFFFF',
    text: '#000000',
    primary: '#1E3A8A',
    secondary: '#64748B',
    card: '#F1F5F9',
    border: '#E2E8F0',
    notification: '#EF4444',
    positive: '#10B981',
    negative: '#EF4444',
    statusBarBg: '#FFFFFF',
    surfaceBackground: '#F8FAFC',
    surfaceText: '#1E293B',
    buttonBackground: '#1E3A8A',
    buttonText: '#FFFFFF',
    inputBackground: '#F1F5F9',
    inputText: '#1E293B',
    headerBackground: '#1E3A8A',
    headerText: '#FFFFFF',
    tabBarBackground: '#FFFFFF',
    tabBarActive: '#1E3A8A',
    tabBarInactive: '#94A3B8',
    cardBackground: '#FFFFFF',
    cardText: '#1E293B',
    divider: '#E2E8F0',
  };
  
  // Dark theme colors - enhanced for better readability
  const darkColors: ThemeColors = {
    background: '#121212',  // Slightly lighter than pure black for better contrast
    text: '#E2E8F0',        // Not pure white to reduce eye strain
    primary: '#3B82F6',     // Brighter blue for better visibility in dark mode
    secondary: '#94A3B8',   // Lighter gray for secondary text
    card: '#1E293B',        // Dark blue-gray for cards
    border: '#334155',      // Visible but not harsh borders
    notification: '#EF4444',
    positive: '#10B981',
    negative: '#EF4444',
    statusBarBg: '#121212',
    surfaceBackground: '#1E1E1E', // Slightly lighter than background
    surfaceText: '#E2E8F0',       // Easy to read text
    buttonBackground: '#3B82F6',   // Bright blue buttons
    buttonText: '#FFFFFF',
    inputBackground: '#2A2A2A',    // Slightly lighter than background
    inputText: '#E2E8F0',
    headerBackground: '#1A1A1A',   // Slightly darker than main background
    headerText: '#FFFFFF',
    tabBarBackground: '#1A1A1A',
    tabBarActive: '#3B82F6',       // Bright blue for active tabs
    tabBarInactive: '#94A3B8',     // Muted gray for inactive tabs
    cardBackground: '#1E293B',     // Dark blue-gray for cards
    cardText: '#E2E8F0',           // Light gray text for cards
    divider: '#334155',            // Visible dividers
  };
  
  // Return the appropriate color scheme
  return {
    isDark: activeTheme === 'dark',
    colors: activeTheme === 'dark' ? darkColors : lightColors,
    statusBarStyle: activeTheme === 'dark' ? 'light-content' : 'dark-content',
  };
};