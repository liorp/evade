import type React from 'react';
import { StyleSheet, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { COLORS } from '../const/colors';
import { GeometricHalos } from './GeometricHalos';
import { HorizonSun } from './HorizonSun';
import { StarField } from './StarField';

interface SynthwaveBackgroundProps {
  showStars?: boolean;
  showSun?: boolean;
  showHalos?: boolean;
  sunPosition?: number;
  halosVariant?: 'menu' | 'centered';
  parallaxX?: SharedValue<number>;
  parallaxY?: SharedValue<number>;
}

export const SynthwaveBackground: React.FC<SynthwaveBackgroundProps> = ({
  showStars = true,
  showSun = true,
  showHalos = true,
  sunPosition = 0.4,
  halosVariant = 'menu',
  parallaxX,
  parallaxY,
}) => {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Layer 1: Base background */}
      <View style={styles.baseBackground} />

      {/* Layer 2: Stars (slowest parallax - furthest layer) */}
      {showStars && <StarField count={50} parallaxX={parallaxX} parallaxY={parallaxY} />}

      {/* Layer 3: Horizon Sun (faster parallax - closer layer) */}
      {showSun && (
        <HorizonSun position={sunPosition} size={200} parallaxX={parallaxX} parallaxY={parallaxY} />
      )}

      {/* Layer 4: Geometric Halos */}
      {showHalos && <GeometricHalos variant={halosVariant} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  baseBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backgroundDeep,
  },
});
