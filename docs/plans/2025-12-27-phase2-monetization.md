# Phase 2: Basic Monetization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add ads (interstitial every 3 deaths, rewarded continue) and ad-removal IAP to monetize Evade.

**Architecture:** Use react-native-google-mobile-ads for AdMob integration, expo-iap for in-app purchases. Create stores for ad state and purchase state. Requires EAS development builds (not Expo Go).

**Tech Stack:** react-native-google-mobile-ads, expo-iap, Zustand, EAS Build

---

## Prerequisites

This phase requires:
1. **EAS CLI**: `npm install -g eas-cli`
2. **AdMob Account**: Create at https://admob.google.com
3. **App Store Connect / Google Play Console**: For IAP testing

**Test Ad IDs** (use during development):
- Interstitial: `ca-app-pub-3940256099942544/1033173712`
- Rewarded: `ca-app-pub-3940256099942544/5224354917`

---

## Task 1: Install Ad SDK Dependencies

**Files:**
- Modify: `package.json`
- Modify: `app.json`

**Step 1: Install react-native-google-mobile-ads**

```bash
npx expo install react-native-google-mobile-ads
```

**Step 2: Configure app.json**

Add the AdMob configuration outside the "expo" block:

```json
{
  "expo": {
    ...existing config...
  },
  "react-native-google-mobile-ads": {
    "android_app_id": "ca-app-pub-3940256099942544~3347511713",
    "ios_app_id": "ca-app-pub-3940256099942544~1458002511"
  }
}
```

Note: These are Google's test app IDs. Replace with real IDs before production.

**Step 3: Commit**

```bash
git add package.json package-lock.json app.json
git commit -m "feat: install react-native-google-mobile-ads"
```

---

## Task 2: Create Ad Constants

**Files:**
- Create: `src/const/ads.ts`

**Step 1: Create ad constants file**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/const/ads.ts
git commit -m "feat: add ad configuration constants"
```

---

## Task 3: Create Ad State Store

**Files:**
- Create: `src/state/adStore.ts`

**Step 1: Create Zustand store for ad state**

```typescript
import { create } from 'zustand';

interface AdState {
  // Session tracking
  deathCount: number;
  lastAdDeathCount: number;

  // Rewarded ad state
  hasUsedContinue: boolean; // Only one continue per run
  watchedRewardedThisRun: boolean; // Skip interstitial if watched rewarded

  // Purchase state
  adsRemoved: boolean;

  // Actions
  incrementDeathCount: () => void;
  resetRunState: () => void; // Reset per-run state (continue used, rewarded watched)
  resetSessionState: () => void; // Reset all session state
  markAdShown: () => void;
  markContinueUsed: () => void;
  markRewardedWatched: () => void;
  setAdsRemoved: (removed: boolean) => void;

  // Computed
  shouldShowInterstitial: () => boolean;
  canUseContinue: () => boolean;
}

