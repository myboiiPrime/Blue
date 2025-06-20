import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { Svg, Rect, Line, Path, Circle, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../utils/theme';
import ThemedText from './ThemedText';
import ThemedButton from './ThemedButton';
import { CandlestickData, TimeRange, stockService } from '../services/api';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
// Add import at the top
import ChartDrawingTool from './ChartDrawingTool';

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

// Define the route params type
type PortfolioInternalRouteProp = RouteProp<{
  PortfolioInternal: {
    symbol?: string;
  };
}, 'PortfolioInternal'>;

interface PortfolioInternalProps {
  route?: PortfolioInternalRouteProp;
}

const Portfoliointernal: React.FC<PortfolioInternalProps> = () => {
  const theme = useTheme();
  const route = useRoute<PortfolioInternalRouteProp>();
  const navigation = useNavigation();
  
  // Get symbol from route params or default to VN30
  const initialSymbol = route.params?.symbol || 'VN30';
  
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
  
  // Chart dimensions and controls
  const [chartHeight, setChartHeight] = useState(screenHeight * 0.4);
  const [volumeHeight, setVolumeHeight] = useState(screenHeight * 0.2);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedDrawingTool, setSelectedDrawingTool] = useState<'line' | 'rectangle' | 'circle' | 'emoji'>('line');
  const [drawings, setDrawings] = useState<DrawingTool[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingTool | null>(null);
  
  // Refs for gesture handling
  // Remove the old refs
  // const dividerPanRef = useRef<PanGestureHandler>(null);
  // const chartPanRef = useRef<PanGestureHandler>(null);
  // const chartPinchRef = useRef<PinchGestureHandler>(null);
  // const drawingPanRef = useRef<PanGestureHandler>(null);

  // Load data on component mount
  useEffect(() => {
    loadChartData();
  }, [selectedSymbol, timeRange]);

  // Handle divider drag to resize charts
  const onDividerPanGestureEvent = (event: any) => {
    const { translationY } = event;
    const newChartHeight = Math.max(100, Math.min(screenHeight * 0.6, chartHeight + translationY));
    const newVolumeHeight = Math.max(50, Math.min(screenHeight * 0.4, volumeHeight - translationY));
    
    setChartHeight(newChartHeight);
    setVolumeHeight(newVolumeHeight);
  };

  // Handle chart pan for scrolling
  const onChartPanGestureEvent = (event: any) => {
    if (!isDrawing) {
      // Fix: Access translationX directly from event, not event.nativeEvent
      const { translationX } = event;
      setPanOffset(prev => Math.max(-candlestickData.length * 0.5, Math.min(0, prev + translationX * 0.01)));
    }
  };

  // Handle pinch for zoom
  const onChartPinchGestureEvent = (event: any) => {
    // Fix: Access scale directly from event, not event.nativeEvent
    const { scale } = event;
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev * scale)));
  };

  // Handle drawing gestures
  const onDrawingPanGestureEvent = (event: any) => {
    if (!showSidebar) return;
    
    // Fix: Access properties directly from event, not event.nativeEvent
    const { state, x, y } = event;
    
    if (state === 'began') {
      setIsDrawing(true);
      const newDrawing: DrawingTool = {
        type: selectedDrawingTool,
        points: [{ x, y }],
        color: theme.colors.primary,
        emoji: selectedDrawingTool === 'emoji' ? '📈' : undefined,
      };
      setCurrentDrawing(newDrawing);
    } else if (state === 'active' && currentDrawing) {
      setCurrentDrawing(prev => prev ? {
        ...prev,
        points: [...prev.points.slice(0, 1), { x, y }]
      } : null);
    } else if (state === 'end' && currentDrawing) {
      setDrawings(prev => [...prev, currentDrawing]);
      setCurrentDrawing(null);
      setIsDrawing(false);
    }
  };

  // Create gesture objects
  const dividerPanGesture = Gesture.Pan()
    .onUpdate(onDividerPanGestureEvent);

  const chartPanGesture = Gesture.Pan()
    .onUpdate(onChartPanGestureEvent);

  const chartPinchGesture = Gesture.Pinch()
    .onUpdate(onChartPinchGestureEvent);

  const drawingPanGesture = Gesture.Pan()
    .onUpdate(onDrawingPanGestureEvent);

  const combinedChartGesture = Gesture.Simultaneous(
    chartPanGesture,
    chartPinchGesture,
    drawingPanGesture
  );

  // Render candlestick chart
  const renderCandlestickChart = () => {
    if (candlestickData.length === 0) return null;
    
    const chartWidth = screenWidth - (showSidebar ? 80 : 20);
    const visibleCandles = Math.floor(chartWidth / (4 * zoomLevel));
    const startIndex = Math.max(0, candlestickData.length - visibleCandles + Math.floor(panOffset));
    const endIndex = Math.min(candlestickData.length, startIndex + visibleCandles);
    const visibleData = candlestickData.slice(startIndex, endIndex);
    
    if (visibleData.length === 0) return null;

    const prices = visibleData.flatMap(d => [d.open, d.high, d.low, d.close]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    
    const candleWidth = (chartWidth / visibleData.length) * 0.8;
    const candleSpacing = chartWidth / visibleData.length;
    
    return (
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = chartHeight * ratio;
          const price = maxPrice - (priceRange * ratio);
          return (
            <React.Fragment key={index}>
              <Line
                x1={0}
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke={theme.colors.divider}
                strokeWidth={0.5}
                strokeDasharray="2,2"
              />
              <SvgText
                x={chartWidth - 5}
                y={y - 2}
                fontSize={10}
                fill={theme.colors.text}
                textAnchor="end"
              >
                {price.toFixed(2)}
              </SvgText>
            </React.Fragment>
          );
        })}
        
        {/* Candlesticks */}
        {visibleData.map((candle, index) => {
          const x = index * candleSpacing + candleSpacing / 2;
          const isUp = candle.close >= candle.open;
          
          const highY = ((maxPrice - candle.high) / priceRange) * chartHeight;
          const lowY = ((maxPrice - candle.low) / priceRange) * chartHeight;
          const openY = ((maxPrice - candle.open) / priceRange) * chartHeight;
          const closeY = ((maxPrice - candle.close) / priceRange) * chartHeight;
          
          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.abs(closeY - openY);
          
          return (
            <React.Fragment key={index}>
              {/* Wick */}
              <Line
                x1={x}
                y1={highY}
                x2={x}
                y2={lowY}
                stroke={isUp ? theme.colors.positive : theme.colors.negative}
                strokeWidth={1}
              />
              {/* Body */}
              <Rect
                x={x - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={Math.max(1, bodyHeight)}
                fill={isUp ? theme.colors.positive : theme.colors.negative}
                stroke={isUp ? theme.colors.positive : theme.colors.negative}
                strokeWidth={1}
              />
            </React.Fragment>
          );
        })}
        
        {/* Drawings */}
        {drawings.map((drawing, index) => {
          if (drawing.type === 'line' && drawing.points.length >= 2) {
            return (
              <Line
                key={index}
                x1={drawing.points[0].x}
                y1={drawing.points[0].y}
                x2={drawing.points[1].x}
                y2={drawing.points[1].y}
                stroke={drawing.color}
                strokeWidth={2}
              />
            );
          }
          return null;
        })}
        
        {/* Current drawing */}
        {currentDrawing && currentDrawing.points.length >= 2 && (
          <Line
            x1={currentDrawing.points[0].x}
            y1={currentDrawing.points[0].y}
            x2={currentDrawing.points[1].x}
            y2={currentDrawing.points[1].y}
            stroke={currentDrawing.color}
            strokeWidth={2}
            strokeDasharray="5,5"
          />
        )}
      </Svg>
    );
  };

  // Render volume chart
  const renderVolumeChart = () => {
    if (volumeData.length === 0) return null;
    
    const chartWidth = screenWidth - (showSidebar ? 80 : 20);
    const visibleCandles = Math.floor(chartWidth / (4 * zoomLevel));
    const startIndex = Math.max(0, volumeData.length - visibleCandles + Math.floor(panOffset));
    const endIndex = Math.min(volumeData.length, startIndex + visibleCandles);
    const visibleData = volumeData.slice(startIndex, endIndex);
    
    if (visibleData.length === 0) return null;
    
    const maxVolume = Math.max(...visibleData.map(d => d.volume));
    const barWidth = (chartWidth / visibleData.length) * 0.8;
    const barSpacing = chartWidth / visibleData.length;
    
    return (
      <Svg width={chartWidth} height={volumeHeight}>
        {visibleData.map((data, index) => {
          const x = index * barSpacing + barSpacing / 2;
          const barHeight = (data.volume / maxVolume) * volumeHeight * 0.9;
          const y = volumeHeight - barHeight;
          const isUp = data.close >= data.open;
          
          return (
            <Rect
              key={index}
              x={x - barWidth / 2}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={isUp ? theme.colors.positive : theme.colors.negative}
              opacity={0.7}
            />
          );
        })}
      </Svg>
    );
  };

  // Render sidebar with drawing tools
  const renderSidebar = () => {
    if (!showSidebar) return null;
    
    const tools = [
      { type: 'line' as const, icon: '📏', label: 'Line' },
      { type: 'rectangle' as const, icon: '⬜', label: 'Rectangle' },
      { type: 'circle' as const, icon: '⭕', label: 'Circle' },
      { type: 'emoji' as const, icon: '😀', label: 'Emoji' },
    ];
    
    return (
      <View style={[styles.sidebar, { backgroundColor: theme.colors.cardBackground }]}>
        <TouchableOpacity
          style={styles.sidebarCloseButton}
          onPress={() => setShowSidebar(false)}
        >
          <ThemedText>✕</ThemedText>
        </TouchableOpacity>
        
        {tools.map((tool) => (
          <TouchableOpacity
            key={tool.type}
            style={[
              styles.toolButton,
              selectedDrawingTool === tool.type && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => setSelectedDrawingTool(tool.type)}
          >
            <ThemedText style={styles.toolIcon}>{tool.icon}</ThemedText>
            <ThemedText style={styles.toolLabel}>{tool.label}</ThemedText>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={[styles.toolButton, { backgroundColor: theme.colors.negative }]}
          onPress={() => setDrawings([])}
        >
          <ThemedText style={styles.toolIcon}>🗑️</ThemedText>
          <ThemedText style={styles.toolLabel}>Clear</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  // Load data when symbol changes
  useEffect(() => {
    if (initialSymbol !== selectedSymbol) {
      setSelectedSymbol(initialSymbol);
      setSearchQuery(initialSymbol);
      setPortfolioData(prev => ({ ...prev, symbol: initialSymbol }));
    }
  }, [initialSymbol]);

  // Load data on component mount and when symbol/timeRange changes
  useEffect(() => {
    loadChartData();
    loadStockData();
  }, [selectedSymbol, timeRange]);

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
      // Fetch current stock data
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

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header with back button */}
        <View style={[styles.header, { backgroundColor: theme.colors.cardBackground }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ThemedText style={styles.backButtonText}>← Back</ThemedText>
          </TouchableOpacity>
          
          {/* Metrics */}
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <ThemedText variant="caption" style={styles.metricLabel}>Total vol</ThemedText>
              <ThemedText style={styles.metricValue}>{portfolioData.totalVolume.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.metricItem}>
              <ThemedText variant="caption" style={styles.metricLabel}>Total value</ThemedText>
              <ThemedText style={styles.metricValue}>{portfolioData.totalValue} bil</ThemedText>
            </View>
            <View style={styles.metricItem}>
              <ThemedText variant="caption" style={styles.metricLabel}>FR. buy Vol</ThemedText>
              <ThemedText style={styles.metricValue}>{portfolioData.foreignBuyVolume.toLocaleString()}</ThemedText>
            </View>
            <View style={styles.metricItem}>
              <ThemedText variant="caption" style={styles.metricLabel}>FR. sell Vol</ThemedText>
              <ThemedText style={styles.metricValue}>{portfolioData.foreignSellVolume.toLocaleString()}</ThemedText>
            </View>
          </View>
          
          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.inputBackground }]}>
            <TextInput
              style={[styles.searchInput, { color: theme.colors.inputText }]}
              placeholder="Search symbols..."
              placeholderTextColor={theme.colors.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => {
                if (searchQuery.trim()) {
                  setSelectedSymbol(searchQuery.trim().toUpperCase());
                }
              }}
            />
          </View>
          
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'Chart' && { borderBottomColor: theme.colors.primary },
              ]}
              onPress={() => setActiveTab('Chart')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === 'Chart' && { color: theme.colors.primary },
                ]}
              >
                Chart
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'Summary' && { borderBottomColor: theme.colors.primary },
              ]}
              onPress={() => setActiveTab('Summary')}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === 'Summary' && { color: theme.colors.primary },
                ]}
              >
                Summary
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chart Content */}
        {activeTab === 'Chart' && (
          <View style={styles.chartContainer}>
            {/* Chart Controls */}
            <View style={[styles.chartControls, { backgroundColor: theme.colors.cardBackground }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(['1day', '1week', '30days'] as TimeRange[]).map((range) => (
                  <TouchableOpacity
                    key={range}
                    style={[
                      styles.timeRangeButton,
                      timeRange === range && { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => setTimeRange(range)}
                  >
                    <ThemedText
                      style={[
                        styles.timeRangeText,
                        timeRange === range && { color: theme.colors.buttonText },
                      ]}
                    >
                      {range}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <TouchableOpacity
                style={[styles.drawButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setShowSidebar(!showSidebar)}
              >
                <ThemedText style={[styles.drawButtonText, { color: theme.colors.buttonText }]}>
                  ✏️ Draw
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            <View style={styles.chartsWrapper}>
              {/* Main Chart Area */}
              <GestureDetector gesture={combinedChartGesture}>
                <Animated.View style={[styles.chartArea, { height: chartHeight }]}>
                  {renderCandlestickChart()}
                </Animated.View>
              </GestureDetector>
              
              {/* Resizable Divider */}
              <GestureDetector gesture={dividerPanGesture}>
                <Animated.View style={[styles.divider, { backgroundColor: theme.colors.border }]}>
                  <View style={[styles.dividerHandle, { backgroundColor: theme.colors.text }]} />
                </Animated.View>
              </GestureDetector>
              
              {/* Volume Chart */}
              <View style={[styles.volumeArea, { height: volumeHeight }]}>
                <ThemedText variant="caption" style={styles.volumeLabel}>Volume</ThemedText>
                {renderVolumeChart()}
              </View>
            </View>
            
            {/* Sidebar */}
            {/* Chart Drawing Tool Overlay */}
            <ChartDrawingTool
              width={screenWidth - 40}
              height={chartHeight}
              theme={theme}
              showSidebar={showSidebar}
              onToggleSidebar={() => setShowSidebar(!showSidebar)}
              onDrawingsChange={(newDrawings) => {
                // Handle drawings change if needed for persistence
                console.log('Drawings updated:', newDrawings);
              }}
            />
          </View>
        )}
        
        {/* Summary Content (placeholder) */}
        {activeTab === 'Summary' && (
          <View style={styles.summaryContainer}>
            <ThemedText variant="title">Summary</ThemedText>
            <ThemedText>Summary content will be implemented later</ThemedText>
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stockInfo: {
    flex: 1,
  },
  symbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  change: {
    fontSize: 16,
    fontWeight: '600',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  searchInput: {
    height: 40,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  chartControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  drawButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  drawButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  chartsWrapper: {
    flex: 1,
    marginTop: 60, // Account for controls height
  },
  chartArea: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  divider: {
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dividerHandle: {
    width: 40,
    height: 3,
    borderRadius: 2,
    opacity: 0.5,
  },
  volumeArea: {
    backgroundColor: 'transparent',
    padding: 10,
  },
  volumeLabel: {
    marginBottom: 8,
    opacity: 0.7,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 60,
    bottom: 0,
    width: 80,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#334155',
  },
  sidebarCloseButton: {
    alignItems: 'center',
    padding: 8,
    marginBottom: 16,
  },
  toolButton: {
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
  toolIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  toolLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  summaryContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Portfoliointernal;