import { useState, useEffect, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight, shadows } from '@/constants/Tokens';
import { impactLight, impactMedium } from '@/src/services/haptics';
import { useI18n } from '@/src/i18n';
import { logger } from '@/src/utils/logger';
import { getAnimals, bulkHealthUpdate, bulkDelete, type Livestock } from '@/src/services/api';

const HEALTH_OPTIONS = ['Healthy', 'Sick', 'Under Treatment', 'Recovered'];

export default function BulkOperationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const t = useI18n().t as unknown as (key: string) => string;
  const [animals, setAnimals] = useState<Livestock[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('');
  const [filterHealth, setFilterHealth] = useState<string>('');
  const [showHealthPicker, setShowHealthPicker] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await getAnimals({ limit: 200 });
      if (res.success) setAnimals(res.data);
    } catch (err) {
      logger.warn('[BulkOps] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = animals.filter((a) => {
    if (filterType && a.type !== filterType) return false;
    if (filterHealth && a.health !== filterHealth) return false;
    return true;
  });

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((a) => a.id)));
    }
  };

  const handleBulkHealth = async (health: string) => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    try {
      const res = await bulkHealthUpdate(ids, health);
      if (res.success) {
        impactMedium();
        setSelected(new Set());
        await loadData();
      }
    } catch { Alert.alert('Error', 'Failed to update health.'); }
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    Alert.alert('Confirm Delete', `Delete ${ids.length} animals?`, [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: async () => {
        try {
          const res = await bulkDelete(ids);
          if (res.success) {
            impactMedium();
            setSelected(new Set());
            await loadData();
          }
        } catch { Alert.alert('Error', 'Failed to delete.'); }
      }},
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('bulkOperations')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{selected.size} {t('bulkSelected')}</Text>
      </View>

      <View style={styles.filterRow}>
        <Pressable
          onPress={() => { setFilterType(filterType ? '' : 'Cattle'); impactLight(); }}
          style={[styles.filterBtn, { backgroundColor: filterType ? colors.tint + '20' : colors.card, borderColor: filterType ? colors.tint : colors.cardBorder }]}
        >
          <Text style={[styles.filterText, { color: filterType ? colors.tint : colors.textSecondary }]}>{filterType || t('bAllTypes')}</Text>
        </Pressable>
        <Pressable
          onPress={() => setShowHealthPicker(!showHealthPicker)}
          style={[styles.filterBtn, { backgroundColor: filterHealth ? colors.tint + '20' : colors.card, borderColor: filterHealth ? colors.tint : colors.cardBorder }]}
        >
          <Text style={[styles.filterText, { color: filterHealth ? colors.tint : colors.textSecondary }]}>{filterHealth || t('bAllHealth')}</Text>
        </Pressable>
        <Pressable onPress={toggleAll} style={[styles.filterBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.filterText, { color: colors.textSecondary }]}>{selected.size === filtered.length ? t('deselectAll') : t('selectAll')}</Text>
        </Pressable>
      </View>

      {selected.size > 0 && (
        <View style={[styles.actionBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Pressable onPress={() => setShowHealthPicker(true)} style={[styles.actionBtn, { backgroundColor: colors.tint }]}>
            <Ionicons name="medkit-outline" size={14} color="#fff" />
            <Text style={styles.actionBtnText}>{t('bulkHealthUpdate')}</Text>
          </Pressable>
          <Pressable onPress={handleBulkDelete} style={[styles.actionBtn, { backgroundColor: colors.destructive }]}>
            <Ionicons name="trash-outline" size={14} color="#fff" />
            <Text style={styles.actionBtnText}>{t('bulkDelete')}</Text>
          </Pressable>
        </View>
      )}

      {showHealthPicker && (
        <View style={[styles.pickerRow, { backgroundColor: colors.card }]}>
          {HEALTH_OPTIONS.map((h) => (
            <Pressable
              key={h}
              onPress={() => { handleBulkHealth(h); setShowHealthPicker(false); }}
              style={[styles.pickerOption, { borderBottomColor: colors.borderLight }]}
            >
              <Text style={[styles.pickerText, { color: colors.text }]}>{h}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: spacing.xxl }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isSelected = selected.has(item.id);
            return (
              <Pressable
                onPress={() => toggleSelect(item.id)}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: isSelected ? colors.tint + '10' : colors.card, borderColor: isSelected ? colors.tint : colors.cardBorder },
                  shadows.sm(colors.shadowColor, colors.shadowOpacity),
                  { opacity: pressed ? 0.95 : 1 },
                ]}
              >
                <View style={[styles.checkbox, { borderColor: isSelected ? colors.tint : colors.borderLight, backgroundColor: isSelected ? colors.tint : 'transparent' }]}>
                  {isSelected && <Ionicons name="checkmark" size={12} color="#fff" />}
                </View>
                <View style={styles.cardContent}>
                  <Text style={[styles.animalName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.animalMeta, { color: colors.textSecondary }]}>{item.type} · {item.county}</Text>
                </View>
                <View style={[styles.healthBadge, { backgroundColor: item.health === 'Healthy' ? colors.success + '20' : item.health === 'Sick' ? colors.destructive + '20' : colors.warning + '20' }]}>
                  <Text style={[styles.healthText, { color: item.health === 'Healthy' ? colors.success : item.health === 'Sick' ? colors.destructive : colors.warning }]}>{item.health}</Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  subtitle: { fontSize: fontSize.sm },
  filterRow: { flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  filterBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill, borderWidth: 1 },
  filterText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  actionBar: {
    flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.lg,
    marginBottom: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, paddingVertical: spacing.sm, borderRadius: radius.md,
  },
  actionBtnText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  pickerRow: { marginHorizontal: spacing.lg, marginBottom: spacing.md, borderRadius: radius.lg, overflow: 'hidden' },
  pickerOption: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1 },
  pickerText: { fontSize: fontSize.sm },
  list: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxxl },
  card: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: radius.lg, borderWidth: 1, gap: spacing.md,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 4, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  cardContent: { flex: 1 },
  animalName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  animalMeta: { fontSize: fontSize.xs },
  healthBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  healthText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
});
