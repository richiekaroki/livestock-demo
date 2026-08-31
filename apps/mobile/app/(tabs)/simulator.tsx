import { useState, useEffect, useCallback } from 'react';
import { ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight, shadows } from '@/constants/Tokens';
import { impactMedium } from '@/src/services/haptics';
import { useI18n } from '@/src/i18n';
import { simulateWhatIf, getCounties, type SimulationResult } from '@/src/services/api';
import { RISK_COLORS } from '@/constants/Shared';

export default function SimulatorScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const t = useI18n().t as unknown as (key: string) => string;
  const [counties, setCounties] = useState<{ name: string }[]>([]);
  const [county, setCounty] = useState('');
  const [vaccinationIncrease, setVaccinationIncrease] = useState(20);
  const [livestockReduction, setLivestockReduction] = useState(0);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCountyPicker, setShowCountyPicker] = useState(false);

  useEffect(() => {
    getCounties().then((res) => {
      if (res.success) setCounties(res.data);
    });
  }, []);

  const handleSimulate = useCallback(async () => {
    if (!county) { Alert.alert('Validation', 'Please select a county.'); return; }
    setLoading(true);
    try {
      const res = await simulateWhatIf({ county, vaccinationIncrease, livestockReduction });
      if (res.success) {
        impactMedium();
        setResult(res.data);
      } else {
        Alert.alert('Error', res.error || 'Simulation failed.');
      }
    } catch {
      Alert.alert('Error', 'Simulation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [county, vaccinationIncrease, livestockReduction]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{t('simulatorTitle')}</Text>
      <Text style={[styles.desc, { color: colors.textSecondary }]}>{t('simulatorDesc')}</Text>

      <View style={[styles.builder, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.builderTitle, { color: colors.text }]}>{t('simulator')}</Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('simCounty')} *</Text>
        <Pressable
          onPress={() => setShowCountyPicker(true)}
          style={[styles.picker, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
        >
          <Text style={[styles.pickerText, { color: county ? colors.text : colors.textSecondary }]}>
            {county || t('simSelectCounty')}
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
        </Pressable>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('simVaccinationIncrease')}</Text>
        <View style={styles.stepperRow}>
          <Pressable
            onPress={() => setVaccinationIncrease((v) => Math.max(0, v - 5))}
            style={[styles.stepperBtn, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
          >
            <Ionicons name="remove" size={16} color={colors.text} />
          </Pressable>
          <Text style={[styles.stepperValue, { color: colors.tint }]}>+{vaccinationIncrease}%</Text>
          <Pressable
            onPress={() => setVaccinationIncrease((v) => Math.min(100, v + 5))}
            style={[styles.stepperBtn, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </Pressable>
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('simLivestockReduction')}</Text>
        <View style={styles.stepperRow}>
          <Pressable
            onPress={() => setLivestockReduction((v) => Math.max(0, v - 5))}
            style={[styles.stepperBtn, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
          >
            <Ionicons name="remove" size={16} color={colors.text} />
          </Pressable>
          <Text style={[styles.stepperValue, { color: colors.warning }]}>-{livestockReduction}%</Text>
          <Pressable
            onPress={() => setLivestockReduction((v) => Math.min(50, v + 5))}
            style={[styles.stepperBtn, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
          >
            <Ionicons name="add" size={16} color={colors.text} />
          </Pressable>
        </View>

        <Pressable
          onPress={handleSimulate}
          disabled={!county || loading}
          style={({ pressed }) => [
            styles.runBtn,
            { backgroundColor: colors.tint, opacity: (!county || loading || pressed) ? 0.7 : 1 },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="play-outline" size={16} color="#fff" />
          )}
          <Text style={styles.runBtnText}>{loading ? t('simSimulating') : t('simRun')}</Text>
        </Pressable>
      </View>

      {result && (
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <Text style={[styles.resultsTitle, { color: colors.text }]}>{t('simResults')}</Text>
            <View style={[styles.countyBadge, { backgroundColor: colors.tint + '20' }]}>
              <Text style={[styles.countyBadgeText, { color: colors.tint }]}>{result.county}</Text>
            </View>
          </View>
          <View style={styles.scenarioTags}>
            <View style={[styles.tag, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="arrow-up" size={12} color={colors.success} />
              <Text style={[styles.tagText, { color: colors.success }]}>+{result.scenario.vaccinationIncrease}% vaccination</Text>
            </View>
            {result.scenario.livestockReduction > 0 && (
              <View style={[styles.tag, { backgroundColor: colors.warning + '20' }]}>
                <Ionicons name="arrow-down" size={12} color={colors.warning} />
                <Text style={[styles.tagText, { color: colors.warning }]}>-{result.scenario.livestockReduction}% livestock</Text>
              </View>
            )}
          </View>
          {result.results.length > 0 ? result.results.map((r, i) => {
            const currentColor = RISK_COLORS[r.currentRiskLevel] || RISK_COLORS.medium;
            const projectedColor = RISK_COLORS[r.projectedRiskLevel] || RISK_COLORS.medium;
            return (
              <View key={i} style={[styles.diseaseCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm(colors.shadowColor, colors.shadowOpacity)]}>
                <View style={styles.diseaseHeader}>
                  <Text style={[styles.diseaseName, { color: colors.text }]}>{r.diseaseType}</Text>
                  {r.change === 'improved' && (
                    <View style={[styles.improvedBadge, { backgroundColor: colors.success + '20' }]}>
                      <Ionicons name="trending-down" size={12} color={colors.success} />
                      <Text style={[styles.improvedText, { color: colors.success }]}>{t('reduced')}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.riskTransition}>
                  <View style={[styles.riskBadge, { backgroundColor: currentColor + '20' }]}>
                    <Text style={[styles.riskText, { color: currentColor }]}>{r.currentRiskLevel}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={14} color={colors.textSecondary} />
                  <View style={[styles.riskBadge, { backgroundColor: projectedColor + '20' }]}>
                    <Text style={[styles.riskText, { color: projectedColor }]}>{r.projectedRiskLevel}</Text>
                  </View>
                </View>
                {r.factors.map((f) => (
                  <View key={f.name} style={styles.factorRow}>
                    <View style={[styles.factorDot, { backgroundColor: colors.tint }]} />
                    <Text style={[styles.factorDesc, { color: colors.textSecondary }]}>{f.description}</Text>
                    <Text style={[styles.factorWeight, { color: colors.textSecondary }]}>{Math.round(f.weight * 100)}%</Text>
                  </View>
                ))}
              </View>
            );
          }) : (
            <Text style={[styles.emptyResults, { color: colors.textSecondary }]}>{t('simEmpty')}</Text>
          )}
        </View>
      )}

      {!result && !loading && (
        <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Ionicons name="information-circle-outline" size={48} color={colors.tint} />
          <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>Select a county and adjust parameters to see projected outcomes.</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>Results are based on current disease risk models.</Text>
        </View>
      )}

      {showCountyPicker && (
        <Pressable style={styles.pickerOverlay} onPress={() => setShowCountyPicker(false)}>
          <Pressable style={[styles.pickerSheet, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
            <View style={styles.pickerHandle}>
              <View style={[styles.handle, { backgroundColor: colors.textSecondary }]} />
            </View>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>{t('simCounty')}</Text>
            <ScrollView style={styles.pickerList} nestedScrollEnabled>
              {counties.map((c) => (
                <Pressable
                  key={c.name}
                  onPress={() => { setCounty(c.name); setShowCountyPicker(false); }}
                  style={[styles.pickerOption, { borderBottomColor: colors.borderLight }]}
                >
                  <Text style={[styles.pickerOptionText, { color: county === c.name ? colors.tint : colors.text }]}>{c.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  desc: { fontSize: fontSize.sm, marginBottom: spacing.lg, lineHeight: 20 },
  builder: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md, marginBottom: spacing.lg },
  builderTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  picker: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  pickerText: { fontSize: fontSize.sm },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepperBtn: {
    width: 36, height: 36, borderRadius: radius.md, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  stepperValue: { fontSize: fontSize.md, fontWeight: fontWeight.bold, minWidth: 60, textAlign: 'center' },
  runBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    paddingVertical: spacing.md, borderRadius: radius.md, marginTop: spacing.sm,
  },
  runBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  resultsSection: { gap: spacing.md },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultsTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  countyBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  countyBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  scenarioTags: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill,
  },
  tagText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  diseaseCard: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm },
  diseaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diseaseName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  improvedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill,
  },
  improvedText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  riskTransition: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  riskBadge: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.sm },
  riskText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'capitalize' },
  factorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  factorDot: { width: 6, height: 6, borderRadius: 3 },
  factorDesc: { fontSize: fontSize.xs, flex: 1 },
  factorWeight: { fontSize: fontSize.xs },
  emptyResults: { textAlign: 'center', paddingVertical: spacing.xxl },
  emptyState: { padding: spacing.xxl, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center', gap: spacing.sm },
  emptyHint: { fontSize: fontSize.sm, textAlign: 'center' },
  emptySub: { fontSize: fontSize.xs, textAlign: 'center' },
  pickerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerSheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '70%' },
  pickerHandle: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.xs },
  handle: { width: 40, height: 4, borderRadius: 2 },
  pickerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, textAlign: 'center', paddingBottom: spacing.sm },
  pickerList: { maxHeight: 400 },
  pickerOption: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1 },
  pickerOptionText: { fontSize: fontSize.base },
});
