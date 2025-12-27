// Event payload types for Firebase Analytics

export type AdType = 'interstitial' | 'rewarded';
export type AdPlacement = 'game_over' | 'continue' | 'shards';
export type ShardReason = 'earned' | 'spent' | 'purchased';
export type BoosterType = 'shield' | 'multiplier' | 'plus';

export interface AppOpenedParams {
  source: 'cold' | 'warm';
  app_version: string;
}

export interface SessionEndedParams {
  duration_seconds: number;
}

export interface GameStartedParams {
  cosmetics: string; // JSON string of equipped items
}

export interface GameEndedParams {
  score: number;
  duration_seconds: number;
  boosters_collected: number;
  continue_used: boolean;
}

export interface ContinueUsedParams {
  method: 'rewarded_ad';
  score_at_continue: number;
}

export interface BoosterCollectedParams {
  booster_type: BoosterType;
}

export interface AdShownParams {
  ad_type: AdType;
  placement: AdPlacement;
}

export interface AdCompletedParams {
  ad_type: AdType;
  placement: AdPlacement;
  reward_granted: boolean;
}

export interface AdFailedParams {
  ad_type: AdType;
  placement: AdPlacement;
  error: string;
}

export interface IapInitiatedParams {
  product_id: string;
  price: string;
}

export interface IapCompletedParams {
  product_id: string;
  price: string;
  shards_granted?: number;
}

export interface IapFailedParams {
  product_id: string;
  error: string;
}

export interface ShardsChangedParams {
  previous: number;
  new: number;
  reason: ShardReason;
}

export interface ShopCategoryViewedParams {
  category: string;
}

export interface ItemPreviewedParams {
  item_id: string;
  category: string;
  price: number;
}

export interface ItemPurchasedParams {
  item_id: string;
  category: string;
  price: number;
}

export interface SettingChangedParams {
  setting: string;
  old_value: string;
  new_value: string;
}
