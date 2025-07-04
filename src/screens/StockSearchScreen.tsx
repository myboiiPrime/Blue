import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { STATIC_STOCKS, StaticStock } from '../services/staticData';

interface StockSearchScreenProps {
  onStockSelect: (stock: StaticStock) => void;
  onClose: () => void;
}

interface RecentSearch {
  symbol: string;
  name: string;
}

export default function StockSearchScreen({ onStockSelect, onClose }: StockSearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StaticStock[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([
    { symbol: 'A32', name: '32 Joint Stock Company' },
  ]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filteredStocks = STATIC_STOCKS.filter(stock => 
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredStocks.slice(0, 20));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleStockSelect = (stock: StaticStock) => {
    // Add to recent searches
    const newRecentSearch = { symbol: stock.symbol, name: stock.name };
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.symbol !== stock.symbol);
      return [newRecentSearch, ...filtered].slice(0, 10);
    });
    
    onStockSelect(stock);
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const getExchangeLabel = (symbol: string) => {
    // Simple logic to assign exchange labels
    if (symbol.length === 3) return 'UPCOM';
    if (symbol.includes('A')) return 'HOSE';
    return 'HNX';
  };

  const renderStockList = () => {
    const stocksToShow = searchQuery.trim() ? searchResults : [];
    
    return stocksToShow.map((stock) => (
      <TouchableOpacity
        key={stock.id}
        style={styles.stockItem}
        onPress={() => handleStockSelect(stock)}
      >
        <View style={styles.stockInfo}>
          <View style={styles.stockHeader}>
            <Text style={styles.stockSymbol}>{stock.symbol}</Text>
            <Text style={styles.exchangeLabel}>{getExchangeLabel(stock.symbol)}</Text>
          </View>
          <Text style={styles.stockName}>{stock.name}</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  const renderRecentSearches = () => {
    if (searchQuery.trim() || recentSearches.length === 0) return null;

    return (
      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent search</Text>
          <TouchableOpacity onPress={clearRecentSearches}>
            <Text style={styles.deleteAllText}>Delete all</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.recentTags}>
          {recentSearches.map((item, index) => (
            <TouchableOpacity key={index} style={styles.recentTag}>
              <Text style={styles.recentTagText}>{item.symbol}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {recentSearches.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.stockItem}
            onPress={() => {
              const stock = STATIC_STOCKS.find(s => s.symbol === item.symbol);
              if (stock) handleStockSelect(stock);
            }}
          >
            <View style={styles.stockInfo}>
              <View style={styles.stockHeader}>
                <Text style={styles.stockSymbol}>{item.symbol}</Text>
                <Text style={styles.exchangeLabel}>{getExchangeLabel(item.symbol)}</Text>
              </View>
              <Text style={styles.stockName}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {renderRecentSearches()}
        {renderStockList()}
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    color: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  cancelText: {
    fontSize: 16,
    color: '#3B82F6',
  },
  content: {
    flex: 1,
  },
  recentSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  deleteAllText: {
    fontSize: 14,
    color: '#3B82F6',
  },
  recentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  recentTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  recentTagText: {
    fontSize: 14,
    color: '#374151',
  },
  stockItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  stockInfo: {
    flex: 1,
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stockSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  exchangeLabel: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockName: {
    fontSize: 14,
    color: '#6B7280',
  },
});