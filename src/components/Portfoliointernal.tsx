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

  // Tooltip states
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    candle: CandlestickData;
    index: number;
  } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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
  // Unified tooltip positioning function
  const setUnifiedTooltipPosition = (locationX: number, locationY: number, data: any, index: number) => {
    setTooltipData({
      x: locationX,
      y: locationY,
      candle: data,
      index: index
    });
    setTooltipPosition({ x: locationX, y: locationY });
    setShowTooltip(true);
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
  // Add this variable to track position during pan
  let lastDividerPosition = screenHeight * 0.6;
  
  const dividerPanResponder = PanResponder.create({
  onStartShouldSetPanResponder: () => true,
  onMoveShouldSetPanResponder: () => true,
  onPanResponderMove: (evt, gestureState) => {
    const { dy } = gestureState;
    const newPosition = Math.max(
      screenHeight * 0.3,
      Math.min(screenHeight * 0.8, screenHeight * 0.6 + dy)
    );
    lastDividerPosition = newPosition; // Track the position
    dividerAnimation.setValue(newPosition);
    
    const newChartHeight = newPosition - 100;
    const newVolumeHeight = screenHeight - newPosition - 100;
    setChartHeight(newChartHeight);
    setVolumeHeight(newVolumeHeight);
  },
  onPanResponderRelease: () => {
    // Use the tracked position instead of trying to get it from the animated value
    const snapPosition = lastDividerPosition < screenHeight * 0.5 ? screenHeight * 0.4 : screenHeight * 0.6;
    
    Animated.spring(dividerAnimation, {
      toValue: snapPosition,
      useNativeDriver: false,
    }).start();
  },
  });

  const renderCandlestickChart = () => {
    if (!candlestickData.length) {
      return (
        <View style={[styles.chartContainer, { justifyContent: 'center', alignItems: 'center' }]}>
          <ThemedText style={{ color: '#666666', fontSize: 16 }}>Loading chart data...</ThemedText>
        </View>
      );
    }

    // Calculate price range for better scaling
    const prices = candlestickData.flatMap(candle => [candle.high, candle.low]);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    const padding = priceRange * 0.1;
    
    // Update handleChartTouch function
    const handleChartTouch = (event: any) => {
      const { locationX, locationY } = event.nativeEvent;
      const candleWidth = screenWidth / candlestickData.length;
      const candleIndex = Math.floor(locationX / candleWidth);
      
      if (candleIndex >= 0 && candleIndex < candlestickData.length) {
        const candle = candlestickData[candleIndex];
        setUnifiedTooltipPosition(locationX, locationY, candle, candleIndex);
      }
    };

    // Update handleVolumeTouch function
    const handleVolumeTouch = (event: any) => {
      const { locationX, locationY } = event.nativeEvent;
      const barWidth = screenWidth / volumeData.length;
      const touchedIndex = Math.floor(locationX / barWidth);
      
      if (touchedIndex >= 0 && touchedIndex < volumeData.length) {
        setUnifiedTooltipPosition(locationX, locationY, volumeData[touchedIndex], touchedIndex);
      }
    };
    
    const handleTouchEnd = () => {
      setTimeout(() => setShowTooltip(false), 2000);
    };
    
    return (
      <Animated.View
        style={[
          styles.chartContainer,
          {
            transform: [{ scale: chartScaleAnimation }],
          },
        ]}
        onTouchStart={handleChartTouch}
        onTouchEnd={handleTouchEnd}
        {...chartPanResponder.panHandlers}
      >
        <Svg height={chartHeight} width={screenWidth}>
          {candlestickData.map((candle, index) => {
            const x = (index * screenWidth) / candlestickData.length + panOffset;
            
            // Better scaling calculation
            const scaleY = (price: number) => 
              chartHeight - ((price - minPrice + padding) / (priceRange + 2 * padding)) * chartHeight;
            
            const bodyHeight = Math.abs(scaleY(candle.close) - scaleY(candle.open));
            const bodyY = Math.min(scaleY(candle.close), scaleY(candle.open));
            const color = candle.close > candle.open ? '#4CAF50' : '#F44336';

            return (
              <React.Fragment key={index}>
                <Line
                  x1={x + 5}
                  y1={scaleY(candle.high)}
                  x2={x + 5}
                  y2={scaleY(candle.low)}
                  stroke={color}
                  strokeWidth="1"
                />
                <Rect
                  x={x}
                  y={bodyY}
                  width="10"
                  height={Math.max(bodyHeight, 1)}
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
  const renderVolumeChart = () => {
    if (!volumeData.length) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText style={{ color: '#666666', fontSize: 14 }}>Loading volume data...</ThemedText>
        </View>
      );
    }

    // Calculate volume range for scaling
    const volumes = volumeData.map(data => data.volume);
    const maxVolume = Math.max(...volumes);
    const minVolume = Math.min(...volumes);
    const volumeRange = maxVolume - minVolume;
    
    const handleVolumeTouch = (event: any) => {
      const { locationX, locationY } = event.nativeEvent;
      const barWidth = screenWidth / volumeData.length;
      const touchedIndex = Math.floor(locationX / barWidth);
      
      if (touchedIndex >= 0 && touchedIndex < volumeData.length) {
        setUnifiedTooltipPosition(locationX, locationY, volumeData[touchedIndex], touchedIndex);
      }
    };
    
    const handleTouchEnd = () => {
      setTimeout(() => setShowTooltip(false), 2000);
    };
    
    return (
      <View onTouchStart={handleVolumeTouch}>
        <Svg height={volumeHeight - 40} width={screenWidth}>
          {volumeData.map((data, index) => {
            const x = (index * screenWidth) / volumeData.length;
            const barWidth = (screenWidth / volumeData.length) * 0.8;
            
            // Scale volume to chart height
            const barHeight = volumeRange > 0 
              ? ((data.volume - minVolume) / volumeRange) * (volumeHeight - 60)
              : 10;
            
            const barY = (volumeHeight - 60) - barHeight;
            
            // Color based on price movement
            const color = data.close > data.open ? '#4CAF50' : '#F44336';
            
            return (
              <Rect
                key={index}
                x={x + (barWidth * 0.1)}
                y={barY}
                width={barWidth}
                height={Math.max(barHeight, 1)}
                fill={color}
                opacity={0.7}
              />
            );
          })}
        </Svg>
      </View>
    );
  };
  const renderTooltip = () => {
    if (!showTooltip || !tooltipData) return null;

    const { candle, index } = tooltipData;
    const timestamp = new Date(candle.timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return (
      <Animated.View
        style={[
          styles.tooltip,
          {
            position: 'absolute',
            left: Math.max(10, Math.min(tooltipPosition.x - 60, screenWidth - 130)),
            top: tooltipPosition.y - 80, // Consistent offset for both charts
            zIndex: 1000,
          },
        ]}
      >
        <View style={styles.tooltipContent}>
          <ThemedText style={styles.tooltipTitle}>{portfolioData.symbol}</ThemedText>
          <ThemedText style={styles.tooltipTime}>{timestamp}</ThemedText>
          <View style={styles.tooltipRow}>
            <ThemedText style={styles.tooltipLabel}>Open:</ThemedText>
            <ThemedText style={styles.tooltipValue}>${candle.open.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.tooltipRow}>
            <ThemedText style={styles.tooltipLabel}>High:</ThemedText>
            <ThemedText style={[styles.tooltipValue, { color: '#4CAF50' }]}>${candle.high.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.tooltipRow}>
            <ThemedText style={styles.tooltipLabel}>Low:</ThemedText>
            <ThemedText style={[styles.tooltipValue, { color: '#F44336' }]}>${candle.low.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.tooltipRow}>
            <ThemedText style={styles.tooltipLabel}>Close:</ThemedText>
            <ThemedText style={styles.tooltipValue}>${candle.close.toFixed(2)}</ThemedText>
          </View>
          <View style={styles.tooltipRow}>
            <ThemedText style={styles.tooltipLabel}>Volume:</ThemedText>
            <ThemedText style={styles.tooltipValue}>{candle.volume.toLocaleString()}</ThemedText>
          </View>
        </View>
      </Animated.View>
    );
  };
  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Header with back arrow and search */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <ThemedText style={styles.backArrow}>←</ThemedText>
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <ThemedText style={styles.searchIcon}>🔍</ThemedText>
          <ThemedText style={styles.headerTitle}>{portfolioData.symbol}</ThemedText>
        </View>
      </View>

      {/* Price and Stats Section - Now horizontal layout */}
      <View style={styles.topInfoSection}>
        {/* Left side - Price Display Section */}
        <View style={styles.priceSection}>
          <ThemedText style={styles.priceDisplay}>
            {portfolioData.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </ThemedText>
          <View style={styles.changeContainer}>
            <ThemedText style={[styles.changeText, { color: portfolioData.dailyChange >= 0 ? '#00C851' : '#FF4444' }]}>
              ▲ +{portfolioData.dailyChange.toFixed(2)} +{portfolioData.dailyChangePercent.toFixed(2)}%
            </ThemedText>
          </View>
          <View style={styles.timeContainer}>
            <ThemedText style={styles.timeText}>⏰ LO</ThemedText>
          </View>
          <View style={styles.indicatorRow}>
            <View style={[styles.indicator, { backgroundColor: '#00C851' }]}>
              <ThemedText style={styles.indicatorText}>▲17 (0)</ThemedText>
            </View>
            <View style={[styles.indicator, { backgroundColor: '#FFD700' }]}>
              <ThemedText style={styles.indicatorText}>|3</ThemedText>
            </View>
            <View style={[styles.indicator, { backgroundColor: '#FF4444' }]}>
              <ThemedText style={styles.indicatorText}>▼10 (0)</ThemedText>
            </View>
          </View>
        </View>

        {/* Right side - Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Total vol</ThemedText>
            <ThemedText style={styles.statValue}>{portfolioData.totalVolume.toLocaleString()}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Total value</ThemedText>
            <ThemedText style={styles.statValue}>{portfolioData.totalValue.toFixed(2)} bil</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>FR. buy Vol</ThemedText>
            <ThemedText style={styles.statValue}>{portfolioData.foreignBuyVolume.toLocaleString()}</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>FR. sell Vol</ThemedText>
            <ThemedText style={styles.statValue}>{portfolioData.foreignSellVolume.toLocaleString()}</ThemedText>
          </View>
        </View>
      </View>

      {/* Chart Area - Now takes full width */}
      <View style={styles.chartArea}>
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

        {/* Chart Controls */}
        <View style={styles.chartControls}>
          <View style={styles.controlsLeft}>
            <ThemedText style={styles.symbolText}>🔍 {portfolioData.symbol}</ThemedText>
            <TouchableOpacity style={styles.addButton}>
              <ThemedText style={styles.addButtonText}>⊕</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.timeframeText}>D</ThemedText>
            <TouchableOpacity style={styles.toolButton} onPress={toggleSidebar}>
              <ThemedText style={styles.toolIcon}>🎨</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolButton}>
              <ThemedText style={styles.toolIcon}>ƒₓ</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolButton}>
              <ThemedText style={styles.toolIcon}>⚏</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolButton}>
              <ThemedText style={styles.toolIcon}>↶</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chart Content */}
        <View style={styles.content}>
          {activeTab === 'Chart' && (
            <View style={styles.chartWrapper}>
              {/* Chart Header */}
              <View style={styles.chartHeader}>
                <ThemedText style={styles.chartTitle}>{portfolioData.symbol} • 1D</ThemedText>
                <ThemedText style={styles.chartPrice}>
                  {portfolioData.currentPrice.toFixed(2)} +{portfolioData.dailyChange.toFixed(2)} (+{portfolioData.dailyChangePercent.toFixed(2)}%)
                </ThemedText>
              </View>
              
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
                <View style={styles.volumeHeader}>
                  <ThemedText style={styles.volumeTitle}>Volume</ThemedText>
                </View>
                {renderVolumeChart()}
              </View>

              {/* Chart Footer Controls */}
              <View style={styles.chartFooter}>
                <View style={styles.footerLeft}>
                  <ThemedText style={styles.footerText}>Date Range</ThemedText>
                  <ThemedText style={styles.footerText}>10:35:06 (UTC+7)</ThemedText>
                </View>
                <View style={styles.footerRight}>
                  <ThemedText style={styles.footerText}>%</ThemedText>
                  <ThemedText style={styles.footerText}>log</ThemedText>
                  <ThemedText style={[styles.footerText, styles.autoText]}>auto</ThemedText>
                </View>
              </View>
            </View>
          )}
          
          {activeTab === 'Summary' && (
            <View style={styles.summaryContainer}>
              <ThemedText style={styles.summaryText}>
                Portfolio Summary for {portfolioData.symbol}
              </ThemedText>
              <ThemedText style={styles.summaryDetail}>Current Price: ${portfolioData.currentPrice.toFixed(2)}</ThemedText>
              <ThemedText style={styles.summaryDetail}>Daily Change: {portfolioData.dailyChange.toFixed(2)} ({portfolioData.dailyChangePercent.toFixed(2)}%)</ThemedText>
              <ThemedText style={styles.summaryDetail}>Volume: {portfolioData.totalVolume.toLocaleString()}</ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Tooltip */}
      {renderTooltip()}

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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 20,
    color: '#000000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#666666',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  leftPanel: {
    width: '40%',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
  },
  rightPanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  priceSection: {
    flex: 1, // Takes left portion
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  priceDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00C851',
    marginBottom: 4,
  },
  changeContainer: {
    marginBottom: 8,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeContainer: {
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#666666',
  },
  indicatorRow: {
    flexDirection: 'row',
    gap: 4,
  },
  indicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  indicatorText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsGrid: {
    flex: 1, // Takes right portion
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1, // Add separator line
    borderLeftColor: '#E5E5E5',
  },
  statItem: {
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    color: '#888888',
    fontSize: 14,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  chartControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  controlsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  symbolText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  chartArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topInfoSection: {
    flexDirection: 'row', // Add this line to make it horizontal
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  addButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeframeText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  toolButton: {
    padding: 6,
  },
  toolIcon: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
  },
  chartWrapper: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  chartPrice: {
    fontSize: 12,
    color: '#00C851',
  },
  chartContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  divider: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },
  dividerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CCCCCC',
    borderRadius: 2,
  },
  volumeContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  volumeHeader: {
    padding: 8,
    backgroundColor: '#FFFFFF',
  },
  volumeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  chartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  footerLeft: {
    flexDirection: 'row',
    gap: 16,
  },
  footerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#666666',
  },
  autoText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  summaryContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',
  },
  summaryDetail: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
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
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 6,
    padding: 8,
    zIndex: 1000,
    minWidth: 120, // Reduced from 160
    maxWidth: 140, // Added max width constraint
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltipContent: {
    alignItems: 'flex-start',
  },
  tooltipTitle: {
    color: '#FFFFFF',
    fontSize: 13, // Slightly smaller
    fontWeight: 'bold',
    marginBottom: 3, // Reduced margin
  },
  tooltipTime: {
    color: '#CCCCCC',
    fontSize: 11, // Slightly smaller
    marginBottom: 6, // Reduced margin
  },
  tooltipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 1, // Reduced from 2
  },
  tooltipLabel: {
    color: '#CCCCCC',
    fontSize: 11, // Slightly smaller
    minWidth: 40, // Reduced from 50
  },
  tooltipValue: {
    color: '#FFFFFF',
    fontSize: 11, // Slightly smaller
    fontWeight: '600',
  },
});

export default Portfoliointernal;




