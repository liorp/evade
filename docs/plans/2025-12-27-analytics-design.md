# Analytics Implementation Design

## Overview

Implement comprehensive analytics for Evade using Firebase Analytics (GA4) to track player behavior, monetization, and game balance.

## Decisions

| Decision | Choice |
|----------|--------|
| Provider | Firebase Analytics (feeds into GA4) |
| Architecture | Centralized service (`analytics.ts`) |
| User ID | Persistent UUID in AsyncStorage + Firebase `setUserId()` |
| Account linking | Future-ready via `setUserId()` when account exists |
| Environments | Disabled in dev (`__DEV__` check), enabled in prod only |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      App Code                           │
│  (Screens, Components, Stores, GameEngine)              │
└─────────────────┬───────────────────────────────────────┘
                  │ calls typed functions
                  ▼
┌─────────────────────────────────────────────────────────┐
│              src/analytics/analytics.ts                 │
│  - trackGameStart(), trackGameEnd(), trackAdShown()...  │
│  - All event definitions with TypeScript types          │
│  - Handles user identification                          │
└─────────────────┬───────────────────────────────────────┘
                  │ delegates to
                  ▼
┌─────────────────────────────────────────────────────────┐
│              src/analytics/firebase.ts                  │
│  - Firebase Analytics SDK initialization                │
│  - Environment-based enable/disable                     │
│  - Low-level logEvent() wrapper                         │
└─────────────────────────────────────────────────────────┘
```

## File Structure

```
src/analytics/
├── config.ts       # Environment config, enabled flag
├── identity.ts     # UUID generation, storage, setUserId calls
├── firebase.ts     # Firebase Analytics init, low-level wrapper
├── analytics.ts    # Typed event functions (public API)
└── types.ts        # Event payload type definitions
```

## User Identification

1. **App launch** → Check AsyncStorage for existing user ID
2. **First launch** → Generate UUID, store it, call `setUserId(uuid)`
3. **Returning user** → Retrieve UUID, call `setUserId(uuid)`
4. **Future: Account created** → Call `setUserId(accountId)` to link to account

Storage key: `@evade/analytics_user_id`

## Event Definitions

### Session Events

| Event | Properties |
|-------|------------|
| `app_opened` | `source` (cold/warm), `app_version` |
| `session_ended` | `duration_seconds` |

### Gameplay Events

| Event | Properties |
|-------|------------|
| `game_started` | `cosmetics` (equipped items) |
| `game_ended` | `score`, `duration_seconds`, `death_reason`, `boosters_collected`, `continue_used` |
| `continue_used` | `method` (rewarded_ad), `score_at_continue` |
| `booster_collected` | `booster_type` (shield/multiplier) |

### Monetization Events

| Event | Properties |
|-------|------------|
| `ad_shown` | `ad_type` (interstitial/rewarded), `placement` (game_over/continue/shards) |
| `ad_completed` | `ad_type`, `placement`, `reward_granted` |
| `ad_failed` | `ad_type`, `placement`, `error` |
| `iap_initiated` | `product_id`, `price` |
| `iap_completed` | `product_id`, `price`, `shards_granted` |
| `iap_failed` | `product_id`, `error` |
| `shards_changed` | `previous`, `new`, `reason` (earned/spent/purchased) |

### Shop Events

| Event | Properties |
|-------|------------|
| `shop_opened` | — |
| `shop_category_viewed` | `category` |
| `item_previewed` | `item_id`, `category`, `price` |
| `item_purchased` | `item_id`, `category`, `price` |

### Settings Events

| Event | Properties |
|-------|------------|
| `setting_changed` | `setting`, `old_value`, `new_value` |

## Integration Points

| Location | Events |
|----------|--------|
| `App.tsx` | `initAnalytics()`, `app_opened` |
| `GameEngine.ts` | `game_started`, `booster_collected`, `game_ended` |
| `Play.tsx` | `continue_used` |
| `adManager.ts` | `ad_shown`, `ad_completed`, `ad_failed` |
| `iapManager.ts` | `iap_initiated`, `iap_completed`, `iap_failed` |
| `shardStore.ts` | `shards_changed` |
| `Shop.tsx` | `shop_opened`, `shop_category_viewed` |
| `CosmeticCard.tsx` | `item_previewed`, `item_purchased` |
| `Settings.tsx` | `setting_changed` |

## Dependencies

```
@react-native-firebase/app
@react-native-firebase/analytics
```

## Environment Configuration

```typescript
// Disabled in development, enabled in production
const analyticsEnabled = !__DEV__;
```

Events are logged to console in dev for testing, but not sent to Firebase.

## Notes

- Firebase Analytics integrates natively with Google Mobile Ads for attribution
- Event names follow Firebase conventions (snake_case, max 40 chars)
- Custom parameters limited to 25 per event (Firebase limit)
