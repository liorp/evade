import * as ExpoIAP from 'expo-iap';
import { Platform } from 'react-native';
import { IAP_PRODUCTS } from '../const/iap';

class IAPManager {
  private isInitialized = false;
  private products: ExpoIAP.Product[] = [];

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
      const sku = IAP_PRODUCTS.REMOVE_ADS as string;
      // Use fetchProducts with correct API
      this.products = await ExpoIAP.fetchProducts({
        skus: [sku],
        type: 'inapp',
      });
    } catch (error) {
      console.warn('Failed to load products:', error);
    }
  }

  async purchaseRemoveAds(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const sku = IAP_PRODUCTS.REMOVE_ADS as string;
      // Use correct requestPurchase API
      await ExpoIAP.requestPurchase({
        request: Platform.select({
          ios: { sku },
          android: { skus: [sku] },
          default: { sku },
        }) as ExpoIAP.RequestPurchaseIOS | ExpoIAP.RequestPurchaseAndroid,
        type: 'inapp',
      });
      return true;
    } catch (error) {
      console.warn('Purchase failed:', error);
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
      // Product has 'id' not 'productId'
      const hasRemoveAds = purchases.some((p) => p.id === sku);
      return hasRemoveAds;
    } catch (error) {
      console.warn('Restore failed:', error);
      return false;
    }
  }

  getRemoveAdsPrice(): string {
    const sku = IAP_PRODUCTS.REMOVE_ADS as string;
    // Product has 'id' and 'displayPrice'
    const product = this.products.find((p) => p.id === sku);
    return product?.displayPrice ?? '$3.99';
  }

  async disconnect(): Promise<void> {
    if (this.isInitialized) {
      await ExpoIAP.endConnection();
      this.isInitialized = false;
    }
  }
}

export const iapManager = new IAPManager();
