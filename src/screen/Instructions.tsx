import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../const/colors';

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
    <SafeAreaView style={styles.container}>
      {!fromFirstPlay && (
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>{t('common.back')}</Text>
          </Pressable>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{t('instructions.title')}</Text>

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
          <Text style={[styles.text, { marginBottom: 12 }]}>{t('instructions.shapeShowsSpeed')}</Text>
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
            <View style={[styles.colorSwatch, { backgroundColor: '#ff4444' }]} />
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

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>
            {fromFirstPlay ? t('instructions.startPlaying') : t('instructions.gotIt')}
          </Text>
        </Pressable>
      </ScrollView>
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
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.player,
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.score,
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
    backgroundColor: '#ff4444',
  },
  diamond: {
    backgroundColor: '#ff4444',
    borderRadius: 4,
    transform: [{ rotate: '45deg' }, { scale: 0.85 }],
  },
  triangleSmall: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triangleIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderBottomWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ff4444',
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
  // Button
  button: {
    backgroundColor: COLORS.menuAccent,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});
