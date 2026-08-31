import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAnimals } from '@/src/hooks/useAnimals';
import { useI18n } from '@/src/i18n';
import { Platform } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { stats } = useAnimals();
  const { t } = useI18n();
  const sickCount = stats?.sickCount ?? 0;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: String(colors.tint),
        tabBarInactiveTintColor: String(colors.tabIconDefault),
        tabBarStyle: {
          backgroundColor: String(colors.surface) + 'EE',
          borderTopColor: String(colors.border),
          borderTopWidth: 0.5,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 20 : 0,
        },
        headerStyle: { backgroundColor: String(colors.surface) },
        headerTintColor: String(colors.text),
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
        },
        headerShown: true,
        headerShadowVisible: false,
      }}>
      <Tabs.Screen name="index" options={{ title: t('home'), tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={String(color)} /> }} />
      <Tabs.Screen name="animals" options={{ title: t('animals'), tabBarIcon: ({ color, size }) => <Ionicons name="paw" size={size} color={String(color)} />, tabBarBadge: sickCount > 0 ? sickCount : undefined, tabBarBadgeStyle: { backgroundColor: '#DC2626', fontSize: 10, minWidth: 18, height: 18 } }} />
      <Tabs.Screen name="register" options={{ title: t('register'), tabBarIcon: ({ color, size }) => <Ionicons name="camera" size={size} color={String(color)} /> }} />
      <Tabs.Screen name="analytics" options={{ title: t('analytics'), tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart" size={size} color={String(color)} /> }} />
      <Tabs.Screen name="vaccinations" options={{ title: t('vaccinations'), tabBarIcon: ({ color, size }) => <Ionicons name="medkit" size={size} color={String(color)} /> }} />
      <Tabs.Screen name="outbreaks" options={{ title: t('outbreaks'), tabBarIcon: ({ color, size }) => <Ionicons name="warning" size={size} color={String(color)} /> }} />
      <Tabs.Screen name="diseases" options={{ title: t('diseases'), tabBarIcon: ({ color, size }) => <Ionicons name="pulse" size={size} color={String(color)} /> }} />
      <Tabs.Screen name="more" options={{ title: t('more'), tabBarIcon: ({ color, size }) => <Ionicons name="ellipsis-horizontal" size={size} color={String(color)} /> }} />
      <Tabs.Screen name="map" options={{ title: t('map'), tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={String(color)} /> }} />
      <Tabs.Screen name="mortality" options={{ title: t('mortality'), href: null }} />
      <Tabs.Screen name="weight-gain" options={{ title: t('weightGain'), href: null }} />
      <Tabs.Screen name="county-comparison" options={{ title: t('countyComparison'), href: null }} />
      <Tabs.Screen name="simulator" options={{ title: t('simulator'), href: null }} />
      <Tabs.Screen name="reminders" options={{ title: t('reminders'), href: null }} />
      <Tabs.Screen name="health-assessment" options={{ title: t('healthAssessment'), href: null }} />
      <Tabs.Screen name="csv-import" options={{ title: t('csvImport'), href: null }} />
      <Tabs.Screen name="bulk-operations" options={{ title: t('bulkOperations'), href: null }} />
      <Tabs.Screen name="kalro-report" options={{ title: t('kalroReport'), href: null }} />
      <Tabs.Screen name="animal-qr" options={{ title: t('qrCodePage'), href: null }} />
      <Tabs.Screen name="sessions" options={{ title: t('sessions'), href: null }} />
      <Tabs.Screen name="profile" options={{ title: t('profile'), tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={String(color)} /> }} />
    </Tabs>
  );
}
