import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function TradingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Trading</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.tradingOptions}>
          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>📈</Text>
            <Text style={styles.optionTitle}>Buy Stocks</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>📉</Text>
            <Text style={styles.optionTitle}>Sell Stocks</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>📋</Text>
            <Text style={styles.optionTitle}>Orders</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionCard}>
            <Text style={styles.optionIcon}>📊</Text>
            <Text style={styles.optionTitle}>History</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.emptyMessage}>No recent trading activity</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  tradingOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 20,
    margin: '1%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  optionIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  recentActivity: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    padding: 20,
  },
});