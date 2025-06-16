import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CandlestickBackground from "../src/components/CandlestickBackground";
import MiniCandlestickChart from "../src/components/MiniCandlestickChart";
import { useTheme } from "../src/utils/theme";

export default function Index() {
  const navigation = useNavigation();
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <CandlestickBackground opacity={0.08} />
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.colors.statusBarBg} />
      
      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileIconText}>👤</Text>
        </View>
        <View style={styles.searchBar}>
          <Text style={styles.searchText}>Search</Text>
        </View>
        <View style={styles.headerIcons}>
          <Text style={styles.headerIcon}>👆</Text>
          <Text style={styles.headerIcon}>🔐</Text>
          <Text style={styles.headerIcon}>🔔</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Hello!</Text>
          <Text style={styles.welcomeText}>
            Start trading with Blue Stock Exchange!
          </Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.buttonText}>Open Account</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.loginButton]} 
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.featuresSection}>
          <View style={styles.featureRow}>
            <TouchableOpacity style={styles.featureItem}>
              <Text style={styles.featureIcon}>📊</Text>
              <Text style={styles.featureLabel}>Order</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.featureItem}>
              <Text style={styles.featureIcon}>💰</Text>
              <Text style={styles.featureLabel}>Deposit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔄</Text>
              <Text style={styles.featureLabel}>Transfer money</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.featureItem}>
              <Text style={styles.featureIcon}>📈</Text>
              <Text style={styles.featureLabel}>Margin</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.marketIndices}>
          <View style={styles.indexCard}>
            <View style={styles.indexInfo}>
              <Text style={styles.indexName}>VNINDEX</Text>
              <Text style={styles.indexValue}>1,296.29</Text>
              <Text style={[styles.indexChange, styles.negativeChange]}>-5.10 -0.39%</Text>
              <Text style={styles.indexVolume}>22.4K ...</Text>
            </View>
            <View style={styles.indexChart}>
              <MiniCandlestickChart width={150} height={60} trend="down" />
            </View>
          </View>
          
          <View style={styles.indexCard}>
            <View style={styles.indexInfo}>
              <Text style={styles.indexName}>VN30</Text>
              <Text style={styles.indexValue}>1,379.75</Text>
              <Text style={[styles.indexChange, styles.negativeChange]}>-4.69 -0.34%</Text>
              <Text style={styles.indexVolume}>12.3K bil</Text>
            </View>
            <View style={styles.indexChart}>
              <MiniCandlestickChart width={150} height={60} trend="down" />
            </View>
          </View>
        </View>
        
        <View style={styles.marketTabs}>
          <TouchableOpacity style={[styles.marketTab, styles.activeTab]}>
            <Text style={[styles.marketTabText, styles.activeTabText]}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.marketTab}>
            <Text style={styles.marketTabText}>Movers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.marketTab}>
            <Text style={styles.marketTabText}>Shakers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.marketTab}>
            <Text style={styles.marketTabText}>More</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.stockList}>
          <View style={styles.stockListHeader}>
            <Text style={styles.stockHeaderCell}>Symbol</Text>
            <Text style={styles.stockHeaderCell}>Price</Text>
            <Text style={styles.stockHeaderCell}>+/-</Text>
            <Text style={styles.stockHeaderCell}>%</Text>
            <Text style={styles.stockHeaderCell}>Total vol</Text>
          </View>
          
          <View style={styles.stockRow}>
            <Text style={[styles.stockSymbolCell, styles.positiveText]}>VPB</Text>
            <Text style={styles.stockCell}>18.20</Text>
            <Text style={[styles.stockCell, styles.positiveText]}>0.15</Text>
            <Text style={[styles.stockCell, styles.positiveText]}>0.83%</Text>
            <Text style={styles.stockCell}>64,648,000</Text>
          </View>
          
          <View style={styles.stockRow}>
            <Text style={[styles.stockSymbolCell, styles.negativeText]}>SHB</Text>
            <Text style={styles.stockCell}>13.35</Text>
            <Text style={[styles.stockCell, styles.negativeText]}>-0.10</Text>
            <Text style={[styles.stockCell, styles.negativeText]}>-0.74%</Text>
            <Text style={styles.stockCell}>59,670,700</Text>
          </View>
          
          <View style={styles.stockRow}>
            <Text style={[styles.stockSymbolCell, styles.negativeText]}>VIX</Text>
            <Text style={styles.stockCell}>12.80</Text>
            <Text style={[styles.stockCell, styles.negativeText]}>-0.25</Text>
            <Text style={[styles.stockCell, styles.negativeText]}>-1.92%</Text>
            <Text style={styles.stockCell}>43,199,400</Text>
          </View>
          
          <View style={styles.stockRow}>
            <Text style={[styles.stockSymbolCell, styles.positiveText]}>CII</Text>
            <Text style={styles.stockCell}>14.20</Text>
            <Text style={[styles.stockCell, styles.positiveText]}>0.90</Text>
            <Text style={[styles.stockCell, styles.positiveText]}>6.77%</Text>
            <Text style={styles.stockCell}>26,701,800</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: 'transparent',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileIconText: {
    fontSize: 20,
  },
  searchBar: {
    flex: 1,
    height: 40,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  searchText: {
    color: '#94A3B8',
  },
  headerIcons: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  headerIcon: {
    fontSize: 20,
    marginLeft: 15,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  welcomeCard: {
    margin: 15,
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 15,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginRight: 10,
  },
  loginButton: {
    marginRight: 0,
    marginLeft: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  featuresSection: {
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    alignItems: 'center',
    width: '23%',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  marketIndices: {
    marginHorizontal: 15,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  indexCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  indexInfo: {
    marginBottom: 10,
  },
  indexName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  indexValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 5,
  },
  indexChange: {
    fontSize: 14,
    marginTop: 2,
  },
  indexVolume: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  positiveChange: {
    color: '#10B981',
  },
  negativeChange: {
    color: '#EF4444',
  },
  indexChart: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marketTabs: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  marketTab: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4F46E5',
  },
  marketTabText: {
    fontSize: 14,
    color: '#64748B',
  },
  activeTabText: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  stockList: {
    marginHorizontal: 15,
  },
  stockListHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stockHeaderCell: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
  },
  stockRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stockCell: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
  },
  stockSymbolCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  positiveText: {
    color: '#10B981',
  },
  negativeText: {
    color: '#EF4444',
  },
}); // Make sure this closing bracket is present
