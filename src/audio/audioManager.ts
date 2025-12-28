import { Audio } from 'expo-av';

class AudioManager {
  private backgroundMusic: Audio.Sound | null = null;
  private gameOverSound: Audio.Sound | null = null;
  private explosionSound: Audio.Sound | null = null;
  private musicEnabled = true;
  private sfxEnabled = true;
  private isLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  async load(): Promise<void> {
    if (this.isLoaded) return;

    // Prevent concurrent load calls - return existing promise if loading
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = this.doLoad();
    return this.loadingPromise;
  }

  private async doLoad(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Load background music
      const { sound: music } = await Audio.Sound.createAsync(
        require('../../assets/audio/background.mp3'),
        { isLooping: true, volume: 0.5 },
      );
      this.backgroundMusic = music;

      // Load game over sound
      const { sound: gameOver } = await Audio.Sound.createAsync(
        require('../../assets/audio/gameover.mp3'),
        { volume: 0.7 },
      );
      this.gameOverSound = gameOver;

      // Load explosion sound
      const { sound: explosion } = await Audio.Sound.createAsync(
        require('../../assets/audio/explosion.mp3'),
        { volume: 0.8 },
      );
      this.explosionSound = explosion;

      this.isLoaded = true;
    } catch (error) {
      console.warn('Audio loading failed:', error);
      this.loadingPromise = null; // Allow retry on failure
    }
  }

  async playMusic(): Promise<void> {
    if (!this.musicEnabled || !this.backgroundMusic) return;
    try {
      const status = await this.backgroundMusic.getStatusAsync();
      // Don't restart if already playing
      if (status.isLoaded && status.isPlaying) return;

      await this.backgroundMusic.setPositionAsync(0);
      await this.backgroundMusic.playAsync();
    } catch (error) {
      console.warn('Music play failed:', error);
    }
  }

  async stopMusic(): Promise<void> {
    if (!this.backgroundMusic) return;
    try {
      await this.backgroundMusic.stopAsync();
    } catch (error) {
      console.warn('Music stop failed:', error);
    }
  }

  async playGameOver(): Promise<void> {
    if (!this.sfxEnabled || !this.gameOverSound) return;
    try {
      await this.gameOverSound.setPositionAsync(0);
      await this.gameOverSound.playAsync();
    } catch (error) {
      console.warn('Game over sound failed:', error);
    }
  }

  async playExplosion(): Promise<void> {
    if (!this.sfxEnabled || !this.explosionSound) return;
    try {
      await this.explosionSound.setPositionAsync(0);
      await this.explosionSound.playAsync();
    } catch (error) {
      console.warn('Explosion sound failed:', error);
    }
  }

  async setMusicEnabled(enabled: boolean): Promise<void> {
    this.musicEnabled = enabled;
    if (!enabled) {
      await this.stopMusic();
    }
  }

  setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
  }

  async unload(): Promise<void> {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.unloadAsync();
        this.backgroundMusic = null;
      }
      if (this.gameOverSound) {
        await this.gameOverSound.unloadAsync();
        this.gameOverSound = null;
      }
      if (this.explosionSound) {
        await this.explosionSound.unloadAsync();
        this.explosionSound = null;
      }
      this.isLoaded = false;
    } catch (error) {
      console.warn('Audio unload failed:', error);
    }
  }
}

export const audioManager = new AudioManager();