export const useAdStore = create<AdState>()((set, get) => ({
  deathCount: 0,
  lastAdDeathCount: 0,
  hasUsedContinue: false,
  watchedRewardedThisRun: false,
  adsRemoved: false,

  incrementDeathCount: () => set((state) => ({ deathCount: state.deathCount + 1 })),

  resetRunState: () => set({
    hasUsedContinue: false,
    watchedRewardedThisRun: false,
  }),

  resetSessionState: () => set({
    deathCount: 0,
    lastAdDeathCount: 0,
    hasUsedContinue: false,
    watchedRewardedThisRun: false,
  }),

  markAdShown: () => set((state) => ({ lastAdDeathCount: state.deathCount })),

  markContinueUsed: () => set({ hasUsedContinue: true }),

  markRewardedWatched: () => set({ watchedRewardedThisRun: true }),

  setAdsRemoved: (removed) => set({ adsRemoved: removed }),

  shouldShowInterstitial: () => {
    const state = get();
    // Don't show if ads removed
    if (state.adsRemoved) return false;
    // Don't show if watched rewarded this run
    if (state.watchedRewardedThisRun) return false;
    // Don't show on first death
    if (state.deathCount < 2) return false;
    // Show every 3 deaths since last ad
    return (state.deathCount - state.lastAdDeathCount) >= 3;
  },

  canUseContinue: () => {
    const state = get();
    return !state.hasUsedContinue;
  },
}));
```

**Step 2: Commit**

```bash
git add src/state/adStore.ts
git commit -m "feat: add ad state store"
```

---

## Task 4: Create Ad Manager Service

**Files:**
- Create: `src/ads/adManager.ts`

**Step 1: Create ad manager singleton**

```typescript
import {
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '../const/ads';

type AdLoadCallback = () => void;
type AdRewardCallback = () => void;
type AdErrorCallback = (error: Error) => void;

class AdManager {
  private interstitial: InterstitialAd | null = null;
  private rewarded: RewardedAd | null = null;
  private isInterstitialLoaded = false;
  private isRewardedLoaded = false;

  async initialize(): Promise<void> {
    this.loadInterstitial();
    this.loadRewarded();
  }

  private loadInterstitial(): void {
    this.interstitial = InterstitialAd.createForAdRequest(AD_UNIT_IDS.interstitial, {
      requestNonPersonalizedAdsOnly: true,
    });

    this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
      this.isInterstitialLoaded = true;
    });

    this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      this.isInterstitialLoaded = false;
      this.loadInterstitial(); // Preload next ad
    });

    this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.warn('Interstitial ad error:', error);
      this.isInterstitialLoaded = false;
    });

    this.interstitial.load();
  }

  private loadRewarded(): void {
    this.rewarded = RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded, {
      requestNonPersonalizedAdsOnly: true,
    });

    this.rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      this.isRewardedLoaded = true;
    });

    this.rewarded.addAdEventListener(RewardedAdEventType.CLOSED, () => {
      this.isRewardedLoaded = false;
      this.loadRewarded(); // Preload next ad
    });

    this.rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
      console.warn('Rewarded ad error:', error);
      this.isRewardedLoaded = false;
    });

    this.rewarded.load();
  }

  async showInterstitial(): Promise<boolean> {
    if (!this.isInterstitialLoaded || !this.interstitial) {
      return false;
    }

    try {
      await this.interstitial.show();
      return true;
    } catch (error) {
      console.warn('Failed to show interstitial:', error);
      return false;
    }
  }

  async showRewarded(onRewarded: () => void): Promise<boolean> {
    if (!this.isRewardedLoaded || !this.rewarded) {
      return false;
    }

    return new Promise((resolve) => {
      const unsubscribe = this.rewarded!.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          onRewarded();
          unsubscribe();
        }
      );

      this.rewarded!.show().then(() => {
        resolve(true);
      }).catch((error) => {
        console.warn('Failed to show rewarded:', error);
        unsubscribe();
        resolve(false);
      });
    });
  }

  isInterstitialReady(): boolean {
    return this.isInterstitialLoaded;
  }

  isRewardedReady(): boolean {
    return this.isRewardedLoaded;
  }
}

