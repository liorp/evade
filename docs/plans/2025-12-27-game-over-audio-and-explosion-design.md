# Game Over Audio Timing & Explosion Animation

## Overview

Fix game over audio timing to play immediately on collision (before modals/ads), and add a particle burst explosion animation with haptic feedback when the player hits an enemy.

## Problem

Currently, game over audio plays in `handleActualGameOver()` which runs after:
1. Continue modal decision
2. Potentially during ad display

Audio should play at the exact moment of collision.

## Solution

### 1. Audio Timing Fix

Move audio playback to the `gameOver` event handler, before any modal logic:

```
Collision detected (GameEngine)
    |
    v
gameOver event emitted with { position, enemyColor }
    |
    v
Play.tsx event handler:
    1. Play audio immediately
    2. Trigger vibration
    3. Store explosion state
    4. Handle continue modal / game over flow
```

### 2. Collision System Changes

**`src/game/systems/collision.ts`**
- `checkCollision()` returns the colliding enemy (or null) instead of boolean
- Allows tracking collision position and enemy color

**`src/game/GameEngine.ts`**
- `gameOver` event includes `{ score, position, enemyColor }`
- Position = enemy position at collision
- Color derived from enemy speed tier

### 3. Explosion Animation

**New file: `src/entity/Explosion.tsx`**

Props:
- `x: number` - collision x position
- `y: number` - collision y position
- `color: string` - enemy color
- `onComplete: () => void` - cleanup callback

Behavior:
- 8-12 particles spawn at collision point
- Each particle has random direction (0-360 degrees)
- Particles use enemy color
- Animation: scale up + move outward + fade out (~400ms)
- Calls `onComplete` when animation finishes

Implementation:
- Uses Reanimated for 60fps animation
- Each particle is an Animated.View
- `withTiming` for smooth transitions
- Self-removes after animation

### 4. Haptic Feedback

**`src/state/settingsStore.ts`**
- Add `hapticsEnabled: boolean` (default: true)
- Add `setHapticsEnabled(enabled: boolean)` action

**`src/screen/Settings.tsx`**
- Add haptics toggle in settings UI

**`src/screen/Play.tsx`**
- On collision: `Haptics.impactAsync(ImpactFeedbackStyle.Heavy)`
- Only if `hapticsEnabled` is true

Uses `expo-haptics` (already available in Expo).

### 5. Play.tsx Integration

State additions:
```typescript
const [explosion, setExplosion] = useState<{
  id: string;
  x: number;
  y: number;
  color: string;
} | null>(null);
```

Event handler changes:
```typescript
if (event === 'gameOver') {
  const { position, enemyColor } = data;

  // Immediate feedback
  if (sfxEnabled) audioManager.playGameOver();
  if (hapticsEnabled) Haptics.impactAsync(ImpactFeedbackStyle.Heavy);

  // Show explosion
  setExplosion({ id: Date.now().toString(), x: position.x, y: position.y, color: enemyColor });

  // Continue with modal logic...
}
```

Render explosion:
```tsx
{explosion && (
  <Explosion
    key={explosion.id}
    x={explosion.x}
    y={explosion.y}
    color={explosion.color}
    onComplete={() => setExplosion(null)}
  />
)}
```

## Files Changed

| File | Change |
|------|--------|
| `src/screen/Play.tsx` | Move audio, add vibration, add explosion state/rendering |
| `src/entity/Explosion.tsx` | New - particle burst animation component |
| `src/game/GameEngine.ts` | Include position + color in gameOver event |
| `src/game/systems/collision.ts` | Return colliding enemy instead of boolean |
| `src/state/settingsStore.ts` | Add `hapticsEnabled` setting |
| `src/screen/Settings.tsx` | Add haptics toggle |

## Dependencies

No new dependencies required:
- `expo-haptics` - included in Expo
- `react-native-reanimated` - already in use
