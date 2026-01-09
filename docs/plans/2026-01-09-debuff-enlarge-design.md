# Debuff System: Enlarge Effect

## Overview

Add a negative power-up (debuff) system to EVADE, starting with an "enlarge" debuff that temporarily increases the player's size by 20%, making dodging harder.

## Design Decisions

| Aspect | Decision |
|--------|----------|
| **Color** | Red (`#ff4444`) |
| **Effect** | 20% player size increase (visual + collision) |
| **Duration** | 3 seconds |
| **Icon** | Expand (4 arrows pointing outward) |
| **Unlock** | After 30s playtime |
| **Spawn interval** | 12 seconds |
| **Spawning** | Separate from boosters, disjoint locations |
| **Max on screen** | 1 debuff at a time |

## Implementation

### 1. Data Types (`src/game/types.ts`)

```typescript
export type DebuffType = 'enlarge';

export interface Debuff {
  id: string;
  position: Position;
  type: DebuffType;
  spawnTime: number;
}

// Update ActiveEffects
export interface ActiveEffects {
  shield: { active: boolean; endTime: number };
  multiplier: { active: boolean; endTime: number; value: number };
  enlarge: { active: boolean; endTime: number; scale: number };
}

// Update GameState
export interface GameState {
  // ... existing fields
  debuffs: Debuff[];
  lastDebuffSpawnTime: number;
}
```

### 2. Constants (`src/game/constants.ts`)

```typescript
// Debuffs
DEBUFF_RADIUS: 28,              // Same size as boosters visually
DEBUFF_SPAWN_INTERVAL: 12000,   // 12 seconds
DEBUFF_LIFETIME: 5000,          // 5s on screen before disappearing
DEBUFF_UNLOCK_TIME: 30000,      // Unlocks at 30 seconds playtime
DEBUFF_ENLARGE_DURATION: 3000,  // Effect lasts 3 seconds
DEBUFF_ENLARGE_SCALE: 1.2,      // 20% size increase
```

### 3. Spawning (`src/game/systems/spawn.ts`)

Add functions:
- `createDebuff(position, currentTime)` - Creates a debuff entity
- `shouldSpawnDebuff(playTime, lastDebuffSpawnTime, currentDebuffs)` - Checks unlock time, interval, max count
- `getDebuffSpawnPosition(screenWidth, screenHeight, playerPosition, boosterPositions)` - Ensures disjoint from boosters (~150px minimum distance)
- `isDebuffExpired(debuff, currentTime)` - Checks if debuff should be removed

### 4. Collision (`src/game/systems/collision.ts`)

Add `checkDebuffCollision(playerPosition, debuffs)` - mirrors `checkBoosterCollision()`

### 5. Game Engine (`src/game/GameEngine.ts`)

**Initial state:**
- Add `debuffs: []` and `lastDebuffSpawnTime: now` to initial state
- Add `enlarge: { active: false, endTime: 0, scale: 1 }` to activeEffects

**Update loop additions:**
1. Check debuff collection after booster collection
2. Spawn debuffs (after booster spawning, respecting unlock time)
3. Remove expired debuffs
4. Update enlarge effect expiration in `updateActiveEffects()`

**Effect application:**
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

**Collision detection:**
When checking enemy collision, use dynamic player radius:
```typescript
const playerRadius = this.state.activeEffects.enlarge.active
  ? GAME.PLAYER_RADIUS * this.state.activeEffects.enlarge.scale
  : GAME.PLAYER_RADIUS;
```

### 6. Debuff Component (`src/entity/Debuff.tsx`)

New component similar to `Booster.tsx`:
- Red color (`#ff4444`) instead of green
- Same pulsing animation and fade-in/fade-out behavior
- Expand icon: four small arrows pointing outward from center (using Views)
- Same size as boosters (`DEBUFF_RADIUS: 28`)

### 7. Player Component (`src/entity/Player.tsx`)

Add `scale` prop (defaults to 1):
```typescript
interface PlayerProps {
  // ... existing props
  scale?: number;
}
```

Apply scale in animated style:
```typescript
const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: x.value - GAME.PLAYER_RADIUS * scale },
    { translateY: y.value - GAME.PLAYER_RADIUS * scale },
    { scale: scale },
  ],
}));
```

When enlarged, add subtle red tint/outline to indicate debuff is active.

### 8. Play Screen (`src/screen/Play.tsx`)

**New state:**
```typescript
const [debuffs, setDebuffs] = useState<DebuffType[]>([]);
const newDebuffIds = useRef<Set<string>>(new Set());
```

**Update activeEffects initialization** to include enlarge.

**Render debuffs** after boosters in the game area.

**Pass scale to Player:**
```typescript
<Player
  // ... existing props
  scale={activeEffects.enlarge.active ? activeEffects.enlarge.scale : 1}
/>
```

**Add enlarge badge** in effectsContainer (red warning style).

**Update handleRetry** to reset debuffs state.

**Update game loop interval** to track new debuff IDs and sync debuffs state.

## Files to Modify

1. `src/game/types.ts` - Add Debuff, DebuffType, update ActiveEffects, GameState
2. `src/game/constants.ts` - Add debuff constants
3. `src/game/systems/spawn.ts` - Add debuff spawning functions
4. `src/game/systems/collision.ts` - Add checkDebuffCollision()
5. `src/game/GameEngine.ts` - Integrate debuff spawning, collection, effect application
6. `src/entity/Debuff.tsx` - New component
7. `src/entity/Player.tsx` - Add scale prop
8. `src/screen/Play.tsx` - Render debuffs, pass scale, show enlarge badge
