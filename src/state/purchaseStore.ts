import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
    },
  ),
);
