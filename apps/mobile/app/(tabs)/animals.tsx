import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { useAnimals } from '@/src/hooks/useAnimals';
import { spacing, radius, fontSize, fontWeight, shadows } from '@/constants/Tokens';
import { selectionChanged, impactLight } from '@/src/services/haptics';
import { SearchBar } from '@/src/components/SearchBar';
import { SwipeableRow } from '@/src/components/SwipeableRow';
import { StaggeredItem } from '@/src/components/StaggeredItem';
import AnimalDetailSheet from '@/src/components/AnimalDetailSheet';
import { exportCSV } from '@/src/services/export';
import { apiCall } from '@/src/services/api';
import type { AnimalType, HealthStatus, Livestock } from '@wam-mfugo/shared';
import { connectSocket, getSocket } from '@/src/services/socket';

const TYPES: (AnimalType | 'All')[] = [
  'All', 'Cattle', 'Goat', 'Sheep', 'Camel', 'Pig', 'Chicken',
];
const HEALTH: (HealthStatus | 'All')[] = [
  'All', 'Healthy', 'Sick', 'Under Treatment', 'Recovered',
];

export default function AnimalsScreen() {
  const { animals, loading, refresh } = useAnimals();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [type, setType] = useState<AnimalType | 'All'>('All');
  const [health, setHealth] = useState<HealthStatus | 'All'>('All');
  const [county, setCounty] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selectedAnimal, setSelectedAnimal] = useState<Livestock | null>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    let mounted = true;

    const setup = async () => {
      const s = await connectSocket();
      if (!mounted) return;

      s.emit('join', 'animal-events');
      s.on('animal:event', () => { void refreshRef.current(); });
    };

    void setup();

    return () => {
      mounted = false;
      getSocket().then((s) => {
        s.emit('leave', 'animal-events');
        s.off('animal:event');
      });
    };
  }, []);

  const counties = useMemo(() => {
    const set = new Set(animals.map((a) => a.county));
    return ['All', ...Array.from(set).sort()];
  }, [animals]);

  const filtered = useMemo(
    () =>
      animals.filter(
        (a) =>
          (type === 'All' || a.type === type) &&
          (health === 'All' || a.health === health) &&
          (county === 'All' || a.county === county) &&
          (search === '' ||
            a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.owner.toLowerCase().includes(search.toLowerCase()) ||
            a.type.toLowerCase().includes(search.toLowerCase()) ||
            a.county.toLowerCase().includes(search.toLowerCase()) ||
            String(a.id).includes(search))
      ),
    [animals, type, health, county, search]
  );

  const handleAnimalPress = useCallback((animal: Livestock) => {
    impactLight();
    setSelectedAnimal(animal);
    sheetRef.current?.snapToIndex(1);
  }, []);

  const handleDelete = useCallback((animal: Livestock) => {
    Alert.alert('Delete Animal', `Are you sure you want to delete ${animal.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await apiCall<{ queued?: boolean }>('DELETE', `/animals/${animal.id}`);
            if (result && 'queued' in result && result.queued) {
              Alert.alert('Queued', 'Deletion queued — will sync when online');
            } else {
              await refresh();
            }
          } catch {
            Alert.alert('Error', 'Failed to delete animal. Please try again.');
          }
        },
      },
    ]);
  }, [refresh]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.filters}>
        <View style={styles.searchRow}>
          <SearchBar value={search} onChangeText={setSearch} placeholder="Search by name or owner..." />
          <Pressable
            onPress={() => { impactLight(); exportCSV(filtered); }}
            style={({ pressed }) => [styles.exportBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder, opacity: pressed ? 0.8 : 1 }]}
            accessibilityLabel="Export animals"
          >
            <Ionicons name="download-outline" size={18} color={colors.tint} />
          </Pressable>
        </View>
        
        <Text style={[styles.filterLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>Type</Text>
        <View style={styles.chipRow}>
          {TYPES.map((t) => (
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
              accessibilityLabel={`Filter by ${t}`}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: type === t ? '#fff' : colors.text },
                ]}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.filterLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>
          Health
        </Text>
        <View style={styles.chipRow}>
          {HEALTH.map((h) => (
            <Pressable
              key={h}
              onPress={() => {
                selectionChanged();
                setHealth(h);
              }}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: health === h ? colors.accent : colors.card,
                  borderColor: health === h ? colors.accent : colors.borderLight,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                },
              ]}
              accessibilityLabel={`Filter by ${h}`}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: health === h ? '#fff' : colors.text },
                ]}
              >
                {h}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.filterLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>County</Text>
        <FlatList
          horizontal
          data={counties}
          keyExtractor={(c) => c}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
          renderItem={({ item: c }) => (
            <Pressable
              onPress={() => { selectionChanged(); setCounty(c); }}
              style={({ pressed }) => [styles.chip, {
                backgroundColor: county === c ? colors.tint : colors.card,
                borderColor: county === c ? colors.tint : colors.borderLight,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              }]}
            >
              <Text style={[styles.chipText, { color: county === c ? '#fff' : colors.text }]}>{c}</Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={() => void refresh()}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="search-outline" size={32} color={colors.textSecondary} />
            <Text style={[styles.empty, { color: colors.textSecondary }]}>
              No animals match your filters.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <StaggeredItem index={index} delay={40}>
            <SwipeableRow
              onDelete={() => handleDelete(item)}
              onEdit={() => handleAnimalPress(item)}
            >
              <Pressable
                onPress={() => handleAnimalPress(item)}
                style={({ pressed }) => [
                  styles.row,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    opacity: pressed ? 0.95 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                  shadows.sm(colors.shadowColor, colors.shadowOpacity),
                ]}
              >
            <View style={[styles.rowIcon, { backgroundColor: colors.tintLight }]}>
              <Ionicons name="paw-outline" size={18} color={colors.tint} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.meta, { color: colors.textSecondary }]}>
                {item.type} · {item.county}
              </Text>
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor:
                        item.health === 'Healthy'
                          ? colors.tintLight
                          : item.health === 'Sick'
                          ? '#FEF2F2'
                          : colors.accentLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color:
                          item.health === 'Healthy'
                            ? colors.tint
                            : item.health === 'Sick'
                            ? colors.destructive
                            : colors.accent,
                      },
                    ]}
                  >
                    {item.health}
                  </Text>
                </View>
              </View>
              <Text style={[styles.owner, { color: colors.textSecondary }]}>
                Owner: {item.owner}
              </Text>
            </View>
          </Pressable>
          </SwipeableRow>
        </StaggeredItem>
        )}
      />
      <AnimalDetailSheet ref={sheetRef} animal={selectedAnimal} onClose={() => setSelectedAnimal(null)} onSaved={() => void refresh()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { padding: spacing.lg, paddingBottom: spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  exportBtn: { width: 44, height: 44, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filterLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: { flex: 1, gap: 2 },
  name: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  meta: { fontSize: fontSize.sm },
  badgeRow: { flexDirection: 'row', marginTop: spacing.xs },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  owner: { fontSize: fontSize.xs, marginTop: spacing.xs },
  emptyWrap: { alignItems: 'center', marginTop: spacing.section, gap: spacing.sm },
  empty: { fontSize: fontSize.base },
});
