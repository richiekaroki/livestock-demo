import { StyleSheet, Text, View } from 'react-native';

import type { Livestock } from '@wam-mfugo/shared';

type Props = { animals: Livestock[] };

export default function AnimalMap({ animals }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Animal locations</Text>
      {animals.map((animal) => (
        <View key={animal.id} style={styles.row}>
          <Text style={styles.name}>{animal.name}</Text>
          <Text style={styles.meta}>
            {animal.type} · {animal.health} · {animal.county}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  row: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  name: { fontSize: 16, fontWeight: '500' },
  meta: { fontSize: 13, color: '#666', marginTop: 2 },
});