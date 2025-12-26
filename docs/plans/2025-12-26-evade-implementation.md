# Evade Game Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete React Native (Expo) reflex survival game where players dodge homing enemies by touch-follow controls.

**Architecture:** Game engine with ECS-inspired systems (collision, spawn, movement, difficulty) running at 60fps via requestAnimationFrame. Touch input via react-native-gesture-handler, smooth rendering via react-native-reanimated, state via Zustand, audio via expo-av.

**Tech Stack:** Expo (React Native), TypeScript, React Navigation, react-native-gesture-handler, react-native-reanimated, expo-av, Zustand, AsyncStorage

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `app.json`, `tsconfig.json`, `App.tsx`
- Create: `src/` directory structure

**Step 1: Initialize Expo project**

Run:
```bash
cd /Users/liorpolak/projects/personal/evade
npx create-expo-app@latest . --template blank-typescript
```

Expected: Expo project initialized with TypeScript template

**Step 2: Install dependencies**

Run:
```bash
npx expo install react-native-gesture-handler react-native-reanimated @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context expo-av @react-native-async-storage/async-storage zustand
```

Expected: All dependencies installed

**Step 3: Create directory structure**

Run:
```bash
mkdir -p src/game/systems src/entities src/screens src/state src/audio src/constants
```

Expected: Directory structure created

**Step 4: Configure babel for reanimated**

Modify `babel.config.js`:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

**Step 5: Commit**

```bash
git add .
git commit -m "chore: initialize Expo project with dependencies"
```

---

## Task 2: Constants & Types

**Files:**
- Create: `src/constants/colors.ts`
- Create: `src/constants/game.ts`
- Create: `src/game/types.ts`

**Step 1: Create color constants**

Create `src/constants/colors.ts`:
```typescript
export const COLORS = {
  background: '#0a0a0f',
  player: '#00ffaa',
  playerGlow: 'rgba(0, 255, 170, 0.4)',
  enemy: '#ff3366',
  score: '#ffffff',
  menuAccent: '#6644ff',
  menuAccentDark: '#4422cc',
  pauseOverlay: 'rgba(0, 0, 0, 0.5)',
  text: '#ffffff',
  textMuted: '#888888',
} as const;
```

**Step 2: Create game constants**

Create `src/constants/game.ts`:
```typescript
export const GAME = {
  PLAYER_RADIUS: 20,
  ENEMY_RADIUS: 15,

  // Difficulty scaling (ms for intervals, px/s for speed)
  INITIAL_SPAWN_INTERVAL: 2000,
  MIN_SPAWN_INTERVAL: 300,
  SPAWN_SCALE_DURATION: 120000, // 2 minutes

  INITIAL_ENEMY_SPEED: 100,
  MAX_ENEMY_SPEED: 300,
  SPEED_SCALE_DURATION: 180000, // 3 minutes

  INITIAL_MAX_ENEMIES: 5,
  FINAL_MAX_ENEMIES: 30,
  MAX_ENEMIES_SCALE_DURATION: 150000, // 2.5 minutes

  INITIAL_JITTER: 10, // degrees
  MAX_JITTER: 25,
  JITTER_SCALE_DURATION: 120000,
  JITTER_UPDATE_INTERVAL: 200, // ms

  // Spawn zone progression
  CORNERS_ONLY_UNTIL: 30000, // 30s
  EDGES_UNTIL: 60000, // 60s

  // Cleanup
  OFFSCREEN_BUFFER: 100, // px beyond screen to remove enemies

  // Handedness exclusion zone
  EXCLUSION_ZONE_PERCENT: 0.4, // 40% of edge
} as const;
```

**Step 3: Create game types**

Create `src/game/types.ts`:
```typescript
export interface Position {
  x: number;
  y: number;
}

export interface Enemy {
  id: string;
  position: Position;
  jitterAngle: number;
  lastJitterUpdate: number;
}

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  playerPosition: Position;
  enemies: Enemy[];
  startTime: number;
  lastSpawnTime: number;
  screenWidth: number;
  screenHeight: number;
}

export type Handedness = 'left' | 'right';

export interface DifficultyParams {
  spawnInterval: number;
  enemySpeed: number;
  maxEnemies: number;
  jitterIntensity: number;
}

export type SpawnZone = 'corner' | 'edge' | 'any';
```

**Step 4: Commit**

```bash
git add src/constants src/game/types.ts
git commit -m "feat: add game constants and types"
```

---

