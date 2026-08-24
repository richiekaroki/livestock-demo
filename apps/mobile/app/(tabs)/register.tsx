import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

import { Text, View, useColors } from '@/components/Themed';
import { captureAnimalPhoto } from '@/src/services/camera';
import * as api from '@/src/services/api';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { impactMedium, notificationSuccess, notificationError, selectionChanged } from '@/src/services/haptics';
import { useToast } from '@/src/components/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KENYA_COUNTIES, LIVESTOCK_TYPES } from '@wam-mfugo/shared';
import type { AnimalType, BiometricData, Farmer, Livestock } from '@wam-mfugo/shared';

export default function RegisterScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [biometric, setBiometric] = useState<BiometricData | null>(null);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [type, setType] = useState<AnimalType>('Cattle');
  const [county, setCounty] = useState(KENYA_COUNTIES[0]?.name ?? 'Nakuru');
  const [owner, setOwner] = useState('');

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState<number | undefined>(undefined);

  useEffect(() => {
    api.getFarmers().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setFarmers(res.data);
      }
    }).catch(() => {});
  }, []);

  const handleFarmerChange = (farmerIdStr: string) => {
    if (!farmerIdStr) {
      setSelectedFarmerId(undefined);
      return;
    }
    const fid = Number(farmerIdStr);
    const farmer = farmers.find((f) => f.id === fid);
    if (farmer) {
      setSelectedFarmerId(farmer.id);
      setOwner(farmer.name);
      if (farmer.county) setCounty(farmer.county);
    }
  };

  const capture = async () => {
    const data = await captureAnimalPhoto(cameraRef.current);
    if (data) {
      setBiometric(data);
      setShowCamera(false);
    }
  };

  const submit = async () => {
    if (!name.trim() || !county.trim() || !owner.trim()) {
      notificationError();
      showToast('error', 'Name, county and owner are required.');
      return;
    }

    impactMedium();
    const payload: Omit<Livestock, 'id'> = {
      name: name.trim(),
      type,
      health: 'Healthy',
      county: county.trim(),
      owner: owner.trim(),
      lat: biometric?.captureLocation.lat ?? 0,
      lng: biometric?.captureLocation.lng ?? 0,
      ...(selectedFarmerId != null ? { farmerId: selectedFarmerId } : {}),
      biometricData: biometric ?? undefined,
    };

    try {
      const result = await api.apiCall<api.ApiResponse<Livestock>>('POST', '/animals', payload);
      if (result && 'queued' in result && result.queued) {
        notificationSuccess();
        showToast('warning', 'Registration queued — will sync when online');
      } else {
        notificationSuccess();
        showToast('success', `${payload.name} was registered.`);
      }
      setName('');
      setCounty(KENYA_COUNTIES[0]?.name ?? 'Nakuru');
      setOwner('');
      setSelectedFarmerId(undefined);
      setBiometric(null);
    } catch {
      notificationError();
      showToast('error', 'Registration failed. Please try again.');
    }
  };

  if (showCamera) {
    if (!permission) {
      return (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <Ionicons name="hourglass-outline" size={24} color={colors.textSecondary} />
          <Text style={{ color: colors.textSecondary }}>Loading camera…</Text>
        </View>
      );
    }
    if (!permission.granted) {
      return (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <Ionicons name="camera-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.centerText, { color: colors.text }]}>
            We need camera permission to capture biometrics.
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: colors.tint, opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={requestPermission}
          >
            <Ionicons name="lock-open-outline" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Grant permission</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          mode="picture"
        />
        <Pressable
          style={({ pressed }) => [
            styles.captureBtn,
            { bottom: insets.bottom + 24, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => void capture()}
        >
           <Ionicons name="camera-outline" size={24} color="#fff" />
          <Text style={styles.captureBtnText}>Capture</Text>
        </Pressable>
      </View>
    );
  }

  const inputStyle = [
    styles.input,
    {
      backgroundColor: colors.inputBg,
      borderColor: colors.inputBorder,
      color: colors.text,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={88}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      <Text style={[styles.title, { color: colors.text }]}>Register Animal</Text>

      <Text style={[styles.label, { color: colors.text }]}>Name</Text>
      <TextInput
        style={inputStyle}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Shujaa"
        placeholderTextColor={colors.placeholder}
      />

      <Text style={[styles.label, { color: colors.text }]}>Type</Text>
      <View style={styles.chipRow}>
        {LIVESTOCK_TYPES.map((t) => (
          <Pressable
            key={t}
            onPress={() => {
              selectionChanged();
              setType(t);
            }}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: type === t ? colors.tint : colors.card,
                borderColor: type === t ? colors.tint : colors.borderLight,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Text style={[styles.chipText, { color: type === t ? '#fff' : colors.text }]}>
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.text }]}>County</Text>
      <View style={styles.chipRow}>
        {KENYA_COUNTIES.slice(0, 12).map((c) => (
          <Pressable
            key={c.code}
            onPress={() => {
              selectionChanged();
              setCounty(c.name);
            }}
            style={({ pressed }) => [
              styles.chip,
              {
                backgroundColor: county === c.name ? colors.tint : colors.card,
                borderColor: county === c.name ? colors.tint : colors.borderLight,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Text style={[styles.chipText, { color: county === c.name ? '#fff' : colors.text }]}>
              {c.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {farmers.length > 0 && (
        <>
          <Text style={[styles.label, { color: colors.text }]}>Farmer (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            <Pressable
              onPress={() => {
                selectionChanged();
                handleFarmerChange('');
              }}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: !selectedFarmerId ? colors.tint : colors.card,
                  borderColor: !selectedFarmerId ? colors.tint : colors.borderLight,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}
            >
              <Text style={[styles.chipText, { color: !selectedFarmerId ? '#fff' : colors.text }]}>
                None
              </Text>
            </Pressable>
            {farmers.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => {
                  selectionChanged();
                  handleFarmerChange(String(f.id));
                }}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: selectedFarmerId === f.id ? colors.tint : colors.card,
                    borderColor: selectedFarmerId === f.id ? colors.tint : colors.borderLight,
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: selectedFarmerId === f.id ? '#fff' : colors.text }]}>
                  {f.code} · {f.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}

      <Text style={[styles.label, { color: colors.text }]}>Owner</Text>
      <TextInput
        style={inputStyle}
        value={owner}
        onChangeText={(text) => {
          setOwner(text);
          setSelectedFarmerId(undefined);
        }}
        placeholder="Owner name"
        placeholderTextColor={colors.placeholder}
      />

      <Pressable
        style={({ pressed }) => [
          styles.secondaryBtn,
          { borderColor: colors.tint, opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={() => setShowCamera(true)}
      >
        <Ionicons
          name={biometric ? 'checkmark-circle-outline' : 'camera-outline'}
          size={18}
          color={colors.tint}
        />
        <Text style={[styles.secondaryBtnText, { color: colors.tint }]}>
          {biometric ? 'Biometric captured — recapture?' : 'Capture biometrics'}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.primaryBtn,
          { backgroundColor: colors.tint, opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={() => void submit()}
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" />
        <Text style={styles.primaryBtnText}>Register animal</Text>
      </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.section },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginBottom: spacing.sm },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginTop: spacing.md },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginTop: spacing.lg,
  },
  primaryBtnText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.base },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginTop: spacing.lg,
  },
  secondaryBtnText: { fontWeight: fontWeight.semibold, fontSize: fontSize.base },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xxxl },
  centerText: { textAlign: 'center', fontSize: fontSize.md },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  captureBtn: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#15803D',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  captureBtnText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.base },
});
