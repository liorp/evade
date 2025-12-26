import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Handedness } from '../game/types';

interface SettingsState {
  handedness: Handedness;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  setHandedness: (handedness: Handedness) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSfxEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      handedness: 'right',
      musicEnabled: true,
      sfxEnabled: true,
      setHandedness: (handedness) => set({ handedness }),
      setMusicEnabled: (musicEnabled) => set({ musicEnabled }),
      setSfxEnabled: (sfxEnabled) => set({ sfxEnabled }),
    }),
    {
      name: 'evade-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
