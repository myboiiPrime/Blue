import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MiniCandlestickChart from '../components/MiniCandlestickChart';

export default function WatchlistScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Watchlist</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.watchlistSection}>
          <View style={styles.stockCard}>
            <View style={styles.stockInfo}>
              <View style={styles.stockHeader}>
                <Text style={styles.stockSymbol}>AAPL</Text>
                <Text style={styles.stockName}>Apple Inc.</Text>
              </View>
              <View style={styles.stockDetails}>
                <Text style={styles.stockPrice}>$178.42</Text>
                <Text style={[styles.stockChange, styles.positiveChange]}>+$2.34 (1.3%)</Text>
              </View>
            </View>
            <View style={styles.chartContainer}>
              <MiniCandlestickChart trend="up" />
            </View>
          </View>
          
          <View style={styles.stockCard}>
            <View style={styles.stockInfo}>
              <View style={styles.stockHeader}>
                <Text style={styles.stockSymbol}>MSFT</Text>
                <Text style={styles.stockName}>Microsoft Corp.</Text>
              </View>
              <View style={styles.stockDetails}>
                <Text style={styles.stockPrice}>$325.76</Text>
                <Text style={[styles.stockChange, styles.positiveChange]}>+$4.21 (1.3%)</Text>
              </View>
            </View>
            <View style={styles.chartContainer}>
              <MiniCandlestickChart trend="up" />
            </View>
          </View>
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
});