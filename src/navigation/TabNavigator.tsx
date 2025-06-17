import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import WatchlistScreen from '../screens/WatchlistScreen';
import MarketScreen from '../screens/MarketScreen';
import TradingScreen from '../screens/TradingScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconText;

          if (route.name === 'Home') {
            iconText = '🏠';
          } else if (route.name === 'Watchlist') {
            iconText = '⭐';
          } else if (route.name === 'Market') {
            iconText = '📈';
          } else if (route.name === 'Trading') {
            iconText = '🔄';
          } else if (route.name === 'Asset') {
            iconText = '💼';
          }

          return (
            <View style={styles.tabIconContainer}>
              <Text style={{ fontSize: size, color }}>{iconText}</Text>
            </View>
          );
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
          height: 84,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
          color: '#1C1C1E',
        },
        headerTintColor: '#007AFF',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen name="Market" component={MarketScreen} />
      <Tab.Screen name="Trading" component={TradingScreen} />
      <Tab.Screen name="Asset" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default TabNavigator;