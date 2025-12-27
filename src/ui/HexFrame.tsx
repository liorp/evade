import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { COLORS } from '../const/colors';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

interface HexFrameProps {
  children: React.ReactNode;
  width: number;
  height: number;
  color?: 'cyan' | 'magenta' | 'purple';
  glowPulse?: boolean;
  style?: ViewStyle;
}

const FRAME_COLORS = {
  cyan: COLORS.neonCyan,
  magenta: COLORS.neonMagenta,
  purple: COLORS.neonPurple,
};

export const HexFrame: React.FC<HexFrameProps> = ({
  children,
  width,
  height,
  color = 'purple',
  glowPulse = false,
  style,
}) => {
  const strokeColor = FRAME_COLORS[color];
  const glowOpacity = useSharedValue(0.6);

  React.useEffect(() => {
    if (glowPulse) {
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true
      );
    } else {
      cancelAnimation(glowOpacity);
      glowOpacity.value = 0.6;
    }
  }, [glowPulse, glowOpacity]);

  // Create hexagonal-ish frame points (cut corners)
  const cornerSize = 16;
  const points = `
    ${cornerSize},0
    ${width - cornerSize},0
    ${width},${cornerSize}
    ${width},${height - cornerSize}
    ${width - cornerSize},${height}
    ${cornerSize},${height}
    0,${height - cornerSize}
    0,${cornerSize}
  `;

  const animatedProps = useAnimatedProps(() => ({
    strokeOpacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.container, { width, height }, style]}>
      <View style={styles.background}>
        {children}
      </View>
      <Svg
        width={width}
        height={height}
        style={styles.frame}
        pointerEvents="none"
      >
        <AnimatedPolygon
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          animatedProps={animatedProps}
        />
        {/* Inner glow line */}
        <Polygon
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1}
          opacity={0.3}
          transform={`translate(2, 2) scale(${(width - 4) / width}, ${(height - 4) / height})`}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backgroundPanel,
    margin: 1,
  },
  frame: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
