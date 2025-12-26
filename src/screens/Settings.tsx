import React from 'react';
import { StyleSheet, View, Text, Pressable, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';
import { useSettingsStore } from '../state/settingsStore';
import { Handedness } from '../game/types';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
};

interface SettingsProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
}

export const SettingsScreen: React.FC<SettingsProps> = ({ navigation }) => {
  const {
    handedness,
    musicEnabled,
    sfxEnabled,
    setHandedness,
    setMusicEnabled,
    setSfxEnabled,
  } = useSettingsStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        {/* Audio Section */}
        <Text style={styles.sectionTitle}>Audio</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Background Music</Text>
          <Switch
            value={musicEnabled}
            onValueChange={setMusicEnabled}
            trackColor={{ false: '#333', true: COLORS.menuAccent }}
            thumbColor={musicEnabled ? COLORS.player : '#888'}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sound Effects</Text>
          <Switch
            value={sfxEnabled}
            onValueChange={setSfxEnabled}
            trackColor={{ false: '#333', true: COLORS.menuAccent }}
            thumbColor={sfxEnabled ? COLORS.player : '#888'}
          />
        </View>

        {/* Controls Section */}
        <Text style={[styles.sectionTitle, styles.sectionMargin]}>Controls</Text>
        <Text style={styles.settingLabel}>Handedness</Text>
        <View style={styles.segmentedControl}>
          <Pressable
            style={[
              styles.segment,
              handedness === 'left' && styles.segmentActive,
            ]}
            onPress={() => setHandedness('left')}
          >
            <Text
              style={[
                styles.segmentText,
                handedness === 'left' && styles.segmentTextActive,
              ]}
            >
              Left
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.segment,
              handedness === 'right' && styles.segmentActive,
            ]}
            onPress={() => setHandedness('right')}
          >
            <Text
              style={[
                styles.segmentText,
                handedness === 'right' && styles.segmentTextActive,
              ]}
            >
              Right
            </Text>
          </Pressable>
        </View>
        <Text style={styles.helpText}>
          Enemies won't spawn where your palm blocks the screen
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 80,
  },
  backText: {
    fontSize: 16,
    color: COLORS.menuAccent,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  sectionMargin: {
    marginTop: 32,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 4,
    marginTop: 12,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: COLORS.menuAccent,
  },
  segmentText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: COLORS.text,
  },
  helpText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
