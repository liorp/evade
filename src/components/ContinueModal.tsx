import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../const/colors';
import { adManager } from '../ads/adManager';

interface ContinueModalProps {
  visible: boolean;
  canContinue: boolean;
  onContinue: () => void;
  onDecline: () => void;
}

export const ContinueModal: React.FC<ContinueModalProps> = ({
  visible,
  canContinue,
  onContinue,
  onDecline,
}) => {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (!visible) {
      setCountdown(3);
      isProcessingRef.current = false;
      return;
    }

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

    return () => clearInterval(timer);
  }, [visible, onDecline]);

  const handleWatchAd = async () => {
    isProcessingRef.current = true;
    setIsLoading(true);
    const success = await adManager.showRewarded(() => {
      onContinue();
    });
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
      <View style={styles.modal}>
        <Text style={styles.title}>{t('continue.title', 'Continue?')}</Text>
        <Text style={styles.countdown}>{countdown}</Text>

        <Pressable
          style={[styles.button, styles.continueButton]}
          onPress={handleWatchAd}
          disabled={isLoading || !adManager.isRewardedReady()}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {t('continue.watchAd', 'Watch Ad to Continue')}
            </Text>
          )}
        </Pressable>

        <Pressable style={[styles.button, styles.declineButton]} onPress={onDecline}>
          <Text style={styles.buttonText}>{t('continue.decline', 'No Thanks')}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  modal: {
    backgroundColor: '#1a1a2e',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 280,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  countdown: {
    fontSize: 64,
    fontWeight: 'bold',
    color: COLORS.player,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 220,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#44bb44',
  },
  declineButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
