# Phase 1: Core Fun Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Evade addictive with faster pacing, close dodge feedback, speed scoring, and personal best UI.

**Architecture:** Modify existing game constants for faster ramp, add close dodge detection in collision system, extend Player component for visual feedback, add new sound effect, update GameEngine for speed scoring, extend Play screen for personal best UI.

**Tech Stack:** React Native, Reanimated, Expo Audio, Zustand

---

## Task 1: Faster Difficulty Ramp

**Files:**
- Modify: `src/const/game.ts`

**Step 1: Update difficulty scaling constants**

Change the following values in `src/const/game.ts`:

```typescript
// Before:
SPAWN_SCALE_DURATION: 120000, // 2 minutes
SPEED_SCALE_DURATION: 180000, // 3 minutes
MAX_ENEMIES_SCALE_DURATION: 150000, // 2.5 minutes
JITTER_SCALE_DURATION: 120000,
CORNERS_ONLY_UNTIL: 30000, // 30s
EDGES_UNTIL: 60000, // 60s

// After:
SPAWN_SCALE_DURATION: 45000, // 45 seconds
SPEED_SCALE_DURATION: 60000, // 60 seconds
MAX_ENEMIES_SCALE_DURATION: 60000, // 60 seconds
JITTER_SCALE_DURATION: 45000, // 45 seconds
CORNERS_ONLY_UNTIL: 10000, // 10s
EDGES_UNTIL: 25000, // 25s
```

**Step 2: Test manually**

Run: `npx expo start`
- Play the game and verify difficulty ramps faster
- Should feel easy for first 10 seconds, then ramp quickly
- Peak intensity around 40 seconds

**Step 3: Commit**

```bash
git add src/const/game.ts
git commit -m "feat: faster difficulty ramp for ultra-short sessions"
```

---

## Task 2: Add Close Dodge Constants

**Files:**
- Modify: `src/const/game.ts`

**Step 1: Add close dodge constants**

Add these new constants to `src/const/game.ts`:

```typescript
// Close dodge system
CLOSE_DODGE_THRESHOLD: 15, // px beyond collision radius
CLOSE_DODGE_POINTS: 5, // bonus points per close dodge
```

**Step 2: Commit**

```bash
git add src/const/game.ts
git commit -m "feat: add close dodge constants"
```

---

## Task 3: Extend Enemy Type for Dodge Tracking

**Files:**
- Modify: `src/game/types.ts`

**Step 1: Add dodgeCounted flag to Enemy interface**

In `src/game/types.ts`, update the Enemy interface:

```typescript
export interface Enemy {
  id: string;
  position: Position;
  jitterAngle: number;
  lastJitterUpdate: number;
  spawnTime: number;
  speedTier: SpeedTier;
  speed: number;
  dodgeCounted?: boolean; // Track if close dodge was already counted
}
```

**Step 2: Commit**

```bash
git add src/game/types.ts
git commit -m "feat: add dodgeCounted flag to Enemy type"
```

---

## Task 4: Implement Close Dodge Detection

**Files:**
- Modify: `src/game/systems/collision.ts`

**Step 1: Add checkCloseDodges function**

Add this function to `src/game/systems/collision.ts`:

```typescript
import { GAME } from '../../const/game';
import { Position, Enemy, Booster } from '../types';

// ... existing distance function and checkCollision ...

export interface CloseDodgeResult {
  count: number;
  enemies: Enemy[]; // Return mutated enemies with dodgeCounted updated
}

export function checkCloseDodges(playerPosition: Position, enemies: Enemy[]): CloseDodgeResult {
  const collisionDistance = GAME.PLAYER_RADIUS + GAME.ENEMY_RADIUS;
  const dodgeDistance = collisionDistance + GAME.CLOSE_DODGE_THRESHOLD;
  let count = 0;

  for (const enemy of enemies) {
    const dist = distance(playerPosition, enemy.position);

    // In close dodge zone but not colliding
    if (dist > collisionDistance && dist < dodgeDistance && !enemy.dodgeCounted) {
      enemy.dodgeCounted = true;
      count++;
    }
  }

  return { count, enemies };
}
```

