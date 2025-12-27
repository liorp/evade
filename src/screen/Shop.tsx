import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../const/colors';
import {
  CosmeticCategory,
  CosmeticItem,
  getCosmeticItems,
} from '../cosmetics/constants';
import { useShardStore } from '../state/shardStore';
import { useCosmeticStore } from '../state/cosmeticStore';
import { adManager } from '../ads/adManager';
import { SHARD_PACKS } from '../iap/constants';
import { iapManager } from '../iap/iapManager';
import {
  trackShopOpened,
  trackShopCategoryViewed,
  trackItemPreviewed,
  trackItemPurchased,
} from '../analytics';
import { SynthwaveBackground, ChromeText, GlassButton } from '../ui';

type RootStackParamList = {
  MainMenu: undefined;
  Play: undefined;
  Settings: undefined;
  Shop: undefined;
};

interface ShopScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Shop'>;
}

const CATEGORIES: { key: CosmeticCategory; label: string }[] = [
  { key: 'playerColor', label: 'Colors' },
  { key: 'playerShape', label: 'Shapes' },
  { key: 'playerTrail', label: 'Trails' },
  { key: 'playerGlow', label: 'Glow' },
  { key: 'enemyTheme', label: 'Enemies' },
  { key: 'backgroundTheme', label: 'Background' },
];