## Task 3: Settings Store

**Files:**
- Create: `src/state/settingsStore.ts`

**Step 1: Create Zustand settings store with persistence**

Create `src/state/settingsStore.ts`:
```typescript
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
```

**Step 2: Commit**

```bash
git add src/state/settingsStore.ts
git commit -m "feat: add settings store with persistence"
```

---

## Task 4: Audio Manager

**Files:**
- Create: `src/audio/audioManager.ts`
- Create: `assets/audio/` directory with placeholder

**Step 1: Create audio manager**

Create `src/audio/audioManager.ts`:
```typescript
import { Audio } from 'expo-av';

class AudioManager {
  private backgroundMusic: Audio.Sound | null = null;
  private gameOverSound: Audio.Sound | null = null;
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

      this.isLoaded = true;
    } catch (error) {
      console.warn('Audio loading failed:', error);
    }
  }

  async playMusic(): Promise<void> {
    if (!this.musicEnabled || !this.backgroundMusic) return;
    try {
      await this.backgroundMusic.setPositionAsync(0);
      await this.backgroundMusic.playAsync();
    } catch (error) {
      console.warn('Music play failed:', error);
    }
  }

  async stopMusic(): Promise<void> {
    if (!this.backgroundMusic) return;
    try {
      await this.backgroundMusic.stopAsync();
    } catch (error) {
      console.warn('Music stop failed:', error);
    }
  }

  async playGameOver(): Promise<void> {
    if (!this.sfxEnabled || !this.gameOverSound) return;
    try {
      await this.gameOverSound.setPositionAsync(0);
      await this.gameOverSound.playAsync();
    } catch (error) {
      console.warn('Game over sound failed:', error);
    }
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    }
  }

  setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
  }

  async unload(): Promise<void> {
    if (this.backgroundMusic) {
      await this.backgroundMusic.unloadAsync();
      this.backgroundMusic = null;
    }
    if (this.gameOverSound) {
      await this.gameOverSound.unloadAsync();
      this.gameOverSound = null;
    }
    this.isLoaded = false;
  }
}

export const audioManager = new AudioManager();
```

**Step 2: Create assets directory and download placeholder audio**

Run:
```bash
mkdir -p assets/audio
# Download open source audio files
curl -L "https://freesound.org/data/previews/456/456968_5121236-lq.mp3" -o assets/audio/background.mp3
curl -L "https://freesound.org/data/previews/341/341695_5858296-lq.mp3" -o assets/audio/gameover.mp3
```

Note: If curl fails, create silent placeholder files or find alternative CC0 audio.

**Step 3: Commit**

```bash
git add src/audio assets/audio
git commit -m "feat: add audio manager with background music and sfx"
```

---

## Task 5: Difficulty System

**Files:**
- Create: `src/game/systems/difficulty.ts`

**Step 1: Create difficulty system**

Create `src/game/systems/difficulty.ts`:
```typescript
import { GAME } from '../../constants/game';
import { DifficultyParams, SpawnZone } from '../types';

function lerp(start: number, end: number, elapsed: number, duration: number): number {
  const t = Math.min(elapsed / duration, 1);
  return start + (end - start) * t;
}

export function getDifficultyParams(elapsedTime: number): DifficultyParams {
  return {
    spawnInterval: lerp(
      GAME.INITIAL_SPAWN_INTERVAL,
      GAME.MIN_SPAWN_INTERVAL,
      elapsedTime,
      GAME.SPAWN_SCALE_DURATION
    ),
    enemySpeed: lerp(
      GAME.INITIAL_ENEMY_SPEED,
      GAME.MAX_ENEMY_SPEED,
      elapsedTime,
      GAME.SPEED_SCALE_DURATION
    ),
    maxEnemies: Math.floor(
      lerp(
        GAME.INITIAL_MAX_ENEMIES,
        GAME.FINAL_MAX_ENEMIES,
        elapsedTime,
        GAME.MAX_ENEMIES_SCALE_DURATION
      )
    ),
    jitterIntensity: lerp(
      GAME.INITIAL_JITTER,
      GAME.MAX_JITTER,
      elapsedTime,
      GAME.JITTER_SCALE_DURATION
    ),
  };
}

export function getSpawnZone(elapsedTime: number): SpawnZone {
  if (elapsedTime < GAME.CORNERS_ONLY_UNTIL) {
    return 'corner';
  } else if (elapsedTime < GAME.EDGES_UNTIL) {
    return 'edge';
  }
  return 'any';
}
```

