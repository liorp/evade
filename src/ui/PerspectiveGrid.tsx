import type React from 'react';
import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { COLORS } from '../const/colors';

interface PerspectiveGridProps {
  opacity?: number;
  animated?: boolean;
}

export const PerspectiveGrid: React.FC<PerspectiveGridProps> = ({
  opacity = 0.6,
  animated = true,
}) => {
  const { width, height } = useWindowDimensions();
  const offsetY = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      offsetY.value = withRepeat(
        withTiming(40, { duration: 4000, easing: Easing.linear }),
        -1,
        false,
      );
    }
  }, [animated, offsetY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offsetY.value }],
  }));

  const horizonY = height * 0.4; // Horizon at 40% from top
  const vanishingPointX = width / 2;
  const numVerticalLines = 15;
  const numHorizontalLines = 12;

  // Generate vertical lines converging to vanishing point
  const verticalLines = [];
  for (let i = 0; i <= numVerticalLines; i++) {
    const ratio = i / numVerticalLines;
    const bottomX = ratio * width;
    const topX = vanishingPointX + (bottomX - vanishingPointX) * 0.1;
    verticalLines.push(
      <Line
        key={`v-${i}`}
        x1={bottomX}
        y1={height}
        x2={topX}
        y2={horizonY}
        stroke={COLORS.gridLines}
        strokeWidth={1}
        opacity={opacity}
      />,
    );
  }

  // Generate horizontal lines with perspective (exponential spacing)
  const horizontalLines = [];
  for (let i = 0; i <= numHorizontalLines; i++) {
    const ratio = i / numHorizontalLines;
    const y = horizonY + (height - horizonY) * ratio ** 1.5;
    const perspectiveScale = 1 - (1 - ratio) * 0.9;
    const leftX = vanishingPointX - vanishingPointX * perspectiveScale;
    const rightX = vanishingPointX + vanishingPointX * perspectiveScale;
    horizontalLines.push(
      <Line
        key={`h-${i}`}
        x1={leftX}
        y1={y}
        x2={rightX}
        y2={y}
        stroke={COLORS.gridLines}
        strokeWidth={1}
        opacity={opacity * ratio}
      />,
    );
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.gridContainer, animated && animatedStyle]}>
        <Svg width={width} height={height} style={styles.svg}>
          {verticalLines}
          {horizontalLines}
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gridContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  svg: {
    position: 'absolute',
    bottom: 0,
  },
});
