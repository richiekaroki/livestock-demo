import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import AnimalMap from '@/src/AnimalMap';
import { useAnimals } from '@/src/useAnimals';

export default function MapScreen() {
  const { animals, loading } = useAnimals();

  const markers = animals.filter((a) => a.lat !== 0 || a.lng !== 0);

  if (loading && markers.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Loading map…</Text>
      </View>
    );
  }

  if (markers.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No animal locations available yet.</Text>
      </View>
    );
  }

  return <AnimalMap animals={markers} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});