**Step 2: Commit**

```bash
git add src/game/systems/difficulty.ts
git commit -m "feat: add difficulty scaling system"
```

---

## Task 6: Spawn System

**Files:**
- Create: `src/game/systems/spawn.ts`

**Step 1: Create spawn system with handedness exclusion**

Create `src/game/systems/spawn.ts`:
```typescript
import { GAME } from '../../constants/game';
import { Position, Handedness, SpawnZone, Enemy } from '../types';

interface SpawnPoint {
  position: Position;
  type: 'corner' | 'edge';
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function isInExclusionZone(
  x: number,
  y: number,
  screenWidth: number,
  screenHeight: number,
  handedness: Handedness
): boolean {
  const exclusionX = screenWidth * GAME.EXCLUSION_ZONE_PERCENT;
  const exclusionY = screenHeight * GAME.EXCLUSION_ZONE_PERCENT;

  if (handedness === 'right') {
    // Exclude bottom-right area
    const isBottomRight =
      x > screenWidth - exclusionX && y > screenHeight - exclusionY;
    const isRightBottomEdge =
      x >= screenWidth - 1 && y > screenHeight - screenHeight * GAME.EXCLUSION_ZONE_PERCENT;
    const isBottomRightEdge =
      y >= screenHeight - 1 && x > screenWidth - screenWidth * GAME.EXCLUSION_ZONE_PERCENT;
    return isBottomRight || isRightBottomEdge || isBottomRightEdge;
  } else {
    // Exclude bottom-left area
    const isBottomLeft = x < exclusionX && y > screenHeight - exclusionY;
    const isLeftBottomEdge =
      x <= 1 && y > screenHeight - screenHeight * GAME.EXCLUSION_ZONE_PERCENT;
    const isBottomLeftEdge =
      y >= screenHeight - 1 && x < screenWidth * GAME.EXCLUSION_ZONE_PERCENT;
    return isBottomLeft || isLeftBottomEdge || isBottomLeftEdge;
  }
}

function getCornerSpawnPoints(
  screenWidth: number,
  screenHeight: number,
  handedness: Handedness
): SpawnPoint[] {
  const corners: SpawnPoint[] = [
    { position: { x: 0, y: 0 }, type: 'corner' }, // TL
    { position: { x: screenWidth, y: 0 }, type: 'corner' }, // TR
    { position: { x: 0, y: screenHeight }, type: 'corner' }, // BL
    { position: { x: screenWidth, y: screenHeight }, type: 'corner' }, // BR
  ];

  return corners.filter(
    (c) => !isInExclusionZone(c.position.x, c.position.y, screenWidth, screenHeight, handedness)
  );
}

function getEdgeSpawnPoints(
  screenWidth: number,
  screenHeight: number,
  handedness: Handedness
): SpawnPoint[] {
  const edges: SpawnPoint[] = [
    // Top edge midpoint
    { position: { x: screenWidth / 2, y: 0 }, type: 'edge' },
    // Bottom edge midpoint
    { position: { x: screenWidth / 2, y: screenHeight }, type: 'edge' },
    // Left edge midpoint
    { position: { x: 0, y: screenHeight / 2 }, type: 'edge' },
    // Right edge midpoint
    { position: { x: screenWidth, y: screenHeight / 2 }, type: 'edge' },
  ];

  return edges.filter(
    (e) => !isInExclusionZone(e.position.x, e.position.y, screenWidth, screenHeight, handedness)
  );
}

function getRandomEdgePoint(
  screenWidth: number,
  screenHeight: number,
  handedness: Handedness
): Position {
  const maxAttempts = 20;
  for (let i = 0; i < maxAttempts; i++) {
    const edge = Math.floor(Math.random() * 4);
    let x: number, y: number;

    switch (edge) {
      case 0: // Top
        x = Math.random() * screenWidth;
        y = 0;
        break;
      case 1: // Bottom
        x = Math.random() * screenWidth;
        y = screenHeight;
        break;
      case 2: // Left
        x = 0;
        y = Math.random() * screenHeight;
        break;
      case 3: // Right
      default:
        x = screenWidth;
        y = Math.random() * screenHeight;
        break;
    }

    if (!isInExclusionZone(x, y, screenWidth, screenHeight, handedness)) {
      return { x, y };
    }
  }

  // Fallback to top-left if all attempts fail
  return { x: 0, y: 0 };
}

export function getSpawnPosition(
  spawnZone: SpawnZone,
  screenWidth: number,
  screenHeight: number,
  handedness: Handedness
): Position {
  if (spawnZone === 'corner') {
    const corners = getCornerSpawnPoints(screenWidth, screenHeight, handedness);
    const selected = corners[Math.floor(Math.random() * corners.length)];
    return selected.position;
  } else if (spawnZone === 'edge') {
    const corners = getCornerSpawnPoints(screenWidth, screenHeight, handedness);
    const edges = getEdgeSpawnPoints(screenWidth, screenHeight, handedness);
    const all = [...corners, ...edges];
    const selected = all[Math.floor(Math.random() * all.length)];
    return selected.position;
  } else {
    return getRandomEdgePoint(screenWidth, screenHeight, handedness);
  }
}

export function createEnemy(position: Position, currentTime: number): Enemy {
  return {
    id: generateId(),
    position,
    jitterAngle: 0,
    lastJitterUpdate: currentTime,
  };
}

export function shouldSpawn(
  lastSpawnTime: number,
  currentTime: number,
  spawnInterval: number,
  currentEnemies: number,
  maxEnemies: number
): boolean {
  if (currentEnemies >= maxEnemies) return false;
  return currentTime - lastSpawnTime >= spawnInterval;
}
```

