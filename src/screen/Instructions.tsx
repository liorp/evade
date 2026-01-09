import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../const/colors';
import { ChromeText, GlassButton, SynthwaveBackground } from '../ui';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
  HighScores: undefined;
  Instructions: { fromFirstPlay?: boolean };
};

interface InstructionsProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Instructions'>;
  route: { params?: { fromFirstPlay?: boolean } };
}

export const InstructionsScreen: React.FC<InstructionsProps> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const fromFirstPlay = route.params?.fromFirstPlay ?? false;

  const handleContinue = () => {
    if (fromFirstPlay) {
      navigation.replace('Play');
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <SynthwaveBackground showStars showSun={false} showHalos={false} />
      <SafeAreaView style={styles.safeArea}>
        {!fromFirstPlay && (
          <View style={styles.header}>
            <GlassButton
              title="←"
              onPress={() => navigation.goBack()}
              variant="secondary"
              style={styles.backButton}
            />
          </View>
        )}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.titleContainer}>
            <ChromeText size={32} color="cyan" glowPulse={false}>
              {t('instructions.title')}
            </ChromeText>
          </View>

          {/* Goal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('instructions.goal')}</Text>
            <Text style={styles.text}>{t('instructions.goalText')}</Text>
          </View>

          {/* Controls */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('instructions.controlsTitle')}</Text>
            <Text style={styles.text}>{t('instructions.controlsText')}</Text>
          </View>

          {/* Enemies */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('instructions.enemies')}</Text>
            <Text style={[styles.text, { marginBottom: 12 }]}>
              {t('instructions.shapeShowsSpeed')}
            </Text>
            <View style={styles.colorRow}>
              <View style={[styles.enemyShape, styles.circle]} />
              <Text style={styles.colorLabel}>{t('instructions.slow')}</Text>
              <View style={[styles.enemyShape, styles.diamond]} />
              <Text style={styles.colorLabel}>{t('instructions.medium')}</Text>
              <View style={styles.triangleSmall}>
                <View style={styles.triangleIcon} />
              </View>
              <Text style={styles.colorLabel}>{t('instructions.fast')}</Text>
            </View>

            <Text style={[styles.text, { marginTop: 16, marginBottom: 12 }]}>
              {t('instructions.colorShowsLifetime')}
            </Text>
            <View style={styles.colorRow}>
              <View style={[styles.colorSwatch, { backgroundColor: COLORS.neonMagenta }]} />
              <Text style={styles.colorLabel}>{t('instructions.new')}</Text>
              <View style={[styles.colorSwatch, { backgroundColor: '#ff8844' }]} />
              <Text style={styles.colorLabel}>{t('instructions.half')}</Text>
              <View style={[styles.colorSwatch, { backgroundColor: '#ffcc44' }]} />
              <Text style={styles.colorLabel}>{t('instructions.fading')}</Text>
            </View>
          </View>

          {/* Boosters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('instructions.boosters')}</Text>
            <Text style={styles.text}>{t('instructions.boostersText')}</Text>
            <View style={styles.boosterRow}>
              <View style={styles.boosterIcon}>
                <View style={styles.plusH} />
                <View style={styles.plusV} />
              </View>
              <Text style={styles.boosterText}>{t('instructions.bonusPoints')}</Text>
            </View>
            <View style={styles.boosterRow}>
              <View style={styles.boosterIcon}>
                <View style={styles.shieldOuter}>
                  <View style={styles.shieldInner} />
                </View>
              </View>
              <Text style={styles.boosterText}>{t('instructions.shield')}</Text>
            </View>
            <View style={styles.boosterRow}>
              <View style={styles.boosterIcon}>
                <Text style={styles.multiplierIcon}>x3</Text>
              </View>
              <Text style={styles.boosterText}>{t('instructions.multiplier')}</Text>
            </View>
          </View>

          {/* Debuffs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('instructions.debuffs')}</Text>
            <Text style={styles.text}>{t('instructions.debuffsText')}</Text>
            <View style={styles.boosterRow}>
              <View style={styles.debuffIcon}>
                <View style={styles.expandIcon}>
                  <View style={[styles.expandArrow, styles.expandArrowUp]} />
                  <View style={[styles.expandArrow, styles.expandArrowDown]} />
                  <View style={[styles.expandArrow, styles.expandArrowLeft]} />
                  <View style={[styles.expandArrow, styles.expandArrowRight]} />
                </View>
              </View>
              <Text style={styles.boosterText}>{t('instructions.enlarge')}</Text>
            </View>
          </View>

          {/* Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('instructions.tips')}</Text>
            <Text style={styles.text}>
              {'\u2022'} {t('instructions.tip1')}
              {'\n'}
              {'\u2022'} {t('instructions.tip2')}
              {'\n'}
              {'\u2022'} {t('instructions.tip3')}
              {'\n'}
              {'\u2022'} {t('instructions.tip4')}
            </Text>
          </View>

          <GlassButton
            title={fromFirstPlay ? t('instructions.startPlaying') : t('instructions.gotIt')}
            onPress={handleContinue}
            variant="primary"
            style={styles.actionButton}
          />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    minWidth: 44,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'visible',
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.3)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.neonCyan,
    marginBottom: 12,
    letterSpacing: 2,
  },
  text: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  hint: {
    marginTop: 12,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  // Enemy shapes (horizontal)
  enemyShape: {
    width: 28,
    height: 28,
  },
  circle: {
    borderRadius: 14,
    backgroundColor: COLORS.neonMagenta,
    shadowColor: COLORS.neonMagenta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  diamond: {
    backgroundColor: COLORS.neonMagenta,
    borderRadius: 4,
    transform: [{ rotate: '45deg' }, { scale: 0.85 }],
    shadowColor: COLORS.neonMagenta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  triangleSmall: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.neonMagenta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  triangleIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.neonMagenta,
  },
  // Color swatches
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    shadowColor: COLORS.neonMagenta,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  colorLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginRight: 12,
  },
  // Booster icons
  boosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  boosterIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#44ff44',
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#44ff44',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  plusH: {
    position: 'absolute',
    width: 16,
    height: 4,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  plusV: {
    position: 'absolute',
    width: 4,
    height: 16,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  shieldOuter: {
    width: 14,
    height: 18,
    backgroundColor: '#000',
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldInner: {
    width: 8,
    height: 10,
    backgroundColor: '#44ff44',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginTop: -1,
  },
  multiplierIcon: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
  },
  boosterText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
  },
  // Debuff icon
  debuffIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  expandIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandArrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#000',
  },
  expandArrowUp: {
    top: 0,
  },
  expandArrowDown: {
    bottom: 0,
    transform: [{ rotate: '180deg' }],
  },
  expandArrowLeft: {
    left: 0,
    transform: [{ rotate: '-90deg' }],
  },
  expandArrowRight: {
    right: 0,
    transform: [{ rotate: '90deg' }],
  },
  // Action Button
  actionButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
});
