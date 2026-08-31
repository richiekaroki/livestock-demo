import { useState } from 'react';
import { ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { impactMedium } from '@/src/services/haptics';
import { useI18n } from '@/src/i18n';
import { importAnimalsCsv } from '@/src/services/api';

export default function CsvImportScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const t = useI18n().t as unknown as (key: string) => string;
  const [file, setFile] = useState<{ uri: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'text/csv', copyToCacheDirectory: true });
      if (!res.canceled && res.assets[0]) {
        setFile({ uri: res.assets[0].uri, name: res.assets[0].name });
        setResult(null);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick file.');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await importAnimalsCsv(file.uri, file.name);
      if (res.success) {
        impactMedium();
        setResult(res.data);
      } else {
        Alert.alert('Error', res.error || 'Import failed.');
      }
    } catch {
      Alert.alert('Error', 'Import failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{t('csvImport')}</Text>
      <Text style={[styles.desc, { color: colors.textSecondary }]}>{t('csvImportDesc')}</Text>

      <View style={[styles.formatCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.formatTitle, { color: colors.text }]}>{t('expectedFormat')}</Text>
        <View style={[styles.codeBlock, { backgroundColor: colors.background }]}>
          <Text style={[styles.code, { color: colors.text }]}>name,type,county,owner,breed,health</Text>
          <Text style={[styles.code, { color: colors.textSecondary }]}>Shujaa,Cattle,Nairobi,John,Holstein,Healthy</Text>
          <Text style={[styles.code, { color: colors.textSecondary }]}>Penda,Goat,Mombasa,Amina,East African,Sick</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.destructive }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('required')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.textSecondary }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>{t('optional')}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.uploadCard, { backgroundColor: colors.card, borderColor: file ? colors.tint : colors.cardBorder }]}>
        <Pressable onPress={pickFile} style={styles.uploadBtn}>
          <Ionicons name="document-text-outline" size={32} color={colors.tint} />
          <Text style={[styles.uploadText, { color: colors.text }]}>{file ? file.name : t('selectCsvFile')}</Text>
          <Text style={[styles.uploadHint, { color: colors.textSecondary }]}>.csv {t('upTo')}</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={handleImport}
        disabled={!file || loading}
        style={({ pressed }) => [
          styles.importBtn,
          { backgroundColor: colors.tint, opacity: (!file || loading || pressed) ? 0.7 : 1 },
        ]}
      >
        {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="cloud-upload-outline" size={16} color="#fff" />}
        <Text style={styles.importBtnText}>{loading ? t('importing') : t('importBtn')}</Text>
      </Pressable>

      {result && (
        <View style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Ionicons name={result.errors.length === 0 ? 'checkmark-circle' : 'alert-circle'} size={32} color={result.errors.length === 0 ? colors.success : colors.warning} />
          <Text style={[styles.resultTitle, { color: colors.text }]}>
            {result.imported} {t('animalsImported')}
          </Text>
          {result.errors.length > 0 && (
            <View style={styles.errorsWrap}>
              <Text style={[styles.errorsTitle, { color: colors.destructive }]}>{t('errors')}:</Text>
              {result.errors.map((e, i) => (
                <Text key={i} style={[styles.errorText, { color: colors.textSecondary }]}>{e}</Text>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: spacing.xs },
  desc: { fontSize: fontSize.sm, marginBottom: spacing.lg, lineHeight: 20 },
  formatCard: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.lg, gap: spacing.sm },
  formatTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  codeBlock: { padding: spacing.md, borderRadius: radius.md, gap: 2 },
  code: { fontSize: fontSize.xs, fontFamily: 'monospace' },
  legendRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: fontSize.xs },
  uploadCard: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 2, borderStyle: 'dashed', marginBottom: spacing.lg },
  uploadBtn: { alignItems: 'center', gap: spacing.sm },
  uploadText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  uploadHint: { fontSize: fontSize.xs },
  importBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    paddingVertical: spacing.md, borderRadius: radius.md, marginBottom: spacing.lg,
  },
  importBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  resultCard: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center', gap: spacing.sm },
  resultTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  errorsWrap: { width: '100%', gap: spacing.xs },
  errorsTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  errorText: { fontSize: fontSize.xs },
});
