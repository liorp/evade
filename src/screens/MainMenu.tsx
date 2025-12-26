import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import { audioManager } from '../audio/audioManager';
import { useSettingsStore } from '../state/settingsStore';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
};

interface MainMenuProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainMenu'>;
}

export const MainMenuScreen: React.FC<MainMenuProps> = ({ navigation }) => {
  const { musicEnabled } = useSettingsStore();

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>EVADE</Text>
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={() => navigation.navigate('Play')}
          >
            <Text style={styles.buttonText}>Play</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.buttonText}>Settings</Text>
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
  title: {
    fontSize: 72,
    fontWeight: 'bold',
    color: COLORS.player,
    marginBottom: 80,
    textShadowColor: COLORS.playerGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
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
