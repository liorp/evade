import { Platform } from 'react-native';
import { isExpoGo } from '../utils/environment';
import { IAP_PRODUCTS } from '../const/iap';
import { trackIapInitiated, trackIapCompleted, trackIapFailed } from '../analytics';
import type { ProductOrSubscription, RequestPurchasePropsByPlatforms, Purchase } from '../mocks/expoIap';

// Conditionally import real or mock IAP
const ExpoIAP = isExpoGo
  ? require('../mocks/expoIap')
  : require('expo-iap');

class IAPManager {
  private isInitialized = false;
  private products: ProductOrSubscription[] = [];

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await ExpoIAP.initConnection();
      this.isInitialized = true;
      await this.loadProducts();
    } catch (error) {
      console.warn('IAP initialization failed:', error);
    }
  }

  private async loadProducts(): Promise<void> {
    try {
      const productIds = [
        IAP_PRODUCTS.REMOVE_ADS,
        IAP_PRODUCTS.SHARDS_100,
        IAP_PRODUCTS.SHARDS_500,
        IAP_PRODUCTS.SHARDS_1500,
      ];
      const result = await ExpoIAP.fetchProducts({
        skus: productIds as string[],
        type: 'in-app',
      });
      this.products = result ?? [];
    } catch (error) {
      console.warn('Failed to load products:', error);
    }
  }

  async purchaseRemoveAds(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const productId = IAP_PRODUCTS.REMOVE_ADS as string;
    const price = this.getRemoveAdsPrice();

    trackIapInitiated({ product_id: productId, price });

    try {
      const request = Platform.select({
        ios: { sku: productId },
        android: { skus: [productId] },
        default: { sku: productId },
      }) as RequestPurchasePropsByPlatforms;
      await ExpoIAP.requestPurchase({ request, type: 'in-app' });
      trackIapCompleted({ product_id: productId, price });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      trackIapFailed({ product_id: productId, error: errorMessage });
      console.warn('Purchase failed:', error);
      return false;
    }
  }

  async purchaseShards(productId: string, shardsGranted?: number): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const price = this.getProductPrice(productId);

    trackIapInitiated({ product_id: productId, price });

    try {
      const request = Platform.select({
        ios: { sku: productId },
        android: { skus: [productId] },
        default: { sku: productId },
      }) as RequestPurchasePropsByPlatforms;
      await ExpoIAP.requestPurchase({ request, type: 'in-app' });
      trackIapCompleted({ product_id: productId, price, shards_granted: shardsGranted });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      trackIapFailed({ product_id: productId, error: errorMessage });
      console.warn('Shard purchase failed:', error);
      return false;
    }
  }

  async restorePurchases(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const purchases = await ExpoIAP.getAvailablePurchases();
      const sku = IAP_PRODUCTS.REMOVE_ADS as string;
      const hasRemoveAds = purchases.some((p: Purchase) => p.id === sku);
      return hasRemoveAds;
    } catch (error) {
      console.warn('Restore failed:', error);
      return false;
    }
  }

  getRemoveAdsPrice(): string {
    const sku = IAP_PRODUCTS.REMOVE_ADS as string;
    const product = this.products.find((p) => p.id === sku);
    return product?.displayPrice ?? '$3.99';
  }

  getProductPrice(productId: string): string {
    const product = this.products.find((p) => p.id === productId);
    return product?.displayPrice ?? '';
  }

  async disconnect(): Promise<void> {
    if (this.isInitialized) {
      await ExpoIAP.endConnection();
      this.isInitialized = false;
    }
  }
}

export const iapManager = new IAPManager();
