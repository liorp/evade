import {
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '../const/ads';

class AdManager {
  private interstitial: InterstitialAd | null = null;
  private rewarded: RewardedAd | null = null;
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

    this.interstitial = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial, {
      requestNonPersonalizedAdsOnly: true,
    });

    this.interstitialUnsubscribers.push(
      this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
        this.isInterstitialLoaded = true;
      })
    );

    this.interstitialUnsubscribers.push(
      this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
        this.isInterstitialLoaded = false;
        this.loadInterstitial(); // Preload next ad
      })
    );

    this.interstitialUnsubscribers.push(
      this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
        console.warn('Interstitial ad error:', error);
        this.isInterstitialLoaded = false;
      })
    );

    this.interstitial.load();
  }

  private loadRewarded(): void {
    this.cleanupRewarded();

    this.rewarded = RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded, {
      requestNonPersonalizedAdsOnly: true,
    });

    this.rewardedUnsubscribers.push(
      this.rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        this.isRewardedLoaded = true;
      })
    );

    this.rewardedUnsubscribers.push(
      this.rewarded.addAdEventListener(AdEventType.CLOSED, () => {
        this.isRewardedLoaded = false;
        this.loadRewarded(); // Preload next ad
      })
    );

    this.rewardedUnsubscribers.push(
      this.rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
        console.warn('Rewarded ad error:', error);
        this.isRewardedLoaded = false;
      })
    );

    this.rewarded.load();
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
      }).catch((error) => {
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