export const ShopScreen: React.FC<ShopScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<CosmeticCategory>('playerColor');
  const { balance, spendShards, canWatchRewardedAd, recordRewardedAd, addShards } = useShardStore();
  const { isOwned, purchaseItem, equipItem, equipped } = useCosmeticStore();

  useEffect(() => {
    trackShopOpened();
  }, []);

  const items = getCosmeticItems(selectedCategory);

  const handlePurchase = (item: CosmeticItem) => {
    if (item.price === 0) return; // Free items don't need purchase

    trackItemPreviewed({
      item_id: item.id,
      category: item.category,
      price: item.price,
    });

    if (balance < item.price) {
      Alert.alert(
        t('shop.insufficientShards', 'Not Enough Shards'),
        t('shop.needMoreShards', 'You need {{amount}} more shards.', {
          amount: item.price - balance,
        })
      );
      return;
    }

    Alert.alert(
      t('shop.confirmPurchase', 'Confirm Purchase'),
      t('shop.purchaseMessage', 'Buy {{name}} for {{price}} shards?', {
        name: item.name,
        price: item.price,
      }),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('shop.buy', 'Buy'),
          onPress: () => {
            if (spendShards(item.price)) {
              purchaseItem(item.category, item.id);
              equipItem(item.category, item.id);
              trackItemPurchased({
                item_id: item.id,
                category: item.category,
                price: item.price,
              });
            }
          },
        },
      ]
    );
  };

  const handleEquip = (item: CosmeticItem) => {
    equipItem(item.category, item.id);
  };

  const handleWatchAdForShards = async () => {
    if (!canWatchRewardedAd()) return;

    const success = await adManager.showRewarded(() => {
      recordRewardedAd();
    }, 'shards');

    if (!success) {
      Alert.alert(t('common.error', 'Error'), t('shop.adFailed', 'Ad not available'));
    }
  };

  const handleBuyShardPack = async (pack: (typeof SHARD_PACKS)[number]) => {
    const success = await iapManager.purchaseShards(pack.productId as string);
    if (success) {
      addShards(pack.shards, 'purchase');
    }
  };

  const isItemEquipped = (item: CosmeticItem): boolean => {
    return equipped[item.category] === item.id;
  };

  const renderItem = (item: CosmeticItem) => {
    const owned = isOwned(item.category, item.id);
    const itemEquipped = isItemEquipped(item);
    const isLocked = !owned && item.price > 0;

    return (
      <Pressable
        key={item.id}
        style={[
          styles.itemCard,
          itemEquipped && styles.itemCardEquipped,
          owned && !itemEquipped && styles.itemCardOwned,
          isLocked && styles.itemCardLocked,
        ]}
        onPress={() => (owned ? handleEquip(item) : handlePurchase(item))}
      >
        {/* Preview */}
        <View style={styles.previewContainer}>
          {item.preview ? (
            <View style={[styles.colorPreview, { backgroundColor: item.preview }]} />
          ) : (
            <View style={styles.placeholderPreview}>
              <Text style={styles.placeholderText}>{item.name[0]}</Text>
            </View>
          )}
        </View>

        {/* Info */}
        <Text style={styles.itemName}>{item.name}</Text>

        {/* Status */}
        {itemEquipped ? (
          <View style={styles.equippedBadge}>
            <Text style={styles.equippedText}>{t('shop.equipped', 'Equipped')}</Text>
          </View>
        ) : owned ? (
          <Text style={styles.ownedText}>{t('shop.owned', 'Owned')}</Text>
        ) : item.price === 0 ? (
          <Text style={styles.freeText}>{t('shop.free', 'Free')}</Text>
        ) : (
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>{item.price}</Text>
            <Text style={styles.shardIcon}>💎</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <SynthwaveBackground
        showStars
        showGrid
        showSun
        showHalos
        sunPosition={0.5}
        gridOpacity={0.4}
        halosVariant="centered"
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <GlassButton
            title={t('common.back', 'Back')}
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={styles.backButton}
          />
          <ChromeText size={24} color="gold" glowPulse={false}>
            {t('shop.title', 'Shop')}
          </ChromeText>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceText}>{balance}</Text>
            <Text style={styles.shardIcon}>💎</Text>
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsContainer}
            contentContainerStyle={styles.tabsContent}
          >
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.key}
                style={[styles.tab, selectedCategory === cat.key && styles.tabActive]}
                onPress={() => {
                  setSelectedCategory(cat.key);
                  trackShopCategoryViewed({ category: cat.key });
                }}
              >
                <Text
                  style={[styles.tabText, selectedCategory === cat.key && styles.tabTextActive]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Items Grid */}
        <ScrollView style={styles.itemsContainer} contentContainerStyle={styles.itemsGrid}>
          {items.map(renderItem)}
        </ScrollView>

        {/* Earn & Buy Shards Section */}
        <View style={styles.earnSection}>
          {/* Watch Ad */}
          {canWatchRewardedAd() ? (
            <GlassButton
              title={t('shop.watchAd', 'Watch Ad (+10 💎)')}
              onPress={handleWatchAdForShards}
              variant="secondary"
              style={styles.earnButton}
            />
          ) : null}

          {/* Buy Shard Packs - Only show on native platforms */}
          {iapManager.isAvailable() ? (
            <View style={styles.packsContainer}>
              {SHARD_PACKS.map((pack) => (
                <Pressable
                  key={pack.productId}
                  style={styles.packCard}
                  onPress={() => handleBuyShardPack(pack)}
                >
                  <Text style={styles.packShards}>{pack.shards} 💎</Text>
                  {'bonus' in pack && <Text style={styles.packBonus}>{pack.bonus}</Text>}
                  <Text style={styles.packPrice}>{pack.price}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.webNotice}>
              <Text style={styles.webNoticeText}>
                {t('shop.purchasesOnMobile', 'Purchases available on iOS/Android app')}
              </Text>
            </View>
          )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    minWidth: 80,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.chromeGold,
  },
  balanceText: {
    color: COLORS.chromeGold,
    fontSize: 18,
    fontWeight: 'bold',
  },
  shardIcon: {
    fontSize: 16,
  },
  tabsWrapper: {
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
  },
  tabsContainer: {
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: COLORS.neonCyan,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  tabTextActive: {
    color: COLORS.backgroundDeep,
    fontWeight: 'bold',
  },
  itemsContainer: {
    flex: 1,
    marginTop: 16,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  itemCard: {
    width: '30%',
    aspectRatio: 0.85,
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemCardEquipped: {
    borderWidth: 2,
    borderColor: COLORS.neonCyan,
    shadowColor: COLORS.neonCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  itemCardOwned: {
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.4)',
  },
  itemCardLocked: {
    opacity: 0.7,
  },
  previewContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  placeholderPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(42, 42, 78, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemName: {
    color: COLORS.textPrimary,
    fontSize: 12,
    textAlign: 'center',
  },
  equippedBadge: {
    backgroundColor: 'rgba(0, 245, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  equippedText: {
    color: COLORS.neonCyan,
    fontSize: 10,
    fontWeight: 'bold',
  },
  ownedText: {
    color: COLORS.neonPurple,
    fontSize: 10,
  },
  freeText: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  priceText: {
    color: COLORS.chromeGold,
    fontSize: 12,
    fontWeight: 'bold',
  },
  earnSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(74, 26, 107, 0.5)',
  },
  earnButton: {
    marginBottom: 16,
    minWidth: 0,
    width: '100%',
  },
  packsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  packCard: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.4)',
  },
  packShards: {
    color: COLORS.chromeGold,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  packBonus: {
    color: COLORS.neonCyan,
    fontSize: 10,
    marginBottom: 4,
  },
  packPrice: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  webNotice: {
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(74, 26, 107, 0.5)',
  },
  webNoticeText: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});