**Step 2: Commit**

```bash
git add src/game/systems/collision.ts
git commit -m "feat: add close dodge detection function"
```

---

## Task 5: Add Close Dodge Event to GameEngine

**Files:**
- Modify: `src/game/GameEngine.ts`

**Step 1: Add closeDodge event type**

Update the GameEventType in `src/game/GameEngine.ts`:

```typescript
export type GameEventType = 'gameOver' | 'scoreUpdate' | 'stateChange' | 'boosterCollected' | 'closeDodge';
```

**Step 2: Import and use checkCloseDodges**

Update imports:

```typescript
import { checkCollision, checkBoosterCollision, checkCloseDodges } from './systems/collision';
```

**Step 3: Add close dodge check in update method**

In the `update` method, after collision check (around line 162), add:

```typescript
// 1.5. Check close dodges (after collision, before boosters)
const closeDodgeResult = checkCloseDodges(this.state.playerPosition, this.state.enemies);
if (closeDodgeResult.count > 0) {
  this.state.enemies = closeDodgeResult.enemies;
  this.state.score += closeDodgeResult.count * GAME.CLOSE_DODGE_POINTS;
  this.emit('closeDodge', closeDodgeResult.count);
  this.emit('scoreUpdate', this.state.score);
}
```

**Step 4: Commit**

```bash
git add src/game/GameEngine.ts
git commit -m "feat: integrate close dodge detection into game loop"
```

---

## Task 6: Add Close Dodge Sound Effect

**Files:**
- Create: `assets/audio/dodge.mp3` (need to source or generate)
- Modify: `src/audio/audioManager.ts`

**Step 1: Add dodge sound to audioManager**

Update `src/audio/audioManager.ts`:

```typescript
class AudioManager {
  private backgroundMusic: Audio.Sound | null = null;
  private gameOverSound: Audio.Sound | null = null;
  private dodgeSound: Audio.Sound | null = null; // Add this
  private musicEnabled = true;
  private sfxEnabled = true;
  private isLoaded = false;

  async load(): Promise<void> {
    if (this.isLoaded) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Load background music
      const { sound: music } = await Audio.Sound.createAsync(
        require('../../assets/audio/background.mp3'),
        { isLooping: true, volume: 0.5 }
      );
      this.backgroundMusic = music;

      // Load game over sound
      const { sound: gameOver } = await Audio.Sound.createAsync(
        require('../../assets/audio/gameover.mp3'),
        { volume: 0.7 }
      );
      this.gameOverSound = gameOver;

      // Load dodge sound
      const { sound: dodge } = await Audio.Sound.createAsync(
        require('../../assets/audio/dodge.mp3'),
        { volume: 0.5 }
      );
      this.dodgeSound = dodge;

      this.isLoaded = true;
    } catch (error) {
      console.warn('Audio loading failed:', error);
    }
  }

  // ... existing methods ...

  async playDodge(): Promise<void> {
    if (!this.sfxEnabled || !this.dodgeSound) return;
    try {
      await this.dodgeSound.setPositionAsync(0);
      await this.dodgeSound.playAsync();
    } catch (error) {
      console.warn('Dodge sound failed:', error);
    }
  }

  async unload(): Promise<void> {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.unloadAsync();
        this.backgroundMusic = null;
      }
      if (this.gameOverSound) {
        await this.gameOverSound.unloadAsync();
        this.gameOverSound = null;
      }
      if (this.dodgeSound) {
        await this.dodgeSound.unloadAsync();
        this.dodgeSound = null;
      }
      this.isLoaded = false;
    } catch (error) {
      console.warn('Audio unload failed:', error);
    }
  }
}
```

**Step 2: Source a dodge sound**

Create or download a short "whoosh" sound effect (< 0.5s) and save as `assets/audio/dodge.mp3`.

**Step 3: Commit**

```bash
git add assets/audio/dodge.mp3 src/audio/audioManager.ts
git commit -m "feat: add dodge sound effect"
```

---

## Task 7: Add Close Dodge Visual Feedback to Player

