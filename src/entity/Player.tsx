import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  SharedValue,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { COLORS } from '../const/colors';
import { GAME } from '../const/game';

interface PlayerProps {
  x: SharedValue<number>;
  y: SharedValue<number>;
  hasShield?: boolean;
  dodgeFlashTrigger?: number; // Increment to trigger flash
}

export const Player: React.FC<PlayerProps> = ({ x, y, hasShield = false, dodgeFlashTrigger = 0 }) => {
  const shieldPulse = useSharedValue(1);
  const dodgeFlashOpacity = useSharedValue(0);
  const dodgeFlashScale = useSharedValue(1);

  // Trigger flash animation when dodgeFlashTrigger changes
  useEffect(() => {
    if (dodgeFlashTrigger > 0) {
      dodgeFlashOpacity.value = withSequence(
        withTiming(0.8, { duration: 50 }),
        withTiming(0, { duration: 200 })
      );
      dodgeFlashScale.value = withSequence(
        withTiming(1.5, { duration: 100 }),
        withTiming(1, { duration: 150 })
      );
    }
  }, [dodgeFlashTrigger]);

  React.useEffect(() => {
    if (hasShield) {
      shieldPulse.value = withRepeat(
        withTiming(1.2, { duration: 300 }),
        -1,
        true
      );
    } else {
      shieldPulse.value = 1;
    }
  }, [hasShield]);

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

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Dodge flash ring */}
      <Animated.View style={[styles.dodgeFlash, dodgeFlashStyle]} />
      {hasShield && (
        <Animated.View style={[styles.shield, shieldStyle]} />
      )}
      <View style={styles.glow} />
      <View style={styles.player} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: GAME.PLAYER_RADIUS * 2,
    height: GAME.PLAYER_RADIUS * 2,
  },
  shield: {
    position: 'absolute',
    width: GAME.PLAYER_RADIUS * 3,
    height: GAME.PLAYER_RADIUS * 3,
    borderRadius: GAME.PLAYER_RADIUS * 1.5,
    borderWidth: 4,
    borderColor: '#44ff44',
    top: -GAME.PLAYER_RADIUS * 0.5,
    left: -GAME.PLAYER_RADIUS * 0.5,
    backgroundColor: 'rgba(68, 255, 68, 0.2)',
  },
  glow: {
    position: 'absolute',
    width: GAME.PLAYER_RADIUS * 2.5,
    height: GAME.PLAYER_RADIUS * 2.5,
    borderRadius: GAME.PLAYER_RADIUS * 1.25,
    backgroundColor: COLORS.playerGlow,
    top: -GAME.PLAYER_RADIUS * 0.25,
    left: -GAME.PLAYER_RADIUS * 0.25,
  },
  player: {
    width: GAME.PLAYER_RADIUS * 2,
    height: GAME.PLAYER_RADIUS * 2,
    borderRadius: GAME.PLAYER_RADIUS,
    backgroundColor: COLORS.player,
  },
  dodgeFlash: {
    position: 'absolute',
    width: GAME.PLAYER_RADIUS * 3.5,
    height: GAME.PLAYER_RADIUS * 3.5,
    borderRadius: GAME.PLAYER_RADIUS * 1.75,
    borderWidth: 3,
    borderColor: '#ffffff',
    top: -GAME.PLAYER_RADIUS * 0.75,
    left: -GAME.PLAYER_RADIUS * 0.75,
    backgroundColor: 'transparent',
  },
});
