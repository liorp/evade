import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../const/colors';
import { useSettingsStore } from '../state/settingsStore';
import { usePurchaseStore } from '../state/purchaseStore';
import { useAdStore } from '../state/adStore';
import { iapManager } from '../iap/iapManager';
import { IAP_PRICES } from '../iap/constants';
import { trackSettingChanged } from '../analytics';
import { SynthwaveBackground, ChromeText, GlassButton, NeonToggle } from '../ui';

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
    <View style={styles.container}>
      <SynthwaveBackground
        showStars={false}
        showGrid
        showSun={false}
        showHalos={false}
        gridOpacity={0.3}
        gridAnimated={false}
      />
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

        <View style={styles.content}>
          {/* Audio Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('settings.audio')}</Text>
            <View style={styles.sectionLine} />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('settings.backgroundMusic')}</Text>
            <NeonToggle
              value={musicEnabled}
              onValueChange={handleMusicChange}
            />
          </View>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('settings.soundEffects')}</Text>
            <NeonToggle
              value={sfxEnabled}
              onValueChange={handleSfxChange}
            />
          </View>

          {/* Controls Section */}
          <View style={[styles.sectionHeader, styles.sectionMargin]}>
            <Text style={styles.sectionTitle}>{t('settings.controls')}</Text>
            <View style={styles.sectionLine} />
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    minWidth: 80,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  headerSpacer: {
    width: 80,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
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
    alignItems: 'center',
  },
});
