# Web Platform Support Design

## Overview

Add full web platform support for EVADE by implementing web-specific alternatives for native-only modules: Google Ads, Firebase Analytics, and In-App Purchases.

## Platform Detection

Update `src/utils/environment.ts`:

```typescript
import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isExpoGo = /* existing logic */;
export const isNative = !isWeb && !isExpoGo;
```

Conditional loading pattern:
- `isExpoGo` → Mock implementations (testing)
- `isWeb` → Web-specific implementations (AdSense, Firebase JS)
- `isNative` → Native implementations (Google Mobile Ads, Firebase RN)

## Web Ads (Google AdSense)

AdSense doesn't have native interstitial/rewarded formats. We simulate them with modal overlays.

### Interstitial Ad (game_over placement)
- Full-screen modal overlay with display ad (300x250 or 336x280)
- "Continue" button appears after 3 seconds
- User dismisses to continue

### Rewarded Ad (continue placement)
- Full-screen modal with ad + countdown timer (5 seconds)
- User must wait for timer to complete to earn reward
- "Skip" option forfeits the reward

### Implementation

**New file: `src/ads/webAds.ts`**
- Implements same interface as `react-native-google-mobile-ads`
- `WebInterstitialAd` and `WebRewardedAd` classes
- Event emitter pattern matching native SDK

**New file: `src/ads/WebAdModal.tsx`**
- React component for fullscreen ad modal
- Handles countdown, dismiss, and reward logic

**AdSense setup:**
- Script tag in `web/index.html`
- Publisher ID in `src/const/ads.ts` (placeholder until configured)

## Firebase Analytics for Web

### Current State
- Uses `@react-native-firebase/analytics` (native only)
- Analytics calls in `src/analytics/index.ts`

### Web Implementation
- Use Firebase JS SDK (`firebase/analytics`)
- Same function signatures, different underlying implementation

**New file: `src/analytics/native.ts`**
- Extract current Firebase RN implementation

**New file: `src/analytics/web.ts`**
- Firebase JS SDK implementation

**Modified: `src/analytics/index.ts`**
- Conditional export based on platform

**New file: `src/firebase/web.ts`**
- Firebase web configuration (from Firebase Console)

## IAP Handling for Web

### Approach
- IAP not available on web (no App Store/Play Store)
- Graceful degradation with informative UI

### Implementation

**Modified: `src/iap/iapManager.ts`**
- Add `isWeb` checks
- `isAvailable()` method returns `false` on web
- All purchase methods return `{ success: false, reason: 'web_not_supported' }`

**Modified: `src/screen/ShopScreen.tsx`**
- Check `iapManager.isAvailable()`
- Show banner: "Purchases available on iOS/Android app"
- Disable or hide IAP-related buttons

## Files to Create/Modify

### New Files
- `src/ads/webAds.ts` - Web ads implementation
- `src/ads/WebAdModal.tsx` - Modal component for web ads
- `src/analytics/native.ts` - Native analytics wrapper
- `src/analytics/web.ts` - Web analytics implementation
- `src/firebase/web.ts` - Firebase web config

### Modified Files
- `src/utils/environment.ts` - Add `isWeb` detection
- `src/ads/adManager.ts` - Add web conditional loading
- `src/analytics/index.ts` - Platform-based exports
- `src/iap/iapManager.ts` - Web graceful handling
- `src/screen/ShopScreen.tsx` - Web UI for unavailable IAP
- `src/const/ads.ts` - AdSense publisher ID placeholder

## Configuration Required (Post-Implementation)

1. **Google AdSense**: Get publisher ID from https://www.google.com/adsense/
2. **Firebase Web**: Add web app in Firebase Console, copy config to `src/firebase/web.ts`
