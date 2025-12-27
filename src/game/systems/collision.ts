import { GAME } from '../constants';
import type { Booster, Enemy, Position } from '../types';

function distance(a: Position, b: Position): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function checkCollision(playerPosition: Position, enemies: Enemy[]): boolean {
  const collisionDistance = GAME.PLAYER_RADIUS + GAME.ENEMY_RADIUS;

  for (const enemy of enemies) {
    if (distance(playerPosition, enemy.position) < collisionDistance) {
      return true;
    }
  }

  return false;
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

export interface CloseDodgeResult {
  count: number;
  enemies: Enemy[]; // Return mutated enemies with dodgeCounted updated
}

export function checkCloseDodges(playerPosition: Position, enemies: Enemy[]): CloseDodgeResult {
  const collisionDistance = GAME.PLAYER_RADIUS + GAME.ENEMY_RADIUS;
  const dodgeDistance = collisionDistance + GAME.CLOSE_DODGE_THRESHOLD;
  let count = 0;

  for (const enemy of enemies) {
    const dist = distance(playerPosition, enemy.position);

    // In close dodge zone but not colliding
    if (dist > collisionDistance && dist < dodgeDistance && !enemy.dodgeCounted) {
      enemy.dodgeCounted = true;
      count++;
    }
  }

  return { count, enemies };
}
