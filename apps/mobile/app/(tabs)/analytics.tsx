import { useMemo, useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { useAnimals } from '@/src/hooks/useAnimals';
import { getVaccinationCoverage, type VaccinationCoverageRecord } from '@/src/services/api';
import { spacing, radius, fontSize, fontWeight, shadows } from '@/constants/Tokens';
import type { Livestock, AnimalType, HealthStatus } from '@wam-mfugo/shared';

const screenWidth = Dimensions.get('window').width;

// Chart colors — designed for card surfaces, work in both light and dark modes
const ANIMAL_COLORS: Record<AnimalType, string> = {
  Cattle: '#B45309',
  Goat: '#7C3AED',
  Sheep: '#4F46E5',
  Camel: '#D97706',
  Pig: '#DB2777',
  Chicken: '#DC2626',
};

const HEALTH_COLORS: Record<HealthStatus, string> = {
  Healthy: '#15803D',
  Sick: '#DC2626',
  'Under Treatment': '#D97706',
  Recovered: '#0284C7',
};

export default function AnalyticsScreen() {
  const { animals, stats } = useAnimals();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [coverage, setCoverage] = useState<VaccinationCoverageRecord[]>([]);

  useEffect(() => {
    getVaccinationCoverage().then((res) => {
      if (res.success && res.data) setCoverage(res.data);
    });
  }, []);

  const typeDistribution = useMemo(() => {
    const map = new Map<AnimalType, number>();
    animals.forEach((a) => map.set(a.type, (map.get(a.type) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [animals]);

  const healthDistribution = useMemo(() => {
    const map = new Map<HealthStatus, number>();
    animals.forEach((a) => map.set(a.health, (map.get(a.health) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [animals]);

  const countyDistribution = useMemo(() => {
    const map = new Map<string, number>();
    animals.forEach((a) => map.set(a.county, (map.get(a.county) || 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [animals]);

  const total = animals.length || 1;
  const healthyRate = stats ? Math.round(((stats.healthyCount || 0) / total) * 100) : 0;

  if (animals.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="bar-chart-outline" size={48} color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No data available yet</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Register animals to see analytics here.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <SummaryCard icon="heart" label="Healthy Rate" value={`${healthyRate}%`} color={colors.success} colors={colors} />
        <SummaryCard icon="location" label="Counties" value={String(stats?.counties || 0)} color={colors.info} colors={colors} />
        <SummaryCard icon="paw" label="Types" value={String(typeDistribution.length)} color={colors.accent} colors={colors} />
        <SummaryCard icon="layers" label="Total" value={String(animals.length)} color={colors.tint} colors={colors} />
      </View>

      {/* Health Distribution */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Health Status</Text>
        {healthDistribution.map(([status, count]) => {
          const pct = Math.round((count / total) * 100);
          return (
            <View key={status} style={styles.barRow}>
              <View style={styles.barLabel}>
                <View style={[styles.barDot, { backgroundColor: HEALTH_COLORS[status] }]} />
                <Text style={[styles.barText, { color: colors.text }]}>{status}</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: HEALTH_COLORS[status] }]} />
              </View>
              <Text style={[styles.barCount, { color: colors.textSecondary }]}>{count}</Text>
            </View>
          );
        })}
      </View>

      {/* Type Distribution */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>By Animal Type</Text>
        {typeDistribution.map(([type, count]) => {
          const pct = Math.round((count / total) * 100);
          return (
            <View key={type} style={styles.barRow}>
              <View style={styles.barLabel}>
                <View style={[styles.barDot, { backgroundColor: ANIMAL_COLORS[type] }]} />
                <Text style={[styles.barText, { color: colors.text }]}>{type}</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: ANIMAL_COLORS[type] }]} />
              </View>
              <Text style={[styles.barCount, { color: colors.textSecondary }]}>{count}</Text>
            </View>
          );
        })}
      </View>

      {/* County Distribution */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>By County (Top 10)</Text>
        {countyDistribution.map(([county, count]) => {
          const maxCount = countyDistribution[0]?.[1] || 1;
          const pct = Math.round((count / maxCount) * 100);
          return (
            <View key={county} style={styles.barRow}>
              <Text style={[styles.countyName, { color: colors.text }]} numberOfLines={1}>{county}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: colors.tint }]} />
              </View>
              <Text style={[styles.barCount, { color: colors.textSecondary }]}>{count}</Text>
            </View>
          );
        })}
      </View>

      {/* Vaccination Coverage */}
      {coverage.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Vaccination Coverage</Text>
          {coverage.slice(0, 10).map((c) => {
            const covColor = c.coveragePercent >= 80 ? '#16a34a' : c.coveragePercent >= 50 ? '#ca8a04' : '#dc2626';
            return (
              <View key={c.county} style={styles.barRow}>
                <Text style={[styles.countyName, { color: colors.text }]} numberOfLines={1}>{c.county}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${c.coveragePercent}%`, backgroundColor: covColor }]} />
                </View>
                <Text style={[styles.barCount, { color: colors.textSecondary }]}>{c.coveragePercent}%</Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function SummaryCard({ icon, label, value, color, colors }: {
  icon: string; label: string; value: string; color: string;
  colors: ReturnType<typeof import('@/components/Themed').useColors>;
}) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={[styles.summaryValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.xxxl },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  emptySubtitle: { fontSize: fontSize.sm, textAlign: 'center' },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginBottom: spacing.sm },
  summaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summaryCard: {
    flexGrow: 1,
    flexBasis: '47%',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  summaryValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  summaryLabel: { fontSize: fontSize.xs },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  barLabel: { flexDirection: 'row', alignItems: 'center', width: 100, gap: spacing.xs },
  barDot: { width: 8, height: 8, borderRadius: 4 },
  barText: { fontSize: fontSize.sm, flex: 1 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#E5E7EB', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barCount: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, width: 30, textAlign: 'right' },
  countyName: { fontSize: fontSize.sm, width: 100 },
});
