import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../const/colors';
import { StarField } from './StarField';
import { PerspectiveGrid } from './PerspectiveGrid';
import { HorizonSun } from './HorizonSun';
import { GeometricHalos } from './GeometricHalos';

interface SynthwaveBackgroundProps {
  showStars?: boolean;
  showGrid?: boolean;
  showSun?: boolean;
  showHalos?: boolean;
  sunPosition?: number;
  gridOpacity?: number;
  halosVariant?: 'menu' | 'centered';
  gridAnimated?: boolean;
}

export const SynthwaveBackground: React.FC<SynthwaveBackgroundProps> = ({
  showStars = true,
  showGrid = true,
  showSun = true,
  showHalos = true,
  sunPosition = 0.4,
  gridOpacity = 0.6,
  halosVariant = 'menu',
  gridAnimated = true,
}) => {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Layer 1: Base background */}
      <View style={styles.baseBackground} />

      {/* Layer 2: Stars */}
      {showStars && <StarField count={50} />}

      {/* Layer 3: Horizon Sun */}
      {showSun && <HorizonSun position={sunPosition} size={200} />}

      {/* Layer 4: Perspective Grid */}
      {showGrid && <PerspectiveGrid opacity={gridOpacity} animated={gridAnimated} />}

      {/* Layer 5: Geometric Halos */}
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
