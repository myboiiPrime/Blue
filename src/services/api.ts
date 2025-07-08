import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create types directory first
export interface UserStockDto {
  id: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  createdAt?: string;
}

// Alpha Vantage API configuration
const ALPHA_VANTAGE_API_KEY = 'TW10G2S77NID2ZCA';
const ALPHA_VANTAGE_API_URL = 'https://www.alphavantage.co/query';

const API_URL = 'https://7915-115-72-73-134.ngrok-free.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
});

// Alpha Vantage API instance
const alphaVantageApi = axios.create({
  baseURL: ALPHA_VANTAGE_API_URL,
  timeout: 10000,
});

// JWT interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

// Add this interface for candlestick data
// Enhanced interface for different time ranges
export interface CandlestickData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TimeRange = '1day' | '1week' | '30days';
export type DataInterval = '5min' | '60min' | 'daily';

// Stock API service using Alpha Vantage
// Cache keys
const CACHE_KEYS = {
  MARKET_OVERVIEW: 'market_overview',
  HISTORICAL_DATA: 'historical_data_',
};

const CACHE_EXPIRY = {
  MARKET_OVERVIEW: 5 * 60 * 1000, // 5 minutes
  HISTORICAL_DATA: 30 * 60 * 1000, // 30 minutes
};

interface CacheData<T> {
  timestamp: number;
  data: T;
}

// Define the stockService interface first
interface StockService {
  getStockQuote: (symbol: string) => Promise<any>;
  searchStock: (keywords: string) => Promise<any>;
  getIntradayData: (symbol: string, interval?: '1min' | '5min' | '15min' | '30min' | '60min') => Promise<CandlestickData[]>;
  getHistoricalData: (symbol: string, timeRange: TimeRange) => Promise<CandlestickData[]>;
  getMarketOverview: () => Promise<any[]>;
  getMarketOverviewWithHistory: (timeRange: TimeRange) => Promise<{symbol: string, data: CandlestickData[]}[]>;
  setCacheData: <T>(key: string, data: T) => Promise<void>;
  getCacheData: <T>(key: string, expiryTime: number) => Promise<T | null>;
}

