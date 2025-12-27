# Synthwave UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform EVADE into an Apple Award-worthy 80s Synthwave arcade game.

**Architecture:** Layered background system (stars → grid → sun → halos → UI), reusable components (ChromeText, GlassButton, NeonToggle), and consistent micro-interactions across all screens.

**Tech Stack:** React Native, Reanimated 4, Expo, TypeScript

---

## Phase 1: Foundation

### Task 1.1: Update Color Palette

**Files:**
- Modify: `src/const/colors.ts`

**Step 1: Replace color constants**

```typescript
export const COLORS = {
  // Backgrounds
  backgroundDeep: '#0a0a12',
  backgroundPanel: '#1a1a2e',

  // Neon Accents
  neonCyan: '#00f5ff',
  neonMagenta: '#ff2a6d',
  neonPurple: '#9d4edd',
  chromeGold: '#ffd700',
  hotPink: '#ff00aa',

  // Supporting
  gridLines: '#4a1a6b',
  textPrimary: '#ffffff',
  textMuted: '#888888',

  // Legacy mappings (for gradual migration)
  background: '#0a0a12',
  player: '#00f5ff',
  playerGlow: 'rgba(0, 245, 255, 0.4)',
  enemy: '#ff2a6d',
  score: '#ffffff',
  menuAccent: '#9d4edd',
  menuAccentDark: '#6b21a8',
  pauseOverlay: 'rgba(0, 0, 0, 0.6)',
  text: '#ffffff',
  textMuted: '#888888',
} as const;

// Gradient definitions
export const GRADIENTS = {
  sunBands: ['#ff2a6d', '#ffd700', '#ff6b35'],
  chrome: ['#ffd700', '#ffffff', '#ffd700'],
  neonPurple: ['#9d4edd', '#6b21a8'],
} as const;
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/const/colors.ts
git commit -m "feat: update color palette to synthwave theme"
```

---

### Task 1.2: Create StarField Component

**Files:**
- Create: `src/components/ui/StarField.tsx`

**Step 1: Create the component**

```typescript
import React, { useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
}

const StarParticle: React.FC<{ star: Star }> = ({ star }) => {
  const opacity = useSharedValue(star.opacity * 0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(star.opacity, {
        duration: star.duration,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

export const StarField: React.FC<{ count?: number }> = ({ count = 50 }) => {
  const stars = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2,
      opacity: 0.3 + Math.random() * 0.7,
      duration: 2000 + Math.random() * 3000,
    }));
  }, [count]);

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.map((star) => (
        <StarParticle key={star.id} star={star} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
  },
});
```

**Step 2: Commit**

```bash
mkdir -p src/components/ui
git add src/components/ui/StarField.tsx
git commit -m "feat: add StarField component for background layer"
```

---

### Task 1.3: Create PerspectiveGrid Component

**Files:**
- Create: `src/components/ui/PerspectiveGrid.tsx`

**Step 1: Create the component**

