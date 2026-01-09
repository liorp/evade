# Debuff Enlarge Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a red "enlarge" debuff that temporarily increases player size by 20%, making dodging harder.

**Architecture:** Debuffs are separate entities from boosters with their own spawn timing (12s), unlock time (30s), and disjoint positioning. The enlarge effect scales both visual rendering and collision detection.

**Tech Stack:** React Native, TypeScript, React Native Reanimated, Zustand (existing stack)

---

### Task 1: Add Debuff Types and Constants

**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/constants.ts`

**Step 1: Add debuff types to types.ts**

In `src/game/types.ts`, add after `BoosterType`:

```typescript
export type DebuffType = 'enlarge';

export interface Debuff {
  id: string;
  position: Position;
  type: DebuffType;
  spawnTime: number;
}
```

**Step 2: Update ActiveEffects interface**

In `src/game/types.ts`, update `ActiveEffects`:

```typescript
export interface ActiveEffects {
  shield: {
    active: boolean;
    endTime: number;
  };
  multiplier: {
    active: boolean;
    endTime: number;
    value: number;
  };
  enlarge: {
    active: boolean;
    endTime: number;
    scale: number;
  };
}
```

**Step 3: Update GameState interface**

In `src/game/types.ts`, add to `GameState`:

```typescript
export interface GameState {
  // ... existing fields ...
  debuffs: Debuff[];
  lastDebuffSpawnTime: number;
  // ... rest of existing fields ...
}
```

**Step 4: Add debuff constants**

In `src/game/constants.ts`, add after booster constants:

```typescript
  // Debuffs
  DEBUFF_RADIUS: 28,
  DEBUFF_SPAWN_INTERVAL: 12000,
  DEBUFF_LIFETIME: 5000,
  DEBUFF_UNLOCK_TIME: 30000,
  DEBUFF_ENLARGE_DURATION: 3000,
  DEBUFF_ENLARGE_SCALE: 1.2,
