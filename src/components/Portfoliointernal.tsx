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

const PortfolioInternal: React.FC<PortfolioInternalProps> = () => {
  const theme = useTheme();
  const route = useRoute<PortfolioInternalRouteProp>();
  const navigation = useNavigation();
  const initialSymbol = route.params?.symbol || 'VN30';
  
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

  // Gesture handlers
  const onDividerPanGestureEvent = (event: any) => {
    const { translationY } = event;
    const newChartHeight = Math.max(100, Math.min(screenHeight * 0.6, chartHeight + translationY));
    const newVolumeHeight = Math.max(50, Math.min(screenHeight * 0.4, volumeHeight - translationY));
    
    setChartHeight(newChartHeight);
    setVolumeHeight(newVolumeHeight);
  };

  const onChartPanGestureEvent = (event: any) => {
    if (!isDrawing) {
      const { translationX } = event;
      setPanOffset(prev => Math.max(-candlestickData.length * 0.5, Math.min(0, prev + translationX * 0.01)));
    }
  };

  const onChartPinchGestureEvent = (event: any) => {
    const { scale } = event;
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev * scale)));
  };

  // Gesture setup
  const dividerPanGesture = Gesture.Pan().onUpdate(onDividerPanGestureEvent);
  const chartPanGesture = Gesture.Pan().onUpdate(onChartPanGestureEvent);
  const chartPinchGesture = Gesture.Pinch().onUpdate(onChartPinchGestureEvent);
  const combinedChartGesture = Gesture.Simultaneous(chartPanGesture, chartPinchGesture);

  // Chart rendering functions
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
              <Line
                x1={x}
                y1={highY}
                x2={x}
                y2={lowY}
                stroke={isUp ? theme.colors.positive : theme.colors.negative}
                strokeWidth={1}
              />
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
          <ThemedText style={styles.closeButtonText}>✕</ThemedText>
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

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header Section */}
        <View style={[styles.header, { backgroundColor: theme.colors.cardBackground }]}>
          {/* Top Row: Back button and Search */}
          <View style={styles.topRow}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ThemedText style={styles.backButtonText}>←</ThemedText>
            </TouchableOpacity>
            
            <View style={styles.searchRow}>
              <ThemedText style={styles.searchIcon}>🔍</ThemedText>
              <ThemedText style={styles.symbolText}>{selectedSymbol}</ThemedText>
            </View>
          </View>
          
          {/* Price Display Section */}
          <View style={styles.priceSection}>
            <View style={styles.leftPriceArea}>
              <ThemedText style={styles.mainPrice}>
                {portfolioData.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </ThemedText>
              <View style={styles.changeRow}>
                <ThemedText style={[styles.changeText, { color: portfolioData.dailyChange >= 0 ? theme.colors.positive : theme.colors.negative }]}>
                  ▲ +{portfolioData.dailyChange.toFixed(2)} +{portfolioData.dailyChangePercent.toFixed(2)}%
                </ThemedText>
              </View>
              <View style={styles.statusRow}>
                <ThemedText style={styles.statusIcon}>⏰</ThemedText>
                <ThemedText style={styles.statusText}>LO</ThemedText>
              </View>
              <View style={styles.indicatorRow}>
                <ThemedText style={[styles.indicator, { color: theme.colors.positive }]}>▲17 (0)</ThemedText>
                <ThemedText style={[styles.indicator, { color: '#FFA500' }]}>|3</ThemedText>
                <ThemedText style={[styles.indicator, { color: theme.colors.negative }]}>▼10 (0)</ThemedText>
              </View>
            </View>
            
            {/* Metrics Grid */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <ThemedText variant="caption" style={styles.metricLabel}>Total vol</ThemedText>
                  <ThemedText style={styles.metricValue}>{portfolioData.totalVolume.toLocaleString()}</ThemedText>
                </View>
              </View>
              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <ThemedText variant="caption" style={styles.metricLabel}>Total value</ThemedText>
                  <ThemedText style={styles.metricValue}>{portfolioData.totalValue} bil</ThemedText>
                </View>
              </View>
              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <ThemedText variant="caption" style={styles.metricLabel}>FR. buy Vol</ThemedText>
                  <ThemedText style={styles.metricValue}>{portfolioData.foreignBuyVolume.toLocaleString()}</ThemedText>
                </View>
              </View>
              <View style={styles.metricRow}>
                <View style={styles.metricItem}>
                  <ThemedText variant="caption" style={styles.metricLabel}>FR. sell Vol</ThemedText>
                  <ThemedText style={styles.metricValue}>{portfolioData.foreignSellVolume.toLocaleString()}</ThemedText>
                </View>
              </View>
            </View>
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
            <View style={[styles.chartsWrapper, { zIndex: 5 }]}>              
              <CandlestickBackground opacity={0.3} />
              <ChartDrawingTool
                width={screenWidth - 40}
                height={chartHeight}
                theme={theme}
                showSidebar={showDrawingSidebar}
                onToggleSidebar={() => setShowDrawingSidebar(!showDrawingSidebar)}
                onDrawingsChange={(drawings) => {
                  console.log('Drawings updated:', drawings);
                }}
              />
            </View>
            
            {/* Volume Chart */}
            <View style={[styles.volumeArea, { height: volumeHeight, zIndex: 5 }]}>
              <ThemedText variant="caption" style={styles.volumeLabel}>Volume</ThemedText>
              {renderVolumeChart()}
            </View>
          </View>
        )}
        
        {/* Summary Content */}
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  symbolText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  leftPriceArea: {
    flex: 1,
  },
  mainPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00C851',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  statusIcon: {
    fontSize: 12,
  },
  statusText: {
    fontSize: 12,
    opacity: 0.7,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  indicator: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricsGrid: {
    flex: 1,
    paddingLeft: 16,
  },
  metricRow: {
    marginBottom: 8,
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
  chartsWrapper: {
    flex: 1,
    marginTop: 40,
    position: 'relative',
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
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toolButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
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