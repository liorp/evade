# Evade: Fun & Monetization Design

## Overview

Design for making Evade super fun and addictive while implementing a sustainable monetization model.

**Target Audience**: Casual players - quick sessions, simple fun, minimal investment
**Session Length**: Ultra-short (30 seconds - 1 minute)
**Emotional Hooks**: Near-miss excitement + mastery feedback

---

## Part 1: Core Loop Adjustments (Fun & Addictive)

### Faster Difficulty Ramp

Current ramp takes 2-3 minutes to feel intense. For ultra-short sessions:

| Parameter | Current | New |
|-----------|---------|-----|
| Spawn interval scaling | 120s | 45s |
| Max enemies scaling | 150s | 60s |
| Speed scaling | 180s | 60s |

- First 10 seconds should feel "easy", then ramp quickly
- Peak intensity by ~40 seconds

### Close Dodge System

When an enemy passes within ~15px of the player without collision:

- **Visual**: Brief white flash/ring pulse around player
- **Audio**: Satisfying "whoosh" or chime sound
- **Score**: +5 bonus points per close dodge
- Creates constant micro-rewards for skilled play

### Speed Scoring (Risk/Reward)

Points tick faster based on enemies on screen:

| Enemies on Screen | Multiplier |
|-------------------|------------|
| 1-3 | 1.0x |
| 4-6 | 1.5x |
| 7+ | 2.0x |

- Creates tension: More enemies = more danger but faster points
- Skilled players deliberately let enemies accumulate

### Near-Miss UI Feedback

- Show personal best score as a ghost line/marker during play
- Flash screen edge when you pass your previous best
- "NEW BEST!" celebration on death if beaten

---

## Part 2: Monetization System

### Ad Strategy

- Interstitial ads every **3 deaths** (preserves retry flow)
- Track deaths in session, reset counter on app close
- No ads on first death (let players get hooked first)
- No ads if player watched a rewarded ad that run

### Rewarded Ad: Continue

- On death, show "Continue?" prompt with 3-second countdown
- Watch 30s ad to revive at same position with 2-second shield
- Only available **once per run** (prevents infinite continues)
- Score continues accumulating - creates "I could still beat my best!" moment

### Ad Removal IAP

