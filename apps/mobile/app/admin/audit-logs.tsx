import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RowSkeleton } from '@/src/components/Skeleton';
import { getAdminAuditLogs, type AdminAuditLog } from '@/src/services/api';

const EVENT_FILTERS = [
  { key: null, label: 'All' },
  { key: 'otp_requested', label: 'OTP Sent' },
  { key: 'otp_verified', label: 'OTP Verified' },
  { key: 'otp_failed', label: 'OTP Failed' },
  { key: 'login_success', label: 'Login' },
  { key: 'logout', label: 'Logout' },
  { key: 'account_created', label: 'Created' },
  { key: 'account_updated', label: 'Updated' },
  { key: 'account_deactivated', label: 'Deactivated' },
  { key: 'sessions_revoked', label: 'Revoked' },
  { key: 'token_refreshed', label: 'Refreshed' },
];

function getEventConfig(event: string, colors: ReturnType<typeof useColors>) {
  const map: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
    otp_requested: { icon: 'mail-outline', color: colors.info, bg: '#F0F9FF' },
    otp_verified: { icon: 'checkmark-circle-outline', color: colors.tint, bg: colors.tintLight },
    otp_failed: { icon: 'alert-circle-outline', color: colors.destructive, bg: colors.destructiveLight },
    login_success: { icon: 'log-in-outline', color: colors.tint, bg: colors.tintLight },
    logout: { icon: 'log-out-outline', color: colors.warning, bg: colors.accentLight },
    account_created: { icon: 'person-add-outline', color: colors.tint, bg: colors.tintLight },
    account_updated: { icon: 'pencil-outline', color: colors.warning, bg: colors.accentLight },
    account_deactivated: { icon: 'person-remove-outline', color: colors.destructive, bg: colors.destructiveLight },
    sessions_revoked: { icon: 'shield-outline', color: '#7C3AED', bg: '#F5F3FF' },
    token_refreshed: { icon: 'refresh-outline', color: colors.info, bg: '#F0F9FF' },
  };
  return map[event] ?? { icon: 'document-text-outline' as const, color: colors.textTertiary, bg: colors.border + '30' };
}

function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function AuditLogScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [filter, setFilter] = useState<string | null>(null);
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminAuditLogs({
        event: filter ?? undefined,
        limit: 50,
      });
      setLogs(data.data);
    } catch {
      setError('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const renderEntry = ({ item }: { item: AdminAuditLog }) => {
    const cfg = getEventConfig(item.event, colors);
    return (
      <View style={[styles.entry, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={16} color={cfg.color} />
        </View>
        <View style={styles.entryContent}>
          <View style={styles.entryTop}>
            <Text style={[styles.entryUser, { color: colors.text }]}>{item.email ?? 'System'}</Text>
            <Text style={[styles.entryTime, { color: colors.placeholder }]}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={[styles.entryTarget, { color: colors.textSecondary }]}>{item.event}</Text>
          {item.ip && (
            <Text style={[styles.entryDetail, { color: colors.textTertiary }]}>IP: {item.ip}</Text>
          )}
          <View style={styles.entryTags}>
            <View style={[styles.tag, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.tagText, { color: cfg.color }]}>{item.event}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Audit Log</Text>
        <Text style={[styles.subtitle, { color: colors.textTertiary }]}>{loading ? 'Loading...' : `${logs.length} events`}</Text>
      </View>

      <FlatList
        horizontal
        data={EVENT_FILTERS}
        keyExtractor={(item) => item.key || 'all'}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setFilter(item.key)}
            style={[
              styles.filterChip,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
              filter === item.key && { backgroundColor: colors.tint, borderColor: colors.tint },
            ]}
          >
            <Text style={[
              styles.filterText,
              { color: colors.textSecondary },
              filter === item.key && { color: '#fff' },
            ]}>
              {item.label}
            </Text>
          </Pressable>
        )}
        contentContainerStyle={styles.filters}
        showsHorizontalScrollIndicator={false}
      />

      {loading && (
        <View style={styles.list}>
          {Array.from({ length: 5 }).map((_, i) => (
            <RowSkeleton key={i} colors={colors} />
          ))}
        </View>
      )}

      {error && !loading && (
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.destructive} />
          <Text style={[styles.emptyText, { color: colors.destructive }]}>{error}</Text>
          <Pressable onPress={loadLogs} style={[styles.retryBtn, { backgroundColor: colors.tint }]}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={logs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderEntry}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={40} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.placeholder }]}>No events match filter</Text>
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
    paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md,
  },
  title: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold },
  subtitle: { fontSize: fontSize.sm, marginTop: 2 },
  filters: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md, paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  filterText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  entry: {
    flexDirection: 'row', borderRadius: radius.lg,
    borderWidth: 1, padding: spacing.lg, gap: spacing.md,
  },
  iconWrap: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  entryContent: { flex: 1, gap: 4 },
  entryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  entryUser: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  entryTime: { fontSize: fontSize.xs },
  entryTarget: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  entryDetail: { fontSize: fontSize.sm, lineHeight: 18 },
  entryTags: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm,
  },
  tagText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  empty: { alignItems: 'center', paddingTop: spacing.xxxl, gap: spacing.md },
  emptyText: { fontSize: fontSize.base },
  retryBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.md },
  retryText: { color: '#fff', fontWeight: fontWeight.semibold },
});
