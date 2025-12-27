import { GAME } from './constants';
import { checkCollision } from './systems/collision';
import { getDifficultyParams, getSpawnZone } from './systems/difficulty';
import { updateEnemies } from './systems/movement';
import {
  createBooster,
  createEnemy,
  getBoosterSpawnPosition,
  getSpawnPosition,
  isBoosterExpired,
  shouldSpawn,
  shouldSpawnBooster,
} from './systems/spawn';
import type { Booster, Enemy, GameState, Handedness, Position } from './types';

export interface GameOverData {
  score: number;
  collisionPosition?: Position;
  enemySpeedTier?: Enemy['speedTier'];
}

export type GameEventType = 'gameOver' | 'scoreUpdate' | 'stateChange' | 'boosterCollected';
export type GameEventCallback = (event: GameEventType, data?: unknown) => void;

export class GameEngine {
  private state: GameState;
  private handedness: Handedness;
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private eventCallback: GameEventCallback | null = null;

  constructor(screenWidth: number, screenHeight: number, handedness: Handedness) {
    this.handedness = handedness;
    this.state = this.createInitialState(screenWidth, screenHeight);
  }

  private createInitialState(screenWidth: number, screenHeight: number): GameState {
    return {
      isRunning: false,
      isPaused: true,
      isGameOver: false,
      hasStarted: false,
      score: 0,
      playTime: 0,
      playerPosition: { x: screenWidth / 2, y: screenHeight / 2 },
      enemies: [],
      boosters: [],
      activeEffects: {
        shield: { active: false, endTime: 0 },
        multiplier: { active: false, endTime: 0, value: 1 },
      },
      startTime: 0,
      lastSpawnTime: 0,
      lastBoosterSpawnTime: 0,
      screenWidth,
      screenHeight,
    };
  }

  setEventCallback(callback: GameEventCallback): void {
    this.eventCallback = callback;
  }

  private emit(event: GameEventType, data?: unknown): void {
    this.eventCallback?.(event, data);
  }

  getState(): GameState {
    return this.state;
  }

  setPlayerPosition(x: number, y: number): void {
    this.state.playerPosition = { x, y };
  }

  setHandedness(handedness: Handedness): void {
    this.handedness = handedness;
  }

  start(): void {
    if (this.state.isRunning) return;

    const now = performance.now();
    this.state = {
      ...this.createInitialState(this.state.screenWidth, this.state.screenHeight),
      isRunning: true,
      isPaused: true, // Wait for first touch
      hasStarted: false,
      startTime: now,
      lastSpawnTime: now,
      lastBoosterSpawnTime: now,
    };
    this.lastTimestamp = now;
    this.emit('stateChange');
    this.loop(now);
  }

  resume(): void {
    if (!this.state.isRunning || !this.state.isPaused) return;
    this.state.isPaused = false;
    this.state.hasStarted = true;
    this.lastTimestamp = performance.now();
    this.emit('stateChange');
  }

  pause(): void {
    if (!this.state.isRunning || this.state.isPaused) return;
    this.state.isPaused = true;
    this.emit('stateChange');
  }

  stop(): void {
    this.state.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.emit('stateChange');
  }

  triggerGameOver(): void {
    if (!this.state.isRunning || this.state.isGameOver) return;
    this.state.isGameOver = true;
    this.state.isRunning = false;
    const gameOverData: GameOverData = { score: this.state.score };
    this.emit('gameOver', gameOverData);
  }

  continueGame(shieldDuration: number): void {
    if (!this.state.isGameOver) return;

    // Reset game over state
    this.state.isGameOver = false;
    this.state.isRunning = true;
    this.state.isPaused = true; // Wait for touch to resume

    // Activate shield
    const now = performance.now();
    this.state.activeEffects.shield.active = true;
    this.state.activeEffects.shield.endTime = now + shieldDuration;

    // Clear nearby enemies for safety
    this.state.enemies = this.state.enemies.filter(
      (enemy) =>
        Math.hypot(
          enemy.position.x - this.state.playerPosition.x,
          enemy.position.y - this.state.playerPosition.y,
        ) >
        GAME.PLAYER_RADIUS + GAME.ENEMY_RADIUS + 100,
    );

    this.lastTimestamp = now;
    this.emit('stateChange');
    this.loop(now);
  }