// Implement the stockService
export const stockService: StockService = {
  getStockQuote: async (symbol: string) => {
    try {
      const response = await alphaVantageApi.get('', {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: ALPHA_VANTAGE_API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock quote:', error);
      throw error;
    }
  },
  
  searchStock: async (keywords: string) => {
    try {
      const response = await alphaVantageApi.get('', {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: keywords,
          apikey: ALPHA_VANTAGE_API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching stocks:', error);
      throw error;
    }
  },
  
  getIntradayData: async (symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min') => {
    try {
      const response = await alphaVantageApi.get('', {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol: symbol,
          interval: interval,
          apikey: ALPHA_VANTAGE_API_KEY,
          outputsize: 'compact' // Get last 100 data points
        }
      });
      
      const timeSeries = response.data[`Time Series (${interval})`];
      if (!timeSeries) {
        throw new Error('No intraday data available');
      }
      
      // Convert to our candlestick format
      const candlesticks: CandlestickData[] = Object.entries(timeSeries)
        .map(([timestamp, data]: [string, any]) => ({
          timestamp,
          open: parseFloat(data['1. open']),
          high: parseFloat(data['2. high']),
          low: parseFloat(data['3. low']),
          close: parseFloat(data['4. close']),
          volume: parseInt(data['5. volume'])
        }))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      return candlesticks;
    } catch (error) {
      console.error('Error fetching intraday data:', error);
      // Return mock data as fallback
      return generateMockCandlestickData();
    }
  },
  
  getHistoricalData: async (symbol: string, timeRange: TimeRange): Promise<CandlestickData[]> => {
    try {
      const cacheKey = `${CACHE_KEYS.HISTORICAL_DATA}${symbol}_${timeRange}`;
      
      // Try to get cached data first
      const cachedData = await stockService.getCacheData<CandlestickData[]>(cacheKey, CACHE_EXPIRY.HISTORICAL_DATA);
      if (cachedData) {
        return cachedData;
      }

      // If no cache or expired, fetch fresh data
      let functionType: string;
      let interval: string;
      
      switch (timeRange) {
        case '1day':
          functionType = 'TIME_SERIES_INTRADAY';
          interval = '5min';
          break;
        case '1week':
          functionType = 'TIME_SERIES_INTRADAY';
          interval = '60min';
          break;
        case '30days':
          functionType = 'TIME_SERIES_DAILY';
          interval = 'daily';
          break;
        default:
          functionType = 'TIME_SERIES_INTRADAY';
          interval = '5min';
      }
      
      const params: any = {
        function: functionType,
        symbol: symbol,
        apikey: ALPHA_VANTAGE_API_KEY,
        outputsize: 'compact'
      };
      
      if (functionType === 'TIME_SERIES_INTRADAY') {
        params.interval = interval;
      }
      
      console.log(`Fetching data for ${symbol} with params:`, params);
      const response = await alphaVantageApi.get('', { params });
      
      // Add detailed logging
      console.log(`API Response for ${symbol}:`, response.data);
      
      // Check for API error messages
      // Check for API error messages
      if (response.data['Error Message']) {
        throw new Error(`API Error: ${response.data['Error Message']}`);
      }
      
      if (response.data['Note']) {
        throw new Error(`API Rate Limit: ${response.data['Note']}`);
      }
      
      let timeSeries: any;
      if (functionType === 'TIME_SERIES_INTRADAY') {
        timeSeries = response.data[`Time Series (${interval})`];
      } else {
        timeSeries = response.data['Time Series (Daily)'];
      }
      
      if (!timeSeries) {
        console.error(`No time series data found for ${symbol}. Available keys:`, Object.keys(response.data));
        throw new Error(`No historical data available for ${symbol}`);
      }
      
      const candlesticks: CandlestickData[] = Object.entries(timeSeries)
        .map(([timestamp, data]: [string, any]) => ({
          timestamp,
          open: parseFloat(data['1. open']),
          high: parseFloat(data['2. high']),
          low: parseFloat(data['3. low']),
          close: parseFloat(data['4. close']),
          volume: parseInt(data['5. volume'])
        }))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      // Cache the fresh data
      await stockService.setCacheData(cacheKey, candlesticks);
      
      return candlesticks;
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      // Generate mock data with realistic base price for the symbol
      const basePrice = symbol === 'VN30' ? 1442.97 : 150;
      return generateMockCandlestickData(symbol, basePrice);
    }
  },
  
  getMarketOverview: async () => {
    try {
      // Try to get cached data first
      const cachedData = await stockService.getCacheData(CACHE_KEYS.MARKET_OVERVIEW, CACHE_EXPIRY.MARKET_OVERVIEW);
      if (cachedData) {
        return cachedData;
      }

      // If no cache or expired, fetch fresh data
      const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
      const quotes = await Promise.all(
        symbols.map(symbol =>
          alphaVantageApi.get('', {
            params: {
              function: 'GLOBAL_QUOTE',
              symbol,
              apikey: ALPHA_VANTAGE_API_KEY
            }
          })
        )
      );

      const marketData = quotes.map(response => response.data);
      
      // Cache the fresh data
      await stockService.setCacheData(CACHE_KEYS.MARKET_OVERVIEW, marketData);
      
      return marketData;
    } catch (error) {
      console.error('Error fetching market overview:', error);
      throw error;
    }
  },
  
  getMarketOverviewWithHistory: async (timeRange: TimeRange): Promise<{symbol: string, data: CandlestickData[]}[]> => {
    try {
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
      const promises = symbols.map(async (symbol) => {
        const data = await stockService.getHistoricalData(symbol, timeRange);
        return { symbol, data };
      });
      
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error('Error fetching market overview with history:', error);
      // Return mock data for all symbols
      const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];
      return symbols.map(symbol => ({
        symbol,
        data: generateMockCandlestickData()
      }));
    }
  },

  // Cache management functions
  setCacheData: async <T>(key: string, data: T) => {
    try {
      const cacheData: CacheData<T> = {
        timestamp: Date.now(),
        data
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  },

  getCacheData: async <T>(key: string, expiryTime: number): Promise<T | null> => {
    try {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const parsedCache: CacheData<T> = JSON.parse(cached);
        if (Date.now() - parsedCache.timestamp < expiryTime) {
          return parsedCache.data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }
};

// Fallback mock candlestick data generator
function generateMockCandlestickData(symbol?: string, basePrice?: number): CandlestickData[] {
  const data: CandlestickData[] = [];
  let currentPrice = basePrice || 1442.97; // Use portfolio current price as base
  const now = new Date();
  
  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(now.getTime() - (50 - i) * 5 * 60 * 1000); // 5-minute intervals
    const variation = (Math.random() - 0.5) * (currentPrice * 0.02); // 2% variation
    const open = currentPrice + variation;
    const closeVariation = (Math.random() - 0.5) * (currentPrice * 0.015); // 1.5% variation
    const close = open + closeVariation;
    const high = Math.max(open, close) + Math.random() * (currentPrice * 0.005);
    const low = Math.min(open, close) - Math.random() * (currentPrice * 0.005);
    
    data.push({
      timestamp: timestamp.toISOString(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 100000 // More realistic volume
    });
    
    currentPrice = close;
  }
  
  return data;
}

// Mock user stock service with sample data
export const userStockService = {
  getUserPortfolio: async (): Promise<{data: UserStockDto[]}> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock portfolio data
    const mockPortfolio: UserStockDto[] = [
      {
        id: '1',
        symbol: 'AAPL',
        quantity: 10,
        purchasePrice: 150.00,
        purchaseDate: '2024-01-15',
        currentValue: 1750.00,
        profitLoss: 250.00,
        profitLossPercentage: 16.67
      },
      {
        id: '2',
        symbol: 'GOOGL',
        quantity: 5,
        purchasePrice: 2800.00,
        purchaseDate: '2024-02-01',
        currentValue: 2900.00,
        profitLoss: 500.00,
        profitLossPercentage: 3.57
      },
      {
        id: '3',
        symbol: 'MSFT',
        quantity: 8,
        purchasePrice: 380.00,
        purchaseDate: '2024-01-20',
        currentValue: 3200.00,
        profitLoss: 160.00,
        profitLossPercentage: 5.26
      }
    ];
    
    return { data: mockPortfolio };
  },
  
  buyStock: async (symbol: string, quantity: number): Promise<{data: UserStockDto}> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock successful purchase
    const mockPurchase: UserStockDto = {
      id: Date.now().toString(),
      symbol: symbol,
      quantity: quantity,
      purchasePrice: 100.00, // Mock price
      purchaseDate: new Date().toISOString().split('T')[0],
      currentValue: quantity * 100.00,
      profitLoss: 0,
      profitLossPercentage: 0
    };
    
    return { data: mockPurchase };
  },
  
  sellStock: async (symbol: string, quantity: number): Promise<{data: UserStockDto}> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock successful sale
    const mockSale: UserStockDto = {
      id: Date.now().toString(),
      symbol: symbol,
      quantity: -quantity, // Negative for sale
      purchasePrice: 100.00,
      purchaseDate: new Date().toISOString().split('T')[0],
      currentValue: quantity * 105.00, // Mock 5% gain
      profitLoss: quantity * 5.00,
      profitLossPercentage: 5.00
    };
    
    return { data: mockSale };
  }
};

export const userService = {
  getUserProfile: () => api.get<UserDto>('/api/users/profile'),
};

// Network timeout utility
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Network timeout')), timeoutMs)
    )
  ]);
};

