import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { GAME } from '../const/game';
import { SpeedTier } from '../game/types';
import { EnemyTheme, ENEMY_THEMES } from '../const/cosmetics';

interface EnemyProps {
  x: number;
  y: number;
  speedTier: SpeedTier;
  ttlPercent: number;
  isNew?: boolean;
  theme?: EnemyTheme;
}

function getTTLColor(ttlPercent: number, baseColor: string): string {
  const clampedTTL = Math.max(0, Math.min(1, ttlPercent));

  // Parse base color
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Fade towards yellow as TTL decreases
  const fadeR = r;
  const fadeG = Math.min(255, g + Math.round((1 - clampedTTL) * (200 - g)));
  const fadeB = Math.round(b * clampedTTL);

  return `rgb(${fadeR}, ${fadeG}, ${fadeB})`;
}

export const Enemy: React.FC<EnemyProps> = ({
  x,
  y,
  speedTier,
  ttlPercent,
  isNew = false,
  theme = 'classic',
}) => {
  const themeData = ENEMY_THEMES[theme];
  const fadeIn = useSharedValue(isNew ? 0 : 1);

  React.useEffect(() => {
    if (isNew) {
      fadeIn.value = withTiming(1, { duration: 200 });
    }
  }, [isNew, fadeIn]);

  const color = getTTLColor(ttlPercent, themeData.colors.base);
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
    return (
      <Animated.View
        style={[styles.enemyBase, styles.circle, { backgroundColor: color }, animatedStyle]}
      />
    );
  } else if (speedTier === 'medium') {
    return (
      <Animated.View
        style={[styles.enemyBase, styles.square, { backgroundColor: color }, animatedStyle]}
      />
    );
  } else {
    return (
      <Animated.View style={[styles.enemyBase, animatedStyle]}>
        <View style={[styles.triangle, { borderBottomColor: color }]} />
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
