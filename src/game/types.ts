export interface Position {
  x: number;
  y: number;
}

export type SpeedTier = 'slow' | 'medium' | 'fast';

export interface Enemy {
  id: string;
  position: Position;
  jitterAngle: number;
  lastJitterUpdate: number;
  spawnTime: number;
  speedTier: SpeedTier;
  speed: number;
}

export type BoosterType = 'plus' | 'shield' | 'multiplier';

export interface Booster {
  id: string;
  position: Position;
  type: BoosterType;
  spawnTime: number;
}

export type DebuffType = 'enlarge';

export interface Debuff {
  id: string;
  position: Position;
  type: DebuffType;
  spawnTime: number;
}

export interface ActiveEffects {
  shield: {
    active: boolean;
    endTime: number;
  };
  multiplier: {
    active: boolean;
    endTime: number;
    value: number;
  };
  enlarge: {
    active: boolean;
    endTime: number;
    scale: number;
  };
}

export interface GameState {
  isRunning: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  hasStarted: boolean;
  score: number;
  playTime: number;
  playerPosition: Position;
  enemies: Enemy[];
  boosters: Booster[];
  debuffs: Debuff[];
  activeEffects: ActiveEffects;
  startTime: number;
  lastSpawnTime: number;
  lastBoosterSpawnTime: number;
  lastDebuffSpawnTime: number;
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
