import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { useSettings } from '../context/SettingsContext';

interface CandlestickBackgroundProps {
  opacity?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Enlarged candlesticks
const CANDLE_WIDTH = 14; // Increased from 8
const CANDLE_SPACING = 5; // Increased from 4
const CANDLES_PER_SCREEN = Math.floor(SCREEN_WIDTH / (CANDLE_WIDTH + CANDLE_SPACING));

const CandlestickBackground: React.FC<CandlestickBackgroundProps> = ({ opacity = 0.5 }) => {
  const { settings } = useSettings();
  
  // If showCandlestickBackground is false, don't render anything
  if (!settings.showCandlestickBackground) {
    return null;
  }
  
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
    const initialCandlesticks = generateCandlesticks(CANDLES_PER_SCREEN + 10);
    setCandlesticks(initialCandlesticks);
  }, []);

  // Start the animation
  useEffect(() => {
    if (candlesticks.length === 0) return;
    
    // Reset position
    scrollX.setValue(0);
    
    // Create animation - 1.2x faster (reduced duration)
    const animation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -((CANDLE_WIDTH + CANDLE_SPACING) * CANDLES_PER_SCREEN),
        duration: 25000, // Reduced from 30000 to make it 1.2x faster
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
    const baseValue = 100;
    // Increased chart height for larger candlesticks
    const chartHeight = 300; // Increased from 200
    
    for (let i = 0; i < count; i++) {
      // Simplified random values - enlarged
      const isUp = Math.random() > 0.5;
      const bodyHeight = Math.max(4, Math.random() * 30); // Increased from 2, 20
      const wickHeight = bodyHeight + Math.random() * 25; // Increased from 15
      
      // Center in the middle of the screen vertically
      // Calculate a position that centers the chart in the middle of the screen
      const middleOffset = (SCREEN_HEIGHT / 2) - (chartHeight / 2);
      const wickTopPosition = middleOffset + Math.random() * (chartHeight - wickHeight);
      const bodyTopPosition = wickTopPosition + Math.random() * 8; // Increased from 5
      
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
    }, 800); // Faster update interval (from 1000 to 800ms)
    
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, { opacity }]}>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
    overflow: 'hidden',
  },
  chartContainer: {
    flexDirection: 'row',
    height: '100%',
    paddingHorizontal: 20,
    // Removed vertical padding to allow for better centering
    justifyContent: 'center', // Center horizontally
  },
  candlestickContainer: {
    width: CANDLE_WIDTH,
    marginHorizontal: CANDLE_SPACING / 2,
    height: '100%',
    position: 'relative',
  },
  wick: {
    position: 'absolute',
    width: 2, // Increased from 1
    backgroundColor: '#475569',
    alignSelf: 'center',
  },
  body: {
    position: 'absolute',
    width: CANDLE_WIDTH,
    borderRadius: 2, // Increased from 1
  },
  green: {
    backgroundColor: '#10B981',
  },
  red: {
    backgroundColor: '#EF4444',
  },
});

export default CandlestickBackground;