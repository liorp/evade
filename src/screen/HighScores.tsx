import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../const/colors';
import { useHighscoreStore } from '../state/highscoreStore';

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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{t('common.back')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('highScores.title')}</Text>
        <View style={styles.backButton} />
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
              {scores.map((entry, index) => (
                <View key={`${entry.date}-${index}`} style={styles.scoreRow}>
                  <Text style={[styles.rankText, styles.rankColumn]}>{index + 1}</Text>
                  <Text style={[styles.scoreText, styles.scoreColumn]}>{entry.score}</Text>
                  <Text style={[styles.dateText, styles.dateColumn]}>{formatDate(entry.date)}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </View>

      {scores.length > 0 && (
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.clearButton, pressed && styles.buttonPressed]}
            onPress={handleClearScores}
          >
            <Text style={styles.clearButtonText}>{t('highScores.clearAllScores')}</Text>
          </Pressable>
        </View>
      )}
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
    color: COLORS.text,
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
    borderBottomColor: '#333',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreList: {
    flex: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  rankColumn: {
    width: 40,
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
    color: COLORS.textMuted,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.player,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  clearButton: {
    backgroundColor: '#331111',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff3366',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff3366',
  },
});