- One-time purchase: **$2.99-$4.99**
- Removes all interstitial ads permanently
- Rewarded continue still available (player's choice)
- Positioned as "Support the developer" + convenience

### Shard Currency

**Earning Methods**:
- Passive: 1 shard per 100 points scored
- Rewarded ads: 10 shards per ad (limit 3/day)

**Purchase Packs**:
| Shards | Price |
|--------|-------|
| 100 | $0.99 |
| 500 | $3.99 |
| 1500 | $9.99 |

---

## Part 3: Cosmetic System

### Player Cosmetics

**Shapes** (100-300 shards):
- Circle (default, free)
- Square
- Triangle
- Hexagon
- Star

**Colors** (100-200 shards):
- 10-15 options: neon green, hot pink, ice blue, gold, etc.

**Trails** (300-600 shards):
- None (default)
- Particle trail
- Ghost trail
- Rainbow
- Fire

**Glow Effects** (200-500 shards):
- None (default)
- Pulse
- Constant glow
- RGB cycle

### Enemy/Booster Themes (500-800 shards)

- **Classic** (default): Red enemies, colored boosters
- **Neon**: Bright outlines, dark fills
- **Retro**: Pixelated look
- **Minimal**: Simple white outlines
- **Spooky**: Purple/green Halloween vibe

### Visual Themes / Backgrounds (600-1000 shards)

- **Dark** (default): Current dark blue/black
- **Void**: Pure black, high contrast
- **Synthwave**: Purple/pink gradient, grid lines
- **Ocean**: Deep blue gradient
- **Sunset**: Orange/pink warm tones

---

## Part 4: Retention Features

### High Score Integration

- Show top 3 personal scores on death screen
- "You were X points away from #3!" messaging
- Ghost marker during gameplay showing best score's "timeline"

### Daily Challenge

- One special run per day with a modifier:
  - Fast enemies
  - No boosters
  - Double points
  - Swarm mode (extra enemies)
- Separate leaderboard for daily challenge
- Bonus shards: 5 for participating, 10 for beating daily best

### Streak System

| Consecutive Days | Shard Bonus |
|------------------|-------------|
| Day 1 | 5 |
| Day 3 | 10 |
| Day 7 | 25 |

- Lose streak if you miss a day (gentle pressure to return)

### Session Stats

On death or pause:
- "This session: X runs, best score Y, Z close dodges"
- Makes even failed runs feel like progress

---

## Part 5: Implementation Priority

### Phase 1: Core Fun
Make it addictive before monetizing.

- [ ] Faster difficulty ramp (tune GAME constants)
- [ ] Close dodge detection system
- [ ] Close dodge visual feedback (flash/pulse)
- [ ] Close dodge audio feedback
- [ ] Speed scoring multiplier based on enemy count
- [ ] Personal best marker during gameplay
- [ ] "NEW BEST!" celebration on death

### Phase 2: Basic Monetization
- [ ] Ad SDK integration (AdMob or similar)
- [ ] Interstitial ads every 3 deaths
- [ ] Death counter with session tracking
- [ ] Rewarded ad continue system
- [ ] Ad removal IAP

### Phase 3: Cosmetics Foundation
- [ ] Shard currency store
- [ ] Shard earning (passive + rewarded ads)
- [ ] Shard IAP packs
- [ ] Player shape cosmetics
- [ ] Player color cosmetics
- [ ] Player trail cosmetics
- [ ] Shop UI

### Phase 4: Cosmetics Expansion
- [ ] Player glow effects
- [ ] Enemy/booster themes
- [ ] Background themes
- [ ] Theme preview in shop

### Phase 5: Retention
- [ ] Daily challenge system
- [ ] Daily challenge modifiers
- [ ] Streak tracking
- [ ] Streak rewards
- [ ] Session stats display

---

## Technical Notes

### Close Dodge Detection

```typescript
// In collision.ts - check distance without triggering death
function checkCloseDodge(playerPos: Position, enemies: Enemy[]): number {
  const CLOSE_DODGE_THRESHOLD = 15; // px beyond collision radius
  let closeDodges = 0;

  for (const enemy of enemies) {
    const distance = Math.hypot(
      enemy.position.x - playerPos.x,
      enemy.position.y - playerPos.y
    );
    const collisionDistance = GAME.PLAYER_RADIUS + GAME.ENEMY_RADIUS;
    const dodgeDistance = collisionDistance + CLOSE_DODGE_THRESHOLD;

    if (distance > collisionDistance && distance < dodgeDistance) {
      // Mark enemy as "dodge counted" to avoid duplicate counts
      if (!enemy.dodgeCounted) {
        enemy.dodgeCounted = true;
        closeDodges++;
      }
    }
  }
  return closeDodges;
}
```

### Speed Scoring Multiplier

```typescript
function getEnemyCountMultiplier(enemyCount: number): number {
  if (enemyCount >= 7) return 2.0;
  if (enemyCount >= 4) return 1.5;
  return 1.0;
}
```

### Persistence Requirements

New stores needed:
- `shardStore.ts` - Currency balance, purchase history
- `cosmeticStore.ts` - Owned items, equipped items
- `streakStore.ts` - Current streak, last play date
- `dailyChallengeStore.ts` - Today's challenge, scores

---

## Success Metrics

- **Retention**: Day 1 > 40%, Day 7 > 15%
- **Session length**: Average 5-10 runs per session
- **Monetization**: 5% ad removal conversion, 2% cosmetic purchasers
- **Engagement**: 30%+ of players return for daily challenge
