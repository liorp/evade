import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet, Text, type TextStyle, View, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adManager } from '../ads/adManager';
import { AD_CONFIG } from '../ads/constants';
import {
  trackBoosterCollected,
  trackContinueUsed,
  trackGameEnded,
  trackGameStarted,
} from '../analytics';
import { audioManager } from '../audio/audioManager';
import { COLORS } from '../const/colors';
import { ENEMY_THEMES } from '../cosmetics/constants';
import { Booster } from '../entity/Booster';
import { Enemy } from '../entity/Enemy';
import { Explosion } from '../entity/Explosion';
import { GameBackground } from '../entity/GameBackground';
import { Player } from '../entity/Player';
import { ContinueModal } from '../game/ContinueModal';
import { GAME } from '../game/constants';
import { GameEngine, type GameOverData } from '../game/GameEngine';
import { GameOverModal } from '../game/GameOverModal';
import type { ActiveEffects, Booster as BoosterType, Enemy as EnemyType } from '../game/types';
import { useAdStore } from '../state/adStore';
import { useCosmeticStore } from '../state/cosmeticStore';
import { useHighscoreStore } from '../state/highscoreStore';
import { useSettingsStore } from '../state/settingsStore';
import { calculateShardsFromScore, useShardStore } from '../state/shardStore';
import { ChromeText } from '../ui';

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
  const { handedness, sfxEnabled, hapticsEnabled } = useSettingsStore();
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
  const [_pendingGameOver, setPendingGameOver] = useState(false);
  const [enemies, setEnemies] = useState<EnemyType[]>([]);
  const [boosters, setBoosters] = useState<BoosterType[]>([]);
  const [activeEffects, setActiveEffects] = useState<ActiveEffects>({
    shield: { active: false, endTime: 0 },
    multiplier: { active: false, endTime: 0, value: 1 },
  });
  const [screenSize, _setScreenSize] = useState(Dimensions.get('window'));
  const [currentTime, setCurrentTime] = useState(performance.now());
  const [passedBest, setPassedBest] = useState(false);
  const [shardsEarned, setShardsEarned] = useState(0);
  const [_boostersCollectedCount, setBoostersCollectedCount] = useState(0);
  const [_didUseContinue, setDidUseContinue] = useState(false);
  const [explosion, setExplosion] = useState<{
    id: string;
    x: number;
    y: number;
    color: string;
  } | null>(null);
  const gameStartTimeRef = useRef<number>(0);
  const boostersCollectedRef = useRef(0);
  const didUseContinueRef = useRef(false);

  const playerX = useSharedValue(screenSize.width / 2);
  const playerY = useSharedValue(screenSize.height / 2);

  const gameEngine = useRef<GameEngine | null>(null);
  const newEnemyIds = useRef<Set<string>>(new Set());
  const newBoosterIds = useRef<Set<string>>(new Set());

  const handleActualGameOver = useCallback(async () => {
    setIsGameOver(true);
    const finalScore = gameEngine.current?.getState().score ?? 0;
    if (finalScore > 0) {
      addScore(finalScore);
    }

    // Track game ended
    trackGameEnded({
      score: finalScore,
      duration_seconds: Math.floor((Date.now() - gameStartTimeRef.current) / 1000),
      boosters_collected: boostersCollectedRef.current,
      continue_used: didUseContinueRef.current,
    });

    // Award shards based on score
    const shards = calculateShardsFromScore(finalScore);
    setShardsEarned(shards);
    if (shards > 0) {
      addShards(shards, 'score');
    }

    // Show interstitial if needed
    if (shouldShowInterstitial()) {
      await adManager.showInterstitial('game_over');
      markAdShown();
    }
  }, [addScore, addShards, shouldShowInterstitial, markAdShown]);

  useEffect(() => {
    const engine = new GameEngine(screenSize.width, screenSize.height, handedness);
    gameEngine.current = engine;

    engine.setEventCallback((event, data) => {
      if (event === 'gameOver') {
        const gameOverData = data as GameOverData;
        incrementDeathCount();

        // Play audio and haptics immediately on collision
        if (sfxEnabled) {
          audioManager.playGameOver();
        }
        if (hapticsEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }

        // Show explosion if collision data exists (not finger lift)
        if (gameOverData.collisionPosition && gameOverData.enemySpeedTier) {
          const themeData = ENEMY_THEMES[equipped.enemyTheme];
          setExplosion({
            id: Date.now().toString(),
            x: gameOverData.collisionPosition.x,
            y: gameOverData.collisionPosition.y,
            color: themeData.colors.base,
          });
        }

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
      } else if (event === 'boosterCollected') {
        setBoostersCollectedCount((prev) => prev + 1);
        boostersCollectedRef.current += 1;
        trackBoosterCollected({ booster_type: data as 'shield' | 'multiplier' | 'plus' });
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
  }, [
    boosters.find,
    canUseContinue,
    enemies.find,
    equipped.enemyTheme,
    handedness,
    handleActualGameOver,
    hapticsEnabled,
    incrementDeathCount,
    screenSize.height,
    screenSize.width,
    sfxEnabled,
  ]);

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
    // Only track and reset stats if game hasn't started yet
    if (!gameEngine.current?.getState().hasStarted) {
      trackGameStarted({
        cosmetics: JSON.stringify(equipped),
      });
      gameStartTimeRef.current = Date.now();
      setBoostersCollectedCount(0);
      setDidUseContinue(false);
      boostersCollectedRef.current = 0;
      didUseContinueRef.current = false;
    }
    gameEngine.current?.resume();
  }, [equipped]);

  const handleFingerLift = useCallback(() => {
    // Only trigger game over if game has started
    if (gameEngine.current?.getState().hasStarted) {
      gameEngine.current?.triggerGameOver();
    }
  }, []);

  const updatePlayerPosition = useCallback((x: number, y: number) => {
    gameEngine.current?.setPlayerPosition(x, y);
  }, []);

  const handleContinue = useCallback(() => {
    setShowContinueModal(false);
    setPendingGameOver(false);
    setDidUseContinue(true);
    didUseContinueRef.current = true;
    const currentScore = gameEngine.current?.getState().score ?? 0;
    trackContinueUsed({
      method: 'rewarded_ad',
      score_at_continue: currentScore,
    });
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
    .enabled(!isGameOver && !showContinueModal)
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
    setPassedBest(false);
    setShardsEarned(0);
    setBoostersCollectedCount(0);
    setDidUseContinue(false);
    setExplosion(null);
    boostersCollectedRef.current = 0;
    didUseContinueRef.current = false;
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

  const showModal = isGameOver || showContinueModal;

  const gameAreaContent = (
    <Animated.View style={styles.gameArea} pointerEvents={showModal ? 'none' : 'auto'}>
      {/* Themed Background */}
      <GameBackground theme={equipped.backgroundTheme} />

      {/* Score and Active Effects */}
      <SafeAreaView style={styles.scoreContainer}>
        <ChromeText size={28} color="gold" glowPulse={false}>
          {score.toString()}
        </ChromeText>
        {bestScore > 0 && hasStarted && !isGameOver && (
          <Text style={[styles.bestScore, passedBest && styles.bestScorePassed]}>
            {passedBest ? 'NEW BEST!' : `Best: ${bestScore}`}
          </Text>
        )}
        <View style={styles.effectsContainer}>
          {activeEffects.shield.active && (
            <View style={styles.shieldBadge}>
              <Text style={styles.shieldIcon}>{'\u25CB'}</Text>
            </View>
          )}
          {activeEffects.multiplier.active && (
            <View style={styles.multiplierBadge}>
              <Text style={styles.multiplierIcon}>x{activeEffects.multiplier.value}</Text>
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
        shape={equipped.playerShape}
        colorId={equipped.playerColor}
        trail={equipped.playerTrail}
        glow={equipped.playerGlow}
      />

      {/* Explosion */}
      {explosion && (
        <Explosion
          key={explosion.id}
          x={explosion.x}
          y={explosion.y}
          color={explosion.color}
          onComplete={() => setExplosion(null)}
        />
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        <GestureDetector gesture={gesture}>{gameAreaContent}</GestureDetector>

        {/* Start Overlay - only shown before game starts */}
        {!hasStarted && !isGameOver && (
          <View style={styles.startOverlay} pointerEvents="none">
            <ChromeText size={28} color="cyan" glowPulse={true}>
              {t('play.touchToStart')}
            </ChromeText>
          </View>
        )}
      </GestureHandlerRootView>

      {/* Modals outside GestureHandlerRootView for proper touch handling */}
      <ContinueModal
        visible={showContinueModal}
        canContinue={canUseContinue()}
        onContinue={handleContinue}
        onDecline={handleDeclineContinue}
      />

      <GameOverModal
        visible={isGameOver && !showContinueModal}
        score={score}
        isNewBest={passedBest}
        shardsEarned={shardsEarned}
        onRetry={handleRetry}
        onMenu={handleBackToMenu}
      />
    </View>
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
    overflow: 'visible',
  },
  bestScore: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bestScorePassed: {
    color: COLORS.chromeGold,
    fontWeight: 'bold',
  },
  effectsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  shieldBadge: {
    backgroundColor: 'rgba(0, 245, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.neonCyan,
    shadowColor: COLORS.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  } as ViewStyle,
  shieldIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.neonCyan,
  } as TextStyle,
  multiplierBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.chromeGold,
    shadowColor: COLORS.chromeGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  } as ViewStyle,
  multiplierIcon: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.chromeGold,
  } as TextStyle,
  startOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 18, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    elevation: 100,
    overflow: 'visible',
  },
});
