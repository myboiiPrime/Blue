import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';

interface MiniCandlestickChartProps {
  width?: number;
  height?: number;
  opacity?: number;
  trend?: 'up' | 'down' | 'neutral';
}

const MiniCandlestickChart: React.FC<MiniCandlestickChartProps> = ({ 
  width = 80, 
  height = 40, 
  opacity = 0.8,
  trend = 'neutral'
}) => {
  // Smaller candlesticks for mini chart
  const CANDLE_WIDTH = 4;
  const CANDLE_SPACING = 1;
  const CANDLES_PER_CHART = Math.floor(width / (CANDLE_WIDTH + CANDLE_SPACING));
  
  // Simplify the state to avoid potential issues
  const [candlesticks, setCandlesticks] = useState<Array<{
    isUp: boolean;
    bodyHeight: number;
    wickHeight: number;
    bodyTopPosition: number;
    wickTopPosition: number;
  }>>([]);
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  // Generate initial candlesticks with pre-calculated values
  useEffect(() => {
    const initialCandlesticks = generateCandlesticks(CANDLES_PER_CHART + 5);
    setCandlesticks(initialCandlesticks);
  }, []);

  // Start the animation
  useEffect(() => {
    if (candlesticks.length === 0) return;
    
    // Reset position
    scrollX.setValue(0);
    
    // Create animation - faster for mini chart
    const animation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -((CANDLE_WIDTH + CANDLE_SPACING) * CANDLES_PER_CHART),
        duration: 15000, // Faster animation for mini chart
        useNativeDriver: true,
      })
    );
    
    // Store reference and start
    animationRef.current = animation;
    animation.start();
    
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [candlesticks]);

  // Generate new random candlesticks with pre-calculated display values
  const generateCandlesticks = (count: number) => {
    const sticks = [];
    const chartHeight = height * 0.8; // Use 80% of the height for the chart
    
    // Bias the random generation based on the trend prop
    const upProbability = trend === 'up' ? 0.7 : trend === 'down' ? 0.3 : 0.5;
    
    for (let i = 0; i < count; i++) {
      // Generate candlestick with trend bias
      const isUp = Math.random() < upProbability;
      const bodyHeight = Math.max(2, Math.random() * 8); // Smaller bodies
      const wickHeight = bodyHeight + Math.random() * 6; // Smaller wicks
      
      // Center in the middle of the chart vertically
      const middleOffset = (height / 2) - (chartHeight / 2);
      const wickTopPosition = middleOffset + Math.random() * (chartHeight - wickHeight);
      const bodyTopPosition = wickTopPosition + Math.random() * 3;
      
      sticks.push({
        isUp,
        bodyHeight,
        wickHeight,
        bodyTopPosition,
        wickTopPosition
      });
    }
    
    return sticks;
  };

  // Add new candlesticks as animation progresses
  useEffect(() => {
    const interval = setInterval(() => {
      setCandlesticks(prev => {
        // Remove one from the beginning and add one to the end
        const newCandles = [...prev.slice(1), ...generateCandlesticks(1)];
        return newCandles;
      });
    }, 500); // Faster update interval for mini chart
    
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { width, height, opacity }]}>
      <Animated.View 
        style={[styles.chartContainer, { transform: [{ translateX: scrollX }] }]}
      >
        {candlesticks.map((candle, index) => (
          <View key={`candle-${index}`} style={styles.candlestickContainer}>
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
      </Animated.View>
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
    justifyContent: 'center',
  },
  candlestickContainer: {
    width: 4,
    marginHorizontal: 1,
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
    width: 4,
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