**Step 2: Commit**

```bash
git add src/game/systems/spawn.ts
git commit -m "feat: add spawn system with handedness exclusion zones"
```

---

## Task 7: Movement System

**Files:**
- Create: `src/game/systems/movement.ts`

**Step 1: Create movement system with jitter**

Create `src/game/systems/movement.ts`:
```typescript
import { GAME } from '../../constants/game';
import { Enemy, Position } from '../types';

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

export function updateEnemyJitter(
  enemy: Enemy,
  currentTime: number,
  jitterIntensity: number
): Enemy {
  if (currentTime - enemy.lastJitterUpdate >= GAME.JITTER_UPDATE_INTERVAL) {
    const jitterRange = degreesToRadians(jitterIntensity);
    const newJitter = (Math.random() - 0.5) * 2 * jitterRange;
    return {
      ...enemy,
      jitterAngle: newJitter,
      lastJitterUpdate: currentTime,
    };
  }
  return enemy;
}

export function moveEnemy(
  enemy: Enemy,
  playerPosition: Position,
  deltaTime: number,
  speed: number
): Enemy {
  const dx = playerPosition.x - enemy.position.x;
  const dy = playerPosition.y - enemy.position.y;
  const baseAngle = Math.atan2(dy, dx);
  const finalAngle = normalizeAngle(baseAngle + enemy.jitterAngle);

  const distance = speed * (deltaTime / 1000);
  const newX = enemy.position.x + Math.cos(finalAngle) * distance;
  const newY = enemy.position.y + Math.sin(finalAngle) * distance;

  return {
    ...enemy,
    position: { x: newX, y: newY },
  };
}

export function isOffscreen(
  enemy: Enemy,
  screenWidth: number,
  screenHeight: number
): boolean {
  const buffer = GAME.OFFSCREEN_BUFFER;
  return (
    enemy.position.x < -buffer ||
    enemy.position.x > screenWidth + buffer ||
    enemy.position.y < -buffer ||
    enemy.position.y > screenHeight + buffer
  );
}

export function updateEnemies(
  enemies: Enemy[],
  playerPosition: Position,
  deltaTime: number,
  currentTime: number,
  speed: number,
  jitterIntensity: number,
  screenWidth: number,
  screenHeight: number
): Enemy[] {
  return enemies
    .map((enemy) => {
      const withJitter = updateEnemyJitter(enemy, currentTime, jitterIntensity);
      return moveEnemy(withJitter, playerPosition, deltaTime, speed);
    })
    .filter((enemy) => !isOffscreen(enemy, screenWidth, screenHeight));
}
```

**Step 2: Commit**

```bash
git add src/game/systems/movement.ts
git commit -m "feat: add enemy movement system with jitter"
```

---

## Task 8: Collision System

**Files:**
- Create: `src/game/systems/collision.ts`

**Step 1: Create collision system**

Create `src/game/systems/collision.ts`:
```typescript
import { GAME } from '../../constants/game';
import { Position, Enemy } from '../types';

function distance(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function checkCollision(playerPosition: Position, enemies: Enemy[]): boolean {
  const collisionDistance = GAME.PLAYER_RADIUS + GAME.ENEMY_RADIUS;

  for (const enemy of enemies) {
    if (distance(playerPosition, enemy.position) < collisionDistance) {
      return true;
    }
  }

  return false;
}
```

