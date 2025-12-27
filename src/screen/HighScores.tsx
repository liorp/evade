import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../const/colors';
import { useHighscoreStore } from '../state/highscoreStore';
import { ChromeText, GlassButton, SynthwaveBackground } from '../ui';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
  HighScores: undefined;
};

interface HighScoresProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'HighScores'>;
}

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const MEDAL_EMOJIS = ['', '🥇', '🥈', '🥉'];

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        borderColor: COLORS.chromeGold,
        rankColor: COLORS.chromeGold,
      };
    case 2:
      return {
        backgroundColor: 'rgba(192, 192, 192, 0.1)',
        borderColor: '#c0c0c0',
        rankColor: '#c0c0c0',
      };
    case 3:
      return {
        backgroundColor: 'rgba(205, 127, 50, 0.1)',
        borderColor: '#cd7f32',
        rankColor: '#cd7f32',
      };
    default:
      return {
        backgroundColor: rank % 2 === 0 ? 'rgba(157, 78, 221, 0.05)' : 'transparent',
        borderColor: COLORS.neonPurple,
        rankColor: COLORS.textMuted,
      };
  }
};

export const HighScoresScreen: React.FC<HighScoresProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { scores, clearScores } = useHighscoreStore();

  const handleClearScores = () => {
    Alert.alert(t('highScores.clearConfirmTitle'), t('highScores.clearConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.clear'), style: 'destructive', onPress: clearScores },
    ]);
  };

  return (
    <View style={styles.container}>
      <SynthwaveBackground
        showStars
        showGrid
        showSun
        showHalos={false}
        sunPosition={0.35}
        gridOpacity={0.4}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <GlassButton
            title={t('common.back')}
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.backButton}
          />
          <ChromeText size={28} color="gold">
            {t('highScores.title')}
          </ChromeText>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.content}>
          {scores.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('highScores.noScoresYet')}</Text>
              <Text style={styles.emptySubtext}>{t('highScores.playToSetScore')}</Text>
            </View>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerText, styles.rankColumn]}>{t('highScores.rank')}</Text>
                <Text style={[styles.headerText, styles.scoreColumn]}>{t('highScores.score')}</Text>
                <Text style={[styles.headerText, styles.dateColumn]}>{t('highScores.date')}</Text>
              </View>
              <ScrollView style={styles.scoreList} showsVerticalScrollIndicator={false}>
                {scores.map((entry, index) => {
                  const rank = index + 1;
                  const rankStyle = getRankStyle(rank);
                  const medal = rank <= 3 ? MEDAL_EMOJIS[rank] : '';

                  return (
                    <View
                      key={`${entry.date}-${index}`}
                      style={[
                        styles.scoreRow,
                        {
                          backgroundColor: rankStyle.backgroundColor,
                          borderBottomColor: rankStyle.borderColor,
                        },
                        rank === 1 && styles.firstPlaceRow,
                      ]}
                    >
                      <Text
                        style={[
                          styles.rankText,
                          styles.rankColumn,
                          { color: rankStyle.rankColor },
                          rank === 1 && styles.firstPlaceRank,
                        ]}
                      >
                        {medal} {rank}
                      </Text>
                      <Text
                        style={[
                          styles.scoreText,
                          styles.scoreColumn,
                          rank === 1 && styles.firstPlaceScore,
                        ]}
                      >
                        {entry.score}
                      </Text>
                      <Text style={[styles.dateText, styles.dateColumn]}>
                        {formatDate(entry.date)}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </>
          )}
        </View>

        {scores.length > 0 && (
          <View style={styles.footer}>
            <GlassButton
              title={t('highScores.clearAllScores')}
              onPress={handleClearScores}
              variant="danger"
            />
          </View>
        )}
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
    minWidth: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerSpacer: {
    width: 100,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neonPurple,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.neonPurple,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreList: {
    flex: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderRadius: 4,
    marginBottom: 4,
  },
  firstPlaceRow: {
    shadowColor: COLORS.chromeGold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  rankColumn: {
    width: 60,
  },
  scoreColumn: {
    flex: 1,
  },
  dateColumn: {
    width: 140,
    textAlign: 'right',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '600',
  },
  firstPlaceRank: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.chromeGold,
  },
  firstPlaceScore: {
    fontSize: 22,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
});
