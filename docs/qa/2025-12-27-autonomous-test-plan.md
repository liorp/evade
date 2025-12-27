# EVADE - Autonomous QA Test Plan

**Date:** 2025-12-27
**Tester:** Claude Code (Autonomous)
**Platform:** iOS Simulator
**App Version:** 1.0.0

---

## Test Scope

This autonomous test plan covers functional testing of the EVADE arcade game across all major features.

---

## Test Cases

### TC-01: App Launch & Main Menu
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Launch app | App loads without crashes |
| 2 | Verify Main Menu | All buttons visible: Play, Shop, Settings, High Scores, Instructions |
| 3 | Check UI layout | Buttons properly spaced, title visible |

### TC-02: Instructions Screen
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap Instructions button | Instructions screen opens |
| 2 | Read content | Game instructions displayed |
| 3 | Tap Back | Returns to Main Menu |

### TC-03: Play Screen & Gameplay
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap Play button | Game screen loads |
| 2 | Verify player character | Player visible with default cosmetics |
| 3 | Touch and drag | Player follows finger movement |
| 4 | Wait for enemies | Enemies spawn from screen edges |
| 5 | Dodge enemies | Score increases when enemies despawn |
| 6 | Collect booster | Shield/multiplier effect activates |
| 7 | Collide with enemy | Game Over modal appears |

### TC-04: Game Over Flow
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Die in game | Game Over modal displays |
| 2 | Check score | Final score and shards earned shown |
| 3 | Tap Retry | New game starts |
| 4 | Die again, tap Menu | Returns to Main Menu |

### TC-05: Shop Screen - Navigation
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap Shop button | Shop screen opens |
| 2 | Check header | Shard balance displayed |
| 3 | Tap category tabs | Categories switch (Colors, Shapes, Trails, Glow, Enemies, Backgrounds) |
| 4 | Tap Back | Returns to Main Menu |

### TC-06: Shop - Free Items
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to Colors tab | Free item (Green) shows "Free" badge |
| 2 | Tap free item | Item is owned (shows Equip button) |
| 3 | Tap Equip | Item equipped (shows checkmark) |

### TC-07: Shop - Paid Items
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to Shapes tab | Paid items show shard prices |
| 2 | Tap paid item without shards | "Not enough shards" alert |
| 3 | With sufficient shards | Purchase successful, item owned |

### TC-08: Shop - Shard Packs
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Scroll to Shard Packs section | IAP options visible |
| 2 | Check prices | 100/500/1500 shard options shown |
| 3 | Tap pack | Purchase flow initiates (mock in dev) |

### TC-09: Settings Screen
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Tap Settings button | Settings screen opens |
| 2 | Toggle Music | Music on/off state changes |
| 3 | Toggle Sound Effects | SFX on/off state changes |
| 4 | Toggle Handedness | Left/Right mode switches |
| 5 | Tap Back | Returns to Main Menu |

### TC-10: High Scores Screen
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Play a game and score | Score recorded |
| 2 | Tap High Scores button | High Scores screen opens |
| 3 | Check leaderboard | Scores displayed with timestamps |
| 4 | Tap Back | Returns to Main Menu |

### TC-11: Cosmetics in Gameplay
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Equip non-default color in Shop | Color selected |
| 2 | Start game | Player renders with new color |
| 3 | Verify visual change | Cosmetic properly applied |

### TC-12: Persistence Test
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note current shard balance | Balance recorded |
| 2 | Play and earn shards | Balance increases |
| 3 | Close and reopen app | Balance persisted |

### TC-13: Continue System
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Die in game | Continue modal may appear |
| 2 | If available, tap Continue | Rewarded ad prompt shown |
| 3 | Watch ad (mock) | Game resumes with shield |

### TC-14: Ad Display (Mock)
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Die 3 times | Interstitial ad shown (after every 3 deaths) |
| 2 | Tap "Watch Ad for Shards" in Shop | Rewarded ad plays |
| 3 | Complete ad | 10 shards awarded |

---

## Test Results Template

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC-01 | | |
| TC-02 | | |
| TC-03 | | |
| TC-04 | | |
| TC-05 | | |
| TC-06 | | |
| TC-07 | | |
| TC-08 | | |
| TC-09 | | |
| TC-10 | | |
| TC-11 | | |
| TC-12 | | |
| TC-13 | | |
| TC-14 | | |

---

## Environment

- **Device:** iPhone 15 Pro (Simulator)
- **iOS Version:** Latest available
- **Expo Mode:** Development client
- **Test Data:** Fresh install (no prior state)
