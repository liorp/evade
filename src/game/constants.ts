export const GAME = {
  PLAYER_RADIUS: 36,
  ENEMY_RADIUS: 22,

  // Score
  POINTS_PER_ENEMY: 10, // base points per enemy despawned

  // Speed scoring multipliers based on enemy count
  SPEED_SCORE_THRESHOLD_MEDIUM: 4, // 4+ enemies = 1.5x
  SPEED_SCORE_THRESHOLD_HIGH: 7, // 7+ enemies = 2.0x
  SPEED_SCORE_MULTIPLIER_MEDIUM: 1.5,
  SPEED_SCORE_MULTIPLIER_HIGH: 2.0,

  // Difficulty scaling (ms for intervals, px/s for speed)
  INITIAL_SPAWN_INTERVAL: 2000,
  MIN_SPAWN_INTERVAL: 300,
  SPAWN_SCALE_DURATION: 45000, // 45 seconds

  // Enemy speed tiers (px/s)
  SPEED_SLOW: 80,
  SPEED_MEDIUM: 140,
  SPEED_FAST: 220,

  // Legacy - used for difficulty scaling baseline
  INITIAL_ENEMY_SPEED: 100,
  MAX_ENEMY_SPEED: 300,
  SPEED_SCALE_DURATION: 60000, // 60 seconds

  // Max concurrent enemies
  INITIAL_MAX_ENEMIES: 4,
  FINAL_MAX_ENEMIES: 12,
  MAX_ENEMIES_SCALE_DURATION: 60000, // 60 seconds

  INITIAL_JITTER: 10, // degrees
  MAX_JITTER: 25,
  JITTER_SCALE_DURATION: 45000, // 45 seconds
  JITTER_UPDATE_INTERVAL: 200, // ms

  // Spawn zone progression
  CORNERS_ONLY_UNTIL: 10000, // 10s
  EDGES_UNTIL: 25000, // 25s

  // Cleanup
  OFFSCREEN_BUFFER: 100, // px beyond screen to remove enemies
  ENEMY_MAX_LIFETIME: 4000, // ms - enemies despawn after this time

  // Handedness exclusion zone
  EXCLUSION_ZONE_PERCENT: 0.4, // 40% of edge

  // Boosters
  BOOSTER_RADIUS: 28,
  BOOSTER_SPAWN_INTERVAL: 8000, // ms - spawn a booster every 8 seconds
  BOOSTER_LIFETIME: 5000, // ms - boosters disappear after 5 seconds
  BOOSTER_PLUS_POINTS: 10, // bonus points for collecting plus booster
  BOOSTER_SHIELD_DURATION: 3000, // ms - shield lasts 3 seconds
  BOOSTER_MULTIPLIER_DURATION: 5000, // ms - multiplier lasts 5 seconds
  BOOSTER_MULTIPLIER_VALUE: 3, // 3x points

  // Debuffs
  DEBUFF_RADIUS: 28,
  DEBUFF_SPAWN_INTERVAL: 12000,
  DEBUFF_LIFETIME: 5000,
  DEBUFF_UNLOCK_TIME: 30000,
  DEBUFF_ENLARGE_DURATION: 3000,
  DEBUFF_ENLARGE_SCALE: 1.2,
} as const;
