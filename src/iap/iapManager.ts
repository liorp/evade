import * as ExpoIAP from 'expo-iap';
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
      const productIds = [IAP_PRODUCTS.REMOVE_ADS];
      this.products = await ExpoIAP.getProducts(productIds);
    } catch (error) {
      console.warn('Failed to load products:', error);
    }
  }

  async purchaseRemoveAds(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      await ExpoIAP.requestPurchase(IAP_PRODUCTS.REMOVE_ADS);
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
      const hasRemoveAds = purchases.some(
        (p) => p.productId === IAP_PRODUCTS.REMOVE_ADS
      );
      return hasRemoveAds;
    } catch (error) {
      console.warn('Restore failed:', error);
      return false;
    }
  }

  getRemoveAdsPrice(): string {
    const product = this.products.find(
      (p) => p.productId === IAP_PRODUCTS.REMOVE_ADS
    );
    return product?.localizedPrice ?? '$3.99';
  }

  async disconnect(): Promise<void> {
    if (this.isInitialized) {
      await ExpoIAP.endConnection();
      this.isInitialized = false;
    }
  }
}

export const iapManager = new IAPManager();
