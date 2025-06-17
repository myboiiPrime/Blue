import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { userStockService } from '../services/api';

// Define the UserStockDto interface for type safety
interface UserStockDto {
  id: string;
  symbol: string;
  quantity: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage?: number;
}

export default function TradingScreen() {
  const [portfolioData, setPortfolioData] = useState<UserStockDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchTradingData();
  }, []);
  
  const fetchTradingData = async () => {
    try {
      const response = await userStockService.getUserPortfolio();
      const data = response.data?.data || response.data || [];
      setPortfolioData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching trading data:', error);
      Alert.alert('Error', 'Failed to load trading data');
      setPortfolioData([]);
    } finally {
      setLoading(false);
    }
  };
  
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
          <Text style={styles.sectionTitle}>Your Holdings</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#1E3A8A" />
          ) : portfolioData.length === 0 ? (
            <Text style={styles.emptyMessage}>No trading activity yet</Text>
          ) : (
            portfolioData.map((stock) => (
              <View key={stock.id} style={styles.activityItem}>
                <Text style={styles.activitySymbol}>{stock.symbol}</Text>
                <Text style={styles.activityDetails}>
                  {stock.quantity} shares • ${stock.currentValue.toFixed(2)}
                </Text>
                <Text style={[
                  styles.activityProfit,
                  stock.profitLoss >= 0 ? styles.positiveChange : styles.negativeChange
                ]}>
                  {stock.profitLoss >= 0 ? '+' : ''}${stock.profitLoss.toFixed(2)}
                </Text>
              </View>
            ))
          )}
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
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  activitySymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
  },
  activityDetails: {
    fontSize: 14,
    color: '#64748B',
    flex: 2,
  },
  activityProfit: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  positiveChange: {
    color: '#10B981',
  },
  negativeChange: {
    color: '#EF4444',
  },
});