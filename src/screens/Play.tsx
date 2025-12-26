import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, runOnJS } from 'react-native-reanimated';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GameEngine } from '../game/GameEngine';
import { Enemy as EnemyType } from '../game/types';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { COLORS } from '../constants/colors';
import { useSettingsStore } from '../state/settingsStore';
import { audioManager } from '../audio/audioManager';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
};

interface PlayScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Play'>;
}

export const PlayScreen: React.FC<PlayScreenProps> = ({ navigation }) => {
  const { handedness, sfxEnabled } = useSettingsStore();
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [enemies, setEnemies] = useState<EnemyType[]>([]);
  const [screenSize, setScreenSize] = useState(Dimensions.get('window'));

  const playerX = useSharedValue(screenSize.width / 2);
  const playerY = useSharedValue(screenSize.height / 2);

  const gameEngine = useRef<GameEngine | null>(null);
  const newEnemyIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const engine = new GameEngine(screenSize.width, screenSize.height, handedness);
    gameEngine.current = engine;

    engine.setEventCallback((event, data) => {
      if (event === 'gameOver') {
        setIsGameOver(true);
        setIsPaused(true);
        if (sfxEnabled) {
          audioManager.playGameOver();
        }
      } else if (event === 'scoreUpdate') {
        setScore(data as number);
      } else if (event === 'stateChange') {
        const state = engine.getState();
        setIsPaused(state.isPaused);
      }
    });

    // Start game loop (waits for first touch)
    engine.start();

    // Update enemies at 60fps
    const interval = setInterval(() => {
      if (engine.getState().isRunning && !engine.getState().isPaused) {
        const state = engine.getState();
        const currentIds = new Set(state.enemies.map((e) => e.id));

        // Track new enemies for fade-in
        state.enemies.forEach((e) => {
          if (!enemies.find((existing) => existing.id === e.id)) {
            newEnemyIds.current.add(e.id);
          }
        });

        setEnemies([...state.enemies]);

        // Clear new flags after a frame
        setTimeout(() => {
          newEnemyIds.current.clear();
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

  const handleStart = useCallback(() => {
    gameEngine.current?.resume();
  }, []);

  const handlePause = useCallback(() => {
    gameEngine.current?.pause();
  }, []);

  const updatePlayerPosition = useCallback((x: number, y: number) => {
    gameEngine.current?.setPlayerPosition(x, y);
  }, []);

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
      runOnJS(handlePause)();
    });

  const handleRetry = () => {
    setIsGameOver(false);
    setScore(0);
    setEnemies([]);
    newEnemyIds.current.clear();
    playerX.value = screenSize.width / 2;
    playerY.value = screenSize.height / 2;
    gameEngine.current?.start();
  };

  const handleBackToMenu = () => {
    gameEngine.current?.stop();
    navigation.navigate('MainMenu');
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={styles.gameArea}>
          {/* Score */}
          <SafeAreaView style={styles.scoreContainer}>
            <Text style={styles.score}>{score.toFixed(1)}s</Text>
          </SafeAreaView>

          {/* Enemies */}
          {enemies.map((enemy) => (
            <Enemy
              key={enemy.id}
              x={enemy.position.x}
              y={enemy.position.y}
              isNew={newEnemyIds.current.has(enemy.id)}
            />
          ))}

          {/* Player */}
          <Player x={playerX} y={playerY} />

          {/* Pause Overlay */}
          {isPaused && !isGameOver && (
            <View style={styles.pauseOverlay}>
              <Text style={styles.pauseText}>TAP TO START</Text>
            </View>
          )}

          {/* Game Over Modal */}
          {isGameOver && (
            <View style={styles.gameOverOverlay}>
              <View style={styles.gameOverModal}>
                <Text style={styles.gameOverTitle}>GAME OVER</Text>
                <Text style={styles.finalScore}>{score.toFixed(2)}s</Text>
                <Pressable style={styles.button} onPress={handleRetry}>
                  <Text style={styles.buttonText}>Retry</Text>
                </Pressable>
                <Pressable
                  style={[styles.button, styles.secondaryButton]}
                  onPress={handleBackToMenu}
                >
                  <Text style={styles.buttonText}>Menu</Text>
                </Pressable>
              </View>
            </View>
          )}
        </Animated.View>
      </GestureDetector>
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
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.pauseOverlay,
    justifyContent: 'center',
    alignItems: 'center',
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
  finalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.player,
    marginBottom: 24,
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
