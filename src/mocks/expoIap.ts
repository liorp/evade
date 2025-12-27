// Mock for expo-iap when running in Expo Go
// Real IAP will only work in development builds

export interface ProductOrSubscription {
  id: string;
  displayPrice: string;
  displayName: string;
  description: string;
}

export interface Purchase {
  id: string;
  transactionId: string;
}

export interface RequestPurchasePropsByPlatforms {
  sku?: string;
  skus?: string[];
}

export interface FetchProductsParams {
  skus: string[];
  type: 'in-app' | 'subscription';
}

export interface RequestPurchaseParams {
  request: RequestPurchasePropsByPlatforms;
  type: 'in-app' | 'subscription';
}

const mockProducts: ProductOrSubscription[] = [
  { id: 'remove_ads', displayPrice: '$3.99', displayName: 'Remove Ads', description: 'Remove all ads' },
  { id: 'shards_100', displayPrice: '$0.99', displayName: '100 Shards', description: '100 shards pack' },
  { id: 'shards_500', displayPrice: '$3.99', displayName: '500 Shards', description: '500 shards pack' },
  { id: 'shards_1500', displayPrice: '$9.99', displayName: '1500 Shards', description: '1500 shards pack' },
];

export async function initConnection(): Promise<boolean> {
  console.log('[Mock] IAP connection initialized');
  return true;
}

export async function endConnection(): Promise<void> {
  console.log('[Mock] IAP connection ended');
}

export async function fetchProducts(params: FetchProductsParams): Promise<ProductOrSubscription[]> {
  console.log('[Mock] Fetching products:', params.skus);
  return mockProducts.filter((p) => params.skus.includes(p.id));
}

export async function requestPurchase(params: RequestPurchaseParams): Promise<Purchase> {
  const sku = params.request.sku || params.request.skus?.[0] || '';
  console.log('[Mock] Purchase requested for:', sku);
  // Simulate successful purchase in dev mode
  return { id: sku, transactionId: `mock-${Date.now()}` };
}

export async function getAvailablePurchases(): Promise<Purchase[]> {
  console.log('[Mock] Getting available purchases');
  // Return empty in mock - no previous purchases
  return [];
}
