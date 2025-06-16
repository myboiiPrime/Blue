import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../utils/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const theme = useTheme();

  const handleThemeChange = (value: string) => {
    updateSettings({ theme: value as 'light' | 'dark' | 'system' });
  };

  const handleCurrencyChange = (value: string) => {
    updateSettings({ currency: value as 'USD' | 'EUR' | 'GBP' });
  };

  const handleTimeframeChange = (value: string) => {
    updateSettings({ chartTimeframe: value as '1D' | '1W' | '1M' | '3M' | '1Y' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.headerBackground }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.headerText }]}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={[styles.section, { borderBottomColor: theme.colors.divider }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Theme</Text>
            <View style={styles.optionsContainer}>
              {['light', 'dark', 'system'].map((themeOption) => (
                <TouchableOpacity 
                  key={themeOption}
                  style={[
                    styles.optionButton, 
                    { backgroundColor: theme.colors.card },
                    settings.theme === themeOption && [styles.selectedOption, { backgroundColor: theme.colors.primary }]
                  ]}
                  onPress={() => handleThemeChange(themeOption)}
                >
                  <Text 
                    style={[
                      styles.optionText, 
                      { color: theme.colors.secondary },
                      settings.theme === themeOption && [styles.selectedOptionText, { color: '#FFFFFF' }]
                    ]}
                  >
                    {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={[styles.settingLabel, { color: theme.colors.text }]}>Show Candlestick Background</Text>
            <Switch
              value={settings.showCandlestickBackground}
              onValueChange={(value) => updateSettings({ showCandlestickBackground: value })}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Charts & Data</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Default Chart Timeframe</Text>
            <View style={styles.optionsContainer}>
              {['1D', '1W', '1M', '3M', '1Y'].map((timeframe) => (
                <TouchableOpacity 
                  key={timeframe}
                  style={[styles.optionButton, settings.chartTimeframe === timeframe && styles.selectedOption]}
                  onPress={() => handleTimeframeChange(timeframe)}
                >
                  <Text style={[styles.optionText, settings.chartTimeframe === timeframe && styles.selectedOptionText]}>
                    {timeframe}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Currency</Text>
            <View style={styles.optionsContainer}>
              {['USD', 'EUR', 'GBP'].map((currency) => (
                <TouchableOpacity 
                  key={currency}
                  style={[styles.optionButton, settings.currency === currency && styles.selectedOption]}
                  onPress={() => handleCurrencyChange(currency)}
                >
                  <Text style={[styles.optionText, settings.currency === currency && styles.selectedOptionText]}>
                    {currency}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Switch
              value={settings.enableNotifications}
              onValueChange={(value) => updateSettings({ enableNotifications: value })}
              trackColor={{ false: '#E2E8F0', true: '#1E3A8A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        {/* Added Accessibility Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Font Size</Text>
            <View style={styles.optionsContainer}>
              {['small', 'medium', 'large'].map((size) => (
                <TouchableOpacity 
                  key={size}
                  style={[styles.optionButton, settings.fontSize === size && styles.selectedOption]}
                  onPress={() => updateSettings({ fontSize: size as 'small' | 'medium' | 'large' })}
                >
                  <Text style={[styles.optionText, settings.fontSize === size && styles.selectedOptionText]}>
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>High Contrast Mode</Text>
            <Switch
              value={settings.highContrastMode}
              onValueChange={(value) => updateSettings({ highContrastMode: value })}
              trackColor={{ false: '#E2E8F0', true: '#1E3A8A' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Reduce Motion</Text>
            <Switch
              value={settings.reduceMotion}
              onValueChange={(value) => updateSettings({ reduceMotion: value })}
              trackColor={{ false: '#E2E8F0', true: '#1E3A8A' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Screen Reader Optimized</Text>
            <Switch
              value={settings.screenReaderOptimized}
              onValueChange={(value) => updateSettings({ screenReaderOptimized: value })}
              trackColor={{ false: '#E2E8F0', true: '#1E3A8A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Added Trading Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trading Preferences</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Default Order Type</Text>
            <View style={styles.optionsContainer}>
              {['market', 'limit', 'stop'].map((type) => (
                <TouchableOpacity 
                  key={type}
                  style={[styles.optionButton, settings.defaultOrderType === type && styles.selectedOption]}
                  onPress={() => updateSettings({ defaultOrderType: type as 'market' | 'limit' | 'stop' })}
                >
                  <Text style={[styles.optionText, settings.defaultOrderType === type && styles.selectedOptionText]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Confirm Trades</Text>
            <Switch
              value={settings.confirmTrades}
              onValueChange={(value) => updateSettings({ confirmTrades: value })}
              trackColor={{ false: '#E2E8F0', true: '#1E3A8A' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Show Profit/Loss in Percent</Text>
            <Switch
              value={settings.showProfitLossInPercent}
              onValueChange={(value) => updateSettings({ showProfitLossInPercent: value })}
              trackColor={{ false: '#E2E8F0', true: '#1E3A8A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Added Security & Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security & Privacy</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Biometric Login</Text>
            <Switch
              value={settings.biometricLogin}
              onValueChange={(value) => updateSettings({ biometricLogin: value })}
              trackColor={{ false: '#E2E8F0', true: '#1E3A8A' }}
              thumbColor="#FFFFFF"
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Data Usage</Text>
            <View style={styles.optionsContainer}>
              {['wifi-only', 'always'].map((usage) => (
                <TouchableOpacity 
                  key={usage}
                  style={[styles.optionButton, settings.dataUsage === usage && styles.selectedOption]}
                  onPress={() => updateSettings({ dataUsage: usage as 'wifi-only' | 'always' })}
                >
                  <Text style={[styles.optionText, settings.dataUsage === usage && styles.selectedOptionText]}>
                    {usage === 'wifi-only' ? 'Wi-Fi Only' : 'Always'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Enable Analytics</Text>
            <Switch
              value={settings.analyticsEnabled}
              onValueChange={(value) => updateSettings({ analyticsEnabled: value })}
              trackColor={{ false: '#E2E8F0', true: '#1E3A8A' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.resetButton, { backgroundColor: theme.colors.card }]}
          onPress={resetSettings}
        >
          <Text style={[styles.resetButtonText, { color: theme.colors.negative }]}>Reset to Default Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#1E3A8A',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1E293B',
    flex: 1,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginLeft: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#1E3A8A',
  },
  optionText: {
    fontSize: 14,
    color: '#64748B',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  resetButton: {
    margin: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;