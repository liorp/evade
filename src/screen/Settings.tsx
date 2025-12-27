import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { trackSettingChanged } from '../analytics';
import { COLORS } from '../const/colors';
import { IAP_PRICES } from '../iap/constants';
import { iapManager } from '../iap/iapManager';
import { useAdStore } from '../state/adStore';
import { useCosmeticStore } from '../state/cosmeticStore';
import { useHighscoreStore } from '../state/highscoreStore';
import { usePurchaseStore } from '../state/purchaseStore';
import { useSettingsStore } from '../state/settingsStore';
import { useShardStore } from '../state/shardStore';
import { ChromeText, GlassButton, NeonToggle, SynthwaveBackground } from '../ui';

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
    hapticsEnabled,
    setHandedness,
    setMusicEnabled,
    setSfxEnabled,
    setHapticsEnabled,
    reset: resetSettings,
  } = useSettingsStore();
  const { adsRemoved, setAdsRemoved } = usePurchaseStore();
  const { setAdsRemoved: setAdStoreAdsRemoved } = useAdStore();
  const { reset: resetCosmetics } = useCosmeticStore();
  const { clearScores } = useHighscoreStore();
  const { reset: resetShards } = useShardStore();

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

  const handleHapticsChange = (value: boolean) => {
    trackSettingChanged({
      setting: 'haptics_enabled',
      old_value: String(hapticsEnabled),
      new_value: String(value),
    });
    setHapticsEnabled(value);
  };

  const handleHandednessChange = (value: 'left' | 'right') => {
    trackSettingChanged({
      setting: 'handedness',
      old_value: handedness,
      new_value: value,
    });
    setHandedness(value);
  };

  const handleResetAll = () => {
    Alert.alert(t('settings.resetConfirmTitle'), t('settings.resetConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.resetAll'),
        style: 'destructive',
        onPress: () => {
          resetSettings();
          resetCosmetics();
          clearScores();
          resetShards();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <SynthwaveBackground showStars={false} showSun={false} showHalos={false} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <GlassButton
            title={t('common.back')}
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.backButton}
          />
          <ChromeText size={24} color="gold" glowPulse={false}>
            {t('settings.title')}
          </ChromeText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Audio Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('settings.audio')}</Text>
            <View style={styles.sectionLine} />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('settings.backgroundMusic')}</Text>
            <NeonToggle value={musicEnabled} onValueChange={handleMusicChange} />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('settings.soundEffects')}</Text>
            <NeonToggle value={sfxEnabled} onValueChange={handleSfxChange} />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('settings.vibration')}</Text>
            <NeonToggle value={hapticsEnabled} onValueChange={handleHapticsChange} />
          </View>

          {/* Controls Section */}
          <View style={[styles.sectionHeader, styles.sectionMargin]}>
            <Text style={styles.sectionTitle}>{t('settings.controls')}</Text>
            <View style={styles.sectionLine} />
          </View>
          <Text style={styles.settingLabel}>{t('settings.handedness')}</Text>
          <View style={styles.segmentedControl}>
            <Pressable
              style={[styles.segment, handedness === 'left' && styles.segmentActive]}
              onPress={() => handleHandednessChange('left')}
            >
              <Text style={[styles.segmentText, handedness === 'left' && styles.segmentTextActive]}>
                {t('settings.left')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.segment, handedness === 'right' && styles.segmentActive]}
              onPress={() => handleHandednessChange('right')}
            >
              <Text
                style={[styles.segmentText, handedness === 'right' && styles.segmentTextActive]}
              >
                {t('settings.right')}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.helpText}>{t('settings.handednessHelp')}</Text>

          {/* Purchases Section */}
          <View style={[styles.sectionHeader, styles.sectionMargin]}>
            <Text style={styles.sectionTitle}>{t('settings.purchases', 'Purchases')}</Text>
            <View style={styles.sectionLine} />
          </View>

          {!adsRemoved && (
            <View style={styles.purchaseButtonContainer}>
              <GlassButton
                title={`${t('settings.removeAds', 'Remove Ads')} - ${IAP_PRICES.REMOVE_ADS}`}
                onPress={handlePurchaseRemoveAds}
                variant="primary"
              />
            </View>
          )}

          {adsRemoved && (
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{t('settings.adsRemoved', 'Ads Removed')}</Text>
              <Text style={[styles.settingValue, styles.checkmark]}>{'\u2713'}</Text>
            </View>
          )}

          <View style={styles.purchaseButtonContainer}>
            <GlassButton
              title={t('settings.restorePurchases', 'Restore Purchases')}
              onPress={handleRestorePurchases}
              variant="secondary"
            />
          </View>

          <View style={styles.purchaseButtonContainer}>
            <GlassButton title={t('settings.resetAll')} onPress={handleResetAll} variant="danger" />
          </View>
        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    overflow: 'visible',
  },
  backButton: {
    minWidth: 80,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  headerSpacer: {
    width: 80,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neonPurple,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionLine: {
    height: 1,
    backgroundColor: 'rgba(157, 78, 221, 0.3)',
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
    borderBottomColor: 'rgba(157, 78, 221, 0.2)',
  },
  settingLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  settingValue: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  checkmark: {
    color: COLORS.neonCyan,
    fontSize: 20,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
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
    backgroundColor: COLORS.neonCyan,
  },
  segmentText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  segmentTextActive: {
    color: COLORS.textPrimary,
  },
  helpText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 12,
    fontStyle: 'italic',
  },
  purchaseButtonContainer: {
    marginTop: 16,
  },
});
