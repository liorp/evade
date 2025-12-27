// Test ad unit IDs - replace with production IDs before release
export const AD_UNIT_IDS = {
  interstitial: __DEV__
    ? 'ca-app-pub-3940256099942544/1033173712' // Test ID
    : 'YOUR_PRODUCTION_INTERSTITIAL_ID',
  rewarded: __DEV__
    ? 'ca-app-pub-3940256099942544/5224354917' // Test ID
    : 'YOUR_PRODUCTION_REWARDED_ID',
} as const;

export const AD_CONFIG = {
  DEATHS_BETWEEN_ADS: 3, // Show interstitial every 3 deaths
  FIRST_AD_AFTER_DEATHS: 2, // No ad on first death, start counting from 2nd
  CONTINUE_SHIELD_DURATION: 2000, // 2 seconds of shield after continue
} as const;
