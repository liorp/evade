import { initializeFirebaseAnalytics, logEvent } from './firebase';
import type {
  AdCompletedParams,
  AdFailedParams,
  AdShownParams,
  AppOpenedParams,
  BoosterCollectedParams,
  ContinueUsedParams,
  GameEndedParams,
  GameStartedParams,
  IapCompletedParams,
  IapFailedParams,
  IapInitiatedParams,
  ItemPreviewedParams,
  ItemPurchasedParams,
  SessionEndedParams,
  SettingChangedParams,
  ShardsChangedParams,
  ShopCategoryViewedParams,
} from './types';

export async function initAnalytics(): Promise<void> {
  await initializeFirebaseAnalytics();
}

// Session Events
export function trackAppOpened(params: AppOpenedParams): void {
  logEvent('app_opened', params);
}

export function trackSessionEnded(params: SessionEndedParams): void {
  logEvent('session_ended', params);
}

// Gameplay Events
export function trackGameStarted(params: GameStartedParams): void {
  logEvent('game_started', params);
}

export function trackGameEnded(params: GameEndedParams): void {
  logEvent('game_ended', params);
}

export function trackContinueUsed(params: ContinueUsedParams): void {
  logEvent('continue_used', params);
}

export function trackBoosterCollected(params: BoosterCollectedParams): void {
  logEvent('booster_collected', params);
}

// Monetization Events
export function trackAdShown(params: AdShownParams): void {
  logEvent('ad_shown', params);
}

export function trackAdCompleted(params: AdCompletedParams): void {
  logEvent('ad_completed', params);
}

export function trackAdFailed(params: AdFailedParams): void {
  logEvent('ad_failed', params);
}

export function trackIapInitiated(params: IapInitiatedParams): void {
  logEvent('iap_initiated', params);
}

export function trackIapCompleted(params: IapCompletedParams): void {
  logEvent('iap_completed', params);
}

export function trackIapFailed(params: IapFailedParams): void {
  logEvent('iap_failed', params);
}

export function trackShardsChanged(params: ShardsChangedParams): void {
  logEvent('shards_changed', params);
}

// Shop Events
export function trackShopOpened(): void {
  logEvent('shop_opened', {});
}

export function trackShopCategoryViewed(params: ShopCategoryViewedParams): void {
  logEvent('shop_category_viewed', params);
}

export function trackItemPreviewed(params: ItemPreviewedParams): void {
  logEvent('item_previewed', params);
}

export function trackItemPurchased(params: ItemPurchasedParams): void {
  logEvent('item_purchased', params);
}

// Settings Events
export function trackSettingChanged(params: SettingChangedParams): void {
  logEvent('setting_changed', params);
}
