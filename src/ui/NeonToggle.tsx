import React, { useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { COLORS } from '../const/colors';

interface NeonToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const NeonToggle: React.FC<NeonToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  const translateX = useSharedValue(value ? 24 : 0);
  const glowOpacity = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    translateX.value = withSpring(value ? 24 : 0, {
      damping: 15,
      stiffness: 300,
      overshootClamping: false,
    });
    glowOpacity.value = withSpring(value ? 1 : 0);
  }, [value, translateX, glowOpacity]);

  const handlePress = useCallback(() => {
    if (!disabled) {
      onValueChange(!value);
    }
  }, [disabled, onValueChange, value]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    backgroundColor: value ? COLORS.neonCyan : COLORS.textMuted,
    shadowOpacity: glowOpacity.value * 0.8,
  }));

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: value ? 'rgba(0, 245, 255, 0.2)' : 'rgba(136, 136, 136, 0.2)',
  }));

  return (
    <Pressable onPress={handlePress} style={[styles.container, disabled && styles.disabled]}>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, { shadowColor: COLORS.neonCyan }, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  track: {
    width: 52,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});
