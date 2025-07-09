import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { notificationService, NotificationData } from '../services/notificationService';

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
    
    // Listen for new notifications
    const handleNewNotification = (notification: NotificationData) => {
      setNotifications(prev => [notification, ...prev]);
    };
    
    notificationService.addNotificationListener(handleNewNotification);
    
    return () => {
      notificationService.removeNotificationListener(handleNewNotification);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      const stored = await notificationService.getStoredNotifications();
      setNotifications(stored);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: NotificationData) => {
    if (!notification.read) {
      await notificationService.markNotificationAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
    }
  };

  const clearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await notificationService.clearAllNotifications();
            setNotifications([]);
          },
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'STOCK_ALERT': return '📈';
      case 'PORTFOLIO_UPDATE': return '💼';
      case 'MARKET_NEWS': return '📰';
      case 'TRADE_EXECUTION': return '💰';
      default: return '🔔';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: NotificationData }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationIcon}>
          {getNotificationIcon(item.type)}
        </Text>
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, !item.read && styles.unreadText]}>
            {item.title}
          </Text>
          <Text style={styles.notificationTime}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
      <Text style={styles.notificationBody}>{item.body}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <TouchableOpacity onPress={clearAllNotifications}>
            <Text style={styles.clearButton}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>🔔</Text>
          <Text style={styles.emptyStateTitle}>No notifications yet</Text>
          <Text style={styles.emptyStateSubtitle}>
            You'll receive notifications about stock alerts, portfolio updates, and market news here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  notificationItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: 'bold',
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  notificationBody: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default NotificationsScreen;