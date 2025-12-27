# Phase 3+4: Full Cosmetics System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a complete cosmetics system with shards currency, player customization (colors, shapes, trails, glow), enemy themes, background themes, and a shop UI.

**Architecture:** Define all cosmetics as TypeScript constants with metadata (id, name, price, category). Use Zustand stores for currency (shardStore) and ownership (cosmeticStore). Modify Player/Enemy/Background components to accept theme props. Build Shop screen with category tabs and preview.

**Tech Stack:** React Native, Zustand (persist), react-native-reanimated, expo-iap (for shard packs)

---

## Task 1: Create Cosmetic Type Definitions

**Files:**
- Create: `src/const/cosmetics.ts`

**Step 1: Create cosmetic type definitions and catalog**

```typescript
// Player shape types
export type PlayerShape = 'circle' | 'square' | 'triangle' | 'hexagon' | 'star';

// Player colors (hex values)
export type PlayerColorId =
  | 'green' | 'cyan' | 'pink' | 'orange' | 'purple'
  | 'gold' | 'ice' | 'lime' | 'coral' | 'violet';

// Player trail types
export type PlayerTrail = 'none' | 'particle' | 'ghost' | 'rainbow' | 'fire';

// Player glow types
export type PlayerGlow = 'none' | 'pulse' | 'constant' | 'rgb';

// Enemy theme types
export type EnemyTheme = 'classic' | 'neon' | 'retro' | 'minimal' | 'spooky';

// Background theme types
export type BackgroundTheme = 'dark' | 'void' | 'synthwave' | 'ocean' | 'sunset';

// Cosmetic categories
export type CosmeticCategory = 'playerColor' | 'playerShape' | 'playerTrail' | 'playerGlow' | 'enemyTheme' | 'backgroundTheme';

// Cosmetic item interface
export interface CosmeticItem {
  id: string;
  category: CosmeticCategory;
  name: string;
  price: number; // in shards, 0 = free/default
  preview?: string; // hex color for color items
}

// Player color definitions
export const PLAYER_COLORS: Record<PlayerColorId, { name: string; hex: string; glowHex: string; price: number }> = {
  green: { name: 'Emerald', hex: '#00ffaa', glowHex: 'rgba(0, 255, 170, 0.4)', price: 0 },
  cyan: { name: 'Cyan', hex: '#00ffff', glowHex: 'rgba(0, 255, 255, 0.4)', price: 100 },
  pink: { name: 'Hot Pink', hex: '#ff44aa', glowHex: 'rgba(255, 68, 170, 0.4)', price: 100 },
  orange: { name: 'Blaze', hex: '#ff8800', glowHex: 'rgba(255, 136, 0, 0.4)', price: 150 },
  purple: { name: 'Violet', hex: '#aa44ff', glowHex: 'rgba(170, 68, 255, 0.4)', price: 150 },
  gold: { name: 'Gold', hex: '#ffd700', glowHex: 'rgba(255, 215, 0, 0.4)', price: 200 },
  ice: { name: 'Ice Blue', hex: '#88ddff', glowHex: 'rgba(136, 221, 255, 0.4)', price: 200 },
  lime: { name: 'Lime', hex: '#aaff00', glowHex: 'rgba(170, 255, 0, 0.4)', price: 150 },
  coral: { name: 'Coral', hex: '#ff6b6b', glowHex: 'rgba(255, 107, 107, 0.4)', price: 150 },
  violet: { name: 'Deep Violet', hex: '#7b68ee', glowHex: 'rgba(123, 104, 238, 0.4)', price: 200 },
};

// Player shape definitions
export const PLAYER_SHAPES: Record<PlayerShape, { name: string; price: number }> = {
  circle: { name: 'Circle', price: 0 },
  square: { name: 'Square', price: 150 },
  triangle: { name: 'Triangle', price: 200 },
  hexagon: { name: 'Hexagon', price: 250 },
  star: { name: 'Star', price: 300 },
};

// Player trail definitions
export const PLAYER_TRAILS: Record<PlayerTrail, { name: string; price: number }> = {
  none: { name: 'None', price: 0 },
  particle: { name: 'Particle', price: 300 },
  ghost: { name: 'Ghost', price: 400 },
  rainbow: { name: 'Rainbow', price: 500 },
  fire: { name: 'Fire', price: 600 },
};

// Player glow definitions
export const PLAYER_GLOWS: Record<PlayerGlow, { name: string; price: number }> = {
  none: { name: 'None', price: 0 },
  pulse: { name: 'Pulse', price: 200 },
  constant: { name: 'Constant', price: 300 },
  rgb: { name: 'RGB Cycle', price: 500 },
};

// Enemy theme definitions
export const ENEMY_THEMES: Record<EnemyTheme, { name: string; price: number; colors: { base: string; glow: string } }> = {
  classic: { name: 'Classic', price: 0, colors: { base: '#ff4444', glow: 'rgba(255, 68, 68, 0.3)' } },
  neon: { name: 'Neon', price: 500, colors: { base: '#00ff88', glow: 'rgba(0, 255, 136, 0.5)' } },
  retro: { name: 'Retro', price: 600, colors: { base: '#ffcc00', glow: 'rgba(255, 204, 0, 0.3)' } },
  minimal: { name: 'Minimal', price: 500, colors: { base: '#ffffff', glow: 'rgba(255, 255, 255, 0.2)' } },
  spooky: { name: 'Spooky', price: 700, colors: { base: '#aa44ff', glow: 'rgba(170, 68, 255, 0.4)' } },
};

// Background theme definitions
export const BACKGROUND_THEMES: Record<BackgroundTheme, { name: string; price: number; colors: { bg: string; accent: string } }> = {
  dark: { name: 'Dark', price: 0, colors: { bg: '#0a0a0f', accent: '#1a1a2e' } },
  void: { name: 'Void', price: 600, colors: { bg: '#000000', accent: '#0a0a0a' } },
  synthwave: { name: 'Synthwave', price: 800, colors: { bg: '#1a0a2e', accent: '#2a1a4e' } },
  ocean: { name: 'Ocean', price: 700, colors: { bg: '#0a1a2e', accent: '#1a2a4e' } },
  sunset: { name: 'Sunset', price: 800, colors: { bg: '#2e1a0a', accent: '#4e2a1a' } },
};

// Helper to get all items in a category as CosmeticItem[]
export function getCosmeticItems(category: CosmeticCategory): CosmeticItem[] {
  switch (category) {
    case 'playerColor':
      return Object.entries(PLAYER_COLORS).map(([id, data]) => ({
        id,
        category,
        name: data.name,
        price: data.price,
        preview: data.hex,
      }));
    case 'playerShape':
      return Object.entries(PLAYER_SHAPES).map(([id, data]) => ({
        id,
        category,
        name: data.name,
        price: data.price,
      }));
    case 'playerTrail':
      return Object.entries(PLAYER_TRAILS).map(([id, data]) => ({
        id,
        category,
        name: data.name,
        price: data.price,
      }));
    case 'playerGlow':
      return Object.entries(PLAYER_GLOWS).map(([id, data]) => ({
        id,
        category,
        name: data.name,
        price: data.price,
      }));
    case 'enemyTheme':
      return Object.entries(ENEMY_THEMES).map(([id, data]) => ({
        id,
        category,
        name: data.name,
        price: data.price,
        preview: data.colors.base,
      }));
    case 'backgroundTheme':
      return Object.entries(BACKGROUND_THEMES).map(([id, data]) => ({
        id,
        category,
        name: data.name,
        price: data.price,
        preview: data.colors.bg,
      }));
  }
}
```

