import { GAME } from '../../const/game';
import { Enemy, Position } from '../types';

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

export function updateEnemyJitter(
  enemy: Enemy,
  currentTime: number,
  jitterIntensity: number
): Enemy {
  if (currentTime - enemy.lastJitterUpdate >= GAME.JITTER_UPDATE_INTERVAL) {
    const jitterRange = degreesToRadians(jitterIntensity);
    const newJitter = (Math.random() - 0.5) * 2 * jitterRange;
    return {
      ...enemy,
      jitterAngle: newJitter,
      lastJitterUpdate: currentTime,
    };
  }
  return enemy;
}

export function moveEnemy(
  enemy: Enemy,
  playerPosition: Position,
  deltaTime: number,
  speed: number
): Enemy {
  const dx = playerPosition.x - enemy.position.x;
  const dy = playerPosition.y - enemy.position.y;
  const baseAngle = Math.atan2(dy, dx);
  const finalAngle = normalizeAngle(baseAngle + enemy.jitterAngle);

  const distance = speed * (deltaTime / 1000);
  const newX = enemy.position.x + Math.cos(finalAngle) * distance;
  const newY = enemy.position.y + Math.sin(finalAngle) * distance;

  return {
    ...enemy,
    position: { x: newX, y: newY },
  };
}

export function isOffscreen(
  enemy: Enemy,
  screenWidth: number,
  screenHeight: number
): boolean {
  const buffer = GAME.OFFSCREEN_BUFFER;
  return (
    enemy.position.x < -buffer ||
    enemy.position.x > screenWidth + buffer ||
    enemy.position.y < -buffer ||
    enemy.position.y > screenHeight + buffer
  );
}

export function isExpired(enemy: Enemy, currentTime: number): boolean {
  return currentTime - enemy.spawnTime > GAME.ENEMY_MAX_LIFETIME;
}

export interface UpdateEnemiesResult {
  enemies: Enemy[];
  removedCount: number;
}

export function updateEnemies(
  enemies: Enemy[],
  playerPosition: Position,
  deltaTime: number,
  currentTime: number,
  jitterIntensity: number,
  screenWidth: number,
  screenHeight: number
): UpdateEnemiesResult {
  const moved = enemies.map((enemy) => {
    const withJitter = updateEnemyJitter(enemy, currentTime, jitterIntensity);
    // Use individual enemy speed instead of global speed
    return moveEnemy(withJitter, playerPosition, deltaTime, enemy.speed);
  });

  const remaining = moved.filter(
    (enemy) =>
      !isOffscreen(enemy, screenWidth, screenHeight) && !isExpired(enemy, currentTime)
  );

  return {
    enemies: remaining,
    removedCount: moved.length - remaining.length,
  };
}
