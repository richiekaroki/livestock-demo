import { useState, useEffect, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { impactLight } from '@/src/services/haptics';
import { useI18n } from '@/src/i18n';
import { getAnimals, type Livestock } from '@/src/services/api';

const QR_SIZE = 200;

export default function AnimalQrScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const t = useI18n().t as unknown as (key: string) => string;
  const [animals, setAnimals] = useState<Livestock[]>([]);
  const [selected, setSelected] = useState<Livestock | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnimals({ limit: 100 }).then((res) => {
      if (res.success) setAnimals(res.data);
      setLoading(false);
    });
  }, []);

  const getQrUrl = (id: number) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&data=${encodeURIComponent(`https://wam-mfugo.com/animals/${id}`)}&color=16a34a`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('animalQR')}</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: spacing.xxl }} />
      ) : (
        <View style={styles.layout}>
          <FlatList
            data={animals}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isActive = selected?.id === item.id;
              return (
                <Pressable
                  onPress={() => { impactLight(); setSelected(item); }}
                  style={({ pressed }) => [
                    styles.card,
                    { backgroundColor: isActive ? colors.tint + '10' : colors.card, borderColor: isActive ? colors.tint : colors.cardBorder },
                    { opacity: pressed ? 0.95 : 1 },
                  ]}
                >
                  <Text style={[styles.cardName, { color: isActive ? colors.tint : colors.text }]}>{item.name}</Text>
                  <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>{item.type} · {item.county}</Text>
                </Pressable>
              );
            }}
          />

          {selected && (
            <View style={[styles.qrPanel, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Image source={{ uri: getQrUrl(selected.id) }} style={styles.qrImage} />
              <Text style={[styles.qrName, { color: colors.text }]}>{selected.name}</Text>
              <Text style={[styles.qrMeta, { color: colors.textSecondary }]}>{selected.type} · {selected.county}</Text>
              <Text style={[styles.qrOwner, { color: colors.textSecondary }]}>{selected.owner}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: spacing.lg, paddingBottom: spacing.sm },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  layout: { flex: 1, flexDirection: 'row' },
  list: { padding: spacing.lg, gap: spacing.xs, paddingBottom: spacing.xxxl, flex: 1 },
  card: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  cardName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  cardMeta: { fontSize: fontSize.xs },
  qrPanel: {
    width: 260, padding: spacing.lg, borderRadius: radius.lg,
    borderWidth: 1, alignItems: 'center', gap: spacing.sm, margin: spacing.lg,
  },
  qrImage: { width: QR_SIZE, height: QR_SIZE, borderRadius: radius.md },
  qrName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  qrMeta: { fontSize: fontSize.sm },
  qrOwner: { fontSize: fontSize.xs },
});
