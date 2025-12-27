import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../const/colors';
import { audioManager } from '../audio/audioManager';
import { useSettingsStore } from '../state/settingsStore';
import { MenuBackground } from '../entity/MenuBackground';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
  HighScores: undefined;
  Instructions: { fromFirstPlay?: boolean };
};

interface MainMenuProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainMenu'>;
}

export const MainMenuScreen: React.FC<MainMenuProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { musicEnabled, hasSeenTutorial, setHasSeenTutorial } = useSettingsStore();
  const glowOpacity = useSharedValue(0.3);

  useEffect(() => {
    glowOpacity.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, []);

  const animatedTitleStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  useEffect(() => {
    const initAudio = async () => {
      await audioManager.load();
      if (musicEnabled) {
        audioManager.playMusic();
      }
    };
    initAudio();
  }, []);

  useEffect(() => {
    audioManager.setMusicEnabled(musicEnabled);
    if (musicEnabled) {
      audioManager.playMusic();
    }
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
    <SafeAreaView style={styles.container}>
      <MenuBackground />
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Animated.Text style={[styles.titleGlow, animatedTitleStyle]}>
            {t('appTitle')}
          </Animated.Text>
          <Text style={styles.title}>{t('appTitle')}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handlePlay}
          >
            <Text style={styles.buttonText}>{t('common.play')}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('HighScores')}
          >
            <Text style={styles.buttonText}>{t('mainMenu.highScores')}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('Instructions', { fromFirstPlay: false })}
          >
            <Text style={styles.buttonText}>{t('mainMenu.howToPlay')}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.buttonText}>{t('mainMenu.settings')}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  },
  title: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.player,
    textShadowColor: COLORS.playerGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  titleGlow: {
    position: 'absolute',
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.playerGlow,
    textShadowColor: COLORS.playerGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 50,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    backgroundColor: COLORS.menuAccent,
    paddingVertical: 16,
    paddingHorizontal: 64,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.menuAccentDark,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
