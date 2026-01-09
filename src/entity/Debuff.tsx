import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GAME } from '../game/constants';
import type { DebuffType } from '../game/types';

interface DebuffProps {
  x: number;
  y: number;
  type: DebuffType;
  ttlPercent: number;
  isNew?: boolean;
}

const DEBUFF_COLOR = '#ff4444';

export const Debuff: React.FC<DebuffProps> = ({ x, y, type, ttlPercent, isNew = false }) => {
  const fadeIn = useSharedValue(isNew ? 0 : 1);
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    if (isNew) {
      fadeIn.value = withTiming(1, { duration: 200 });
    }
    pulse.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 400 }), withTiming(1, { duration: 400 })),
      -1,
      true,
    );
  }, [fadeIn, isNew, pulse]);

  const fadeOut = ttlPercent < 0.04 ? ttlPercent / 0.04 : 1;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x - GAME.DEBUFF_RADIUS },
      { translateY: y - GAME.DEBUFF_RADIUS },
      { scale: pulse.value },
    ],
    opacity: fadeIn.value * fadeOut,
  }));

  const renderIcon = () => {
    switch (type) {
      case 'enlarge':
        return (
          <View style={styles.expandContainer}>
            <View style={[styles.arrow, styles.arrowUp]} />
            <View style={[styles.arrow, styles.arrowDown]} />
            <View style={[styles.arrow, styles.arrowLeft]} />
            <View style={[styles.arrow, styles.arrowRight]} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.debuffShape}>{renderIcon()}</View>
    </Animated.View>
  );
};

const size = GAME.DEBUFF_RADIUS * 2;
const arrowSize = 6;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: size,
    height: size,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debuffShape: {
    width: size,
    height: size,
    backgroundColor: DEBUFF_COLOR,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: arrowSize / 2,
    borderRightWidth: arrowSize / 2,
    borderBottomWidth: arrowSize,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#000',
  },
  arrowUp: {
    top: 0,
  },
  arrowDown: {
    bottom: 0,
    transform: [{ rotate: '180deg' }],
  },
  arrowLeft: {
    left: 0,
    transform: [{ rotate: '-90deg' }],
  },
  arrowRight: {
    right: 0,
    transform: [{ rotate: '90deg' }],
  },
});
