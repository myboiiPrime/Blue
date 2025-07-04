export interface StaticStock {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  quantity?: number;
  currentValue?: number;
  profitLoss?: number;
  profitLossPercentage?: number;
}

export const STATIC_STOCKS: StaticStock[] = [
  {
    id: '1',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.43,
    change: 2.15,
    changePercent: 1.24,
    volume: 45230000,
    quantity: 10,
    currentValue: 175.43,
    profitLoss: 125.50,
    profitLossPercentage: 2.45
  },
  {
    id: '2',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 2847.52,
    change: -12.34,
    changePercent: -0.43,
    volume: 1250000,
    quantity: 2,
    currentValue: 2847.52,
    profitLoss: -89.30,
    profitLossPercentage: -1.55
  },
  {
    id: '3',
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    price: 378.91,
    change: 5.67,
    changePercent: 1.52,
    volume: 28450000,
    quantity: 15,
    currentValue: 378.91,
    profitLoss: 234.75,
    profitLossPercentage: 4.12
  },
  {
    id: '4',
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 3342.88,
    change: -8.92,
    changePercent: -0.27,
    volume: 3120000,
    quantity: 3,
    currentValue: 3342.88,
    profitLoss: -67.45,
    profitLossPercentage: -0.98
  },
  {
    id: '5',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.73,
    change: 12.45,
    changePercent: 5.27,
    volume: 89340000,
    quantity: 7,
    currentValue: 248.73,
    profitLoss: -156.80,
    profitLossPercentage: -2.89
  },
  {
    id: '6',
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    price: 875.28,
    change: 15.67,
    changePercent: 1.82,
    volume: 52340000,
    quantity: 4,
    currentValue: 875.28,
    profitLoss: 345.60,
    profitLossPercentage: 6.78
  },
  {
    id: '7',
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    price: 485.32,
    change: -7.89,
    changePercent: -1.60,
    volume: 18750000,
    quantity: 6,
    currentValue: 485.32,
    profitLoss: -67.45,
    profitLossPercentage: -1.38
  },
  {
    id: '8',
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    price: 612.45,
    change: 8.23,
    changePercent: 1.36,
    volume: 4560000,
    quantity: 2,
    currentValue: 612.45,
    profitLoss: 45.80,
    profitLossPercentage: 2.15
  },
  {
    id: '9',
    symbol: 'AMD',
    name: 'Advanced Micro Devices',
    price: 142.67,
    change: -2.34,
    changePercent: -1.61,
    volume: 35670000,
    quantity: 20,
    currentValue: 142.67,
    profitLoss: 89.40,
    profitLossPercentage: 3.14
  },
  {
    id: '10',
    symbol: 'CRM',
    name: 'Salesforce Inc.',
    price: 267.89,
    change: 4.56,
    changePercent: 1.73,
    volume: 7890000,
    quantity: 5,
    currentValue: 267.89,
    profitLoss: 78.90,
    profitLossPercentage: 2.98
  },
  {
    id: '11',
    symbol: 'INTC',
    name: 'Intel Corp.',
    price: 45.67,
    change: -1.23,
    changePercent: -2.62,
    volume: 67890000,
    quantity: 25,
    currentValue: 45.67,
    profitLoss: -34.50,
    profitLossPercentage: -1.85
  },
  {
    id: '12',
    symbol: 'ORCL',
    name: 'Oracle Corp.',
    price: 118.45,
    change: 2.78,
    changePercent: 2.40,
    volume: 12340000,
    quantity: 8,
    currentValue: 118.45,
    profitLoss: 56.70,
    profitLossPercentage: 3.22
  }
];

export const STATIC_MARKET_ETFS = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', data: [] },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', data: [] },
  { symbol: 'IWM', name: 'iShares Russell 2000 ETF', data: [] },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', data: [] },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', data: [] }
];

export const getStaticMarketData = () => {
  return STATIC_STOCKS.map(stock => ({
    symbol: stock.symbol,
    name: stock.name,
    price: stock.price,
    change: stock.change,
    changePercent: stock.changePercent,
    volume: stock.volume,
    chartData: []
  }));
};

export const getStaticPortfolioData = () => {
  return STATIC_STOCKS.filter(stock => stock.quantity).map(stock => ({
    id: stock.id,
    symbol: stock.symbol,
    quantity: stock.quantity!,
    purchasePrice: stock.price * 0.95, // Simulate purchase price 5% lower than current
    purchaseDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 90 days
    currentValue: stock.currentValue!,
    profitLoss: stock.profitLoss!,
    profitLossPercentage: stock.profitLossPercentage!
  }));
};

export const getStaticWatchlistData = () => {
  return STATIC_STOCKS.filter(stock => stock.quantity).map(stock => ({
    id: stock.id,
    symbol: stock.symbol,
    quantity: stock.quantity!,
    currentValue: stock.currentValue!,
    profitLoss: stock.profitLoss!,
    profitLossPercentage: stock.profitLossPercentage!,
    chartData: []
  }));
};

export const getStaticMarketOverview = () => {
  return STATIC_MARKET_ETFS;
};

// Helper function to get random subset of stocks
export const getRandomStaticStocks = (count: number) => {
  const shuffled = [...STATIC_STOCKS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};