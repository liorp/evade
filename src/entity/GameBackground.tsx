import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BackgroundTheme, BACKGROUND_THEMES } from '../cosmetics/constants';

interface GameBackgroundProps {
  theme?: BackgroundTheme;
}

export const GameBackground: React.FC<GameBackgroundProps> = ({ theme = 'dark' }) => {
  const themeData = BACKGROUND_THEMES[theme];

  return (
    <View style={[styles.container, { backgroundColor: themeData.colors.bg }]}>
      {/* Subtle gradient overlay for depth */}
      <View style={[styles.gradient, { backgroundColor: themeData.colors.accent }]} />

      {theme === 'ocean' && (
        <View style={styles.oceanWave} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    opacity: 0.3,
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
