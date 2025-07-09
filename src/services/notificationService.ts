import messaging from '@react-native-firebase/messaging';
import { firebase } from '@react-native-firebase/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

export interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: number;
  read: boolean;
  type: 'STOCK_ALERT' | 'PORTFOLIO_UPDATE' | 'MARKET_NEWS' | 'TRADE_EXECUTION' | 'GENERAL';
}

class NotificationService {
  private fcmToken: string | null = null;

  async initialize(): Promise<boolean> {
    try {
      // Check if Firebase app is already initialized
      let app;
      try {
        app = firebase.app();
      } catch (error) {
        // App not initialized, this is fine for React Native Firebase
        console.log('Firebase app will be auto-initialized');
      }
      
      // Test if Firebase is properly linked
      const authStatus = await messaging().requestPermission();
      console.log('Firebase initialized successfully');
      return true;
    } catch (error) {
      console.log('Firebase not properly configured yet:', error);
      return false;
    }
  }

  async getFCMToken(): Promise<string | null> {
    try {
      if (!this.fcmToken) {
        this.fcmToken = await messaging().getToken();
        console.log('FCM Token:', this.fcmToken);
        await AsyncStorage.setItem('fcm_token', this.fcmToken);
      }
      return this.fcmToken;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  // Simplified version for testing
  async setupBasicNotifications(): Promise<void> {
    try {
      messaging().onMessage(async remoteMessage => {
        console.log('Received notification:', remoteMessage);
        Alert.alert(
          remoteMessage.notification?.title || 'Notification',
          remoteMessage.notification?.body || 'New message'
        );
      });
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;