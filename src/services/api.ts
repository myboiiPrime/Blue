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

const API_URL = 'http://73536df3dd33.ngrok-free.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
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
  getHistoricalData: (symbol: string, timeRange: TimeRange) => Promise<CandlestickData[]>;
  getMarketOverview: () => Promise<any[]>;
  getMarketOverviewWithHistory: (timeRange: TimeRange) => Promise<{symbol: string, data: CandlestickData[]}[]>;
  setCacheData: <T>(key: string, data: T) => Promise<void>;
  getCacheData: <T>(key: string, expiryTime: number) => Promise<T | null>;
}

// Implement the stockService with mock data only
export const stockService: StockService = {
  getHistoricalData: async (symbol: string, timeRange: TimeRange): Promise<CandlestickData[]> => {
    try {
      const cacheKey = `${CACHE_KEYS.HISTORICAL_DATA}${symbol}_${timeRange}`;
      
      // Try to get cached data first
      const cachedData = await stockService.getCacheData<CandlestickData[]>(cacheKey, CACHE_EXPIRY.HISTORICAL_DATA);
      if (cachedData) {
        return cachedData;
      }

      // Generate mock data with realistic base price for the symbol
      const basePrice = symbol === 'VN30' ? 1442.97 : 150;
      const mockData = generateMockCandlestickData(symbol, basePrice);
      
      // Cache the mock data
      await stockService.setCacheData(cacheKey, mockData);
      
      return mockData;
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

      // Return mock market data
      const mockMarketData = [
        { symbol: 'AAPL', price: 175.50, change: 2.30, changePercent: 1.33 },
        { symbol: 'MSFT', price: 420.80, change: -1.20, changePercent: -0.28 },
        { symbol: 'GOOGL', price: 2850.00, change: 15.75, changePercent: 0.56 },
        { symbol: 'AMZN', price: 3200.00, change: -8.50, changePercent: -0.26 },
        { symbol: 'META', price: 485.20, change: 12.40, changePercent: 2.62 }
      ];
      
      // Cache the mock data
      await stockService.setCacheData(CACHE_KEYS.MARKET_OVERVIEW, mockMarketData);
      
      return mockMarketData;
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
  // Place different order types - Fixed endpoints
  placeNormalOrder: (orderData: {symbol: string, quantity: number, price: number, side: 'BUY' | 'SELL'}, userId: number) => 
    api.post('/trading/orders/normal', orderData, { params: { userId } }),
  
  placeStopOrder: (orderData: {symbol: string, quantity: number, stopPrice: number, side: 'BUY' | 'SELL'}, userId: number) => 
    api.post('/trading/orders/stop', orderData, { params: { userId } }),
  
  placeStopLimitOrder: (orderData: {symbol: string, quantity: number, stopPrice: number, limitPrice: number, side: 'BUY' | 'SELL'}, userId: number) => 
    api.post('/trading/orders/stop-limit', orderData, { params: { userId } }),
  
  placeTrailingStopOrder: (orderData: {symbol: string, quantity: number, trailAmount: number, side: 'BUY' | 'SELL'}, userId: number) => 
    api.post('/trading/orders/trailing-stop', orderData, { params: { userId } }),
  
  placeTrailingStopLimitOrder: (orderData: {symbol: string, quantity: number, trailAmount: number, limitPrice: number, side: 'BUY' | 'SELL'}, userId: number) => 
    api.post('/trading/orders/trailing-stop-limit', orderData, { params: { userId } }),
  
  placeOCOOrder: (orderData: {symbol: string, quantity: number, stopPrice: number, limitPrice: number, side: 'BUY' | 'SELL'}, userId: number) => 
    api.post('/trading/orders/oco', orderData, { params: { userId } }),
  
  placeGTDOrder: (orderData: {symbol: string, quantity: number, price: number, side: 'BUY' | 'SELL', expiryDate: string}, userId: number) => 
    api.post('/trading/orders/gtd', orderData, { params: { userId } }),
  
  placeStopLossTakeProfitOrder: (orderData: {symbol: string, quantity: number, stopLossPrice: number, takeProfitPrice: number, side: 'BUY' | 'SELL'}, userId: number) => 
    api.post('/trading/orders/stop-loss-take-profit', orderData, { params: { userId } }),
  
  // Generic order placement
  placeOrder: (orderData: any, userId: number) => 
    api.post('/trading/orders', orderData, { params: { userId } }),
  
  // Order management - Fixed endpoints
  getUserOrders: (userId: number) => 
    api.get<OrderDto[]>('/trading/orders', { params: { userId } }),
  
  getOpenOrders: (userId: number) => 
    api.get<OrderDto[]>('/trading/orders/open', { params: { userId } }),
  
  getOrdersByType: (userId: number, orderType: string) => 
    api.get<OrderDto[]>(`/trading/orders/type/${orderType}`, { params: { userId } }),
  
  getOrdersByStatus: (userId: number, status: string) => 
    api.get<OrderDto[]>(`/trading/orders/status/${status}`, { params: { userId } }),
  
  getOrdersByStatusAndType: (userId: number, status: string, orderType: string) => 
    api.get<OrderDto[]>(`/trading/orders/status/${status}/type/${orderType}`, { params: { userId } }),
  
  getOrderById: (userId: number, orderId: string) => 
    api.get<OrderDto>(`/trading/orders/${orderId}`, { params: { userId } }),
  
  cancelOrder: (userId: number, orderId: string) => 
    api.post(`/trading/orders/${orderId}/cancel`, null, { params: { userId } })
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
// Fixed Portfolio Service
export const realPortfolioService = {
  getUserPortfolio: async (): Promise<{data: UserStockDto[]}> => {
    try {
      const response = await api.get('/user-stocks/portfolio');
      return { data: response.data };
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw error;
    }
  },
  
  buyStock: async (symbol: string, quantity: number): Promise<{data: UserStockDto}> => {
    try {
      const response = await api.post('/user-stocks/buy', null, {
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
      const response = await api.post('/user-stocks/sell', null, {
        params: { symbol, quantity }
      });
      return { data: response.data };
    } catch (error) {
      console.error('Error selling stock:', error);
      throw error;
    }
  }
};

// Enhanced User Service with correct endpoints
export const enhancedUserService = {
  getUserById: (userId: number) => 
    api.get<UserDto>(`/users/${userId}`),
  
  updateUser: (userId: number, userData: Partial<UserDto>) => 
    api.put<UserDto>(`/users/${userId}`, userData),
  
  deleteUser: (userId: number) => 
    api.delete<string>(`/users/${userId}`)
};

// Watchlist interfaces
export interface WatchlistDto {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WatchlistItemDto {
  id: string;
  stockId: string;
  symbol: string;
  addedAt: string;
}

// Fixed Watchlist Service
export const watchlistService = {
  createWatchlist: (watchlistData: {name: string, description?: string}, userId: number) => 
    api.post<WatchlistDto>('/watchlists', watchlistData, { params: { userId } }),
  
  getUserWatchlists: (userId: number) => 
    api.get<WatchlistDto[]>('/watchlists', { params: { userId } }),
  
  getWatchlistById: (watchlistId: string, userId: number) => 
    api.get<WatchlistDto>(`/watchlists/${watchlistId}`, { params: { userId } }),
  
  updateWatchlist: (watchlistId: string, watchlistData: {name?: string, description?: string}, userId: number) => 
    api.put<WatchlistDto>(`/watchlists/${watchlistId}`, watchlistData, { params: { userId } }),
  
  deleteWatchlist: (watchlistId: string, userId: number) => 
    api.delete(`/watchlists/${watchlistId}`, { params: { userId } }),
  
  addStockToWatchlist: (watchlistId: string, stockId: number, userId: number) => 
    api.post<WatchlistItemDto>(`/watchlists/${watchlistId}/stocks`, null, { 
      params: { stockId, userId } 
    }),
  
  removeStockFromWatchlist: (watchlistId: string, stockItemId: string, userId: number) => 
    api.delete(`/watchlists/${watchlistId}/stocks/${stockItemId}`, { params: { userId } }),
  
  getWatchlistItems: (watchlistId: string, userId: number) => 
    api.get<WatchlistItemDto[]>(`/watchlists/${watchlistId}/stocks`, { params: { userId } })
};

// Authentication interfaces
export interface SignupRequest {
  email: string;
  username: string;
  password: string;
  mobile?: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  jwt?: string;
  message: string;
}

export interface ChangePasswordRequest {
  email: string;
  newPassword: string;
}

// Enhanced Authentication Service
export const authService = {
  signup: (userData: SignupRequest) => 
    api.post<AuthResponse>('/auth/signup', userData),
  
  signin: (credentials: SigninRequest) => 
    api.post<AuthResponse>('/auth/signin', credentials),
  
  verifyEmail: (token: string) => 
    api.get<string>(`/auth/verify?token=${token}`),
  
  forgotPassword: (email: string) => 
    api.post<AuthResponse>('/auth/forgot-password', { email }),
  
  changePassword: (data: ChangePasswordRequest) => 
    api.post<AuthResponse>('/auth/change-password', data),
  
  verifyPasswordChange: (token: string) => 
    api.get<string>(`/auth/verify-password-change?token=${token}`)
};
