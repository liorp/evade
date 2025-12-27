import type React from 'react';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  PLAYER_COLORS,
  type PlayerColorId,
  type PlayerGlow,
  type PlayerShape,
  type PlayerTrail,
} from '../cosmetics/constants';
import { GAME } from '../game/constants';

interface PlayerProps {
  x: SharedValue<number>;
  y: SharedValue<number>;
  hasShield?: boolean;
  dodgeFlashTrigger?: number;
  // Cosmetic props
  shape?: PlayerShape;
  colorId?: PlayerColorId;
  trail?: PlayerTrail;
  glow?: PlayerGlow;
}

export const Player: React.FC<PlayerProps> = ({
  x,
  y,
  hasShield = false,
  dodgeFlashTrigger = 0,
  shape = 'circle',
  colorId = 'green',
  trail = 'none',
  glow = 'none',
}) => {
  const colorData = PLAYER_COLORS[colorId];
  const playerColor = colorData.hex;
  const glowColor = colorData.glowHex;

  const shieldPulse = useSharedValue(1);
  const dodgeFlashOpacity = useSharedValue(0);
  const dodgeFlashScale = useSharedValue(1);
  const glowPulse = useSharedValue(1);
  const rgbProgress = useSharedValue(0);

  // Glow animation based on type
  useEffect(() => {
    if (glow === 'pulse') {
      glowPulse.value = withRepeat(
        withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else if (glow === 'rgb') {
      rgbProgress.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        -1,
        false,
      );
    } else if (glow === 'constant') {
      glowPulse.value = 1.2;
    } else {
      glowPulse.value = 1;
    }
  }, [glow, glowPulse, rgbProgress]);

  // Dodge flash animation
  useEffect(() => {
    if (dodgeFlashTrigger > 0) {
      dodgeFlashOpacity.value = withSequence(
        withTiming(0.8, { duration: 50 }),
        withTiming(0, { duration: 200 }),
      );
      dodgeFlashScale.value = withSequence(
        withTiming(1.5, { duration: 100 }),
        withTiming(1, { duration: 150 }),
      );
    }
  }, [dodgeFlashTrigger, dodgeFlashOpacity, dodgeFlashScale]);

  // Shield animation
  useEffect(() => {
    if (hasShield) {
      shieldPulse.value = withRepeat(withTiming(1.2, { duration: 300 }), -1, true);
    } else {
      shieldPulse.value = 1;
    }
  }, [hasShield, shieldPulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value - GAME.PLAYER_RADIUS },
      { translateY: y.value - GAME.PLAYER_RADIUS },
    ],
  }));

  const shieldStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shieldPulse.value }],
    opacity: hasShield ? 0.6 : 0,
  }));

  const dodgeFlashStyle = useAnimatedStyle(() => ({
    opacity: dodgeFlashOpacity.value,
    transform: [{ scale: dodgeFlashScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => {
    if (glow === 'rgb') {
      const color = interpolateColor(
        rgbProgress.value,
        [0, 0.33, 0.66, 1],
        ['rgba(255,0,0,0.4)', 'rgba(0,255,0,0.4)', 'rgba(0,0,255,0.4)', 'rgba(255,0,0,0.4)'],
      );
      return {
        backgroundColor: color,
        transform: [{ scale: glowPulse.value }],
      };
    }
    return {
      backgroundColor: glowColor,
      transform: [{ scale: glowPulse.value }],
    };
  });

  // Render shape
  const renderShape = () => {
    const baseStyle = {
      width: GAME.PLAYER_RADIUS * 2,
      height: GAME.PLAYER_RADIUS * 2,
      backgroundColor: playerColor,
    };

    switch (shape) {
      case 'square':
        return <View style={[baseStyle, styles.square]} />;
      case 'triangle':
        return (
          <View style={styles.triangleContainer}>
            <View style={[styles.triangle, { borderBottomColor: playerColor }]} />
          </View>
        );
      case 'hexagon':
        return <View style={[baseStyle, styles.hexagon]} />;
      case 'star':
        return <View style={[baseStyle, styles.star]} />;
      default:
        return <View style={[baseStyle, styles.circle]} />;
    }
  };

  // Trail effect - simplified (just shows when trail is active)
  const showTrail = trail !== 'none';

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Dodge flash ring */}
      <Animated.View style={[styles.dodgeFlash, dodgeFlashStyle]} />
      {/* Shield */}
      {hasShield && <Animated.View style={[styles.shield, shieldStyle]} />}
      {/* Glow */}
      {(glow !== 'none' || showTrail) && <Animated.View style={[styles.glow, glowStyle]} />}
      {/* Player shape */}
      {renderShape()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: GAME.PLAYER_RADIUS * 2,
    height: GAME.PLAYER_RADIUS * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shield: {
    position: 'absolute',
    width: GAME.PLAYER_RADIUS * 3,
    height: GAME.PLAYER_RADIUS * 3,
    borderRadius: GAME.PLAYER_RADIUS * 1.5,
    borderWidth: 4,
    borderColor: '#44ff44',
    backgroundColor: 'rgba(68, 255, 68, 0.2)',
  },
  glow: {
    position: 'absolute',
    width: GAME.PLAYER_RADIUS * 2.5,
    height: GAME.PLAYER_RADIUS * 2.5,
    borderRadius: GAME.PLAYER_RADIUS * 1.25,
  },
  circle: {
    borderRadius: GAME.PLAYER_RADIUS,
  },
  square: {
    borderRadius: 6,
  },
  triangleContainer: {
    width: GAME.PLAYER_RADIUS * 2,
    height: GAME.PLAYER_RADIUS * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: GAME.PLAYER_RADIUS,
    borderRightWidth: GAME.PLAYER_RADIUS,
    borderBottomWidth: GAME.PLAYER_RADIUS * 1.7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  hexagon: {
    borderRadius: GAME.PLAYER_RADIUS * 0.3,
    transform: [{ rotate: '30deg' }],
  },
  star: {
    borderRadius: GAME.PLAYER_RADIUS * 0.2,
    transform: [{ rotate: '45deg' }],
  },
  dodgeFlash: {
    position: 'absolute',
    width: GAME.PLAYER_RADIUS * 3.5,
    height: GAME.PLAYER_RADIUS * 3.5,
    borderRadius: GAME.PLAYER_RADIUS * 1.75,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
  },
});