export const adManager = new AdManager();
```

**Step 2: Commit**

```bash
git add src/ads/adManager.ts
git commit -m "feat: add ad manager service"
```

---

## Task 5: Add Continue Support to GameEngine

**Files:**
- Modify: `src/game/GameEngine.ts`

**Step 1: Add continue method**

Add this method to the GameEngine class:

```typescript
continueGame(shieldDuration: number): void {
  if (!this.state.isGameOver) return;

  // Reset game over state
  this.state.isGameOver = false;
  this.state.isRunning = true;
  this.state.isPaused = true; // Wait for touch to resume

  // Activate shield
  const now = performance.now();
  this.state.activeEffects.shield.active = true;
  this.state.activeEffects.shield.endTime = now + shieldDuration;

  // Clear nearby enemies for safety
  this.state.enemies = this.state.enemies.filter(
    (enemy) =>
      Math.hypot(
        enemy.position.x - this.state.playerPosition.x,
        enemy.position.y - this.state.playerPosition.y
      ) > GAME.PLAYER_RADIUS + GAME.ENEMY_RADIUS + 100
  );

  this.lastTimestamp = now;
  this.emit('stateChange');
  this.loop(now);
}
```

**Step 2: Commit**

```bash
git add src/game/GameEngine.ts
git commit -m "feat: add continue game support to GameEngine"
```

---

## Task 6: Create Continue Modal Component

**Files:**
- Create: `src/components/ContinueModal.tsx`

**Step 1: Create the continue modal**

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../const/colors';
import { adManager } from '../ads/adManager';

interface ContinueModalProps {
  visible: boolean;
  canContinue: boolean;
  onContinue: () => void;
  onDecline: () => void;
}

export const ContinueModal: React.FC<ContinueModalProps> = ({
  visible,
  canContinue,
  onContinue,
  onDecline,
}) => {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setCountdown(3);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible, onDecline]);

  const handleWatchAd = async () => {
    setIsLoading(true);
    const success = await adManager.showRewarded(() => {
      onContinue();
    });
    setIsLoading(false);

    if (!success) {
      // Ad failed to show, just decline
      onDecline();
    }
  };

  if (!visible || !canContinue) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>{t('continue.title', 'Continue?')}</Text>
        <Text style={styles.countdown}>{countdown}</Text>

        <Pressable
          style={[styles.button, styles.continueButton]}
          onPress={handleWatchAd}
          disabled={isLoading || !adManager.isRewardedReady()}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {t('continue.watchAd', 'Watch Ad to Continue')}
            </Text>
          )}
        </Pressable>

        <Pressable style={[styles.button, styles.declineButton]} onPress={onDecline}>
          <Text style={styles.buttonText}>{t('continue.decline', 'No Thanks')}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  modal: {
    backgroundColor: '#1a1a2e',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 280,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  countdown: {
    fontSize: 64,
    fontWeight: 'bold',
    color: COLORS.player,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 220,
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#44bb44',
  },
  declineButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
```

**Step 2: Commit**

```bash
git add src/components/ContinueModal.tsx
git commit -m "feat: add continue modal component"
```

---

## Task 7: Add Continue Translations

**Files:**
- Modify: `src/i18n/locales/en.ts`

**Step 1: Add continue translations**

Add to the English locale file:

```typescript
continue: {
  title: 'Continue?',
  watchAd: 'Watch Ad to Continue',
  decline: 'No Thanks',
},
```

**Step 2: Commit**

```bash
git add src/i18n/locales/en.ts
git commit -m "feat: add continue modal translations"
```

---

## Task 8: Integrate Ads into Play Screen

**Files:**
- Modify: `src/screen/Play.tsx`

**Step 1: Import dependencies**

Add imports:

```typescript
import { ContinueModal } from '../components/ContinueModal';
import { useAdStore } from '../state/adStore';
import { adManager } from '../ads/adManager';
import { AD_CONFIG } from '../const/ads';
```

**Step 2: Add ad store usage**

In the PlayScreen component:

```typescript
const {
  incrementDeathCount,
  resetRunState,
  markAdShown,
  markContinueUsed,
  markRewardedWatched,
  shouldShowInterstitial,
  canUseContinue,
} = useAdStore();

const [showContinueModal, setShowContinueModal] = useState(false);
const [pendingGameOver, setPendingGameOver] = useState(false);
```

**Step 3: Update game over handling**

Modify the gameOver event handler:

```typescript
if (event === 'gameOver') {
  incrementDeathCount();

  // Check if player can use continue
  if (canUseContinue() && adManager.isRewardedReady()) {
    setPendingGameOver(true);
    setShowContinueModal(true);
  } else {
    handleActualGameOver();
  }
}
```

**Step 4: Add game over helper**

```typescript
const handleActualGameOver = async () => {
  setIsGameOver(true);
  const finalScore = gameEngine.current?.getState().score ?? 0;
  if (finalScore > 0) {
    addScore(finalScore);
  }
  if (sfxEnabled) {
    audioManager.playGameOver();
  }

  // Show interstitial if needed
  if (shouldShowInterstitial()) {
    await adManager.showInterstitial();
    markAdShown();
  }
};
```

**Step 5: Add continue handlers**

```typescript
const handleContinue = () => {
  setShowContinueModal(false);
  setPendingGameOver(false);
  markContinueUsed();
  markRewardedWatched();
  gameEngine.current?.continueGame(AD_CONFIG.CONTINUE_SHIELD_DURATION);
};

const handleDeclineContinue = () => {
  setShowContinueModal(false);
  setPendingGameOver(false);
  handleActualGameOver();
};
```