```

**Step 5: Run typecheck**

Run: `npm run check`
Expected: PASS (no type errors yet, just adding types)

**Step 6: Commit**

```bash
git add src/game/types.ts src/game/constants.ts
git commit -m "feat(debuff): add types and constants for enlarge debuff"
```

---

### Task 2: Add Debuff Spawning Functions

**Files:**
- Modify: `src/game/systems/spawn.ts`

**Step 1: Add debuff imports and helper**

At the top of `src/game/systems/spawn.ts`, update the import:

```typescript
import type {
  Booster,
  BoosterType,
  Debuff,
  DebuffType,
  Enemy,
  Handedness,
  Position,
  SpawnZone,
  SpeedTier,
} from '../types';
```

**Step 2: Add createDebuff function**

After `createBooster` function:

```typescript
export function createDebuff(position: Position, currentTime: number): Debuff {
  return {
    id: generateId(),
    position,
    type: 'enlarge',
    spawnTime: currentTime,
  };
}
```

**Step 3: Add shouldSpawnDebuff function**

After `shouldSpawnBooster`:

```typescript
export function shouldSpawnDebuff(
  playTime: number,
  lastDebuffSpawnTime: number,
  currentTime: number,
  currentDebuffs: number,
): boolean {
  // Only spawn after unlock time
  if (playTime < GAME.DEBUFF_UNLOCK_TIME) return false;
  // Only one debuff at a time
  if (currentDebuffs >= 1) return false;
  return currentTime - lastDebuffSpawnTime >= GAME.DEBUFF_SPAWN_INTERVAL;
}
```

**Step 4: Add getDebuffSpawnPosition function**

After `getBoosterSpawnPosition`:

```typescript
export function getDebuffSpawnPosition(
  screenWidth: number,
  screenHeight: number,
  playerPosition: Position,
  boosterPositions: Position[],
): Position {
  const margin = 80;
  const minDistFromPlayer = 150;
  const minDistFromBooster = 150;

  let x: number, y: number;
  let attempts = 0;

  do {
    x = margin + Math.random() * (screenWidth - margin * 2);
    y = margin + Math.random() * (screenHeight - margin * 2);
    attempts++;

    const tooCloseToPlayer = Math.hypot(x - playerPosition.x, y - playerPosition.y) < minDistFromPlayer;
    const tooCloseToBooster = boosterPositions.some(
      (b) => Math.hypot(x - b.x, y - b.y) < minDistFromBooster,
    );

    if (!tooCloseToPlayer && !tooCloseToBooster) {
      return { x, y };
    }
  } while (attempts < 20);

  return { x, y };
}
```

**Step 5: Add isDebuffExpired function**

After `isBoosterExpired`:

```typescript
export function isDebuffExpired(debuff: Debuff, currentTime: number): boolean {
  return currentTime - debuff.spawnTime > GAME.DEBUFF_LIFETIME;
}
```

**Step 6: Run typecheck**

Run: `npm run check`
Expected: PASS

**Step 7: Commit**

```bash
git add src/game/systems/spawn.ts
git commit -m "feat(debuff): add spawning functions for debuffs"
```

---

### Task 3: Add Debuff Collision Detection

**Files:**
- Modify: `src/game/systems/collision.ts`

**Step 1: Add Debuff import**

Update import in `src/game/systems/collision.ts`:

```typescript
import type { Booster, Debuff, Enemy, Position } from '../types';
```

**Step 2: Add checkDebuffCollision function**

After `checkBoosterCollision`:

```typescript
export function checkDebuffCollision(
  playerPosition: Position,
  debuffs: Debuff[],
  playerRadius: number = GAME.PLAYER_RADIUS,
): Debuff | null {
  const collisionDistance = playerRadius + GAME.DEBUFF_RADIUS;

  for (const debuff of debuffs) {
    if (distance(playerPosition, debuff.position) < collisionDistance) {
      return debuff;
    }
  }

  return null;
}
```

**Step 3: Run typecheck**

Run: `npm run check`
Expected: PASS

**Step 4: Commit**

```bash
git add src/game/systems/collision.ts
git commit -m "feat(debuff): add collision detection for debuffs"
```

---

### Task 4: Integrate Debuffs into GameEngine

**Files:**
- Modify: `src/game/GameEngine.ts`

**Step 1: Add debuff imports**

Update imports at top of `src/game/GameEngine.ts`:

```typescript
import { checkCollision, checkDebuffCollision } from './systems/collision';
```

```typescript
import {
  createBooster,
  createDebuff,
  createEnemy,
  getBoosterSpawnPosition,
  getDebuffSpawnPosition,
  getSpawnPosition,
  isBoosterExpired,
  isDebuffExpired,
  shouldSpawn,
  shouldSpawnBooster,
  shouldSpawnDebuff,
} from './systems/spawn';
```

```typescript
import type { Booster, Debuff, Enemy, GameState, Handedness, Position } from './types';
```

**Step 2: Update GameEventType**

Update the type:

```typescript
export type GameEventType = 'gameOver' | 'scoreUpdate' | 'stateChange' | 'boosterCollected' | 'debuffCollected';
```

**Step 3: Update createInitialState**

In the `createInitialState` method, update the return to include debuffs:

```typescript
private createInitialState(screenWidth: number, screenHeight: number): GameState {
  return {
    isRunning: false,
    isPaused: true,
    isGameOver: false,
    hasStarted: false,
    score: 0,
    playTime: 0,
    playerPosition: { x: screenWidth / 2, y: screenHeight / 2 },
    enemies: [],
    boosters: [],
    debuffs: [],
    activeEffects: {
      shield: { active: false, endTime: 0 },
      multiplier: { active: false, endTime: 0, value: 1 },
      enlarge: { active: false, endTime: 0, scale: 1 },
    },
    startTime: 0,
    lastSpawnTime: 0,
    lastBoosterSpawnTime: 0,
    lastDebuffSpawnTime: 0,
    screenWidth,
    screenHeight,
  };
}
```

**Step 4: Add checkDebuffCollection method**

After `checkBoosterCollection`:

```typescript
private checkDebuffCollection(): Debuff | null {
  const playerRadius = this.state.activeEffects.enlarge.active
    ? GAME.PLAYER_RADIUS * this.state.activeEffects.enlarge.scale
    : GAME.PLAYER_RADIUS;

  for (const debuff of this.state.debuffs) {
    const distance = Math.hypot(
      debuff.position.x - this.state.playerPosition.x,
      debuff.position.y - this.state.playerPosition.y,
    );
    if (distance < playerRadius + GAME.DEBUFF_RADIUS) {
      return debuff;
    }
  }
  return null;
}
```

**Step 5: Add applyDebuffEffect method**

After `applyBoosterEffect`:

```typescript
private applyDebuffEffect(debuff: Debuff, timestamp: number): void {
  switch (debuff.type) {
    case 'enlarge':
      this.state.activeEffects.enlarge.active = true;
      this.state.activeEffects.enlarge.endTime = timestamp + GAME.DEBUFF_ENLARGE_DURATION;
      this.state.activeEffects.enlarge.scale = GAME.DEBUFF_ENLARGE_SCALE;
      break;
  }
}
```

**Step 6: Update updateActiveEffects**

Add enlarge expiration check in `updateActiveEffects`:

```typescript
private updateActiveEffects(timestamp: number): void {
  // Check shield expiration
  if (
    this.state.activeEffects.shield.active &&
    timestamp > this.state.activeEffects.shield.endTime
  ) {
    this.state.activeEffects.shield.active = false;
  }

  // Check multiplier expiration
  if (
    this.state.activeEffects.multiplier.active &&
    timestamp > this.state.activeEffects.multiplier.endTime
  ) {
    this.state.activeEffects.multiplier.active = false;
    this.state.activeEffects.multiplier.value = 1;
  }

  // Check enlarge expiration
  if (
    this.state.activeEffects.enlarge.active &&
    timestamp > this.state.activeEffects.enlarge.endTime
  ) {
    this.state.activeEffects.enlarge.active = false;
    this.state.activeEffects.enlarge.scale = 1;
  }
}
```

**Step 7: Update collision check to use dynamic radius**

In the `update` method, update the collision check:

```typescript
// 1. Check collision first (but shield protects)
const playerRadius = this.state.activeEffects.enlarge.active
  ? GAME.PLAYER_RADIUS * this.state.activeEffects.enlarge.scale
  : GAME.PLAYER_RADIUS;