```typescript
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../../const/colors';

const { width, height } = Dimensions.get('window');

interface PerspectiveGridProps {
  opacity?: number;
  animated?: boolean;
}

export const PerspectiveGrid: React.FC<PerspectiveGridProps> = ({
  opacity = 0.6,
  animated = true,
}) => {
  const offsetY = useSharedValue(0);

  React.useEffect(() => {
    if (animated) {
      offsetY.value = withRepeat(
        withTiming(40, { duration: 4000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offsetY.value }],
  }));

  const horizonY = height * 0.4;
  const vanishingPointX = width / 2;
  const numVerticalLines = 15;
  const numHorizontalLines = 12;

  const verticalLines = [];
  for (let i = 0; i <= numVerticalLines; i++) {
    const ratio = i / numVerticalLines;
    const bottomX = ratio * width;
    const topX = vanishingPointX + (bottomX - vanishingPointX) * 0.1;
    verticalLines.push(
      <Line
        key={`v-${i}`}
        x1={bottomX}
        y1={height}
        x2={topX}
        y2={horizonY}
        stroke={COLORS.gridLines}
        strokeWidth={1}
        opacity={opacity}
      />
    );
  }

  const horizontalLines = [];
  for (let i = 0; i <= numHorizontalLines; i++) {
    const ratio = i / numHorizontalLines;
    const y = horizonY + (height - horizonY) * Math.pow(ratio, 1.5);
    const perspectiveScale = 1 - (1 - ratio) * 0.9;
    const leftX = vanishingPointX - (vanishingPointX * perspectiveScale);
    const rightX = vanishingPointX + (vanishingPointX * perspectiveScale);
    horizontalLines.push(
      <Line
        key={`h-${i}`}
        x1={leftX}
        y1={y}
        x2={rightX}
        y2={y}
        stroke={COLORS.gridLines}
        strokeWidth={1}
        opacity={opacity * ratio}
      />
    );
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.gridContainer, animated && animatedStyle]}>
        <Svg width={width} height={height} style={styles.svg}>
          {verticalLines}
          {horizontalLines}
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  gridContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
  },
  svg: {
    position: 'absolute',
    bottom: 0,
  },
});
```

**Step 2: Install react-native-svg if needed**

Run: `npx expo install react-native-svg`

**Step 3: Commit**

```bash
git add src/components/ui/PerspectiveGrid.tsx package.json package-lock.json
git commit -m "feat: add PerspectiveGrid component for synthwave floor"
```

---

### Task 1.4: Create HorizonSun Component

**Files:**
- Create: `src/components/ui/HorizonSun.tsx`

**Step 1: Create the component**

```typescript
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Ellipse, Rect, Defs, LinearGradient, Stop, ClipPath } from 'react-native-svg';
import { GRADIENTS } from '../../const/colors';

const { width } = Dimensions.get('window');

interface HorizonSunProps {
  position?: number; // 0-1, vertical position (0 = top, 1 = bottom)
  size?: number;
}

export const HorizonSun: React.FC<HorizonSunProps> = ({
  position = 0.4,
  size = 200,
}) => {
  const sunY = Dimensions.get('window').height * position;
  const bands = 8;
  const bandHeight = size / (bands * 2);

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={width} height={size} style={{ position: 'absolute', top: sunY - size / 2 }}>
        <Defs>
          <LinearGradient id="sunGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={GRADIENTS.sunBands[0]} />
            <Stop offset="0.5" stopColor={GRADIENTS.sunBands[1]} />
            <Stop offset="1" stopColor={GRADIENTS.sunBands[2]} />
          </LinearGradient>
          <ClipPath id="sunClip">
            <Ellipse cx={width / 2} cy={size / 2} rx={size / 2} ry={size / 2} />
          </ClipPath>
        </Defs>

        {/* Sun base */}
        <Ellipse
          cx={width / 2}
          cy={size / 2}
          rx={size / 2}
          ry={size / 2}
          fill="url(#sunGradient)"
        />

        {/* Horizontal bands (black stripes) */}
        {Array.from({ length: bands }, (_, i) => (
          <Rect
            key={i}
            x={0}
            y={size / 2 + i * bandHeight * 2}
            width={width}
            height={bandHeight}
            fill="#0a0a12"
            clipPath="url(#sunClip)"
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
```

**Step 2: Commit**

```bash
git add src/components/ui/HorizonSun.tsx
git commit -m "feat: add HorizonSun component with banded gradient"
```

---

### Task 1.5: Create GeometricHalos Component

**Files:**
- Create: `src/components/ui/GeometricHalos.tsx`

**Step 1: Create the component**

