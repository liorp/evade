import { GameState, Position, Handedness, Enemy } from './types';
import { checkCollision } from './systems/collision';
import { getDifficultyParams, getSpawnZone } from './systems/difficulty';
import { getSpawnPosition, createEnemy, shouldSpawn } from './systems/spawn';
import { updateEnemies } from './systems/movement';

export type GameEventType = 'gameOver' | 'scoreUpdate' | 'stateChange';
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
      score: 0,
      playerPosition: { x: screenWidth / 2, y: screenHeight / 2 },
      enemies: [],
      startTime: 0,
      lastSpawnTime: 0,
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
      startTime: now,
      lastSpawnTime: now,
    };
    this.lastTimestamp = now;
    this.emit('stateChange');
    this.loop(now);
  }

  resume(): void {
    if (!this.state.isRunning || !this.state.isPaused) return;
    this.state.isPaused = false;
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
    const elapsedTime = timestamp - this.state.startTime;
    const difficulty = getDifficultyParams(elapsedTime);

    // 1. Check collision first
    if (checkCollision(this.state.playerPosition, this.state.enemies)) {
      this.state.isGameOver = true;
      this.state.isRunning = false;
      this.emit('gameOver', { score: this.state.score });
      return;
    }

    // 2. Spawn enemies
    if (
      shouldSpawn(
        this.state.lastSpawnTime,
        timestamp,
        difficulty.spawnInterval,
        this.state.enemies.length,
        difficulty.maxEnemies
      )
    ) {
      const spawnZone = getSpawnZone(elapsedTime);
      const position = getSpawnPosition(
        spawnZone,
        this.state.screenWidth,
        this.state.screenHeight,
        this.handedness
      );
      const enemy = createEnemy(position, timestamp);
      this.state.enemies.push(enemy);
      this.state.lastSpawnTime = timestamp;
    }

    // 3. Move enemies
    this.state.enemies = updateEnemies(
      this.state.enemies,
      this.state.playerPosition,
      deltaTime,
      timestamp,
      difficulty.enemySpeed,
      difficulty.jitterIntensity,
      this.state.screenWidth,
      this.state.screenHeight
    );

    // 4. Update score
    this.state.score = elapsedTime / 1000;
    this.emit('scoreUpdate', this.state.score);
  }

  updateScreenSize(width: number, height: number): void {
    this.state.screenWidth = width;
    this.state.screenHeight = height;
  }
}
