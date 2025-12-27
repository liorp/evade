import { Accelerometer, type AccelerometerMeasurement } from 'expo-sensors';
import { useEffect, useRef } from 'react';
import {
  cancelAnimation,
  type SharedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface ParallaxValues {
  x: SharedValue<number>;
  y: SharedValue<number>;
}

interface UseParallaxOptions {
  intensity?: number;
  enabled?: boolean;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 100,
  mass: 0.5,
};

// How much the accelerometer can change and still be considered "stable"
const STABILITY_THRESHOLD = 0.02;
// How many stable readings needed before starting drift correction
const STABILITY_READINGS_REQUIRED = 15; // ~0.5s at 30fps
// How fast baseline drifts toward current position (0-1, per reading)
const BASELINE_DRIFT_RATE = 0.03;

export function useParallax(options: UseParallaxOptions = {}): ParallaxValues {
  const { intensity = 1, enabled = true } = options;

  const x = useSharedValue(0);
  const y = useSharedValue(0);

  // Track baseline (center of mass) and stability
  const baselineRef = useRef({ x: 0, y: 0 });
  const prevReadingRef = useRef({ x: 0, y: 0 });
  const stableCountRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      x.value = withSpring(0, SPRING_CONFIG);
      y.value = withSpring(0, SPRING_CONFIG);
      return;
    }

    Accelerometer.setUpdateInterval(32); // ~30fps for smooth updates

    const subscription = Accelerometer.addListener((data: AccelerometerMeasurement) => {
      const prev = prevReadingRef.current;

      // Check if device is stable (readings not changing much)
      const deltaX = Math.abs(data.x - prev.x);
      const deltaY = Math.abs(data.y - prev.y);
      const isStable = deltaX < STABILITY_THRESHOLD && deltaY < STABILITY_THRESHOLD;

      if (isStable) {
        stableCountRef.current++;
      } else {
        stableCountRef.current = 0;
      }

      // Update previous reading
      prevReadingRef.current = { x: data.x, y: data.y };

      // If stable for long enough, drift baseline toward current position
      if (stableCountRef.current >= STABILITY_READINGS_REQUIRED) {
        const baseline = baselineRef.current;
        baseline.x += (data.x - baseline.x) * BASELINE_DRIFT_RATE;
        baseline.y += (data.y - baseline.y) * BASELINE_DRIFT_RATE;
      }

      // Calculate offset relative to baseline
      const baseline = baselineRef.current;
      const offsetX = data.x - baseline.x;
      const offsetY = data.y - baseline.y;

      // Apply intensity and spring animation
      const targetX = offsetX * 30 * intensity;
      const targetY = offsetY * 30 * intensity;

      x.value = withSpring(targetX, SPRING_CONFIG);
      y.value = withSpring(targetY, SPRING_CONFIG);
    });

    return () => {
      subscription.remove();
      cancelAnimation(x);
      cancelAnimation(y);
    };
  }, [enabled, intensity, x, y]);

  return { x, y };
}