const collidedEnemy = checkCollision(this.state.playerPosition, this.state.enemies, playerRadius);
```

Note: This requires updating `checkCollision` in `collision.ts` to accept an optional `playerRadius` parameter.

**Step 8: Update collision.ts to accept playerRadius**

In `src/game/systems/collision.ts`, update `checkCollision`:

```typescript
export function checkCollision(
  playerPosition: Position,
  enemies: Enemy[],
  playerRadius: number = GAME.PLAYER_RADIUS,
): Enemy | null {
  const collisionDistance = playerRadius + GAME.ENEMY_RADIUS;

  for (const enemy of enemies) {
    if (distance(playerPosition, enemy.position) < collisionDistance) {
      return enemy;
    }
  }

  return null;
}
```

**Step 9: Add debuff collection check in update()**

After booster collection in the `update` method:

```typescript
// 2b. Check debuff collection
const collectedDebuff = this.checkDebuffCollection();
if (collectedDebuff) {
  this.applyDebuffEffect(collectedDebuff, timestamp);
  this.state.debuffs = this.state.debuffs.filter((d) => d.id !== collectedDebuff.id);
  this.emit('debuffCollected', collectedDebuff.type);
}
```

**Step 10: Add debuff spawning in update()**

After booster spawning:

```typescript
// 4b. Spawn debuffs
if (
  shouldSpawnDebuff(
    this.state.playTime,
    this.state.lastDebuffSpawnTime,
    timestamp,
    this.state.debuffs.length,
  )
) {
  const boosterPositions = this.state.boosters.map((b) => b.position);
  const position = getDebuffSpawnPosition(
    this.state.screenWidth,
    this.state.screenHeight,
    this.state.playerPosition,
    boosterPositions,
  );
  const debuff = createDebuff(position, timestamp);
  this.state.debuffs.push(debuff);
  this.state.lastDebuffSpawnTime = timestamp;
}
```

**Step 11: Add debuff expiration cleanup**

After booster expiration:

```typescript
// 5b. Remove expired debuffs
this.state.debuffs = this.state.debuffs.filter(
  (debuff) => !isDebuffExpired(debuff, timestamp),
);
```

**Step 12: Run typecheck**

Run: `npm run check`
Expected: PASS

**Step 13: Commit**

```bash
git add src/game/GameEngine.ts src/game/systems/collision.ts
git commit -m "feat(debuff): integrate debuff spawning and effects into game engine"
```

---

### Task 5: Create Debuff Visual Component

**Files:**
- Create: `src/entity/Debuff.tsx`

**Step 1: Create Debuff.tsx**

Create `src/entity/Debuff.tsx`:

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GAME } from '../game/constants';
import type { DebuffType } from '../game/types';

interface DebuffProps {
  x: number;
  y: number;
  type: DebuffType;
  ttlPercent: number;
  isNew?: boolean;
}

const DEBUFF_COLOR = '#ff4444';

export const Debuff: React.FC<DebuffProps> = ({ x, y, type, ttlPercent, isNew = false }) => {
  const fadeIn = useSharedValue(isNew ? 0 : 1);
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    if (isNew) {
      fadeIn.value = withTiming(1, { duration: 200 });
    }
    pulse.value = withRepeat(
      withSequence(withTiming(1.1, { duration: 400 }), withTiming(1, { duration: 400 })),
      -1,
      true,
    );
  }, [fadeIn, isNew, pulse]);

  const fadeOut = ttlPercent < 0.04 ? ttlPercent / 0.04 : 1;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x - GAME.DEBUFF_RADIUS },
      { translateY: y - GAME.DEBUFF_RADIUS },
      { scale: pulse.value },
    ],
    opacity: fadeIn.value * fadeOut,
  }));

  const renderIcon = () => {
    switch (type) {
      case 'enlarge':
        return (
          <View style={styles.expandContainer}>
            <View style={[styles.arrow, styles.arrowUp]} />
            <View style={[styles.arrow, styles.arrowDown]} />
            <View style={[styles.arrow, styles.arrowLeft]} />
            <View style={[styles.arrow, styles.arrowRight]} />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.debuffShape}>{renderIcon()}</View>
    </Animated.View>
  );
};

const size = GAME.DEBUFF_RADIUS * 2;
const arrowSize = 6;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: size,
    height: size,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debuffShape: {
    width: size,
    height: size,
    backgroundColor: DEBUFF_COLOR,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: arrowSize / 2,
    borderRightWidth: arrowSize / 2,
    borderBottomWidth: arrowSize,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#000',
  },
  arrowUp: {
    top: 0,
  },
  arrowDown: {
    bottom: 0,
    transform: [{ rotate: '180deg' }],
  },
  arrowLeft: {
    left: 0,
    transform: [{ rotate: '-90deg' }],
  },
  arrowRight: {
    right: 0,
    transform: [{ rotate: '90deg' }],
  },
});
```

