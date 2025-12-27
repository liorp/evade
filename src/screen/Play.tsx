import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, { useSharedValue, runOnJS } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { GameEngine } from '../game/GameEngine';
import { Enemy as EnemyType, Booster as BoosterType, ActiveEffects } from '../game/types';
import { Player } from '../entity/Player';
import { Enemy } from '../entity/Enemy';
import { Booster } from '../entity/Booster';
import { COLORS } from '../const/colors';
import { GAME } from '../const/game';
import { useSettingsStore } from '../state/settingsStore';
import { useHighscoreStore } from '../state/highscoreStore';
import { audioManager } from '../audio/audioManager';
import { ContinueModal } from '../components/ContinueModal';
import { useAdStore } from '../state/adStore';
import { adManager } from '../ads/adManager';
import { AD_CONFIG } from '../const/ads';
import { useCosmeticStore } from '../state/cosmeticStore';
import { useShardStore, calculateShardsFromScore } from '../state/shardStore';
import { GameBackground } from '../entity/GameBackground';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
};

interface PlayScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Play'>;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { handedness, sfxEnabled } = useSettingsStore();
  const { addScore, getBestScore } = useHighscoreStore();
  const {
    incrementDeathCount,
    resetRunState,
    markAdShown,
    markContinueUsed,
    markRewardedWatched,
    shouldShowInterstitial,
    canUseContinue,
  } = useAdStore();
  const { equipped } = useCosmeticStore();
  const { addShards } = useShardStore();
  const bestScore = getBestScore();
  const [score, setScore] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [pendingGameOver, setPendingGameOver] = useState(false);
  const [enemies, setEnemies] = useState<EnemyType[]>([]);
  const [boosters, setBoosters] = useState<BoosterType[]>([]);
  const [activeEffects, setActiveEffects] = useState<ActiveEffects>({
    shield: { active: false, endTime: 0 },
    multiplier: { active: false, endTime: 0, value: 1 },
  });
  const [screenSize, setScreenSize] = useState(Dimensions.get('window'));
  const [currentTime, setCurrentTime] = useState(performance.now());
  const [dodgeFlashTrigger, setDodgeFlashTrigger] = useState(0);
  const [passedBest, setPassedBest] = useState(false);
  const [shardsEarned, setShardsEarned] = useState(0);

  const playerX = useSharedValue(screenSize.width / 2);
  const playerY = useSharedValue(screenSize.height / 2);

  const gameEngine = useRef<GameEngine | null>(null);
  const newEnemyIds = useRef<Set<string>>(new Set());
  const newBoosterIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const engine = new GameEngine(screenSize.width, screenSize.height, handedness);
    gameEngine.current = engine;

    engine.setEventCallback((event, data) => {
      if (event === 'gameOver') {
        incrementDeathCount();

        // Check if player can use continue
        if (canUseContinue() && adManager.isRewardedReady()) {
          setPendingGameOver(true);
          setShowContinueModal(true);
        } else {
          handleActualGameOver();
        }
      } else if (event === 'scoreUpdate') {
        setScore(data as number);
      } else if (event === 'stateChange') {
        const state = engine.getState();
        setHasStarted(state.hasStarted);
      } else if (event === 'closeDodge') {
        setDodgeFlashTrigger((prev) => prev + 1);
        if (sfxEnabled) {
          audioManager.playDodge();
        }
      }
    });

    // Start game loop (waits for first touch)
    engine.start();

    // Update enemies at 60fps
    const interval = setInterval(() => {
      if (engine.getState().isRunning && !engine.getState().isPaused) {
        const state = engine.getState();
        const now = performance.now();

        // Track new enemies for fade-in
        state.enemies.forEach((e) => {
          if (!enemies.find((existing) => existing.id === e.id)) {
            newEnemyIds.current.add(e.id);
          }
        });

        // Track new boosters for fade-in
        state.boosters.forEach((b) => {
          if (!boosters.find((existing) => existing.id === b.id)) {
            newBoosterIds.current.add(b.id);
          }
        });

        setEnemies([...state.enemies]);
        setBoosters([...state.boosters]);
        setActiveEffects({ ...state.activeEffects });
        setCurrentTime(now);

        // Clear new flags after a frame
        setTimeout(() => {
          newEnemyIds.current.clear();
          newBoosterIds.current.clear();
        }, 50);
      }
    }, 16);

    return () => {
      clearInterval(interval);
      engine.stop();
    };
  }, []);

  useEffect(() => {
    if (gameEngine.current) {
      gameEngine.current.setHandedness(handedness);
    }
  }, [handedness]);

  useEffect(() => {
    if (score > bestScore && bestScore > 0 && !passedBest) {
      setPassedBest(true);
    }
  }, [score, bestScore, passedBest]);

  const handleStart = useCallback(() => {
    gameEngine.current?.resume();
  }, []);

  const handleFingerLift = useCallback(() => {
    // Only trigger game over if game has started
    if (gameEngine.current?.getState().hasStarted) {
      gameEngine.current?.triggerGameOver();
    }
  }, []);

  const updatePlayerPosition = useCallback((x: number, y: number) => {
    gameEngine.current?.setPlayerPosition(x, y);
  }, []);

  const handleActualGameOver = useCallback(async () => {
    setIsGameOver(true);
    const finalScore = gameEngine.current?.getState().score ?? 0;
    if (finalScore > 0) {
      addScore(finalScore);
    }

    // Award shards based on score
    const shards = calculateShardsFromScore(finalScore);
    setShardsEarned(shards);
    if (shards > 0) {
      addShards(shards, 'score');
    }

    if (sfxEnabled) {
      audioManager.playGameOver();
    }

    // Show interstitial if needed
    if (shouldShowInterstitial()) {
      await adManager.showInterstitial();
      markAdShown();
    }
  }, [addScore, addShards, sfxEnabled, shouldShowInterstitial, markAdShown]);

  const handleContinue = useCallback(() => {
    setShowContinueModal(false);
    setPendingGameOver(false);
    markContinueUsed();
    markRewardedWatched();
    gameEngine.current?.continueGame(AD_CONFIG.CONTINUE_SHIELD_DURATION);
  }, [markContinueUsed, markRewardedWatched]);

  const handleDeclineContinue = useCallback(() => {
    setShowContinueModal(false);
    setPendingGameOver(false);
    handleActualGameOver();
  }, [handleActualGameOver]);

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      playerX.value = e.x;
      playerY.value = e.y;
      runOnJS(updatePlayerPosition)(e.x, e.y);
      runOnJS(handleStart)();
    })
    .onUpdate((e) => {
      playerX.value = e.x;
      playerY.value = e.y;
      runOnJS(updatePlayerPosition)(e.x, e.y);
    })
    .onEnd(() => {
      runOnJS(handleFingerLift)();
    });

  const handleRetry = () => {
    resetRunState(); // Reset continue used and rewarded watched flags
    setIsGameOver(false);
    setShowContinueModal(false);
    setPendingGameOver(false);
    setHasStarted(false);
    setScore(0);
    setEnemies([]);
    setBoosters([]);
    setActiveEffects({
      shield: { active: false, endTime: 0 },
      multiplier: { active: false, endTime: 0, value: 1 },
    });
    setDodgeFlashTrigger(0);
    setPassedBest(false);
    setShardsEarned(0);
    newEnemyIds.current.clear();
    newBoosterIds.current.clear();
    playerX.value = screenSize.width / 2;
    playerY.value = screenSize.height / 2;
    gameEngine.current?.start();
  };

  const handleBackToMenu = () => {
    gameEngine.current?.stop();
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainMenu' }],
    });
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={styles.gameArea}>
          {/* Themed Background */}
          <GameBackground theme={equipped.backgroundTheme} />

          {/* Score and Active Effects */}
          <SafeAreaView style={styles.scoreContainer}>
            <Text style={styles.score}>{score}</Text>
            {bestScore > 0 && hasStarted && !isGameOver && (
              <Text style={[styles.bestScore, passedBest && styles.bestScorePassed]}>
                {passedBest ? 'NEW BEST!' : `Best: ${bestScore}`}
              </Text>
            )}
            <View style={styles.effectsContainer}>
              {activeEffects.shield.active && (
                <View style={styles.effectBadge}>
                  <Text style={styles.effectIcon}>{'\u25CB'}</Text>
                </View>
              )}
              {activeEffects.multiplier.active && (
                <View style={[styles.effectBadge, styles.multiplierBadge]}>
                  <Text style={styles.effectIcon}>x{activeEffects.multiplier.value}</Text>
                </View>
              )}
            </View>
          </SafeAreaView>

          {/* Boosters */}
          {boosters.map((booster) => {
            const age = currentTime - booster.spawnTime;
            const ttlPercent = Math.max(0, 1 - age / GAME.BOOSTER_LIFETIME);
            return (
              <Booster
                key={booster.id}
                x={booster.position.x}
                y={booster.position.y}
                type={booster.type}
                ttlPercent={ttlPercent}
                isNew={newBoosterIds.current.has(booster.id)}
              />
            );
          })}

          {/* Enemies */}
          {enemies.map((enemy) => {
            const age = currentTime - enemy.spawnTime;
            const ttlPercent = Math.max(0, 1 - age / GAME.ENEMY_MAX_LIFETIME);
            return (
              <Enemy
                key={enemy.id}
                x={enemy.position.x}
                y={enemy.position.y}
                speedTier={enemy.speedTier}
                ttlPercent={ttlPercent}
                isNew={newEnemyIds.current.has(enemy.id)}
                theme={equipped.enemyTheme}
              />
            );
          })}

          {/* Player */}
          <Player
            x={playerX}
            y={playerY}
            hasShield={activeEffects.shield.active}
            dodgeFlashTrigger={dodgeFlashTrigger}
            shape={equipped.playerShape}
            colorId={equipped.playerColor}
            trail={equipped.playerTrail}
            glow={equipped.playerGlow}
          />
        </Animated.View>
      </GestureDetector>

      {/* Start Overlay - only shown before game starts */}
      {!hasStarted && !isGameOver && (
        <View style={styles.pauseOverlay} pointerEvents="none">
          <Text style={styles.pauseText}>{t('play.touchToStart')}</Text>
        </View>
      )}

      <ContinueModal
        visible={showContinueModal}
        canContinue={canUseContinue()}
        onContinue={handleContinue}
        onDecline={handleDeclineContinue}
      />

      {/* Game Over Modal - outside gesture detector for button presses */}
      {isGameOver && !showContinueModal && (
        <View style={styles.gameOverOverlay}>
          <View style={styles.gameOverModal}>
            <Text style={styles.gameOverTitle}>{t('play.gameOver')}</Text>
            {passedBest && (
              <Text style={styles.newBestText}>NEW BEST!</Text>
            )}
            <Text style={styles.finalScore}>{score}</Text>
            {shardsEarned > 0 && (
              <Text style={styles.shardsEarned}>+{shardsEarned} 💎</Text>
            )}
            <Pressable style={styles.button} onPress={handleRetry}>
              <Text style={styles.buttonText}>{t('common.retry')}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={handleBackToMenu}
            >
              <Text style={styles.buttonText}>{t('common.menu')}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gameArea: {
    flex: 1,
  },
  scoreContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.score,
  },
  bestScore: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
  },
  bestScorePassed: {
    color: '#ffdd44',
    fontWeight: 'bold',
  },
  effectsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  effectBadge: {
    backgroundColor: '#44ff44',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  multiplierBadge: {
    backgroundColor: '#ffaa44',
  },
  effectIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.pauseOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    elevation: 100,
  },
  pauseText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.pauseOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverModal: {
    backgroundColor: '#1a1a2e',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 250,
  },
  gameOverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.enemy,
    marginBottom: 16,
  },
  newBestText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffdd44',
    marginBottom: 8,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.player,
    marginBottom: 8,
  },
  shardsEarned: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffd700',
    marginBottom: 16,
  },
  button: {
    backgroundColor: COLORS.menuAccent,
    paddingVertical: 12,
    paddingHorizontal: 48,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 180,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.menuAccentDark,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