```typescript
import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Polygon } from 'react-native-svg';
import { COLORS } from '../../const/colors';

const { width, height } = Dimensions.get('window');

interface HaloProps {
  size: number;
  x: number;
  y: number;
  rotationDirection: 1 | -1;
  opacity?: number;
}

const Hexagon: React.FC<{ size: number; stroke: string; opacity: number }> = ({
  size,
  stroke,
  opacity,
}) => {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const x = size / 2 + (size / 2 - 2) * Math.cos(angle);
    const y = size / 2 + (size / 2 - 2) * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  return (
    <Svg width={size} height={size}>
      <Polygon
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={1}
        opacity={opacity}
      />
    </Svg>
  );
};

const Halo: React.FC<HaloProps> = ({ size, x, y, rotationDirection, opacity = 0.3 }) => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360 * rotationDirection, {
        duration: 60000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View
      style={[
        styles.halo,
        { left: x - size / 2, top: y - size / 2, width: size, height: size },
        animatedStyle,
      ]}
    >
      <Hexagon size={size} stroke={COLORS.neonPurple} opacity={opacity} />
      <View style={styles.innerHalo}>
        <Hexagon size={size * 0.7} stroke={COLORS.neonPurple} opacity={opacity * 0.7} />
      </View>
      <View style={styles.innermostHalo}>
        <Hexagon size={size * 0.4} stroke={COLORS.neonPurple} opacity={opacity * 0.5} />
      </View>
    </Animated.View>
  );
};

interface GeometricHalosProps {
  variant?: 'menu' | 'centered';
}

export const GeometricHalos: React.FC<GeometricHalosProps> = ({ variant = 'menu' }) => {
  if (variant === 'menu') {
    return (
      <View style={styles.container} pointerEvents="none">
        <Halo size={300} x={width * 0.15} y={height * 0.25} rotationDirection={1} opacity={0.2} />
        <Halo size={280} x={width * 0.85} y={height * 0.28} rotationDirection={-1} opacity={0.2} />
      </View>
    );
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <Halo size={350} x={width / 2} y={height * 0.35} rotationDirection={1} opacity={0.15} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  halo: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerHalo: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innermostHalo: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

**Step 2: Commit**

```bash
git add src/components/ui/GeometricHalos.tsx
git commit -m "feat: add GeometricHalos component with rotating hexagons"
```

---

### Task 1.6: Create SynthwaveBackground Composite Component

**Files:**
- Create: `src/components/ui/SynthwaveBackground.tsx`

**Step 1: Create the composite component**

```typescript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../../const/colors';
import { StarField } from './StarField';
import { PerspectiveGrid } from './PerspectiveGrid';
import { HorizonSun } from './HorizonSun';
import { GeometricHalos } from './GeometricHalos';

interface SynthwaveBackgroundProps {
  showStars?: boolean;
  showGrid?: boolean;
  showSun?: boolean;
  showHalos?: boolean;
  sunPosition?: number;
  gridOpacity?: number;
  halosVariant?: 'menu' | 'centered';
  gridAnimated?: boolean;
}

