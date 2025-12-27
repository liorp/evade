import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';
import { COLORS } from '../../const/colors';

interface HaloProps {
  size: number;
  x: number;
  y: number;
  rotationDirection: 1 | -1;
  opacity?: number;
}

const Hexagon: React.FC<{ size: number; stroke: string; opacity: number }> = ({
  size,
  stroke,
  opacity,
}) => {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = size / 2 + (size / 2 - 2) * Math.cos(angle);
    const y = size / 2 + (size / 2 - 2) * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  return (
    <Svg width={size} height={size}>
      <Polygon
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1}
        opacity={opacity}
      />
    </Svg>
  );
};

const Halo: React.FC<HaloProps> = ({ size, x, y, rotationDirection, opacity = 0.3 }) => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360 * rotationDirection, {
        duration: 60000, // 60 seconds for full rotation
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [rotation, rotationDirection]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.halo,
        { left: x - size / 2, top: y - size / 2, width: size, height: size },
        animatedStyle,
      ]}
    >
      {/* Outer ring */}
      <Hexagon size={size} stroke={COLORS.neonPurple} opacity={opacity} />
      {/* Middle ring */}
      <View style={styles.innerHalo}>
        <Hexagon size={size * 0.7} stroke={COLORS.neonPurple} opacity={opacity * 0.7} />
      </View>
      {/* Inner ring */}
      <View style={styles.innermostHalo}>
        <Hexagon size={size * 0.4} stroke={COLORS.neonPurple} opacity={opacity * 0.5} />
      </View>
    </Animated.View>
  );
};

interface GeometricHalosProps {
  variant?: 'menu' | 'centered';
}

export const GeometricHalos: React.FC<GeometricHalosProps> = ({ variant = 'menu' }) => {
  const { width, height } = useWindowDimensions();

  if (variant === 'menu') {
    return (
      <View style={styles.container} pointerEvents="none">
        <Halo size={300} x={width * 0.15} y={height * 0.25} rotationDirection={1} opacity={0.2} />
        <Halo size={280} x={width * 0.85} y={height * 0.28} rotationDirection={-1} opacity={0.2} />
      </View>
    );
  }

  // centered variant
  return (
    <View style={styles.container} pointerEvents="none">
      <Halo size={350} x={width / 2} y={height * 0.35} rotationDirection={1} opacity={0.15} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  halo: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerHalo: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innermostHalo: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
