import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, Pressable, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View } from '@/components/Themed';
import { useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RowSkeleton } from '@/src/components/Skeleton';
import { useToast } from '@/src/components/Toast';
import {
  getAdminUsers,
  updateAdminUser,
  deactivateAdminUser,
  type AdminUser,
} from '@/src/services/api';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  field_agent: 'Field Agent',
  farmer: 'Farmer',
};

const ROLE_CYCLE: Record<string, string> = {
  admin: 'field_agent',
  field_agent: 'farmer',
  farmer: 'admin',
};

export default function UserManagementScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers({ search: search || undefined });
      setUsers(data.users);
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const ROLE_COLORS: Record<string, string> = {
    admin: colors.destructive,
    field_agent: colors.tint,
    farmer: colors.textTertiary,
  };

  const handleRoleChange = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const next = ROLE_CYCLE[user.role] ?? 'farmer';
    Alert.alert('Change Role', `Change ${user.name} to ${ROLE_LABELS[next]}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await updateAdminUser(userId, { role: next });
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: next } : u)));
            showToast('success', `${user.name} is now ${ROLE_LABELS[next]}`);
          } catch {
            showToast('error', 'Failed to update role');
          }
        },
      },
    ]);
  };

  const handleDeactivate = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    Alert.alert('Deactivate User', `Deactivate ${user.name}? They will no longer be able to sign in.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Deactivate',
        style: 'destructive',
        onPress: async () => {
          try {
            await deactivateAdminUser(userId);
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: false } : u)));
            showToast('success', `${user.name} deactivated`);
          } catch {
            showToast('error', 'Failed to deactivate user');
          }
        },
      },
    ]);
  };

  const renderUser = ({ item }: { item: AdminUser }) => (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: (ROLE_COLORS[item.role] ?? colors.textTertiary) + '20' }]}>
          <Text style={[styles.avatarText, { color: ROLE_COLORS[item.role] ?? colors.textTertiary }]}>
            {item.name.split(' ').map((n) => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.cardEmail, { color: colors.textTertiary }]}>{item.email}</Text>
        </View>
        <Pressable onPress={() => handleRoleChange(item.id)} style={[styles.roleBadge, { backgroundColor: (ROLE_COLORS[item.role] ?? colors.textTertiary) + '15' }]}>
          <Text style={[styles.roleText, { color: ROLE_COLORS[item.role] ?? colors.textTertiary }]}>{ROLE_LABELS[item.role] ?? item.role}</Text>
        </Pressable>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="location-outline" size={13} color={colors.textTertiary} />
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>{item.county}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name={item.isActive ? 'checkmark-circle-outline' : 'close-circle-outline'} size={13} color={item.isActive ? colors.tint : colors.destructive} />
          <Text style={[styles.footerText, { color: item.isActive ? colors.tint : colors.destructive }]}>{item.isActive ? 'Active' : 'Inactive'}</Text>
        </View>
        {item.isActive && (
          <Pressable onPress={() => handleDeactivate(item.id)} hitSlop={8}>
            <Ionicons name="person-remove-outline" size={16} color={colors.destructive} />
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>User Management</Text>
          <Text style={[styles.subtitle, { color: colors.textTertiary }]}>{loading ? 'Loading...' : `${users.length} users`}</Text>
        </View>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Ionicons name="search-outline" size={16} color={colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by name, email, or county..."
          placeholderTextColor={colors.placeholder}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={6}>
            <Ionicons name="close-circle" size={16} color={colors.placeholder} />
          </Pressable>
        )}
      </View>

      {loading && (
        <View style={styles.list}>
          {Array.from({ length: 4 }).map((_, i) => (
            <RowSkeleton key={i} colors={colors} />
          ))}
        </View>
      )}

      {error && !loading && (
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.destructive} />
          <Text style={[styles.emptyText, { color: colors.destructive }]}>{error}</Text>
          <Pressable onPress={loadUsers} style={[styles.retryBtn, { backgroundColor: colors.tint }]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderUser}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={40} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.placeholder }]}>No users found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
  },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  subtitle: { fontSize: fontSize.sm, marginTop: 2 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.lg, marginBottom: spacing.md, borderRadius: radius.md,
    borderWidth: 1, paddingHorizontal: spacing.md, height: 44,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, fontSize: fontSize.base, padding: 0 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  card: {
    borderRadius: radius.lg, borderWidth: 1,
    padding: spacing.lg, gap: spacing.md,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: fontSize.base, fontWeight: fontWeight.bold },
  cardInfo: { flex: 1 },
  cardName: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  cardEmail: { fontSize: fontSize.sm, marginTop: 1 },
  roleBadge: {
    paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.pill,
  },
  roleText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: fontSize.sm },
  empty: { alignItems: 'center', paddingTop: spacing.xxxl, gap: spacing.md },
  emptyText: { fontSize: fontSize.base },
  retryBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.md },
  retryText: { color: '#fff', fontWeight: fontWeight.semibold },
});