**Step 6: Update handleRetry**

Add to handleRetry:

```typescript
resetRunState(); // Reset continue used and rewarded watched flags
```

**Step 7: Add ContinueModal to JSX**

Before the game over overlay:

```typescript
<ContinueModal
  visible={showContinueModal}
  canContinue={canUseContinue()}
  onContinue={handleContinue}
  onDecline={handleDeclineContinue}
/>
```

**Step 8: Commit**

```bash
git add src/screen/Play.tsx
git commit -m "feat: integrate ads and continue system into Play screen"
```

---

## Task 9: Initialize Ads on App Start

**Files:**
- Modify: `App.tsx`

**Step 1: Import and initialize ad manager**

```typescript
import { useEffect } from 'react';
import { adManager } from './src/ads/adManager';

// Inside App component, before return:
useEffect(() => {
  adManager.initialize();
}, []);
```

**Step 2: Commit**

```bash
git add App.tsx
git commit -m "feat: initialize ad manager on app start"
```

---

## Task 10: Install IAP Dependencies

**Files:**
- Modify: `package.json`
- Modify: `app.json`

**Step 1: Install expo-iap**

```bash
npx expo install expo-iap
```

**Step 2: Add expo-iap plugin to app.json**

In the expo.plugins array:

```json
{
  "expo": {
    "plugins": [
      "expo-iap"
    ]
  }
}
```

**Step 3: Commit**

```bash
git add package.json package-lock.json app.json
git commit -m "feat: install expo-iap for in-app purchases"
```

---

## Task 11: Create IAP Constants

**Files:**
- Create: `src/const/iap.ts`

**Step 1: Create IAP product constants**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/const/iap.ts
git commit -m "feat: add IAP product constants"
```

---

## Task 12: Create Purchase Store

**Files:**
- Create: `src/state/purchaseStore.ts`

**Step 1: Create persisted purchase store**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PurchaseState {
  adsRemoved: boolean;
  purchaseDate: string | null;
  setAdsRemoved: (removed: boolean) => void;
}

export const usePurchaseStore = create<PurchaseState>()(
  persist(
    (set) => ({
      adsRemoved: false,
      purchaseDate: null,
      setAdsRemoved: (removed) =>
        set({
          adsRemoved: removed,
          purchaseDate: removed ? new Date().toISOString() : null,
        }),
    }),
    {
      name: 'evade-purchases',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Step 2: Commit**

```bash
git add src/state/purchaseStore.ts
git commit -m "feat: add purchase state store"
```

---

## Task 13: Create IAP Manager Service

**Files:**
- Create: `src/iap/iapManager.ts`

**Step 1: Create IAP manager**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/iap/iapManager.ts
git commit -m "feat: add IAP manager service"
```

---

## Task 14: Add Remove Ads Button to Settings

**Files:**
- Modify: `src/screen/Settings.tsx`

**Step 1: Import dependencies**

```typescript
import { usePurchaseStore } from '../state/purchaseStore';
import { useAdStore } from '../state/adStore';
import { iapManager } from '../iap/iapManager';
import { IAP_PRICES } from '../const/iap';
```

**Step 2: Add purchase state and handlers**

```typescript
const { adsRemoved, setAdsRemoved } = usePurchaseStore();
const { setAdsRemoved: setAdStoreAdsRemoved } = useAdStore();

const handlePurchaseRemoveAds = async () => {
  const success = await iapManager.purchaseRemoveAds();
  if (success) {
    setAdsRemoved(true);
    setAdStoreAdsRemoved(true);
  }
};

const handleRestorePurchases = async () => {
  const hasRemoveAds = await iapManager.restorePurchases();
  if (hasRemoveAds) {
    setAdsRemoved(true);
    setAdStoreAdsRemoved(true);
  }
};
```

**Step 3: Add UI for remove ads**

Add in the settings list (before or after other settings):

