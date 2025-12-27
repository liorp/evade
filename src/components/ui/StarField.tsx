import React, { useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
}

const StarParticle: React.FC<{ star: Star }> = ({ star }) => {
  const opacity = useSharedValue(star.opacity * 0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(star.opacity, {
        duration: star.duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

export const StarField: React.FC<{ count?: number }> = ({ count = 50 }) => {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.7,
      duration: 2000 + Math.random() * 3000,
    }));
  }, [count]);

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.map((star) => (
        <StarParticle key={star.id} star={star} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
  },
});
