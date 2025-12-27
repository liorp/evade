import { type AdPlacement, trackAdCompleted, trackAdFailed, trackAdShown } from '../analytics';
import { isExpoGo, isWeb } from '../utils/environment';
import { AD_UNIT_IDS } from './constants';

// Conditionally import real, web, or mock ads based on platform
const getAdsModule = () => {
  if (isWeb) {
    return require('./webAds');
  }
  if (isExpoGo) {
    return require('../mocks/googleMobileAds');
  }
  return require('react-native-google-mobile-ads');
};

const { InterstitialAd, RewardedAd, AdEventType, RewardedAdEventType } = getAdsModule();

interface AdInstance {
  addAdEventListener: (event: string, callback: (arg?: unknown) => void) => () => void;
  load: () => void;
  show: () => Promise<void>;
}

class AdManager {
  private interstitial: AdInstance | null = null;
  private rewarded: AdInstance | null = null;
  private isInterstitialLoaded = false;
  private isRewardedLoaded = false;
  private interstitialUnsubscribers: (() => void)[] = [];
  private rewardedUnsubscribers: (() => void)[] = [];

  async initialize(): Promise<void> {
    this.loadInterstitial();
    this.loadRewarded();
  }

  private cleanupInterstitial(): void {
    this.interstitialUnsubscribers.forEach((unsub) => {
      unsub();
    });
    this.interstitialUnsubscribers = [];
  }

  private cleanupRewarded(): void {
    this.rewardedUnsubscribers.forEach((unsub) => {
      unsub();
    });
    this.rewardedUnsubscribers = [];
  }

  private loadInterstitial(): void {
    this.cleanupInterstitial();

    const interstitial: AdInstance = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial, {
      requestNonPersonalizedAdsOnly: true,
    });
    this.interstitial = interstitial;

    this.interstitialUnsubscribers.push(
      interstitial.addAdEventListener(AdEventType.LOADED, () => {
        this.isInterstitialLoaded = true;
      }),
    );

    this.interstitialUnsubscribers.push(
      interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        this.isInterstitialLoaded = false;
        this.loadInterstitial(); // Preload next ad
      }),
    );

    this.interstitialUnsubscribers.push(
      interstitial.addAdEventListener(AdEventType.ERROR, (error: unknown) => {
        console.warn('Interstitial ad error:', error);
        this.isInterstitialLoaded = false;
      }),
    );

    interstitial.load();
  }

  private loadRewarded(): void {
    this.cleanupRewarded();

    const rewarded: AdInstance = RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded, {
      requestNonPersonalizedAdsOnly: true,
    });
    this.rewarded = rewarded;

    this.rewardedUnsubscribers.push(
      rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        this.isRewardedLoaded = true;
      }),
    );

    this.rewardedUnsubscribers.push(
      rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        this.isRewardedLoaded = false;
        this.loadRewarded(); // Preload next ad
      }),
    );

    this.rewardedUnsubscribers.push(
      rewarded.addAdEventListener(AdEventType.ERROR, (error: unknown) => {
        console.warn('Rewarded ad error:', error);
        this.isRewardedLoaded = false;
      }),
    );

    rewarded.load();
  }

  async showInterstitial(placement: AdPlacement = 'game_over'): Promise<boolean> {
    if (!this.isInterstitialLoaded || !this.interstitial) {
      return false;
    }

    trackAdShown({ ad_type: 'interstitial', placement });

    try {
      await this.interstitial.show();
      trackAdCompleted({ ad_type: 'interstitial', placement, reward_granted: false });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      trackAdFailed({ ad_type: 'interstitial', placement, error: errorMessage });
      console.warn('Failed to show interstitial:', error);
      return false;
    }
  }

  async showRewarded(
    onRewarded: () => void,
    placement: AdPlacement = 'continue',
  ): Promise<boolean> {
    if (!this.isRewardedLoaded || !this.rewarded) {
      return false;
    }

    trackAdShown({ ad_type: 'rewarded', placement });

    return new Promise((resolve) => {
      let rewardGranted = false;

      const unsubscribe = this.rewarded!.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          rewardGranted = true;
          onRewarded();
          unsubscribe();
        },
      );

      this.rewarded!.show()
        .then(() => {
          trackAdCompleted({ ad_type: 'rewarded', placement, reward_granted: rewardGranted });
          resolve(true);
        })
        .catch((error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          trackAdFailed({ ad_type: 'rewarded', placement, error: errorMessage });
          console.warn('Failed to show rewarded:', error);
          unsubscribe();
          resolve(false);
        });
    });
  }

  isInterstitialReady(): boolean {
    return this.isInterstitialLoaded;
  }

  isRewardedReady(): boolean {
    return this.isRewardedLoaded;
  }

  destroy(): void {
    this.cleanupInterstitial();
    this.cleanupRewarded();
    this.interstitial = null;
    this.rewarded = null;
  }
}

export const adManager = new AdManager();
