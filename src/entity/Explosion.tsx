import type React from 'react';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface ExplosionProps {
  x: number;
  y: number;
  color: string;
  onComplete: () => void;
}

const PARTICLE_COUNT = 10;
const ANIMATION_DURATION = 400;
const PARTICLE_SIZE = 8;
const EXPLOSION_RADIUS = 80;

interface ParticleProps {
  angle: number;
  color: string;
  progress: SharedValue<number>;
}

const Particle: React.FC<ParticleProps> = ({ angle, color, progress }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = progress.value * EXPLOSION_RADIUS;
    const translateX = Math.cos(angle) * distance;
    const translateY = Math.sin(angle) * distance;
    const scale = 1 - progress.value * 0.5;
    const opacity = 1 - progress.value;

    return {
      transform: [{ translateX }, { translateY }, { scale }],
      opacity,
    };
  });

  return <Animated.View style={[styles.particle, { backgroundColor: color }, animatedStyle]} />;
};

export const Explosion: React.FC<ExplosionProps> = ({ x, y, color, onComplete }) => {
  const progress = useSharedValue(0);

  // Generate random angles for particles
  const angles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const baseAngle = (i / PARTICLE_COUNT) * Math.PI * 2;
    const randomOffset = (Math.random() - 0.5) * 0.5;
    return baseAngle + randomOffset;
  });

  useEffect(() => {
    progress.value = withTiming(
      1,
      {
        duration: ANIMATION_DURATION,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      },
    );
  }, [progress, onComplete]);

  return (
    <View style={[styles.container, { left: x, top: y }]}>
      {angles.map((angle, index) => (
        <Particle key={index} angle={angle} color={color} progress={progress} />
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
    width: PARTICLE_SIZE,
    height: PARTICLE_SIZE,
    borderRadius: PARTICLE_SIZE / 2,
  },
});
