# EVADE Synthwave UI Redesign

**Date:** 2025-12-27
**Status:** Approved
**Goal:** Apple Award-worthy retro arcade aesthetic

---

## Design Decisions

| Aspect | Decision |
|--------|----------|
| Era/Aesthetic | 80s Synthwave/Neon |
| Visual Density | Dynamic Hybrid (clean UI, rich backgrounds) |
| Signature Motifs | Grid + Horizon Sun + Geometric Halos |
| Typography | Chrome titles, geometric sans UI text |

---

## Color Palette

```typescript
export const SYNTHWAVE_COLORS = {
  // Backgrounds
  backgroundDeep: '#0a0a12',      // Deep space black
  backgroundPanel: '#1a1a2e',     // Dark purple-black

  // Neon Accents
  neonCyan: '#00f5ff',            // Player, highlights, primary actions
  neonMagenta: '#ff2a6d',         // Enemies, danger
  neonPurple: '#9d4edd',          // UI accents
  chromeGold: '#ffd700',          // Titles, achievements
  hotPink: '#ff00aa',             // Secondary accents

  // Supporting
  gridLines: '#4a1a6b',           // Subtle purple
  textPrimary: '#ffffff',
  textMuted: '#888888',

  // Gradients
  sunBands: ['#ff2a6d', '#ffd700', '#ff6b35'],
}
```

---

## Layered Background System

All screens share this layered approach:

