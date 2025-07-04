import React, { useState, useEffect } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, FlatList, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from '@react-navigation/native';
import MiniCandlestickChart from "../components/MiniCandlestickChart";
import { useTheme } from "../utils/theme";
import { stockService, CandlestickData } from '../services/api';
import { getStaticMarketData } from '../services/staticData';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  chartData: CandlestickData[]; // Changed from number[] to CandlestickData[]
}

interface IndexData {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  volume: string;
  chartData: CandlestickData[]; // Changed from number[] to CandlestickData[]
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('Active');
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [indexData, setIndexData] = useState<IndexData[]>([]);

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      setLoading(true);
      
      const marketOverview = await stockService.getMarketOverview();
      console.log('API Response:', marketOverview); // Add this
      
      const processedMarketData: MarketData[] = [];
      
      for (const stockData of marketOverview) {
        const quote = stockData['Global Quote'];
        if (quote) {
          const symbol = quote['01. symbol'];
          const price = parseFloat(quote['05. price']);
          const change = parseFloat(quote['09. change']);
          const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
          const volume = parseInt(quote['06. volume']);
          
          // Fetch historical data for chart
          try {
            const historicalData = await stockService.getHistoricalData(symbol, '1day');
            const chartData = historicalData.slice(-20); // Keep full CandlestickData objects
            
            processedMarketData.push({
              symbol,
              name: symbol,
              price,
              change,
              changePercent,
              volume,
              chartData
            });
          } catch (error) {
            console.error(`Error fetching chart data for ${symbol}:`, error);
            processedMarketData.push({
              symbol,
              name: symbol,
              price,
              change,
              changePercent,
              volume,
              chartData: []
            });
          }
        }
      }
      
      setMarketData(processedMarketData);
      
