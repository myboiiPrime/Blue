import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import MiniCandlestickChart from '../src/components/MiniCandlestickChart';

export default function Dashboard() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.portfolioSummary}>
          <Text style={styles.sectionTitle}>Portfolio Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Value</Text>
              <Text style={styles.summaryValue}>$24,680.45</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Today's Change</Text>
              <Text style={[styles.summaryValue, styles.positiveChange]}>+$346.20 (1.4%)</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Gain/Loss</Text>
              <Text style={[styles.summaryValue, styles.positiveChange]}>+$2,845.30 (13.2%)</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.watchlistSection}>
          <Text style={styles.sectionTitle}>Watchlist</Text>
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
          
          <View style={styles.stockCard}>
            <View style={styles.stockInfo}>
              <View style={styles.stockHeader}>
                <Text style={styles.stockSymbol}>TSLA</Text>
                <Text style={styles.stockName}>Tesla Inc.</Text>
              </View>
              <View style={styles.stockDetails}>
                <Text style={styles.stockPrice}>$246.53</Text>
                <Text style={[styles.stockChange, styles.negativeChange]}>-$3.47 (1.4%)</Text>
              </View>
            </View>
            <View style={styles.chartContainer}>
              <MiniCandlestickChart trend="down" />
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Trade Now</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  portfolioSummary: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 15,
  },
  summaryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  positiveChange: {
    color: '#10B981',
  },
  negativeChange: {
    color: '#EF4444',
  },
  watchlistSection: {
    marginBottom: 30,
  },
  stockCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: 'row',
  },
  stockInfo: {
    flex: 1,
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginRight: 10,
  },
  stockName: {
    fontSize: 14,
    color: '#64748B',
  },
  stockDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  stockChange: {
    fontSize: 16,
    fontWeight: '500',
  },
  chartContainer: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});