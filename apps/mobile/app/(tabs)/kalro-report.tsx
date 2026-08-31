import { useState, useCallback } from 'react';
import { ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { impactMedium } from '@/src/services/haptics';
import { useI18n } from '@/src/i18n';
import { getKalroReport, type Livestock } from '@/src/services/api';
import { ANIMAL_TYPES } from '@/constants/Shared';

const HEALTH_STATUSES = ['Healthy', 'Sick', 'Under Treatment', 'Recovered'];

export default function KalroReportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const t = useI18n().t as unknown as (key: string) => string;
  const [type, setType] = useState('');
  const [health, setHealth] = useState('');
  const [county, setCounty] = useState('');
  const [report, setReport] = useState<Livestock[] | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getKalroReport({ type: type || undefined, health: health || undefined, county: county || undefined });
      if (res.success) {
        impactMedium();
        setReport(res.data);
      }
    } catch {
      Alert.alert('Error', 'Failed to generate report.');
    } finally {
      setLoading(false);
    }
  }, [type, health, county]);

  const downloadCsv = async () => {
    if (!report) return;
    const header = 'Name,Type,County,Owner,Health,Breed\n';
    const rows = report.map((a) => `${a.name},${a.type},${a.county},${a.owner},${a.health},${a.breed || ''}`).join('\n');
    const csv = header + rows;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(csv, { mimeType: 'text/csv', dialogTitle: 'Download KALRO Report' });
    }
  };

  const summary = report ? {
    total: report.length,
    healthy: report.filter((a) => a.health === 'Healthy').length,
    sick: report.filter((a) => a.health === 'Sick').length,
    underTreatment: report.filter((a) => a.health === 'Under Treatment').length,
    recovered: report.filter((a) => a.health === 'Recovered').length,
  } : null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{t('kalroReport')}</Text>

      <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('animalType')}</Text>
        <View style={styles.chipWrap}>
          {ANIMAL_TYPES.map((t2) => (
            <Pressable key={t2} onPress={() => setType(type === t2 ? '' : t2)} style={({ pressed }) => [styles.chip, { backgroundColor: type === t2 ? colors.tint : colors.background, borderColor: type === t2 ? colors.tint : colors.borderLight, opacity: pressed ? 0.7 : 1 }]}>
              <Text style={[styles.chipText, { color: type === t2 ? '#fff' : colors.text }]}>{t2}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('allHealth')}</Text>
        <View style={styles.chipWrap}>
          {HEALTH_STATUSES.map((h) => (
            <Pressable key={h} onPress={() => setHealth(health === h ? '' : h)} style={({ pressed }) => [styles.chip, { backgroundColor: health === h ? colors.tint : colors.background, borderColor: health === h ? colors.tint : colors.borderLight, opacity: pressed ? 0.7 : 1 }]}>
              <Text style={[styles.chipText, { color: health === h ? '#fff' : colors.text }]}>{h}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('county')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
          value={county}
          onChangeText={setCounty}
          placeholder={t('countyOptional')}
          placeholderTextColor={colors.textSecondary}
        />

        <Pressable onPress={generate} disabled={loading} style={({ pressed }) => [styles.generateBtn, { backgroundColor: colors.tint, opacity: (loading || pressed) ? 0.7 : 1 }]}>
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="document-text-outline" size={16} color="#fff" />}
          <Text style={styles.generateBtnText}>{loading ? 'Generating...' : t('generateReport')}</Text>
        </Pressable>
      </View>

      {summary && (
        <View style={[styles.report, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.reportHeader}>
            <Text style={[styles.reportTitle, { color: colors.text }]}>{t('reportSummary')}</Text>
            <Pressable onPress={downloadCsv} style={styles.downloadBtn}>
              <Ionicons name="download-outline" size={16} color={colors.tint} />
              <Text style={[styles.downloadText, { color: colors.tint }]}>{t('downloadCsv')}</Text>
            </Pressable>
          </View>
          <View style={styles.statsGrid}>
            <ReportStat label={t('cTotal')} value={summary.total} color={colors.text} />
            <ReportStat label={t('cHealthy')} value={summary.healthy} color={colors.success} />
            <ReportStat label={t('cSick')} value={summary.sick} color={colors.destructive} />
            <ReportStat label={t('cUnderTreatment')} value={summary.underTreatment} color={colors.warning} />
            <ReportStat label={t('cHealthy')} value={summary.recovered} color={colors.tint} />
          </View>
          <Text style={[styles.reportMeta, { color: colors.textSecondary }]}>{summary.total} {t('cAnimals')} · {new Date().toLocaleDateString()}</Text>
        </View>
      )}
    </ScrollView>
  );
}

function ReportStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: spacing.lg },
  form: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md, marginBottom: spacing.lg },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1 },
  chipText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  input: { borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  generateBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    paddingVertical: spacing.md, borderRadius: radius.md, marginTop: spacing.sm,
  },
  generateBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  report: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  downloadText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCell: { alignItems: 'center', minWidth: 60 },
  statValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  statLabel: { fontSize: fontSize.xs, color: '#999' },
  reportMeta: { fontSize: fontSize.xs, marginTop: spacing.xs },
});
