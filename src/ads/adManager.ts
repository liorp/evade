import { isExpoGo } from '../utils/environment';
import { AD_UNIT_IDS } from '../const/ads';

// Conditionally import real or mock ads
const {
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
} = isExpoGo
  ? require('../mocks/googleMobileAds')
  : require('react-native-google-mobile-ads');

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
    this.interstitialUnsubscribers.forEach((unsub) => unsub());
    this.interstitialUnsubscribers = [];
  }

  private cleanupRewarded(): void {
    this.rewardedUnsubscribers.forEach((unsub) => unsub());
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
      })
    );

    this.interstitialUnsubscribers.push(
      interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        this.isInterstitialLoaded = false;
        this.loadInterstitial(); // Preload next ad
      })
    );

    this.interstitialUnsubscribers.push(
      interstitial.addAdEventListener(AdEventType.ERROR, (error: unknown) => {
        console.warn('Interstitial ad error:', error);
        this.isInterstitialLoaded = false;
      })
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
      })
    );

    this.rewardedUnsubscribers.push(
      rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        this.isRewardedLoaded = false;
        this.loadRewarded(); // Preload next ad
      })
    );

    this.rewardedUnsubscribers.push(
      rewarded.addAdEventListener(AdEventType.ERROR, (error: unknown) => {
        console.warn('Rewarded ad error:', error);
        this.isRewardedLoaded = false;
      })
    );

    rewarded.load();
  }

  async showInterstitial(): Promise<boolean> {
    if (!this.isInterstitialLoaded || !this.interstitial) {
      return false;
    }

    try {
      await this.interstitial.show();
      return true;
    } catch (error) {
      console.warn('Failed to show interstitial:', error);
      return false;
    }
  }

  async showRewarded(onRewarded: () => void): Promise<boolean> {
    if (!this.isRewardedLoaded || !this.rewarded) {
      return false;
    }

    return new Promise((resolve) => {
      const unsubscribe = this.rewarded!.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          onRewarded();
          unsubscribe();
        }
      );

      this.rewarded!.show().then(() => {
        resolve(true);
      }).catch((error: unknown) => {
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
