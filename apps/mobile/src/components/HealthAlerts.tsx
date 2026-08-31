import { useState, useMemo, useCallback } from 'react';
import { StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, useColors } from '@/components/Themed';
import { spacing, radius, fontSize, fontWeight } from '@/constants/Tokens';
import { impactLight, impactMedium, notificationSuccess } from '@/src/services/haptics';
import type { Livestock } from '@wam-mfugo/shared';
import { useI18n } from '@/src/i18n';

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  count: number;
}

interface HealthAlertsProps {
  animals: Livestock[];
  onDismiss?: (id: string) => void;
  onRestore?: (id: string) => void;
  onReport?: (id: string) => void;
}

export function HealthAlerts({ animals, onDismiss, onRestore, onReport }: HealthAlertsProps) {
  const colors = useColors();
  const { t } = useI18n();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const alerts = useMemo(() => {
    const sick = animals.filter((a) => a.health === 'Sick');
    const treatment = animals.filter((a) => a.health === 'Under Treatment');
    const recovered = animals.filter((a) => a.health === 'Recovered');

    const countySick = new Map<string, number>();
    sick.forEach((a) => countySick.set(a.county, (countySick.get(a.county) || 0) + 1));
    const outbreaks = Array.from(countySick.entries()).filter(([, count]) => count >= 3);

    const result: AlertItem[] = [];

    if (sick.length > 0) {
      result.push({
        id: 'sick', type: 'critical', title: t('sickAnimals'),
        message: `${sick.length} animal${sick.length > 1 ? 's' : ''} need attention`,
        count: sick.length,
      });
    }

    if (outbreaks.length > 0) {
      result.push({
        id: 'outbreak', type: 'critical', title: t('diseaseOutbreak'),
        message: outbreaks.map(([county, count]) => `${county} (${count})`).join(', '),
        count: outbreaks.reduce((sum, [, c]) => sum + c, 0),
      });
    }

    if (treatment.length > 0) {
      result.push({
        id: 'treatment', type: 'warning', title: t('underTreatment'),
        message: `${treatment.length} animal${treatment.length > 1 ? 's' : ''} recovering`,
        count: treatment.length,
      });
    }

    if (recovered.length > 0) {
      result.push({
        id: 'recovered', type: 'info', title: 'Recovered',
        message: `${recovered.length} animal${recovered.length > 1 ? 's' : ''} recovered`,
        count: recovered.length,
      });
    }

    return result;
  }, [animals]);

  const handleDismiss = useCallback((id: string) => {
    impactLight();
    setDismissedIds((prev) => new Set(prev).add(id));
    onDismiss?.(id);
  }, [onDismiss]);

  const handleRestore = useCallback((id: string) => {
    impactLight();
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    onRestore?.(id);
  }, [onRestore]);

  const handleReport = useCallback((alert: AlertItem) => {
    impactMedium();
    Alert.alert(
      t('reportToKalro'),
      `Send "${alert.title}" report (${alert.count} animals) to Kenya Agricultural and Livestock Research Organization?`,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('sendReport'),
          onPress: () => {
            notificationSuccess();
            onReport?.(alert.id);
          },
        },
      ]
    );
  }, [onReport]);

  const visibleAlerts = alerts.filter((a) => !dismissedIds.has(a.id));
  const dismissedCount = alerts.filter((a) => dismissedIds.has(a.id)).length;

  if (visibleAlerts.length === 0 && dismissedCount === 0) return null;

  const iconMap = {
    critical: 'alert-circle' as const,
    warning: 'warning' as const,
    info: 'information-circle' as const,
  };

  const colorMap = {
    critical: colors.destructive,
    warning: colors.warning,
    info: colors.info,
  };

  const bgMap = {
    critical: colors.destructive + '15',
    warning: colors.warning + '15',
    info: colors.info + '15',
  };

  return (
    <View style={styles.container}>
      {visibleAlerts.map((alert) => (
        <View
          key={alert.id}
          style={[styles.alert, { backgroundColor: bgMap[alert.type], borderColor: colorMap[alert.type] + '30' }]}
        >
          <Ionicons name={iconMap[alert.type]} size={18} color={colorMap[alert.type]} />
          <View style={styles.alertContent}>
            <Text style={[styles.alertTitle, { color: colorMap[alert.type] }]}>{alert.title}</Text>
            <Text style={[styles.alertMessage, { color: colors.text }]}>{alert.message}</Text>
          </View>
          <View style={styles.alertActions}>
            {alert.type === 'critical' && (
              <Pressable
                onPress={() => handleReport(alert)}
                style={({ pressed }) => [styles.reportBtn, { backgroundColor: colorMap[alert.type] + '15', opacity: pressed ? 0.6 : 1 }]}
                hitSlop={8}
                accessibilityLabel="Report to KALRO"
              >
                <Ionicons name="send-outline" size={13} color={colorMap[alert.type]} />
              </Pressable>
            )}
            <Pressable
              onPress={() => handleDismiss(alert.id)}
              style={({ pressed }) => [styles.dismissBtn, { opacity: pressed ? 0.6 : 1 }]}
              hitSlop={14}
              accessibilityLabel="Dismiss alert"
            >
              <Ionicons name="close" size={14} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      ))}

      {dismissedCount > 0 && (
        <Pressable
          onPress={() => {
            impactMedium();
            alerts.filter((a) => dismissedIds.has(a.id)).forEach((a) => handleRestore(a.id));
          }}
          style={({ pressed }) => [styles.restoreBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
          accessibilityLabel="Restore dismissed alerts"
        >
          <Ionicons name="refresh-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.restoreText, { color: colors.textSecondary }]}>
            {t('restoreCount', { count: dismissedCount })}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  alertContent: { flex: 1, gap: 2 },
  alertTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  alertMessage: { fontSize: fontSize.xs },
  alertActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reportBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  dismissBtn: { padding: spacing.xs },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  restoreText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
});
