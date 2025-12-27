import React from 'react';
import { StyleSheet, View, Text, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { COLORS } from '../const/colors';

interface ChromeTextProps {
  children: string;
  size?: number;
  color?: 'gold' | 'cyan' | 'magenta';
  glowPulse?: boolean;
  style?: TextStyle;
}

const CHROME_COLORS = {
  gold: {
    base: COLORS.chromeGold,
    glow: 'rgba(255, 215, 0, 0.6)',
  },
  cyan: {
    base: COLORS.neonCyan,
    glow: 'rgba(0, 245, 255, 0.6)',
  },
  magenta: {
    base: COLORS.neonMagenta,
    glow: 'rgba(255, 42, 109, 0.6)',
  },
};

export const ChromeText: React.FC<ChromeTextProps> = ({
  children,
  size = 48,
  color = 'gold',
  glowPulse = true,
  style,
}) => {
  const glowOpacity = useSharedValue(0.4);
  const colors = CHROME_COLORS[color];

  React.useEffect(() => {
    if (glowPulse) {
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true
      );
    } else {
      cancelAnimation(glowOpacity);
      glowOpacity.value = 0.6; // Static glow when not pulsing
    }
  }, [glowPulse, glowOpacity]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const textStyle: TextStyle = {
    fontSize: size,
    fontWeight: 'bold',
    color: colors.base,
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    ...style,
  };

  const glowStyle: TextStyle = {
    ...textStyle,
    position: 'absolute',
    color: colors.glow,
    textShadowRadius: 30,
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={[glowStyle, animatedGlowStyle]}>
        {children}
      </Animated.Text>
      <Text style={textStyle}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
