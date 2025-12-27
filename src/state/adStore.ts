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

  resetRunState: () =>
    set({
      hasUsedContinue: false,
      watchedRewardedThisRun: false,
    }),

  resetSessionState: () =>
    set({
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
    return state.deathCount - state.lastAdDeathCount >= 3;
  },

  canUseContinue: () => {
    const state = get();
    return !state.hasUsedContinue;
  },
}));
