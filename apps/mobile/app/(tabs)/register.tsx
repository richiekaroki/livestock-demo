import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import { Text, View } from '@/components/Themed';
import { captureAnimalPhoto } from '@/src/camera';
import { useAnimals } from '@/src/useAnimals';
import * as api from '@/src/api';
import { KENYA_COUNTIES, LIVESTOCK_TYPES } from '@wam-mfugo/shared';
import type { AnimalType, BiometricData, Farmer, Livestock } from '@wam-mfugo/shared';

export default function RegisterScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [biometric, setBiometric] = useState<BiometricData | null>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<AnimalType>('Cattle');
  const [county, setCounty] = useState(KENYA_COUNTIES[0]?.name ?? 'Nakuru');
  const [owner, setOwner] = useState('');

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [selectedFarmerId, setSelectedFarmerId] = useState<number | undefined>(undefined);

  const { addAnimal } = useAnimals();

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
      Alert.alert('Missing fields', 'Name, county and owner are required.');
      return;
    }

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

    const created = await addAnimal(payload);
    if (created) {
      Alert.alert('Registered', `${payload.name} was registered.`);
      setName('');
      setCounty(KENYA_COUNTIES[0]?.name ?? 'Nakuru');
      setOwner('');
      setSelectedFarmerId(undefined);
      setBiometric(null);
    } else {
      Alert.alert('Offline', 'Queued to sync when connectivity returns.');
    }
  };

  if (showCamera) {
    if (!permission) {
      return <View style={styles.center}><Text>Loading camera…</Text></View>;
    }
    if (!permission.granted) {
      return (
        <View style={styles.center}>
          <Text style={styles.centerText}>
            We need camera permission to capture biometrics.
          </Text>
          <Pressable style={styles.primaryBtn} onPress={requestPermission}>
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
        <Pressable style={styles.captureBtn} onPress={() => void capture()}>
          <Text style={styles.captureBtnText}>📸 Capture</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Register Animal</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Shujaa"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Type</Text>
      <View style={styles.chipRow}>
        {LIVESTOCK_TYPES.map((t) => (
          <Pressable
            key={t}
            onPress={() => setType(t)}
            style={[styles.chip, type === t && styles.chipActive]}>
            <Text style={type === t ? styles.chipTextActive : styles.chipText}>
              {t}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>County</Text>
      <View style={styles.chipRow}>
        {KENYA_COUNTIES.slice(0, 12).map((c) => (
          <Pressable
            key={c.code}
            onPress={() => setCounty(c.name)}
            style={[styles.chip, county === c.name && styles.chipActive]}>
            <Text style={county === c.name ? styles.chipTextActive : styles.chipText}>
              {c.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {farmers.length > 0 && (
        <>
          <Text style={styles.label}>Farmer (optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            <Pressable
              onPress={() => handleFarmerChange('')}
              style={[styles.chip, !selectedFarmerId && styles.chipActive]}>
              <Text style={!selectedFarmerId ? styles.chipTextActive : styles.chipText}>
                None
              </Text>
            </Pressable>
            {farmers.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => handleFarmerChange(String(f.id))}
                style={[styles.chip, selectedFarmerId === f.id && styles.chipActive]}>
                <Text style={selectedFarmerId === f.id ? styles.chipTextActive : styles.chipText}>
                  {f.code} · {f.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}

      <Text style={styles.label}>Owner</Text>
      <TextInput
        style={styles.input}
        value={owner}
        onChangeText={(text) => {
          setOwner(text);
          setSelectedFarmerId(undefined);
        }}
        placeholder="Owner name"
        placeholderTextColor="#999"
      />

      <Pressable style={styles.secondaryBtn} onPress={() => setShowCamera(true)}>
        <Text style={styles.secondaryBtnText}>
          {biometric ? '✅ Biometric captured — recapture?' : '📷 Capture biometrics'}
        </Text>
      </Pressable>

      <Pressable style={styles.primaryBtn} onPress={() => void submit()}>
        <Text style={styles.primaryBtnText}>Register animal</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 8 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipActive: { backgroundColor: '#22c55e' },
  chipText: { fontSize: 13 },
  chipTextActive: { fontSize: 13, color: '#fff', fontWeight: '600' },
  primaryBtn: {
    backgroundColor: '#22c55e',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#22c55e',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryBtnText: { color: '#22c55e', fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  centerText: { textAlign: 'center', fontSize: 15 },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  captureBtn: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    backgroundColor: '#22c55e',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 32,
  },
  captureBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});