import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';

const marketData = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.42, change: 1.3 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 325.76, change: 1.3 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.65, change: 0.8 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 132.83, change: -0.5 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 246.53, change: -1.4 },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 326.49, change: 2.1 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 116.40, change: 3.2 },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', price: 364.00, change: 0.3 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 187.63, change: -0.2 },
  { symbol: 'V', name: 'Visa Inc.', price: 267.24, change: 0.7 },
];

export default function Market() {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const filteredData = marketData.filter(item => 
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const renderStockItem = ({ item }) => (
    <TouchableOpacity style={styles.stockItem}>
      <View style={styles.stockInfo}>
        <Text style={styles.stockSymbol}>{item.symbol}</Text>
        <Text style={styles.stockName}>{item.name}</Text>
      </View>
      <View style={styles.stockPriceInfo}>
        <Text style={styles.stockPrice}>${item.price.toFixed(2)}</Text>
        <Text 
          style={[styles.stockChange, item.change >= 0 ? styles.positiveChange : styles.negativeChange]}
        >
          {item.change >= 0 ? '+' : ''}{item.change}%
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Market</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search stocks..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity style={[styles.filterButton, styles.activeFilter]}>
          <Text style={styles.activeFilterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Gainers</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>Losers</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredData}
        renderItem={renderStockItem}
        keyExtractor={item => item.symbol}
        contentContainerStyle={styles.listContent}
      />
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
});