```typescript
{!adsRemoved && (
  <Pressable style={styles.settingRow} onPress={handlePurchaseRemoveAds}>
    <Text style={styles.settingLabel}>{t('settings.removeAds', 'Remove Ads')}</Text>
    <Text style={styles.settingValue}>{IAP_PRICES.REMOVE_ADS}</Text>
  </Pressable>
)}

{adsRemoved && (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{t('settings.adsRemoved', 'Ads Removed')}</Text>
    <Text style={[styles.settingValue, { color: '#44bb44' }]}>✓</Text>
  </View>
)}

<Pressable style={styles.settingRow} onPress={handleRestorePurchases}>
  <Text style={styles.settingLabel}>{t('settings.restorePurchases', 'Restore Purchases')}</Text>
</Pressable>
```

**Step 4: Commit**

```bash
git add src/screen/Settings.tsx
git commit -m "feat: add remove ads purchase option to settings"
```

---

## Task 15: Sync Purchase State on App Start

**Files:**
- Modify: `App.tsx`

**Step 1: Import and sync purchase state**

```typescript
import { usePurchaseStore } from './src/state/purchaseStore';
import { useAdStore } from './src/state/adStore';
import { iapManager } from './src/iap/iapManager';

// Inside App component:
const { adsRemoved } = usePurchaseStore();
const { setAdsRemoved } = useAdStore();

useEffect(() => {
  // Sync purchase state to ad store
  setAdsRemoved(adsRemoved);

  // Initialize IAP
  iapManager.initialize();

  return () => {
    iapManager.disconnect();
  };
}, [adsRemoved]);
```

**Step 2: Commit**

```bash
git add App.tsx
git commit -m "feat: sync purchase state and initialize IAP on app start"
```

---

## Task 16: Add Settings Translations

**Files:**
- Modify: `src/i18n/locales/en.ts`

**Step 1: Add IAP translations**

```typescript
settings: {
  // ...existing translations...
  removeAds: 'Remove Ads',
  adsRemoved: 'Ads Removed',
  restorePurchases: 'Restore Purchases',
},
```

**Step 2: Commit**

```bash
git add src/i18n/locales/en.ts
git commit -m "feat: add IAP-related translations"
```

---

## Task 17: Create EAS Build Configuration

**Files:**
- Create: `eas.json`

**Step 1: Create EAS build config**

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

**Step 2: Commit**

```bash
git add eas.json
git commit -m "feat: add EAS build configuration"
```

---

## Task 18: Final Integration Test

**Step 1: Build development client**

```bash
eas build --profile development --platform ios
# or for Android:
eas build --profile development --platform android
```

**Step 2: Install and test**

Verify:
- [ ] App loads without Expo Go (development build)
- [ ] Interstitial ad shows after 3 deaths
- [ ] Continue modal appears on death (before 3rd death ad)
- [ ] Rewarded ad plays and continues game with shield
- [ ] No interstitial after using continue (same run)
- [ ] Remove Ads button appears in Settings
- [ ] Purchase flow works (use sandbox testing)
- [ ] After purchase, no more interstitial ads

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: Phase 2 Monetization complete

- Interstitial ads every 3 deaths
- Rewarded ad continue system
- Ad removal IAP ($3.99)
- EAS build configuration"
```

---

## Notes

### Testing Without Real Ads

During development, the code uses Google's test ad unit IDs which always show test ads. These don't require an AdMob account.

### Production Checklist

Before releasing:
1. Replace test ad IDs with production IDs in `src/const/ads.ts`
2. Replace test app IDs in `app.json`
3. Create actual products in App Store Connect / Google Play Console
4. Update product IDs in `src/const/iap.ts`
5. Test purchase flow with sandbox accounts

### Dependencies Added

- `react-native-google-mobile-ads` - AdMob integration
- `expo-iap` - In-app purchases

### New Files Created

- `src/const/ads.ts` - Ad configuration
- `src/const/iap.ts` - IAP product IDs
- `src/state/adStore.ts` - Ad state management
- `src/state/purchaseStore.ts` - Purchase persistence
- `src/ads/adManager.ts` - Ad loading/showing
- `src/iap/iapManager.ts` - Purchase handling
- `src/components/ContinueModal.tsx` - Continue UI
- `eas.json` - EAS Build config
