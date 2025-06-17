import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CandlestickData, TimeRange } from '../services/api';

interface MiniCandlestickChartProps {
  width?: number;
  height?: number;
  opacity?: number;
  data: CandlestickData[];
  symbol?: string;
  timeRange?: TimeRange;
  onError?: (error: Error) => void;
}

interface ProcessedCandle {
  isUp: boolean;
  bodyHeight: number;
  wickHeight: number;
  bodyTopPosition: number;
  wickTopPosition: number;
  originalData: CandlestickData;
}

const MiniCandlestickChart: React.FC<MiniCandlestickChartProps> = ({ 
  width = 80, 
  height = 40, 
  opacity = 0.8,
  data = [],
  symbol = '',
  timeRange = '1day',
  onError
}) => {
  const CANDLE_WIDTH = 2;
  const CANDLE_SPACING = 1;
  const CANDLES_PER_CHART = Math.floor(width / (CANDLE_WIDTH + CANDLE_SPACING));
  
  const [candlesticks, setCandlesticks] = useState<ProcessedCandle[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Process real data into display format
  useEffect(() => {
    if (data.length > 0) {
      const processed = processRealData(data);
      setCandlesticks(processed);
      setCurrentIndex(0);
    }
  }, [data, height]);

  // Real-time update simulation (move through historical data)
  useEffect(() => {
    if (candlesticks.length === 0) return;
    
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Update interval based on time range
    const updateInterval = timeRange === '1day' ? 5000 : // 5 seconds for 1day
                          timeRange === '1week' ? 3000 : // 3 seconds for 1week
                          2000; // 2 seconds for 30days
    
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        const maxIndex = Math.max(0, candlesticks.length - CANDLES_PER_CHART);
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, updateInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [candlesticks, timeRange]);

  // Process real candlestick data for display
  const processRealData = (data: CandlestickData[]): ProcessedCandle[] => {
    if (data.length === 0) return [];
    
    // Find min and max for scaling
    const allPrices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice || 1;
    
    const chartHeight = height * 0.8;
    const marginTop = height * 0.1;
    
    return data.map(candle => {
      const isUp = candle.close >= candle.open;
      
      // Scale prices to chart height
      const scalePrice = (price: number) => {
        return marginTop + ((maxPrice - price) / priceRange) * chartHeight;
      };
      
      const openY = scalePrice(candle.open);
      const closeY = scalePrice(candle.close);
      const highY = scalePrice(candle.high);
      const lowY = scalePrice(candle.low);
      
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1, Math.abs(closeY - openY));
      const wickTop = highY;
      const wickHeight = lowY - highY;
      
      return {
        isUp,
        bodyHeight,
        wickHeight,
        bodyTopPosition: bodyTop,
        wickTopPosition: wickTop,
        originalData: candle
      };
    });
  };

  // Get visible candlesticks
  const visibleCandlesticks = candlesticks.slice(currentIndex, currentIndex + CANDLES_PER_CHART);

  return (
    <View style={[styles.container, { width, height, opacity }]}>
      <View style={styles.chartContainer}>
        {visibleCandlesticks.map((candle, index) => (
          <View key={`candle-${currentIndex + index}`} style={[styles.candlestickContainer, { width: CANDLE_WIDTH, marginHorizontal: CANDLE_SPACING / 2 }]}>
            <View 
              style={[
                styles.wick, 
                { height: candle.wickHeight, top: candle.wickTopPosition }
              ]} 
            />
            <View 
              style={[
                styles.body, 
                candle.isUp ? styles.green : styles.red,
                { height: candle.bodyHeight, top: candle.bodyTopPosition }
              ]}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 4,
  },
  chartContainer: {
    flexDirection: 'row',
    height: '100%',
    paddingHorizontal: 2,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  candlestickContainer: {
    height: '100%',
    position: 'relative',
  },
  wick: {
    position: 'absolute',
    width: 1,
    backgroundColor: '#475569',
    alignSelf: 'center',
  },
  body: {
    position: 'absolute',
    width: '100%',
    borderRadius: 1,
  },
  green: {
    backgroundColor: '#10B981',
  },
  red: {
    backgroundColor: '#EF4444',
  },
});

export default MiniCandlestickChart;