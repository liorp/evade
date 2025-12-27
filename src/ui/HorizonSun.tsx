import type React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { ClipPath, Defs, Ellipse, LinearGradient, Rect, Stop } from 'react-native-svg';
import { COLORS, GRADIENTS } from '../const/colors';

interface HorizonSunProps {
  position?: number; // 0-1, vertical position (0 = top, 1 = bottom)
  size?: number;
}

export const HorizonSun: React.FC<HorizonSunProps> = ({ position = 0.4, size = 200 }) => {
  const { width, height } = useWindowDimensions();
  const sunY = height * position;
  const bands = 8;
  const bandHeight = size / (bands * 2);

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={width} height={size} style={{ position: 'absolute', top: sunY - size / 2 }}>
        <Defs>
          <LinearGradient id="sunGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={GRADIENTS.sunBands[0]} />
            <Stop offset="0.5" stopColor={GRADIENTS.sunBands[1]} />
            <Stop offset="1" stopColor={GRADIENTS.sunBands[2]} />
          </LinearGradient>
          <ClipPath id="sunClip">
            <Ellipse cx={width / 2} cy={size / 2} rx={size / 2} ry={size / 2} />
          </ClipPath>
        </Defs>

        {/* Sun base with gradient */}
        <Ellipse
          cx={width / 2}
          cy={size / 2}
          rx={size / 2}
          ry={size / 2}
          fill="url(#sunGradient)"
        />

        {/* Horizontal bands (black stripes) clipped to sun */}
        {Array.from({ length: bands }, (_, i) => (
          <Rect
            key={i}
            x={0}
            y={size / 2 + i * bandHeight * 2}
            width={width}
            height={bandHeight}
            fill={COLORS.backgroundDeep}
            clipPath="url(#sunClip)"
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
