import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { HexFrame, ChromeText, GlassButton } from '../ui';
import { COLORS } from '../const/colors';

interface GameOverModalProps {
  visible: boolean;
  score: number;
  isNewBest: boolean;
  shardsEarned: number;
  onRetry: () => void;
  onMenu: () => void;
}

const MODAL_WIDTH = 300;
const MODAL_HEIGHT = 380;

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  score,
  isNewBest,
  shardsEarned,
  onRetry,
  onMenu,
}) => {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <HexFrame
        width={MODAL_WIDTH}
        height={MODAL_HEIGHT}
        color="magenta"
        glowPulse
      >
        <View style={styles.content}>
          <ChromeText size={32} color="magenta" glowPulse={false}>
            {t('play.gameOver')}
          </ChromeText>

          {isNewBest && (
            <View style={styles.newBestContainer}>
              <ChromeText size={24} color="gold" glowPulse>
                NEW BEST!
              </ChromeText>
            </View>
          )}

          <View style={styles.scoreContainer}>
            <ChromeText size={48} color="gold" glowPulse={false}>
              {score.toString()}
            </ChromeText>
          </View>

          {shardsEarned > 0 && (
            <Text style={styles.shardsText}>+{shardsEarned} 💎</Text>
          )}

          <View style={styles.buttonsContainer}>
            <GlassButton
              title={t('common.retry')}
              onPress={onRetry}
              variant="primary"
              style={styles.button}
            />
            <GlassButton
              title={t('common.menu')}
              onPress={onMenu}
              variant="secondary"
              style={styles.button}
            />
          </View>
        </View>
      </HexFrame>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.pauseOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  newBestContainer: {
    marginTop: 4,
  },
  scoreContainer: {
    marginVertical: 12,
  },
  shardsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.chromeGold,
    marginBottom: 12,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  button: {
    minWidth: 180,
  },
});