**Step 2: Commit**

```bash
git add src/const/cosmetics.ts
git commit -m "feat: add cosmetic type definitions and catalog"
```

---

## Task 2: Create Shard Currency Store

**Files:**
- Create: `src/state/shardStore.ts`

**Step 1: Create Zustand store for shards**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ShardState {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastRewardedAdDate: string | null;
  rewardedAdsToday: number;

  // Actions
  addShards: (amount: number, source: 'score' | 'ad' | 'purchase') => void;
  spendShards: (amount: number) => boolean; // returns false if insufficient
  canWatchRewardedAd: () => boolean;
  recordRewardedAd: () => void;
  resetDailyAdCount: () => void;
}

const SHARDS_PER_100_POINTS = 1;
const SHARDS_PER_AD = 10;
const MAX_REWARDED_ADS_PER_DAY = 3;

export const useShardStore = create<ShardState>()(
  persist(
    (set, get) => ({
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      lastRewardedAdDate: null,
      rewardedAdsToday: 0,

      addShards: (amount, source) => {
        set((state) => ({
          balance: state.balance + amount,
          totalEarned: state.totalEarned + amount,
        }));
      },

      spendShards: (amount) => {
        const state = get();
        if (state.balance < amount) return false;
        set({
          balance: state.balance - amount,
          totalSpent: state.totalSpent + amount,
        });
        return true;
      },

      canWatchRewardedAd: () => {
        const state = get();
        const today = new Date().toDateString();
        if (state.lastRewardedAdDate !== today) {
          return true; // New day, reset count
        }
        return state.rewardedAdsToday < MAX_REWARDED_ADS_PER_DAY;
      },

      recordRewardedAd: () => {
        const today = new Date().toDateString();
        set((state) => {
          const isNewDay = state.lastRewardedAdDate !== today;
          return {
            balance: state.balance + SHARDS_PER_AD,
            totalEarned: state.totalEarned + SHARDS_PER_AD,
            lastRewardedAdDate: today,
            rewardedAdsToday: isNewDay ? 1 : state.rewardedAdsToday + 1,
          };
        });
      },

      resetDailyAdCount: () => {
        const today = new Date().toDateString();
        const state = get();
        if (state.lastRewardedAdDate !== today) {
          set({ rewardedAdsToday: 0, lastRewardedAdDate: today });
        }
      },
    }),
    {
      name: 'evade-shards',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper to calculate shards from score
export function calculateShardsFromScore(score: number): number {
  return Math.floor(score / 100) * SHARDS_PER_100_POINTS;
}
```

**Step 2: Commit**

```bash
git add src/state/shardStore.ts
git commit -m "feat: add shard currency store"
```

---

## Task 3: Create Cosmetic Ownership Store

**Files:**
- Create: `src/state/cosmeticStore.ts`

**Step 1: Create Zustand store for owned/equipped cosmetics**

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PlayerColorId,
  PlayerShape,
  PlayerTrail,
  PlayerGlow,
  EnemyTheme,
  BackgroundTheme,
  CosmeticCategory,
} from '../const/cosmetics';

interface EquippedCosmetics {
  playerColor: PlayerColorId;
  playerShape: PlayerShape;
  playerTrail: PlayerTrail;
  playerGlow: PlayerGlow;
  enemyTheme: EnemyTheme;
  backgroundTheme: BackgroundTheme;
}

interface CosmeticState {
  // Owned items by category
  ownedColors: PlayerColorId[];
  ownedShapes: PlayerShape[];
  ownedTrails: PlayerTrail[];
  ownedGlows: PlayerGlow[];
  ownedEnemyThemes: EnemyTheme[];
  ownedBackgroundThemes: BackgroundTheme[];

  // Currently equipped
  equipped: EquippedCosmetics;

  // Actions
  purchaseItem: (category: CosmeticCategory, id: string) => void;
  equipItem: (category: CosmeticCategory, id: string) => void;
  isOwned: (category: CosmeticCategory, id: string) => boolean;
}

export const useCosmeticStore = create<CosmeticState>()(
  persist(
    (set, get) => ({
      // Default items (free) are owned by default
      ownedColors: ['green'],
      ownedShapes: ['circle'],
      ownedTrails: ['none'],
      ownedGlows: ['none'],
      ownedEnemyThemes: ['classic'],
      ownedBackgroundThemes: ['dark'],

      equipped: {
        playerColor: 'green',
        playerShape: 'circle',
        playerTrail: 'none',
        playerGlow: 'none',
        enemyTheme: 'classic',
        backgroundTheme: 'dark',
      },

      purchaseItem: (category, id) => {
        set((state) => {
          switch (category) {
            case 'playerColor':
              if (!state.ownedColors.includes(id as PlayerColorId)) {
                return { ownedColors: [...state.ownedColors, id as PlayerColorId] };
              }
              break;
            case 'playerShape':
              if (!state.ownedShapes.includes(id as PlayerShape)) {
                return { ownedShapes: [...state.ownedShapes, id as PlayerShape] };
              }
              break;
            case 'playerTrail':
              if (!state.ownedTrails.includes(id as PlayerTrail)) {
                return { ownedTrails: [...state.ownedTrails, id as PlayerTrail] };
              }
              break;
            case 'playerGlow':
              if (!state.ownedGlows.includes(id as PlayerGlow)) {
                return { ownedGlows: [...state.ownedGlows, id as PlayerGlow] };
              }
              break;
            case 'enemyTheme':
              if (!state.ownedEnemyThemes.includes(id as EnemyTheme)) {
                return { ownedEnemyThemes: [...state.ownedEnemyThemes, id as EnemyTheme] };
              }
              break;
            case 'backgroundTheme':
              if (!state.ownedBackgroundThemes.includes(id as BackgroundTheme)) {
                return { ownedBackgroundThemes: [...state.ownedBackgroundThemes, id as BackgroundTheme] };
              }
              break;
          }
          return {};
        });
      },

      equipItem: (category, id) => {
        set((state) => ({
          equipped: {
            ...state.equipped,
            [category]: id,
          },
        }));
      },

      isOwned: (category, id) => {
        const state = get();
        switch (category) {
          case 'playerColor':
            return state.ownedColors.includes(id as PlayerColorId);
          case 'playerShape':
            return state.ownedShapes.includes(id as PlayerShape);
          case 'playerTrail':
            return state.ownedTrails.includes(id as PlayerTrail);
          case 'playerGlow':
            return state.ownedGlows.includes(id as PlayerGlow);
          case 'enemyTheme':
            return state.ownedEnemyThemes.includes(id as EnemyTheme);
          case 'backgroundTheme':
            return state.ownedBackgroundThemes.includes(id as BackgroundTheme);
        }
      },
    }),
    {
      name: 'evade-cosmetics',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

**Step 2: Commit**

```bash
git add src/state/cosmeticStore.ts
git commit -m "feat: add cosmetic ownership store"
```

---

## Task 4: Create Shard IAP Constants

**Files:**
- Modify: `src/const/iap.ts`

**Step 1: Add shard pack products**

```typescript
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
```

**Step 2: Commit**

```bash
git add src/const/iap.ts
git commit -m "feat: add shard pack IAP products"
```

---

## Task 5: Update IAP Manager for Shard Packs

**Files:**
- Modify: `src/iap/iapManager.ts`

**Step 1: Add shard purchase methods**

Add to the IAPManager class:

```typescript
// In loadProducts, add all shard SKUs
private async loadProducts(): Promise<void> {
  try {
    const productIds = [
      IAP_PRODUCTS.REMOVE_ADS,
      IAP_PRODUCTS.SHARDS_100,
      IAP_PRODUCTS.SHARDS_500,
      IAP_PRODUCTS.SHARDS_1500,
    ];
    this.products = await ExpoIAP.fetchProducts({
      skus: productIds as string[],
      type: 'inapp',
    });
  } catch (error) {
    console.warn('Failed to load products:', error);
  }
}

async purchaseShards(productId: string): Promise<boolean> {
  if (!this.isInitialized) {
    await this.initialize();
  }

  try {
    await ExpoIAP.requestPurchase({
      request: Platform.select({
        ios: { sku: productId },
        android: { skus: [productId] },
        default: { sku: productId },
      }) as ExpoIAP.RequestPurchaseIOS | ExpoIAP.RequestPurchaseAndroid,
      type: 'inapp',
    });
    return true;
  } catch (error) {
    console.warn('Shard purchase failed:', error);
    return false;
  }
}

getProductPrice(productId: string): string {
  const product = this.products.find((p) => p.id === productId);
  return product?.displayPrice ?? '';
}
```

**Step 2: Commit**

```bash
git add src/iap/iapManager.ts
git commit -m "feat: add shard pack purchase support to IAP manager"
```

---

## Task 6: Update Player Component for Cosmetics

**Files:**
- Modify: `src/entity/Player.tsx`

**Step 1: Add cosmetic props and rendering**

```typescript
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  SharedValue,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { GAME } from '../const/game';
import {
  PlayerShape,
  PlayerColorId,
  PlayerTrail,
  PlayerGlow,
  PLAYER_COLORS,
} from '../const/cosmetics';

interface PlayerProps {
  x: SharedValue<number>;
  y: SharedValue<number>;
  hasShield?: boolean;
  dodgeFlashTrigger?: number;
  // Cosmetic props
  shape?: PlayerShape;
  colorId?: PlayerColorId;
  trail?: PlayerTrail;
  glow?: PlayerGlow;
}

export const Player: React.FC<PlayerProps> = ({
  x,
  y,
  hasShield = false,
  dodgeFlashTrigger = 0,
  shape = 'circle',
  colorId = 'green',
  trail = 'none',
  glow = 'none',
}) => {
  const colorData = PLAYER_COLORS[colorId];
  const playerColor = colorData.hex;
  const glowColor = colorData.glowHex;

  const shieldPulse = useSharedValue(1);
  const dodgeFlashOpacity = useSharedValue(0);
  const dodgeFlashScale = useSharedValue(1);
  const glowPulse = useSharedValue(1);
  const rgbProgress = useSharedValue(0);

  // Glow animation based on type
  useEffect(() => {
    if (glow === 'pulse') {
      glowPulse.value = withRepeat(
        withTiming(1.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else if (glow === 'rgb') {
      rgbProgress.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    } else if (glow === 'constant') {
      glowPulse.value = 1.2;
    } else {
      glowPulse.value = 1;
    }
  }, [glow]);

  // Dodge flash animation
  useEffect(() => {
    if (dodgeFlashTrigger > 0) {
      dodgeFlashOpacity.value = withSequence(
        withTiming(0.8, { duration: 50 }),
        withTiming(0, { duration: 200 })
      );
      dodgeFlashScale.value = withSequence(
        withTiming(1.5, { duration: 100 }),
        withTiming(1, { duration: 150 })
      );
    }
  }, [dodgeFlashTrigger]);

  // Shield animation
  useEffect(() => {
    if (hasShield) {
      shieldPulse.value = withRepeat(
        withTiming(1.2, { duration: 300 }),
        -1,
        true
      );
    } else {
      shieldPulse.value = 1;
    }
  }, [hasShield]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value - GAME.PLAYER_RADIUS },
      { translateY: y.value - GAME.PLAYER_RADIUS },
    ],
  }));

  const shieldStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shieldPulse.value }],
    opacity: hasShield ? 0.6 : 0,
  }));

  const dodgeFlashStyle = useAnimatedStyle(() => ({
    opacity: dodgeFlashOpacity.value,
    transform: [{ scale: dodgeFlashScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => {
    if (glow === 'rgb') {
      const color = interpolateColor(
        rgbProgress.value,
        [0, 0.33, 0.66, 1],
        ['rgba(255,0,0,0.4)', 'rgba(0,255,0,0.4)', 'rgba(0,0,255,0.4)', 'rgba(255,0,0,0.4)']
      );
      return {
        backgroundColor: color,
        transform: [{ scale: glowPulse.value }],
      };
    }
    return {
      backgroundColor: glowColor,
      transform: [{ scale: glowPulse.value }],
    };
  });

  // Render shape
  const renderShape = () => {
    const baseStyle = {
      width: GAME.PLAYER_RADIUS * 2,
      height: GAME.PLAYER_RADIUS * 2,
      backgroundColor: playerColor,
    };

    switch (shape) {
      case 'square':
        return <View style={[baseStyle, styles.square]} />;
      case 'triangle':
        return (
          <View style={styles.triangleContainer}>
            <View style={[styles.triangle, { borderBottomColor: playerColor }]} />
          </View>
        );
      case 'hexagon':
        return <View style={[baseStyle, styles.hexagon]} />;
      case 'star':
        return <View style={[baseStyle, styles.star]} />;
      default:
        return <View style={[baseStyle, styles.circle]} />;
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Dodge flash ring */}
      <Animated.View style={[styles.dodgeFlash, dodgeFlashStyle]} />
      {/* Shield */}
      {hasShield && <Animated.View style={[styles.shield, shieldStyle]} />}
      {/* Glow */}
      {glow !== 'none' && <Animated.View style={[styles.glow, glowStyle]} />}
      {/* Player shape */}
      {renderShape()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: GAME.PLAYER_RADIUS * 2,
    height: GAME.PLAYER_RADIUS * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shield: {
    position: 'absolute',
    width: GAME.PLAYER_RADIUS * 3,
    height: GAME.PLAYER_RADIUS * 3,
    borderRadius: GAME.PLAYER_RADIUS * 1.5,
    borderWidth: 4,
    borderColor: '#44ff44',
    backgroundColor: 'rgba(68, 255, 68, 0.2)',
  },
  glow: {
    position: 'absolute',
    width: GAME.PLAYER_RADIUS * 2.5,
    height: GAME.PLAYER_RADIUS * 2.5,
    borderRadius: GAME.PLAYER_RADIUS * 1.25,
  },
  circle: {
    borderRadius: GAME.PLAYER_RADIUS,
  },
  square: {
    borderRadius: 6,
  },
  triangleContainer: {
    width: GAME.PLAYER_RADIUS * 2,
    height: GAME.PLAYER_RADIUS * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: GAME.PLAYER_RADIUS,
    borderRightWidth: GAME.PLAYER_RADIUS,
    borderBottomWidth: GAME.PLAYER_RADIUS * 1.7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  hexagon: {
    borderRadius: GAME.PLAYER_RADIUS * 0.3,
    transform: [{ rotate: '30deg' }],
  },
  star: {
    borderRadius: GAME.PLAYER_RADIUS * 0.2,
    transform: [{ rotate: '45deg' }],
  },
  dodgeFlash: {
    position: 'absolute',
    width: GAME.PLAYER_RADIUS * 3.5,
    height: GAME.PLAYER_RADIUS * 3.5,
    borderRadius: GAME.PLAYER_RADIUS * 1.75,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
  },
});
```

**Step 2: Commit**

```bash
git add src/entity/Player.tsx
git commit -m "feat: add cosmetic support to Player component"
```

---

## Task 7: Update Enemy Component for Themes

**Files:**
- Modify: `src/entity/Enemy.tsx`

**Step 1: Add theme prop**

Update Enemy to accept an enemyTheme prop and use theme colors:

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { GAME } from '../const/game';
import { SpeedTier } from '../game/types';
import { EnemyTheme, ENEMY_THEMES } from '../const/cosmetics';

interface EnemyProps {
  x: number;
  y: number;
  speedTier: SpeedTier;
  ttlPercent: number;
  isNew?: boolean;
  theme?: EnemyTheme;
}

function getTTLColor(ttlPercent: number, baseColor: string): string {
  const clampedTTL = Math.max(0, Math.min(1, ttlPercent));

  // Parse base color
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Fade towards yellow as TTL decreases
  const fadeR = r;
  const fadeG = Math.min(255, g + Math.round((1 - clampedTTL) * (200 - g)));
  const fadeB = Math.round(b * clampedTTL);

  return `rgb(${fadeR}, ${fadeG}, ${fadeB})`;
}

export const Enemy: React.FC<EnemyProps> = ({
  x,
  y,
  speedTier,
  ttlPercent,
  isNew = false,
  theme = 'classic',
}) => {
  const themeData = ENEMY_THEMES[theme];
  const fadeIn = useSharedValue(isNew ? 0 : 1);

  React.useEffect(() => {
    if (isNew) {
      fadeIn.value = withTiming(1, { duration: 200 });
    }
  }, []);

  const color = getTTLColor(ttlPercent, themeData.colors.base);
  const fadeOut = ttlPercent < 0.025 ? ttlPercent / 0.025 : 1;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x - GAME.ENEMY_RADIUS },
      { translateY: y - GAME.ENEMY_RADIUS },
    ],
    opacity: fadeIn.value * fadeOut,
  }));

  // Different shapes based on speed tier
  if (speedTier === 'slow') {
    return (
      <Animated.View
        style={[styles.enemyBase, styles.circle, { backgroundColor: color }, animatedStyle]}
      />
    );
  } else if (speedTier === 'medium') {
    return (
      <Animated.View
        style={[styles.enemyBase, styles.square, { backgroundColor: color }, animatedStyle]}
      />
    );
  } else {
    return (
      <Animated.View style={[styles.enemyBase, animatedStyle]}>
        <View style={[styles.triangle, { borderBottomColor: color }]} />
      </Animated.View>
    );
  }
};

const styles = StyleSheet.create({
  enemyBase: {
    position: 'absolute',
    width: GAME.ENEMY_RADIUS * 2,
    height: GAME.ENEMY_RADIUS * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    borderRadius: GAME.ENEMY_RADIUS,
  },
  square: {
    borderRadius: 4,
    transform: [{ rotate: '45deg' }],
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: GAME.ENEMY_RADIUS,
    borderRightWidth: GAME.ENEMY_RADIUS,
    borderBottomWidth: GAME.ENEMY_RADIUS * 1.7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
```

**Step 2: Commit**

```bash
git add src/entity/Enemy.tsx
git commit -m "feat: add theme support to Enemy component"
```

---

## Task 8: Create GameBackground Component

**Files:**
- Create: `src/entity/GameBackground.tsx`

**Step 1: Create themed background component**

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BackgroundTheme, BACKGROUND_THEMES } from '../const/cosmetics';

interface GameBackgroundProps {
  theme?: BackgroundTheme;
}

export const GameBackground: React.FC<GameBackgroundProps> = ({ theme = 'dark' }) => {
  const themeData = BACKGROUND_THEMES[theme];

  return (
    <View style={[styles.container, { backgroundColor: themeData.colors.bg }]}>
      {/* Subtle gradient overlay for depth */}
      <View style={[styles.gradient, { backgroundColor: themeData.colors.accent }]} />

      {/* Theme-specific decorations */}
      {theme === 'synthwave' && (
        <>
          <View style={styles.synthwaveLine1} />
          <View style={styles.synthwaveLine2} />
          <View style={styles.synthwaveLine3} />
        </>
      )}

      {theme === 'ocean' && (
        <View style={styles.oceanWave} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    opacity: 0.3,
  },
  synthwaveLine1: {
    position: 'absolute',
    bottom: '20%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 0, 255, 0.3)',
  },
  synthwaveLine2: {
    position: 'absolute',
    bottom: '35%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 0, 255, 0.2)',
  },
  synthwaveLine3: {
    position: 'absolute',
    bottom: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
  },
  oceanWave: {
    position: 'absolute',
    bottom: '10%',
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: 'rgba(0, 150, 255, 0.1)',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
});
```

**Step 2: Commit**

```bash
git add src/entity/GameBackground.tsx
git commit -m "feat: add themed GameBackground component"
```

---

## Task 9: Create Shop Screen

**Files:**
- Create: `src/screen/Shop.tsx`

**Step 1: Create the shop screen with category tabs**

```typescript
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../const/colors';
import {
  CosmeticCategory,
  CosmeticItem,
  getCosmeticItems,
  PLAYER_COLORS,
} from '../const/cosmetics';
import { useShardStore } from '../state/shardStore';
import { useCosmeticStore } from '../state/cosmeticStore';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
  Shop: undefined;
};

interface ShopScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Shop'>;
}

const CATEGORIES: { key: CosmeticCategory; label: string }[] = [
  { key: 'playerColor', label: 'Colors' },
  { key: 'playerShape', label: 'Shapes' },
  { key: 'playerTrail', label: 'Trails' },
  { key: 'playerGlow', label: 'Glow' },
  { key: 'enemyTheme', label: 'Enemies' },
  { key: 'backgroundTheme', label: 'Background' },
];

export const ShopScreen: React.FC<ShopScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<CosmeticCategory>('playerColor');
  const { balance, spendShards } = useShardStore();
  const { isOwned, purchaseItem, equipItem, equipped } = useCosmeticStore();

  const items = getCosmeticItems(selectedCategory);

  const handlePurchase = (item: CosmeticItem) => {
    if (item.price === 0) return; // Free items don't need purchase

    if (balance < item.price) {
      Alert.alert(
        t('shop.insufficientShards', 'Not Enough Shards'),
        t('shop.needMoreShards', 'You need {{amount}} more shards.', {
          amount: item.price - balance,
        })
      );
      return;
    }

    Alert.alert(
      t('shop.confirmPurchase', 'Confirm Purchase'),
      t('shop.purchaseMessage', 'Buy {{name}} for {{price}} shards?', {
        name: item.name,
        price: item.price,
      }),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('shop.buy', 'Buy'),
          onPress: () => {
            if (spendShards(item.price)) {
              purchaseItem(item.category, item.id);
              equipItem(item.category, item.id);
            }
          },
        },
      ]
    );
  };

  const handleEquip = (item: CosmeticItem) => {
    equipItem(item.category, item.id);
  };

  const isEquipped = (item: CosmeticItem): boolean => {
    return equipped[item.category] === item.id;
  };

  const renderItem = (item: CosmeticItem) => {
    const owned = isOwned(item.category, item.id);
    const equipped = isEquipped(item);

    return (
      <Pressable
        key={item.id}
        style={[styles.itemCard, equipped && styles.itemCardEquipped]}
        onPress={() => (owned ? handleEquip(item) : handlePurchase(item))}
      >
        {/* Preview */}
        <View style={styles.previewContainer}>
          {item.preview ? (
            <View style={[styles.colorPreview, { backgroundColor: item.preview }]} />
          ) : (
            <View style={styles.placeholderPreview}>
              <Text style={styles.placeholderText}>{item.name[0]}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <Text style={styles.itemName}>{item.name}</Text>

        {/* Status */}
        {equipped ? (
          <Text style={styles.equippedText}>{t('shop.equipped', 'Equipped')}</Text>
        ) : owned ? (
          <Text style={styles.ownedText}>{t('shop.owned', 'Owned')}</Text>
        ) : item.price === 0 ? (
          <Text style={styles.freeText}>{t('shop.free', 'Free')}</Text>
        ) : (
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{item.price}</Text>
            <Text style={styles.shardIcon}>💎</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{t('common.back', 'Back')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('shop.title', 'Shop')}</Text>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceText}>{balance}</Text>
          <Text style={styles.shardIcon}>💎</Text>
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.key}
            style={[styles.tab, selectedCategory === cat.key && styles.tabActive]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text
              style={[styles.tabText, selectedCategory === cat.key && styles.tabTextActive]}
            >
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Items Grid */}
      <ScrollView style={styles.itemsContainer} contentContainerStyle={styles.itemsGrid}>
        {items.map(renderItem)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    color: COLORS.menuAccent,
    fontSize: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  shardIcon: {
    fontSize: 16,
  },
  tabsContainer: {
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
  },
  tabActive: {
    backgroundColor: COLORS.menuAccent,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  tabTextActive: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  itemsContainer: {
    flex: 1,
    marginTop: 16,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  itemCard: {
    width: '30%',
    aspectRatio: 0.85,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemCardEquipped: {
    borderWidth: 2,
    borderColor: COLORS.menuAccent,
  },
  previewContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  placeholderPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemName: {
    color: COLORS.text,
    fontSize: 12,
    textAlign: 'center',
  },
  equippedText: {
    color: COLORS.menuAccent,
    fontSize: 10,
    fontWeight: 'bold',
  },
  ownedText: {
    color: '#44bb44',
    fontSize: 10,
  },
  freeText: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  priceText: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
```

**Step 2: Commit**

```bash
git add src/screen/Shop.tsx
git commit -m "feat: add Shop screen with cosmetic browsing and purchase"
```

---

## Task 10: Add Shop Navigation

**Files:**
- Modify: `App.tsx`

**Step 1: Add Shop to navigation stack**

Add import and screen:

```typescript
import { ShopScreen } from './src/screen/Shop';

// In Stack.Navigator, add:
<Stack.Screen name="Shop" component={ShopScreen} options={{ headerShown: false }} />
```

**Step 2: Commit**

```bash
git add App.tsx
git commit -m "feat: add Shop screen to navigation"
```

---

## Task 11: Add Shop Button to Main Menu

**Files:**
- Modify: `src/screen/MainMenu.tsx`

**Step 1: Add Shop button and shard balance display**

Add to imports:
```typescript
import { useShardStore } from '../state/shardStore';
```

Add in component:
```typescript
const { balance } = useShardStore();
```

Add button in JSX (after Settings button):
```typescript
<Pressable style={styles.menuButton} onPress={() => navigation.navigate('Shop')}>
  <Text style={styles.menuButtonText}>{t('mainMenu.shop', 'Shop')}</Text>
  <View style={styles.shardBadge}>
    <Text style={styles.shardBadgeText}>{balance} 💎</Text>
  </View>
</Pressable>
```

Add styles:
```typescript
shardBadge: {
  backgroundColor: '#2a2a4e',
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 10,
  marginLeft: 8,
},
shardBadgeText: {
  color: '#ffd700',
  fontSize: 12,
},
```

**Step 2: Commit**

```bash
git add src/screen/MainMenu.tsx
git commit -m "feat: add Shop button to main menu"
```

---

## Task 12: Integrate Cosmetics into Play Screen

**Files:**
- Modify: `src/screen/Play.tsx`

**Step 1: Use cosmetic store for player/enemy/background rendering**

Add imports:
```typescript
import { useCosmeticStore } from '../state/cosmeticStore';
import { useShardStore, calculateShardsFromScore } from '../state/shardStore';
import { GameBackground } from '../entity/GameBackground';
```

Add in component:
```typescript
const { equipped } = useCosmeticStore();
const { addShards } = useShardStore();
```

Update Player rendering:
```typescript
<Player
  x={playerX}
  y={playerY}
  hasShield={activeEffects.shield.active}
  dodgeFlashTrigger={dodgeFlashTrigger}
  shape={equipped.playerShape}
  colorId={equipped.playerColor}
  trail={equipped.playerTrail}
  glow={equipped.playerGlow}
/>
```

Update Enemy rendering:
```typescript
<Enemy
  key={enemy.id}
  x={enemy.position.x}
  y={enemy.position.y}
  speedTier={enemy.speedTier}
  ttlPercent={ttlPercent}
  isNew={newEnemyIds.current.has(enemy.id)}
  theme={equipped.enemyTheme}
/>
```

Add GameBackground before game area content:
```typescript
<GameBackground theme={equipped.backgroundTheme} />
```

In handleActualGameOver, add shard earning:
```typescript
const shardsEarned = calculateShardsFromScore(finalScore);
if (shardsEarned > 0) {
  addShards(shardsEarned, 'score');
}
```

**Step 2: Commit**

```bash
git add src/screen/Play.tsx
git commit -m "feat: integrate cosmetics into Play screen"
```

---

## Task 13: Add Shop Translations

**Files:**
- Modify: `src/i18n/locales/en.ts`

**Step 1: Add shop translations**

```typescript
// Add to mainMenu:
shop: 'Shop',

// Add new shop section:
shop: {
  title: 'Shop',
  equipped: 'Equipped',
  owned: 'Owned',
  free: 'Free',
  buy: 'Buy',
  insufficientShards: 'Not Enough Shards',
  needMoreShards: 'You need {{amount}} more shards.',
  confirmPurchase: 'Confirm Purchase',
  purchaseMessage: 'Buy {{name}} for {{price}} shards?',
  earnShards: 'Earn Shards',
  watchAd: 'Watch Ad (+10 💎)',
  adsRemaining: '{{count}} ads remaining today',
  noAdsLeft: 'Come back tomorrow for more!',
},
```

**Step 2: Commit**

```bash
git add src/i18n/locales/en.ts
git commit -m "feat: add shop translations"
```

---

## Task 14: Add Rewarded Ad for Shards in Shop

**Files:**
- Modify: `src/screen/Shop.tsx`

**Step 1: Add earn shards section**

Add imports:
```typescript
import { adManager } from '../ads/adManager';
```

Add in component after balance display:
```typescript
const { canWatchRewardedAd, recordRewardedAd, rewardedAdsToday } = useShardStore();

const handleWatchAdForShards = async () => {
  if (!canWatchRewardedAd()) return;

  const success = await adManager.showRewarded(() => {
    recordRewardedAd();
  });

  if (!success) {
    Alert.alert(t('common.error', 'Error'), t('shop.adFailed', 'Ad not available'));
  }
};
```

Add button in header area:
```typescript
{canWatchRewardedAd() && (
  <Pressable style={styles.earnButton} onPress={handleWatchAdForShards}>
    <Text style={styles.earnButtonText}>{t('shop.watchAd', 'Watch Ad (+10 💎)')}</Text>
  </Pressable>
)}
```

**Step 2: Commit**

```bash
git add src/screen/Shop.tsx
git commit -m "feat: add rewarded ad for shards in shop"
```

---

## Task 15: Add Shard Pack Purchase UI

**Files:**
- Modify: `src/screen/Shop.tsx`

**Step 1: Add shard packs section**

Add to Shop screen a "Buy Shards" section below the items grid:

```typescript
import { SHARD_PACKS } from '../const/iap';
import { iapManager } from '../iap/iapManager';

// Add handler:
const handleBuyShardPack = async (pack: typeof SHARD_PACKS[number]) => {
  const success = await iapManager.purchaseShards(pack.productId as string);
  if (success) {
    addShards(pack.shards, 'purchase');
  }
};

// Add UI section:
<View style={styles.shardPacksSection}>
  <Text style={styles.sectionTitle}>{t('shop.buyShards', 'Buy Shards')}</Text>
  <View style={styles.packsContainer}>
    {SHARD_PACKS.map((pack) => (
      <Pressable
        key={pack.productId}
        style={styles.packCard}
        onPress={() => handleBuyShardPack(pack)}
      >
        <Text style={styles.packShards}>{pack.shards} 💎</Text>
        {pack.bonus && <Text style={styles.packBonus}>{pack.bonus}</Text>}
        <Text style={styles.packPrice}>{pack.price}</Text>
      </Pressable>
    ))}
  </View>
</View>
```

**Step 2: Commit**

```bash
git add src/screen/Shop.tsx
git commit -m "feat: add shard pack purchase UI"
```

---

## Task 16: Display Shards Earned on Game Over

**Files:**
- Modify: `src/screen/Play.tsx`

**Step 1: Show shards earned in game over modal**

Add state:
```typescript
const [shardsEarned, setShardsEarned] = useState(0);
```

In handleActualGameOver:
```typescript
const shardsEarned = calculateShardsFromScore(finalScore);
setShardsEarned(shardsEarned);
if (shardsEarned > 0) {
  addShards(shardsEarned, 'score');
}
```

In game over modal JSX:
```typescript
{shardsEarned > 0 && (
  <Text style={styles.shardsEarned}>+{shardsEarned} 💎</Text>
)}
```

In handleRetry, reset:
```typescript
setShardsEarned(0);
```

**Step 2: Commit**

```bash
git add src/screen/Play.tsx
git commit -m "feat: show shards earned on game over"
```

---

## Task 17: Final Polish and Type Fixes

**Files:**
- Multiple files as needed

**Step 1: Run TypeScript check and fix any errors**

```bash
npx tsc --noEmit
```

Fix any type errors that appear.

**Step 2: Test navigation flow**

Verify:
- Main Menu → Shop works
- Shop → back to Main Menu works
- Category switching works
- Purchase flow works
- Equipped items show correctly

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: Phase 3+4 Cosmetics complete

- Shard currency system (earn from score, ads, purchase)
- Cosmetic store with ownership persistence
- Player cosmetics: colors, shapes, trails, glow effects
- Enemy themes: classic, neon, retro, minimal, spooky
- Background themes: dark, void, synthwave, ocean, sunset
- Shop UI with categories, purchase, and equip
- Shard IAP packs ($0.99-$9.99)"
```

---

## Notes

### Testing Cosmetics

- Colors: Should change player color immediately
- Shapes: Circle, square, triangle work; hexagon/star may need SVG for better rendering
- Trails: Require additional particle system (simplified in this implementation)
- Glow: RGB cycle uses reanimated interpolateColor
- Themes: Enemy colors change, background colors change

### Future Improvements

- Add particle trail system for trails
- Add SVG shapes for better hexagon/star rendering
- Add theme preview in shop
- Add unlock animations
- Add daily login bonus shards

### Dependencies

No new dependencies required - uses existing:
- zustand (persist)
- react-native-reanimated
- expo-iap
