import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, FlatList } from 'react-native';
import { userStockService, UserStockDto } from '../services/api';
import { getStaticPortfolioData } from '../services/staticData';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type WatchlistScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Market indices data
const marketIndices = [
  {
    symbol: 'VNINDEX',
    value: '1,381.56',
    change: '-0.40',
    changePercent: '-0.03%',
    volume: '4.6K bil',
    isPositive: false
  },
  {
    symbol: 'VN30',
    value: '1,480.54',
    change: '-0.66',
    changePercent: '-0.04%',
    volume: '1.7K bil',
    isPositive: false
  },
  {
    symbol: 'HNX',
    value: '239.87',
    change: '+1.23',
    changePercent: '+0.52%',
    volume: '392M',
    isPositive: true
  }
];

export default function WatchlistScreen() {
  const navigation = useNavigation<WatchlistScreenNavigationProp>();
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
      const apiData = response.data || [];
      const apiPortfolio = Array.isArray(apiData) ? apiData : [];
      
      // Get static data to add as additional content
      const staticData = getStaticPortfolioData();
      
      // Combine API data with static data (remove duplicates by symbol)
      const combinedData = [...apiPortfolio];
      staticData.forEach(staticStock => {
        // Only add static stock if it doesn't already exist in API data
        if (!apiPortfolio.find(apiStock => apiStock.symbol === staticStock.symbol)) {
          combinedData.push(staticStock);
        }
      });
      
      setPortfolioData(combinedData);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      Alert.alert('Error', 'Failed to load market data. Showing offline portfolio.');
      
      // Use static data service as fallback when API fails
      const fallbackData = getStaticPortfolioData();
      setPortfolioData(fallbackData);
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
  
  const renderStockItem = ({ item }: { item: UserStockDto }) => (
    <TouchableOpacity 
      style={styles.stockItem}
      onPress={() => navigation.navigate('PortfolioInternal', { symbol: item.symbol })}
    >
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
      {/* Market Overview Section - Top Third */}
      <View style={styles.marketOverviewContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.marketScrollView}>
          {marketIndices.map((index, i) => (
            <View key={index.symbol} style={styles.marketIndexCard}>
              <View style={styles.marketIndexHeader}>
                <Text style={styles.marketIndexSymbol}>{index.symbol}</Text>
                <Text style={styles.marketIndexValue}>{index.value}</Text>
              </View>
              <View style={styles.marketIndexDetails}>
                <Text style={styles.marketIndexVolume}>{index.volume}</Text>
                <Text style={[styles.marketIndexChange, index.isPositive ? styles.positiveText : styles.negativeText]}>
                  {index.change} {index.changePercent}
                </Text>
              </View>
              {/* Mini chart placeholder */}
              <View style={styles.miniChart}>
                <View style={[styles.chartLine, index.isPositive ? styles.positiveChart : styles.negativeChart]} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      
      {/* My Followings Section */}
      <View style={styles.followingsSection}>
        <View style={styles.followingsHeader}>
          <Text style={styles.followingsTitle}>My followings</Text>
          <View style={styles.followingsActions}>
            <TouchableOpacity style={styles.gridButton}>
              <Text style={styles.gridButtonText}>⊞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.moreButton}>
              <Text style={styles.moreButtonText}>⋮</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Symbol</Text>
          <Text style={styles.tableHeaderText}>Price +/- (%)</Text>
          <Text style={styles.tableHeaderText}>Total vol</Text>
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
              <TouchableOpacity style={styles.addSymbolButton}>
                <Text style={styles.addSymbolText}>+ Add new symbol</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  // Market Overview Styles
  marketOverviewContainer: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  marketScrollView: {
    flexDirection: 'row',
  },
  marketIndexCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  marketIndexHeader: {
    marginBottom: 8,
  },
  marketIndexSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  marketIndexValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  marketIndexDetails: {
    marginBottom: 12,
  },
  marketIndexVolume: {
    fontSize: 12,
    color: '#6C757D',
    marginBottom: 2,
  },
  marketIndexChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  positiveText: {
    color: '#28A745',
  },
  negativeText: {
    color: '#DC3545',
  },
  miniChart: {
    height: 30,
    justifyContent: 'center',
  },
  chartLine: {
    height: 2,
    borderRadius: 1,
  },
  positiveChart: {
    backgroundColor: '#28A745',
  },
  negativeChart: {
    backgroundColor: '#DC3545',
  },
  // Followings Section Styles
  followingsSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  followingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  followingsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  followingsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  gridButton: {
    padding: 4,
  },
  gridButtonText: {
    fontSize: 18,
    color: '#6C757D',
  },
  moreButton: {
    padding: 4,
  },
  moreButtonText: {
    fontSize: 18,
    color: '#6C757D',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  tableHeaderText: {
    fontSize: 14,
    color: '#6C757D',
    fontWeight: '500',
    flex: 1,
  },
  // Stock Item Styles (Updated)
  listContent: {
    paddingHorizontal: 16,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFA500', // Orange color for stock symbols
    marginBottom: 4,
  },
  stockName: {
    fontSize: 14,
    color: '#6C757D',
  },
  stockPriceInfo: {
    alignItems: 'flex-end',
    flex: 1,
  },
  stockPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFA500', // Orange color for price
    marginBottom: 4,
  },
  stockChange: {
    fontSize: 14,
    fontWeight: '500',
  },
  positiveChange: {
    color: '#28A745',
  },
  negativeChange: {
    color: '#DC3545',
  },
  // Loading and Empty States
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6C757D',
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  addSymbolButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  addSymbolText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});