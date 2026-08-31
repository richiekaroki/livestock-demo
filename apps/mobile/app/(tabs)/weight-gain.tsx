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
  getWeightGainStats,
  getAnimalWeightHistory,
  recordWeight,
  getAnimals,
  type WeightGainStat,
  type WeightRecord,
  type Livestock,
} from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';

export default function WeightGainScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const { user } = useAuth();
  const [stats, setStats] = useState<WeightGainStat[]>([]);
  const [history, setHistory] = useState<WeightRecord[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await getWeightGainStats();
      if (res.success) setStats(res.data);
    } catch (err) {
      logger.warn('[WeightGain] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!selectedAnimal) { setHistory([]); return; }
    getAnimalWeightHistory(selectedAnimal).then((res) => {
      if (res.success) setHistory(res.data);
    });
  }, [selectedAnimal]);

  const handleRecord = useCallback(async (data: { animalId: number; weight: number; notes?: string }) => {
    setSubmitting(true);
    try {
      const res = await recordWeight({
        ...data,
        recordedBy: user?.name ?? user?.email ?? 'Unknown',
      });
      if (res.success) {
        impactMedium();
        setShowForm(false);
        await loadData();
      } else {
        Alert.alert('Error', res.error || 'Failed to record weight.');
      }
    } catch {
      Alert.alert('Error', 'Failed to record weight. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [user, loadData]);

  const getGainColor = (pct: number) => {
    if (pct >= 20) return colors.success;
    if (pct >= 5) return colors.warning;
    if (pct >= 0) return '#ea580c';
    return colors.destructive;
  };

  const avgGain = stats.length > 0 ? Math.round(stats.reduce((s, g) => s + g.gainPercent, 0) / stats.length) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('weightGainAnalytics')}</Text>
        <Pressable
          onPress={() => { impactLight(); setShowForm(true); }}
          style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.tint, opacity: pressed ? 0.8 : 1 }]}
        >
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.addBtnText}>{t('recordWeight')}</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: spacing.xxl }} />
      ) : stats.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="bar-chart-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noWeightData')}</Text>
        </View>
      ) : (
        <FlatList
          data={stats}
          keyExtractor={(item) => String(item.animalId)}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <>
              <View style={styles.summaryRow}>
                {summaryCard(t('animalsTracked'), String(stats.length), 'paw-outline', colors)}
                {summaryCard(t('avgGain'), `${avgGain}%`, 'trending-up-outline', colors)}
                {summaryCard(t('topPerformer'), stats[0]?.animalName ?? '-', 'trophy-outline', colors)}
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('byAnimal')}</Text>
            </>
          }
          renderItem={({ item }) => {
            const expanded = selectedAnimal === item.animalId;
            const barWidth = Math.min(100, Math.max(5, Math.abs(item.gainPercent)));
            return (
              <Pressable
                onPress={() => setSelectedAnimal(expanded ? null : item.animalId)}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: colors.card, borderColor: expanded ? colors.tint : colors.cardBorder },
                  shadows.sm(colors.shadowColor, colors.shadowOpacity),
                  { opacity: pressed ? 0.95 : 1 },
                ]}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.animalName, { color: colors.text }]}>
                    {item.animalName}
                    <Text style={[styles.animalType, { color: colors.textSecondary }]}> ({item.animalType})</Text>
                  </Text>
                  <View style={styles.gainBadge}>
                    <Text style={[styles.gainText, { color: getGainColor(item.gainPercent) }]}>
                      {item.gainPercent >= 0 ? '+' : ''}{item.gainPercent}%
                    </Text>
                    <Text style={[styles.weightRange, { color: colors.textSecondary }]}>
                      {item.firstWeight}{item.unit} → {item.latestWeight}{item.unit}
                    </Text>
                  </View>
                </View>
                <View style={[styles.barBg, { backgroundColor: colors.borderLight }]}>
                  <View style={[styles.barFill, { width: `${barWidth}%`, backgroundColor: getGainColor(item.gainPercent) }]} />
                </View>
                <View style={styles.cardBottom}>
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>{item.recordCount} {t('weightRecords')}</Text>
                  <Text style={[styles.meta, { color: colors.textSecondary }]}>{item.county}</Text>
                </View>
                {expanded && history.length > 0 && (
                  <View style={styles.chartSection}>
                    <Text style={[styles.chartTitle, { color: colors.text }]}>{t('weightHistory')} — {history[0]?.animalName}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chart}>
                      {history.map((r) => {
                        const maxW = Math.max(...history.map((h) => h.weight));
                        const minW = Math.min(...history.map((h) => h.weight));
                        const range = maxW - minW || 1;
                        const height = ((r.weight - minW) / range) * 150 + 30;
                        return (
                          <View key={r.id} style={styles.barCol}>
                            <Text style={[styles.barValue, { color: colors.textSecondary }]}>{r.weight}</Text>
                            <View style={[styles.chartBar, { height, backgroundColor: colors.tint }]} />
                            <Text style={[styles.barDate, { color: colors.textSecondary }]}>
                              {new Date(r.recordedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </Text>
                          </View>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      )}

      <RecordWeightModal
        visible={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleRecord}
        submitting={submitting}
        colors={colors}
        t={t as unknown as (key: string) => string}
      />
    </View>
  );
}

function summaryCard(label: string, value: string, icon: string, colors: ReturnType<typeof useColors>) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <Ionicons name={icon as any} size={20} color={colors.tint} />
      <Text style={[styles.summaryValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function RecordWeightModal({ visible, onClose, onSubmit, submitting, colors, t }: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { animalId: number; weight: number; notes?: string }) => void;
  submitting: boolean;
  colors: ReturnType<typeof useColors>;
  t: (key: string) => string;
}) {
  const [animals, setAnimals] = useState<Livestock[]>([]);
  const [animalId, setAnimalId] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (visible) {
      getAnimals({ limit: 500 }).then((res) => {
        if (res.success) setAnimals(res.data);
      });
    }
  }, [visible]);

  const handleSubmit = () => {
    const id = parseInt(animalId, 10);
    const w = parseFloat(weight);
    if (isNaN(id) || isNaN(w) || w <= 0) {
      Alert.alert('Validation', 'Please select an animal and enter a valid weight.');
      return;
    }
    onSubmit({ animalId: id, weight: w, ...(notes ? { notes } : {}) });
    setAnimalId('');
    setWeight('');
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
            <Text style={[styles.formTitle, { color: colors.text }]}>{t('recordAnimalWeight')}</Text>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('animals')} *</Text>
            <View style={[styles.select, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
              <ScrollView style={styles.selectScroll} nestedScrollEnabled>
                <Pressable
                  onPress={() => setAnimalId('')}
                  style={[styles.selectOption, { backgroundColor: !animalId ? colors.tint + '20' : 'transparent' }]}
                >
                  <Text style={[styles.selectText, { color: !animalId ? colors.tint : colors.textSecondary }]}>{t('selectAnimal')}</Text>
                </Pressable>
                {animals.map((a) => (
                  <Pressable
                    key={a.id}
                    onPress={() => setAnimalId(String(a.id))}
                    style={[styles.selectOption, { backgroundColor: animalId === String(a.id) ? colors.tint + '20' : 'transparent' }]}
                  >
                    <Text style={[styles.selectText, { color: animalId === String(a.id) ? colors.tint : colors.text }]}>
                      {a.name} ({a.type})
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('weightKg')} *</Text>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="250"
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
            />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('weightNotes')}</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholderTextColor={colors.textSecondary}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
            />

            <Pressable
              onPress={handleSubmit}
              disabled={submitting}
              style={({ pressed }) => [
                styles.submitBtn,
                { backgroundColor: colors.tint, opacity: submitting || pressed ? 0.7 : 1 },
              ]}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="save-outline" size={16} color="#fff" />
              )}
              <Text style={styles.submitBtnText}>{submitting ? 'Saving...' : t('save')}</Text>
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
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill,
  },
  addBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  summaryRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  summaryCard: {
    flex: 1, padding: spacing.md, borderRadius: radius.lg,
    borderWidth: 1, gap: spacing.xs, alignItems: 'center',
  },
  summaryValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  summaryLabel: { fontSize: fontSize.xs, textAlign: 'center' },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  list: { paddingBottom: spacing.xxxl },
  card: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  animalName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  animalType: { fontSize: fontSize.sm },
  gainBadge: { alignItems: 'flex-end', gap: 2 },
  gainText: { fontSize: fontSize.base, fontWeight: fontWeight.bold },
  weightRange: { fontSize: fontSize.xs },
  barBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontSize: fontSize.xs },
  chartSection: { marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1 },
  chartTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginBottom: spacing.sm },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs, minHeight: 200 },
  barCol: { alignItems: 'center', gap: 4, minWidth: 40 },
  barValue: { fontSize: 10 },
  chartBar: { width: 32, borderRadius: radius.sm },
  barDate: { fontSize: 9 },
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
  select: { borderRadius: radius.md, borderWidth: 1, maxHeight: 150 },
  selectScroll: { padding: spacing.xs },
  selectOption: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  selectText: { fontSize: fontSize.sm },
  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    paddingVertical: spacing.md, borderRadius: radius.md, marginTop: spacing.sm,
  },
  submitBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
});
