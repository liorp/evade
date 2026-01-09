import type React from 'react';
import { StyleSheet, View } from 'react-native';
import { BACKGROUND_THEMES, type BackgroundTheme } from '../cosmetics/constants';
import { StarField } from '../ui/StarField';

interface GameBackgroundProps {
  theme?: BackgroundTheme;
}

export const GameBackground: React.FC<GameBackgroundProps> = ({ theme = 'dark' }) => {
  const themeData = BACKGROUND_THEMES[theme];

  return (
    <View style={[styles.container, { backgroundColor: themeData.colors.bg }]}>
      {/* Starry background */}
      <StarField count={40} />

      {theme === 'ocean' && <View style={styles.oceanWave} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  oceanWave: {
    position: 'absolute',
    bottom: '10%',
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(0, 150, 255, 0.1)',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
});
