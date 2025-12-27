import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  BackgroundTheme,
  CosmeticCategory,
  EnemyTheme,
  PlayerColorId,
  PlayerGlow,
  PlayerShape,
  PlayerTrail,
} from '../cosmetics/constants';

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
                return {
                  ownedBackgroundThemes: [...state.ownedBackgroundThemes, id as BackgroundTheme],
                };
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
    },
  ),
);
