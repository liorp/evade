import React from 'react';
import { StyleSheet, Pressable, Text, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../../const/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'normal' | 'large';
  style?: ViewStyle;
  disabled?: boolean;
}

const VARIANT_COLORS = {
  primary: COLORS.neonCyan,
  secondary: COLORS.neonPurple,
  danger: COLORS.neonMagenta,
};

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'normal',
  style,
  disabled = false,
}) => {
  const scale = useSharedValue(1);
  const glowIntensity = useSharedValue(0);
  const borderColor = VARIANT_COLORS[variant];

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    glowIntensity.value = withTiming(1, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    glowIntensity.value = withTiming(0, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.3 + glowIntensity.value * 0.4,
    shadowRadius: 8 + glowIntensity.value * 8,
  }));

  const isLarge = size === 'large';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.button,
        isLarge && styles.buttonLarge,
        { borderColor, shadowColor: borderColor },
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      <Text style={[styles.text, isLarge && styles.textLarge]}>{title}</Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 48,
    minWidth: 200,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
  },
  buttonLarge: {
    paddingVertical: 18,
    paddingHorizontal: 64,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  textLarge: {
    fontSize: 20,
  },
  disabled: {
    opacity: 0.5,
  },
});
