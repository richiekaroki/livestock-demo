import { Pressable, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight, shadows } from '@/constants/Tokens';
import { impactLight } from '@/src/services/haptics';
import { useI18n } from '@/src/i18n';

const MENU_ITEMS = [
  { key: 'mortality', route: '/mortality', icon: 'skull-outline' as const, colorKey: 'destructive' },
  { key: 'weightGain', route: '/weight-gain', icon: 'bar-chart-outline' as const, colorKey: 'tint' },
  { key: 'countyComparison', route: '/county-comparison', icon: 'grid-outline' as const, colorKey: 'tint' },
  { key: 'simulator', route: '/simulator', icon: 'flask-outline' as const, colorKey: 'tint' },
  { key: 'reminders', route: '/reminders', icon: 'calendar-outline' as const, colorKey: 'success' },
  { key: 'healthAssessment', route: '/health-assessment', icon: 'medical-outline' as const, colorKey: 'tint' },
  { key: 'csvImport', route: '/csv-import', icon: 'document-text-outline' as const, colorKey: 'tint' },
  { key: 'bulkOperations', route: '/bulk-operations', icon: 'swap-horizontal-outline' as const, colorKey: 'warning' },
  { key: 'kalroReport', route: '/kalro-report', icon: 'document-outline' as const, colorKey: 'tint' },
  { key: 'animalQR', route: '/animal-qr', icon: 'qr-code-outline' as const, colorKey: 'tint' },
  { key: 'sessions', route: '/sessions', icon: 'key-outline' as const, colorKey: 'tint' },
  { key: 'vaccinations', route: '/vaccinations', icon: 'medkit-outline' as const, colorKey: 'success' },
  { key: 'outbreaks', route: '/outbreaks', icon: 'warning-outline' as const, colorKey: 'warning' },
  { key: 'diseases', route: '/diseases', icon: 'pulse-outline' as const, colorKey: 'tint' },
];

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useI18n();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>{t('more')}</Text>
      <View style={styles.grid}>
        {MENU_ITEMS.map((item) => {
          const color = (colors as any)[item.colorKey] || colors.tint;
          return (
            <Pressable
              key={item.key}
              onPress={() => { impactLight(); router.push(item.route as any); }}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
                shadows.sm(colors.shadowColor, colors.shadowOpacity),
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: color + '20' }]}>
                <Ionicons name={item.icon} size={28} color={color} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t(item.key as any)}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    width: '47%', padding: spacing.lg, borderRadius: radius.lg,
    borderWidth: 1, gap: spacing.sm, alignItems: 'center',
  },
  iconWrap: {
    width: 56, height: 56, borderRadius: radius.lg,
    alignItems: 'center', justifyContent: 'center',
  },
  cardTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, textAlign: 'center' },
});
