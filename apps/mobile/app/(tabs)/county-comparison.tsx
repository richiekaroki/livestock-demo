import { useState, useEffect, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight, shadows } from '@/constants/Tokens';
import { useI18n } from '@/src/i18n';
import { logger } from '@/src/utils/logger';
import { getCountyComparison, type CountyData } from '@/src/services/api';

type SortKey = 'totalAnimals' | 'healthyRate' | 'vaccinationRate' | 'mortalityRate' | 'outbreakCount';

export default function CountyComparisonScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [data, setData] = useState<CountyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('totalAnimals');
  const [sortAsc, setSortAsc] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await getCountyComparison();
      if (res.success) setData(res.data);
    } catch (err) {
      logger.warn('[CountyComparison] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const sorted = [...data].sort((a, b) => {
    const av = a[sortKey] as number;
    const bv = b[sortKey] as number;
    return sortAsc ? av - bv : bv - av;
  });

  const maxAnimals = Math.max(...data.map((d) => d.totalAnimals), 1);

  const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
    { key: 'totalAnimals', label: t('cTotal'), icon: 'paw-outline' },
    { key: 'healthyRate', label: t('cHealthyRate'), icon: 'heart-outline' },
    { key: 'vaccinationRate', label: t('cVaccinationRate'), icon: 'medkit-outline' },
    { key: 'mortalityRate', label: t('cMortalityRate'), icon: 'skull-outline' },
    { key: 'outbreakCount', label: t('cOutbreaks'), icon: 'warning-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('countyComparison')}</Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>{t('countyComparisonDesc')}</Text>
      </View>

      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((opt) => {
          const active = sortKey === opt.key;
          return (
            <Pressable
              key={opt.key}
              onPress={() => {
                if (sortKey === opt.key) {
                  setSortAsc(!sortAsc);
                } else {
                  setSortKey(opt.key);
                  setSortAsc(false);
                }
              }}
              style={({ pressed }) => [
                styles.sortBtn,
                {
                  backgroundColor: active ? colors.tint + '20' : colors.card,
                  borderColor: active ? colors.tint : colors.cardBorder,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Ionicons name={opt.icon as any} size={14} color={active ? colors.tint : colors.textSecondary} />
              <Text style={[styles.sortText, { color: active ? colors.tint : colors.textSecondary }]}>{opt.label}</Text>
              {active && (
                <Ionicons name={sortAsc ? 'arrow-up' : 'arrow-down'} size={12} color={colors.tint} />
              )}
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: spacing.xxl }} />
      ) : data.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="grid-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noCountyData')}</Text>
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.county}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => {
            const barWidth = Math.round((item.totalAnimals / maxAnimals) * 100);
            return (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm(colors.shadowColor, colors.shadowOpacity)]}>
                <View style={styles.cardTop}>
                  <View style={styles.rankBadge}>
                    <Text style={[styles.rank, { color: colors.tint }]}>{index + 1}</Text>
                  </View>
                  <View style={styles.cardTitle}>
                    <Text style={[styles.countyName, { color: colors.text }]}>{item.county}</Text>
                    <Text style={[styles.animalCount, { color: colors.textSecondary }]}>{item.totalAnimals} {t('cAnimals')}</Text>
                  </View>
                </View>

                <View style={[styles.barBg, { backgroundColor: colors.borderLight }]}>
                  <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: colors.tint }]} />
                </View>

                <View style={styles.statsGrid}>
                  <StatCell label={t('cHealthyRate')} value={`${item.healthyRate}%`} color={colors.success} />
                  <StatCell label={t('cVaccinationRate')} value={`${item.vaccinationRate}%`} color={colors.tint} />
                  <StatCell label={t('cMortalityRate')} value={`${item.mortalityRate}%`} color={colors.destructive} />
                  <StatCell label={t('cOutbreaks')} value={String(item.outbreakCount)} color={colors.warning} />
                  <StatCell label={t('cSick')} value={String(item.sick)} color={colors.destructive} />
                </View>

                {item.outbreakDiseases.length > 0 && (
                  <View style={styles.tagWrap}>
                    {item.outbreakDiseases.map((d) => (
                      <View key={d} style={[styles.tag, { backgroundColor: colors.destructiveLight }]}>
                        <Text style={[styles.tagText, { color: colors.destructive }]}>{d}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

function StatCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  desc: { fontSize: fontSize.sm, marginTop: spacing.xs },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  sortBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
    borderRadius: radius.pill, borderWidth: 1,
  },
  sortText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  list: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxxl },
  card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  rankBadge: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  rank: { fontSize: fontSize.base, fontWeight: fontWeight.bold },
  cardTitle: { flex: 1 },
  countyName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  animalCount: { fontSize: fontSize.xs },
  barBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  statCell: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  statLabel: { fontSize: 9, color: '#999', marginTop: 2 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  tag: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  tagText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xxl, gap: spacing.md },
  emptyText: { fontSize: fontSize.base },
});
