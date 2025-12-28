import type React from 'react';
import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../const/colors';

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

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(star.opacity, {
        duration: star.duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [opacity, star.duration, star.opacity]);

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

interface StarFieldProps {
  count?: number;
  parallaxX?: SharedValue<number>;
  parallaxY?: SharedValue<number>;
}

export const StarField: React.FC<StarFieldProps> = ({ count = 50, parallaxX, parallaxY }) => {
  const { width, height } = useWindowDimensions();

  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.7,
      duration: 2000 + Math.random() * 3000,
    }));
  }, [count, width, height]);

  // Stars move opposite to tilt at 0.3x speed (distant = slow, inverted)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -(parallaxX?.value ?? 0) * 0.3 },
      { translateY: -(parallaxY?.value ?? 0) * 0.3 },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      {stars.map((star) => (
        <StarParticle key={star.id} star={star} />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: COLORS.textPrimary,
  },
});
