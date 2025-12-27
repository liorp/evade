import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { trackShardsChanged } from '../analytics';

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
        const state = get();
        const previous = state.balance;
        const newBalance = previous + amount;

        trackShardsChanged({
          previous,
          new: newBalance,
          reason: source === 'purchase' ? 'purchased' : 'earned',
        });

        set({
          balance: newBalance,
          totalEarned: state.totalEarned + amount,
        });
      },

      spendShards: (amount) => {
        const state = get();
        if (state.balance < amount) return false;

        const previous = state.balance;
        const newBalance = previous - amount;

        trackShardsChanged({
          previous,
          new: newBalance,
          reason: 'spent',
        });

        set({
          balance: newBalance,
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
    },
  ),
);

// Helper to calculate shards from score
export function calculateShardsFromScore(score: number): number {
  return Math.floor(score / 100) * SHARDS_PER_100_POINTS;
}
