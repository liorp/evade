# Firebase Analytics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add comprehensive Firebase Analytics tracking for player behavior, monetization, and game balance.

**Architecture:** Centralized analytics service with typed event functions. Firebase SDK wrapped by abstraction layer. Disabled in dev, enabled in prod only.

**Tech Stack:** @react-native-firebase/app, @react-native-firebase/analytics, TypeScript

---

## Task 1: Install Firebase Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install Firebase packages**

Run:
```bash
npx expo install @react-native-firebase/app @react-native-firebase/analytics
```

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add firebase analytics dependencies"
```

---

## Task 2: Create Analytics Types

**Files:**
- Create: `src/analytics/types.ts`

**Step 1: Create the types file with all event payload types**

---

## Task 3: Create Analytics Config

**Files:**
- Create: `src/analytics/config.ts`

**Step 1: Create config with dev/prod toggle**

---

## Task 4: Create Identity Module

**Files:**
- Create: `src/analytics/identity.ts`

**Step 1: Create UUID generation and persistence**

---

## Task 5: Create Firebase Wrapper

**Files:**
- Create: `src/analytics/firebase.ts`

**Step 1: Create Firebase SDK wrapper with conditional loading**

---

## Task 6: Create Main Analytics Service

**Files:**
- Create: `src/analytics/analytics.ts`
- Create: `src/analytics/index.ts`

**Step 1: Create typed event tracking functions**

---

## Task 7: Integrate Analytics in App.tsx

**Files:**
- Modify: `App.tsx`

**Step 1: Initialize analytics on app start, track app_opened**

---

## Task 8: Integrate Analytics in adManager

**Files:**
- Modify: `src/ads/adManager.ts`

**Step 1: Track ad_shown, ad_completed, ad_failed events**

---

## Task 9: Integrate Analytics in iapManager

**Files:**
- Modify: `src/iap/iapManager.ts`

**Step 1: Track iap_initiated, iap_completed, iap_failed events**

---

## Task 10: Integrate Analytics in shardStore

**Files:**
- Modify: `src/state/shardStore.ts`

**Step 1: Track shards_changed events**

---

## Task 11: Integrate Analytics in Shop.tsx

**Files:**
- Modify: `src/screen/Shop.tsx`

**Step 1: Track shop_opened, shop_category_viewed, item_previewed, item_purchased**

---

## Task 12: Integrate Analytics in Settings.tsx

**Files:**
- Modify: `src/screen/Settings.tsx`

**Step 1: Track setting_changed events**

---

## Task 13: Integrate Analytics in Play.tsx

**Files:**
- Modify: `src/screen/Play.tsx`

**Step 1: Track game_started, game_ended, continue_used, booster_collected**

---

## Task 14: Update Ad Calls with Placement

**Files:**
- Modify: `src/screen/Play.tsx`
- Modify: `src/screen/Shop.tsx`

**Step 1: Add placement parameter to ad calls**

---

## Task 15: Verify TypeScript

**Step 1: Run typecheck, fix any errors**

---

## Task 16: Final Commit

**Step 1: Push all changes**
