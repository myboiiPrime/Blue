import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import your screens
import WelcomeScreen from './app/index';
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TabNavigator from './src/navigation/TabNavigator';

// Import Settings Provider and ThemeProvider
import { SettingsProvider } from './src/context/SettingsContext';
import ThemeProvider from './src/components/ThemeProvider';

// Create the stack navigator
const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator 
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="MainApp" component={TabNavigator} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SettingsProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;