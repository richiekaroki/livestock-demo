import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/components/Themed';
import { useI18n } from '@/src/i18n';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { predictDiseaseRisk, getCountyRiskSummary, type DiseaseRiskRecord } from '@/src/services/api';
import { KENYA_COUNTIES } from '@wam-mfugo/shared';
import { riskColors } from '@/constants/Colors';

export default function DiseasesScreen() {
  const colors = useColors();
  const { t } = useI18n();
  const [selectedCounty, setSelectedCounty] = useState('');
  const [risks, setRisks] = useState<DiseaseRiskRecord[]>([]);
  const [summary, setSummary] = useState<{ county: string; totalDiseases: number; riskBreakdown: { critical: number; high: number; medium: number; low: number }; highestRisk: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!selectedCounty) {
      Alert.alert(t('diseases'), t('selectCounty'));
      return;
    }
    setLoading(true);
    try {
      const [riskRes, summaryRes] = await Promise.all([
        predictDiseaseRisk({ county: selectedCounty }),
        getCountyRiskSummary(selectedCounty),
      ]);
      if (riskRes.success && riskRes.data) setRisks(riskRes.data);
      if (summaryRes.success && summaryRes.data) setSummary(summaryRes.data);
    } catch {
      Alert.alert(t('diseases'), t('noDataAvailable'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{t('diseases')}</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>{t('predict')}</Text>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.label, { color: colors.text }]}>{t('selectCounty')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          {KENYA_COUNTIES.map((c) => (
            <Pressable
              key={c.name}
              style={({ pressed }) => [styles.chip, selectedCounty === c.name && { backgroundColor: colors.tint }, { opacity: pressed ? 0.85 : 1 }]}
              onPress={() => setSelectedCounty(c.name)}
            >
              <Text style={[styles.chipText, selectedCounty === c.name ? { color: '#fff' } : { color: colors.text }]}>
                {c.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable
          style={({ pressed }) => [styles.predictButton, { backgroundColor: colors.tint }, (loading || !selectedCounty) && styles.disabled, { opacity: pressed ? 0.85 : 1 }]}
          onPress={handlePredict}
          disabled={loading || !selectedCounty}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="analytics-outline" size={18} color="#fff" />
              <Text style={styles.predictButtonText}>{t('predict')}</Text>
            </>
          )}
        </Pressable>
      </View>

      {summary && (
        <View style={styles.summaryGrid}>
          {(['critical', 'high', 'medium', 'low'] as const).map((level) => (
            <View key={level} style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
              <Text style={[styles.summaryValue, { color: riskColors[level] }]}>{summary.riskBreakdown[level]}</Text>
            </View>
          ))}
        </View>
      )}

      {risks.length > 0 && (
        <View style={styles.risksSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('riskAssessment')}</Text>
          {risks.map((risk) => (
            <View key={risk.id} style={[styles.riskCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.riskHeader}>
                <Text style={[styles.riskDisease, { color: colors.text }]}>{risk.diseaseType}</Text>
                <View style={[styles.riskBadge, { backgroundColor: riskColors[risk.riskLevel] }]}>
                  <Text style={styles.riskBadgeText}>{risk.riskLevel}</Text>
                </View>
              </View>
              <Text style={[styles.riskConfidence, { color: colors.text }]}>
                {t('predict')}: {Math.round(risk.confidence * 100)}%
              </Text>
              {risk.factors.map((factor) => (
                <View key={factor.name} style={styles.factor}>
                  <Text style={[styles.factorDesc, { color: colors.text }]}>{factor.description}</Text>
                  <View style={styles.factorBar}>
                    <View style={[styles.factorFill, { width: `${Math.min(100, factor.weight * 100 * 3)}%`, backgroundColor: riskColors[risk.riskLevel] }]} />
                  </View>
                </View>
              ))}
              <Text style={[styles.lastCalc, { color: colors.text }]}>
                {t('lastCalculated')}: {new Date(risk.lastCalculated).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {risks.length === 0 && !loading && selectedCounty && (
        <View style={styles.empty}>
          <Ionicons name="medical-outline" size={48} color={colors.text} />
          <Text style={[styles.emptyText, { color: colors.text }]}>{t('noDataAvailable')}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.md, opacity: 0.6, marginBottom: spacing.lg },
  card: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, marginBottom: spacing.lg },
  label: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, marginBottom: spacing.sm },
  chipScroll: { marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill, backgroundColor: 'rgba(0,0,0,0.05)', marginRight: spacing.sm },
  chipText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  predictButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: spacing.lg, borderRadius: radius.md, gap: spacing.sm },
  predictButtonText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  disabled: { opacity: 0.5 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  summaryCard: { flex: 1, minWidth: '22%', borderRadius: radius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1 },
  summaryLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.medium, textTransform: 'capitalize' },
  summaryValue: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginTop: spacing.xs },
  risksSection: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, marginBottom: spacing.md },
  riskCard: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, marginBottom: spacing.md },
  riskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  riskDisease: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, flex: 1 },
  riskBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.md },
  riskBadgeText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'capitalize' },
  riskConfidence: { fontSize: fontSize.sm, marginBottom: spacing.sm, opacity: 0.7 },
  factor: { marginBottom: spacing.sm },
  factorDesc: { fontSize: fontSize.xs, opacity: 0.7, marginBottom: 2 },
  factorBar: { height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.1)', overflow: 'hidden' },
  factorFill: { height: 4, borderRadius: 2 },
  lastCalc: { fontSize: fontSize.xs, opacity: 0.5, marginTop: spacing.sm },
  empty: { alignItems: 'center', paddingVertical: spacing.section, gap: spacing.md },
  emptyText: { fontSize: fontSize.md, opacity: 0.6 },
});
