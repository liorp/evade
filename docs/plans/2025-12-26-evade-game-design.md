# Evade Game Design

## Overview

Evade is a single-player reflex survival game for React Native (Expo). The player controls a circle that must avoid enemy shapes that spawn from screen edges and home toward the player. Score equals time survived.

## Core Mechanics

### Player Control
- Touch-follow: player position directly follows finger
- Finger lift pauses game immediately
- Touch resumes game, player snaps to touch position
- 1:1 mapping, no offset

### Enemy Behavior
- Spawn from screen edges/corners
- Home toward player with jitter (±15° random deviation, updated every ~200ms)
- Speed and spawn rate increase over time
- Removed when >100px off-screen

### Handedness
Affects spawn exclusion zones to prevent palm blocking visibility:
- **Right-handed:** No spawns from bottom-right corner, bottom 40% of right edge, right 40% of bottom edge
- **Left-handed:** No spawns from bottom-left corner, bottom 40% of left edge, left 40% of bottom edge

### Collision
- Circle-circle detection: `distance(player, enemy) < playerRadius + enemyRadius`
- Any collision ends the game immediately

## Architecture

```
/src
  /game
    GameEngine.ts       # Main loop, coordinates all systems
    GameContext.tsx     # React context exposing game state to UI
    types.ts            # Shared game types
    /systems
      spawn.ts          # Enemy spawning with handedness exclusion
      movement.ts       # Enemy tracking + jitter
      collision.ts      # Circle-circle collision
      difficulty.ts     # Time-based scaling curves
  /entities
    Player.ts           # Player state & rendering
    Enemy.ts            # Enemy state & rendering
  /screens
    MainMenu.tsx
    Settings.tsx
    Play.tsx            # Hosts GameEngine, handles touch
  /state
    settingsStore.ts    # Zustand store for settings persistence
  /audio
    audioManager.ts     # expo-av wrapper
```

## Game Loop

Order of operations each frame:
1. **Collision** — check for game over (must run first to prevent pass-through)
2. **Spawn** — create new enemies based on interval
3. **Movement** — update enemy positions toward player with jitter
4. **Difficulty** — adjust parameters based on elapsed time

Loop runs via `requestAnimationFrame` (~60fps). When paused, loop continues but skips all system updates.

## Difficulty Scaling

All values interpolate smoothly over game time:

| Parameter | Start | End | Duration |
|-----------|-------|-----|----------|
| Spawn interval | 2000ms | 300ms | 2 min |
| Enemy speed | 100 px/s | 300 px/s | 3 min |
| Max enemies | 5 | 30 | 2.5 min |
| Jitter intensity | 10° | 25° | 2 min |

### Spawn Progression
- 0-30s: corners only
- 30-60s: add edge midpoints
- 60s+: any point along valid edges

## Settings

Persisted via AsyncStorage:
- `handedness`: 'left' | 'right' (default: 'right')
- `musicEnabled`: boolean (default: true)
- `sfxEnabled`: boolean (default: true)

## Audio

Using expo-av:
- Background music: looping ambient track
- Game over sfx: short sound on collision
- Music continues during pause, only gameplay stops

## Visuals

### Colors
- Background: #0a0a0f (near-black)
- Player: #00ffaa (cyan-green) with subtle glow
- Enemy: #ff3366 (hot pink)
- Score: #ffffff (white)
- Menu accent: #6644ff (purple)

### Shapes
- Player: filled circle, ~40px diameter
- Enemies: filled circles, ~30px diameter
- All rendered with RN View + borderRadius

### Screens
1. **Main Menu:** Title "EVADE", Play button, Settings button
2. **Settings:** Back button, music/sfx toggles, handedness selector
3. **Play:** Full-screen gesture area, score at top, pause overlay, game over modal

## Technical Stack

- React Native (Expo)
- TypeScript
- React Navigation (stack)
- react-native-gesture-handler
- react-native-reanimated
- expo-av
- Zustand + AsyncStorage