**Files:**
- Modify: `src/entity/Player.tsx`

**Step 1: Add showDodgeFlash prop and animation**

Update `src/entity/Player.tsx`:

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
} from 'react-native-reanimated';
import { COLORS } from '../const/colors';
import { GAME } from '../const/game';

interface PlayerProps {
  x: SharedValue<number>;
  y: SharedValue<number>;
  hasShield?: boolean;
  dodgeFlashTrigger?: number; // Increment to trigger flash
}

export const Player: React.FC<PlayerProps> = ({ x, y, hasShield = false, dodgeFlashTrigger = 0 }) => {
  const shieldPulse = useSharedValue(1);
  const dodgeFlashOpacity = useSharedValue(0);
  const dodgeFlashScale = useSharedValue(1);

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

  // Trigger flash animation when dodgeFlashTrigger changes
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

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Dodge flash ring */}
      <Animated.View style={[styles.dodgeFlash, dodgeFlashStyle]} />
      {hasShield && (
        <Animated.View style={[styles.shield, shieldStyle]} />
      )}
      <View style={styles.glow} />
      <View style={styles.player} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: GAME.PLAYER_RADIUS * 2,
    height: GAME.PLAYER_RADIUS * 2,
  },
  dodgeFlash: {
    position: 'absolute',
    width: GAME.PLAYER_RADIUS * 3.5,
    height: GAME.PLAYER_RADIUS * 3.5,
    borderRadius: GAME.PLAYER_RADIUS * 1.75,
    borderWidth: 3,
    borderColor: '#ffffff',
    top: -GAME.PLAYER_RADIUS * 0.75,
    left: -GAME.PLAYER_RADIUS * 0.75,
    backgroundColor: 'transparent',
  },
  shield: {
    position: 'absolute',
    width: GAME.PLAYER_RADIUS * 3,
    height: GAME.PLAYER_RADIUS * 3,
    borderRadius: GAME.PLAYER_RADIUS * 1.5,
    borderWidth: 4,
    borderColor: '#44ff44',
    top: -GAME.PLAYER_RADIUS * 0.5,
    left: -GAME.PLAYER_RADIUS * 0.5,
    backgroundColor: 'rgba(68, 255, 68, 0.2)',
  },
  glow: {
    position: 'absolute',
    width: GAME.PLAYER_RADIUS * 2.5,
    height: GAME.PLAYER_RADIUS * 2.5,
    borderRadius: GAME.PLAYER_RADIUS * 1.25,
    backgroundColor: COLORS.playerGlow,
    top: -GAME.PLAYER_RADIUS * 0.25,
    left: -GAME.PLAYER_RADIUS * 0.25,
  },
  player: {
    width: GAME.PLAYER_RADIUS * 2,
    height: GAME.PLAYER_RADIUS * 2,
    borderRadius: GAME.PLAYER_RADIUS,
    backgroundColor: COLORS.player,
  },
});
```

**Step 2: Commit**

```bash
git add src/entity/Player.tsx
git commit -m "feat: add close dodge flash animation to Player"
```

---

## Task 8: Wire Up Close Dodge in Play Screen

**Files:**
- Modify: `src/screen/Play.tsx`

**Step 1: Add state for dodge flash trigger**

In `PlayScreen` component, add:

```typescript
const [dodgeFlashTrigger, setDodgeFlashTrigger] = useState(0);
```

**Step 2: Handle closeDodge event**

Update the event callback in useEffect:

```typescript
engine.setEventCallback((event, data) => {
  if (event === 'gameOver') {
    setIsGameOver(true);
    const finalScore = engine.getState().score;
    if (finalScore > 0) {
      addScore(finalScore);
    }
    if (sfxEnabled) {
      audioManager.playGameOver();
    }
  } else if (event === 'scoreUpdate') {
    setScore(data as number);
  } else if (event === 'stateChange') {
    const state = engine.getState();
    setHasStarted(state.hasStarted);
  } else if (event === 'closeDodge') {
    setDodgeFlashTrigger((prev) => prev + 1);
    if (sfxEnabled) {
      audioManager.playDodge();
    }
  }
});
```

**Step 3: Pass dodgeFlashTrigger to Player**

Update the Player component usage:

```typescript
<Player
  x={playerX}
  y={playerY}
  hasShield={activeEffects.shield.active}
  dodgeFlashTrigger={dodgeFlashTrigger}