**Step 2: Run typecheck**

Run: `npm run check`
Expected: PASS

**Step 3: Commit**

```bash
git add src/entity/Debuff.tsx
git commit -m "feat(debuff): add Debuff visual component with expand icon"
```

---

### Task 6: Add Scale Prop to Player Component

**Files:**
- Modify: `src/entity/Player.tsx`

**Step 1: Add scale prop to interface**

In `src/entity/Player.tsx`, update `PlayerProps`:

```typescript
interface PlayerProps {
  x: SharedValue<number>;
  y: SharedValue<number>;
  hasShield?: boolean;
  scale?: number;
  // Cosmetic props
  shape?: PlayerShape;
  colorId?: PlayerColorId;
  trail?: PlayerTrail;
  glow?: PlayerGlow;
}
```

**Step 2: Add scale to component destructuring**

Update the component:

```typescript
export const Player: React.FC<PlayerProps> = ({
  x,
  y,
  hasShield = false,
  scale = 1,
  shape = 'circle',
  colorId = 'green',
  trail = 'none',
  glow = 'none',
}) => {
```

**Step 3: Update animatedStyle to use scale**

Update the `animatedStyle`:

```typescript
const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: x.value - GAME.PLAYER_RADIUS * scale },
    { translateY: y.value - GAME.PLAYER_RADIUS * scale },
    { scale: scale },
  ],
}));
```

**Step 4: Add enlarge visual indicator**

Add a red tint when enlarged. After the glow shared values, add:

```typescript
const isEnlarged = scale > 1;
```

Add a new style for the enlarge indicator after the shield style:

```typescript
const enlargeIndicatorStyle = useAnimatedStyle(() => ({
  opacity: isEnlarged ? 0.3 : 0,
}));
```

In the return, add after the shield element:

```typescript
{/* Enlarge indicator */}
{isEnlarged && <Animated.View style={[styles.enlargeIndicator, enlargeIndicatorStyle]} />}
```

Add to styles:

```typescript
enlargeIndicator: {
  position: 'absolute',
  width: GAME.PLAYER_RADIUS * 2.2,
  height: GAME.PLAYER_RADIUS * 2.2,
  borderRadius: GAME.PLAYER_RADIUS * 1.1,
  borderWidth: 3,
  borderColor: '#ff4444',
  backgroundColor: 'rgba(255, 68, 68, 0.15)',
},
```

**Step 5: Run typecheck**

Run: `npm run check`
Expected: PASS

**Step 6: Commit**

```bash
git add src/entity/Player.tsx
git commit -m "feat(debuff): add scale prop to Player with enlarge visual indicator"
```

---

