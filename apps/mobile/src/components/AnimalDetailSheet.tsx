import { forwardRef, useMemo, useCallback, useState, useEffect } from 'react';
import { StyleSheet, View as RNView, Image, Pressable, Alert, TextInput, ActivityIndicator } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight, shadows } from '@/constants/Tokens';
import { updateAnimal as apiUpdateAnimal, registerKIAMIS } from '@/src/services/api';
import { impactMedium } from '@/src/services/haptics';
import type { Livestock } from '@wam-mfugo/shared';
import { KENYA_COUNTIES, LIVESTOCK_TYPES } from '@wam-mfugo/shared';
import type { AnimalType, HealthStatus } from '@wam-mfugo/shared';

// Suppress TS type incompatibility with Expo SDK 54
const BottomSheetAny = BottomSheet as any;
const BottomSheetScrollViewAny = BottomSheetScrollView as any;

interface AnimalDetailSheetProps {
  animal: Livestock | null;
  onClose: () => void;
  onSaved?: () => void;
}

const AnimalDetailSheet = forwardRef<any, AnimalDetailSheetProps>(
  ({ animal, onClose, onSaved }, ref) => {
    const colors = useColors();
    const snapPoints = useMemo(() => ['40%', '75%'], []);
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editType, setEditType] = useState<AnimalType>('Cattle');
    const [editBreed, setEditBreed] = useState('');
    const [editCounty, setEditCounty] = useState('');
    const [editOwner, setEditOwner] = useState('');
    const [editHealth, setEditHealth] = useState<HealthStatus>('Healthy');
    const [isSaving, setIsSaving] = useState(false);
    const [kiamisLoading, setKiamisLoading] = useState(false);
    const [kiamisResult, setKiamisResult] = useState<{
      registrationNumber: string;
      qrCode: string;
    } | null>(null);

    useEffect(() => {
      if (animal) {
        setEditName(animal.name);
        setEditType(animal.type);
        setEditBreed(animal.breed ?? '');
        setEditCounty(animal.county);
        setEditOwner(animal.owner);
        setEditHealth(animal.health);
        setEditMode(false);
      }
    }, [animal]);

    const handleSave = useCallback(async () => {
      if (!animal) return;
      if (!editName.trim() || !editOwner.trim()) {
        Alert.alert('Validation', 'Name and owner are required.');
        return;
      }
      setIsSaving(true);
      try {
        await apiUpdateAnimal(animal.id, {
          name: editName,
          type: editType,
          breed: editBreed || undefined,
          county: editCounty,
          owner: editOwner,
          health: editHealth,
        });
        impactMedium();
        setEditMode(false);
        onSaved?.();
      } catch {
        Alert.alert('Error', 'Failed to update animal. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }, [animal, editName, editType, editBreed, editCounty, editOwner, editHealth, onSaved]);

    const handleKiamisRegister = useCallback(async () => {
      if (!animal) return;
      setKiamisLoading(true);
      try {
        const response = await registerKIAMIS({
          animalType: animal.type,
          ownerNationalID: '',
          countyCode: animal.county.slice(0, 3).toUpperCase(),
          subCountyCode: '001',
          wardCode: '001',
          biometricHash: animal.biometricData?.nosePrintHash || 'N/A',
          gpsCoordinates: { lat: animal.lat, lng: animal.lng },
          timestamp: new Date().toISOString(),
        });
        if (response.success && response.data) {
          setKiamisResult({
            registrationNumber: response.data.animalRegistrationNumber,
            qrCode: response.data.qrCode,
          });
          Alert.alert(
            'KIAMIS Registration',
            `Registration #${response.data.animalRegistrationNumber}\n\n${response.data.message}`
          );
        } else {
          Alert.alert('Registration Failed', response.error || 'Please try again.');
        }
      } catch {
        Alert.alert('Error', 'Failed to register with KIAMIS. Please try again.');
      } finally {
        setKiamisLoading(false);
      }
    }, [animal]);

    const handleSheetChanges = useCallback((index: number) => {
      if (index === -1) onClose();
    }, [onClose]);

    if (!animal) return null;

    const healthColor =
      animal.health === 'Healthy' ? colors.success :
      animal.health === 'Sick' ? colors.destructive :
      animal.health === 'Under Treatment' ? colors.warning :
      colors.info;

    const healthBg =
      animal.health === 'Healthy' ? colors.tintLight :
      animal.health === 'Sick' ? colors.destructiveLight :
      animal.health === 'Under Treatment' ? colors.accentLight :
      colors.tintLight;

    const typeColor =
      animal.type === 'Cattle' ? colors.typeCattle :
      animal.type === 'Goat' ? colors.typeGoat :
      animal.type === 'Sheep' ? colors.typeSheep :
      animal.type === 'Camel' ? colors.typeCamel :
      animal.type === 'Pig' ? colors.typePig :
      colors.typeChicken;

    return (
      <BottomSheetAny
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backgroundStyle={[sheetStyles.bg, { backgroundColor: colors.surface }]}
        handleIndicatorStyle={[sheetStyles.handle, { backgroundColor: colors.textSecondary }]}
        handleStyle={sheetStyles.handleBar}
      >
        <BottomSheetScrollViewAny contentContainerStyle={sheetStyles.content}>
          <View style={sheetStyles.header}>
            <View style={[sheetStyles.iconWrap, { backgroundColor: colors.tintLight }]}>
              <Ionicons name="paw-outline" size={28} color={typeColor} />
            </View>
            <View style={sheetStyles.headerText}>
              <Text style={[sheetStyles.name, { color: colors.text }]}>{animal.name}</Text>
              <Text style={[sheetStyles.type, { color: colors.textSecondary }]}>
                {animal.type} · {animal.county}
              </Text>
            </View>
            <Pressable
              onPress={() => {
                impactMedium();
                setEditMode(!editMode);
              }}
              style={({ pressed }) => [
                sheetStyles.editBtn,
                { backgroundColor: editMode ? colors.destructive : colors.tintLight, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Ionicons
                name={editMode ? 'close-outline' : 'create-outline'}
                size={18}
                color={editMode ? '#fff' : colors.tint}
              />
              <Text style={[sheetStyles.editBtnText, { color: editMode ? '#fff' : colors.tint }]}>
                {editMode ? 'Cancel' : 'Edit'}
              </Text>
            </Pressable>
          </View>

          <View style={[sheetStyles.badgeRow, { gap: spacing.sm }]}>
            <View style={[sheetStyles.badge, { backgroundColor: healthBg }]}>
              <Ionicons
                name={
                  animal.health === 'Healthy' ? 'heart-outline' :
                  animal.health === 'Sick' ? 'medkit-outline' :
                  animal.health === 'Under Treatment' ? 'pulse-outline' :
                  'checkmark-circle-outline'
                }
                size={14}
                color={healthColor}
              />
              <Text style={[sheetStyles.badgeText, { color: healthColor }]}>{animal.health}</Text>
            </View>
            <View style={[sheetStyles.badge, { backgroundColor: typeColor + '15' }]}>
              <Ionicons name="pricetag-outline" size={14} color={typeColor} />
              <Text style={[sheetStyles.badgeText, { color: typeColor }]}>{animal.type}</Text>
            </View>
          </View>

          <View style={[sheetStyles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {editMode ? (
              <>
                <SheetField label="Name" value={editName} onChangeText={setEditName} colors={colors} />
                <SheetSelect label="Type" value={editType} options={LIVESTOCK_TYPES as AnimalType[]} onValueChange={(v) => setEditType(v as AnimalType)} colors={colors} />
                <SheetField label="Breed" value={editBreed} onChangeText={setEditBreed} placeholder="Optional" colors={colors} />
                <SheetSelect label="County" value={editCounty} options={KENYA_COUNTIES.map((c) => c.name)} onValueChange={setEditCounty} colors={colors} />
                <SheetField label="Owner" value={editOwner} onChangeText={setEditOwner} colors={colors} />
                <SheetSelect
                  label="Health"
                  value={editHealth}
                  options={['Healthy', 'Sick', 'Under Treatment', 'Recovered'] as HealthStatus[]}
                  onValueChange={(v) => setEditHealth(v as HealthStatus)}
                  colors={colors}
                />
                <Pressable
                  onPress={handleSave}
                  disabled={isSaving}
                  style={({ pressed }) => [
                    sheetStyles.saveBtn,
                    { backgroundColor: colors.tint, opacity: isSaving || pressed ? 0.7 : 1 },
                  ]}
                >
                  <Ionicons name="checkmark-outline" size={16} color="#fff" />
                  <Text style={sheetStyles.saveBtnText}>{isSaving ? 'Saving...' : 'Save Changes'}</Text>
                </Pressable>
              </>
            ) : (
              <>
                <DetailRow icon="person-outline" label="Owner" value={animal.owner} colors={colors} />
                <DetailRow icon="location-outline" label="County" value={animal.county} colors={colors} />
                {animal.breed && <DetailRow icon="information-circle-outline" label="Breed" value={animal.breed} colors={colors} />}
                <DetailRow icon="finger-print-outline" label="ID" value={`#${animal.id}`} colors={colors} mono />
              </>
            )}
          </View>

          {animal.biometricData && (
            <View style={[sheetStyles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[sheetStyles.sectionTitle, { color: colors.text }]}>Biometric Data</Text>
              <DetailRow icon="camera-outline" label="Nose Print" value={animal.biometricData?.nosePrintHash ? 'Captured' : 'Not captured'} colors={colors} />
              <DetailRow icon="location-outline" label="Location" value={`${animal.biometricData?.captureLocation.lat.toFixed(4)}, ${animal.biometricData?.captureLocation.lng.toFixed(4)}`} colors={colors} />
            </View>
          )}

          {(animal.biometricData?.animalPhoto || animal.biometricData?.earTagPhoto) && (
            <View style={[sheetStyles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[sheetStyles.sectionTitle, { color: colors.text }]}>Photos</Text>
              <View style={sheetStyles.photoRow}>
                {animal.biometricData?.animalPhoto && (
                  <Image
                    source={{ uri: animal.biometricData.animalPhoto }}
                    style={sheetStyles.photo}
                    resizeMode="cover"
                  />
                )}
                {animal.biometricData?.earTagPhoto && (
                  <Image
                    source={{ uri: animal.biometricData.earTagPhoto }}
                    style={sheetStyles.photo}
                    resizeMode="cover"
                  />
                )}
              </View>
            </View>
          )}

          {kiamisResult ? (
            <View style={[sheetStyles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={sheetStyles.kiamisSuccessHeader}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={[sheetStyles.sectionTitle, { color: colors.success }]}>KIAMIS Registered</Text>
              </View>
              <DetailRow icon="finger-print-outline" label="Reg #" value={kiamisResult.registrationNumber} colors={colors} mono />
              {kiamisResult.qrCode && (
                <Image
                  source={{ uri: kiamisResult.qrCode }}
                  style={sheetStyles.qrCode}
                  resizeMode="contain"
                />
              )}
            </View>
          ) : (
            <Pressable
              onPress={handleKiamisRegister}
              disabled={kiamisLoading}
              style={({ pressed }) => [
                sheetStyles.kiamisBtn,
                { backgroundColor: colors.tint, opacity: kiamisLoading || pressed ? 0.7 : 1 },
              ]}
            >
              {kiamisLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="shield-checkmark-outline" size={16} color="#fff" />
              )}
              <Text style={sheetStyles.kiamisBtnText}>
                {kiamisLoading ? 'Registering...' : 'Register with KIAMIS'}
              </Text>
            </Pressable>
          )}
        </BottomSheetScrollViewAny>
      </BottomSheetAny>
    );
  }
);

function DetailRow({ icon, label, value, colors, mono }: {
  icon: string;
  label: string;
  value: string;
  colors: ReturnType<typeof import('@/components/Themed').useColors>;
  mono?: boolean;
}) {
  return (
    <RNView style={sheetStyles.detailRow}>
      <Ionicons name={icon as any} size={16} color={colors.textSecondary} />
      <Text style={[sheetStyles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[sheetStyles.detailValue, { color: colors.text }, mono && { fontFamily: 'FiraCode-Regular' }]}>
        {value}
      </Text>
    </RNView>
  );
}

function SheetField({ label, value, onChangeText, placeholder, colors }: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  colors: ReturnType<typeof import('@/components/Themed').useColors>;
}) {
  return (
    <RNView style={sheetStyles.fieldRow}>
      <Text style={[sheetStyles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      <RNView style={[sheetStyles.fieldInput, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          style={[sheetStyles.fieldInputText, { color: colors.text }]}
        />
      </RNView>
    </RNView>
  );
}

function SheetSelect({ label, value, options, onValueChange, colors }: {
  label: string;
  value: string;
  options: string[];
  onValueChange: (val: string) => void;
  colors: ReturnType<typeof import('@/components/Themed').useColors>;
}) {
  return (
    <RNView style={sheetStyles.fieldRow}>
      <Text style={[sheetStyles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      <RNView style={sheetStyles.chipWrap}>
        {options.map((opt) => (
          <Pressable
            key={opt}
            onPress={() => onValueChange(opt)}
            style={({ pressed }) => [
              sheetStyles.selectChip,
              {
                backgroundColor: value === opt ? colors.tint : colors.background,
                borderColor: value === opt ? colors.tint : colors.borderLight,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[sheetStyles.selectChipText, { color: value === opt ? '#fff' : colors.text }]}>
              {opt}
            </Text>
          </Pressable>
        ))}
      </RNView>
    </RNView>
  );
}

AnimalDetailSheet.displayName = 'AnimalDetailSheet';

export default AnimalDetailSheet;

const sheetStyles = StyleSheet.create({
  bg: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  handleBar: {
    paddingTop: spacing.sm,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  name: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  type: { fontSize: fontSize.sm, marginTop: 2 },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: radius.md,
    backgroundColor: '#D4D4D8',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  editBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  fieldRow: {
    gap: spacing.xs,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  fieldInput: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  fieldInputText: {
    fontSize: fontSize.sm,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  selectChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  selectChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  kiamisBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  kiamisBtnText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  kiamisSuccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  qrCode: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
});