// Add new interfaces for the backend integration
export interface OrderDto {
  id: string;
  symbol: string;
  quantity: number;
  price: number;
  orderType: string;
  side: 'BUY' | 'SELL';
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MarketDataDto {
  indices: any[];
  activeStocks: any[];
  topGainers: any[];
  topLosers: any[];
  netFlow?: any;
  industryHeatmap?: any[];
  majorImpactStocks?: any[];
  marketMovers?: any[];
  foreignTrading?: any;
  marketLiquidity?: any;
}

export interface StockSearchDto {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  industry?: string;
  marketCap?: number;
}

// 2. Advanced Order Types Service
export const tradingService = {
  // Place different order types
  placeNormalOrder: (orderData: {symbol: string, quantity: number, price: number, side: 'BUY' | 'SELL'}) => 
    api.post('/trading/place-normal-order', orderData),
  
  placeStopOrder: (orderData: {symbol: string, quantity: number, stopPrice: number, side: 'BUY' | 'SELL'}) => 
    api.post('/trading/place-stop-order', orderData),
  
  placeStopLimitOrder: (orderData: {symbol: string, quantity: number, stopPrice: number, limitPrice: number, side: 'BUY' | 'SELL'}) => 
    api.post('/trading/place-stop-limit-order', orderData),
  
  placeTrailingStopOrder: (orderData: {symbol: string, quantity: number, trailAmount: number, side: 'BUY' | 'SELL'}) => 
    api.post('/trading/place-trailing-stop-order', orderData),
  
  placeTrailingStopLimitOrder: (orderData: {symbol: string, quantity: number, trailAmount: number, limitPrice: number, side: 'BUY' | 'SELL'}) => 
    api.post('/trading/place-trailing-stop-limit-order', orderData),
  
  placeOCOOrder: (orderData: {symbol: string, quantity: number, stopPrice: number, limitPrice: number, side: 'BUY' | 'SELL'}) => 
    api.post('/trading/place-oco-order', orderData),
  
  placeGTDOrder: (orderData: {symbol: string, quantity: number, price: number, side: 'BUY' | 'SELL', expiryDate: string}) => 
    api.post('/trading/place-gtd-order', orderData),
  
  placeStopLossTakeProfitOrder: (orderData: {symbol: string, quantity: number, stopLossPrice: number, takeProfitPrice: number, side: 'BUY' | 'SELL'}) => 
    api.post('/trading/place-stop-loss-take-profit-order', orderData),
  
  // Order management
  getOpenOrders: () => api.get<OrderDto[]>('/trading/orders/open'),
  
  getOrdersByType: (orderType: string) => api.get<OrderDto[]>(`/trading/orders/by-type/${orderType}`),
  
  getOrdersByStatus: (status: string) => api.get<OrderDto[]>(`/trading/orders/by-status/${status}`),
  
  getOrderById: (orderId: string) => api.get<OrderDto>(`/trading/orders/${orderId}`),
  
  cancelOrder: (orderId: string) => api.delete(`/trading/orders/${orderId}/cancel`),
  
  // Get available options
  getOrderTypes: () => api.get<string[]>('/trading/order-types'),
  
  getOrderSides: () => api.get<string[]>('/trading/order-sides'),
  
  getOrderStatuses: () => api.get<string[]>('/trading/order-statuses'),
  
  // Trading records
  getTradingRecordsByAccount: (accountId: string) => api.get(`/trading/records/account/${accountId}`),
  
  getTradingRecordsBySymbol: (symbol: string) => api.get(`/trading/records/symbol/${symbol}`),
  
  getTradingRecordsByType: (type: string) => api.get(`/trading/records/type/${type}`),
  
  getTradingRecordsByStatus: (status: string) => api.get(`/trading/records/status/${status}`)
};

// 3. Market Analytics Service
export const marketAnalyticsService = {
  // Dashboard market data
  getMarketData: () => api.get<MarketDataDto>('/dashboard/market-data'),
  
  // Market overview with backend data
  getMarketOverview: () => api.get('/stocks/market-overview'),
  
  // Stocks by industry
  getStocksByIndustry: (industry: string) => api.get(`/stocks/by-industry/${industry}`),
  
  // Stocks by market cap
  getStocksByMarketCap: (params: {minMarketCap?: number, maxMarketCap?: number}) => 
    api.get('/stocks/by-market-cap', { params }),
  
  // Market indices (from MarketService)
  getMarketIndices: () => api.get('/market/indices'),
  
  // Net flow data
  getNetFlow: () => api.get('/market/net-flow'),
  
  // Industry heatmap
  getIndustryHeatmap: () => api.get('/market/industry-heatmap'),
  
  // Major impact stocks
  getMajorImpactStocks: () => api.get('/market/major-impact-stocks'),
  
  // Market movers
  getMarketMovers: () => api.get('/market/movers'),
  
  // Foreign trading data
  getForeignTradingData: () => api.get('/market/foreign-trading'),
  
  // Market liquidity
  getMarketLiquidity: () => api.get('/market/liquidity')
};

// 6. Enhanced Search Service
export const enhancedSearchService = {
  // Backend stock search
  searchStocks: (query: string) => api.get<StockSearchDto[]>(`/stocks/search?query=${encodeURIComponent(query)}`),
  
  // Get all stocks
  getAllStocks: () => api.get<StockSearchDto[]>('/stocks'),
  
  // Get stock details
  getStockDetails: (symbol: string) => api.get(`/stocks/${symbol}`)
};

// Replace the mock userStockService with real backend integration
export const realPortfolioService = {
  getUserPortfolio: async (): Promise<{data: UserStockDto[]}> => {
    try {
      const response = await api.get('/api/user-stocks/portfolio');
      return { data: response.data };
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  },
  
  buyStock: async (symbol: string, quantity: number): Promise<{data: UserStockDto}> => {
    try {
      const response = await api.post('/api/user-stocks/buy', null, {
        params: { symbol, quantity }
      });
      return { data: response.data };
    } catch (error) {
      console.error('Error buying stock:', error);
      throw error;
    }
  },
  
  sellStock: async (symbol: string, quantity: number): Promise<{data: UserStockDto}> => {
    try {
      const response = await api.post('/api/user-stocks/sell', null, {
        params: { symbol, quantity }
      });
      return { data: response.data };
    } catch (error) {
      console.error('Error selling stock:', error);
      throw error;
    }
  }
};

// Remove the old mock userStockService
export const enhancedUserService = {
  getUserProfile: () => api.get<UserDto>('/api/users/profile'),
  
  // Additional user endpoints if needed
  updateUserProfile: (userData: Partial<UserDto>) => api.put('/api/users/profile', userData)
};

// Watchlist Service
export const watchlistService = {
  // Create watchlist
  createWatchlist: (watchlistData: {name: string, description?: string}) => 
    api.post('/watchlists', watchlistData),
  
  // Add stock to watchlist
  addStockToWatchlist: (watchlistId: string, symbol: string) => 
    api.post(`/watchlists/${watchlistId}/stocks`, { symbol }),
  
  // Remove stock from watchlist
  removeStockFromWatchlist: (watchlistId: string, symbol: string) => 
    api.delete(`/watchlists/${watchlistId}/stocks/${symbol}`),
  
  // Get watchlist symbols
  getWatchlistSymbols: (watchlistId: string) => 
    api.get<string[]>(`/watchlists/${watchlistId}/symbols`),
  
  // Get watchlist items with details
  getWatchlistItems: (watchlistId: string) => 
    api.get(`/watchlists/${watchlistId}/items`),
  
  // Get user's watchlists
  getUserWatchlists: (userId: string) => 
    api.get(`/watchlists/user/${userId}`),
  
  // Update watchlist
  updateWatchlist: (watchlistId: string, watchlistData: {name?: string, description?: string}) => 
    api.put(`/watchlists/${watchlistId}`, watchlistData),
  
  // Delete watchlist
  deleteWatchlist: (watchlistId: string) => 
    api.delete(`/watchlists/${watchlistId}`)
};
