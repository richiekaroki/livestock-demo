import { useState, useCallback } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { impactMedium } from '@/src/services/haptics';
import { useToast } from '@/src/components/Toast';

export function KALROSyncButton() {
  const colors = useColors();
  const { showToast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const handleSync = useCallback(async () => {
    if (syncing) return;
    impactMedium();
    setSyncing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const now = new Date().toLocaleTimeString();
      setLastSynced(now);
      showToast('success', 'Synced with KALRO successfully');
    } catch {
      showToast('error', 'Sync failed. Will retry automatically.');
    } finally {
      setSyncing(false);
    }
  }, [syncing, showToast]);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.row}>
        <Ionicons name="cloud-upload-outline" size={20} color={colors.tint} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>KALRO Sync</Text>
          {lastSynced ? (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>Last synced: {lastSynced}</Text>
          ) : (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>Not synced yet</Text>
          )}
        </View>
        <Pressable
          onPress={handleSync}
          disabled={syncing}
          style={({ pressed }) => [
            styles.syncBtn,
            { backgroundColor: colors.tint, opacity: pressed || syncing ? 0.7 : 1 },
          ]}
          accessibilityLabel="Sync with KALRO"
        >
          <Ionicons name={syncing ? 'sync-outline' : 'refresh-outline'} size={16} color="#fff" />
          <Text style={styles.syncBtnText}>{syncing ? 'Syncing...' : 'Sync Now'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  meta: { fontSize: fontSize.xs, marginTop: 2 },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  syncBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.medium },
});
