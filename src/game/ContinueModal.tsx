import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { adManager } from '../ads/adManager';
import { COLORS } from '../const/colors';
import { ChromeText, GlassButton, HexFrame } from '../ui';

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
  const [countdownExpired, setCountdownExpired] = useState(false);
  const isProcessingRef = useRef(false);

  const ringProgress = useSharedValue(1);

  useEffect(() => {
    if (countdownExpired && !isProcessingRef.current) {
      onDecline();
    }
  }, [countdownExpired, onDecline]);

  useEffect(() => {
    if (!visible) {
      setCountdown(COUNTDOWN_DURATION);
      setCountdownExpired(false);
      isProcessingRef.current = false;
      cancelAnimation(ringProgress);
      ringProgress.value = 1;
      return;
    }

    ringProgress.value = withTiming(0, {
      duration: COUNTDOWN_DURATION * 1000,
      easing: Easing.linear,
    });

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCountdownExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      cancelAnimation(ringProgress);
    };
  }, [visible, ringProgress]);

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
      onDecline();
    }
  };

  if (!visible || !canContinue) return null;

  return (
    <View style={styles.overlay}>
      <HexFrame width={300} height={380} color="cyan" glowPulse style={styles.frame}>
        <View style={styles.content}>
          <ChromeText size={32} color="cyan" glowPulse={false}>
            {t('continue.title', 'Continue?')}
          </ChromeText>

          <View style={styles.countdownContainer}>
            <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={COLORS.backgroundPanel}
                strokeWidth={RING_STROKE_WIDTH}
                fill="none"
              />
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

          <View style={styles.buttonsContainer}>
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
            <GlassButton
              title={t('continue.decline', 'No Thanks')}
              onPress={onDecline}
              variant="secondary"
              style={styles.button}
            />
          </View>
        </View>
      </HexFrame>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.pauseOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    overflow: 'visible',
  },
  countdownContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    overflow: 'visible',
  },
  ringSvg: {
    position: 'absolute',
  },
  countdownTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  loadingContainer: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    minWidth: 280,
  },
});
