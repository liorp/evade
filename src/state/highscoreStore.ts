import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface HighscoreEntry {
  score: number;
  date: string;
}

interface HighscoreState {
  scores: HighscoreEntry[];
  addScore: (score: number) => void;
  clearScores: () => void;
  getBestScore: () => number;
}

const MAX_SCORES = 10;

export const useHighscoreStore = create<HighscoreState>()(
  persist(
    (set, get) => ({
      scores: [],
      addScore: (score) => {
        const newEntry: HighscoreEntry = {
          score,
          date: new Date().toISOString(),
        };
        const currentScores = get().scores;
        const updatedScores = [...currentScores, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, MAX_SCORES);
        set({ scores: updatedScores });
      },
      clearScores: () => set({ scores: [] }),
      getBestScore: () => {
        const scores = get().scores;
        return scores.length > 0 ? scores[0].score : 0;
      },
    }),
    {
      name: 'evade-highscores',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
