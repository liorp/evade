// Web ads implementation using Google AdSense
// Simulates interstitial and rewarded ad behavior with modal overlays

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

// Event bus for communicating between ad classes and React components
type WebAdEventType = 'showInterstitial' | 'showRewarded' | 'adClosed' | 'rewardEarned';
type WebAdEventListener = (data?: unknown) => void;

class WebAdEventBus {
  private listeners: Map<WebAdEventType, WebAdEventListener[]> = new Map();

  on(event: WebAdEventType, callback: WebAdEventListener): () => void {
    const existing = this.listeners.get(event) || [];
    this.listeners.set(event, [...existing, callback]);
    return () => {
      const callbacks = this.listeners.get(event) || [];
      this.listeners.set(
        event,
        callbacks.filter((cb) => cb !== callback),
      );
    };
  }

  emit(event: WebAdEventType, data?: unknown): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((cb) => {
      cb(data);
    });
  }
}

export const webAdEventBus = new WebAdEventBus();

class WebInterstitialAd {
  private listeners: Map<string, AdEventCallback[]> = new Map();
  private adUnitId: string;

  constructor(adUnitId: string) {
    this.adUnitId = adUnitId;
  }

  static createForAdRequest(adUnitId: string, _options?: object): WebInterstitialAd {
    return new WebInterstitialAd(adUnitId);
  }

  addAdEventListener(event: string, callback: AdEventCallback): () => void {
    const existing = this.listeners.get(event) || [];
    this.listeners.set(event, [...existing, callback]);
    return () => {
      const callbacks = this.listeners.get(event) || [];
      this.listeners.set(
        event,
        callbacks.filter((cb) => cb !== callback),
      );
    };
  }

  private emit(event: string, error?: Error): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((cb) => {
      cb(error);
    });
  }

  load(): void {
    // Web ads are always "loaded" since we use AdSense auto-fill
    setTimeout(() => {
      this.emit(AdEventType.LOADED);
    }, 100);
  }

  async show(): Promise<void> {
    return new Promise((resolve) => {
      // Listen for close event from the modal
      const unsubscribe = webAdEventBus.on('adClosed', () => {
        unsubscribe();
        this.emit(AdEventType.CLOSED);
        resolve();
      });

      // Tell the React component to show the interstitial modal
      webAdEventBus.emit('showInterstitial', { adUnitId: this.adUnitId });
    });
  }
}

class WebRewardedAd {
  private listeners: Map<string, (AdEventCallback | RewardCallback)[]> = new Map();
  private adUnitId: string;

  constructor(adUnitId: string) {
    this.adUnitId = adUnitId;
  }

  static createForAdRequest(adUnitId: string, _options?: object): WebRewardedAd {
    return new WebRewardedAd(adUnitId);
  }

  addAdEventListener(event: string, callback: AdEventCallback | RewardCallback): () => void {
    const existing = this.listeners.get(event) || [];
    this.listeners.set(event, [...existing, callback]);
    return () => {
      const callbacks = this.listeners.get(event) || [];
      this.listeners.set(
        event,
        callbacks.filter((cb) => cb !== callback),
      );
    };
  }

  private emit(event: string, data?: unknown): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((cb) => {
      if (event === RewardedAdEventType.EARNED_REWARD) {
        (cb as RewardCallback)(data as { type: string; amount: number });
      } else {
        (cb as AdEventCallback)(data as Error | undefined);
      }
    });
  }

  load(): void {
    // Web ads are always "loaded"
    setTimeout(() => {
      this.emit(RewardedAdEventType.LOADED);
    }, 100);
  }

  async show(): Promise<void> {
    return new Promise((resolve) => {
      // Listen for reward event
      const unsubscribeReward = webAdEventBus.on('rewardEarned', () => {
        unsubscribeReward();
        this.emit(RewardedAdEventType.EARNED_REWARD, { type: 'coins', amount: 1 });
      });

      // Listen for close event
      const unsubscribeClose = webAdEventBus.on('adClosed', () => {
        unsubscribeClose();
        this.emit(AdEventType.CLOSED);
        resolve();
      });

      // Tell the React component to show the rewarded modal
      webAdEventBus.emit('showRewarded', { adUnitId: this.adUnitId });
    });
  }
}

export const InterstitialAd = WebInterstitialAd;
export const RewardedAd = WebRewardedAd;
