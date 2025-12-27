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
} as const;

// Gradient definitions
export const GRADIENTS = {
  sunBands: ['#ff2a6d', '#ffd700', '#ff6b35'],
  chrome: ['#ffd700', '#ffffff', '#ffd700'],
  neonPurple: ['#9d4edd', '#6b21a8'],
} as const;
