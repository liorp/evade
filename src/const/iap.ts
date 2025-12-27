import { Platform } from 'react-native';

export const IAP_PRODUCTS = {
  REMOVE_ADS: Platform.select({
    ios: 'com.anonymous.evade.removeads',
    android: 'remove_ads',
    default: 'remove_ads',
  }),
} as const;

export const IAP_PRICES = {
  REMOVE_ADS: '$3.99',
} as const;