**Step 2: Commit**

```bash
git add src/game/systems/collision.ts
git commit -m "feat: add collision detection system"
```

---

## Task 9: Game Engine

**Files:**
- Create: `src/game/GameEngine.ts`

**Step 1: Create game engine**

Create `src/game/GameEngine.ts`:
```typescript
import { GameState, Position, Handedness, Enemy } from './types';
import { checkCollision } from './systems/collision';
import { getDifficultyParams, getSpawnZone } from './systems/difficulty';
import { getSpawnPosition, createEnemy, shouldSpawn } from './systems/spawn';
import { updateEnemies } from './systems/movement';

export type GameEventType = 'gameOver' | 'scoreUpdate' | 'stateChange';
export type GameEventCallback = (event: GameEventType, data?: unknown) => void;

export class GameEngine {
  private state: GameState;
  private handedness: Handedness;
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private eventCallback: GameEventCallback | null = null;

  constructor(screenWidth: number, screenHeight: number, handedness: Handedness) {
    this.handedness = handedness;
    this.state = this.createInitialState(screenWidth, screenHeight);
  }

  private createInitialState(screenWidth: number, screenHeight: number): GameState {
    return {
      isRunning: false,
      isPaused: true,
      isGameOver: false,
      score: 0,
      playerPosition: { x: screenWidth / 2, y: screenHeight / 2 },
      enemies: [],
      startTime: 0,
      lastSpawnTime: 0,
      screenWidth,
      screenHeight,
    };
  }

  setEventCallback(callback: GameEventCallback): void {
    this.eventCallback = callback;
  }

  private emit(event: GameEventType, data?: unknown): void {
    this.eventCallback?.(event, data);
  }

  getState(): GameState {
    return this.state;
  }

  setPlayerPosition(x: number, y: number): void {
    this.state.playerPosition = { x, y };
  }

  setHandedness(handedness: Handedness): void {
    this.handedness = handedness;
  }

  start(): void {
    if (this.state.isRunning) return;

    const now = performance.now();
    this.state = {
      ...this.createInitialState(this.state.screenWidth, this.state.screenHeight),
      isRunning: true,
      isPaused: true, // Wait for first touch
      startTime: now,
      lastSpawnTime: now,
    };
    this.lastTimestamp = now;
    this.emit('stateChange');
    this.loop(now);
  }

  resume(): void {
    if (!this.state.isRunning || !this.state.isPaused) return;
    this.state.isPaused = false;
    this.lastTimestamp = performance.now();
    this.emit('stateChange');
  }

  pause(): void {
    if (!this.state.isRunning || this.state.isPaused) return;
    this.state.isPaused = true;
    this.emit('stateChange');
  }

  stop(): void {
    this.state.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.emit('stateChange');
  }

  private loop = (timestamp: number): void => {
    if (!this.state.isRunning) return;

    if (!this.state.isPaused && !this.state.isGameOver) {
      const deltaTime = timestamp - this.lastTimestamp;
      this.update(timestamp, deltaTime);
    }

    this.lastTimestamp = timestamp;
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(timestamp: number, deltaTime: number): void {
    const elapsedTime = timestamp - this.state.startTime;
    const difficulty = getDifficultyParams(elapsedTime);

    // 1. Check collision first
    if (checkCollision(this.state.playerPosition, this.state.enemies)) {
      this.state.isGameOver = true;
      this.state.isRunning = false;
      this.emit('gameOver', { score: this.state.score });
      return;
    }

    // 2. Spawn enemies
    if (
      shouldSpawn(
        this.state.lastSpawnTime,
        timestamp,
        difficulty.spawnInterval,
        this.state.enemies.length,
        difficulty.maxEnemies
      )
    ) {
      const spawnZone = getSpawnZone(elapsedTime);
      const position = getSpawnPosition(
        spawnZone,
        this.state.screenWidth,
        this.state.screenHeight,
        this.handedness
      );
      const enemy = createEnemy(position, timestamp);
      this.state.enemies.push(enemy);
      this.state.lastSpawnTime = timestamp;
    }

    // 3. Move enemies
    this.state.enemies = updateEnemies(
      this.state.enemies,
      this.state.playerPosition,
      deltaTime,
      timestamp,
      difficulty.enemySpeed,
      difficulty.jitterIntensity,
      this.state.screenWidth,
      this.state.screenHeight
    );

    // 4. Update score
    this.state.score = elapsedTime / 1000;
    this.emit('scoreUpdate', this.state.score);
  }

  updateScreenSize(width: number, height: number): void {
    this.state.screenWidth = width;
    this.state.screenHeight = height;
  }
}
```

