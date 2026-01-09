import { GAME } from '../constants';
import type { Booster, Debuff, Enemy, Position } from '../types';

function distance(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function checkCollision(
  playerPosition: Position,
  enemies: Enemy[],
  playerRadius: number = GAME.PLAYER_RADIUS,
): Enemy | null {
  const collisionDistance = playerRadius + GAME.ENEMY_RADIUS;

  for (const enemy of enemies) {
    if (distance(playerPosition, enemy.position) < collisionDistance) {
      return enemy;
    }
  }

  return null;
}

export function checkBoosterCollision(
  playerPosition: Position,
  boosters: Booster[],
): Booster | null {
  const collisionDistance = GAME.PLAYER_RADIUS + GAME.BOOSTER_RADIUS;

  for (const booster of boosters) {
    if (distance(playerPosition, booster.position) < collisionDistance) {
      return booster;
    }
  }

  return null;
}

export function checkDebuffCollision(
  playerPosition: Position,
  debuffs: Debuff[],
  playerRadius: number = GAME.PLAYER_RADIUS,
): Debuff | null {
  const collisionDistance = playerRadius + GAME.DEBUFF_RADIUS;

  for (const debuff of debuffs) {
    if (distance(playerPosition, debuff.position) < collisionDistance) {
      return debuff;
    }
  }

  return null;
}
