// Player shape types
export type PlayerShape = 'circle' | 'square' | 'triangle' | 'hexagon' | 'star';

// Player colors (hex values)
export type PlayerColorId =
  | 'green'
  | 'cyan'
  | 'pink'
  | 'orange'
  | 'purple'
  | 'gold'
  | 'ice'
  | 'lime'
  | 'coral'
  | 'violet';

// Player trail types
export type PlayerTrail = 'none' | 'particle' | 'ghost' | 'rainbow' | 'fire';

// Player glow types
export type PlayerGlow = 'none' | 'pulse' | 'constant' | 'rgb';

// Enemy theme types
export type EnemyTheme = 'classic' | 'neon' | 'retro' | 'minimal' | 'spooky';

// Background theme types
export type BackgroundTheme = 'dark' | 'void' | 'synthwave' | 'ocean' | 'sunset';

// Cosmetic categories
export type CosmeticCategory =
  | 'playerColor'
  | 'playerShape'
  | 'playerTrail'
  | 'playerGlow'
  | 'enemyTheme'
  | 'backgroundTheme';

// Cosmetic item interface
export interface CosmeticItem {
  id: string;
  category: CosmeticCategory;
  name: string;
  price: number; // in shards, 0 = free/default
  preview?: string; // hex color for color items
}

// Player color definitions
export const PLAYER_COLORS: Record<
  PlayerColorId,
  { name: string; hex: string; glowHex: string; price: number }
> = {
  green: { name: 'Emerald', hex: '#00ffaa', glowHex: 'rgba(0, 255, 170, 0.4)', price: 0 },
  cyan: { name: 'Cyan', hex: '#00ffff', glowHex: 'rgba(0, 255, 255, 0.4)', price: 100 },
  pink: { name: 'Hot Pink', hex: '#ff44aa', glowHex: 'rgba(255, 68, 170, 0.4)', price: 100 },
  orange: { name: 'Blaze', hex: '#ff8800', glowHex: 'rgba(255, 136, 0, 0.4)', price: 150 },
  purple: { name: 'Violet', hex: '#aa44ff', glowHex: 'rgba(170, 68, 255, 0.4)', price: 150 },
  gold: { name: 'Gold', hex: '#ffd700', glowHex: 'rgba(255, 215, 0, 0.4)', price: 200 },
  ice: { name: 'Ice Blue', hex: '#88ddff', glowHex: 'rgba(136, 221, 255, 0.4)', price: 200 },
  lime: { name: 'Lime', hex: '#aaff00', glowHex: 'rgba(170, 255, 0, 0.4)', price: 150 },
  coral: { name: 'Coral', hex: '#ff6b6b', glowHex: 'rgba(255, 107, 107, 0.4)', price: 150 },
  violet: { name: 'Deep Violet', hex: '#7b68ee', glowHex: 'rgba(123, 104, 238, 0.4)', price: 200 },
};

// Player shape definitions
export const PLAYER_SHAPES: Record<PlayerShape, { name: string; price: number }> = {
  circle: { name: 'Circle', price: 0 },
  square: { name: 'Square', price: 150 },
  triangle: { name: 'Triangle', price: 200 },
  hexagon: { name: 'Hexagon', price: 250 },
  star: { name: 'Star', price: 300 },
};

// Player trail definitions
export const PLAYER_TRAILS: Record<PlayerTrail, { name: string; price: number }> = {
  none: { name: 'None', price: 0 },
  particle: { name: 'Particle', price: 300 },
  ghost: { name: 'Ghost', price: 400 },
  rainbow: { name: 'Rainbow', price: 500 },
  fire: { name: 'Fire', price: 600 },
};

// Player glow definitions
export const PLAYER_GLOWS: Record<PlayerGlow, { name: string; price: number }> = {
  none: { name: 'None', price: 0 },
  pulse: { name: 'Pulse', price: 200 },
  constant: { name: 'Constant', price: 300 },
  rgb: { name: 'RGB Cycle', price: 500 },
};

// Enemy theme definitions
export const ENEMY_THEMES: Record<
  EnemyTheme,
  { name: string; price: number; colors: { base: string; glow: string } }
> = {
  classic: {
    name: 'Classic',
    price: 0,
    colors: { base: '#ff4444', glow: 'rgba(255, 68, 68, 0.3)' },
  },
  neon: { name: 'Neon', price: 500, colors: { base: '#00ff88', glow: 'rgba(0, 255, 136, 0.5)' } },
  retro: { name: 'Retro', price: 600, colors: { base: '#ffcc00', glow: 'rgba(255, 204, 0, 0.3)' } },
  minimal: {
    name: 'Minimal',
    price: 500,
    colors: { base: '#ffffff', glow: 'rgba(255, 255, 255, 0.2)' },
  },
  spooky: {
    name: 'Spooky',
    price: 700,
    colors: { base: '#aa44ff', glow: 'rgba(170, 68, 255, 0.4)' },
  },
};

// Background theme definitions
export const BACKGROUND_THEMES: Record<
  BackgroundTheme,
  { name: string; price: number; colors: { bg: string; accent: string } }
> = {
  dark: { name: 'Dark', price: 0, colors: { bg: '#0a0a0f', accent: '#1a1a2e' } },
  void: { name: 'Void', price: 600, colors: { bg: '#000000', accent: '#0a0a0a' } },
  synthwave: { name: 'Synthwave', price: 800, colors: { bg: '#1a0a2e', accent: '#2a1a4e' } },
  ocean: { name: 'Ocean', price: 700, colors: { bg: '#0a1a2e', accent: '#1a2a4e' } },
  sunset: { name: 'Sunset', price: 800, colors: { bg: '#2e1a0a', accent: '#4e2a1a' } },
};

// Helper to get all items in a category as CosmeticItem[]
export function getCosmeticItems(category: CosmeticCategory): CosmeticItem[] {
  switch (category) {
    case 'playerColor':
      return Object.entries(PLAYER_COLORS).map(([id, data]) => ({
        id,
        category,
        name: data.name,
        price: data.price,
        preview: data.hex,
      }));
    case 'playerShape':
      return Object.entries(PLAYER_SHAPES).map(([id, data]) => ({
        id,
        category,
        name: data.name,
        price: data.price,
      }));
    case 'playerTrail':
      return Object.entries(PLAYER_TRAILS).map(([id, data]) => ({
        id,
        category,
        name: data.name,
        price: data.price,
      }));
    case 'playerGlow':
      return Object.entries(PLAYER_GLOWS).map(([id, data]) => ({
        id,
        category,
        name: data.name,
        price: data.price,
      }));
    case 'enemyTheme':
      return Object.entries(ENEMY_THEMES).map(([id, data]) => ({
        id,
        category,
        name: data.name,
        price: data.price,
        preview: data.colors.base,
      }));
    case 'backgroundTheme':
      return Object.entries(BACKGROUND_THEMES).map(([id, data]) => ({
        id,
        category,
        name: data.name,
        price: data.price,
        preview: data.colors.bg,
      }));
  }
}