**Step 2: Commit**

```bash
git add src/game/GameEngine.ts
git commit -m "feat: add main game engine"
```

---

## Task 10: Entity Components

**Files:**
- Create: `src/entities/Player.tsx`
- Create: `src/entities/Enemy.tsx`

**Step 1: Create Player component**

Create `src/entities/Player.tsx`:
```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { GAME } from '../constants/game';

interface PlayerProps {
  x: Animated.SharedValue<number>;
  y: Animated.SharedValue<number>;
}

export const Player: React.FC<PlayerProps> = ({ x, y }) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value - GAME.PLAYER_RADIUS },
      { translateY: y.value - GAME.PLAYER_RADIUS },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
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

**Step 2: Create Enemy component**

Create `src/entities/Enemy.tsx`:
```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withSequence,
} from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { GAME } from '../constants/game';

interface EnemyProps {
  x: number;
  y: number;
  isNew?: boolean;
}

export const Enemy: React.FC<EnemyProps> = ({ x, y, isNew = false }) => {
  const opacity = useSharedValue(isNew ? 0 : 1);

  React.useEffect(() => {
    if (isNew) {
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x - GAME.ENEMY_RADIUS },
      { translateY: y - GAME.ENEMY_RADIUS },
    ],
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.enemy, animatedStyle]} />;
};

const styles = StyleSheet.create({
  enemy: {
    position: 'absolute',
    width: GAME.ENEMY_RADIUS * 2,
    height: GAME.ENEMY_RADIUS * 2,
    borderRadius: GAME.ENEMY_RADIUS,
    backgroundColor: COLORS.enemy,
  },
});
```

**Step 3: Commit**

```bash
git add src/entities
git commit -m "feat: add Player and Enemy components"
```

---

## Task 11: Play Screen

**Files:**
- Create: `src/screens/Play.tsx`

**Step 1: Create Play screen**

Create `src/screens/Play.tsx`:
```typescript
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, runOnJS } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GameEngine } from '../game/GameEngine';
import { Enemy as EnemyType } from '../game/types';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { COLORS } from '../constants/colors';
import { useSettingsStore } from '../state/settingsStore';
import { audioManager } from '../audio/audioManager';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
};

