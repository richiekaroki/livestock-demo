import { useState, useEffect, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Alert, ActivityIndicator, TextInput, Modal, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight, shadows } from '@/constants/Tokens';
import { impactLight, impactMedium } from '@/src/services/haptics';
import { useI18n } from '@/src/i18n';
import { logger } from '@/src/utils/logger';
import {
  getMortalities,
  reportMortality,
  getMortalityStats,
  type MortalityRecord,
  type MortalityStats,
} from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';

const CAUSES = ['disease', 'predation', 'accident', 'old_age', 'malnutrition', 'poisoning', 'other'] as const;

function causeLabel(cause: string, t: (key: string) => string) {
  const map: Record<string, string> = {
    disease: t('disease'), predation: t('predation'), accident: t('accident'),
    old_age: t('oldAge'), malnutrition: t('malnutrition'), poisoning: t('poisoning'), other: 'Other',
  };
  return map[cause] || cause;
}

export default function MortalityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { user } = useAuth();
  const [records, setRecords] = useState<MortalityRecord[]>([]);
  const [stats, setStats] = useState<MortalityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [recordsRes, statsRes] = await Promise.all([
        getMortalities({ limit: 50 }),
        getMortalityStats(),
      ]);
      if (recordsRes.success) setRecords(recordsRes.data);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err) {
      logger.warn('[Mortality] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleReport = useCallback(async (data: {
    animalId: number;
    cause: string;
    diseaseName?: string;
    notes?: string;
  }) => {
    setSubmitting(true);
    try {
      const res = await reportMortality({
        ...data,
        reportedBy: user?.name ?? 'Unknown',
      });
      if (res.success) {
        impactMedium();
        setShowForm(false);
        await loadData();
      } else {
        Alert.alert('Error', res.error || 'Failed to report mortality.');
      }
    } catch {
      Alert.alert('Error', 'Failed to report mortality. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [user, loadData]);

  const statCard = (label: string, value: string | number, icon: string) => (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Ionicons name={icon as any} size={20} color={colors.tint} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );

const tAny = t as unknown as (key: string) => string;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('mortalityTracking')}</Text>
        <Pressable
          onPress={() => { impactLight(); setShowForm(true); }}
          style={({ pressed }) => [styles.reportBtn, { backgroundColor: colors.destructive, opacity: pressed ? 0.8 : 1 }]}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.reportBtnText}>{t('reportMortality')}</Text>
        </Pressable>
      </View>

      {stats && (
        <View style={styles.statsRow}>
          {statCard(t('total'), stats.total, 'list-outline')}
          {statCard(t('last30Days'), stats.recentCount, 'time-outline')}
          {statCard(t('topCause'), stats.byCause[0]?.cause ? causeLabel(stats.byCause[0].cause, tAny) : '-', 'skull-outline')}
          {statCard(t('mostAffected'), stats.byCounty[0]?.county ?? '-', 'location-outline')}
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: spacing.xxl }} />
      ) : records.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noMortalityRecords')}</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm(colors.shadowColor, colors.shadowOpacity)]}>
              <View style={styles.cardHeader}>
                <View style={[styles.causeBadge, { backgroundColor: colors.destructiveLight }]}>
                  <Ionicons name="skull-outline" size={14} color={colors.destructive} />
                  <Text style={[styles.causeText, { color: colors.destructive }]}>{causeLabel(item.cause, tAny)}</Text>
                </View>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {new Date(item.reportedAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.animalName, { color: colors.text }]}>
                {item.animalName} (#{item.animalId})
              </Text>
              <Text style={[styles.meta, { color: colors.textSecondary }]}>
                {item.animalType} · {item.county} · {item.owner}
              </Text>
              {item.diseaseName && (
                <Text style={[styles.disease, { color: colors.warning }]}>
                  {t('disease')}: {item.diseaseName}
                </Text>
              )}
              {item.notes && (
                <Text style={[styles.notes, { color: colors.textSecondary }]}>{item.notes}</Text>
              )}
              <Text style={[styles.reporter, { color: colors.textSecondary }]}>
                {t('reportedByMortality')}: {item.reportedBy}
              </Text>
            </View>
          )}
        />
      )}

      <MortalityFormModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleReport}
        submitting={submitting}
        colors={colors}
        t={tAny}
      />
    </View>
  );
}

