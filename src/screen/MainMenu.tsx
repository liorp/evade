import React, { useEffect, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../const/colors';
import { audioManager } from '../audio/audioManager';
import { useSettingsStore } from '../state/settingsStore';
import { SynthwaveBackground, ChromeText, GlassButton } from '../components/ui';

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
    <View style={styles.container}>
      <SynthwaveBackground
        showStars
        showGrid
        showSun
        showHalos
        sunPosition={0.4}
        halosVariant="menu"
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <ChromeText size={72} color="cyan" glowPulse>
              {t('appTitle')}
            </ChromeText>
          </View>

          <View style={styles.buttonContainer}>
            <GlassButton
              title={t('common.play')}
              onPress={handlePlay}
              variant="primary"
              size="large"
            />
            <GlassButton
              title={t('mainMenu.shop', 'Shop')}
              onPress={() => navigation.navigate('Shop')}
              variant="secondary"
            />
            <GlassButton
              title={t('mainMenu.highScores')}
              onPress={() => navigation.navigate('HighScores')}
              variant="secondary"
            />
            <GlassButton
              title={t('mainMenu.howToPlay')}
              onPress={() => navigation.navigate('Instructions', { fromFirstPlay: false })}
              variant="secondary"
            />
            <GlassButton
              title={t('mainMenu.settings')}
              onPress={() => navigation.navigate('Settings')}
              variant="secondary"
            />
          </View>
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
  },
  buttonContainer: {
    gap: 16,
    alignItems: 'center',
  },
});