interface PlayScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Play'>;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({ navigation }) => {
  const { handedness, sfxEnabled } = useSettingsStore();
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [enemies, setEnemies] = useState<EnemyType[]>([]);
  const [screenSize, setScreenSize] = useState(Dimensions.get('window'));

  const playerX = useSharedValue(screenSize.width / 2);
  const playerY = useSharedValue(screenSize.height / 2);

  const gameEngine = useRef<GameEngine | null>(null);
  const newEnemyIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const engine = new GameEngine(screenSize.width, screenSize.height, handedness);
    gameEngine.current = engine;

    engine.setEventCallback((event, data) => {
      if (event === 'gameOver') {
        setIsGameOver(true);
        setIsPaused(true);
        if (sfxEnabled) {
          audioManager.playGameOver();
        }
      } else if (event === 'scoreUpdate') {
        setScore(data as number);
      } else if (event === 'stateChange') {
        const state = engine.getState();
        setIsPaused(state.isPaused);
      }
    });

    // Start game loop (waits for first touch)
    engine.start();

    // Update enemies at 60fps
    const interval = setInterval(() => {
      if (engine.getState().isRunning && !engine.getState().isPaused) {
        const state = engine.getState();
        const currentIds = new Set(state.enemies.map((e) => e.id));

        // Track new enemies for fade-in
        state.enemies.forEach((e) => {
          if (!enemies.find((existing) => existing.id === e.id)) {
            newEnemyIds.current.add(e.id);
          }
        });

        setEnemies([...state.enemies]);

        // Clear new flags after a frame
        setTimeout(() => {
          newEnemyIds.current.clear();
        }, 50);
      }
    }, 16);

    return () => {
      clearInterval(interval);
      engine.stop();
    };
  }, []);

  useEffect(() => {
    if (gameEngine.current) {
      gameEngine.current.setHandedness(handedness);
    }
  }, [handedness]);

  const handleStart = useCallback(() => {
    gameEngine.current?.resume();
  }, []);

  const handlePause = useCallback(() => {
    gameEngine.current?.pause();
  }, []);

  const updatePlayerPosition = useCallback((x: number, y: number) => {
    gameEngine.current?.setPlayerPosition(x, y);
  }, []);

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      playerX.value = e.x;
      playerY.value = e.y;
      runOnJS(updatePlayerPosition)(e.x, e.y);
      runOnJS(handleStart)();
    })
    .onUpdate((e) => {
      playerX.value = e.x;
      playerY.value = e.y;
      runOnJS(updatePlayerPosition)(e.x, e.y);
    })
    .onEnd(() => {
      runOnJS(handlePause)();
    });

  const handleRetry = () => {
    setIsGameOver(false);
    setScore(0);
    setEnemies([]);
    newEnemyIds.current.clear();
    playerX.value = screenSize.width / 2;
    playerY.value = screenSize.height / 2;
    gameEngine.current?.start();
  };

  const handleBackToMenu = () => {
    gameEngine.current?.stop();
    navigation.navigate('MainMenu');
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={styles.gameArea}>
          {/* Score */}
          <SafeAreaView style={styles.scoreContainer}>
            <Text style={styles.score}>{score.toFixed(1)}s</Text>
          </SafeAreaView>

          {/* Enemies */}
          {enemies.map((enemy) => (
            <Enemy
              key={enemy.id}
              x={enemy.position.x}
              y={enemy.position.y}
              isNew={newEnemyIds.current.has(enemy.id)}
            />
          ))}

          {/* Player */}
          <Player x={playerX} y={playerY} />

          {/* Pause Overlay */}
          {isPaused && !isGameOver && (
            <View style={styles.pauseOverlay}>
              <Text style={styles.pauseText}>TAP TO START</Text>
            </View>
          )}

          {/* Game Over Modal */}
          {isGameOver && (
            <View style={styles.gameOverOverlay}>
              <View style={styles.gameOverModal}>
                <Text style={styles.gameOverTitle}>GAME OVER</Text>
                <Text style={styles.finalScore}>{score.toFixed(2)}s</Text>
                <Pressable style={styles.button} onPress={handleRetry}>
                  <Text style={styles.buttonText}>Retry</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleBackToMenu}
                >
                  <Text style={styles.buttonText}>Menu</Text>
                </Pressable>
              </View>
            </View>
          )}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gameArea: {
    flex: 1,
  },
  scoreContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.score,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.pauseOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.pauseOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverModal: {
    backgroundColor: '#1a1a2e',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 250,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.enemy,
    marginBottom: 16,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.player,
    marginBottom: 24,
  },
  button: {
    backgroundColor: COLORS.menuAccent,
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 180,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.menuAccentDark,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
```

**Step 2: Commit**

```bash
git add src/screens/Play.tsx
git commit -m "feat: add Play screen with game loop integration"
```

---

## Task 12: Main Menu Screen

**Files:**
- Create: `src/screens/MainMenu.tsx`

**Step 1: Create Main Menu screen**

Create `src/screens/MainMenu.tsx`:
```typescript
import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import { audioManager } from '../audio/audioManager';
import { useSettingsStore } from '../state/settingsStore';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
};

interface MainMenuProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainMenu'>;
}

export const MainMenuScreen: React.FC<MainMenuProps> = ({ navigation }) => {
  const { musicEnabled } = useSettingsStore();

  useEffect(() => {
    const initAudio = async () => {
      await audioManager.load();
      if (musicEnabled) {
        audioManager.playMusic();
      }
    };
    initAudio();
  }, []);

  useEffect(() => {
    audioManager.setMusicEnabled(musicEnabled);
    if (musicEnabled) {
      audioManager.playMusic();
    }
  }, [musicEnabled]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>EVADE</Text>
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => navigation.navigate('Play')}
          >
            <Text style={styles.buttonText}>Play</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.buttonText}>Settings</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.player,
    marginBottom: 80,
    textShadowColor: COLORS.playerGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    backgroundColor: COLORS.menuAccent,
    paddingVertical: 16,
    paddingHorizontal: 64,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.menuAccentDark,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
