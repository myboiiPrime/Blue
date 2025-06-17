import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { userService, userStockService, UserProfile, Portfolio } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({ navigation }) {
  const { settings } = useSettings();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [portfolioStats, setPortfolioStats] = useState({
    portfolioValue: 0,
    stocksOwned: 0,
    completedTrades: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUserData();
  }, []);
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const profileResponse = await userService.getUserProfile();
      setUserProfile(profileResponse.data);
      
      // Fetch portfolio data
      const portfolioResponse = await userStockService.getUserPortfolio();
      const portfolio = portfolioResponse.data?.data || portfolioResponse.data || [];
      
      // Calculate portfolio stats from the array of stocks
      const totalValue = Array.isArray(portfolio) 
        ? portfolio.reduce((sum, stock) => sum + (stock.currentValue || 0), 0)
        : 0;
      
      setPortfolioStats({
        portfolioValue: totalValue,
        stocksOwned: Array.isArray(portfolio) ? portfolio.length : 0,
        completedTrades: 0 // This field doesn't exist in backend
      });
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      // Clear the token
      await AsyncStorage.removeItem('token');
      // Navigate back to welcome screen
      navigation.navigate('Welcome');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile?.fullName ? userProfile.fullName.split(' ').map(name => name[0]).join('').toUpperCase() : 'U'}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{userProfile?.fullName || 'User'}</Text>
          <Text style={styles.userEmail}>{userProfile?.email || 'No email'}</Text>
        </View>
        
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : '£'}
              {portfolioStats.portfolioValue.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Portfolio Value</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{portfolioStats.stocksOwned}</Text>
            <Text style={styles.statLabel}>Stocks Owned</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{portfolioStats.completedTrades}</Text>
            <Text style={styles.statLabel}>Completed Trades</Text>
          </View>
        </View>
        
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Account Settings</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Payment Methods</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Notification Preferences</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.menuItemText}>App Settings</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Security</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Help & Support</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>About Blue</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#1E3A8A',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#64748B',
  },
  statsSection: {
    flexDirection: 'row',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  menuSection: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1E293B',
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#64748B',
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});