## Project Overview

EVADE is a casual arcade mobile game built with React Native + Expo, targeting ultra-short gameplay sessions (30s-1min). Players dodge enemies with increasing difficulty, earn shards through gameplay, and purchase cosmetics.

## Development Commands

```bash
# Development
npm start                    # Start Expo dev server
npm start -- --clear         # Start with cache cleared

# Platform-specific
npm run android              # Build and run on Android
npm run ios                  # Build and run on iOS
npm run ios:simulator        # Run on iOS simulator
npm run ios:device           # Run on iOS device
npm run web                  # Run web version

# Type checking
npm run typecheck            # Run TypeScript compiler (tsc --noEmit)

# Remote device testing
npm run tunnel               # Start with Expo tunnel
```

Native builds use EAS (Expo Application Services) configured in `eas.json`.

## Architecture

### Tech Stack
- **React Native 0.81** with **Expo 54** (managed workflow)
- **TypeScript** (strict mode)
- **Zustand** for state management with AsyncStorage persistence
- **React Navigation** (native-stack)
- **React Native Reanimated** for animations
- **i18next** for internationalization

### Key Directories

```
/src
├── /ads              # Ad SDK management (google-mobile-ads)
├── /audio            # Background music & SFX (expo-av)
├── /components       # Shared UI components
├── /const            # Game constants, colors, cosmetic definitions, IAP/ad IDs
├── /entity           # Game object components (Player, Enemy, Booster, backgrounds)
├── /game             # Game engine core
│   ├── GameEngine.ts # Central game loop, state management, event emitter
│   └── /systems      # Modular systems: spawn, movement, collision, difficulty
├── /i18n             # Internationalization setup and locale files
├── /iap              # In-app purchase management (expo-iap)
├── /screen           # Navigation screens (MainMenu, Play, Shop, Settings, etc.)
└── /state            # Zustand stores (ads, cosmetics, highscores, purchases, settings, shards)
```

### Game Engine Architecture

The game uses a modular systems-based architecture:

1. **GameEngine.ts** - Central loop using requestAnimationFrame for 60fps gameplay
   - Maintains immutable GameState
   - Orchestrates game systems each frame
   - Emits events: `gameOver`, `scoreUpdate`, `boosterCollected`, `closeDodge`

2. **Game Systems** (pure functional modules in `/game/systems/`):
   - `spawn.ts` - Enemy/booster spawning with zone progression
   - `movement.ts` - Enemy position updates with jitter
   - `collision.ts` - Collision detection, close dodge tracking
   - `difficulty.ts` - Time-based difficulty scaling

3. **Game Constants** (`/const/game.ts`) - All balance values centralized

### State Management

Multiple specialized Zustand stores with persistence:

- `adStore` - Ad session state, continue usage tracking
- `cosmeticStore` - Owned cosmetics, equipped items
- `highscoreStore` - High score persistence
- `purchaseStore` - IAP receipts and ad removal status
- `settingsStore` - User preferences (audio, handedness)
- `shardStore` - Currency balance

### Monetization Flow

- **AdManager** (`/src/ads/`) - Initializes and shows interstitial/rewarded ads
- **IAPManager** (`/src/iap/`) - Handles purchases (ad removal, shard packs)
- **App.tsx** - Syncs purchase state across stores on startup
- Product IDs and ad unit IDs in `/src/const/`

### Cosmetics System

40+ cosmetics across 6 categories defined in `/src/const/cosmetics.ts`:
- Player colors, shapes, trails, glows
- Enemy themes, background themes

## Key Patterns

- **Strict TypeScript** - All code is typed, platform-specific checks use `Platform.select()`
- **Functional components** with hooks exclusively
- **Immutable state updates** in Zustand stores
- **Event emitter pattern** for game events
- **Handedness support** - Left/right-handed play modes
