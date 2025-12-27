import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Handedness } from '../game/types';

interface SettingsState {
  handedness: Handedness;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  hasSeenTutorial: boolean;
  setHandedness: (handedness: Handedness) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSfxEnabled: (enabled: boolean) => void;
  setHasSeenTutorial: (seen: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      handedness: 'right',
      musicEnabled: true,
      sfxEnabled: true,
      hasSeenTutorial: false,
      setHandedness: (handedness) => set({ handedness }),
      setMusicEnabled: (musicEnabled) => set({ musicEnabled }),
      setSfxEnabled: (sfxEnabled) => set({ sfxEnabled }),
      setHasSeenTutorial: (hasSeenTutorial) => set({ hasSeenTutorial }),
    }),
    {
      name: 'evade-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