function MortalityFormModal({ visible, onClose, onSubmit, submitting, colors, t }: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { animalId: number; cause: string; diseaseName?: string; notes?: string }) => void;
  submitting: boolean;
  colors: ReturnType<typeof useColors>;
  t: (key: string) => string;
}) {
  const [animalId, setAnimalId] = useState('');
  const [cause, setCause] = useState('');
  const [diseaseName, setDiseaseName] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    const id = parseInt(animalId, 10);
    if (isNaN(id) || !cause) {
      Alert.alert('Validation', 'Animal ID and cause are required.');
      return;
    }
    onSubmit({
      animalId: id,
      cause,
      ...(diseaseName ? { diseaseName } : {}),
      ...(notes ? { notes } : {}),
    });
    setAnimalId('');
    setCause('');
    setDiseaseName('');
    setNotes('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.formContainer, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
          <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
            <View style={styles.handleBar}>
              <View style={[styles.handle, { backgroundColor: colors.textSecondary }]} />
            </View>
            <Text style={[styles.formTitle, { color: colors.text }]}>{t('reportMortalityTitle')}</Text>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('animalIdLabel')} *</Text>
            <TextInput
              value={animalId}
              onChangeText={setAnimalId}
              keyboardType="numeric"
              placeholder="e.g. 42"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
            />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('cause')} *</Text>
            <View style={styles.chipWrap}>
              {CAUSES.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setCause(c)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      backgroundColor: cause === c ? colors.destructive : colors.background,
                      borderColor: cause === c ? colors.destructive : colors.borderLight,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: cause === c ? '#fff' : colors.text }]}>
                    {causeLabel(c, t)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {cause === 'disease' && (
              <>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('diseaseName')}</Text>
                <TextInput
                  value={diseaseName}
                  onChangeText={setDiseaseName}
                  placeholder="e.g. Foot and Mouth"
                  placeholderTextColor={colors.textSecondary}
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
                />
              </>
            )}

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('mortalityNotes')}</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, styles.textArea, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
            />

            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              style={({ pressed }) => [
                styles.submitBtn,
                { backgroundColor: colors.destructive, opacity: submitting || pressed ? 0.7 : 1 },
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="warning-outline" size={16} color="#fff" />
              )}
              <Text style={styles.submitBtnText}>
                {submitting ? t('submittingReport') : t('submitMortalityReport')}
              </Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: spacing.lg, paddingBottom: spacing.md,
  },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  reportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill,
  },
  reportBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  statsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm,
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
  },
  statCard: {
    flex: 1, minWidth: '45%', padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 1, gap: spacing.xs, alignItems: 'center',
  },
  statValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  statLabel: { fontSize: fontSize.xs, textAlign: 'center' },
  list: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxxl },
  card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  causeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill,
  },
  causeText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  date: { fontSize: fontSize.xs },
  animalName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  meta: { fontSize: fontSize.sm },
  disease: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  notes: { fontSize: fontSize.sm, fontStyle: 'italic' },
  reporter: { fontSize: fontSize.xs, marginTop: spacing.xs },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xxl, gap: spacing.md },
  emptyText: { fontSize: fontSize.base },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  formContainer: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '85%' },
  handleBar: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.xs },
  handle: { width: 40, height: 4, borderRadius: 2 },
  formContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  formTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, textAlign: 'center' },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  input: {
    borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, fontSize: fontSize.sm,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: radius.pill, borderWidth: 1,
  },
  chipText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    paddingVertical: spacing.md, borderRadius: radius.md, marginTop: spacing.sm,
  },
  submitBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
});