### Task 7: Integrate Debuffs into Play Screen

**Files:**
- Modify: `src/screen/Play.tsx`

**Step 1: Add Debuff import**

Add import:

```typescript
import { Debuff } from '../entity/Debuff';
```

Update types import:

```typescript
import type { ActiveEffects, Booster as BoosterType, Debuff as DebuffType, Enemy as EnemyType } from '../game/types';
```

**Step 2: Add debuffs state**

After boosters state:

```typescript
const [debuffs, setDebuffs] = useState<DebuffType[]>([]);
```

After newBoosterIds ref:

```typescript
const newDebuffIds = useRef<Set<string>>(new Set());
```

**Step 3: Update activeEffects initial state**

Update the activeEffects useState:

```typescript
const [activeEffects, setActiveEffects] = useState<ActiveEffects>({
  shield: { active: false, endTime: 0 },
  multiplier: { active: false, endTime: 0, value: 1 },
  enlarge: { active: false, endTime: 0, scale: 1 },
});
```

**Step 4: Update game loop to track debuffs**

In the interval callback, after tracking new boosters:

```typescript
// Track new debuffs for fade-in
state.debuffs.forEach((d) => {
  if (!debuffs.find((existing) => existing.id === d.id)) {
    newDebuffIds.current.add(d.id);
  }
});
```

After `setBoosters`:

```typescript
setDebuffs([...state.debuffs]);
```

After clearing booster IDs:

```typescript
newDebuffIds.current.clear();
```

**Step 5: Add debuff rendering**

After boosters rendering, add:

```typescript
{/* Debuffs */}
{debuffs.map((debuff) => {
  const age = currentTime - debuff.spawnTime;
  const ttlPercent = Math.max(0, 1 - age / GAME.DEBUFF_LIFETIME);
  return (
    <Debuff
      key={debuff.id}
      x={debuff.position.x}
      y={debuff.position.y}
      type={debuff.type}
      ttlPercent={ttlPercent}
      isNew={newDebuffIds.current.has(debuff.id)}
    />
  );
})}
```

**Step 6: Pass scale to Player**

Update Player component:

```typescript
<Player
  x={playerX}
  y={playerY}
  hasShield={activeEffects.shield.active}
  scale={activeEffects.enlarge.active ? activeEffects.enlarge.scale : 1}
  shape={equipped.playerShape}
  colorId={equipped.playerColor}
  trail={equipped.playerTrail}
  glow={equipped.playerGlow}
/>
```

**Step 7: Add enlarge badge in effectsContainer**

After multiplier badge:

```typescript
{activeEffects.enlarge.active && (
  <View style={styles.enlargeBadge}>
    <Text style={styles.enlargeIcon}>{'↑'}</Text>
  </View>
)}
```

**Step 8: Add enlarge badge styles**

Add to styles:

```typescript
enlargeBadge: {
  backgroundColor: 'rgba(255, 68, 68, 0.2)',
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: '#ff4444',
  shadowColor: '#ff4444',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.8,
  shadowRadius: 6,
  elevation: 4,
} as ViewStyle,
enlargeIcon: {
  fontSize: 14,
  fontWeight: 'bold',
  color: '#ff4444',
} as TextStyle,
```

**Step 9: Update handleRetry to reset debuffs**

In `handleRetry`, after `setBoosters([])`:

```typescript
setDebuffs([]);
```

After `newBoosterIds.current.clear()`:

```typescript
newDebuffIds.current.clear();
```

**Step 10: Run typecheck**

Run: `npm run check`
Expected: PASS

**Step 11: Commit**

```bash
git add src/screen/Play.tsx
git commit -m "feat(debuff): integrate debuffs into Play screen with rendering and badges"
```

---

### Task 8: Final Verification

**Step 1: Run full check**

Run: `npm run check`
Expected: PASS (0 lint errors, 0 type errors)

**Step 2: Manual test (if device available)**

Start the app and verify:
- Play for 30+ seconds
- Red debuff spawns separately from green boosters
- Collecting debuff makes player visibly larger with red outline
- Player returns to normal size after 3 seconds
- Collision detection works correctly with enlarged player

**Step 3: Final commit (if any cleanup needed)**

If any fixes were needed, commit them.

**Step 4: Summary**

Implementation complete. The debuff system is now integrated with:
- Types and constants defined
- Spawning logic with disjoint positioning
- Collision detection with dynamic player radius
- Visual Debuff component with expand icon
- Player scale prop with visual indicator
- Full Play screen integration with badges
