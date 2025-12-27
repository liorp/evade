import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, Modal } from 'react-native';
import { webAdEventBus } from './webAds';
import { WEB_AD_CONFIG } from './constants';
import { COLORS } from '../const/colors';

type AdType = 'interstitial' | 'rewarded' | null;

export const WebAdModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [adType, setAdType] = useState<AdType>(null);
  const [countdown, setCountdown] = useState(0);
  const [canClose, setCanClose] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const adContainerRef = useRef<HTMLDivElement | null>(null);

  const handleClose = useCallback((grantReward: boolean = false) => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    if (grantReward && adType === 'rewarded') {
      webAdEventBus.emit('rewardEarned');
    }
    webAdEventBus.emit('adClosed');

    setVisible(false);
    setAdType(null);
    setCountdown(0);
    setCanClose(false);
  }, [adType]);

  const loadAdSenseAd = useCallback(() => {
    // Check if AdSense is available and load ad
    if (typeof window !== 'undefined' && adContainerRef.current) {
      try {
        // Clear previous ad
        adContainerRef.current.innerHTML = '';

        // Create ad slot element
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.style.width = '300px';
        ins.style.height = '250px';
        ins.setAttribute('data-ad-client', WEB_AD_CONFIG.publisherId || 'ca-pub-XXXXXXXXXXXXXXXX');
        ins.setAttribute('data-ad-slot', WEB_AD_CONFIG.adSlotId || 'XXXXXXXXXX');
        ins.setAttribute('data-ad-format', 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');

        adContainerRef.current.appendChild(ins);

        // Push to AdSense queue
        const adsbygoogle = (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle;
        if (adsbygoogle) {
          adsbygoogle.push({});
        }
      } catch (error) {
        console.warn('[WebAd] Failed to load AdSense:', error);
      }
    }
  }, []);

  useEffect(() => {
    const unsubInterstitial = webAdEventBus.on('showInterstitial', () => {
      setAdType('interstitial');
      setVisible(true);
      setCountdown(WEB_AD_CONFIG.interstitialDelaySeconds);
      setCanClose(false);

      // Start countdown for close button
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
            }
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    const unsubRewarded = webAdEventBus.on('showRewarded', () => {
      setAdType('rewarded');
      setVisible(true);
      setCountdown(WEB_AD_CONFIG.rewardedDurationSeconds);
      setCanClose(false);

      // Start countdown - user must wait to earn reward
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
            }
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    return () => {
      unsubInterstitial();
      unsubRewarded();
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Load AdSense when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(loadAdSenseAd, 100);
      return () => clearTimeout(timer);
    }
  }, [visible, loadAdSenseAd]);

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (canClose) {
          handleClose(adType === 'rewarded');
        }
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>
              {adType === 'rewarded' ? 'Watch to earn reward' : 'Advertisement'}
            </Text>
            {countdown > 0 && (
              <Text style={styles.countdown}>{countdown}s</Text>
            )}
          </View>

          {/* Ad container */}
          <View style={styles.adContainer}>
            <div
              ref={adContainerRef as React.RefObject<HTMLDivElement>}
              style={{
                width: 300,
                height: 250,
                backgroundColor: '#1a1a2e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: '#666', fontSize: 14 }}>
                {WEB_AD_CONFIG.publisherId ? 'Loading ad...' : 'Ad placeholder (configure AdSense)'}
              </span>
            </div>
          </View>

          {/* Close/Skip button */}
          <View style={styles.footer}>
            {adType === 'rewarded' ? (
              <>
                {canClose ? (
                  <Pressable
                    style={styles.rewardButton}
                    onPress={() => handleClose(true)}
                  >
                    <Text style={styles.rewardButtonText}>Claim Reward</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.waitText}>
                    Wait {countdown}s to earn reward...
                  </Text>
                )}
                <Pressable
                  style={styles.skipButton}
                  onPress={() => handleClose(false)}
                >
                  <Text style={styles.skipButtonText}>
                    Skip (no reward)
                  </Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                style={[styles.closeButton, !canClose && styles.closeButtonDisabled]}
                onPress={() => canClose && handleClose(false)}
                disabled={!canClose}
              >
                <Text style={styles.closeButtonText}>
                  {canClose ? 'Continue' : `Wait ${countdown}s...`}
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    maxWidth: 400,
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  headerText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  countdown: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  adContainer: {
    width: 300,
    height: 250,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: COLORS.menuAccent,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  closeButtonDisabled: {
    backgroundColor: '#444',
  },
  closeButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  rewardButton: {
    backgroundColor: '#44bb44',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 8,
  },
  rewardButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    paddingVertical: 8,
  },
  skipButtonText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  waitText: {
    color: COLORS.textMuted,
    fontSize: 14,
    marginBottom: 12,
  },
});