/>
```

**Step 4: Commit**

```bash
git add src/screen/Play.tsx
git commit -m "feat: wire up close dodge visual and audio feedback"
```

---

## Task 9: Add Speed Scoring Constants

**Files:**
- Modify: `src/const/game.ts`

**Step 1: Add speed scoring constants**

Add to `src/const/game.ts`:

```typescript
// Speed scoring multipliers based on enemy count
SPEED_SCORE_THRESHOLD_MEDIUM: 4, // 4+ enemies = 1.5x
SPEED_SCORE_THRESHOLD_HIGH: 7, // 7+ enemies = 2.0x
SPEED_SCORE_MULTIPLIER_MEDIUM: 1.5,
SPEED_SCORE_MULTIPLIER_HIGH: 2.0,
```

**Step 2: Commit**

```bash
git add src/const/game.ts
git commit -m "feat: add speed scoring constants"
```

---

## Task 10: Implement Speed Scoring in GameEngine

**Files:**
- Modify: `src/game/GameEngine.ts`

**Step 1: Add getEnemyCountMultiplier helper**

Add this private method to GameEngine class:

```typescript
private getEnemyCountMultiplier(): number {
  const count = this.state.enemies.length;
  if (count >= GAME.SPEED_SCORE_THRESHOLD_HIGH) return GAME.SPEED_SCORE_MULTIPLIER_HIGH;
  if (count >= GAME.SPEED_SCORE_THRESHOLD_MEDIUM) return GAME.SPEED_SCORE_MULTIPLIER_MEDIUM;
  return 1.0;
}
```

**Step 2: Apply speed multiplier to score calculation**

In the update method, modify the score calculation section (around line 230):

```typescript
// 7. Update score - points per enemy despawned, scaled by elapsed time and enemy count
if (result.removedCount > 0) {
  const timeMultiplier = 1 + this.state.playTime / 60000; // +1x per minute
  const enemyCountMultiplier = this.getEnemyCountMultiplier();
  let pointsPerEnemy = Math.floor(GAME.POINTS_PER_ENEMY * timeMultiplier * enemyCountMultiplier);

  // Apply booster multiplier if active
  if (this.state.activeEffects.multiplier.active) {
    pointsPerEnemy *= this.state.activeEffects.multiplier.value;
  }

  this.state.score += result.removedCount * pointsPerEnemy;
  this.emit('scoreUpdate', this.state.score);
}
```

**Step 3: Commit**

```bash
git add src/game/GameEngine.ts
git commit -m "feat: implement speed scoring based on enemy count"
```

---

## Task 11: Add Personal Best to Highscore Store

**Files:**
- Modify: `src/state/highscoreStore.ts`

**Step 1: Add getBestScore selector**

Update `src/state/highscoreStore.ts`:

```typescript
interface HighscoreState {
  scores: HighscoreEntry[];
  addScore: (score: number) => void;
  clearScores: () => void;
  getBestScore: () => number;
}

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
```

**Step 2: Commit**

```bash
git add src/state/highscoreStore.ts
git commit -m "feat: add getBestScore selector to highscore store"
```

---

## Task 12: Add Personal Best UI During Gameplay

**Files:**
- Modify: `src/screen/Play.tsx`

**Step 1: Get best score from store**

Add to PlayScreen:

```typescript
const { addScore, getBestScore } = useHighscoreStore();
const bestScore = getBestScore();
const [passedBest, setPassedBest] = useState(false);
```

**Step 2: Track when score passes best**

Add effect to track passing best score:

```typescript
useEffect(() => {
  if (score > bestScore && bestScore > 0 && !passedBest) {
    setPassedBest(true);
  }
}, [score, bestScore, passedBest]);
```

Reset passedBest in handleRetry:

```typescript
const handleRetry = () => {
  setIsGameOver(false);
  setHasStarted(false);
  setScore(0);
  setEnemies([]);
  setBoosters([]);
  setPassedBest(false); // Add this
  setDodgeFlashTrigger(0); // Reset this too
  // ... rest of handleRetry
};
```

**Step 3: Add personal best indicator to score UI**

Update the score display section:

```typescript
<SafeAreaView style={styles.scoreContainer}>
  <Text style={styles.score}>{score}</Text>
  {bestScore > 0 && hasStarted && !isGameOver && (
    <Text style={[styles.bestScore, passedBest && styles.bestScorePassed]}>
      {passedBest ? 'NEW BEST!' : `Best: ${bestScore}`}
    </Text>
  )}
  <View style={styles.effectsContainer}>
    {/* ... existing effects ... */}
  </View>
