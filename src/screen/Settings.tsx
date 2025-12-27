import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../const/colors';
import { useSettingsStore } from '../state/settingsStore';
import { usePurchaseStore } from '../state/purchaseStore';
import { useAdStore } from '../state/adStore';
import { iapManager } from '../iap/iapManager';
import { IAP_PRICES } from '../const/iap';
import { trackSettingChanged } from '../analytics';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
};

interface SettingsProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
}

export const SettingsScreen: React.FC<SettingsProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const {
    handedness,
    musicEnabled,
    sfxEnabled,
    setHandedness,
    setMusicEnabled,
    setSfxEnabled,
  } = useSettingsStore();
  const { adsRemoved, setAdsRemoved } = usePurchaseStore();
  const { setAdsRemoved: setAdStoreAdsRemoved } = useAdStore();

  const handlePurchaseRemoveAds = async () => {
    const success = await iapManager.purchaseRemoveAds();
    if (success) {
      setAdsRemoved(true);
      setAdStoreAdsRemoved(true);
    }
  };

  const handleRestorePurchases = async () => {
    const hasRemoveAds = await iapManager.restorePurchases();
    if (hasRemoveAds) {
      setAdsRemoved(true);
      setAdStoreAdsRemoved(true);
    }
  };

  const handleMusicChange = (value: boolean) => {
    trackSettingChanged({
      setting: 'music_enabled',
      old_value: String(musicEnabled),
      new_value: String(value),
    });
    setMusicEnabled(value);
  };

  const handleSfxChange = (value: boolean) => {
    trackSettingChanged({
      setting: 'sfx_enabled',
      old_value: String(sfxEnabled),
      new_value: String(value),
    });
    setSfxEnabled(value);
  };

  const handleHandednessChange = (value: 'left' | 'right') => {
    trackSettingChanged({
      setting: 'handedness',
      old_value: handedness,
      new_value: value,
    });
    setHandedness(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{t('common.back')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('settings.title')}</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        {/* Audio Section */}
        <Text style={styles.sectionTitle}>{t('settings.audio')}</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.backgroundMusic')}</Text>
          <Switch
            value={musicEnabled}
            onValueChange={handleMusicChange}
            trackColor={{ false: '#333', true: COLORS.menuAccent }}
            thumbColor={musicEnabled ? COLORS.player : '#888'}
          />
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>{t('settings.soundEffects')}</Text>
          <Switch
            value={sfxEnabled}
            onValueChange={handleSfxChange}
            trackColor={{ false: '#333', true: COLORS.menuAccent }}
            thumbColor={sfxEnabled ? COLORS.player : '#888'}
          />
        </View>

        {/* Controls Section */}
        <Text style={[styles.sectionTitle, styles.sectionMargin]}>{t('settings.controls')}</Text>
        <Text style={styles.settingLabel}>{t('settings.handedness')}</Text>
        <View style={styles.segmentedControl}>
          <Pressable
            style={[
              styles.segment,
              handedness === 'left' && styles.segmentActive,
            ]}
            onPress={() => handleHandednessChange('left')}
          >
            <Text
              style={[
                styles.segmentText,
                handedness === 'left' && styles.segmentTextActive,
              ]}
            >
              {t('settings.left')}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.segment,
              handedness === 'right' && styles.segmentActive,
            ]}
            onPress={() => handleHandednessChange('right')}
          >
            <Text
              style={[
                styles.segmentText,
                handedness === 'right' && styles.segmentTextActive,
              ]}
            >
              {t('settings.right')}
            </Text>
          </Pressable>
        </View>
        <Text style={styles.helpText}>{t('settings.handednessHelp')}</Text>

        {/* Purchases Section */}
        <Text style={[styles.sectionTitle, styles.sectionMargin]}>{t('settings.purchases', 'Purchases')}</Text>

        {!adsRemoved && (
          <Pressable style={styles.settingRow} onPress={handlePurchaseRemoveAds}>
            <Text style={styles.settingLabel}>{t('settings.removeAds', 'Remove Ads')}</Text>
            <Text style={styles.settingValue}>{IAP_PRICES.REMOVE_ADS}</Text>
          </Pressable>
        )}

        {adsRemoved && (
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('settings.adsRemoved', 'Ads Removed')}</Text>
            <Text style={[styles.settingValue, { color: '#44bb44' }]}>{'\u2713'}</Text>
          </View>
        )}

        <Pressable style={styles.settingRow} onPress={handleRestorePurchases}>
          <Text style={styles.settingLabel}>{t('settings.restorePurchases', 'Restore Purchases')}</Text>
        </Pressable>
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
  settingValue: {
    fontSize: 16,
    color: COLORS.textMuted,
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
