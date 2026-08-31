import { useState, useEffect, useRef, useCallback } from 'react';
import { ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { useAnimals } from '@/src/hooks/useAnimals';
import { spacing, radius, fontSize, fontWeight, shadows } from '@/constants/Tokens';
import { impactLight, impactMedium, selectionChanged } from '@/src/services/haptics';
import { StatCardSkeleton, RowSkeleton } from '@/src/components/Skeleton';
import { OfflineBanner } from '@/src/components/OfflineBanner';
import { HealthAlerts } from '@/src/components/HealthAlerts';
import { LiveIndicator } from '@/src/components/LiveIndicator';
import { exportCSV, exportJSON, exportPDF } from '@/src/services/export';
import { useI18n } from '@/src/i18n';
import { connectSocket, getSocket } from '@/src/services/socket';
import palette from '@/constants/Colors';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import Animated, { FadeInDown } from 'react-native-reanimated';

const STAT_CONFIG = [
  { key: 'totalAnimals', label: 'Total', icon: 'layers-outline' as const },
  { key: 'healthyCount', label: 'Healthy', icon: 'heart-outline' as const },
  { key: 'sickCount', label: 'Sick', icon: 'medkit-outline' as const },
  { key: 'underTreatmentCount', label: 'Treatment', icon: 'pulse-outline' as const },
  { key: 'recoveredCount', label: 'Recovered', icon: 'checkmark-circle-outline' as const },
  { key: 'counties', label: 'Counties', icon: 'location-outline' as const },
] as const;

const EXPORT_OPTIONS = [
  { key: 'csv', label: 'CSV', icon: 'document-text-outline' as const, color: palette.light.tint },
  { key: 'pdf', label: 'PDF', icon: 'document-outline' as const, color: palette.light.destructive },
  { key: 'json', label: 'KALRO', extension: 'json', icon: 'cloud-upload-outline' as const, color: palette.light.info },
] as const;

export default function HomeScreen() {
  const { animals, stats, loading, error, refresh } = useAnimals();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t, lang, setLang } = useI18n();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  const handleRefresh = useCallback(() => {
    impactMedium();
    void refresh();
  }, [refresh]);

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      const s = await connectSocket();
      if (!mounted) return;

      s.emit('join', 'stats');
      s.emit('join', 'animal-events');

      s.on('stats:updated', () => { void refreshRef.current(); });
      s.on('animal:event', () => { void refreshRef.current(); });
    };

    void setup();

    return () => {
      mounted = false;
      getSocket().then((s) => {
        s.emit('leave', 'stats');
        s.emit('leave', 'animal-events');
        s.off('stats:updated');
        s.off('animal:event');
      });
    };
  }, []);

  const handleExport = (format: string) => {
    setShowExportMenu(false);
    impactLight();
    if (format === 'csv') exportCSV(animals);
    else if (format === 'pdf') exportPDF(animals);
    else if (format === 'json') exportJSON(animals);
  };

  const toggleLang = () => {
    impactLight();
    setLang(lang === 'en' ? 'sw' : 'en');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={handleRefresh}
          tintColor={colors.tint}
          colors={[colors.tint]}
        />
      }
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>{t('home')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('herdOverview')}
          </Text>
        </View>
        <LiveIndicator />
        <Pressable onPress={toggleLang} style={[styles.langBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]} hitSlop={8} accessibilityLabel={lang === 'en' ? 'Switch to Kiswahili' : 'Switch to English'}>
          <Text style={[styles.langText, { color: colors.tint }]}>{lang === 'en' ? 'SW' : 'EN'}</Text>
        </Pressable>
        <View style={styles.exportWrap}>
          <Pressable
            onPress={() => { impactLight(); setShowExportMenu(!showExportMenu); }}
            style={({ pressed }) => [styles.exportBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}
            accessibilityLabel="Export data"
          >
            <Ionicons name="download-outline" size={18} color={colors.tint} />
          </Pressable>
          {showExportMenu && (
            <View style={[styles.exportMenu, { backgroundColor: colors.card, borderColor: colors.cardBorder, ...shadows.md(colors.shadowColor, colors.shadowOpacity) }]}>
              {EXPORT_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.key}
                  onPress={() => handleExport(opt.key)}
                  style={({ pressed }) => [styles.exportOption, { opacity: pressed ? 0.7 : 1 }]}
                  accessibilityLabel={`Export as ${opt.label}`}
                >
                  <Ionicons name={opt.icon} size={16} color={opt.color} />
                  <Text style={[styles.exportLabel, { color: colors.text }]}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      {error && (
        <Pressable onPress={() => void refresh()}>
          <OfflineBanner />
        </Pressable>
      )}

      <HealthAlerts animals={animals} />

      {loading && (!stats || Object.keys(stats).length === 0) ? (
        <View style={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <StatCardSkeleton key={i} colors={colors} />
          ))}
        </View>
      ) : (
        <View style={styles.grid}>
          {STAT_CONFIG.map(({ key, label, icon }, index) => {
            const value = stats ? (stats as unknown as Record<string, number>)[key] ?? 0 : 0;
            return (
              <Animated.View
                key={key}
                entering={FadeInDown.delay(index * 50).springify()}
              >
                <Pressable
                  onPress={() => {
                    impactLight();
                    selectionChanged();
                  }}
                  style={({ pressed }) => [
                    styles.card,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                      opacity: pressed ? 0.92 : 1,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    },
                    shadows.sm(colors.shadowColor, colors.shadowOpacity),
                  ]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: colors.tintLight }]}>
                    <Ionicons name={icon} size={20} color={colors.tint} />
                  </View>
                  <Text style={[styles.cardValue, { color: colors.text }]}>{value}</Text>
                  <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
                    {t(key as 'totalAnimals' | 'healthy' | 'sick' | 'underTreatment' | 'recovered' | 'counties')}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.listTitle, { color: colors.text }]}>
          {t('recentAnimals')}
        </Text>
        <Text style={[styles.listCount, { color: colors.textSecondary }]}>
          {animals.length} {t('total')}
        </Text>
      </View>

      {loading && animals.length === 0 ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3].map((i) => (
            <RowSkeleton key={i} colors={colors} />
          ))}
        </View>
      ) : animals.length === 0 ? (
        <EmptyState
          icon="paw-outline"
          title={t('noAnimals')}
          description={t('addFirstAnimal')}
        />
      ) : animals.slice(0, 5).map((animal, index) => (
        <Animated.View
          key={animal.id}
          entering={FadeInDown.delay((index + 6) * 40).springify()}
        >
          <Pressable
            onPress={() => impactLight()}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                opacity: pressed ? 0.95 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View style={[styles.rowIcon, { backgroundColor: colors.tintLight }]}>
              <Ionicons name="paw-outline" size={16} color={colors.tint} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowName, { color: colors.text }]}>{animal.name}</Text>
              <Text style={[styles.rowMeta, { color: colors.textSecondary }]}>
                {animal.type} · {animal.health} · {animal.county}
              </Text>
            </View>
            <Badge
              label={animal.health}
              variant={animal.health === 'Healthy' ? 'success' : animal.health === 'Sick' ? 'destructive' : 'warning'}
              size="sm"
            />
          </Pressable>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxxl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  title: { fontSize: fontSize.hero, fontWeight: fontWeight.bold, letterSpacing: -0.5 },
  subtitle: { fontSize: fontSize.md, marginTop: spacing.xs, lineHeight: 22 },
  langBtn: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm,
  },
  langText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  exportWrap: { position: 'relative' },
  exportBtn: { width: 44, height: 44, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  exportMenu: {
    position: 'absolute', top: 46, right: 0, width: 140,
    borderRadius: radius.lg, borderWidth: 1, padding: spacing.xs, zIndex: 50,
  },
  exportOption: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.lg, borderRadius: radius.md,
  },
  exportLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs },
  card: {
    flexGrow: 1, flexBasis: '30%', padding: spacing.lg,
    borderRadius: radius.lg, borderWidth: 1, alignItems: 'center', gap: spacing.xs,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs,
  },
  cardValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  cardLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    marginTop: spacing.xl, marginBottom: spacing.md,
  },
  listTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  listCount: { fontSize: fontSize.sm },
  skeletonList: { gap: spacing.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: radius.md, borderWidth: 1, gap: spacing.md,
  },
  rowIcon: {
    width: 40, height: 40, borderRadius: radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  rowContent: { flex: 1 },
  rowName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  rowMeta: { fontSize: fontSize.xs, marginTop: 2, lineHeight: 18 },
});
