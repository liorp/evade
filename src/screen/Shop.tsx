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
} from '../const/cosmetics';
import { useShardStore } from '../state/shardStore';
import { useCosmeticStore } from '../state/cosmeticStore';
import { adManager } from '../ads/adManager';
import { SHARD_PACKS } from '../const/iap';
import { iapManager } from '../iap/iapManager';
import {
  trackShopOpened,
  trackShopCategoryViewed,
  trackItemPreviewed,
  trackItemPurchased,
} from '../analytics';

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

    return (
      <Pressable
        key={item.id}
        style={[styles.itemCard, itemEquipped && styles.itemCardEquipped]}
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
          <Text style={styles.equippedText}>{t('shop.equipped', 'Equipped')}</Text>
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{t('common.back', 'Back')}</Text>
        </Pressable>
        <Text style={styles.title}>{t('shop.title', 'Shop')}</Text>
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceText}>{balance}</Text>
          <Text style={styles.shardIcon}>💎</Text>
        </View>
      </View>

      {/* Category Tabs */}
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

      {/* Items Grid */}
      <ScrollView style={styles.itemsContainer} contentContainerStyle={styles.itemsGrid}>
        {items.map(renderItem)}
      </ScrollView>

      {/* Earn & Buy Shards Section */}
      <View style={styles.earnSection}>
        {/* Watch Ad */}
        {canWatchRewardedAd() ? (
          <Pressable style={styles.earnButton} onPress={handleWatchAdForShards}>
            <Text style={styles.earnButtonText}>{t('shop.watchAd', 'Watch Ad (+10 💎)')}</Text>
          </Pressable>
        ) : null}

        {/* Buy Shard Packs */}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    color: COLORS.menuAccent,
    fontSize: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  balanceText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  shardIcon: {
    fontSize: 16,
  },
  tabsContainer: {
    maxHeight: 50,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
  },
  tabActive: {
    backgroundColor: COLORS.menuAccent,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 14,
  },
  tabTextActive: {
    color: COLORS.text,
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
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemCardEquipped: {
    borderWidth: 2,
    borderColor: COLORS.menuAccent,
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
    backgroundColor: '#2a2a4e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemName: {
    color: COLORS.text,
    fontSize: 12,
    textAlign: 'center',
  },
  equippedText: {
    color: COLORS.menuAccent,
    fontSize: 10,
    fontWeight: 'bold',
  },
  ownedText: {
    color: '#44bb44',
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
    color: '#ffd700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  earnSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a4e',
  },
  earnButton: {
    backgroundColor: '#44bb44',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  earnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  packsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  packCard: {
    flex: 1,
    backgroundColor: '#2a2a4e',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  packShards: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  packBonus: {
    color: '#44bb44',
    fontSize: 10,
    marginBottom: 4,
  },
  packPrice: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
