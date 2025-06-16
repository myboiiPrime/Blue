import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the ngrok URL to access the backend
const API_URL = 'https://efb4-2a09-bac5-d45e-16c8-00-245-f.ngrok-free.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Add this header to bypass ngrok browser warning
    'ngrok-skip-browser-warning': 'true'
  },
});

// Add request interceptor to include JWT token in requests
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

// Stock API services
export const stockService = {
  getStockQuote: (symbol: string) => api.get(`/api/stocks/quote?symbol=${symbol}`),
  searchStock: (keywords: string) => api.get(`/api/stocks/search?keywords=${keywords}`),
};

// User stock services
export const userStockService = {
  getUserPortfolio: () => api.get('/api/user-stocks/portfolio'),
  buyStock: (symbol: string, quantity: number) => 
    api.post('/api/user-stocks/buy', null, { params: { symbol, quantity }}),
  sellStock: (symbol: string, quantity: number) => 
    api.post('/api/user-stocks/sell', null, { params: { symbol, quantity }}),
};

// User profile services
export const userService = {
  getUserProfile: () => api.get('/api/users/profile'),
  updateUserProfile: (userData: any) => api.put('/api/users/profile', userData),
};