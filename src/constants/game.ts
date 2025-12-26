export const GAME = {
  PLAYER_RADIUS: 20,
  ENEMY_RADIUS: 15,

  // Difficulty scaling (ms for intervals, px/s for speed)
  INITIAL_SPAWN_INTERVAL: 2000,
  MIN_SPAWN_INTERVAL: 300,
  SPAWN_SCALE_DURATION: 120000, // 2 minutes

  INITIAL_ENEMY_SPEED: 100,
  MAX_ENEMY_SPEED: 300,
  SPEED_SCALE_DURATION: 180000, // 3 minutes

  INITIAL_MAX_ENEMIES: 5,
  FINAL_MAX_ENEMIES: 30,
  MAX_ENEMIES_SCALE_DURATION: 150000, // 2.5 minutes

  INITIAL_JITTER: 10, // degrees
  MAX_JITTER: 25,
  JITTER_SCALE_DURATION: 120000,
  JITTER_UPDATE_INTERVAL: 200, // ms

  // Spawn zone progression
  CORNERS_ONLY_UNTIL: 30000, // 30s
  EDGES_UNTIL: 60000, // 60s

  // Cleanup
  OFFSCREEN_BUFFER: 100, // px beyond screen to remove enemies

  // Handedness exclusion zone
  EXCLUSION_ZONE_PERCENT: 0.4, // 40% of edge
} as const;
