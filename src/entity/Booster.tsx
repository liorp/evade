import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GAME } from '../game/constants';
import type { BoosterType } from '../game/types';

interface BoosterProps {
  x: number;
  y: number;
  type: BoosterType;
  ttlPercent: number;
  isNew?: boolean;
}

const BOOSTER_COLOR = '#44ff44';

export const Booster: React.FC<BoosterProps> = ({ x, y, type, ttlPercent, isNew = false }) => {
  const fadeIn = useSharedValue(isNew ? 0 : 1);
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    if (isNew) {
      fadeIn.value = withTiming(1, { duration: 200 });
    }
    // Pulsing animation
    pulse.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 400 }), withTiming(1, { duration: 400 })),
      -1,
      true,
    );
  }, [
    fadeIn,
    isNew, // Pulsing animation
    pulse,
  ]);

  // Fade out in last ~200ms (4% of 5000ms lifetime)
  const fadeOut = ttlPercent < 0.04 ? ttlPercent / 0.04 : 1;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x - GAME.BOOSTER_RADIUS },
      { translateY: y - GAME.BOOSTER_RADIUS },
      { scale: pulse.value },
    ],
    opacity: fadeIn.value * fadeOut,
  }));

  const renderIcon = () => {
    switch (type) {
      case 'plus':
        // Bold plus sign made with views
        return (
          <View style={styles.plusContainer}>
            <View style={styles.plusHorizontal} />
            <View style={styles.plusVertical} />
          </View>
        );
      case 'shield':
        // Shield shape using nested views
        return (
          <View style={styles.shieldContainer}>
            <View style={styles.shieldOuter}>
              <View style={styles.shieldInner} />
            </View>
          </View>
        );
      case 'multiplier':
        // Clear "x3" text
        return <Text style={styles.multiplierText}>x3</Text>;
      default:
        return <Text style={styles.iconText}>?</Text>;
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.boosterShape}>
        <View style={styles.iconContainer}>{renderIcon()}</View>
      </View>
    </Animated.View>
  );
};

const size = GAME.BOOSTER_RADIUS * 2;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: size,
    height: size,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boosterShape: {
    width: size,
    height: size,
    backgroundColor: BOOSTER_COLOR,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Plus icon
  plusContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusHorizontal: {
    position: 'absolute',
    width: 20,
    height: 6,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  plusVertical: {
    position: 'absolute',
    width: 6,
    height: 20,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  // Shield icon
  shieldContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldOuter: {
    width: 20,
    height: 24,
    backgroundColor: '#000',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scaleY: 0.9 }],
  },
  shieldInner: {
    width: 12,
    height: 14,
    backgroundColor: BOOSTER_COLOR,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginTop: -2,
  },
  // Multiplier text
  multiplierText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    textAlign: 'center',
    letterSpacing: -1,
  },
  iconText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
});
