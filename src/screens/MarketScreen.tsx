import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { userStockService, UserStockDto } from '../services/api';

export default function MarketScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [portfolioData, setPortfolioData] = useState<UserStockDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    fetchPortfolioData();
  }, []);
  
  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      const response = await userStockService.getUserPortfolio();
      // Handle potential nested data structure
      const data = response.data?.data || response.data || [];
      setPortfolioData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      Alert.alert('Error', 'Failed to load market data');
      setPortfolioData([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPortfolioData();
    setRefreshing(false);
  };
  
  const filteredData = portfolioData.filter(item => 
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const renderStockItem = ({ item }) => (
    <TouchableOpacity style={styles.stockItem}>
      <View style={styles.stockInfo}>
        <Text style={styles.stockSymbol}>{item.symbol}</Text>
        <Text style={styles.stockName}>Qty: {item.quantity}</Text>
      </View>
      <View style={styles.stockPriceInfo}>
        <Text style={styles.stockPrice}>${item.currentValue.toFixed(2)}</Text>
        <Text 
          style={[styles.stockChange, item.profitLoss >= 0 ? styles.positiveChange : styles.negativeChange]}
        >
          {item.profitLoss >= 0 ? '+' : ''}${item.profitLoss.toFixed(2)} ({item.profitLossPercentage.toFixed(2)}%)
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading portfolio...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Portfolio</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your stocks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <FlatList
        data={filteredData}
        renderItem={renderStockItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No stocks in your portfolio</Text>
            <Text style={styles.emptySubtext}>Start trading to see your investments here</Text>
          </View>
        }
      />
    </View>
  );
}

// Add loading and empty state styles
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
  searchContainer: {
    padding: 15,
    backgroundColor: '#F1F5F9',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
  },
  activeFilter: {
    backgroundColor: '#1E3A8A',
  },
  filterText: {
    color: '#64748B',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  listContent: {
    padding: 15,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  stockName: {
    fontSize: 14,
    color: '#64748B',
  },
  stockPriceInfo: {
    alignItems: 'flex-end',
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  stockChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  positiveChange: {
    color: '#10B981',
  },
  negativeChange: {
    color: '#EF4444',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
});