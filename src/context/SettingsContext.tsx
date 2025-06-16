import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the types for our settings
type ThemeMode = 'light' | 'dark' | 'system';
type OrderType = 'market' | 'limit' | 'stop';
type DataUsage = 'wifi-only' | 'always';
type FontSize = 'small' | 'medium' | 'large';

interface AppSettings {
  // Appearance
  theme: ThemeMode;
  showCandlestickBackground: boolean;
  fontSize: FontSize;
  highContrastMode: boolean;
  reduceMotion: boolean;
  
  // Notifications
  enableNotifications: boolean;
  
  // Charts & Data
  chartTimeframe: '1D' | '1W' | '1M' | '3M' | '1Y';
  currency: 'USD' | 'EUR' | 'GBP';
  
  // Trading Preferences
  defaultOrderType: OrderType;
  confirmTrades: boolean;
  showProfitLossInPercent: boolean;
  
  // Security & Privacy
  biometricLogin: boolean;
  dataUsage: DataUsage;
  analyticsEnabled: boolean;
  screenReaderOptimized: boolean;
}

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

// Default settings
const defaultSettings: AppSettings = {
  // Appearance
  theme: 'light',
  showCandlestickBackground: true,
  fontSize: 'medium',
  highContrastMode: false,
  reduceMotion: false,
  
  // Notifications
  enableNotifications: true,
  
  // Charts & Data
  chartTimeframe: '1D',
  currency: 'USD',
  
  // Trading Preferences
  defaultOrderType: 'market',
  confirmTrades: true,
  showProfitLossInPercent: false,
  
  // Security & Privacy
  biometricLogin: false,
  dataUsage: 'always',
  analyticsEnabled: true,
  screenReaderOptimized: false,
};

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Storage key
const SETTINGS_STORAGE_KEY = 'blue_app_settings';

// Provider component
export const SettingsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (storedSettings) {
          setSettings(JSON.parse(storedSettings));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadSettings();
  }, []);

  // Save settings to storage whenever they change
  useEffect(() => {
    const saveSettings = async () => {
      if (!isLoaded) return; // Don't save during initial load
      
      try {
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    };

    saveSettings();
  }, [settings, isLoaded]);

  // Update settings
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};