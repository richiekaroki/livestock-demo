import { useState } from 'react';
import { ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator, Image, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { impactMedium } from '@/src/services/haptics';
import { useI18n } from '@/src/i18n';
import { assessHealth, type HealthAssessmentResult } from '@/src/services/api';
import { ANIMAL_TYPES, STATUS_COLORS } from '@/constants/Shared';

export default function HealthAssessmentScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const t = useI18n().t as unknown as (key: string) => string;
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [animalType, setAnimalType] = useState('');
  const [animalName, setAnimalName] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<HealthAssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission', 'Camera roll permission is needed.'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, base64: true });
    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
      setImageBase64(res.assets[0].base64 ?? null);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission', 'Camera permission is needed.'); return; }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.8, base64: true });
    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
      setImageBase64(res.assets[0].base64 ?? null);
      setResult(null);
    }
  };

  const handleAssess = async () => {
    if (!imageBase64 || !animalType) { Alert.alert('Validation', 'Please select an image and animal type.'); return; }
    setLoading(true);
    try {
      const res = await assessHealth({
        imageBase64: `data:image/jpeg;base64,${imageBase64}`,
        animalType,
        ...(animalName ? { animalName } : {}),
        ...(notes ? { notes } : {}),
      });
      if (res.success) {
        impactMedium();
        setResult(res.data);
      } else {
        Alert.alert('Error', res.error || 'Assessment failed.');
      }
    } catch {
      Alert.alert('Error', 'Assessment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.text }]}>{t('healthAssessment')}</Text>

      <View style={[styles.photoSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: colors.background }]}>
            <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>{t('uploadPhoto')}</Text>
          </View>
        )}
        <View style={styles.photoBtns}>
          <Pressable onPress={pickImage} style={[styles.photoBtn, { backgroundColor: colors.tint }]}>
            <Ionicons name="images-outline" size={16} color="#fff" />
            <Text style={styles.photoBtnText}>Gallery</Text>
          </Pressable>
          <Pressable onPress={takePhoto} style={[styles.photoBtn, { backgroundColor: colors.tint }]}>
            <Ionicons name="camera-outline" size={16} color="#fff" />
            <Text style={styles.photoBtnText}>Camera</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('animalType')} *</Text>
        <View style={styles.chipWrap}>
          {ANIMAL_TYPES.map((type) => (
            <Pressable
              key={type}
              onPress={() => setAnimalType(type)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: animalType === type ? colors.tint : colors.background,
                  borderColor: animalType === type ? colors.tint : colors.borderLight,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: animalType === type ? '#fff' : colors.text }]}>{type}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('animalName')}</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
          value={animalName}
          onChangeText={setAnimalName}
          placeholder={t('animalNamePlaceholder')}
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>{t('mortalityNotes')}</Text>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text }]}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('observedSymptoms')}
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
        />

        <Pressable
          onPress={handleAssess}
          disabled={!imageUri || !animalType || loading}
          style={({ pressed }) => [
            styles.assessBtn,
            { backgroundColor: colors.tint, opacity: (!imageUri || !animalType || loading || pressed) ? 0.7 : 1 },
          ]}
        >
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="scan-outline" size={16} color="#fff" />}
          <Text style={styles.assessBtnText}>{loading ? t('assessing') : t('assessHealth')}</Text>
        </Pressable>
      </View>

      {result && (
        <View style={[styles.resultSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.resultTitle, { color: colors.text }]}>{t('assessmentResult')}</Text>
          <View style={[styles.statusCard, { backgroundColor: (STATUS_COLORS[result.overallStatus] || colors.tint) + '20' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[result.overallStatus] || colors.tint }]}>
              {result.overallStatus.replace('_', ' ')}
            </Text>
            <Text style={[styles.confidenceText, { color: colors.textSecondary }]}>{result.confidence}% {t('confidence')}</Text>
          </View>

          {result.findings.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('findings')}</Text>
              {result.findings.map((f, i) => (
                <View key={i} style={[styles.findingCard, { backgroundColor: colors.background }]}>
                  <View style={styles.findingHeader}>
                    <Text style={[styles.findingCategory, { color: colors.text }]}>{f.category}</Text>
                    <Text style={[styles.findingStatus, { color: STATUS_COLORS[f.status] || colors.tint }]}>{f.status}</Text>
                  </View>
                  <Text style={[styles.findingDesc, { color: colors.textSecondary }]}>{f.description}</Text>
                  <Text style={[styles.findingConf, { color: colors.textSecondary }]}>{f.confidence}%</Text>
                </View>
              ))}
            </>
          )}

          {result.recommendations.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('recommendations')}</Text>
              {result.recommendations.map((r, i) => (
                <View key={i} style={styles.recRow}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={colors.success} />
                  <Text style={[styles.recText, { color: colors.textSecondary }]}>{r}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginBottom: spacing.lg },
  photoSection: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden', marginBottom: spacing.lg },
  preview: { width: '100%', height: 200 },
  placeholder: { width: '100%', height: 200, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  placeholderText: { fontSize: fontSize.sm },
  photoBtns: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  photoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    paddingVertical: spacing.sm, borderRadius: radius.md,
  },
  photoBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  form: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md, marginBottom: spacing.lg },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1 },
  chipText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  input: { borderRadius: radius.md, borderWidth: 1, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  textArea: { minHeight: 60 },
  assessBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    paddingVertical: spacing.md, borderRadius: radius.md, marginTop: spacing.sm,
  },
  assessBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  resultSection: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md },
  resultTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  statusCard: { padding: spacing.md, borderRadius: radius.md, alignItems: 'center', gap: spacing.xs },
  statusText: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, textTransform: 'capitalize' },
  confidenceText: { fontSize: fontSize.sm },
  sectionTitle: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, marginTop: spacing.sm },
  findingCard: { padding: spacing.md, borderRadius: radius.md, gap: spacing.xs },
  findingHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  findingCategory: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  findingStatus: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'capitalize' },
  findingDesc: { fontSize: fontSize.sm },
  findingConf: { fontSize: fontSize.xs },
  recRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  recText: { fontSize: fontSize.sm, flex: 1 },
});
