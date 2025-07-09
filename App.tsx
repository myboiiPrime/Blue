import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import TabNavigator from './src/navigation/TabNavigator';
import { notificationService } from './src/services/notificationService';
import { SettingsProvider } from './src/context/SettingsContext';

const App: React.FC = () => {
  useEffect(() => {
    // Safe initialization - won't crash if Firebase isn't configured
    const initNotifications = async () => {
      try {
        const isInitialized = await notificationService.initialize();
        if (isInitialized) {
          console.log('Notifications ready!');
          await notificationService.setupBasicNotifications();
        } else {
          console.log('Notifications will be configured later');
        }
      } catch (error) {
        console.log('Notification initialization skipped:', error);
      }
    };
    
    initNotifications();
  }, []);

  return (
    <SettingsProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </SettingsProvider>
  );
};

export default App;