      // Create index data from major stocks
      // Instead of static fallbacks, use dynamic defaults or skip creation
      if (processedMarketData.length >= 3) {
        const indices: IndexData[] = [
          {
            name: 'TECH INDEX',
            value: processedMarketData[0]?.price * 10 || 0, // Use 0 instead of static
            change: processedMarketData[0]?.change * 10 || 0,
            changePercent: processedMarketData[0]?.changePercent || 0,
            volume: '21.0K bil',
            chartData: processedMarketData[0]?.chartData || []
          },
          {
            name: 'MARKET 30',
            value: processedMarketData[1]?.price * 8 || 1420.35,
            change: processedMarketData[1]?.change * 8 || 19.15,
            changePercent: processedMarketData[1]?.changePercent || 1.37,
            volume: '10.1K bil',
            chartData: processedMarketData[1]?.chartData || []
          },
          {
            name: 'GROWTH INDEX',
            value: processedMarketData[2]?.price * 2 || 245.67,
            change: processedMarketData[2]?.change * 2 || 3.21,
            changePercent: processedMarketData[2]?.changePercent || 1.33,
            volume: '1.6K bil',
            chartData: processedMarketData[2]?.chartData || []
          }
        ];
        setIndexData(indices);
      }
      
    } catch (error) {
      console.error('Error fetching market data:', error);
      Alert.alert('Error', 'Failed to fetch market data. Please check your internet connection.');
      
      // Use static data service
      const fallbackData = getStaticMarketData();
      setMarketData(fallbackData);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderIndexCard = ({ item }: { item: IndexData }) => (
    <View style={styles.indexCard}>
      <View style={styles.indexHeader}>
        <Text style={styles.indexSymbol}>{item.name}</Text>
        <Text style={styles.indexVolume}>{item.volume}</Text>
      </View>
      <View style={styles.indexMainContent}>
        <View style={styles.indexValueSection}>
          <Text style={styles.indexValue}>{item.value.toFixed(2)}</Text>
          <Text style={[styles.indexChange, item.change >= 0 ? styles.positiveChange : styles.negativeChange]}>
            {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
          </Text>
        </View>
        <View style={styles.indexChart}>
          {item.chartData.length > 0 && (
            <MiniCandlestickChart 
              data={item.chartData} 
              width={100} 
              height={50}
            />
          )}
        </View>
      </View>
    </View>
  );

  const renderStockRow = ({ item }: { item: MarketData }) => (
    <View style={styles.stockRow}>
      <Text style={[styles.stockSymbolCell, { color: '#10B981' }]}>{item.symbol}</Text>
      <Text style={styles.stockCell}>{item.price.toFixed(2)}</Text>
      <Text style={[styles.stockCell, item.change >= 0 ? styles.positiveChange : styles.negativeChange]}>
        {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
      </Text>
      <Text style={[styles.stockCell, item.changePercent >= 0 ? styles.positiveChange : styles.negativeChange]}>
        {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
      </Text>
      <Text style={styles.stockCell}>{formatNumber(item.volume)}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading market data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileIcon}>
          <Text style={styles.profileIconText}>👤</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.searchBar}>
          <Text style={styles.searchText}>🔍 Search</Text>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <View style={styles.supportBadge}>
            <Text style={styles.supportText}>Support</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.headerIcon}>👆</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.headerIcon}>🔐</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationContainer}>
            <Text style={styles.headerIcon}>🔔</Text>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>10</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Action Buttons Section */}
        <View style={styles.actionSection}>
          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>📊</Text>
              </View>
              <Text style={styles.actionLabel}>Order</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>💰</Text>
              </View>
              <Text style={styles.actionLabel}>Deposit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>🔄</Text>
              </View>
              <Text style={styles.actionLabel}>Transfer money</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionIconContainer}>
                <Text style={styles.actionIcon}>📈</Text>
              </View>
              <Text style={styles.actionLabel}>Margin</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pageIndicator}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Market Overview */}
        <View style={styles.marketOverview}>
          <FlatList
            data={indexData}
            renderItem={renderIndexCard}
            keyExtractor={(item) => item.name}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.indexList}
          />
        </View>

        {/* Market Tabs */}
        <View style={styles.marketTabs}>
          {['Active', 'Movers', 'Shakers'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.marketTab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.marketTabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.tabsRight}>
            <TouchableOpacity onPress={fetchMarketData}>
              <Text style={styles.moreText}>Refresh</Text>
            </TouchableOpacity>
            <Text style={styles.gridIcon}>⊞</Text>
          </View>
        </View>

        {/* Stock List */}
        <View style={styles.stockList}>
          <View style={styles.stockListHeader}>
            <Text style={styles.stockHeaderCell}>Symbol</Text>
            <Text style={styles.stockHeaderCell}>Price</Text>
            <Text style={styles.stockHeaderCell}>+/-</Text>
            <Text style={styles.stockHeaderCell}>%</Text>
            <Text style={styles.stockHeaderCell}>Total vol</Text>
          </View>
          <FlatList
            data={marketData}
            renderItem={renderStockRow}
            keyExtractor={(item) => item.symbol}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileIconText: {
    fontSize: 18,
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginRight: 12,
  },
  searchText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  supportText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  headerIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  notificationContainer: {
    position: 'relative',
    marginLeft: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1001,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  actionSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#3B82F6',
  },
  marketOverview: {
    marginTop: 16,
  },
  indexList: {
    paddingHorizontal: 16,
  },
  indexCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  indexHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  indexSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  indexVolume: {
    fontSize: 12,
    color: '#64748B',
  },
  indexMainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  indexValueSection: {
    flex: 1,
  },
  indexValue: {
    fontSize: 20, // Reduced from 24
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  indexChange: {
    fontSize: 12, // Reduced from 14
    fontWeight: '600',
  },
  indexChart: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  positiveChange: {
    color: '#10B981',
  },
  negativeChange: {
    color: '#EF4444',
  },
  marketTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  marketTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: 'transparent',
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    borderRadius: 0,
  },
  marketTabText: {
    color: '#64748B',
    fontWeight: '500',
    fontSize: 16,
  },
  activeTabText: {
    color: '#1E293B',
    fontWeight: '600',
  },
  tabsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  moreText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  gridIcon: {
    fontSize: 18,
    color: '#64748B',
  },
  stockList: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 20,
  },
  stockListHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stockHeaderCell: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  stockRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  stockSymbolCell: {
    flex: 1,
    fontSize: 12, // Reduced from 14
    fontWeight: 'bold',
    textAlign: 'left',
  },
  stockCell: {
    flex: 1,
    fontSize: 12, // Reduced from 14
    textAlign: 'center',
    color: '#1E293B',
    fontWeight: '500',
  },
});