export const SynthwaveBackground: React.FC<SynthwaveBackgroundProps> = ({
  showStars = true,
  showGrid = true,
  showSun = true,
  showHalos = true,
  sunPosition = 0.4,
  gridOpacity = 0.6,
  halosVariant = 'menu',
  gridAnimated = true,
}) => {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Layer 1: Base background */}
      <View style={styles.baseBackground} />

      {/* Layer 2: Stars */}
      {showStars && <StarField count={50} />}

      {/* Layer 3: Horizon Sun */}
      {showSun && <HorizonSun position={sunPosition} size={200} />}

      {/* Layer 4: Perspective Grid */}
      {showGrid && <PerspectiveGrid opacity={gridOpacity} animated={gridAnimated} />}

      {/* Layer 5: Geometric Halos */}
      {showHalos && <GeometricHalos variant={halosVariant} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  baseBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backgroundDeep,
  },
});
```

**Step 2: Create barrel export**

Create `src/components/ui/index.ts`:

```typescript
export { StarField } from './StarField';
export { PerspectiveGrid } from './PerspectiveGrid';
export { HorizonSun } from './HorizonSun';
export { GeometricHalos } from './GeometricHalos';
export { SynthwaveBackground } from './SynthwaveBackground';
```

**Step 3: Commit**

```bash
git add src/components/ui/SynthwaveBackground.tsx src/components/ui/index.ts
git commit -m "feat: add SynthwaveBackground composite component"
```

---

## Phase 2: UI Components

### Task 2.1: Create ChromeText Component

**Files:**
- Create: `src/components/ui/ChromeText.tsx`

**Step 1: Create the component**

```typescript
import React from 'react';
import { StyleSheet, View, Text, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../../const/colors';

interface ChromeTextProps {
  children: string;
  size?: number;
  color?: 'gold' | 'cyan' | 'magenta';
  glowPulse?: boolean;
  style?: TextStyle;
}

const CHROME_COLORS = {
  gold: {
    base: COLORS.chromeGold,
    glow: 'rgba(255, 215, 0, 0.6)',
  },
  cyan: {
    base: COLORS.neonCyan,
    glow: 'rgba(0, 245, 255, 0.6)',
  },
  magenta: {
    base: COLORS.neonMagenta,
    glow: 'rgba(255, 42, 109, 0.6)',
  },
};

export const ChromeText: React.FC<ChromeTextProps> = ({
  children,
  size = 48,
  color = 'gold',
  glowPulse = true,
  style,
}) => {
  const glowOpacity = useSharedValue(0.4);
  const colors = CHROME_COLORS[color];

  React.useEffect(() => {
    if (glowPulse) {
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true
      );
    }
  }, [glowPulse]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const textStyle: TextStyle = {
    fontSize: size,
    fontWeight: 'bold',
    color: colors.base,
    textShadowColor: colors.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    ...style,
  };

  const glowStyle: TextStyle = {
    ...textStyle,
    position: 'absolute',
    color: colors.glow,
    textShadowRadius: 30,
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={[glowStyle, animatedGlowStyle]}>
        {children}
      </Animated.Text>
      <Text style={textStyle}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

**Step 2: Export from index**

Add to `src/components/ui/index.ts`:

```typescript
export { ChromeText } from './ChromeText';
```

**Step 3: Commit**

```bash
git add src/components/ui/ChromeText.tsx src/components/ui/index.ts
git commit -m "feat: add ChromeText component with glow animation"
```

---

### Task 2.2: Create GlassButton Component

**Files:**
- Create: `src/components/ui/GlassButton.tsx`

**Step 1: Create the component**

```typescript
import React from 'react';
import { StyleSheet, Pressable, Text, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { COLORS } from '../../const/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GlassButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'normal' | 'large';
  style?: ViewStyle;
  disabled?: boolean;
}

const VARIANT_COLORS = {
  primary: COLORS.neonCyan,
  secondary: COLORS.neonPurple,
  danger: COLORS.neonMagenta,
};

export const GlassButton: React.FC<GlassButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'normal',
  style,
  disabled = false,
}) => {
  const scale = useSharedValue(1);
  const glowIntensity = useSharedValue(0);
  const borderColor = VARIANT_COLORS[variant];

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    glowIntensity.value = withTiming(1, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    glowIntensity.value = withTiming(0, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.3 + glowIntensity.value * 0.4,
    shadowRadius: 8 + glowIntensity.value * 8,
  }));

  const isLarge = size === 'large';

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.button,
        isLarge && styles.buttonLarge,
        { borderColor, shadowColor: borderColor },
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      <Text style={[styles.text, isLarge && styles.textLarge]}>{title}</Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 48,
    minWidth: 200,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
  },
  buttonLarge: {
    paddingVertical: 18,
    paddingHorizontal: 64,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  textLarge: {
    fontSize: 20,
  },
  disabled: {
    opacity: 0.5,
  },
});
```

**Step 2: Export from index**

Add to `src/components/ui/index.ts`:

```typescript
export { GlassButton } from './GlassButton';
```

**Step 3: Commit**

```bash
git add src/components/ui/GlassButton.tsx src/components/ui/index.ts
git commit -m "feat: add GlassButton component with glass-morphic style"
```

---

### Task 2.3: Create NeonToggle Component

**Files:**
- Create: `src/components/ui/NeonToggle.tsx`

**Step 1: Create the component**

```typescript
import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS } from '../../const/colors';

interface NeonToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const NeonToggle: React.FC<NeonToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  const translateX = useSharedValue(value ? 24 : 0);
  const glowOpacity = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    translateX.value = withSpring(value ? 24 : 0, {
      damping: 15,
      stiffness: 300,
      overshootClamping: false,
    });
    glowOpacity.value = withSpring(value ? 1 : 0);
  }, [value]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    backgroundColor: value ? COLORS.neonCyan : COLORS.textMuted,
    shadowOpacity: glowOpacity.value * 0.8,
  }));

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: value ? 'rgba(0, 245, 255, 0.2)' : 'rgba(136, 136, 136, 0.2)',
  }));

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      style={[styles.container, disabled && styles.disabled]}
    >
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View
          style={[
            styles.thumb,
            { shadowColor: COLORS.neonCyan },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  track: {
    width: 52,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});
```

**Step 2: Export from index**

Add to `src/components/ui/index.ts`:

```typescript
export { NeonToggle } from './NeonToggle';
```

**Step 3: Commit**

```bash
git add src/components/ui/NeonToggle.tsx src/components/ui/index.ts
git commit -m "feat: add NeonToggle component with spring animation"
```

---

### Task 2.4: Create HexFrame Component

**Files:**
- Create: `src/components/ui/HexFrame.tsx`

**Step 1: Create the component**

```typescript
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { COLORS } from '../../const/colors';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

interface HexFrameProps {
  children: React.ReactNode;
  width: number;
  height: number;
  color?: 'cyan' | 'magenta' | 'purple';
  glowPulse?: boolean;
  style?: ViewStyle;
}

const FRAME_COLORS = {
  cyan: COLORS.neonCyan,
  magenta: COLORS.neonMagenta,
  purple: COLORS.neonPurple,
};

export const HexFrame: React.FC<HexFrameProps> = ({
  children,
  width,
  height,
  color = 'purple',
  glowPulse = false,
  style,
}) => {
  const strokeColor = FRAME_COLORS[color];
  const glowOpacity = useSharedValue(0.6);

  React.useEffect(() => {
    if (glowPulse) {
      glowOpacity.value = withRepeat(
        withTiming(1, { duration: 1500 }),
        -1,
        true
      );
    }
  }, [glowPulse]);

  // Create hexagonal-ish frame points
  const cornerSize = 16;
  const points = `
    ${cornerSize},0
    ${width - cornerSize},0
    ${width},${cornerSize}
    ${width},${height - cornerSize}
    ${width - cornerSize},${height}
    ${cornerSize},${height}
    0,${height - cornerSize}
    0,${cornerSize}
  `;

  const animatedProps = useAnimatedProps(() => ({
    strokeOpacity: glowOpacity.value,
  }));

  return (
    <View style={[styles.container, { width, height }, style]}>
      <View style={styles.background}>
        {children}
      </View>
      <Svg
        width={width}
        height={height}
        style={styles.frame}
        pointerEvents="none"
      >
        <AnimatedPolygon
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          animatedProps={animatedProps}
        />
        {/* Inner glow line */}
        <Polygon
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth={1}
          opacity={0.3}
          transform={`translate(2, 2) scale(${(width - 4) / width}, ${(height - 4) / height})`}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.backgroundPanel,
    margin: 1,
  },
  frame: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
```

**Step 2: Export from index**

Add to `src/components/ui/index.ts`:

```typescript
export { HexFrame } from './HexFrame';
```

**Step 3: Commit**

```bash
git add src/components/ui/HexFrame.tsx src/components/ui/index.ts
git commit -m "feat: add HexFrame component for modal borders"
```

---

## Phase 3: Main Menu Screen

### Task 3.1: Update MainMenu with Synthwave Background

**Files:**
- Modify: `src/screen/MainMenu.tsx`

**Step 1: Replace MenuBackground and update styling**

```typescript
import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../const/colors';
import { audioManager } from '../audio/audioManager';
import { useSettingsStore } from '../state/settingsStore';
import { SynthwaveBackground, ChromeText, GlassButton } from '../components/ui';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
  HighScores: undefined;
  Instructions: { fromFirstPlay?: boolean };
  Shop: undefined;
};

interface MainMenuProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainMenu'>;
}

export const MainMenuScreen: React.FC<MainMenuProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { musicEnabled, hasSeenTutorial, setHasSeenTutorial } = useSettingsStore();

  useEffect(() => {
    const initAudio = async () => {
      await audioManager.load();
      if (musicEnabled) {
        audioManager.playMusic();
      }
    };
    initAudio();
  }, []);

  useEffect(() => {
    audioManager.setMusicEnabled(musicEnabled);
    if (musicEnabled) {
      audioManager.playMusic();
    }
  }, [musicEnabled]);

  const handlePlay = useCallback(() => {
    if (!hasSeenTutorial) {
      setHasSeenTutorial(true);
      navigation.navigate('Instructions', { fromFirstPlay: true });
    } else {
      navigation.navigate('Play');
    }
  }, [hasSeenTutorial, setHasSeenTutorial, navigation]);

  return (
    <View style={styles.container}>
      <SynthwaveBackground
        showStars
        showGrid
        showSun
        showHalos
        sunPosition={0.4}
        halosVariant="menu"
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <ChromeText size={72} color="cyan" glowPulse>
              {t('appTitle')}
            </ChromeText>
          </View>

          <View style={styles.buttonContainer}>
            <GlassButton
              title={t('common.play')}
              onPress={handlePlay}
              variant="primary"
              size="large"
            />
            <GlassButton
              title={t('mainMenu.shop', 'Shop')}
              onPress={() => navigation.navigate('Shop')}
              variant="secondary"
            />
            <GlassButton
              title={t('mainMenu.highScores')}
              onPress={() => navigation.navigate('HighScores')}
              variant="secondary"
            />
            <GlassButton
              title={t('mainMenu.howToPlay')}
              onPress={() => navigation.navigate('Instructions', { fromFirstPlay: false })}
              variant="secondary"
            />
            <GlassButton
              title={t('mainMenu.settings')}
              onPress={() => navigation.navigate('Settings')}
              variant="secondary"
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDeep,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    marginBottom: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    gap: 16,
    alignItems: 'center',
  },
});
```

**Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/screen/MainMenu.tsx
git commit -m "feat: update MainMenu with synthwave design"
```

---

## Phase 4: Settings Screen

### Task 4.1: Update Settings with Synthwave Styling

**Files:**
- Modify: `src/screen/Settings.tsx`

**Step 1: Read current file first, then update with new styling**

Update to use `SynthwaveBackground`, `ChromeText`, `GlassButton`, and `NeonToggle` components. Apply glass-morphic section styling and proper spacing.

**Step 2: Commit**

```bash
git add src/screen/Settings.tsx
git commit -m "feat: update Settings with synthwave design"
```

---

## Phase 5: High Scores Screen

### Task 5.1: Update HighScores with Trophy Styling

**Files:**
- Modify: `src/screen/HighScores.tsx`

**Step 1: Read current file first, then update with gold/silver/bronze row styling and synthwave components**

**Step 2: Commit**

```bash
git add src/screen/HighScores.tsx
git commit -m "feat: update HighScores with trophy styling"
```

---

## Phase 6: Instructions Screen

### Task 6.1: Update Instructions with Synthwave Styling

**Files:**
- Modify: `src/screen/Instructions.tsx`

**Step 1: Read current file first, then update with section headers and visual examples**

**Step 2: Commit**

```bash
git add src/screen/Instructions.tsx
git commit -m "feat: update Instructions with synthwave design"
```

---

## Phase 7: Shop Screen

### Task 7.1: Update Shop with Glass-morphic Cards

**Files:**
- Modify: `src/screen/Shop.tsx`

**Step 1: Read current file first, then update with:**
- SynthwaveBackground with lower sun
- Glass-morphic item cards with neon borders
- Animated preview area
- Proper category tabs styling

**Step 2: Commit**

```bash
git add src/screen/Shop.tsx
git commit -m "feat: update Shop with synthwave design"
```

---

## Phase 8: Game Over & Continue Modals

### Task 8.1: Update ContinueModal with HexFrame

**Files:**
- Modify: `src/components/ContinueModal.tsx`

**Step 1: Read current file first, then update with:**
- HexFrame wrapper with cyan border
- ChromeText for title
- Countdown ring animation
- GlassButton for actions

**Step 2: Commit**

```bash
git add src/components/ContinueModal.tsx
git commit -m "feat: update ContinueModal with synthwave design"
```

---

### Task 8.2: Create GameOverModal Component

**Files:**
- Create: `src/components/GameOverModal.tsx`

**Step 1: Create modal with:**
- HexFrame wrapper with magenta border (danger)
- ChromeText score display
- "NEW BEST!" animation when applicable
- Shards earned display
- GlassButton for actions

**Step 2: Integrate into Play screen**

**Step 3: Commit**

```bash
git add src/components/GameOverModal.tsx src/screen/Play.tsx
git commit -m "feat: add GameOverModal with synthwave design"
```

---

## Phase 9: Play Screen UI

### Task 9.1: Update Play Screen UI Overlay

**Files:**
- Modify: `src/screen/Play.tsx`

**Step 1: Read current file first, then update:**
- Score display with chrome styling
- Effect badges (shield, multiplier) as neon pills
- "TOUCH TO START" with pulse animation
- Simplified background during gameplay

**Step 2: Commit**

```bash
git add src/screen/Play.tsx
git commit -m "feat: update Play screen UI with synthwave styling"
```

---

## Phase 10: Final Polish

### Task 10.1: Add Screen Transition Animations

**Files:**
- Modify: `App.tsx` (or navigation config)

**Step 1: Configure react-navigation with custom transitions**

**Step 2: Commit**

```bash
git add App.tsx
git commit -m "feat: add synthwave screen transitions"
```

---

### Task 10.2: Update GameBackground for Gameplay

**Files:**
- Modify: `src/entity/GameBackground.tsx`

**Step 1: Read current file first, then simplify for gameplay (dimmed grid, no sun)**

**Step 2: Commit**

```bash
git add src/entity/GameBackground.tsx
git commit -m "feat: simplify GameBackground for gameplay clarity"
```

---

### Task 10.3: Delete Old MenuBackground

**Files:**
- Delete: `src/entity/MenuBackground.tsx`

**Step 1: Remove old component and update any remaining imports**

**Step 2: Commit**

```bash
git rm src/entity/MenuBackground.tsx
git commit -m "chore: remove old MenuBackground component"
```

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | 1.1-1.6 | Foundation (colors, background layers) |
| 2 | 2.1-2.4 | UI Components (ChromeText, GlassButton, etc.) |
| 3 | 3.1 | Main Menu |
| 4 | 4.1 | Settings |
| 5 | 5.1 | High Scores |
| 6 | 6.1 | Instructions |
| 7 | 7.1 | Shop |
| 8 | 8.1-8.2 | Game Over & Continue Modals |
| 9 | 9.1 | Play Screen UI |
| 10 | 10.1-10.3 | Final Polish |

**Total: 16 tasks**
