import { ScrollView, StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useAnimals } from '@/src/useAnimals';

export default function HomeScreen() {
  const { animals, stats, loading, error, refresh } = useAnimals();

  const cards = stats
    ? [
        { label: 'Total', value: stats.totalAnimals },
        { label: 'Healthy', value: stats.healthyCount },
        { label: 'Sick', value: stats.sickCount },
        { label: 'Treatment', value: stats.underTreatmentCount },
        { label: 'Recovered', value: stats.recoveredCount },
        { label: 'Counties', value: stats.counties },
      ]
    : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Wam Mfugo</Text>
      <Text style={styles.subtitle}>Herd summary</Text>

      {error && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>⚠️ Offline — showing cached data</Text>
        </View>
      )}

      {loading && cards.length === 0 ? (
        <Text style={styles.loading}>Loading herd data…</Text>
      ) : (
        <View style={styles.grid}>
          {cards.map((card) => (
            <View key={card.label} style={styles.card}>
              <Text style={styles.cardValue}>{card.value}</Text>
              <Text style={styles.cardLabel}>{card.label}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.listTitle}>
        Recent animals ({animals.length})
      </Text>
      {animals.slice(0, 5).map((animal) => (
        <View key={animal.id} style={styles.row}>
          <Text style={styles.rowName}>{animal.name}</Text>
          <Text style={styles.rowMeta}>
            {animal.type} · {animal.health} · {animal.county}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 12 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, opacity: 0.7 },
  banner: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 8,
  },
  bannerText: { color: '#856404' },
  loading: { fontSize: 16, marginTop: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  card: {
    flexGrow: 1,
    flexBasis: '30%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cardValue: { fontSize: 24, fontWeight: 'bold' },
  cardLabel: { fontSize: 13, opacity: 0.7, marginTop: 4 },
  listTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  row: {
    padding: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rowName: { fontSize: 16, fontWeight: '600' },
  rowMeta: { fontSize: 13, opacity: 0.7, marginTop: 2 },
});