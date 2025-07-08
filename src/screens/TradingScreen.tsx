import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api, { 
  enhancedSearchService, 
  tradingService, 
  StockSearchDto,
  OrderDto,
} from '../services/api';
import { STATIC_STOCKS, StaticStock } from '../services/staticData';
import StockSearchScreen from './StockSearchScreen';

interface StockData {
  id: number;
  symbol: string;
  name: string;
  price: number;
  changeAmount: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  open: number;
  previousClose: number;
}

// Update the SearchResult interface to match StaticStock:
interface SearchResult {
  id: string;  // Changed from number to string
  symbol: string;
  name: string;
  price: number;
}

// Add the missing OrderBookEntry interface:
interface OrderBookEntry {
  volume: number;
  price: number;
}


export default function TradingScreen() {
  const [activeMainTab, setActiveMainTab] = useState('Equity');
  const [activeSubTab, setActiveSubTab] = useState('Order');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchDto[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [orderType, setOrderType] = useState('Normal Order');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [trailAmount, setTrailAmount] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [autoPriceEnabled, setAutoPriceEnabled] = useState(false);
  const [buyingPower] = useState(10000);
  const [maxQuantity, setMaxQuantity] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [availableOrderTypes, setAvailableOrderTypes] = useState<string[]>([]);
  const [openOrders, setOpenOrders] = useState<OrderDto[]>([]);

  // Load available order types from backend
  useEffect(() => {
    loadOrderTypes();
    loadOpenOrders();
  }, []);

  const loadOrderTypes = async () => {
    try {
      const response = await tradingService.getOrderTypes();
      setAvailableOrderTypes(response.data);
    } catch (error) {
      console.error('Error loading order types:', error);
      // Fallback to static order types
      setAvailableOrderTypes([
        'Normal Order',
        'Stop Order', 
        'Stop Limit',
        'Trailing Stop',
        'OCO',
        'GTD'
      ]);
    }
  };

  const loadOpenOrders = async () => {
    try {
      const response = await tradingService.getOpenOrders();
      setOpenOrders(response.data);
    } catch (error) {
      console.error('Error loading open orders:', error);
    }
  };

  // Enhanced search using backend API
  const searchStocks = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);
    
    try {
      const response = await enhancedSearchService.searchStocks(query);
      setSearchResults(response.data.slice(0, 10));
    } catch (error) {
      console.error('Error searching stocks:', error);
      // Fallback to static data
      const filteredStocks = STATIC_STOCKS.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      ).map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        change: 0,
        changePercent: 0,
        industry: 'Technology',
        marketCap: 1000000000
      }));
      setSearchResults(filteredStocks.slice(0, 10));
    } finally {
      setIsSearching(false);
    }
  };

  // Get detailed stock information using enhanced service
  const getStockDetails = async (symbol: string) => {
    setIsLoadingStock(true);
    try {
      const response = await enhancedSearchService.getStockDetails(symbol);
      const stockData: StockData = response.data;
      setSelectedStock(stockData);
      setPrice(stockData.price.toString());
      setShowSearchResults(false);
    } catch (error) {
      console.error('Error fetching stock details:', error);
      Alert.alert('Error', 'Failed to fetch stock details. Please try again.');
    } finally {
      setIsLoadingStock(false);
    }
  };

  // Enhanced order placement with different order types
  const handlePlaceOrder = async (side: 'BUY' | 'SELL') => {
    if (!selectedStock || !quantity || !price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const orderData = {
      symbol: selectedStock.symbol,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      side
    };

    try {
      let response;
      
      switch (orderType) {
        case 'Normal Order':
          response = await tradingService.placeNormalOrder(orderData);
          break;
        case 'Stop Order':
          if (!stopPrice) {
            Alert.alert('Error', 'Stop price is required for stop orders');
            return;
          }
          response = await tradingService.placeStopOrder({
            ...orderData,
            stopPrice: parseFloat(stopPrice)
          });
          break;
        case 'Stop Limit':
          if (!stopPrice || !limitPrice) {
            Alert.alert('Error', 'Stop price and limit price are required');
            return;
          }
          response = await tradingService.placeStopLimitOrder({
            ...orderData,
            stopPrice: parseFloat(stopPrice),
            limitPrice: parseFloat(limitPrice)
          });
          break;
        case 'Trailing Stop':
          if (!trailAmount) {
            Alert.alert('Error', 'Trail amount is required for trailing stop orders');
            return;
          }
          response = await tradingService.placeTrailingStopOrder({
            ...orderData,
            trailAmount: parseFloat(trailAmount)
          });
          break;
        case 'OCO':
          if (!stopPrice || !limitPrice) {
            Alert.alert('Error', 'Stop price and limit price are required for OCO orders');
            return;
          }
          response = await tradingService.placeOCOOrder({
            ...orderData,
            stopPrice: parseFloat(stopPrice),
            limitPrice: parseFloat(limitPrice)
          });
          break;
        case 'GTD':
          if (!expiryDate) {
            Alert.alert('Error', 'Expiry date is required for GTD orders');
            return;
          }
          response = await tradingService.placeGTDOrder({
            ...orderData,
            expiryDate
          });
          break;
        default:
          response = await tradingService.placeNormalOrder(orderData);
      }

      Alert.alert('Success', `${side} order placed successfully!`);
      loadOpenOrders(); // Refresh open orders
      
      // Clear form
      setQuantity('');
      setPrice('');
      setStopPrice('');
      setLimitPrice('');
      setTrailAmount('');
      setExpiryDate('');
      
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    }
  };

  const handleBuy = () => handlePlaceOrder('BUY');
  const handleSell = () => handlePlaceOrder('SELL');

  // Cancel order function
  const handleCancelOrder = async (orderId: string) => {
    try {
      await tradingService.cancelOrder(orderId);
      Alert.alert('Success', 'Order cancelled successfully!');
      loadOpenOrders(); // Refresh open orders
    } catch (error) {
      console.error('Error cancelling order:', error);
      Alert.alert('Error', 'Failed to cancel order.');
    }
  };

  // Handle search input changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchStocks(searchSymbol);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchSymbol]);

  // Handle stock selection from search results
  const handleStockSelect = (stock: SearchResult) => {
    setSearchSymbol(stock.symbol);
    getStockDetails(stock.symbol);
  };

  // Calculate max quantity when price changes
  useEffect(() => {
    if (selectedStock && price) {
      const priceNum = parseFloat(price);
      if (priceNum > 0) {
        setMaxQuantity(Math.floor(buyingPower / priceNum));
      }
    }
  }, [selectedStock, price, buyingPower]);

  // Auto-fill price when auto-price is enabled
  useEffect(() => {
    if (autoPriceEnabled && selectedStock) {
      setPrice(selectedStock.price.toString());
    }
  }, [autoPriceEnabled, selectedStock]);
  const handleSearchPress = () => {
    setShowSearchModal(true);
  };
  
  const handleStockSelectFromSearch = (stock: StaticStock) => {
    setSearchSymbol(stock.symbol);
    // Convert StaticStock to StockData format
    const stockData: StockData = {
      id: parseInt(stock.id),
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      changeAmount: 0, // You can calculate this based on your needs
      changePercent: 0,
      high: stock.price * 1.05,
      low: stock.price * 0.95,
      volume: 1000000,
      open: stock.price,
      previousClose: stock.price,
    };
    setSelectedStock(stockData);
    setPrice(stock.price.toString());
    setShowSearchModal(false);
  };


  // Render additional order fields based on order type
  const renderOrderTypeFields = () => {
    switch (orderType) {
      case 'Stop Order':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Stop Price</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter stop price"
              value={stopPrice}
              onChangeText={setStopPrice}
              keyboardType="numeric"
            />
          </View>
        );
      case 'Stop Limit':
      case 'OCO':
        return (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Stop Price</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter stop price"
                value={stopPrice}
                onChangeText={setStopPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Limit Price</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter limit price"
                value={limitPrice}
                onChangeText={setLimitPrice}
                keyboardType="numeric"
              />
            </View>
          </>
        );
      case 'Trailing Stop':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Trail Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter trail amount"
              value={trailAmount}
              onChangeText={setTrailAmount}
              keyboardType="numeric"
            />
          </View>
        );
      case 'GTD':
        return (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Expiry Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={expiryDate}
              onChangeText={setExpiryDate}
            />
          </View>
        );
      default:
        return null;
    }
  };

  // Render open orders section
  const renderOpenOrders = () => {
    if (activeSubTab !== 'Orders') return null;

    return (
      <View style={styles.ordersSection}>
        <Text style={styles.sectionTitle}>Open Orders</Text>
        {openOrders.length === 0 ? (
          <Text style={styles.noOrdersText}>No open orders</Text>
        ) : (
          openOrders.map((order) => (
            <View key={order.id} style={styles.orderItem}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderSymbol}>{order.symbol}</Text>
                <Text style={styles.orderDetails}>
                  {order.side} {order.quantity} @ ${order.price.toFixed(2)}
                </Text>
                <Text style={styles.orderType}>{order.orderType}</Text>
                <Text style={styles.orderStatus}>{order.status}</Text>
              </View>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelOrder(order.id)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    );
  };

  // Mock order book data (you can replace this with real data later)
  const orderBookData: OrderBookEntry[] = [
    { volume: 100, price: selectedStock?.price ? selectedStock.price * 0.99 : 0 },
    { volume: 200, price: selectedStock?.price ? selectedStock.price * 0.98 : 0 },
    { volume: 100, price: selectedStock?.price ? selectedStock.price * 0.97 : 0 },
  ];

  const orderTypes = [
    'Normal Order',
    'Stop Order',
    'Stop Limit',
    'Trailing Stop',
    'OCO',
    'GTD',
  ];

  const renderSearchResults = () => {
    if (!showSearchResults || searchResults.length === 0) return null;

    return (
      <View style={styles.searchResults}>
        {searchResults.map((stock, index) => (
          <TouchableOpacity
            key={`${stock.symbol}-${index}`}
            style={styles.searchResultItem}
            onPress={() => {
              setSearchSymbol(stock.symbol);
              getStockDetails(stock.symbol);
            }}
          >
            <View style={styles.searchResultInfo}>
              <Text style={styles.searchResultSymbol}>{stock.symbol}</Text>
              <Text style={styles.searchResultName}>{stock.name}</Text>
              {stock.industry && (
                <Text style={styles.searchResultIndustry}>{stock.industry}</Text>
              )}
            </View>
            <View style={styles.searchResultPriceInfo}>
              <Text style={styles.searchResultPrice}>${stock.price.toFixed(2)}</Text>
              <Text style={[
                styles.searchResultChange,
                stock.change >= 0 ? styles.positiveChange : styles.negativeChange
              ]}>
                {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderStockDetails = () => {
    if (isLoadingStock) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading stock details...</Text>
        </View>
      );
    }

    if (!selectedStock) return null;

    const isPositive = selectedStock.changeAmount >= 0;

    return (
      <View style={styles.stockDetails}>
        <View style={styles.stockHeader}>
          <View style={styles.stockInfo}>
            <Text style={styles.stockSymbol}>{selectedStock.symbol}</Text>
            <Text style={styles.stockName}>{selectedStock.name}</Text>
          </View>
          <TouchableOpacity style={styles.chartButton}>
            <Text style={styles.chartButtonText}>📊 Chart</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.priceSection}>
          <Text style={styles.currentPrice}>${selectedStock.price.toFixed(2)}</Text>
          <Text style={[styles.priceChange, isPositive ? styles.positiveChange : styles.negativeChange]}>
            {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{selectedStock.changeAmount.toFixed(2)} {isPositive ? '+' : ''}{selectedStock.changePercent.toFixed(2)}%
          </Text>
        </View>
        
        <View style={styles.marketData}>
          <View style={styles.marketItem}>
            <Text style={styles.marketLabel}>High</Text>
            <Text style={styles.marketValue}>${selectedStock.high.toFixed(2)}</Text>
          </View>
          <View style={styles.marketItem}>
            <Text style={styles.marketLabel}>Low</Text>
            <Text style={styles.marketValue}>${selectedStock.low.toFixed(2)}</Text>
          </View>
          <View style={styles.marketItem}>
            <Text style={styles.marketLabel}>Volume</Text>
            <Text style={styles.marketValue}>{selectedStock.volume.toLocaleString()}</Text>
          </View>
        </View>
        
        <View style={styles.orderBook}>
          <View style={styles.orderBookHeader}>
            <Text style={styles.orderBookLabel}>Bid vol</Text>
            <Text style={styles.orderBookLabel}>Bid price</Text>
            <Text style={styles.orderBookLabel}>Ask price</Text>
            <Text style={styles.orderBookLabel}>Ask vol</Text>
          </View>
          {orderBookData.map((entry, index) => (
            <View key={index} style={styles.orderBookRow}>
              <Text style={styles.orderBookValue}>{entry.volume}</Text>
              <Text style={[styles.orderBookValue, styles.bidPrice]}>${entry.price.toFixed(2)}</Text>
              <Text style={styles.orderBookValue}>-</Text>
              <Text style={styles.orderBookValue}>-</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Tabs */}
      <View style={styles.topTabs}>
        <TouchableOpacity
          style={[styles.topTab, activeMainTab === 'Equity' && styles.activeTopTab]}
          onPress={() => setActiveMainTab('Equity')}
        >
          <Text style={[styles.topTabText, activeMainTab === 'Equity' && styles.activeTopTabText]}>
            Equity
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.topTab, activeMainTab === 'Derivatives' && styles.activeTopTab]}
          onPress={() => setActiveMainTab('Derivatives')}
        >
          <Text style={[styles.topTabText, activeMainTab === 'Derivatives' && styles.activeTopTabText]}>
            Derivatives
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickLayoutButton}>
          <Text style={styles.quickLayoutText}>📱 Quick layout</Text>
        </TouchableOpacity>
      </View>

      {/* Sub Navigation */}
      <View style={styles.subTabs}>
        <TouchableOpacity
          style={[styles.subTab, activeSubTab === 'Order' && styles.activeSubTab]}
          onPress={() => setActiveSubTab('Order')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'Order' && styles.activeSubTabText]}>
            Order
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.subTab, activeSubTab === 'Order Book' && styles.activeSubTab]}
          onPress={() => setActiveSubTab('Order Book')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'Order Book' && styles.activeSubTabText]}>
            Order Book
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.subTab, activeSubTab === 'Portfolio' && styles.activeSubTab]}
          onPress={() => setActiveSubTab('Portfolio')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'Portfolio' && styles.activeSubTabText]}>
            Portfolio
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <TouchableOpacity style={styles.searchContainer} onPress={handleSearchPress}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={[styles.searchInput, { color: searchSymbol ? '#111827' : '#9CA3AF' }]}>
              {searchSymbol || 'Enter a symbol here'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chartButton}>
            <Text style={styles.chartButtonText}>📊 Chart</Text>
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {renderSearchResults()}

        {/* Stock Details */}
        {renderStockDetails()}

        {/* Order Form */}
        <View style={styles.orderForm}>
          {/* Account Selection */}
          <View style={styles.accountSection}>
            <View style={styles.accountDropdown}>
              <Text style={styles.accountText}>Acc ▼</Text>
            </View>
          </View>

          {/* Buying Power */}
          <View style={styles.buyingPowerSection}>
            <Text style={styles.buyingPowerLabel}>Buying power ⓘ</Text>
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.buyingPowerValue}>${buyingPower.toLocaleString()}</Text>
          
          <Text style={styles.maxQuantityText}>Max Quantity: {maxQuantity}</Text>

          {/* Order Type */}
          <View style={styles.orderTypeSection}>
            <Text style={styles.orderTypeLabel}>Order type ⓘ</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={orderType}
                style={styles.picker}
                onValueChange={(itemValue) => setOrderType(itemValue)}
              >
                {orderTypes.map((type) => (
                  <Picker.Item key={type} label={type} value={type} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Quantity</Text>
            <View style={styles.inputContainer}>
              <TouchableOpacity 
                style={styles.inputButton}
                onPress={() => {
                  const currentQty = parseInt(quantity) || 0;
                  if (currentQty > 1) setQuantity((currentQty - 1).toString());
                }}
              >
                <Text style={styles.inputButtonText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.quantityInput}
                placeholder="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
              <TouchableOpacity 
                style={styles.inputButton}
                onPress={() => {
                  const currentQty = parseInt(quantity) || 0;
                  if (currentQty < maxQuantity) setQuantity((currentQty + 1).toString());
                }}
              >
                <Text style={styles.inputButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Price</Text>
            <View style={styles.inputContainer}>
              <TouchableOpacity 
                style={styles.inputButton}
                onPress={() => {
                  const currentPrice = parseFloat(price) || 0;
                  if (currentPrice > 0.01) setPrice((currentPrice - 0.01).toFixed(2));
                }}
              >
                <Text style={styles.inputButtonText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.quantityInput}
                placeholder="Price"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                editable={!autoPriceEnabled}
              />
              <TouchableOpacity 
                style={styles.inputButton}
                onPress={() => {
                  const currentPrice = parseFloat(price) || 0;
                  setPrice((currentPrice + 0.01).toFixed(2));
                }}
              >
                <Text style={styles.inputButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Auto-price Toggle */}
          <View style={styles.autoPriceSection}>
            <Switch
              value={autoPriceEnabled}
              onValueChange={setAutoPriceEnabled}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={autoPriceEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
            <Text style={styles.autoPriceLabel}>Auto-price ⓘ</Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Buy/Sell Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.buyButton, (!selectedStock || !quantity || !price) && styles.disabledButton]} 
          onPress={handleBuy}
          disabled={!selectedStock || !quantity || !price}
        >
          <Text style={styles.buyButtonText}>Buy</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.sellButton, (!selectedStock || !quantity || !price) && styles.disabledButton]} 
          onPress={handleSell}
          disabled={!selectedStock || !quantity || !price}
        >
          <Text style={styles.sellButtonText}>Sell</Text>
        </TouchableOpacity>
      </View>


      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <StockSearchScreen
          onStockSelect={handleStockSelectFromSearch}
          onClose={() => setShowSearchModal(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topTabs: {
    flexDirection: 'row',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  topTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  activeTopTab: {
    backgroundColor: '#E0E7FF',
  },
  topTabText: {
    fontSize: 16,
    color: '#6B7280',
  },
  activeTopTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  quickLayoutButton: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  quickLayoutText: {
    fontSize: 14,
    color: '#6B7280',
  },
  subTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  subTab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 24,
  },
  activeSubTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  subTabText: {
    fontSize: 16,
    color: '#6B7280',
  },
  activeSubTabText: {
    color: '#1F2937',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  chartButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  chartButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  stockDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  stockName: {
    fontSize: 14,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 12,
  },
  priceChange: {
    fontSize: 16,
    fontWeight: '600',
  },
  positiveChange: {
    color: '#10B981',
  },
  negativeChange: {
    color: '#EF4444',
  },
  marketData: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  marketItem: {
    alignItems: 'center',
  },
  marketLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  marketValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderBook: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  orderBookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderBookLabel: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    textAlign: 'center',
  },
  orderBookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  orderBookValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  bidPrice: {
    color: '#10B981',
    fontWeight: '600',
  },
  orderForm: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  accountSection: {
    marginBottom: 16,
  },
  accountDropdown: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    width: 80,
  },
  accountText: {
    fontSize: 16,
    color: '#1F2937',
  },
  buyingPowerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buyingPowerLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  addButton: {
    width: 32,
    height: 32,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  buyingPowerValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  maxQuantityText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  orderTypeSection: {
    marginBottom: 16,
  },
  orderTypeLabel: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  inputButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputButtonText: {
    fontSize: 20,
    color: '#6B7280',
  },
  quantityInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 12,
  },
  autoPriceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  autoPriceLabel: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  buyButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sellButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchResultPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchLoader: {
    marginVertical: 20,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: '#D1D5DB',
  },
  // Add these additional missing styles:
  searchResults: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  searchResultName: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  searchResultIndustry: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  searchResultPriceInfo: {
    alignItems: 'flex-end',
  },
  searchResultChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },

  // Add these missing styles:
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  // Add these missing styles:
  label: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
  },
  ordersSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  noOrdersText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  orderInfo: {
    flex: 1,
  },
  orderSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  orderDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  orderType: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  orderStatus: {
    fontSize: 12,
    color: '#059669',
    marginTop: 2,
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
});