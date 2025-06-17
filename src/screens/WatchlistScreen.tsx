import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { userStockService, stockService, withTimeout, TimeRange, CandlestickData } from '../services/api';
import MiniCandlestickChart from '../components/MiniCandlestickChart';

// Define the stock interface for type safety
interface Stock {
  id: string;
  symbol: string;
  quantity: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

interface StockWithChart extends Stock {
  chartData: CandlestickData[];
}

export default function WatchlistScreen() {
  const [watchlistData, setWatchlistData] = useState<StockWithChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('1day');
  const [marketData, setMarketData] = useState<{symbol: string, data: CandlestickData[]}[]>([]);
  
  useEffect(() => {
    fetchWatchlistData();
  }, [timeRange]);
  
  const fetchWatchlistData = async () => {
    try {
      setLoading(true);
      
      // Fetch portfolio data with timeout
      const portfolioResponse = await withTimeout(
        userStockService.getUserPortfolio(),
        10000
      );
      const portfolioData = portfolioResponse.data || [];
      
      // Fetch chart data for each stock
      const stocksWithCharts = await Promise.all(
        portfolioData.map(async (stock) => {
          try {
            const chartData = await withTimeout(
              stockService.getHistoricalData(stock.symbol, timeRange),
              10000
            );
            return { ...stock, chartData };
          } catch (error) {
            console.error(`Error fetching chart data for ${stock.symbol}:`, error);
            return { ...stock, chartData: [] };
          }
        })
      );
      
      // Fetch market overview
      const marketOverview = await withTimeout(
        stockService.getMarketOverviewWithHistory(timeRange),
        15000
      );
      
      setWatchlistData(stocksWithCharts);
      setMarketData(marketOverview);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      
      if (error.message === 'Network timeout') {
        Alert.alert(
          'Connection Timeout',
          'Unable to connect to the server. You will be redirected to sign in.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to sign in screen
                // You'll need to implement navigation logic here
                console.log('Redirect to sign in');
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to load watchlist');
      }
      
      setWatchlistData([]);
      setMarketData([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTimeRangeChange = (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
  };
  
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Loading watchlist...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Stocks</Text>
        
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {(['1day', '1week', '30days'] as TimeRange[]).map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                timeRange === range && styles.timeRangeButtonActive
              ]}
              onPress={() => handleTimeRangeChange(range)}
            >
              <Text style={[
                styles.timeRangeText,
                timeRange === range && styles.timeRangeTextActive
              ]}>
                {range === '1day' ? '1D' : range === '1week' ? '1W' : '30D'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Market Overview Section */}
        <View style={styles.marketSection}>
          <Text style={styles.sectionTitle}>Market Overview</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {marketData.map((market) => (
              <View key={market.symbol} style={styles.marketCard}>
                <Text style={styles.marketSymbol}>{market.symbol}</Text>
                <MiniCandlestickChart 
                  data={market.data}
                  symbol={market.symbol}
                  timeRange={timeRange}
                  width={100}
                  height={60}
                />
              </View>
            ))}
          </ScrollView>
        </View>
        
        {/* Portfolio Section */}
        <View style={styles.watchlistSection}>
          <Text style={styles.sectionTitle}>Your Portfolio</Text>
          {!Array.isArray(watchlistData) || watchlistData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No stocks in your portfolio</Text>
            </View>
          ) : (
            watchlistData.map((stock) => (
              <View key={stock.id} style={styles.stockCard}>
                <View style={styles.stockInfo}>
                  <View style={styles.stockHeader}>
                    <Text style={styles.stockSymbol}>{stock.symbol}</Text>
                    <Text style={styles.stockName}>Qty: {stock.quantity}</Text>
                  </View>
                  <View style={styles.stockDetails}>
                    <Text style={styles.stockPrice}>${stock.currentValue.toFixed(2)}</Text>
                    <Text style={[
                      styles.stockChange, 
                      stock.profitLoss >= 0 ? styles.positiveChange : styles.negativeChange
                    ]}>
                      {stock.profitLoss >= 0 ? '+' : ''}${stock.profitLoss.toFixed(2)} ({stock.profitLossPercentage.toFixed(2)}%)
                    </Text>
                  </View>
                </View>
                <View style={styles.chartContainer}>
                  <MiniCandlestickChart 
                    data={stock.chartData}
                    symbol={stock.symbol}
                    timeRange={timeRange}
                  />
                </View>
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
  watchlistSection: {
    padding: 15,
  },
  stockCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stockInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  stockHeader: {
    marginBottom: 5,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  stockName: {
    fontSize: 14,
    color: '#64748B',
  },
  stockDetails: {
    marginTop: 5,
  },
  stockPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  stockChange: {
    fontSize: 14,
  },
  positiveChange: {
    color: '#10B981',
  },
  negativeChange: {
    color: '#EF4444',
  },
  chartContainer: {
    width: 80,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748B',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 2,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timeRangeTextActive: {
    color: '#1E3A8A',
  },
  marketSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
  },
  marketCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 120,
  },
  marketSymbol: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 5,
  },
  
  // Remove the duplicated properties below:
  // chartContainer, emptyContainer, emptyText, loadingContainer, loadingText are duplicated
});