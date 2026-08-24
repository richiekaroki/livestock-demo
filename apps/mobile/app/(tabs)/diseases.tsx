import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { useI18n } from '@/src/i18n';
import { predictDiseaseRisk, getCountyRiskSummary, type DiseaseRiskRecord } from '@/src/services/api';
import { KENYA_COUNTIES } from '@wam-mfugo/shared';

const RISK_COLORS: Record<string, string> = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#CA8A04',
  low: '#16A34A',
};

export default function DiseasesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
          {KENYA_COUNTIES.slice(0, 20).map((c) => (
            <TouchableOpacity
              key={c.name}
              style={[styles.chip, selectedCounty === c.name && { backgroundColor: colors.tint }]}
              onPress={() => setSelectedCounty(c.name)}
            >
              <Text style={[styles.chipText, selectedCounty === c.name ? { color: '#fff' } : { color: colors.text }]}>
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.predictButton, { backgroundColor: colors.tint }, loading && styles.disabled]}
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
        </TouchableOpacity>
      </View>

      {summary && (
        <View style={styles.summaryGrid}>
          {(['critical', 'high', 'medium', 'low'] as const).map((level) => (
            <View key={level} style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.text }]}>{t(level as string)}</Text>
              <Text style={[styles.summaryValue, { color: RISK_COLORS[level] }]}>{summary.riskBreakdown[level]}</Text>
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
                <View style={[styles.riskBadge, { backgroundColor: RISK_COLORS[risk.riskLevel] }]}>
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
                    <View style={[styles.factorFill, { width: `${Math.min(100, factor.weight * 100 * 3)}%`, backgroundColor: RISK_COLORS[risk.riskLevel] }]} />
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
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, opacity: 0.6, marginBottom: 16 },
  card: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  chipScroll: { marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)', marginRight: 8 },
  chipText: { fontSize: 13, fontWeight: '500' },
  predictButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 10, gap: 8 },
  predictButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  disabled: { opacity: 0.5 },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  summaryCard: { flex: 1, minWidth: '22%', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1 },
  summaryLabel: { fontSize: 11, fontWeight: '500', textTransform: 'capitalize' },
  summaryValue: { fontSize: 22, fontWeight: '700', marginTop: 4 },
  risksSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  riskCard: { borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 10 },
  riskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  riskDisease: { fontSize: 15, fontWeight: '600', flex: 1 },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  riskBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  riskConfidence: { fontSize: 12, marginBottom: 8, opacity: 0.7 },
  factor: { marginBottom: 6 },
  factorDesc: { fontSize: 11, opacity: 0.7, marginBottom: 2 },
  factorBar: { height: 4, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.1)', overflow: 'hidden' },
  factorFill: { height: 4, borderRadius: 2 },
  lastCalc: { fontSize: 10, opacity: 0.5, marginTop: 6 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14, opacity: 0.6 },
});
