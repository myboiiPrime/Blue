import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { Svg, Line, Rect, Circle, Text as SvgText } from 'react-native-svg';
import ThemedText from './ThemedText';

interface DrawingTool {
  type: 'line' | 'rectangle' | 'circle' | 'emoji';
  points: { x: number; y: number }[];
  color: string;
  emoji?: string;
}

interface ChartDrawingToolProps {
  width: number;
  height: number;
  onDrawingsChange?: (drawings: DrawingTool[]) => void;
  initialDrawings?: DrawingTool[];
  theme: any;
  showSidebar: boolean;
  onToggleSidebar: () => void;
}

const ChartDrawingTool: React.FC<ChartDrawingToolProps> = ({
  width,
  height,
  onDrawingsChange,
  initialDrawings = [],
  theme,
  showSidebar,
  onToggleSidebar
}) => {
  const [selectedDrawingTool, setSelectedDrawingTool] = useState<'line' | 'rectangle' | 'circle' | 'emoji'>('line');
  const [drawings, setDrawings] = useState<DrawingTool[]>(initialDrawings);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingTool | null>(null);

  // Handle drawing gestures
  const onDrawingPanGestureEvent = (event: any) => {
    const { x, y, state } = event;
    
    if (state === 'began') {
      if (!isDrawing) {
        setIsDrawing(true);
        const newDrawing: DrawingTool = {
          type: selectedDrawingTool,
          points: [{ x, y }],
          color: theme.colors.primary,
          emoji: selectedDrawingTool === 'emoji' ? '📈' : undefined,
        };
        setCurrentDrawing(newDrawing);
      }
    } else if (state === 'active' && currentDrawing) {
      setCurrentDrawing(prev => prev ? {
        ...prev,
        points: [prev.points[0], { x, y }]
      } : null);
    } else if (state === 'end' && currentDrawing) {
      const finalDrawing = {
        ...currentDrawing,
        points: [currentDrawing.points[0], { x, y }]
      };
      const newDrawings = [...drawings, finalDrawing];
      setDrawings(newDrawings);
      setCurrentDrawing(null);
      setIsDrawing(false);
      onDrawingsChange?.(newDrawings);
    }
  };

  const drawingPanGesture = Gesture.Pan()
    .onUpdate(onDrawingPanGestureEvent);

  const clearDrawings = () => {
    setDrawings([]);
    onDrawingsChange?.([]);
  };

  const renderDrawing = (drawing: DrawingTool, index: number, isDashed = false) => {
    if (drawing.points.length < 2) return null;

    const [point1, point2] = drawing.points;
    const strokeProps = {
      stroke: drawing.color,
      strokeWidth: 2,
      ...(isDashed && { strokeDasharray: '5,5' })
    };

    switch (drawing.type) {
      case 'line':
        return (
          <Line
            key={index}
            x1={point1.x}
            y1={point1.y}
            x2={point2.x}
            y2={point2.y}
            {...strokeProps}
          />
        );
      
      case 'rectangle':
        const rectX = Math.min(point1.x, point2.x);
        const rectY = Math.min(point1.y, point2.y);
        const rectWidth = Math.abs(point2.x - point1.x);
        const rectHeight = Math.abs(point2.y - point1.y);
        return (
          <Rect
            key={index}
            x={rectX}
            y={rectY}
            width={rectWidth}
            height={rectHeight}
            fill="transparent"
            {...strokeProps}
          />
        );
      
      case 'circle':
        const centerX = (point1.x + point2.x) / 2;
        const centerY = (point1.y + point2.y) / 2;
        const radius = Math.sqrt(
          Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
        ) / 2;
        return (
          <Circle
            key={index}
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="transparent"
            {...strokeProps}
          />
        );
      
      case 'emoji':
        return (
          <SvgText
            key={index}
            x={point2.x}
            y={point2.y}
            fontSize="20"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {drawing.emoji || '📈'}
          </SvgText>
        );
      
      default:
        return null;
    }
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
          onPress={onToggleSidebar}
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
          onPress={clearDrawings}
        >
          <ThemedText style={styles.toolIcon}>🗑️</ThemedText>
          <ThemedText style={styles.toolLabel}>Clear</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <GestureDetector gesture={drawingPanGesture}>
        <View style={{ width, height, position: 'absolute' }}>
          <Svg width={width} height={height}>
            {/* Existing drawings */}
            {drawings.map((drawing, index) => renderDrawing(drawing, index))}
            
            {/* Current drawing */}
            {currentDrawing && renderDrawing(currentDrawing, -1, true)}
          </Svg>
        </View>
      </GestureDetector>
      {renderSidebar()}
    </>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    right: 10,
    top: 50,
    width: 80,
    borderRadius: 10,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  sidebarCloseButton: {
    alignSelf: 'flex-end',
    padding: 5,
    marginBottom: 10,
  },
  toolButton: {
    alignItems: 'center',
    padding: 8,
    marginVertical: 2,
    borderRadius: 5,
  },
  toolIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  toolLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
});

export default ChartDrawingTool;