import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type React from 'react';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { audioManager } from '../audio/audioManager';
import { COLORS } from '../const/colors';
import { useParallax } from '../hooks';
import { useSettingsStore } from '../state/settingsStore';
import { ChromeText, GlassButton, SynthwaveBackground } from '../ui';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
  HighScores: undefined;
  Instructions: { fromFirstPlay?: boolean };
  Shop: undefined;
};

interface MainMenuProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainMenu'>;
}

export const MainMenuScreen: React.FC<MainMenuProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { musicEnabled, hasSeenTutorial, setHasSeenTutorial } = useSettingsStore();
  const { x: parallaxX, y: parallaxY } = useParallax({ intensity: 1 });

  // Buttons move opposite to tilt (foreground layer), clamped to ±20px
  const buttonParallaxStyle = useAnimatedStyle(() => {
    'worklet';
    const clamp = (value: number, min: number, max: number) => {
      return Math.max(min, Math.min(max, value));
    };

    return {
      transform: [
        { translateX: clamp(-parallaxX.value * 1.3, -20, 20) },
        { translateY: clamp(-parallaxY.value * 1.3, -20, 20) },
      ],
    };
  });

  // Initialize audio on mount (once)
  useEffect(() => {
    const initAudio = async () => {
      await audioManager.load();
    };
    initAudio();
  }, []);

  // Sync music state with settings
  useEffect(() => {
    const syncMusic = async () => {
      await audioManager.setMusicEnabled(musicEnabled);
      if (musicEnabled) {
        audioManager.playMusic();
      }
    };
    syncMusic();
  }, [musicEnabled]);

  const handlePlay = useCallback(() => {
    if (!hasSeenTutorial) {
      setHasSeenTutorial(true);
      navigation.navigate('Instructions', { fromFirstPlay: true });
    } else {
      navigation.navigate('Play');
    }
  }, [hasSeenTutorial, setHasSeenTutorial, navigation]);

  return (
    <View style={styles.container}>
      <SynthwaveBackground
        showStars
        showSun
        showHalos
        sunPosition={0.4}
        halosVariant="menu"
        parallaxX={parallaxX}
        parallaxY={parallaxY}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <ChromeText size={72} color="cyan" glowPulse>
              {t('appTitle')}
            </ChromeText>
          </View>

          <Animated.View style={[styles.buttonContainer, buttonParallaxStyle]}>
            <GlassButton
              title={t('common.play')}
              onPress={handlePlay}
              variant="primary"
              size="large"
              style={styles.playButton}
            />
            <GlassButton
              title={t('mainMenu.shop', 'Shop')}
              onPress={() => navigation.navigate('Shop')}
              variant="secondary"
              style={styles.secondaryButton}
            />
            <GlassButton
              title={t('mainMenu.highScores')}
              onPress={() => navigation.navigate('HighScores')}
              variant="secondary"
              style={styles.secondaryButton}
            />
            <GlassButton
              title={t('mainMenu.howToPlay')}
              onPress={() => navigation.navigate('Instructions', { fromFirstPlay: false })}
              variant="secondary"
              style={styles.secondaryButton}
            />
            <GlassButton
              title={t('mainMenu.settings')}
              onPress={() => navigation.navigate('Settings')}
              variant="secondary"
              style={styles.secondaryButton}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDeep,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    marginBottom: 80,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  buttonContainer: {
    gap: 16,
    alignItems: 'center',
  },
  playButton: {
    width: 240,
  },
  secondaryButton: {
    width: 200,
    paddingHorizontal: 16,
  },
});