```

**Step 2: Commit**

```bash
git add src/screens/MainMenu.tsx
git commit -m "feat: add Main Menu screen"
```

---

## Task 13: Settings Screen

**Files:**
- Create: `src/screens/Settings.tsx`

**Step 1: Create Settings screen**

Create `src/screens/Settings.tsx`:
```typescript
import React from 'react';
import { StyleSheet, View, Text, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import { useSettingsStore } from '../state/settingsStore';
import { Handedness } from '../game/types';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
};

interface SettingsProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
}

export const SettingsScreen: React.FC<SettingsProps> = ({ navigation }) => {
  const {
    handedness,
    musicEnabled,
    sfxEnabled,
    setHandedness,
    setMusicEnabled,
    setSfxEnabled,
  } = useSettingsStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        {/* Audio Section */}
        <Text style={styles.sectionTitle}>Audio</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Background Music</Text>
          <Switch
            value={musicEnabled}
            onValueChange={setMusicEnabled}
            trackColor={{ false: '#333', true: COLORS.menuAccent }}
            thumbColor={musicEnabled ? COLORS.player : '#888'}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sound Effects</Text>
          <Switch
            value={sfxEnabled}
            onValueChange={setSfxEnabled}
            trackColor={{ false: '#333', true: COLORS.menuAccent }}
            thumbColor={sfxEnabled ? COLORS.player : '#888'}
          />
        </View>

        {/* Controls Section */}
        <Text style={[styles.sectionTitle, styles.sectionMargin]}>Controls</Text>
        <Text style={styles.settingLabel}>Handedness</Text>
        <View style={styles.segmentedControl}>
          <Pressable
            style={[
              styles.segment,
              handedness === 'left' && styles.segmentActive,
            ]}
            onPress={() => setHandedness('left')}
          >
            <Text
              style={[
                styles.segmentText,
                handedness === 'left' && styles.segmentTextActive,
              ]}
            >
              Left
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.segment,
              handedness === 'right' && styles.segmentActive,
            ]}
            onPress={() => setHandedness('right')}
          >
            <Text
              style={[
                styles.segmentText,
                handedness === 'right' && styles.segmentTextActive,
              ]}
            >
              Right
            </Text>
          </Pressable>
        </View>
        <Text style={styles.helpText}>
          Enemies won't spawn where your palm blocks the screen
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 80,
  },
  backText: {
    fontSize: 16,
    color: COLORS.menuAccent,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  sectionMargin: {
    marginTop: 32,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 4,
    marginTop: 12,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: COLORS.menuAccent,
  },
  segmentText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: COLORS.text,
  },
  helpText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
```

**Step 2: Commit**

```bash
git add src/screens/Settings.tsx
git commit -m "feat: add Settings screen"
```

---

## Task 14: Navigation Setup

**Files:**
- Modify: `App.tsx`

**Step 1: Set up navigation**

Replace `App.tsx` with:
```typescript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MainMenuScreen } from './src/screens/MainMenu';
import { PlayScreen } from './src/screens/Play';
import { SettingsScreen } from './src/screens/Settings';
import { COLORS } from './src/constants/colors';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="MainMenu"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="MainMenu" component={MainMenuScreen} />
          <Stack.Screen name="Play" component={PlayScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
```

**Step 2: Commit**

```bash
git add App.tsx
git commit -m "feat: set up navigation between screens"
```

---

## Task 15: Audio Assets & Final Polish

**Files:**
- Create: `assets/audio/background.mp3` (download)
- Create: `assets/audio/gameover.mp3` (download)

**Step 1: Download open source audio**

Run:
```bash
# Background music - ambient electronic loop (Freesound CC0)
curl -L "https://cdn.freesound.org/previews/456/456968_5121236-lq.mp3" -o assets/audio/background.mp3 2>/dev/null || echo "Will need manual audio"

# Game over sound (Freesound CC0)
curl -L "https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3" -o assets/audio/gameover.mp3 2>/dev/null || echo "Will need manual audio"
```

Note: If downloads fail, create silent placeholder or find alternative CC0 audio manually.

**Step 2: Test the app**

Run:
```bash
npx expo start
```

Expected: App launches, main menu displays, game is playable

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: add audio assets and complete MVP"
```

---

## Summary

Implementation order:
1. Project scaffolding
2. Constants & types
3. Settings store
4. Audio manager
5. Difficulty system
6. Spawn system
7. Movement system
8. Collision system
9. Game engine
10. Entity components
11. Play screen
12. Main menu screen
13. Settings screen
14. Navigation setup
15. Audio assets & polish

Total: 15 tasks, each with clear steps and commits.
