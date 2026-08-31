import { useState, useEffect, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight, shadows } from '@/constants/Tokens';
import { impactMedium } from '@/src/services/haptics';
import { useI18n } from '@/src/i18n';
import { logger } from '@/src/utils/logger';
import { getSessions, revokeSession, revokeAllSessions, type Session } from '@/src/services/api';

export default function SessionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const t = useI18n().t as unknown as (key: string) => string;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const res = await getSessions();
      if (res.success) setSessions(res.data);
    } catch (err) {
      logger.warn('[Sessions] Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleRevoke = (id: string) => {
    Alert.alert('Revoke Session', 'Revoke this session?', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('confirm'), onPress: async () => {
        const res = await revokeSession(id);
        if (res.success) { impactMedium(); await loadData(); }
      }},
    ]);
  };

  const handleRevokeAll = () => {
    Alert.alert('Revoke All', 'Revoke all other sessions?', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('confirm'), style: 'destructive', onPress: async () => {
        const res = await revokeAllSessions();
        if (res.success) { impactMedium(); await loadData(); }
      }},
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('sessions')}</Text>
        <Pressable onPress={handleRevokeAll} style={[styles.revokeAllBtn, { backgroundColor: colors.destructive }]}>
          <Ionicons name="trash-outline" size={14} color="#fff" />
          <Text style={styles.revokeAllText}>{t('revokeAll')}</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: spacing.xxl }} />
      ) : sessions.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="checkmark-circle-outline" size={48} color={colors.success} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('noSessions')}</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }, shadows.sm(colors.shadowColor, colors.shadowOpacity)]}>
              <View style={styles.cardContent}>
                <Ionicons name="phone-portrait-outline" size={20} color={colors.textSecondary} />
                <View style={styles.cardInfo}>
                  <Text style={[styles.device, { color: colors.text }]}>{item.deviceInfo || 'Unknown Device'}</Text>
                  <Text style={[styles.ip, { color: colors.textSecondary }]}>{item.ipAddress}</Text>
                  <Text style={[styles.time, { color: colors.textSecondary }]}>Last active: {new Date(item.lastActive).toLocaleDateString()}</Text>
                </View>
                <Pressable onPress={() => handleRevoke(item.id)} style={styles.revokeBtn}>
                  <Ionicons name="close-circle-outline" size={20} color={colors.destructive} />
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.md },
  title: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  revokeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  revokeAllText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  list: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxxl },
  card: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardInfo: { flex: 1, gap: 2 },
  device: { fontSize: fontSize.base, fontWeight: fontWeight.semibold },
  ip: { fontSize: fontSize.xs },
  time: { fontSize: fontSize.xs },
  revokeBtn: { padding: spacing.xs },
  emptyWrap: { alignItems: 'center', marginTop: spacing.xxl, gap: spacing.md },
  emptyText: { fontSize: fontSize.base },
});
