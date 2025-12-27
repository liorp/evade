import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { GAME } from '../const/game';
import { SpeedTier } from '../game/types';

interface EnemyProps {
  x: number;
  y: number;
  speedTier: SpeedTier;
  ttlPercent: number; // 0 to 1, where 1 is full TTL
  isNew?: boolean;
}

// Color interpolation based on TTL
// Full TTL (1.0): Red (#ff4444)
// Half TTL (0.5): Orange (#ff8844)
// Low TTL (0.0): Yellow (#ffcc44)
function getTTLColor(ttlPercent: number): string {
  const clampedTTL = Math.max(0, Math.min(1, ttlPercent));

  // Interpolate from yellow (low TTL) to red (high TTL)
  // Red: 255, Green: 68 -> 204, Blue: 68
  const red = 255;
  const green = Math.round(68 + (1 - clampedTTL) * 136); // 68 at full, 204 at empty
  const blue = 68;

  return `rgb(${red}, ${green}, ${blue})`;
}

export const Enemy: React.FC<EnemyProps> = ({ x, y, speedTier, ttlPercent, isNew = false }) => {
  const fadeIn = useSharedValue(isNew ? 0 : 1);

  React.useEffect(() => {
    if (isNew) {
      fadeIn.value = withTiming(1, { duration: 200 });
    }
  }, []);

  const color = getTTLColor(ttlPercent);

  // Fade out in last ~200ms (2.5% of 8000ms lifetime)
  const fadeOut = ttlPercent < 0.025 ? ttlPercent / 0.025 : 1;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x - GAME.ENEMY_RADIUS },
      { translateY: y - GAME.ENEMY_RADIUS },
    ],
    opacity: fadeIn.value * fadeOut,
  }));

  // Different shapes based on speed tier
  if (speedTier === 'slow') {
    // Circle (default)
    return (
      <Animated.View
        style={[
          styles.enemyBase,
          styles.circle,
          { backgroundColor: color },
          animatedStyle,
        ]}
      />
    );
  } else if (speedTier === 'medium') {
    // Square (rotated 45deg to look like diamond)
    return (
      <Animated.View
        style={[
          styles.enemyBase,
          styles.square,
          { backgroundColor: color },
          animatedStyle,
        ]}
      />
    );
  } else {
    // Fast - Triangle (using borders)
    return (
      <Animated.View style={[styles.enemyBase, animatedStyle]}>
        <View
          style={[
            styles.triangle,
            {
              borderBottomColor: color,
            },
          ]}
        />
      </Animated.View>
    );
  }
};

const styles = StyleSheet.create({
  enemyBase: {
    position: 'absolute',
    width: GAME.ENEMY_RADIUS * 2,
    height: GAME.ENEMY_RADIUS * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    borderRadius: GAME.ENEMY_RADIUS,
  },
  square: {
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: GAME.ENEMY_RADIUS,
    borderRightWidth: GAME.ENEMY_RADIUS,
    borderBottomWidth: GAME.ENEMY_RADIUS * 1.7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