</SafeAreaView>
```

**Step 4: Add styles**

Add to StyleSheet:

```typescript
bestScore: {
  fontSize: 14,
  color: '#888888',
  marginTop: 2,
},
bestScorePassed: {
  color: '#ffdd44',
  fontWeight: 'bold',
},
```

**Step 5: Commit**

```bash
git add src/screen/Play.tsx
git commit -m "feat: add personal best indicator during gameplay"
```

---

## Task 13: Add NEW BEST Celebration on Game Over

**Files:**
- Modify: `src/screen/Play.tsx`

**Step 1: Show NEW BEST in game over modal**

Update the game over modal:

```typescript
{isGameOver && (
  <View style={styles.gameOverOverlay}>
    <View style={styles.gameOverModal}>
      <Text style={styles.gameOverTitle}>{t('play.gameOver')}</Text>
      {passedBest && (
        <Text style={styles.newBestText}>NEW BEST!</Text>
      )}
      <Text style={styles.finalScore}>{score}</Text>
      <Pressable style={styles.button} onPress={handleRetry}>
        <Text style={styles.buttonText}>{t('common.retry')}</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.secondaryButton]}
        onPress={handleBackToMenu}
      >
        <Text style={styles.buttonText}>{t('common.menu')}</Text>
      </Pressable>
    </View>
  </View>
)}
```

**Step 2: Add newBestText style**

Add to StyleSheet:

```typescript
newBestText: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#ffdd44',
  marginBottom: 8,
},
```

**Step 3: Test manually**

Run: `npx expo start`
- Play and beat your high score
- Verify "NEW BEST!" shows during gameplay when you pass it
- Verify "NEW BEST!" shows in game over modal

**Step 4: Commit**

```bash
git add src/screen/Play.tsx
git commit -m "feat: add NEW BEST celebration on game over"
```

---

## Task 14: Final Integration Test

**Step 1: Full playtest**

Run: `npx expo start`

Verify all features work together:
- [ ] Difficulty ramps faster (intense by 40s)
- [ ] Close dodges trigger white flash around player
- [ ] Close dodges play whoosh sound
- [ ] Close dodges add +5 points
- [ ] More enemies = faster points (visible when enemies despawn)
- [ ] Personal best shows during gameplay
- [ ] "NEW BEST!" appears when you pass your best
- [ ] "NEW BEST!" shows in game over modal

**Step 2: Final commit**

```bash
git add -A
git commit -m "feat: Phase 1 Core Fun complete

- Faster difficulty ramp (45s/60s scaling)
- Close dodge detection with +5 bonus points
- Close dodge visual feedback (white flash)
- Close dodge audio feedback (whoosh sound)
- Speed scoring (1.5x at 4+ enemies, 2x at 7+)
- Personal best indicator during gameplay
- NEW BEST celebration on game over"
```

---

## Notes

### Audio File Required

Task 6 requires a dodge sound effect. Options:
1. Use a free sound from freesound.org (search "whoosh" or "dodge")
2. Generate with AI audio tools
3. Use expo-av to generate a simple beep programmatically

### Testing Strategy

This phase has no automated tests since it's primarily visual/audio feedback. Manual playtesting is the verification method.

### Dependencies

No new npm packages required. All features use existing dependencies:
- react-native-reanimated (animations)
- expo-av (audio)
- zustand (state)
