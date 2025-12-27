import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Handedness } from '../game/types';

interface SettingsState {
  handedness: Handedness;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  hapticsEnabled: boolean;
  hasSeenTutorial: boolean;
  setHandedness: (handedness: Handedness) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSfxEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setHasSeenTutorial: (seen: boolean) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      handedness: 'right',
      musicEnabled: true,
      sfxEnabled: true,
      hapticsEnabled: true,
      hasSeenTutorial: false,
      setHandedness: (handedness) => set({ handedness }),
      setMusicEnabled: (musicEnabled) => set({ musicEnabled }),
      setSfxEnabled: (sfxEnabled) => set({ sfxEnabled }),
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setHasSeenTutorial: (hasSeenTutorial) => set({ hasSeenTutorial }),
      reset: () =>
        set({
          handedness: 'right',
          musicEnabled: true,
          sfxEnabled: true,
          hapticsEnabled: true,
          hasSeenTutorial: false,
        }),
    }),
    {
      name: 'evade-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