  private loop = (timestamp: number): void => {
    if (!this.state.isRunning) return;

    if (!this.state.isPaused && !this.state.isGameOver) {
      const deltaTime = timestamp - this.lastTimestamp;
      this.update(timestamp, deltaTime);
    }

    this.lastTimestamp = timestamp;
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(timestamp: number, deltaTime: number): void {
    // Accumulate actual play time (not pause time)
    this.state.playTime += deltaTime;
    const difficulty = getDifficultyParams(this.state.playTime);

    // Update active effects
    this.updateActiveEffects(timestamp);

    // 1. Check collision first (but shield protects)
    const collidedEnemy = checkCollision(this.state.playerPosition, this.state.enemies);
    if (collidedEnemy) {
      if (this.state.activeEffects.shield.active) {
        // Shield absorbs hit - clear all nearby enemies
        this.state.enemies = this.state.enemies.filter(
          (enemy) =>
            Math.hypot(
              enemy.position.x - this.state.playerPosition.x,
              enemy.position.y - this.state.playerPosition.y,
            ) >
            GAME.PLAYER_RADIUS + GAME.ENEMY_RADIUS + 50,
        );
        // Deactivate shield after use
        this.state.activeEffects.shield.active = false;
        this.state.activeEffects.shield.endTime = 0;
      } else {
        this.state.isGameOver = true;
        this.state.isRunning = false;
        const gameOverData: GameOverData = {
          score: this.state.score,
          collisionPosition: collidedEnemy.position,
          enemySpeedTier: collidedEnemy.speedTier,
        };
        this.emit('gameOver', gameOverData);
        return;
      }
    }

    // 2. Check booster collection
    const collectedBooster = this.checkBoosterCollection();
    if (collectedBooster) {
      this.applyBoosterEffect(collectedBooster, timestamp);
      this.state.boosters = this.state.boosters.filter((b) => b.id !== collectedBooster.id);
      this.emit('boosterCollected', collectedBooster.type);
    }

    // 3. Spawn enemies
    if (
      shouldSpawn(
        this.state.lastSpawnTime,
        timestamp,
        difficulty.spawnInterval,
        this.state.enemies.length,
        difficulty.maxEnemies,
      )
    ) {
      const spawnZone = getSpawnZone(this.state.playTime);
      const position = getSpawnPosition(
        spawnZone,
        this.state.screenWidth,
        this.state.screenHeight,
        this.handedness,
      );
      const enemy = createEnemy(position, timestamp, this.state.playTime);
      this.state.enemies.push(enemy);
      this.state.lastSpawnTime = timestamp;
    }

    // 4. Spawn boosters
    if (
      shouldSpawnBooster(this.state.lastBoosterSpawnTime, timestamp, this.state.boosters.length)
    ) {
      const position = getBoosterSpawnPosition(
        this.state.screenWidth,
        this.state.screenHeight,
        this.state.playerPosition,
      );
      const booster = createBooster(position, timestamp);
      this.state.boosters.push(booster);
      this.state.lastBoosterSpawnTime = timestamp;
    }

    // 5. Remove expired boosters
    this.state.boosters = this.state.boosters.filter(
      (booster) => !isBoosterExpired(booster, timestamp),
    );

    // 6. Move enemies and track removed (each enemy uses its own speed)
    const result = updateEnemies(
      this.state.enemies,
      this.state.playerPosition,
      deltaTime,
      timestamp,
      difficulty.jitterIntensity,
      this.state.screenWidth,
      this.state.screenHeight,
    );
    this.state.enemies = result.enemies;

    // 7. Update score - points per enemy despawned, scaled by elapsed time and enemy count
    if (result.removedCount > 0) {
      const timeMultiplier = 1 + this.state.playTime / 60000; // +1x per minute
      const enemyCountMultiplier = this.getEnemyCountMultiplier();
      let pointsPerEnemy = Math.floor(
        GAME.POINTS_PER_ENEMY * timeMultiplier * enemyCountMultiplier,
      );

      // Apply booster multiplier if active
      if (this.state.activeEffects.multiplier.active) {
        pointsPerEnemy *= this.state.activeEffects.multiplier.value;
      }

      this.state.score += result.removedCount * pointsPerEnemy;
      this.emit('scoreUpdate', this.state.score);
    }
  }

  private updateActiveEffects(timestamp: number): void {
    // Check shield expiration
    if (
      this.state.activeEffects.shield.active &&
      timestamp > this.state.activeEffects.shield.endTime
    ) {
      this.state.activeEffects.shield.active = false;
    }

    // Check multiplier expiration
    if (
      this.state.activeEffects.multiplier.active &&
      timestamp > this.state.activeEffects.multiplier.endTime
    ) {
      this.state.activeEffects.multiplier.active = false;
      this.state.activeEffects.multiplier.value = 1;
    }
  }

  private checkBoosterCollection(): Booster | null {
    for (const booster of this.state.boosters) {
      const distance = Math.hypot(
        booster.position.x - this.state.playerPosition.x,
        booster.position.y - this.state.playerPosition.y,
      );
      if (distance < GAME.PLAYER_RADIUS + GAME.BOOSTER_RADIUS) {
        return booster;
      }
    }
    return null;
  }

  private getEnemyCountMultiplier(): number {
    const count = this.state.enemies.length;
    if (count >= GAME.SPEED_SCORE_THRESHOLD_HIGH) return GAME.SPEED_SCORE_MULTIPLIER_HIGH;
    if (count >= GAME.SPEED_SCORE_THRESHOLD_MEDIUM) return GAME.SPEED_SCORE_MULTIPLIER_MEDIUM;
    return 1.0;
  }

  private applyBoosterEffect(booster: Booster, timestamp: number): void {
    switch (booster.type) {
      case 'plus':
        // Add bonus points
        this.state.score += GAME.BOOSTER_PLUS_POINTS;
        this.emit('scoreUpdate', this.state.score);
        break;
      case 'shield':
        // Activate shield
        this.state.activeEffects.shield.active = true;
        this.state.activeEffects.shield.endTime = timestamp + GAME.BOOSTER_SHIELD_DURATION;
        break;
      case 'multiplier':
        // Activate multiplier
        this.state.activeEffects.multiplier.active = true;
        this.state.activeEffects.multiplier.endTime = timestamp + GAME.BOOSTER_MULTIPLIER_DURATION;
        this.state.activeEffects.multiplier.value = GAME.BOOSTER_MULTIPLIER_VALUE;
        break;
    }
  }

  updateScreenSize(width: number, height: number): void {
    this.state.screenWidth = width;
    this.state.screenHeight = height;
  }
}
