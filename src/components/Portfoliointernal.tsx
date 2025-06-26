import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import {
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Svg, Rect, Line, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../utils/theme';
import { CandlestickData, TimeRange, stockService } from '../services/api';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import ChartDrawingTool from './ChartDrawingTool';
import CandlestickBackground from './CandlestickBackground';
import ThemedText from './ThemedText';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PortfolioData {
  symbol: string;
  currentPrice: number;
  dailyChange: number;
  dailyChangePercent: number;
  totalVolume: number;
  totalValue: number;
  foreignBuyVolume: number;
  foreignSellVolume: number;
}

interface DrawingTool {
  type: 'line' | 'rectangle' | 'circle' | 'emoji';
  points: { x: number; y: number }[];
  color: string;
  emoji?: string;
}

type PortfolioInternalRouteProp = RouteProp<{
  PortfolioInternal: {
    symbol?: string;
  };
}, 'PortfolioInternal'>;

interface PortfolioInternalProps {
  route?: PortfolioInternalRouteProp;
}

const Portfoliointernal: React.FC<PortfolioInternalProps> = ({ route: propRoute }) => {
  const theme = useTheme();
  const route = useRoute<PortfolioInternalRouteProp>();
  const navigation = useNavigation();
  const initialSymbol = route.params?.symbol || 'VN30';
  
  // Animation values
  const sidebarAnimation = useRef(new Animated.Value(0)).current;
  const chartScaleAnimation = useRef(new Animated.Value(1)).current;
  const dividerAnimation = useRef(new Animated.Value(screenHeight * 0.6)).current;
  
  // State variables
  const [activeTab, setActiveTab] = useState<'Chart' | 'Summary'>('Chart');
  const [searchQuery, setSearchQuery] = useState(initialSymbol);
  const [selectedSymbol, setSelectedSymbol] = useState(initialSymbol);
  const [timeRange, setTimeRange] = useState<TimeRange>('1day');
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([]);
  const [volumeData, setVolumeData] = useState<CandlestickData[]>([]);
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    symbol: initialSymbol,
    currentPrice: 1442.97,
    dailyChange: 3.67,
    dailyChangePercent: 0.25,
    totalVolume: 142103515,
    totalValue: 4087.46,
    foreignBuyVolume: 19097024,
    foreignSellVolume: 29348662,
  });
  
  // Chart controls
  const [chartHeight, setChartHeight] = useState(screenHeight * 0.4);
  const [volumeHeight, setVolumeHeight] = useState(screenHeight * 0.2);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedDrawingTool, setSelectedDrawingTool] = useState<'line' | 'rectangle' | 'circle' | 'emoji'>('line');
  const [drawings, setDrawings] = useState<DrawingTool[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingTool | null>(null);
  const [showDrawingSidebar, setShowDrawingSidebar] = useState(false);

  // Effects
  useEffect(() => {
    loadChartData();
    loadStockData();
  }, [selectedSymbol, timeRange]);

  useEffect(() => {
    if (initialSymbol !== selectedSymbol) {
      setSelectedSymbol(initialSymbol);
      setSearchQuery(initialSymbol);
      setPortfolioData(prev => ({ ...prev, symbol: initialSymbol }));
    }
  }, [initialSymbol, selectedSymbol]);

  // Data loading functions
  const loadChartData = async () => {
    try {
      const data = await stockService.getHistoricalData(selectedSymbol, timeRange);
      setCandlestickData(data);
      setVolumeData(data);
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  const loadStockData = async () => {
    try {
      const quote = await stockService.getStockQuote(selectedSymbol);
      if (quote && quote['Global Quote']) {
        const globalQuote = quote['Global Quote'];
        const currentPrice = parseFloat(globalQuote['05. price']) || 0;
        const change = parseFloat(globalQuote['09. change']) || 0;
        const changePercent = parseFloat(globalQuote['10. change percent']?.replace('%', '')) || 0;
        const volume = parseInt(globalQuote['06. volume']) || 0;
        
        setPortfolioData(prev => ({
          ...prev,
          symbol: selectedSymbol,
          currentPrice,
          dailyChange: change,
          dailyChangePercent: changePercent,
          totalVolume: volume,
        }));
      }
    } catch (error) {
      console.error('Error loading stock data:', error);
    }
  };

  // Animation functions
  const toggleSidebar = () => {
    const toValue = showSidebar ? 0 : 1;
    Animated.timing(sidebarAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setShowSidebar(!showSidebar);
  };
  
  const animateChartScale = (scale: number) => {
    Animated.spring(chartScaleAnimation, {
      toValue: scale,
      useNativeDriver: true,
    }).start();
  };
  
  // Pan responder for chart interactions
  const chartPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      if (!isDrawing) {
        const { dx } = gestureState;
        setPanOffset(prev => Math.max(-candlestickData.length * 0.5, Math.min(0, prev + dx * 0.01)));
      }
    },
    onPanResponderRelease: () => {
      // Reset chart scale if needed
      animateChartScale(1);
    },
  });
  
  // Divider pan responder
  const dividerPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const { dy } = gestureState;
      const newPosition = Math.max(
        screenHeight * 0.3,
        Math.min(screenHeight * 0.8, screenHeight * 0.6 + dy)
      );
      dividerAnimation.setValue(newPosition);
      
      const newChartHeight = newPosition - 100;
      const newVolumeHeight = screenHeight - newPosition - 100;
      setChartHeight(newChartHeight);
      setVolumeHeight(newVolumeHeight);
    },
    onPanResponderRelease: () => {
      // Snap to nearest position based on screen center
      // Since we don't need the exact current value, we can use the gesture's final position
      const snapPosition = screenHeight * 0.5; // Default to center, or choose based on your UI needs
      
      Animated.spring(dividerAnimation, {
        toValue: snapPosition,
        useNativeDriver: false,
      }).start();
    },
  });

  const renderCandlestickChart = () => {
    if (!candlestickData.length) return null;

    return (
      <Animated.View
        style={[
          styles.chartContainer,
          {
            transform: [{ scale: chartScaleAnimation }],
          },
        ]}
        {...chartPanResponder.panHandlers}
      >
        <Svg height={chartHeight} width={screenWidth}>
          {candlestickData.map((candle, index) => {
            const x = (index * screenWidth) / candlestickData.length + panOffset;
            const bodyHeight = Math.abs(candle.close - candle.open) * 2;
            const bodyY = Math.min(candle.close, candle.open) * 2;
            const color = candle.close > candle.open ? '#4CAF50' : '#F44336';

            return (
              <React.Fragment key={index}>
                <Line
                  x1={x + 5}
                  y1={candle.high * 2}
                  x2={x + 5}
                  y2={candle.low * 2}
                  stroke={color}
                  strokeWidth="1"
                />
                <Rect
                  x={x}
                  y={bodyY}
                  width="10"
                  height={bodyHeight}
                  fill={color}
                />
              </React.Fragment>
            );
          })}
          
          {/* Render drawings */}
          {drawings.map((drawing, index) => (
            <Line
              key={index}
              x1={drawing.points[0]?.x || 0}
              y1={drawing.points[0]?.y || 0}
              x2={drawing.points[1]?.x || 0}
              y2={drawing.points[1]?.y || 0}
              stroke={drawing.color}
              strokeWidth="2"
            />
          ))}
        </Svg>
      </Animated.View>
    );
  };
  
  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>
          {portfolioData.symbol} - ${portfolioData.currentPrice.toFixed(2)}
        </ThemedText>
        <TouchableOpacity onPress={toggleSidebar} style={styles.toolButton}>
          <ThemedText style={styles.toolButtonText}>Tools</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['Chart', 'Summary'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab as 'Chart' | 'Summary')}
          >
            <ThemedText style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {activeTab === 'Chart' && (
          <View style={styles.chartWrapper}>
            {renderCandlestickChart()}
            
            {/* Animated Divider */}
            <Animated.View
              style={[
                styles.divider,
                {
                  top: dividerAnimation,
                },
              ]}
              {...dividerPanResponder.panHandlers}
            >
              <View style={styles.dividerHandle} />
            </Animated.View>
            
            {/* Volume Chart */}
            <View style={[styles.volumeContainer, { height: volumeHeight }]}>
              <CandlestickBackground />
            </View>
          </View>
        )}
        
        {activeTab === 'Summary' && (
          <View style={styles.summaryContainer}>
            <ThemedText style={styles.summaryText}>
              Portfolio Summary for {portfolioData.symbol}
            </ThemedText>
            <ThemedText>Current Price: ${portfolioData.currentPrice.toFixed(2)}</ThemedText>
            <ThemedText>Daily Change: {portfolioData.dailyChange.toFixed(2)} ({portfolioData.dailyChangePercent.toFixed(2)}%)</ThemedText>
            <ThemedText>Volume: {portfolioData.totalVolume.toLocaleString()}</ThemedText>
          </View>
        )}
      </View>

      {/* Animated Sidebar with correct ChartDrawingTool props */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [
              {
                translateX: sidebarAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-300, 0],
                }),
              },
            ],
            opacity: sidebarAnimation,
          },
        ]}
      >
        <ChartDrawingTool
          width={250}
          height={screenHeight}
          onDrawingsChange={setDrawings}
          initialDrawings={drawings}
          theme={theme}
          showSidebar={showSidebar}
          onToggleSidebar={toggleSidebar}
        />
      </Animated.View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  toolButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toolButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  chartWrapper: {
    flex: 1,
    position: 'relative',
  },
  chartContainer: {
    flex: 1,
  },
  divider: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dividerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
  },
  volumeContainer: {
    backgroundColor: '#111',
  },
  summaryContainer: {
    flex: 1,
    padding: 16,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#fff',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: '#1a1a1a',
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
});

export default Portfoliointernal;