1. **Base:** Deep black (#0a0a12) with subtle star particles
2. **Grid Floor:** Perspective grid receding to horizon, animated slow drift
3. **Horizon Sun:** Banded sunset (magenta → gold → orange), position varies by screen
4. **Geometric Halos:** Concentric hexagons/circles, slow counter-rotation
5. **UI Layer:** Crystal-clear elements with subtle glow

---

## Screen Designs

### 1. Main Menu

**Background:**
- Full layered system active
- Sun at 60% height (welcoming)
- Two hexagonal halos flanking title, rotating opposite directions
- Faint scan lines (5% opacity)

**Title "EVADE":**
- Chrome gradient (gold → white → gold)
- Strong cyan outer glow
- Breathing animation (glow pulses every 3s)
- Massive, commanding presence

**Buttons (stacked, centered):**
- Glass-morphic: semi-transparent dark purple with blur
- Border: 1px neon purple, subtle glow
- Text: Geometric sans, all caps, wide letter-spacing
- Press: Border brightens to cyan, inner glow

**Order:**
1. PLAY (larger, cyan border)
2. SHOP
3. HIGH SCORES
4. HOW TO PLAY
5. SETTINGS (smaller, bottom)

---

### 2. Play Screen

**Background (simplified for gameplay):**
- No sun during active play
- Grid floor at 30% opacity
- Radial vignette pulling focus to center
- Theme colors from cosmetics apply

**Player:**
- 3-layer glow (inner white, mid color, outer soft)
- Trail effects from cosmetics
- Shield: pulsing cyan hexagonal barrier

**Enemies:**
- Neon edge glow (not solid fill)
- Shape = speed (circle/square/triangle)
- Color fades red → yellow near despawn
- Spawn: digital materialize effect

**Boosters:**
- Green octagon with inner glow pulse
- Clear icon inside
- Sparkle particles around edges

**UI Overlay (top):**
```
┌─────────────────────────────────────┐
│  Score: 1,240        BEST: 3,892   │
│  [SHIELD 2.3s] [x3 4.1s]           │
└─────────────────────────────────────┘
```
- Score: Chrome numbers with glow
- Effect badges: Colored pill shapes

**Touch to Start:**
- "TOUCH TO START" with neon pulse
- Full background rendered (attract mode)

---

### 3. Game Over

**Transition:**
- White flash (50ms)
- Chromatic aberration pulse
- Background dims 40% with blur
- UI animates in staggered (100ms each)

**Modal:**
- Hexagonal frame border (magenta glow)
- Glass-morphic dark panel

**Content:**
```
GAME OVER (chrome, magenta glow)

2,847 (huge, gold chrome)
YOUR SCORE

★ NEW BEST! ★ (if achieved, sparkle)

+28 SHARDS EARNED (cyan)

[TRY AGAIN] (cyan primary)
[MAIN MENU] (purple secondary)
```

**Continue Modal:**
- Same style, cyan border (opportunity)
- 3-second countdown ring
- Clear value prop for rewarded ad

---

### 4. Shop

**Background:**
- Sun lower (sunset, relaxed browsing)
- Halos behind preview area
- Calmer, slower animations

**Layout:**
```
┌─────────────────────────────────────┐
│  ◀ BACK                    💎 1,240 │
├─────────────────────────────────────┤
│              SHOP                   │
├─────────────────────────────────────┤
│  COLORS │ SHAPES │ TRAILS │ ...    │  (tabs)
├─────────────────────────────────────┤
│         ┌─────────────────┐         │
│         │   PREVIEW       │         │  (animated)
│         │   (player)      │         │
│         └─────────────────┘         │
│              "CYAN"                 │
├─────────────────────────────────────┤
│  [●][●][●][●] ...                  │  (item grid)
├─────────────────────────────────────┤
│   [EQUIP / BUY FOR 💎 200]         │
│   [🎬 +10 💎]    [GET SHARDS]      │
└─────────────────────────────────────┘
```

**Item Cards:**
- Glass-morphic squares
- Equipped: cyan border + checkmark
- Owned: subtle purple border
- Locked: dimmed, price displayed

**Preview:**
- Live animated player
- Hexagonal frame
- Shows trail/glow in action

---

### 5. High Scores

**Background:**
- Sun higher (triumphant)
- Golden particle dust
- Trophy/star shapes floating

**Layout:**
```
┌─────────────────────────────────────┐
│  ◀ BACK                             │
├─────────────────────────────────────┤
│           HIGH SCORES               │  (chrome gold)
│         ═══════════════             │
│   RANK      SCORE        DATE       │
├─────────────────────────────────────┤
│    🥇       12,847      Dec 24      │  (gold glow)
│    🥈        9,234      Dec 22      │  (silver)
│    🥉        7,891      Dec 20      │  (bronze)
│     4        5,672      Dec 18      │
│     5        4,123      Dec 15      │
├─────────────────────────────────────┤
│   [CLEAR ALL SCORES]                │  (magenta danger)
└─────────────────────────────────────┘
```

**Row Styling:**
- #1: Golden glow behind row
- #2: Silver shimmer
- #3: Bronze tint
- 4+: Alternating subtle stripes

---

### 6. How to Play

**Background:**
- Dimmer grid, no sun
- Geometric frames around sections
- Cyan accent lighting

**Sections (scrollable):**

**GOAL:**
- Icon: player evading enemy
- "Evade enemies. Survive. Don't lift your finger!"

**CONTROLS:**
- Icon: finger dragging player
- "Touch and drag to move. Lift = game over."

**ENEMIES:**
- Visual: ● SLOW  ◇ MEDIUM  ▲ FAST
- "Color fades red → yellow as they despawn."

**BOOSTERS:**
- Visual: ⬡+ POINTS  ⬡🛡 SHIELD  ⬡x3 MULTI
- Brief descriptions

**TIPS:**
- Bullet points with key strategies

**[START PLAYING]** (cyan button)

---

### 7. Settings

**Background:**
- Minimal: faint grid only
- Thin scan lines (3% opacity)
- Utilitarian focus

**Layout:**
```
┌─────────────────────────────────────┐
│  ◀ BACK                             │
├─────────────────────────────────────┤
│            SETTINGS                 │
├─── AUDIO ───────────────────────────┤
│   Music                    [═══●]   │
│   Sound Effects            [═══●]   │
├─── CONTROLS ────────────────────────┤
│   Handedness                        │
│   [LEFT] [RIGHT]                    │
├─── PURCHASES ───────────────────────┤
│   [REMOVE ADS · $3.99]              │  (gold accent)
│   [RESTORE PURCHASES]               │
├─── ABOUT ───────────────────────────┤
│   Version 1.0.0                     │
└─────────────────────────────────────┘
```

**Toggle Switches:**
- Track: dark purple groove
- Thumb: glowing cyan when on, gray when off

**Segmented Control:**
- Glass container
- Selected: cyan fill with glow
- Smooth animated transition

---

## Transitions & Micro-interactions

### Screen Transitions

| From → To | Effect |
|-----------|--------|
| Menu → Play | Grid rushes forward, sun dips, UI fades |
| Play → Game Over | Flash, chromatic pulse, blur in |
| Any → Shop | Horizontal slide with parallax |
| Any → Back | Reverse of entry |

### Micro-interactions

**Buttons:**
- Touch: glow intensifies, scale 1.02x
- Press: scale 0.98x, border flashes white
- Release: ripple glow expands outward

**Score:**
- Numbers roll like slot machine
- Flash gold on increase
- Bonus floats up ("+50 DODGE!")

**Toggles:**
- Slide with spring overshoot
- Glow pulse on state change

---

## Implementation Notes

### New Components Needed

1. **SynthwaveBackground** - Layered background system
2. **ChromeText** - Gradient text with glow
3. **GlassButton** - Glass-morphic button
4. **NeonToggle** - Custom toggle switch
5. **HexFrame** - Hexagonal border frame
6. **StarField** - Animated star particles

### Files to Modify

- `src/const/colors.ts` - New color palette
- `src/entity/MenuBackground.tsx` - Full redesign
- `src/entity/GameBackground.tsx` - Simplify for gameplay
- `src/screen/MainMenu.tsx` - New layout + styling
- `src/screen/Play.tsx` - UI overlay styling
- `src/screen/Shop.tsx` - Complete redesign
- `src/screen/HighScores.tsx` - New styling
- `src/screen/Instructions.tsx` - Section-based layout
- `src/screen/Settings.tsx` - Custom controls
- `src/components/ContinueModal.tsx` - Hexagonal frame

### Animation Libraries

- Continue using `react-native-reanimated` for all animations
- Add spring physics for micro-interactions
- Use shared values for synchronized effects

---

## Success Criteria

- [ ] Every screen follows layered background system
- [ ] Chrome typography for all titles
- [ ] Glass-morphic panels throughout
- [ ] Neon glow effects on interactive elements
- [ ] Smooth transitions between screens
- [ ] Consistent color usage per semantic meaning
- [ ] 60fps animations maintained
- [ ] Accessibility: sufficient contrast ratios
