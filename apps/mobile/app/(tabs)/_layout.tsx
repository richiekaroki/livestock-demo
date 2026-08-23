import { Tabs } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useAnimals } from '@/src/hooks/useAnimals';
import { useI18n } from '@/src/i18n';

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
          backgroundColor: String(colors.surface),
          borderTopColor: String(colors.border),
        },
        headerStyle: { backgroundColor: String(colors.surface) },
        headerTintColor: String(colors.text),
        headerShown: true,
      }}>
      <Tabs.Screen name="index" options={{ title: t('home'), tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={String(color)} /> }} />
      <Tabs.Screen name="animals" options={{ title: t('animals'), tabBarIcon: ({ color, size }) => <Ionicons name="paw-outline" size={size} color={String(color)} />, tabBarBadge: sickCount > 0 ? sickCount : undefined, tabBarBadgeStyle: { backgroundColor: '#DC2626', fontSize: 10, minWidth: 18, height: 18 } }} />
      <Tabs.Screen name="register" options={{ title: t('register'), tabBarIcon: ({ color, size }) => <Ionicons name="camera-outline" size={size} color={String(color)} /> }} />
      <Tabs.Screen name="analytics" options={{ title: t('analytics'), tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={String(color)} /> }} />
      <Tabs.Screen name="vaccinations" options={{ title: t('vaccinations'), tabBarIcon: ({ color, size }) => <Ionicons name="medkit-outline" size={size} color={String(color)} /> }} />
      <Tabs.Screen name="outbreaks" options={{ title: 'Outbreaks', tabBarIcon: ({ color, size }) => <Ionicons name="warning-outline" size={size} color={String(color)} /> }} />
      <Tabs.Screen name="diseases" options={{ title: t('diseases'), tabBarIcon: ({ color, size }) => <Ionicons name="pulse-outline" size={size} color={String(color)} /> }} />
      <Tabs.Screen name="map" options={{ title: t('map'), tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={String(color)} /> }} />
      <Tabs.Screen name="profile" options={{ title: t('profile'), tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={String(color)} /> }} />
    </Tabs>
  );
}
