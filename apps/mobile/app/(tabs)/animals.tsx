import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useAnimals } from '@/src/useAnimals';
import type { AnimalType, HealthStatus } from '@wam-mfugo/shared';

const TYPES: (AnimalType | 'All')[] = [
  'All',
  'Cattle',
  'Goat',
  'Sheep',
  'Camel',
  'Pig',
  'Chicken',
];
const HEALTH: (HealthStatus | 'All')[] = [
  'All',
  'Healthy',
  'Sick',
  'Under Treatment',
  'Recovered',
];

export default function AnimalsScreen() {
  const { animals, loading, refresh } = useAnimals();
  const [type, setType] = useState<AnimalType | 'All'>('All');
  const [health, setHealth] = useState<HealthStatus | 'All'>('All');

  const filtered = useMemo(
    () =>
      animals.filter(
        (a) =>
          (type === 'All' || a.type === type) &&
          (health === 'All' || a.health === health)
      ),
    [animals, type, health]
  );

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <View style={styles.chipRow}>
          {TYPES.map((t) => (
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
        <View style={styles.chipRow}>
          {HEALTH.map((h) => (
            <Pressable
              key={h}
              onPress={() => setHealth(h)}
              style={[styles.chip, health === h && styles.chipActive]}>
              <Text style={health === h ? styles.chipTextActive : styles.chipText}>
                {h}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={() => void refresh()}
        ListEmptyComponent={<Text style={styles.empty}>No animals match.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>
              {item.type} · {item.health} · {item.county}
            </Text>
            <Text style={styles.owner}>Owner: {item.owner}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { padding: 12, gap: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipActive: { backgroundColor: '#22c55e' },
  chipText: { fontSize: 13 },
  chipTextActive: { fontSize: 13, color: '#fff', fontWeight: '600' },
  list: { paddingHorizontal: 12, paddingBottom: 24, gap: 8 },
  row: { padding: 14, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 13, opacity: 0.75, marginTop: 2 },
  owner: { fontSize: 12, opacity: 0.6, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: 32, opacity: 0.6 },
});