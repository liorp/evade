import type React from 'react';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

interface ExplosionProps {
  x: number;
  y: number;
  color: string;
}

const PARTICLE_COUNT = 20;
const ANIMATION_DURATION = 1500;

interface ParticleData {
  angle: number;
  size: number;
  distance: number;
  delay: number;
  duration: number;
}

interface ParticleProps {
  data: ParticleData;
  color: string;
}

const Particle: React.FC<ParticleProps> = ({ data, color }) => {
  const progress = useSharedValue(0);

  // Start animation on mount with individual delay
  progress.value = withDelay(
    data.delay,
    withTiming(1, {
      duration: data.duration,
      easing: Easing.out(Easing.quad),
    }),
  );

  const animatedStyle = useAnimatedStyle(() => {
    const distance = progress.value * data.distance;
    const translateX = Math.cos(data.angle) * distance;
    const translateY = Math.sin(data.angle) * distance;
    // Particles shrink as they fly out
    const scale = 1 - progress.value * 0.7;
    const opacity = 1 - progress.value;

    return {
      width: data.size,
      height: data.size,
      borderRadius: data.size / 2,
      transform: [{ translateX }, { translateY }, { scale }],
      opacity,
    };
  });

  return <Animated.View style={[styles.particle, { backgroundColor: color }, animatedStyle]} />;
};

export const Explosion: React.FC<ExplosionProps> = ({ x, y, color }) => {
  // Generate asymmetric particle data once
  const particles = useMemo<ParticleData[]>(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => {
      // Random angle (full 360 degrees)
      const angle = Math.random() * Math.PI * 2;
      // Varied sizes (small pieces of the player)
      const size = 4 + Math.random() * 12;
      // Varied distances
      const distance = 60 + Math.random() * 120;
      // Staggered start times for more organic feel
      const delay = Math.random() * 100;
      // Varied durations
      const duration = ANIMATION_DURATION * (0.6 + Math.random() * 0.4);

      return { angle, size, distance, delay, duration };
    });
  }, []);

  return (
    <View style={[styles.container, { left: x, top: y }]}>
      {particles.map((data, index) => (
        <Particle key={index} data={data} color={color} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 0,
    height: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
  },
});
