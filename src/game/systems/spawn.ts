import { GAME } from '../../constants/game';
import { Position, Handedness, SpawnZone, Enemy } from '../types';

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

export function createEnemy(position: Position, currentTime: number): Enemy {
  return {
    id: generateId(),
    position,
    jitterAngle: 0,
    lastJitterUpdate: currentTime,
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
