import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { GAME } from '../constants/game';

interface EnemyProps {
  x: number;
  y: number;
  isNew?: boolean;
}

export const Enemy: React.FC<EnemyProps> = ({ x, y, isNew = false }) => {
  const opacity = useSharedValue(isNew ? 0 : 1);

  React.useEffect(() => {
    if (isNew) {
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x - GAME.ENEMY_RADIUS },
      { translateY: y - GAME.ENEMY_RADIUS },
    ],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.enemy, animatedStyle]} />;
};

const styles = StyleSheet.create({
  enemy: {
    position: 'absolute',
    width: GAME.ENEMY_RADIUS * 2,
    height: GAME.ENEMY_RADIUS * 2,
    borderRadius: GAME.ENEMY_RADIUS,
    backgroundColor: COLORS.enemy,
  },
});
