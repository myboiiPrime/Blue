import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { marketAnalyticsService, MarketDataDto } from '../services/api';

const { width } = Dimensions.get('window');

interface MarketIndex {
  name: string;
  value: string;
  volume: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}

interface BuySellData {
  symbol: string;
  type: 'B' | 'S';
  volume: string;
  price: string;
  percent: string;
  isPositive: boolean;
}

interface IndustryData {
  name: string;
  percent: string;
  isPositive: boolean;
  size: number;
}

interface ImpactStock {
  symbol: string;
  impact: number;
  isPositive: boolean;
}

export default function MarketScreen() {
  const [activeTab, setActiveTab] = useState('Snapshot');
  const [refreshing, setRefreshing] = useState(false);
  const [stocksSubTab, setStocksSubTab] = useState('Movers');
  const [timeFilter, setTimeFilter] = useState('Today');
  const [marketData, setMarketData] = useState<MarketDataDto | null>(null);
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([
    {
      name: 'VNINDEX',
      value: '1,381.77',
      volume: '6.7K bil',
      change: '-0.19',
      changePercent: '-0.01%',
      isPositive: false,
    },
    {
      name: 'VN30',
      value: '1,479.43',
      volume: '2.3K bil',
      change: '-1.77',
      changePercent: '-0.12%',
      isPositive: false,
    },
    {
      name: 'HNX',
      value: '57',
      volume: '57',
      change: '-1.77',
      changePercent: '-0.12%',
      isPositive: false,
    },
  ]);

  const [buySellData, setBuySellData] = useState<BuySellData[]>([
    { symbol: 'HHS', type: 'B', volume: '20,000', price: '16.00', percent: '5.26%', isPositive: true },
    { symbol: 'NVL', type: 'S', volume: '24,100', price: '15.35', percent: '3.02%', isPositive: true },
    { symbol: 'VPB', type: 'B', volume: '46,100', price: '18.70', percent: '0.27%', isPositive: true },
    { symbol: 'VPB', type: 'B', volume: '16,000', price: '18.70', percent: '0.27%', isPositive: true },
    { symbol: 'VPB', type: 'B', volume: '15,700', price: '18.70', percent: '0.27%', isPositive: true },
  ]);

  const [industryData, setIndustryData] = useState<IndustryData[]>([
    { name: 'Real Estate', percent: '-0.55%', isPositive: false, size: 40 },
    { name: 'Financial Services', percent: '+0.43%', isPositive: true, size: 35 },
    { name: 'Banks', percent: '+0.13%', isPositive: true, size: 25 },
    { name: 'Technology', percent: '+1.08%', isPositive: true, size: 20 },
    { name: 'Food & Beverage', percent: '+0.02%', isPositive: true, size: 15 },
    { name: 'Construction & Materials', percent: '+0.82%', isPositive: true, size: 15 },
    { name: 'Basic Resources', percent: '+0.12%', isPositive: true, size: 12 },
    { name: 'Industrial Goods', percent: '+0.04%', isPositive: true, size: 10 },
    { name: 'Chemicals', percent: '-0.68%', isPositive: false, size: 8 },
    { name: 'Automobiles', percent: '+2.5%', isPositive: true, size: 8 },
  ]);

  const [impactStocks, setImpactStocks] = useState<ImpactStock[]>([
    { symbol: 'VIC', impact: -1.2, isPositive: false },
    { symbol: 'VHM', impact: -0.8, isPositive: false },
    { symbol: 'VPL', impact: -0.6, isPositive: false },
    { symbol: 'GVR', impact: -0.5, isPositive: false },
    { symbol: 'BCM', impact: -0.4, isPositive: false },
    { symbol: 'MSN', impact: -0.3, isPositive: false },
    { symbol: 'STB', impact: -0.2, isPositive: false },
    { symbol: 'GEE', impact: -0.1, isPositive: false },
    { symbol: 'VNM', impact: 0.1, isPositive: true },
    { symbol: 'DGC', impact: 0.2, isPositive: true },
  ]);

  const [stocksData, setStocksData] = useState([
    { symbol: 'TTF', price: '2.93', change: '6.93%', volume: '4,350,600', isPositive: true },
    { symbol: 'DLG', price: '2.63', change: '6.91%', volume: '3,771,900', isPositive: true },
    { symbol: 'PTL', price: '2.80', change: '6.87%', volume: '117,400', isPositive: true },
    { symbol: 'TCH', price: '21.10', change: '6.57%', volume: '8,161,300', isPositive: true },
    { symbol: 'TVT', price: '16.40', change: '6.49%', volume: '100', isPositive: true },
  ]);

  const [topVolumeData, setTopVolumeData] = useState([
    { symbol: 'VIX', price: '14.55', change: '0.40', percent: '2.83%', volume: '28,080,900', isPositive: true },
    { symbol: 'DIG', price: '18.55', change: '0.90', percent: '5.10%', volume: '18,651,400', isPositive: true },
    { symbol: 'PDR', price: '18.70', change: '0.85', percent: '4.76%', volume: '14,094,500', isPositive: true },
    { symbol: 'LDG', price: '3.68', change: '0.21', percent: '6.05%', volume: '12,664,800', isPositive: true },
    { symbol: 'NVL', price: '15.40', change: '0.50', percent: '3.36%', volume: '11,916,100', isPositive: true },
  ]);

  const [moversData, setMoversData] = useState([
    { symbol: 'FRT', price: '189.50', change: '3.50', volume: '193,200', isPositive: true },
    { symbol: 'VTP', price: '120.30', change: '2.90', volume: '731,400', isPositive: true },
    { symbol: 'TDM', price: '58.40', change: '1.70', volume: '100', isPositive: true },
    { symbol: 'DPG', price: '44.80', change: '1.50', volume: '940,800', isPositive: true },
    { symbol: 'TCH', price: '21.10', change: '1.30', volume: '8,161,300', isPositive: true },
  ]);

  const tabs = ['Snapshot', 'Stocks', 'Industries', 'Indices'];

  const loadMarketData = async () => {
    setIsLoadingMarketData(true);
    try {
      const response = await marketAnalyticsService.getMarketData();
      setMarketData(response.data);
    } catch (error) {
      console.error('Error loading market data:', error);
    } finally {
      setIsLoadingMarketData(false);
    }
  };

  useEffect(() => {
    loadMarketData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderMiniChart = (isPositive: boolean) => {
    // Simple mini chart using SVG-like path with View components
    const chartData = isPositive 
      ? [20, 25, 15, 30, 35, 25, 40, 45, 35, 50]
      : [50, 45, 55, 40, 35, 45, 30, 25, 35, 20];
    
    return (
      <View style={styles.miniChartContainer}>
        {chartData.map((height, index) => (
          <View
            key={index}
            style={[
              styles.chartBar,
              {
                height: height / 2,
                backgroundColor: isPositive ? '#10B981' : '#EF4444',
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderNetFlowChart = () => {
    // Custom net flow chart implementation
    const chartHeight = 150;
    const chartWidth = width - 80;
    const dataPoints = [
      { value: 73, isPositive: true },
      { value: 85, isPositive: true },
      { value: 90, isPositive: true },
      { value: 75, isPositive: true },
      { value: 60, isPositive: true },
      { value: 45, isPositive: true },
      { value: 30, isPositive: true },
      { value: -20, isPositive: false },
      { value: -45, isPositive: false },
      { value: -73, isPositive: false },
      { value: -90, isPositive: false },
      { value: -109, isPositive: false },
      { value: -146, isPositive: false },
      { value: -120, isPositive: false },
      { value: -100, isPositive: false },
    ];

    return (
      <View style={[styles.netFlowChartContainer, { height: chartHeight }]}>
        <View style={styles.chartGrid}>
          {/* Y-axis labels */}
          <View style={styles.yAxisLabels}>
            <Text style={styles.axisLabel}>146.0</Text>
            <Text style={styles.axisLabel}>109.5</Text>
            <Text style={styles.axisLabel}>73.0</Text>
            <Text style={styles.axisLabel}>36.5</Text>
            <Text style={styles.axisLabel}>0</Text>
            <Text style={styles.axisLabel}>-36.5</Text>
            <Text style={styles.axisLabel}>-73.0</Text>
            <Text style={styles.axisLabel}>-109.5</Text>
            <Text style={styles.axisLabel}>-146.0</Text>
            <Text style={styles.axisLabel}>-182.5</Text>
          </View>
          
          {/* Chart area */}
          <View style={styles.chartArea}>
            <View style={styles.zeroLine} />
            {dataPoints.map((point, index) => {
              const normalizedHeight = Math.abs(point.value) / 146 * (chartHeight / 2);
              const isAboveZero = point.value >= 0;
              
              return (
                <View
                  key={index}
                  style={[
                    styles.chartPoint,
                    {
                      height: normalizedHeight,
                      backgroundColor: point.isPositive ? '#10B981' : '#EF4444',
                      bottom: isAboveZero ? chartHeight / 2 : chartHeight / 2 - normalizedHeight,
                      left: (index / (dataPoints.length - 1)) * (chartWidth - 40),
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
        
        {/* X-axis time labels */}
        <View style={styles.xAxisLabels}>
          <Text style={styles.timeLabel}>09:00</Text>
          <Text style={styles.timeLabel}>09:20</Text>
          <Text style={styles.timeLabel}>09:24</Text>
          <Text style={styles.timeLabel}>09:28</Text>
          <Text style={styles.timeLabel}>09:33</Text>
          <Text style={styles.timeLabel}>09:37</Text>
          <Text style={styles.timeLabel}>09:41</Text>
          <Text style={styles.timeLabel}>09:46</Text>
          <Text style={styles.timeLabel}>09:50</Text>
          <Text style={styles.timeLabel}>09:54</Text>
          <Text style={styles.timeLabel}>09:59</Text>
          <Text style={styles.timeLabel}>10:03</Text>
          <Text style={styles.timeLabel}>10:07</Text>
          <Text style={styles.timeLabel}>10:12</Text>
          <Text style={styles.timeLabel}>10:16</Text>
          <Text style={styles.timeLabel}>10:20</Text>
          <Text style={styles.timeLabel}>10:25</Text>
          <Text style={styles.timeLabel}>10:29</Text>
          <Text style={styles.timeLabel}>10:33</Text>
          <Text style={styles.timeLabel}>10:37</Text>
        </View>
      </View>
    );
  };

  const renderMarketIndices = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.indicesContainer}>
      {marketIndices.map((index, i) => (
        <View key={i} style={styles.indexCard}>
          <View style={styles.indexHeader}>
            <Text style={styles.indexName}>{index.name}</Text>
            <Text style={[styles.indexValue, { color: index.isPositive ? '#10B981' : '#EF4444' }]}>
              {index.value}
            </Text>
          </View>
          <Text style={styles.indexVolume}>{index.volume}</Text>
          <Text style={[styles.indexChange, { color: index.isPositive ? '#10B981' : '#EF4444' }]}>
            {index.change} {index.changePercent}
          </Text>
          {renderMiniChart(index.isPositive)}
        </View>
      ))}
    </ScrollView>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderNetFlow = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Net Flow</Text>
        <View style={styles.helpIcon}>
          <Text style={styles.helpText}>?</Text>
        </View>
      </View>
      <View style={styles.netFlowLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Net Flow &lt; 0: Positive signal</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Net Flow &lt; 0: Negative signal</Text>
        </View>
      </View>
      <View style={styles.timeSelector}>
        {['T', 'T-1', 'T-2', 'T-3', 'T-4'].map((time, index) => (
          <TouchableOpacity key={time} style={[styles.timeButton, index === 0 && styles.activeTimeButton]}>
            <Text style={[styles.timeButtonText, index === 0 && styles.activeTimeButtonText]}>
              {time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.chartContainer}>
        <Text style={styles.chartLabel}>Billion VND</Text>
        {renderNetFlowChart()}
      </View>
    </View>
  );

  const renderMarketCashFlow = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Market cash in/out</Text>
        <View style={styles.helpIcon}>
          <Text style={styles.helpText}>?</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.moreButton}>More</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>Symbol</Text>
        <Text style={styles.tableHeaderText}>B/S</Text>
        <Text style={styles.tableHeaderText}>Volume</Text>
        <Text style={styles.tableHeaderText}>Price</Text>
        <Text style={styles.tableHeaderText}>%</Text>
      </View>
      {buySellData.map((item, index) => (
        <View key={index} style={styles.tableRow}>
          <Text style={[styles.symbolText, { color: '#10B981' }]}>{item.symbol}</Text>
          <Text style={[styles.typeText, { color: item.type === 'B' ? '#10B981' : '#EF4444' }]}>
            {item.type}
          </Text>
          <Text style={styles.volumeText}>{item.volume}</Text>
          <Text style={[styles.priceText, { color: '#10B981' }]}>{item.price}</Text>
          <Text style={[styles.percentText, { color: '#10B981' }]}>{item.percent}</Text>
        </View>
      ))}
    </View>
  );

  const renderIndustryHeatmap = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Industry Heatmap</Text>
      <View style={styles.heatmapSelector}>
        {['Buy Volume', 'FR.Sell Volume', 'Value', 'Volume', 'Market Cap'].map((option, index) => (
          <TouchableOpacity key={option} style={[styles.heatmapOption, index === 2 && styles.activeHeatmapOption]}>
            <Text style={[styles.heatmapOptionText, index === 2 && styles.activeHeatmapOptionText]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.heatmapGrid}>
        {industryData.map((industry, index) => (
          <View
            key={index}
            style={[
              styles.heatmapCell,
              {
                backgroundColor: industry.isPositive ? '#10B981' : '#EF4444',
                opacity: 0.7 + (industry.size / 100) * 0.3,
                width: `${Math.max(industry.size, 15)}%`,
                height: Math.max(industry.size * 2, 40),
              },
            ]}
          >
            <Text style={styles.heatmapCellText}>{industry.name}</Text>
            <Text style={styles.heatmapCellPercent}>{industry.percent}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMajorImpactStocks = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Major impact stocks in the index</Text>
        <View style={styles.helpIcon}>
          <Text style={styles.helpText}>?</Text>
        </View>
      </View>
      <View style={styles.indexSelector}>
        {['VNINDEX', 'VN30', 'HNX', 'HNX30', 'UPCOM', 'VN100'].map((index, i) => (
          <TouchableOpacity key={index} style={[styles.indexOption, i === 0 && styles.activeIndexOption]}>
            <Text style={[styles.indexOptionText, i === 0 && styles.activeIndexOptionText]}>
              {index}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.impactChart}>
        {impactStocks.map((stock, index) => (
          <View key={index} style={styles.impactRow}>
            <Text style={styles.impactSymbol}>{stock.symbol}</Text>
            <View style={styles.impactBar}>
              <View
                style={[
                  styles.impactBarFill,
                  {
                    backgroundColor: stock.isPositive ? '#10B981' : '#EF4444',
                    width: `${Math.abs(stock.impact) * 50}%`,
                    marginLeft: stock.isPositive ? '50%' : `${50 - Math.abs(stock.impact) * 50}%`,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
      <View style={styles.impactScale}>
        <Text style={styles.scaleText}>-1.08</Text>
        <Text style={styles.scaleText}>0</Text>
        <Text style={styles.scaleText}>1.08</Text>
      </View>
    </View>
  );

  const renderStocksTab = () => {
    return (
      <View>
        <View style={styles.subTabContainer}>
          {['Movers', 'Shakers'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.subTab, stocksSubTab === tab && styles.activeSubTab]}
              onPress={() => setStocksSubTab(tab)}
            >
              <Text style={[styles.subTabText, stocksSubTab === tab && styles.activeSubTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.moreButton}>
            <Text style={styles.moreButtonText}>More</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeFilterContainer}>
          {['Today', '1 week', '1 month', '3 months', '6 mo'].map((time) => (
            <TouchableOpacity
              key={time}
              style={[styles.timeFilter, timeFilter === time && styles.activeTimeFilter]}
              onPress={() => setTimeFilter(time)}
            >
              <Text style={[styles.timeFilterText, timeFilter === time && styles.activeTimeFilterText]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.exchangeSelector}>
            <Text style={styles.exchangeSelectorText}>HOSE ▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.stocksTableHeader}>
            <Text style={styles.tableHeaderText}>Symbol</Text>
            <Text style={styles.tableHeaderText}>Price</Text>
            <Text style={styles.tableHeaderText}>%</Text>
            <Text style={styles.tableHeaderText}>Total vol</Text>
          </View>
          {stocksData.map((stock, index) => (
            <View key={index} style={styles.stockRow}>
              <Text style={[styles.stockSymbol, { color: stock.isPositive ? '#E91E63' : '#10B981' }]}>
                {stock.symbol}
              </Text>
              <Text style={styles.stockPrice}>{stock.price}</Text>
              <Text style={[styles.stockChange, { color: stock.isPositive ? '#E91E63' : '#EF4444' }]}>
                {stock.change}
              </Text>
              <Text style={styles.stockVolume}>{stock.volume}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Volume</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Text style={styles.moreButtonText}>More</Text>
          </TouchableOpacity>
          
          <View style={styles.timeFilterContainer}>
            {['Today', '1 week', '1 month', '3 months', '6 mo'].map((time) => (
              <TouchableOpacity
                key={time}
                style={[styles.timeFilter, timeFilter === time && styles.activeTimeFilter]}
                onPress={() => setTimeFilter(time)}
              >
                <Text style={[styles.timeFilterText, timeFilter === time && styles.activeTimeFilterText]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.exchangeSelector}>
              <Text style={styles.exchangeSelectorText}>HOSE ▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.topVolumeTableHeader}>
            <Text style={styles.tableHeaderText}>Symbol</Text>
            <Text style={styles.tableHeaderText}>Price</Text>
            <Text style={styles.tableHeaderText}>+/-</Text>
            <Text style={styles.tableHeaderText}>%</Text>
            <Text style={styles.tableHeaderText}>Total vol</Text>
          </View>
          {topVolumeData.map((stock, index) => (
            <View key={index} style={[styles.stockRow, index % 2 === 0 && styles.highlightedRow]}>
              <Text style={[styles.stockSymbol, { color: '#10B981' }]}>
                {stock.symbol}
              </Text>
              <Text style={styles.stockPrice}>{stock.price}</Text>
              <Text style={[styles.stockChange, { color: '#10B981' }]}>
                {stock.change}
              </Text>
              <Text style={[styles.stockPercent, { color: '#10B981' }]}>
                {stock.percent}
              </Text>
              <Text style={styles.stockVolume}>{stock.volume}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.subTabContainer}>
            <Text style={styles.sectionTitle}>Top Gainers</Text>
            <Text style={styles.sectionTitle}>Top Losers</Text>
            <TouchableOpacity style={styles.moreButton}>
              <Text style={styles.moreButtonText}>More</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.timeFilterContainer}>
            {['Today', '1 week', '1 month', '3 months', '6 mo'].map((time) => (
              <TouchableOpacity
                key={time}
                style={[styles.timeFilter, timeFilter === time && styles.activeTimeFilter]}
                onPress={() => setTimeFilter(time)}
              >
                <Text style={[styles.timeFilterText, timeFilter === time && styles.activeTimeFilterText]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.exchangeSelector}>
              <Text style={styles.exchangeSelectorText}>HOSE ▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gainersTableHeader}>
            <Text style={styles.tableHeaderText}>Symbol</Text>
            <Text style={styles.tableHeaderText}>Price</Text>
            <Text style={styles.tableHeaderText}>+/-</Text>
            <Text style={styles.tableHeaderText}>Total vol</Text>
          </View>
          {moversData.map((stock, index) => (
            <View key={index} style={styles.stockRow}>
              <Text style={[styles.stockSymbol, { color: '#10B981' }]}>
                {stock.symbol}
              </Text>
              <Text style={styles.stockPrice}>{stock.price}</Text>
              <Text style={[styles.stockChange, { color: '#10B981' }]}>
                {stock.change}
              </Text>
              <Text style={styles.stockVolume}>{stock.volume}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderIndustriesTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Industries Performance</Text>
      {industryData.map((industry, index) => (
        <View key={index} style={styles.industryRow}>
          <Text style={styles.industryName}>{industry.name}</Text>
          <Text style={[styles.industryPercent, { color: industry.isPositive ? '#10B981' : '#EF4444' }]}>
            {industry.percent}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderIndicesTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Market Indices</Text>
      {marketIndices.map((index, i) => (
        <View key={i} style={styles.indexRow}>
          <View>
            <Text style={styles.indexRowName}>{index.name}</Text>
            <Text style={styles.indexRowVolume}>{index.volume}</Text>
          </View>
          <View style={styles.indexRowRight}>
            <Text style={[styles.indexRowValue, { color: index.isPositive ? '#10B981' : '#EF4444' }]}>
              {index.value}
            </Text>
            <Text style={[styles.indexRowChange, { color: index.isPositive ? '#10B981' : '#EF4444' }]}>
              {index.change} {index.changePercent}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.userIcon} />
          <View style={styles.searchContainer}>
            <Text style={styles.searchPlaceholder}>Search</Text>
          </View>
          <View style={styles.headerIcons}>
            <View style={styles.icon} />
            <View style={styles.icon} />
            <View style={styles.icon} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {renderMarketIndices()}
        {renderTabs()}
        {activeTab === 'Snapshot' && (
          <>
            {renderNetFlow()}
            {renderMarketCashFlow()}
            {renderIndustryHeatmap()}
            {renderMajorImpactStocks()}
          </>
        )}
        {activeTab === 'Stocks' && renderStocksTab()}
        {activeTab === 'Industries' && renderIndustriesTab()}
        {activeTab === 'Indices' && renderIndicesTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#F1F5F9',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#64748B',
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: 15,
    backgroundColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchPlaceholder: {
    color: '#64748B',
    fontSize: 16,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#64748B',
  },
  content: {
    flex: 1,
  },
  indicesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  indexCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  indexHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  indexName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  indexValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  indexVolume: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  indexChange: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  miniChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 30,
    marginTop: 8,
    gap: 1,
  },
  chartBar: {
    width: 2,
    borderRadius: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 16,
    color: '#64748B',
  },
  activeTabText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },
  helpIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 12,
    color: '#64748B',
    marginLeft: 10,
  },
  helpText: {
    fontSize: 12,
    color: '#64748B',
  },
  moreButton: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  netFlowLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
  },
  timeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  activeTimeButton: {
    backgroundColor: '#3B82F6',
  },
  timeButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
  activeTimeButtonText: {
    color: '#FFFFFF',
  },
  chartContainer: {
    height: 200,
  },
  chartLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  netFlowChartContainer: {
    position: 'relative',
  },
  chartGrid: {
    flexDirection: 'row',
    flex: 1,
  },
  yAxisLabels: {
    justifyContent: 'space-between',
    paddingRight: 10,
    width: 50,
  },
  axisLabel: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
  },
  zeroLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  chartPoint: {
    position: 'absolute',
    width: 3,
    borderRadius: 1,
  },
  xAxisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 50,
  },
  timeLabel: {
    fontSize: 8,
    color: '#64748B',
    transform: [{ rotate: '-45deg' }],
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 10,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
    flex: 1,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
  },
  symbolText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  volumeText: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  percentText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  heatmapSelector: {
    flexDirection: 'row',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  heatmapOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  activeHeatmapOption: {
    backgroundColor: '#3B82F6',
  },
  heatmapOptionText: {
    fontSize: 12,
    color: '#64748B',
  },
  activeHeatmapOptionText: {
    color: '#FFFFFF',
  },
  heatmapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  heatmapCell: {
    borderRadius: 4,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  heatmapCellText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  heatmapCellPercent: {
    fontSize: 9,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 2,
  },
  indexSelector: {
    flexDirection: 'row',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  indexOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  activeIndexOption: {
    backgroundColor: '#3B82F6',
  },
  indexOptionText: {
    fontSize: 12,
    color: '#64748B',
  },
  activeIndexOptionText: {
    color: '#FFFFFF',
  },
  impactChart: {
    marginBottom: 15,
  },
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  impactSymbol: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    width: 40,
  },
  impactBar: {
    flex: 1,
    height: 20,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    marginLeft: 10,
    position: 'relative',
  },
  impactBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  impactScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
  },
  scaleText: {
    fontSize: 12,
    color: '#64748B',
  },
  subTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  subTab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  activeSubTab: {
    backgroundColor: '#3B82F6',
  },
  subTabText: {
    fontSize: 14,
    color: '#64748B',
  },
  activeSubTabText: {
    color: '#FFFFFF',
  },
  moreButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  timeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  timeFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  activeTimeFilter: {
    backgroundColor: '#3B82F6',
  },
  timeFilterText: {
    fontSize: 12,
    color: '#64748B',
  },
  activeTimeFilterText: {
    color: '#FFFFFF',
  },
  exchangeSelector: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    marginLeft: 'auto',
  },
  exchangeSelectorText: {
    fontSize: 12,
    color: '#64748B',
  },
  stocksTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 10,
  },
  topVolumeTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 10,
  },
  gainersTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 10,
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
  },
  highlightedRow: {
    backgroundColor: '#F8FAFC',
  },
  stockSymbol: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  stockPrice: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
    textAlign: 'center',
  },
  stockChange: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  stockPercent: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  stockVolume: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
    textAlign: 'center',
  },
  industryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    alignItems: 'center',
  },
  industryName: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  industryPercent: {
    fontSize: 14,
    fontWeight: '500',
  },
  indexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  indexRowName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  indexRowVolume: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  indexRowRight: {
    alignItems: 'flex-end',
  },
  indexRowValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  indexRowChange: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});