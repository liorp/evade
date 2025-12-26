export interface Position {
  x: number;
  y: number;
}

export interface Enemy {
  id: string;
  position: Position;
  jitterAngle: number;
  lastJitterUpdate: number;
}

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  playerPosition: Position;
  enemies: Enemy[];
  startTime: number;
  lastSpawnTime: number;
  screenWidth: number;
  screenHeight: number;
}

export type Handedness = 'left' | 'right';

export interface DifficultyParams {
  spawnInterval: number;
  enemySpeed: number;
  maxEnemies: number;
  jitterIntensity: number;
}

export type SpawnZone = 'corner' | 'edge' | 'any';
