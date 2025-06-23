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
import  Emoji  from "react-native-emoji";
import ThemedText from './ThemedText';
import EmojiPicker from './EmojiPicker';


interface DrawingTool {
  type: 'line' | 'rectangle' | 'circle' | 'emoji';
  points: { x: number; y: number }[];
  color: string;
  emoji?: string;
  startX?: number;
  startY?: number;
}

interface ChartDrawingToolProps {
  width: number;
  height: number;
  onDrawingsChange?: (drawings: DrawingTool[]) => void;
  initialDrawings?: DrawingTool[];
  theme: any;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  style?: any; // Add this line
}

const ChartDrawingTool: React.FC<ChartDrawingToolProps> = ({
  width,
  height,
  onDrawingsChange,
  initialDrawings = [],
  theme,
  showSidebar,
  onToggleSidebar,
  style // Add this
}) => {
  const [selectedDrawingTool, setSelectedDrawingTool] = useState<'line' | 'rectangle' | 'circle' | 'emoji' | null>(null);
  const [drawings, setDrawings] = useState<DrawingTool[]>(initialDrawings);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingTool | null>(null);
  
  // Add these missing state variables
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [currentEmojiName, setCurrentEmojiName] = useState<string>('chart_with_upwards_trend');

  // Add the missing handleEmojiSelect function
  const handleEmojiSelect = (emojiName: string) => {
    setCurrentEmojiName(emojiName);
    setSelectedDrawingTool('emoji');
  };

  const drawingPanGesture = Gesture.Pan()
    .onBegin((event) => {
      if (!selectedDrawingTool) return;
      
      // Adjust coordinates to account for container offsets
      const { x, y } = event;
      const adjustedX = x;
      const adjustedY = y; // Remove any container margin/padding offsets
      
      setIsDrawing(true);
      const newDrawing: DrawingTool = {
        type: selectedDrawingTool,
        points: [{ x: adjustedX, y: adjustedY }],
        color: theme.colors.primary,
        emoji: selectedDrawingTool === 'emoji' ? currentEmojiName : undefined,
      };
      setCurrentDrawing(newDrawing);
    })
    .onUpdate((event) => {
      if (currentDrawing) {
        const { x, y } = event;
        const adjustedX = x;
        const adjustedY = y;
        
        setCurrentDrawing(prev => prev ? {
          ...prev,
          points: [prev.points[0], { x: adjustedX, y: adjustedY }]
        } : null);
      }
    })
    .onEnd((event) => {
      if (currentDrawing) {
        const { x, y } = event;
        const adjustedX = x;
        const adjustedY = y;
        
        const finalDrawing = {
          ...currentDrawing,
          points: [currentDrawing.points[0], { x: adjustedX, y: adjustedY }]
        };
        const newDrawings = [...drawings, finalDrawing];
        setDrawings(newDrawings);
        setCurrentDrawing(null);
        setIsDrawing(false);
        onDrawingsChange?.(newDrawings);
      }
    });

  const clearDrawings = () => {
    setDrawings([]);
    setSelectedDrawingTool(null); // Reset to no tool selected
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
          <foreignObject
            key={index}
            x={point2.x - 15}
            y={point2.y - 15}
            width="30"
            height="30"
          >
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 30, height: 30 }}>
              <Emoji name={drawing.emoji || 'chart_with_upwards_trend'} style={{ fontSize: 20 }} />
            </View>
          </foreignObject>
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
        // Around line 208:
        <TouchableOpacity
          style={styles.sidebarCloseButton}
          onPress={onToggleSidebar}
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
            onPress={() => {
              if (tool.type === 'emoji') {
                setShowEmojiPicker(true);
              } else {
                setSelectedDrawingTool(tool.type);
              }
            }}
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

  // Update the main container to be transparent and properly positioned:
  return (
    <>
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'transparent' }]}>
        <GestureDetector gesture={drawingPanGesture}>
          <Svg width={width} height={height} style={{ backgroundColor: 'transparent' }}>
            {/* Render drawings */}
            {drawings.filter(d => d.type !== 'emoji').map((drawing, index) => renderDrawing(drawing, index))}
            
            {/* Current drawing */}
            {currentDrawing && currentDrawing.type !== 'emoji' && renderDrawing(currentDrawing, -1, true)}
          </Svg>
        </GestureDetector>
        
        {/* Render emojis with higher z-index */}
        {drawings
          .filter(drawing => drawing.type === 'emoji')
          .map((drawing, index) => (
            <View
              key={index}
              style={[
                styles.emojiContainer,
                {
                  left: (drawing.points[0]?.x || 0) - 15,
                  top: (drawing.points[0]?.y || 0) - 15,
                  zIndex: 3,
                },
              ]}
            >
              <Emoji name={drawing.emoji || 'chart_with_upwards_trend'} style={{ fontSize: 20 }} />
            </View>
          ))}
      </View>
      
      {renderSidebar()}
      
      <EmojiPicker
        isVisible={showEmojiPicker}
        onClose={() => setShowEmojiPicker(false)}
        onEmojiSelect={handleEmojiSelect}
      />
    </>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    padding: 8,
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
  emojiPreview: {
    alignItems: 'center',
  },
  emojiIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  
  emojiLabel: {
    fontSize: 10,
  },
  emojiContainer: {
    position: 'absolute',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Add to StyleSheet:
  closeButtonText: {
  fontSize: 16,
  fontWeight: 'bold',
  },
});

export default ChartDrawingTool;