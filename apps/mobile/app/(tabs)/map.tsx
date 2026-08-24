import { useState } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import AnimalMap from '@/src/components/AnimalMap';
import { useAnimals } from '@/src/hooks/useAnimals';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { selectionChanged } from '@/src/services/haptics';
import { useI18n } from '@/src/i18n';

type HeatmapMetric = 'all' | 'sick' | 'healthy' | 'treatment';

export default function MapScreen() {
  const { animals, loading } = useAnimals();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapMetric, setHeatmapMetric] = useState<HeatmapMetric>('all');

  const markers = animals.filter((a) => a.lat !== 0 || a.lng !== 0);

  const heatmapData = markers.filter((a) => {
    if (heatmapMetric === 'sick') return a.health === 'Sick';
    if (heatmapMetric === 'healthy') return a.health === 'Healthy';
    if (heatmapMetric === 'treatment') return a.health === 'Under Treatment';
    return true;
  });

  if (loading && markers.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="map-outline" size={32} color={colors.textSecondary} />
        <Text style={{ color: colors.textSecondary }}>{t('loading')}</Text>
      </View>
    );
  }

  if (markers.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="location-outline" size={40} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No animal locations available yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AnimalMap animals={showHeatmap ? heatmapData : markers} />
      <View style={[styles.controls, { top: insets.top + 8 }]}>
        <Pressable
          onPress={() => { selectionChanged(); setShowHeatmap(!showHeatmap); }}
          style={({ pressed }) => [styles.toggleBtn, {
            backgroundColor: showHeatmap ? colors.tint : colors.card,
            borderColor: showHeatmap ? colors.tint : colors.cardBorder,
            opacity: pressed ? 0.85 : 1,
          }]}
          accessibilityLabel={showHeatmap ? 'Hide heatmap' : 'Show heatmap'}
        >
          <Ionicons name="flame-outline" size={16} color={showHeatmap ? '#fff' : colors.text} />
          <Text style={[styles.toggleText, { color: showHeatmap ? '#fff' : colors.text }]}>
            Heatmap
          </Text>
        </Pressable>

        {showHeatmap && (
          <View style={[styles.metricRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {(['all', 'sick', 'healthy', 'treatment'] as HeatmapMetric[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => { selectionChanged(); setHeatmapMetric(m); }}
                style={({ pressed }) => [styles.metricChip, {
                  backgroundColor: heatmapMetric === m ? colors.tint : 'transparent',
                  opacity: pressed ? 0.8 : 1,
                }]}
                accessibilityLabel={`Show ${m.charAt(0).toUpperCase() + m.slice(1)}`}
              >
                <Text style={[styles.metricText, { color: heatmapMetric === m ? '#fff' : colors.textSecondary }]}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View style={[styles.statsStrip, { bottom: insets.bottom + 8, backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.statsText, { color: colors.text }]}>
          {heatmapData.length} of {markers.length} animals
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyText: { fontSize: fontSize.base },
  controls: { position: 'absolute', left: spacing.lg, gap: spacing.sm, zIndex: 10 },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  toggleText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  metricRow: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  metricChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  metricText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  statsStrip: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    zIndex: 10,
  },
  statsText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});