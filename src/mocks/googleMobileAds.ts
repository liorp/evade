// Mock for react-native-google-mobile-ads when running in Expo Go
// Real ads will only work in development builds

type AdEventCallback = (error?: Error) => void;
type RewardCallback = (reward: { type: string; amount: number }) => void;

export const AdEventType = {
  LOADED: 'loaded',
  CLOSED: 'closed',
  ERROR: 'error',
  OPENED: 'opened',
  CLICKED: 'clicked',
} as const;

export const RewardedAdEventType = {
  LOADED: 'loaded',
  EARNED_REWARD: 'earned_reward',
} as const;

class MockInterstitialAd {
  private listeners: Map<string, AdEventCallback[]> = new Map();

  static createForAdRequest(_adUnitId: string, _options?: object): MockInterstitialAd {
    return new MockInterstitialAd();
  }

  addAdEventListener(event: string, callback: AdEventCallback): () => void {
    const existing = this.listeners.get(event) || [];
    this.listeners.set(event, [...existing, callback]);
    return () => {
      const callbacks = this.listeners.get(event) || [];
      this.listeners.set(event, callbacks.filter((cb) => cb !== callback));
    };
  }

  load(): void {
    // Simulate ad loading after a short delay
    setTimeout(() => {
      const callbacks = this.listeners.get(AdEventType.LOADED) || [];
      callbacks.forEach((cb) => cb());
    }, 500);
  }

  async show(): Promise<void> {
    console.log('[Mock] Interstitial ad would show here');
    // Simulate ad display
    setTimeout(() => {
      const callbacks = this.listeners.get(AdEventType.CLOSED) || [];
      callbacks.forEach((cb) => cb());
    }, 100);
  }
}

class MockRewardedAd {
  private listeners: Map<string, (AdEventCallback | RewardCallback)[]> = new Map();

  static createForAdRequest(_adUnitId: string, _options?: object): MockRewardedAd {
    return new MockRewardedAd();
  }

  addAdEventListener(event: string, callback: AdEventCallback | RewardCallback): () => void {
    const existing = this.listeners.get(event) || [];
    this.listeners.set(event, [...existing, callback]);
    return () => {
      const callbacks = this.listeners.get(event) || [];
      this.listeners.set(event, callbacks.filter((cb) => cb !== callback));
    };
  }

  load(): void {
    // Simulate ad loading after a short delay
    setTimeout(() => {
      const callbacks = this.listeners.get(RewardedAdEventType.LOADED) || [];
      callbacks.forEach((cb) => (cb as AdEventCallback)());
    }, 500);
  }

  async show(): Promise<void> {
    console.log('[Mock] Rewarded ad would show here - granting reward');
    // Simulate earning reward
    setTimeout(() => {
      const rewardCallbacks = this.listeners.get(RewardedAdEventType.EARNED_REWARD) || [];
      rewardCallbacks.forEach((cb) => (cb as RewardCallback)({ type: 'coins', amount: 1 }));

      const closedCallbacks = this.listeners.get(AdEventType.CLOSED) || [];
      closedCallbacks.forEach((cb) => (cb as AdEventCallback)());
    }, 100);
  }
}

export const InterstitialAd = MockInterstitialAd;
export const RewardedAd = MockRewardedAd;
