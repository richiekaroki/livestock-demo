import { useState, useEffect } from 'react';
import {
  StyleSheet, ScrollView, TextInput, Pressable, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { impactLight, impactMedium, notificationSuccess } from '@/src/services/haptics';
import { useToast } from '@/src/components/Toast';
import { useI18n } from '@/src/i18n';
import * as api from '@/src/services/api';
import { logger } from '@/src/utils/logger';
import { statusColors } from '@/constants/Colors';
import * as Location from 'expo-location';

interface Outbreak {
  id: number;
  diseaseType: string;
  affectedAnimals: number;
  suspectedAnimals: number;
  county: string;
  reportedBy: string;
  reportedAt: string;
  symptoms: string[];
  actions: string[];
  status: string;
}

export default function OutbreaksScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { t } = useI18n();
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [diseaseType, setDiseaseType] = useState('');
  const [affectedAnimals, setAffectedAnimals] = useState('');
  const [county, setCounty] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [reportedBy, setReportedBy] = useState('');
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getOutbreaks();
      if (res.success && Array.isArray(res.data)) {
        setOutbreaks(res.data);
      }
    } catch (err) {
      logger.warn('[Outbreaks] Failed to fetch:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Auto-capture GPS when form opens
  useEffect(() => {
    if (showForm && !gpsCoords) {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setGpsCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
          }
        } catch {
          // GPS unavailable — submit with 0,0
        }
      })();
    }
  }, [showForm]);

  const handleSubmit = async () => {
    if (!diseaseType.trim() || !affectedAnimals || !county.trim() || !reportedBy.trim()) {
      showToast('error', t('diseaseType') + ', ' + t('affectedAnimals') + ', ' + t('county') + ' ' + t('reportedBy') + ' are required');
      return;
    }
    impactMedium();
    try {
      await api.reportOutbreak({
        diseaseType: diseaseType.trim(),
        affectedAnimals: Number(affectedAnimals),
        county: county.trim(),
        lat: gpsCoords?.lat ?? 0,
        lng: gpsCoords?.lng ?? 0,
        reportedBy: reportedBy.trim(),
        symptoms: symptoms.split(',').map((s) => s.trim()).filter(Boolean),
        actions: actionsTaken.split(',').map((a) => a.trim()).filter(Boolean),
      });
      setShowForm(false);
      setDiseaseType('');
      setAffectedAnimals('');
      setCounty('');
      setSymptoms('');
      setActionsTaken('');
      setReportedBy('');
      notificationSuccess();
      showToast('success', 'Outbreak reported');
      fetchData();
    } catch {
      showToast('error', 'Failed to report outbreak');
    }
  };

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    impactLight();
    try {
      await api.updateOutbreak(id, { status: newStatus });
      fetchData();
    } catch {
      showToast('error', 'Failed to update status');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={colors.tint} />}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>{t('outbreaks')}</Text>
        <Pressable
          onPress={() => { impactLight(); setShowForm(!showForm); }}
          style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.tint, opacity: pressed ? 0.85 : 1 }]}
          accessibilityLabel={showForm ? 'Cancel' : 'Report outbreak'}
        >
          <Ionicons name={showForm ? 'close' : 'add'} size={20} color="#fff" />
          <Text style={styles.addBtnText}>{showForm ? t('cancel') : t('reportOutbreak')}</Text>
        </Pressable>
      </View>

      {showForm && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('reportOutbreak')}</Text>

          <Text style={[styles.label, { color: colors.text }]}>{t('diseaseType')} *</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={diseaseType} onChangeText={setDiseaseType} placeholder="e.g. Foot and Mouth Disease" placeholderTextColor={colors.placeholder} />

          <Text style={[styles.label, { color: colors.text }]}>{t('affectedAnimals')} *</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={affectedAnimals} onChangeText={setAffectedAnimals} placeholder="Number of animals" keyboardType="numeric" placeholderTextColor={colors.placeholder} />

          <Text style={[styles.label, { color: colors.text }]}>{t('county')} *</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={county} onChangeText={setCounty} placeholder="e.g. Nakuru" placeholderTextColor={colors.placeholder} />

          <Text style={[styles.label, { color: colors.text }]}>{t('reportedBy')} *</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={reportedBy} onChangeText={setReportedBy} placeholder="Veterinarian name" placeholderTextColor={colors.placeholder} />

          <Text style={[styles.label, { color: colors.text }]}>{t('symptoms')}</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={symptoms} onChangeText={setSymptoms} placeholder="Comma-separated" placeholderTextColor={colors.placeholder} />

          <Text style={[styles.label, { color: colors.text }]}>{t('actionsTaken')}</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={actionsTaken} onChangeText={setActionsTaken} placeholder="Comma-separated" placeholderTextColor={colors.placeholder} />

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [styles.submitBtn, { backgroundColor: colors.tint, opacity: pressed ? 0.85 : 1 }]}
            accessibilityLabel="Submit outbreak report"
          >
            <Ionicons name="alert-circle-outline" size={18} color="#fff" />
            <Text style={styles.submitBtnText}>{t('submitReport')}</Text>
          </Pressable>
        </View>
      )}

      {loading && outbreaks.length === 0 && !showForm ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="hourglass-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('loadingOutbreaks')}</Text>
        </View>
      ) : outbreaks.length === 0 && !showForm ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="shield-checkmark-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noOutbreaks')}</Text>
        </View>
      ) : (
        outbreaks.map((o) => {
          const statusColor = statusColors[o.status] || colors.textSecondary;
          return (
            <View key={o.id} style={[styles.outbreakRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.outbreakHeader}>
                <View style={[styles.outbreakIcon, { backgroundColor: statusColor + '20' }]}>
                  <Ionicons name="warning-outline" size={16} color={statusColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.outbreakName, { color: colors.text }]}>{o.diseaseType}</Text>
                  <Text style={[styles.outbreakMeta, { color: colors.textSecondary }]}>
                    {o.county} · {o.affectedAnimals} affected · {o.reportedBy}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {t(o.status as 'reported' | 'investigating' | 'contained' | 'resolved')}
                  </Text>
                </View>
              </View>

              {o.symptoms.length > 0 && (
                <Text style={[styles.outbreakDetail, { color: colors.textSecondary }]}>
                  Symptoms: {o.symptoms.join(', ')}
                </Text>
              )}
              {o.actions.length > 0 && (
                <Text style={[styles.outbreakDetail, { color: colors.textSecondary }]}>
                  Actions: {o.actions.join(', ')}
                </Text>
              )}
              <Text style={[styles.outbreakDate, { color: colors.textSecondary }]}>
                {new Date(o.reportedAt).toLocaleDateString()}
              </Text>

              <View style={styles.statusRow}>
                {['reported', 'investigating', 'contained', 'resolved'].map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => handleStatusUpdate(o.id, s)}
                    style={({ pressed }) => [
                      styles.statusBtn,
                      {
                        backgroundColor: o.status === s ? (statusColors[s] || colors.textSecondary) : 'transparent',
                        borderColor: statusColors[s] || colors.textSecondary,
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.statusBtnText, { color: o.status === s ? '#fff' : colors.text }]}>
                      {t(s as 'reported' | 'investigating' | 'contained' | 'resolved')}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md },
  addBtnText: { color: '#fff', fontWeight: fontWeight.semibold, fontSize: fontSize.sm },
  card: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, gap: spacing.sm },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold, marginBottom: spacing.xs },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginTop: spacing.sm },
  input: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: fontSize.base },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg, borderRadius: radius.md, marginTop: spacing.md },
  submitBtnText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.base },
  emptyWrap: { alignItems: 'center', marginTop: spacing.section, gap: spacing.md },
  emptyText: { fontSize: fontSize.base },
  outbreakRow: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, gap: spacing.sm },
  outbreakHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  outbreakIcon: { width: 32, height: 32, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  outbreakName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  outbreakMeta: { fontSize: fontSize.xs },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  statusText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  outbreakDetail: { fontSize: fontSize.xs },
  outbreakDate: { fontSize: fontSize.xs, marginTop: spacing.xs },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  statusBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: radius.pill, borderWidth: 1 },
  statusBtnText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
});
