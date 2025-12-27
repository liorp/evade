import { GAME } from '../../const/game';
import { DifficultyParams, SpawnZone } from '../types';

function lerp(start: number, end: number, elapsed: number, duration: number): number {
  const t = Math.min(elapsed / duration, 1);
  return start + (end - start) * t;
}

export function getDifficultyParams(elapsedTime: number): DifficultyParams {
  return {
    spawnInterval: lerp(
      GAME.INITIAL_SPAWN_INTERVAL,
      GAME.MIN_SPAWN_INTERVAL,
      elapsedTime,
      GAME.SPAWN_SCALE_DURATION
    ),
    enemySpeed: lerp(
      GAME.INITIAL_ENEMY_SPEED,
      GAME.MAX_ENEMY_SPEED,
      elapsedTime,
      GAME.SPEED_SCALE_DURATION
    ),
    maxEnemies: Math.floor(
      lerp(
        GAME.INITIAL_MAX_ENEMIES,
        GAME.FINAL_MAX_ENEMIES,
        elapsedTime,
        GAME.MAX_ENEMIES_SCALE_DURATION
      )
    ),
    jitterIntensity: lerp(
      GAME.INITIAL_JITTER,
      GAME.MAX_JITTER,
      elapsedTime,
      GAME.JITTER_SCALE_DURATION
    ),
  };
}

export function getSpawnZone(elapsedTime: number): SpawnZone {
  if (elapsedTime < GAME.CORNERS_ONLY_UNTIL) {
    return 'corner';
  } else if (elapsedTime < GAME.EDGES_UNTIL) {
    return 'edge';
  }
  return 'any';
}
