import { useState, useEffect, useCallback } from 'react';
import { FlatList, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight, shadows } from '@/constants/Tokens';
import { useI18n } from '@/src/i18n';
import { logger } from '@/src/utils/logger';
import { getVaccinationReminders, type VaccinationReminder } from '@/src/services/api';

export default function RemindersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const t = useI18n().t as unknown as (key: string) => string;
  const [reminders, setReminders] = useState<VaccinationReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysAhead, setDaysAhead] = useState(30);

  const loadData = useCallback(async () => {
    try {
      const res = await getVaccinationReminders(daysAhead);
      if (res.success) setReminders(res.data);
    } catch (err) {
      logger.warn('[Reminders] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, [daysAhead]);

  useEffect(() => { loadData(); }, [loadData]);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return t('today');
    if (diffDays === 1) return t('tomorrow');
    if (diffDays <= 7) return `${diffDays} ${t('days')}`;
    return date.toLocaleDateString();
  };

  const getDateColor = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return colors.destructive;
    if (diffDays <= 3) return colors.warning;
    return colors.success;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('upcomingReminders')}</Text>
        <View style={styles.daysRow}>
          {[7, 14, 30, 60].map((d) => (
            <Pressable
              key={d}
              onPress={() => { setDaysAhead(d); setLoading(true); }}
              style={({ pressed }) => [
                styles.daysBtn,
                {
                  backgroundColor: daysAhead === d ? colors.tint : colors.card,
                  borderColor: daysAhead === d ? colors.tint : colors.cardBorder,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text style={[styles.daysText, { color: daysAhead === d ? '#fff' : colors.textSecondary }]}>{d}d</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: spacing.xxl }} />
      ) : reminders.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noReminders')}</Text>
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const dateColor = getDateColor(item.date);
            return (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm(colors.shadowColor, colors.shadowOpacity)]}>
                <View style={styles.cardLeft}>
                  <View style={[styles.dateBadge, { backgroundColor: dateColor + '20' }]}>
                    <Text style={[styles.dateBadgeText, { color: dateColor }]}>{getDateLabel(item.date)}</Text>
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.animalName, { color: colors.text }]}>
                    {item.animalName}
                    <Text style={[styles.animalType, { color: colors.textSecondary }]}> ({item.animalType})</Text>
                  </Text>
                  <Text style={[styles.vaccine, { color: colors.textSecondary }]}>{item.type}</Text>
                  <View style={styles.metaRow}>
                    {item.veterinarian && (
                      <Text style={[styles.meta, { color: colors.textSecondary }]}>
                        <Ionicons name="person-outline" size={10} /> {item.veterinarian}
                      </Text>
                    )}
                    {item.batchNumber && (
                      <Text style={[styles.meta, { color: colors.textSecondary }]}>
                        {t('batch')}: {item.batchNumber}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.county, { color: colors.textSecondary }]}>{item.county} · {item.owner}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.lg, paddingBottom: spacing.md },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: spacing.md },
  daysRow: { flexDirection: 'row', gap: spacing.xs },
  daysBtn: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.pill, borderWidth: 1,
  },
  daysText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  list: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxxl },
  card: {
    flexDirection: 'row', padding: spacing.lg, borderRadius: radius.lg,
    borderWidth: 1, gap: spacing.md,
  },
  cardLeft: { alignItems: 'center', justifyContent: 'center' },
  dateBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  dateBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  cardContent: { flex: 1, gap: 4 },
  animalName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  animalType: { fontSize: fontSize.sm },
  vaccine: { fontSize: fontSize.sm },
  metaRow: { flexDirection: 'row', gap: spacing.md, marginTop: 2 },
  meta: { fontSize: fontSize.xs },
  county: { fontSize: fontSize.xs, marginTop: 2 },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xxl, gap: spacing.md },
  emptyText: { fontSize: fontSize.base },
});
