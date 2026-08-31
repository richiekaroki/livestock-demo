import { Stack, Redirect } from 'expo-router';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/components/Themed';
import { useAuth } from '@/src/contexts/AuthContext';

export default function AdminLayout() {
  const router = useRouter();
  const colors = useColors();
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="users"
        options={{
          title: 'User Management',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8} style={{ marginRight: 16 }} accessibilityLabel="Go back">
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="audit-logs"
        options={{
          title: 'Audit Log',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={8} style={{ marginRight: 16 }} accessibilityLabel="Go back">
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
