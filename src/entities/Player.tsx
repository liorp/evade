import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { GAME } from '../constants/game';

interface PlayerProps {
  x: SharedValue<number>;
  y: SharedValue<number>;
}

export const Player: React.FC<PlayerProps> = ({ x, y }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value - GAME.PLAYER_RADIUS },
      { translateY: y.value - GAME.PLAYER_RADIUS },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
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
});
