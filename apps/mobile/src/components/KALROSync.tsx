import { useCallback } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { impactMedium } from '@/src/services/haptics';
import { useToast } from '@/src/components/Toast';

export function KALROSyncButton() {
  const colors = useColors();
  const { showToast } = useToast();

  const handleSync = useCallback(() => {
    impactMedium();
    showToast('info', 'KALRO sync coming soon');
  }, [showToast]);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.row}>
        <Ionicons name="cloud-upload-outline" size={20} color={colors.tint} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>KALRO Sync</Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>Coming soon</Text>
        </View>
        <Pressable
          onPress={handleSync}
          style={({ pressed }) => [
            styles.syncBtn,
            { backgroundColor: colors.tint, opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityLabel="Sync with KALRO"
        >
          <Ionicons name="refresh-outline" size={16} color="#fff" />
          <Text style={styles.syncBtnText}>Sync Now</Text>
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
