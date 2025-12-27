import { GAME } from '../constants';
import { Position, Handedness, SpawnZone, Enemy, SpeedTier, Booster, BoosterType } from '../types';

interface SpawnPoint {
  position: Position;
  type: 'corner' | 'edge';
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function isInExclusionZone(
  x: number,
  y: number,
  screenWidth: number,
  screenHeight: number,
  handedness: Handedness
): boolean {
  const exclusionX = screenWidth * GAME.EXCLUSION_ZONE_PERCENT;
  const exclusionY = screenHeight * GAME.EXCLUSION_ZONE_PERCENT;

  if (handedness === 'right') {
    // Exclude bottom-right area
    const isBottomRight =
      x > screenWidth - exclusionX && y > screenHeight - exclusionY;
    const isRightBottomEdge =
      x >= screenWidth - 1 && y > screenHeight - screenHeight * GAME.EXCLUSION_ZONE_PERCENT;
    const isBottomRightEdge =
      y >= screenHeight - 1 && x > screenWidth - screenWidth * GAME.EXCLUSION_ZONE_PERCENT;
    return isBottomRight || isRightBottomEdge || isBottomRightEdge;
  } else {
    // Exclude bottom-left area
    const isBottomLeft = x < exclusionX && y > screenHeight - exclusionY;
    const isLeftBottomEdge =
      x <= 1 && y > screenHeight - screenHeight * GAME.EXCLUSION_ZONE_PERCENT;
    const isBottomLeftEdge =
      y >= screenHeight - 1 && x < screenWidth * GAME.EXCLUSION_ZONE_PERCENT;
    return isBottomLeft || isLeftBottomEdge || isBottomLeftEdge;
  }
}

function getCornerSpawnPoints(
  screenWidth: number,
  screenHeight: number,
  handedness: Handedness
): SpawnPoint[] {
  const corners: SpawnPoint[] = [
    { position: { x: 0, y: 0 }, type: 'corner' }, // TL
    { position: { x: screenWidth, y: 0 }, type: 'corner' }, // TR
    { position: { x: 0, y: screenHeight }, type: 'corner' }, // BL
    { position: { x: screenWidth, y: screenHeight }, type: 'corner' }, // BR
  ];

  return corners.filter(
    (c) => !isInExclusionZone(c.position.x, c.position.y, screenWidth, screenHeight, handedness)
  );
}

function getEdgeSpawnPoints(
  screenWidth: number,
  screenHeight: number,
  handedness: Handedness
): SpawnPoint[] {
  const edges: SpawnPoint[] = [
    // Top edge midpoint
    { position: { x: screenWidth / 2, y: 0 }, type: 'edge' },
    // Bottom edge midpoint
    { position: { x: screenWidth / 2, y: screenHeight }, type: 'edge' },
    // Left edge midpoint
    { position: { x: 0, y: screenHeight / 2 }, type: 'edge' },
    // Right edge midpoint
    { position: { x: screenWidth, y: screenHeight / 2 }, type: 'edge' },
  ];

  return edges.filter(
    (e) => !isInExclusionZone(e.position.x, e.position.y, screenWidth, screenHeight, handedness)
  );
}

function getRandomEdgePoint(
  screenWidth: number,
  screenHeight: number,
  handedness: Handedness
): Position {
  const maxAttempts = 20;
  for (let i = 0; i < maxAttempts; i++) {
    const edge = Math.floor(Math.random() * 4);
    let x: number, y: number;

    switch (edge) {
      case 0: // Top
        x = Math.random() * screenWidth;
        y = 0;
        break;
      case 1: // Bottom
        x = Math.random() * screenWidth;
        y = screenHeight;
        break;
      case 2: // Left
        x = 0;
        y = Math.random() * screenHeight;
        break;
      case 3: // Right
      default:
        x = screenWidth;
        y = Math.random() * screenHeight;
        break;
    }

    if (!isInExclusionZone(x, y, screenWidth, screenHeight, handedness)) {
      return { x, y };
    }
  }

  // Fallback to top-left if all attempts fail
  return { x: 0, y: 0 };
}

export function getSpawnPosition(
  spawnZone: SpawnZone,
  screenWidth: number,
  screenHeight: number,
  handedness: Handedness
): Position {
  if (spawnZone === 'corner') {
    const corners = getCornerSpawnPoints(screenWidth, screenHeight, handedness);
    const selected = corners[Math.floor(Math.random() * corners.length)];
    return selected.position;
  } else if (spawnZone === 'edge') {
    const corners = getCornerSpawnPoints(screenWidth, screenHeight, handedness);
    const edges = getEdgeSpawnPoints(screenWidth, screenHeight, handedness);
    const all = [...corners, ...edges];
    const selected = all[Math.floor(Math.random() * all.length)];
    return selected.position;
  } else {
    return getRandomEdgePoint(screenWidth, screenHeight, handedness);
  }
}

function getSpeedTier(playTime: number): { tier: SpeedTier; speed: number } {
  // Gradual introduction of enemy types:
  // 0-20s: Only slow (circles)
  // 20-45s: Slow + Medium (circles + diamonds)
  // 45s+: All types with progressive distribution toward faster

  const MEDIUM_UNLOCK_TIME = 20000; // 20 seconds
  const FAST_UNLOCK_TIME = 45000;   // 45 seconds

  // Only slow enemies initially
  if (playTime < MEDIUM_UNLOCK_TIME) {
    return { tier: 'slow', speed: GAME.SPEED_SLOW };
  }

  // Slow + Medium enemies
  if (playTime < FAST_UNLOCK_TIME) {
    // Progressively more medium as time passes
    const mediumFactor = (playTime - MEDIUM_UNLOCK_TIME) / (FAST_UNLOCK_TIME - MEDIUM_UNLOCK_TIME);
    const mediumChance = 0.2 + mediumFactor * 0.3; // 20% -> 50%

    if (Math.random() < mediumChance) {
      return { tier: 'medium', speed: GAME.SPEED_MEDIUM };
    }
    return { tier: 'slow', speed: GAME.SPEED_SLOW };
  }

  // All enemy types available - progressive distribution toward faster
  // At 45s: 50% slow, 35% medium, 15% fast
  // At 120s+: 20% slow, 40% medium, 40% fast
  const progressFactor = Math.min((playTime - FAST_UNLOCK_TIME) / 75000, 1); // 0 to 1 over 75s after unlock

  const slowChance = 0.5 - progressFactor * 0.3;    // 50% -> 20%
  const mediumChance = 0.35 + progressFactor * 0.05; // 35% -> 40%
  // fast is the remainder: 15% -> 40%

  const roll = Math.random();

  if (roll < slowChance) {
    return { tier: 'slow', speed: GAME.SPEED_SLOW };
  } else if (roll < slowChance + mediumChance) {
    return { tier: 'medium', speed: GAME.SPEED_MEDIUM };
  } else {
    return { tier: 'fast', speed: GAME.SPEED_FAST };
  }
}

export function createEnemy(position: Position, currentTime: number, playTime: number): Enemy {
  const { tier, speed } = getSpeedTier(playTime);
  return {
    id: generateId(),
    position,
    jitterAngle: 0,
    lastJitterUpdate: currentTime,
    spawnTime: currentTime,
    speedTier: tier,
    speed,
  };
}

export function shouldSpawn(
  lastSpawnTime: number,
  currentTime: number,
  spawnInterval: number,
  currentEnemies: number,
  maxEnemies: number
): boolean {
  if (currentEnemies >= maxEnemies) return false;
  return currentTime - lastSpawnTime >= spawnInterval;
}

// Booster spawning
function getRandomBoosterType(): BoosterType {
  const types: BoosterType[] = ['plus', 'shield', 'multiplier'];
  return types[Math.floor(Math.random() * types.length)];
}

export function getBoosterSpawnPosition(
  screenWidth: number,
  screenHeight: number,
  playerPosition: Position
): Position {
  // Spawn boosters in a random position, but not too close to edges or player
  const margin = 80;
  const minDistFromPlayer = 150;

  let x: number, y: number;
  let attempts = 0;

  do {
    x = margin + Math.random() * (screenWidth - margin * 2);
    y = margin + Math.random() * (screenHeight - margin * 2);
    attempts++;
  } while (
    attempts < 20 &&
    Math.hypot(x - playerPosition.x, y - playerPosition.y) < minDistFromPlayer
  );

  return { x, y };
}

export function createBooster(position: Position, currentTime: number): Booster {
  return {
    id: generateId(),
    position,
    type: getRandomBoosterType(),
    spawnTime: currentTime,
  };
}

export function shouldSpawnBooster(
  lastBoosterSpawnTime: number,
  currentTime: number,
  currentBoosters: number
): boolean {
  // Only one booster at a time
  if (currentBoosters >= 1) return false;
  return currentTime - lastBoosterSpawnTime >= GAME.BOOSTER_SPAWN_INTERVAL;
}

export function isBoosterExpired(booster: Booster, currentTime: number): boolean {
  return currentTime - booster.spawnTime > GAME.BOOSTER_LIFETIME;
}
