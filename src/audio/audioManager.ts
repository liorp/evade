import { Audio } from 'expo-av';

class AudioManager {
  private backgroundMusic: Audio.Sound | null = null;
  private gameOverSound: Audio.Sound | null = null;
  private dodgeSound: Audio.Sound | null = null;
  private musicEnabled = true;
  private sfxEnabled = true;
  private isLoaded = false;

  async load(): Promise<void> {
    if (this.isLoaded) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Load background music
      const { sound: music } = await Audio.Sound.createAsync(
        require('../../assets/audio/background.mp3'),
        { isLooping: true, volume: 0.5 }
      );
      this.backgroundMusic = music;

      // Load game over sound
      const { sound: gameOver } = await Audio.Sound.createAsync(
        require('../../assets/audio/gameover.mp3'),
        { volume: 0.7 }
      );
      this.gameOverSound = gameOver;

      // Load dodge sound
      const { sound: dodge } = await Audio.Sound.createAsync(
        require('../../assets/audio/dodge.mp3'),
        { volume: 0.5 }
      );
      this.dodgeSound = dodge;

      this.isLoaded = true;
    } catch (error) {
      console.warn('Audio loading failed:', error);
    }
  }

  async playMusic(): Promise<void> {
    if (!this.musicEnabled || !this.backgroundMusic) return;
    try {
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

  async playDodge(): Promise<void> {
    if (!this.sfxEnabled || !this.dodgeSound) return;
    try {
      await this.dodgeSound.setPositionAsync(0);
      await this.dodgeSound.playAsync();
    } catch (error) {
      console.warn('Dodge sound failed:', error);
    }
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
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
      if (this.dodgeSound) {
        await this.dodgeSound.unloadAsync();
        this.dodgeSound = null;
      }
      this.isLoaded = false;
    } catch (error) {
      console.warn('Audio unload failed:', error);
    }
  }
}

export const audioManager = new AudioManager();
