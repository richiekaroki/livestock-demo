import { StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import type { Livestock } from '@wam-mfugo/shared';

type Props = { animals: Livestock[] };

export default function AnimalMap({ animals }: Props) {
  const center = { latitude: animals[0].lat, longitude: animals[0].lng };

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        ...center,
        latitudeDelta: 2,
        longitudeDelta: 2,
      }}>
      {animals.map((animal) => (
        <Marker
          key={animal.id}
          coordinate={{ latitude: animal.lat, longitude: animal.lng }}
          title={animal.name}
          description={`${animal.type} · ${animal.health}`}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});