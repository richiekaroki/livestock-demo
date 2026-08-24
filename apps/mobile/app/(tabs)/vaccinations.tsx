import { useState, useEffect } from 'react';
import {
  StyleSheet, ScrollView, TextInput, Pressable, Alert, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { impactLight, impactMedium, notificationSuccess, selectionChanged } from '@/src/services/haptics';
import { useToast } from '@/src/components/Toast';
import * as api from '@/src/services/api';
import type { Livestock } from '@wam-mfugo/shared';

interface Vaccination {
  id: number;
  animalId: number;
  animalName: string;
  type: string;
  vaccine: string;
  date: string;
  batchNumber: string;
  veterinarian: string;
  nextDueDate?: string;
  county: string;
}

export default function VaccinationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [animals, setAnimals] = useState<Livestock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVaccination, setEditingVaccination] = useState<Vaccination | null>(null);

  const [form, setForm] = useState({
    animalId: '',
    type: 'routine',
    vaccine: '',
    date: new Date().toISOString().split('T')[0],
    batchNumber: '',
    veterinarian: '',
    nextDueDate: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const animalsRes = await api.getAnimals();
      if (animalsRes.success && Array.isArray(animalsRes.data)) {
        setAnimals(animalsRes.data);
      }
    } catch { /* ignored */ }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (vaccination: Vaccination) => {
    impactLight();
    setEditingVaccination(vaccination);
    setForm({
      animalId: String(vaccination.animalId),
      type: vaccination.type,
      vaccine: vaccination.vaccine,
      date: vaccination.date,
      batchNumber: vaccination.batchNumber,
      veterinarian: vaccination.veterinarian,
      nextDueDate: vaccination.nextDueDate || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.animalId || !form.vaccine || !form.veterinarian) {
      showToast('error', 'Animal, vaccine and veterinarian are required');
      return;
    }
    impactMedium();

    if (editingVaccination) {
      try {
        await api.apiCall('PATCH', `/vaccinations/${editingVaccination.id}`, {
          type: form.type,
          vaccine: form.vaccine,
          date: form.date,
          batchNumber: form.batchNumber,
          veterinarian: form.veterinarian,
          nextDueDate: form.nextDueDate || null,
        });
      } catch {
        // If offline, queue the update
      }
      setVaccinations((prev) =>
        prev.map((v) =>
          v.id === editingVaccination.id
            ? { ...v, type: form.type, vaccine: form.vaccine, date: form.date, batchNumber: form.batchNumber, veterinarian: form.veterinarian, nextDueDate: form.nextDueDate || undefined }
            : v
        )
      );
      setEditingVaccination(null);
      setShowForm(false);
      setForm({ animalId: '', type: 'routine', vaccine: '', date: new Date().toISOString().split('T')[0], batchNumber: '', veterinarian: '', nextDueDate: '' });
      notificationSuccess();
      showToast('success', 'Vaccination updated');
    } else {
      const animal = animals.find((a) => String(a.id) === form.animalId);
      const payload = {
        animalId: Number(form.animalId),
        type: form.type,
        vaccine: form.vaccine,
        date: form.date,
        batchNumber: form.batchNumber,
        veterinarian: form.veterinarian,
        nextDueDate: form.nextDueDate || null,
      };

      try {
        const result = await api.apiCall<api.ApiResponse<api.VaccinationRecord>>('POST', '/vaccinations', payload);
        if (result && 'queued' in result && result.queued) {
          showToast('warning', 'Vaccination queued — will sync when online');
        } else {
          showToast('success', 'Vaccination recorded');
        }
      } catch {
        showToast('warning', 'Vaccination queued — will sync when online');
      }

      const newVacc: Vaccination = {
        id: Date.now(),
        animalId: Number(form.animalId),
        animalName: animal?.name || 'Unknown',
        type: form.type,
        vaccine: form.vaccine,
        date: form.date,
        batchNumber: form.batchNumber,
        veterinarian: form.veterinarian,
        nextDueDate: form.nextDueDate || undefined,
        county: animal?.county || '',
      };
      setVaccinations((prev) => [newVacc, ...prev]);
      setShowForm(false);
      setForm({ animalId: '', type: 'routine', vaccine: '', date: new Date().toISOString().split('T')[0], batchNumber: '', veterinarian: '', nextDueDate: '' });
      notificationSuccess();
    }
  };

  const handleDelete = (id: number) => {
    impactLight();
    Alert.alert('Delete Record', 'Remove this vaccination record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => {
          setVaccinations((prev) => prev.filter((v) => v.id !== id));
          showToast('success', 'Record deleted');
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} tintColor={colors.tint} />}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Vaccinations</Text>
        <Pressable
          onPress={() => { impactLight(); setShowForm(!showForm); setEditingVaccination(null); }}
          style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.tint, opacity: pressed ? 0.85 : 1 }]}
          accessibilityLabel={showForm ? 'Cancel' : 'Add vaccination'}
        >
          <Ionicons name={showForm ? 'close' : 'add'} size={20} color="#fff" />
          <Text style={styles.addBtnText}>{showForm ? 'Cancel' : 'Add'}</Text>
        </Pressable>
      </View>

      {showForm && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{editingVaccination ? 'Edit Vaccination' : 'New Vaccination'}</Text>

          <Text style={[styles.label, { color: colors.text }]}>Animal *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {animals.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => { selectionChanged(); setForm({ ...form, animalId: String(a.id) }); }}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: form.animalId === String(a.id) ? colors.tint : colors.card,
                    borderColor: form.animalId === String(a.id) ? colors.tint : colors.borderLight,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                accessibilityLabel={`Select ${a.name}`}
              >
                <Text style={[styles.chipText, { color: form.animalId === String(a.id) ? '#fff' : colors.text }]}>{a.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.label, { color: colors.text }]}>Type</Text>
          <View style={styles.chipRow}>
            {['routine', 'mandatory', 'emergency'].map((t) => (
              <Pressable
                key={t}
                onPress={() => { selectionChanged(); setForm({ ...form, type: t }); }}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: form.type === t ? colors.tint : colors.card,
                    borderColor: form.type === t ? colors.tint : colors.borderLight,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
                accessibilityLabel={`Select ${t}`}
              >
                <Text style={[styles.chipText, { color: form.type === t ? '#fff' : colors.text }]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { color: colors.text }]}>Vaccine *</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={form.vaccine} onChangeText={(t) => setForm({ ...form, vaccine: t })} placeholder="e.g. FMD Vaccine" placeholderTextColor={colors.placeholder} />

          <Text style={[styles.label, { color: colors.text }]}>Date</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={form.date} onChangeText={(t) => setForm({ ...form, date: t })} placeholder="YYYY-MM-DD" placeholderTextColor={colors.placeholder} />

          <Text style={[styles.label, { color: colors.text }]}>Batch Number</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={form.batchNumber} onChangeText={(t) => setForm({ ...form, batchNumber: t })} placeholder="Optional" placeholderTextColor={colors.placeholder} />

          <Text style={[styles.label, { color: colors.text }]}>Veterinarian *</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={form.veterinarian} onChangeText={(t) => setForm({ ...form, veterinarian: t })} placeholder="Dr. name" placeholderTextColor={colors.placeholder} />

          <Text style={[styles.label, { color: colors.text }]}>Next Due Date</Text>
          <TextInput style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]} value={form.nextDueDate} onChangeText={(t) => setForm({ ...form, nextDueDate: t })} placeholder="Optional YYYY-MM-DD" placeholderTextColor={colors.placeholder} />

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [styles.submitBtn, { backgroundColor: colors.tint, opacity: pressed ? 0.85 : 1 }]}
            accessibilityLabel={editingVaccination ? 'Update vaccination record' : 'Save vaccination record'}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
            <Text style={styles.submitBtnText}>{editingVaccination ? 'Update Record' : 'Save Record'}</Text>
          </Pressable>
        </View>
      )}

      {loading && vaccinations.length === 0 && !showForm ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="hourglass-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Loading vaccinations...</Text>
        </View>
      ) : vaccinations.length === 0 && !showForm ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="medkit-outline" size={40} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No vaccination records yet</Text>
        </View>
      ) : (
        vaccinations.map((v) => {
          const isOverdue = v.nextDueDate && new Date(v.nextDueDate) < new Date();
          return (
            <View key={v.id} style={[styles.vaccRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.vaccHeader}>
                <View style={[styles.vaccIcon, { backgroundColor: colors.tintLight }]}>
                  <Ionicons name="medkit-outline" size={16} color={colors.tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.vaccName, { color: colors.text }]}>{v.animalName}</Text>
                  <Text style={[styles.vaccMeta, { color: colors.textSecondary }]}>{v.vaccine} · {v.type}</Text>
                </View>
                <Pressable onPress={() => handleEdit(v)} style={({ pressed }) => [styles.editBtn, { opacity: pressed ? 0.6 : 1 }]} accessibilityLabel="Edit vaccination">
                  <Ionicons name="pencil-outline" size={16} color={colors.tint} />
                </Pressable>
                <Pressable onPress={() => handleDelete(v.id)} style={({ pressed }) => [styles.deleteBtn, { opacity: pressed ? 0.6 : 1 }]} accessibilityLabel="Delete vaccination">
                  <Ionicons name="trash-outline" size={16} color={colors.destructive} />
                </Pressable>
              </View>
              <View style={styles.vaccDetails}>
                <Text style={[styles.vaccDetail, { color: colors.textSecondary }]}>Date: {v.date}</Text>
                {v.batchNumber ? <Text style={[styles.vaccDetail, { color: colors.textSecondary }]}>Batch: {v.batchNumber}</Text> : null}
                <Text style={[styles.vaccDetail, { color: colors.textSecondary }]}>Vet: {v.veterinarian}</Text>
                {v.nextDueDate ? (
                  <Text style={[styles.vaccDetail, { color: isOverdue ? colors.destructive : colors.success }]}>
                    Next: {v.nextDueDate} {isOverdue ? '(OVERDUE)' : ''}
                  </Text>
                ) : null}
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.pill, borderWidth: 1 },
  chipText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.lg, borderRadius: radius.md, marginTop: spacing.md },
  submitBtnText: { color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.base },
  emptyWrap: { alignItems: 'center', marginTop: spacing.section, gap: spacing.md },
  emptyText: { fontSize: fontSize.base },
  vaccRow: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, gap: spacing.sm },
  vaccHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  vaccIcon: { width: 32, height: 32, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  vaccName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  vaccMeta: { fontSize: fontSize.xs },
  deleteBtn: { padding: spacing.sm },
  editBtn: { padding: spacing.sm },
  vaccDetails: { gap: 2, marginTop: spacing.xs },
  vaccDetail: { fontSize: fontSize.xs },
});
