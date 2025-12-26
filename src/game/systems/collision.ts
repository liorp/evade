import { GAME } from '../../constants/game';
import { Position, Enemy } from '../types';

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
