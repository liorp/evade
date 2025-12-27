import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { GAME } from '../const/game';

interface FlyingShape {
  id: number;
  type: 'circle' | 'diamond' | 'triangle';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  delay: number;
  size: number;
  color: string;
}

const SHAPE_COLORS = [
  '#ff4444', // Red
  '#ff6644', // Red-orange
  '#ff8844', // Orange
  '#ffaa44', // Yellow-orange
  '#ffcc44', // Yellow
];

const Shape: React.FC<{ shape: FlyingShape }> = ({ shape }) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Delay before starting
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0.6, { duration: 300 });
      progress.value = withRepeat(
        withTiming(1, {
          duration: shape.duration,
          easing: Easing.linear,
        }),
        -1,
        false
      );
    }, shape.delay);

    return () => clearTimeout(timeout);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const x = shape.startX + (shape.endX - shape.startX) * progress.value;
    const y = shape.startY + (shape.endY - shape.startY) * progress.value;

    // Fade in at start, fade out at end
    let fadeOpacity = opacity.value;
    if (progress.value < 0.1) {
      fadeOpacity = opacity.value * (progress.value / 0.1);
    } else if (progress.value > 0.9) {
      fadeOpacity = opacity.value * ((1 - progress.value) / 0.1);
    }

    return {
      transform: [
        { translateX: x - shape.size / 2 },
        { translateY: y - shape.size / 2 },
      ],
      opacity: fadeOpacity,
    };
  });

  if (shape.type === 'circle') {
    return (
      <Animated.View
        style={[
          styles.shapeBase,
          {
            width: shape.size,
            height: shape.size,
            borderRadius: shape.size / 2,
            backgroundColor: shape.color,
          },
          animatedStyle,
        ]}
      />
    );
  } else if (shape.type === 'diamond') {
    return (
      <Animated.View
        style={[
          styles.shapeBase,
          {
            width: shape.size,
            height: shape.size,
            borderRadius: 4,
            backgroundColor: shape.color,
            transform: [{ rotate: '45deg' }],
          },
          animatedStyle,
        ]}
      />
    );
  } else {
    // Triangle
    const triSize = shape.size / 2;
    return (
      <Animated.View
        style={[
          styles.shapeBase,
          {
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderLeftWidth: triSize,
            borderRightWidth: triSize,
            borderBottomWidth: triSize * 1.7,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: shape.color,
          },
          animatedStyle,
        ]}
      />
    );
  }
};

export const MenuBackground: React.FC = () => {
  const [shapes, setShapes] = useState<FlyingShape[]>([]);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    const generatedShapes: FlyingShape[] = [];
    const types: Array<'circle' | 'diamond' | 'triangle'> = ['circle', 'diamond', 'triangle'];
    const numShapes = 12;

    for (let i = 0; i < numShapes; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const size = 20 + Math.random() * 25;
      const color = SHAPE_COLORS[Math.floor(Math.random() * SHAPE_COLORS.length)];
      const duration = 4000 + Math.random() * 4000; // 4-8 seconds
      const delay = Math.random() * 3000;

      // Random start edge (0=top, 1=right, 2=bottom, 3=left)
      const startEdge = Math.floor(Math.random() * 4);
      let startX: number, startY: number, endX: number, endY: number;

      const margin = 50;
      const spreadFactor = 0.6; // How much the end position can vary from straight across

      switch (startEdge) {
        case 0: // Top - goes down
          startX = margin + Math.random() * (width - margin * 2);
          startY = -margin;
          endX = startX + (Math.random() - 0.5) * width * spreadFactor;
          endY = height + margin;
          break;
        case 1: // Right - goes left
          startX = width + margin;
          startY = margin + Math.random() * (height - margin * 2);
          endX = -margin;
          endY = startY + (Math.random() - 0.5) * height * spreadFactor;
          break;
        case 2: // Bottom - goes up
          startX = margin + Math.random() * (width - margin * 2);
          startY = height + margin;
          endX = startX + (Math.random() - 0.5) * width * spreadFactor;
          endY = -margin;
          break;
        default: // Left - goes right
          startX = -margin;
          startY = margin + Math.random() * (height - margin * 2);
          endX = width + margin;
          endY = startY + (Math.random() - 0.5) * height * spreadFactor;
          break;
      }

      generatedShapes.push({
        id: i,
        type,
        startX,
        startY,
        endX,
        endY,
        duration,
        delay,
        size,
        color,
      });
    }

    setShapes(generatedShapes);
  }, [width, height]);

  return (
    <View style={styles.container} pointerEvents="none">
      {shapes.map((shape) => (
        <Shape key={shape.id} shape={shape} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  shapeBase: {
    position: 'absolute',
  },
});
