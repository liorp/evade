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
