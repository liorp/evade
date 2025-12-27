import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../const/colors';
import { adManager } from '../ads/adManager';
import { HexFrame, ChromeText, GlassButton } from '../ui';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ContinueModalProps {
  visible: boolean;
  canContinue: boolean;
  onContinue: () => void;
  onDecline: () => void;
}

const COUNTDOWN_DURATION = 3;
const RING_SIZE = 120;
const RING_STROKE_WIDTH = 6;
const RING_RADIUS = (RING_SIZE - RING_STROKE_WIDTH) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const ContinueModal: React.FC<ContinueModalProps> = ({
  visible,
  canContinue,
  onContinue,
  onDecline,
}) => {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [isLoading, setIsLoading] = useState(false);
  const isProcessingRef = useRef(false);

  // Animated value for the ring progress (1 = full, 0 = empty)
  const ringProgress = useSharedValue(1);

  useEffect(() => {
    if (!visible) {
      setCountdown(COUNTDOWN_DURATION);
      isProcessingRef.current = false;
      cancelAnimation(ringProgress);
      ringProgress.value = 1;
      return;
    }

    // Start the ring animation from full to empty over the countdown duration
    ringProgress.value = withTiming(0, {
      duration: COUNTDOWN_DURATION * 1000,
      easing: Easing.linear,
    });

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Only decline if not already processing an ad
          if (!isProcessingRef.current) {
            onDecline();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      cancelAnimation(ringProgress);
    };
  }, [visible, onDecline, ringProgress]);

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - ringProgress.value),
  }));

  const handleWatchAd = async () => {
    isProcessingRef.current = true;
    setIsLoading(true);
    const success = await adManager.showRewarded(() => {
      onContinue();
    }, 'continue');
    setIsLoading(false);

    if (!success) {
      isProcessingRef.current = false;
      // Ad failed to show, just decline
      onDecline();
    }
  };

  if (!visible || !canContinue) return null;

  return (
    <View style={styles.overlay}>
      <HexFrame
        width={320}
        height={340}
        color="cyan"
        glowPulse
        style={styles.frame}
      >
        <View style={styles.content}>
          <ChromeText size={32} color="cyan" glowPulse={false}>
            {t('continue.title', 'Continue?')}
          </ChromeText>

          {/* Countdown ring with number */}
          <View style={styles.countdownContainer}>
            <Svg
              width={RING_SIZE}
              height={RING_SIZE}
              style={styles.ringSvg}
            >
              {/* Background ring */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={COLORS.backgroundPanel}
                strokeWidth={RING_STROKE_WIDTH}
                fill="none"
              />
              {/* Animated progress ring */}
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={COLORS.neonCyan}
                strokeWidth={RING_STROKE_WIDTH}
                fill="none"
                strokeDasharray={RING_CIRCUMFERENCE}
                animatedProps={animatedCircleProps}
                strokeLinecap="round"
                rotation="-90"
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              />
            </Svg>
            <View style={styles.countdownTextContainer}>
              <ChromeText size={48} color="cyan" glowPulse>
                {String(countdown)}
              </ChromeText>
            </View>
          </View>

          {/* Watch Ad button */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={COLORS.neonCyan} size="large" />
            </View>
          ) : (
            <GlassButton
              title={t('continue.watchAd', 'Watch Ad to Continue')}
              onPress={handleWatchAd}
              variant="primary"
              disabled={!adManager.isRewardedReady()}
              style={styles.button}
            />
          )}

          {/* Decline button */}
          <GlassButton
            title={t('continue.decline', 'No Thanks')}
            onPress={onDecline}
            variant="secondary"
            style={styles.button}
          />
        </View>
      </HexFrame>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  countdownContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  ringSvg: {
    position: 'absolute',
  },
  countdownTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  button: {
    marginVertical: 8,
    minWidth: 260,
  },
});
