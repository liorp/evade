import { Platform } from 'react-native';

export const IAP_PRODUCTS = {
  REMOVE_ADS: Platform.select({
    ios: 'com.anonymous.evade.removeads',
    android: 'remove_ads',
    default: 'remove_ads',
  }),
  SHARDS_100: Platform.select({
    ios: 'com.anonymous.evade.shards100',
    android: 'shards_100',
    default: 'shards_100',
  }),
  SHARDS_500: Platform.select({
    ios: 'com.anonymous.evade.shards500',
    android: 'shards_500',
    default: 'shards_500',
  }),
  SHARDS_1500: Platform.select({
    ios: 'com.anonymous.evade.shards1500',
    android: 'shards_1500',
    default: 'shards_1500',
  }),
} as const;

export const IAP_PRICES = {
  REMOVE_ADS: '$3.99',
  SHARDS_100: '$0.99',
  SHARDS_500: '$3.99',
  SHARDS_1500: '$9.99',
} as const;

export const SHARD_PACKS = [
  { productId: IAP_PRODUCTS.SHARDS_100, shards: 100, price: IAP_PRICES.SHARDS_100 },
  { productId: IAP_PRODUCTS.SHARDS_500, shards: 500, price: IAP_PRICES.SHARDS_500, bonus: '20% bonus' },
  { productId: IAP_PRODUCTS.SHARDS_1500, shards: 1500, price: IAP_PRICES.SHARDS_1500, bonus: '50% bonus' },
] as const;
